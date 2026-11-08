import { NextRequest } from 'next/server';
import * as admin from 'firebase-admin';
import {
  initializeTestEnvironment,
  assertSucceeds,
  assertFails,
  type RulesTestEnvironment,
} from '@firebase/rules-unit-testing';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  collection,
  query,
  where,
  getDocs,
} from 'firebase/firestore';
import { ref, uploadBytes, getBytes } from 'firebase/storage';
import * as fs from 'node:fs';

jest.mock('../../src/lib/firebase-admin', () => {
  const admin = require('firebase-admin');
  if (!process.env.FIRESTORE_EMULATOR_HOST) throw new Error('Emulator required');
  if (!admin.apps.length) admin.initializeApp({ projectId: 'demo-scorpio-security' });
  return {
    adminDb: admin.firestore(),
    adminFieldWithValue: admin.firestore.FieldValue,
    adminAuth: {
      verifyIdToken: async (token: string) => ({
        uid: token,
        email: `${token}@example.test`,
        auth_time: Math.floor(Date.now() / 1000),
      }),
      deleteUser: jest.fn(async () => undefined),
    },
  };
});

import { POST as teacherCode } from '../../src/app/api/auth/teacher-code/route';
import { POST as register } from '../../src/app/api/auth/register/route';
import { POST as createCourse } from '../../src/app/api/courses/route';
import { POST as enroll } from '../../src/app/api/student/enrollment/route';
import { POST as createAssignment, GET as getTeacherAssignment } from '../../src/app/api/assignments/route';
import { POST as submitAssignment } from '../../src/app/api/submissions/route';
import { POST as gradeSubmission } from '../../src/app/api/grade/route';
import { POST as tutorChat } from '../../src/app/api/student/tutor/route';
import { POST as notebookChat } from '../../src/app/api/notebook/chat/route';
import { POST as generatePortfolio } from '../../src/app/api/teacher/network/portfolio/route';
import { POST as networkMembership } from '../../src/app/api/teacher/network/membership/route';
import { POST as cleanupStudent } from '../../src/app/api/teacher/students/cleanup/route';
import { GET as exportAccount, DELETE as deleteAccount } from '../../src/app/api/account/route';
import { adminDb } from '../../src/lib/firebase-admin';

const apiReq = (
  path: string,
  user: string | null,
  body?: unknown,
  method = 'POST',
  extraHeaders: Record<string, string> = {}
) =>
  new NextRequest(`http://localhost/api/${path}`, {
    method,
    headers: {
      ...(user ? { Authorization: `Bearer ${user}` } : {}),
      'Content-Type': 'application/json',
      ...extraHeaders,
    },
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });

describe('Full End-to-End Student-Teacher Workflow', () => {
  let env: RulesTestEnvironment;
  let originalFetch: typeof global.fetch;

  const TEACHER_UID = 'e2e-teacher-1';
  const COLLEAGUE_UID = 'e2e-teacher-2';
  const OUTSIDER_TEACHER_UID = 'e2e-teacher-outsider';
  const STUDENT_1_UID = 'e2e-student-1';
  const STUDENT_2_UID = 'e2e-student-2';

  let inviteCode: string;
  let colleagueInviteCode: string;
  let organizationId: string;
  let courseId: string;
  const CLASS_CODE = 'AP-PHYS-2026';
  let assignmentId: string;
  let submission1Id: string;
  let submission2Id: string;

  beforeAll(async () => {
    process.env.ADMIN_SECRET = 'test-admin-secret';
    process.env.GEMINI_API_KEY = 'test-gemini-key';
    process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET = 'demo-scorpio-security.appspot.com';

    originalFetch = global.fetch;
    global.fetch = jest.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = typeof input === 'string' ? input : input.toString();
      if (url.includes('generativelanguage.googleapis.com')) {
        const bodyText = init?.body ? String(init.body) : '';
        let responsePayload: unknown = { text: 'Default AI response' };

        if (bodyText.includes('technical_reasoning') && bodyText.includes('student_feedback')) {
          // AI Grading prompt
          responsePayload = {
            score: 9.0,
            technical_reasoning: 'Student correctly applied F = ma and included Newtons (N), minor rounding note.',
            student_feedback: 'Great work applying Newton’s Second Law ($F = ma = 5 \\times 3 = 15\\text{ N}$)!',
            misconceptions: [],
          };
        } else if (bodyText.includes('masteryLevel') && bodyText.includes('aiSummary')) {
          // Student Portfolio synthesis prompt
          responsePayload = {
            strengths: ['Newtonian Mechanics', 'Free-body diagrams', 'Unit consistency'],
            weaknesses: ['Non-inertial reference frames'],
            masteryLevel: 'Advanced',
            aiSummary: 'The student demonstrates strong command of Newton’s laws and kinematic derivations.',
          };
        } else {
          // Socratic Tutor or Notebook Copilot prompt
          responsePayload =
            'Consider the net force acting on the mass: according to Newton’s Second Law, how do mass $m$ and acceleration $\\vec{a}$ relate to $\\vec{F}_{\\text{net}}$?';
        }

        const textStr =
          typeof responsePayload === 'string' ? responsePayload : JSON.stringify(responsePayload);

        return new Response(
          JSON.stringify({
            candidates: [{ content: { parts: [{ text: textStr }] }, finishReason: 'STOP' }],
            usageMetadata: {
              promptTokenCount: 120,
              candidatesTokenCount: 80,
              totalTokenCount: 200,
            },
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        );
      }
      return originalFetch(input, init);
    }) as typeof fetch;

    env = await initializeTestEnvironment({
      projectId: 'demo-scorpio-security',
      firestore: {
        host: '127.0.0.1',
        port: 8188,
        rules: fs.readFileSync('firestore.rules', 'utf8'),
      },
      storage: {
        host: '127.0.0.1',
        port: 9298,
        rules: fs.readFileSync('storage.rules', 'utf8'),
      },
    });
  }, 30000);

  afterAll(async () => {
    global.fetch = originalFetch;
    await env?.cleanup();
    await Promise.all(admin.apps.filter(Boolean).map((app) => app!.delete()));
  });

  const clientDb = (uid: string) => env.authenticatedContext(uid).firestore();
  const clientStorage = (uid: string) => env.authenticatedContext(uid).storage();

  test('1. Teacher invite code generation, validation, and teacher registration', async () => {
    // Admin generates a teacher invite code
    const genRes = await teacherCode(
      apiReq('auth/teacher-code', null, { action: 'generate', label: 'E2E Physics Teacher' }, 'POST', {
        'x-admin-secret': 'test-admin-secret',
      })
    );
    expect(genRes.status).toBe(200);
    const genData = await genRes.json();
    expect(genData.code).toMatch(/^SCORP-[A-F0-9]{4}-[A-F0-9]{4}$/);
    inviteCode = genData.code;

    // Validate invite code before signup (public endpoint)
    const valRes = await teacherCode(
      apiReq('auth/teacher-code', null, { action: 'validate', code: inviteCode })
    );
    expect(valRes.status).toBe(200);
    expect(await valRes.json()).toEqual({ valid: true, organizationId: null });

    // Register teacher using the invite code
    const regRes = await register(
      apiReq('auth/register', TEACHER_UID, {
        role: 'teacher',
        name: 'Dr. Richard Feynman',
        code: inviteCode,
      })
    );
    expect(regRes.status).toBe(200);

    // Verify teacher profile and organization creation in Firestore
    const teacherProfileSnap = await getDoc(doc(clientDb(TEACHER_UID), 'users', TEACHER_UID));
    expect(teacherProfileSnap.exists()).toBe(true);
    const teacherProfile = teacherProfileSnap.data()!;
    expect(teacherProfile.role).toBe('teacher');
    expect(teacherProfile.displayName).toBe('Dr. Richard Feynman');
    expect(teacherProfile.organizationId).toBeTruthy();
    organizationId = teacherProfile.organizationId;

    // Verify organization document is readable by teacher and has active free starter budget
    const orgSnap = await assertSucceeds(
      getDoc(doc(clientDb(TEACHER_UID), 'organizations', organizationId))
    );
    expect(orgSnap.exists()).toBe(true);
    expect(orgSnap.data()!.ownerId).toBe(TEACHER_UID);
    expect(orgSnap.data()!.subscriptionStatus).toBe('active');
    expect(orgSnap.data()!.aiBudgetLimit).toBe(50);

    // Reusing the same invite code is rejected
    const reuseRes = await teacherCode(
      apiReq('auth/teacher-code', null, { action: 'validate', code: inviteCode })
    );
    expect((await reuseRes.json()).valid).toBe(false);
  });

  test('2. Teacher creates a class, customizes Equation Vault, and uploads class resources', async () => {
    // Teacher creates a class via /api/courses
    const courseRes = await createCourse(
      apiReq('courses', TEACHER_UID, {
        name: 'AP Physics C: Mechanics',
        code: CLASS_CODE,
      })
    );
    expect(courseRes.status).toBe(200);
    const courseData = await courseRes.json();
    expect(courseData.id).toBeTruthy();
    courseId = courseData.id;

    // Duplicate class code is rejected
    const dupRes = await createCourse(
      apiReq('courses', TEACHER_UID, {
        name: 'Duplicate Physics Class',
        code: CLASS_CODE,
      })
    );
    expect(dupRes.status).toBe(400);

    // Teacher configures Equation Vault for the class (restricts k3, adds custom formula)
    await assertSucceeds(
      updateDoc(doc(clientDb(TEACHER_UID), 'courses', courseId), {
        restrictedFormulaIds: ['k3'],
        customFormulas: [
          {
            id: 'custom-hooke',
            name: 'Hooke’s Law',
            latex: 'F_s = -kx',
            formula: 'Fs = -kx',
            description: 'Restoring force of an ideal spring',
            category: 'custom',
            isCustom: true,
          },
        ],
      })
    );

    // Teacher uploads a study resource for the class
    await assertSucceeds(
      setDoc(doc(clientDb(TEACHER_UID), 'resources', 'res-kinematics-guide'), {
        title: 'AP Physics Kinematics & Dynamics Reference Sheet',
        url: 'https://scorpioedu.org/resources/kinematics.pdf',
        type: 'document',
        teacherId: TEACHER_UID,
        courseId,
        createdAt: new Date(),
      })
    );

    // Teacher imports a roster placeholder student (as done by RosterImport CSV component)
    await assertSucceeds(
      setDoc(doc(clientDb(TEACHER_UID), 'users', 'roster-placeholder-1'), {
        email: 'invited.student@example.test',
        displayName: 'Invited Roster Student',
        teacherId: TEACHER_UID,
        role: 'student',
        createdAt: new Date(),
        status: 'pending_invite',
        importedBy: TEACHER_UID,
      })
    );
  });

  test('3. Students join the class (at registration and via dashboard enrollment)', async () => {
    // Student 1 signs up directly with the class code
    const s1Reg = await register(
      apiReq('auth/register', STUDENT_1_UID, {
        role: 'student',
        name: 'Alice Curie',
        code: CLASS_CODE,
      })
    );
    expect(s1Reg.status).toBe(200);

    // Verify Student 1's enrollment fields
    const s1Snap = await assertSucceeds(getDoc(doc(clientDb(STUDENT_1_UID), 'users', STUDENT_1_UID)));
    const s1Data = s1Snap.data()!;
    expect(s1Data.role).toBe('student');
    expect(s1Data.courseId).toBe(courseId);
    expect(s1Data.teacherId).toBe(TEACHER_UID);
    expect(s1Data.organizationId).toBe(organizationId);

    // Student 2 signs up without a class code, then joins via /api/student/enrollment
    const s2Reg = await register(
      apiReq('auth/register', STUDENT_2_UID, {
        role: 'student',
        name: 'Bob Maxwell',
      })
    );
    expect(s2Reg.status).toBe(200);
    expect((await getDoc(doc(clientDb(STUDENT_2_UID), 'users', STUDENT_2_UID))).data()!.courseId).toBeNull();

    // Student 2 enters class code on student dashboard
    const enrollRes = await enroll(
      apiReq('student/enrollment', STUDENT_2_UID, { code: CLASS_CODE })
    );
    expect(enrollRes.status).toBe(200);

    const s2Snap = await assertSucceeds(getDoc(doc(clientDb(STUDENT_2_UID), 'users', STUDENT_2_UID)));
    expect(s2Snap.data()!.courseId).toBe(courseId);
    expect(s2Snap.data()!.teacherId).toBe(TEACHER_UID);
    expect(s2Snap.data()!.organizationId).toBe(organizationId);

    // Teacher sees enrolled students in the class roster query
    const rosterSnap = await assertSucceeds(
      getDocs(
        query(
          collection(clientDb(TEACHER_UID), 'users'),
          where('courseId', '==', courseId),
          where('role', '==', 'student')
        )
      )
    );
    const enrolledIds = rosterSnap.docs.map((d) => d.id);
    expect(enrolledIds).toEqual(expect.arrayContaining([STUDENT_1_UID, STUDENT_2_UID]));

    // Students can read the course document (including custom vault formulas) and teacher's resources
    const studentCourseView = await assertSucceeds(
      getDoc(doc(clientDb(STUDENT_1_UID), 'courses', courseId))
    );
    expect(studentCourseView.data()!.name).toBe('AP Physics C: Mechanics');
    expect(studentCourseView.data()!.restrictedFormulaIds).toEqual(['k3']);
    expect(studentCourseView.data()!.customFormulas).toHaveLength(1);

    const studentResourcesSnap = await assertSucceeds(
      getDocs(
        query(collection(clientDb(STUDENT_1_UID), 'resources'), where('teacherId', '==', TEACHER_UID))
      )
    );
    expect(studentResourcesSnap.docs.map((d) => d.id)).toContain('res-kinematics-guide');
  });

  test('4. Teacher assigns an assignment to the class with separated answer key', async () => {
    const futureDueDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
    const createRes = await createAssignment(
      apiReq('assignments', TEACHER_UID, {
        title: 'Unit 2: Newton’s Laws Problem Set',
        description: 'Complete all questions showing full units and vector directions.',
        topic: 'dynamics',
        courseId,
        visibility: 'network',
        dueDate: futureDueDate,
        timeLimit: 45,
        gradingType: 'manual',
        requireWorkSubmission: true,
        allowAIHelp: true,
        allowCalculator: true,
        enableTabDetection: true,
        lockdownMode: false,
        totalPoints: 100,
        rubric: 'Award partial credit for correct symbolic derivations even if arithmetic has minor errors.',
        questions: [
          {
            id: 'q1-mcq',
            text: 'Which of Newton’s laws states that an object at rest remains at rest unless acted upon by a net external force?',
            type: 'multiple-choice',
            options: ['First Law', 'Second Law', 'Third Law', 'Law of Universal Gravitation'],
            correctAnswer: 'First Law',
            points: 30,
          },
          {
            id: 'q2-tf',
            text: 'True or False: In an inertial reference frame, net force is always in the same direction as velocity.',
            type: 'true-false',
            options: ['True', 'False'],
            correctAnswer: 'False',
            points: 20,
          },
          {
            id: 'q3-free',
            text: 'A $5\\text{ kg}$ block is accelerated across a frictionless horizontal surface at $3\\text{ m/s}^2$. Calculate the magnitude of the net horizontal force and explain your steps.',
            type: 'text',
            correctAnswer: 'Using F = ma, F = (5 kg)(3 m/s^2) = 15 N.',
            points: 50,
          },
        ],
      })
    );
    expect(createRes.status).toBe(200);
    const created = await createRes.json();
    expect(created.id).toBeTruthy();
    assignmentId = created.id;

    // Teacher can fetch full assignment with merged answer key and rubric via GET /api/assignments
    const teacherViewRes = await getTeacherAssignment(
      new NextRequest(`http://localhost/api/assignments?id=${assignmentId}`, {
        headers: { Authorization: `Bearer ${TEACHER_UID}` },
      })
    );
    expect(teacherViewRes.status).toBe(200);
    const teacherAssignmentData = await teacherViewRes.json();
    expect(teacherAssignmentData.rubric).toContain('Award partial credit');
    expect(teacherAssignmentData.questions[0].correctAnswer).toBe('First Law');
    expect(teacherAssignmentData.questions[1].correctAnswer).toBe('False');
    expect(teacherAssignmentData.questions[2].correctAnswer).toContain('15 N');
  });

  test('5. Student receives sanitized assignment, uses study tools (Raise Tutor & Notebook), saves draft, uploads work, and submits', async () => {
    // Student queries assignments for their course (matching StudentAssignmentsPage query)
    const studentAssignmentsSnap = await assertSucceeds(
      getDocs(
        query(
          collection(clientDb(STUDENT_1_UID), 'assignments'),
          where('answerKeySeparated', '==', true),
          where('courseId', '==', courseId)
        )
      )
    );
    expect(studentAssignmentsSnap.size).toBe(1);
    const studentAssignment = studentAssignmentsSnap.docs[0].data();
    expect(studentAssignment.title).toBe('Unit 2: Newton’s Laws Problem Set');

    // Verify answer keys and rubric are stripped from the document students read
    for (const q of studentAssignment.questions) {
      expect(q).not.toHaveProperty('correctAnswer');
    }
    expect(studentAssignment.rubric).toBeNull();

    // Verify student is blocked from reading assignment_keys directly or via teacher API
    await assertFails(getDoc(doc(clientDb(STUDENT_1_UID), 'assignment_keys', assignmentId)));
    const studentKeyAttempt = await getTeacherAssignment(
      new NextRequest(`http://localhost/api/assignments?id=${assignmentId}`, {
        headers: { Authorization: `Bearer ${STUDENT_1_UID}` },
      })
    );
    expect(studentKeyAttempt.status).toBe(403);

    // Student asks Raise AI Tutor for a conceptual hint while working on Question 3
    const tutorRes = await tutorChat(
      apiReq('student/tutor', STUDENT_1_UID, {
        message: 'I am working on Question 3. How do I relate mass and acceleration to force?',
        userId: STUDENT_1_UID,
        role: 'student',
        mode: 'tutor',
        chatHistory: [],
        assignmentContext: 'Question 3: A 5 kg block is accelerated at 3 m/s^2...',
      })
    );
    expect(tutorRes.status).toBe(200);
    const tutorData = await tutorRes.json();
    expect(tutorData.response).toContain('Newton’s Second Law');

    // Student saves a tutor session log and a research notebook in Firestore
    await assertSucceeds(
      setDoc(doc(clientDb(STUDENT_1_UID), 'tutor_sessions', 'session-1'), {
        studentId: STUDENT_1_UID,
        updatedAt: new Date(),
        messages: [
          { role: 'user', content: 'How do I relate mass and acceleration to force?' },
          { role: 'assistant', content: tutorData.response },
        ],
      })
    );

    await assertSucceeds(
      setDoc(doc(clientDb(STUDENT_1_UID), 'notebooks', 'nb-1'), {
        studentId: STUDENT_1_UID,
        title: 'Unit 2 Dynamics Notes',
        content: '# Newton’s Second Law\n$\\vec{F}_{\\text{net}} = m\\vec{a}$',
        createdAt: new Date(),
        updatedAt: new Date(),
      })
    );

    const nbChatRes = await notebookChat(
      apiReq('notebook/chat', STUDENT_1_UID, {
        studentId: STUDENT_1_UID,
        notebookContent: '# Newton’s Second Law\nF = ma',
        messages: [{ role: 'user', content: 'Summarize my notes on force.' }],
      })
    );
    expect(nbChatRes.status).toBe(200);

    // Student 1 saves a draft submission first
    const draftRes = await submitAssignment(
      apiReq('submissions', STUDENT_1_UID, {
        assignmentId,
        status: 'draft',
        answers: [
          { questionId: 'q1-mcq', answer: 'First Law' },
          { questionId: 'q2-tf', answer: '' },
          { questionId: 'q3-free', answer: 'Working on derivation...' },
        ],
      })
    );
    expect(draftRes.status).toBe(200);
    const draftJson = await draftRes.json();
    submission1Id = draftJson.id;
    expect(submission1Id).toBe(`${STUDENT_1_UID}_${assignmentId}`);

    // Verify draft status in Firestore
    const draftSnap = await assertSucceeds(
      getDoc(doc(clientDb(STUDENT_1_UID), 'submissions', submission1Id))
    );
    expect(draftSnap.data()!.status).toBe('draft');
    expect(draftSnap.data()!.graded).toBe(false);

    // Student 1 uploads handwritten work attachment to Firebase Storage
    const workPath = `submissions/${STUDENT_1_UID}/1700000000_free_body_diagram.pdf`;
    await assertSucceeds(
      uploadBytes(
        ref(clientStorage(STUDENT_1_UID), workPath),
        new TextEncoder().encode('%PDF-1.4 Free body diagram derivation F = 5 kg * 3 m/s^2 = 15 N'),
        { contentType: 'application/pdf' }
      )
    );
    const validStorageUrl = `https://firebasestorage.googleapis.com/v0/b/demo-scorpio-security.appspot.com/o/${encodeURIComponent(workPath)}?alt=media`;

    // Student 1 finalizes and submits the assignment (attempting to inject fake score is ignored)
    const finalSubmitRes = await submitAssignment(
      apiReq('submissions', STUDENT_1_UID, {
        submissionId: submission1Id,
        assignmentId,
        status: 'submitted',
        score: 100,
        earnedPoints: 100,
        graded: true,
        unfocusCount: 1,
        workFiles: [
          {
            name: 'free_body_diagram.pdf',
            type: 'application/pdf',
            size: 64,
            url: validStorageUrl,
          },
        ],
        answers: [
          { questionId: 'q1-mcq', answer: 'First Law', score: 30 },
          { questionId: 'q2-tf', answer: 'False', score: 20 },
          {
            questionId: 'q3-free',
            answer: 'By Newton’s Second Law, F = m * a = 5 kg * 3 m/s^2 = 15 N.',
            score: 50,
          },
        ],
      })
    );
    expect(finalSubmitRes.status).toBe(200);

    // Student 2 also submits the assignment (with some incorrect answers to test partial scoring)
    const s2SubmitRes = await submitAssignment(
      apiReq('submissions', STUDENT_2_UID, {
        assignmentId,
        status: 'submitted',
        unfocusCount: 0,
        answers: [
          { questionId: 'q1-mcq', answer: 'Second Law' }, // Incorrect (0/30)
          { questionId: 'q2-tf', answer: 'False' }, // Correct (20/20)
          {
            questionId: 'q3-free',
            answer: 'F = ma = 5 * 3 = 15 N', // AI graded (9/10 * 50 = 45/50)
          },
        ],
      })
    );
    expect(s2SubmitRes.status).toBe(200);
    submission2Id = (await s2SubmitRes.json()).id;
  });

  test('6. Teacher receives submissions, inspects student work files, runs AI grading, and saves manual grade overrides', async () => {
    // Teacher queries all submissions for the assignment (matching AssignmentDetailsPage / TeacherDashboard)
    const teacherSubsSnap = await assertSucceeds(
      getDocs(
        query(collection(clientDb(TEACHER_UID), 'submissions'), where('assignmentId', '==', assignmentId))
      )
    );
    expect(teacherSubsSnap.size).toBe(2);

    const sub1BeforeGrade = teacherSubsSnap.docs.find((d) => d.id === submission1Id)!.data();
    expect(sub1BeforeGrade.status).toBe('submitted');
    expect(sub1BeforeGrade.graded).toBe(false);
    expect(sub1BeforeGrade.earnedPoints).toBeNull();
    expect(sub1BeforeGrade.totalPoints).toBe(100);
    expect(sub1BeforeGrade.isLate).toBe(false);
    expect(sub1BeforeGrade.unfocusCount).toBe(1);
    expect(sub1BeforeGrade.studentName).toBe('Alice Curie');

    // Teacher can read Student 1's uploaded work file from Firebase Storage
    const workPath = `submissions/${STUDENT_1_UID}/1700000000_free_body_diagram.pdf`;
    const downloadedBytes = await assertSucceeds(
      getBytes(ref(clientStorage(TEACHER_UID), workPath))
    );
    expect(new TextDecoder().decode(downloadedBytes)).toContain('15 N');

    // Teacher triggers AI-assisted grading via POST /api/grade for Student 1
    const grade1Res = await gradeSubmission(
      apiReq('grade', TEACHER_UID, { submissionId: submission1Id })
    );
    expect(grade1Res.status).toBe(200);
    const grade1Data = await grade1Res.json();
    // Q1: 30/30 (exact match), Q2: 20/20 (exact match), Q3: (9.0/10)*50 = 45/50 -> Total = 95/100 (95%)
    expect(grade1Data).toEqual({ success: true, score: 95 });

    // Teacher triggers AI-assisted grading via POST /api/grade for Student 2
    const grade2Res = await gradeSubmission(
      apiReq('grade', TEACHER_UID, { submissionId: submission2Id })
    );
    expect(grade2Res.status).toBe(200);
    const grade2Data = await grade2Res.json();
    // Q1: 0/30, Q2: 20/20, Q3: 45/50 -> Total = 65/100 (65%)
    expect(grade2Data).toEqual({ success: true, score: 65 });

    // Verify AI grading populated per-question scores, feedback, and reasoning in Firestore
    const sub1AfterAi = (
      await assertSucceeds(getDoc(doc(clientDb(TEACHER_UID), 'submissions', submission1Id)))
    ).data()!;
    expect(sub1AfterAi.graded).toBe(true);
    expect(sub1AfterAi.status).toBe('graded');
    expect(sub1AfterAi.score).toBe(95);
    expect(sub1AfterAi.earnedPoints).toBe(95);
    expect(sub1AfterAi.totalPoints).toBe(100);
    expect(sub1AfterAi.answers[0].score).toBe(30);
    expect(sub1AfterAi.answers[1].score).toBe(20);
    expect(sub1AfterAi.answers[2].score).toBe(45);
    expect(sub1AfterAi.answers[2].feedback).toContain('Newton’s Second Law');
    expect(sub1AfterAi.answers[2].reasoning).toContain('F = ma');

    // Teacher reviews Student 1's submission in GradeSubmissionPage and manually adjusts Q3 to full 50/50 points with custom feedback
    const updatedAnswers = sub1AfterAi.answers.map((ans: any) =>
      ans.questionId === 'q3-free'
        ? {
            ...ans,
            score: 50,
            feedback: `${ans.feedback}\n\nInstructor Note: Full credit awarded after reviewing attached free-body diagram PDF!`,
          }
        : ans
    );
    await assertSucceeds(
      updateDoc(doc(clientDb(TEACHER_UID), 'submissions', submission1Id), {
        answers: updatedAnswers,
        score: 100,
        earnedPoints: 100,
        totalPoints: 100,
        totalEarnedPoints: 100,
        totalPossiblePoints: 100,
        graded: true,
        gradedAt: new Date(),
      })
    );
  });

  test('7. Students see their final grades, scores, and question-by-question feedback, and cannot tamper with graded submissions', async () => {
    // Student 1 queries their submissions (matching StudentGradesPage & SubmissionsPage)
    const s1SubsSnap = await assertSucceeds(
      getDocs(
        query(collection(clientDb(STUDENT_1_UID), 'submissions'), where('studentId', '==', STUDENT_1_UID))
      )
    );
    expect(s1SubsSnap.size).toBe(1);
    const s1GradedSub = s1SubsSnap.docs[0].data();
    expect(s1GradedSub.graded).toBe(true);
    expect(s1GradedSub.status).toBe('graded');
    expect(s1GradedSub.score).toBe(100);
    expect(s1GradedSub.earnedPoints).toBe(100);
    expect(s1GradedSub.totalPoints).toBe(100);
    expect(s1GradedSub.answers[2].score).toBe(50);
    expect(s1GradedSub.answers[2].feedback).toContain('Instructor Note: Full credit awarded');

    // Student 2 checks their grade (65%)
    const s2SubsSnap = await assertSucceeds(
      getDocs(
        query(collection(clientDb(STUDENT_2_UID), 'submissions'), where('studentId', '==', STUDENT_2_UID))
      )
    );
    expect(s2SubsSnap.size).toBe(1);
    const s2GradedSub = s2SubsSnap.docs[0].data();
    expect(s2GradedSub.graded).toBe(true);
    expect(s2GradedSub.score).toBe(65);
    expect(s2GradedSub.earnedPoints).toBe(65);

    // Student 1 cannot read Student 2's submission
    await assertFails(getDoc(doc(clientDb(STUDENT_1_UID), 'submissions', submission2Id)));

    // Student 2 cannot overwrite their grade directly in Firestore or via /api/submissions
    await assertFails(
      updateDoc(doc(clientDb(STUDENT_2_UID), 'submissions', submission2Id), { score: 100 })
    );
    const resubmitAttempt = await submitAssignment(
      apiReq('submissions', STUDENT_2_UID, {
        submissionId: submission2Id,
        assignmentId,
        status: 'submitted',
        answers: [
          { questionId: 'q1-mcq', answer: 'First Law' },
          { questionId: 'q2-tf', answer: 'False' },
          { questionId: 'q3-free', answer: '15 N' },
        ],
      })
    );
    // Idempotent return, preserves existing grade of 65
    expect(resubmitAttempt.status).toBe(200);
    const s2VerifySnap = await getDoc(doc(clientDb(STUDENT_2_UID), 'submissions', submission2Id));
    expect(s2VerifySnap.data()!.score).toBe(65);
  });

  test('8. Department Network collaboration: colleague teacher joins, shares Waypoints, and compiles AI student portfolio', async () => {
    // Generate an invite code linked to the teacher's organization
    const colGenRes = await teacherCode(
      apiReq(
        'auth/teacher-code',
        null,
        { action: 'generate', label: 'Colleague Invite', organizationId },
        'POST',
        { 'x-admin-secret': 'test-admin-secret' }
      )
    );
    colleagueInviteCode = (await colGenRes.json()).code;

    // Colleague registers with the network-linked invite code
    const colRegRes = await register(
      apiReq('auth/register', COLLEAGUE_UID, {
        role: 'teacher',
        name: 'Dr. Emmy Noether',
        code: colleagueInviteCode,
      })
    );
    expect(colRegRes.status).toBe(200);

    // Colleague is in the same organization
    const colProfile = (await getDoc(doc(clientDb(COLLEAGUE_UID), 'users', COLLEAGUE_UID))).data()!;
    expect(colProfile.organizationId).toBe(organizationId);

    // Colleague can browse and fork the network-shared assignment (Waypoint)
    const networkWaypointsSnap = await assertSucceeds(
      getDocs(
        query(
          collection(clientDb(COLLEAGUE_UID), 'assignments'),
          where('visibility', '==', 'network'),
          where('organizationId', '==', organizationId)
        )
      )
    );
    expect(networkWaypointsSnap.docs.map((d) => d.id)).toContain(assignmentId);

    // Colleague can load the full template via GET /api/assignments for forking
    const forkFetchRes = await getTeacherAssignment(
      new NextRequest(`http://localhost/api/assignments?id=${assignmentId}`, {
        headers: { Authorization: `Bearer ${COLLEAGUE_UID}` },
      })
    );
    expect(forkFetchRes.status).toBe(200);
    expect((await forkFetchRes.json()).questions[0].correctAnswer).toBe('First Law');

    // Teacher compiles an AI Learning Portfolio for Student 1 based on Raise tutor sessions
    const portfolioRes = await generatePortfolio(
      apiReq('teacher/network/portfolio', TEACHER_UID, {
        teacherId: TEACHER_UID,
        studentId: STUDENT_1_UID,
        organizationId,
      })
    );
    expect(portfolioRes.status).toBe(200);
    const portfolioData = (await portfolioRes.json()).portfolio;
    expect(portfolioData.masteryLevel).toBe('Advanced');
    expect(portfolioData.strengths).toContain('Newtonian Mechanics');

    // Both the primary teacher, the department colleague, and Student 1 can read the portfolio
    await assertSucceeds(getDoc(doc(clientDb(TEACHER_UID), 'portfolios', STUDENT_1_UID)));
    await assertSucceeds(getDoc(doc(clientDb(COLLEAGUE_UID), 'portfolios', STUDENT_1_UID)));
    await assertSucceeds(getDoc(doc(clientDb(STUDENT_1_UID), 'portfolios', STUDENT_1_UID)));

    // An outsider teacher from another school cannot access any of these records
    const outInviteRes = await teacherCode(
      apiReq('auth/teacher-code', null, { action: 'generate', label: 'Outsider' }, 'POST', {
        'x-admin-secret': 'test-admin-secret',
      })
    );
    const outCode = (await outInviteRes.json()).code;
    await register(
      apiReq('auth/register', OUTSIDER_TEACHER_UID, {
        role: 'teacher',
        name: 'Outsider Teacher',
        code: outCode,
      })
    );
    await assertFails(getDoc(doc(clientDb(OUTSIDER_TEACHER_UID), 'submissions', submission1Id)));
    await assertFails(getDoc(doc(clientDb(OUTSIDER_TEACHER_UID), 'portfolios', STUDENT_1_UID)));
  });

  test('9. Lifecycle cleanup: teacher removes a student from roster, and student exports & deletes account', async () => {
    // Teacher removes Student 2 and cleans up their submissions
    const cleanupRes = await cleanupStudent(
      apiReq('teacher/students/cleanup', TEACHER_UID, {
        studentId: STUDENT_2_UID,
        unlink: true,
      })
    );
    expect(cleanupRes.status).toBe(200);

    // Student 2's submission is deleted and Student 2 is unlinked from the course
    expect((await adminDb.collection('submissions').doc(submission2Id).get()).exists).toBe(false);
    const s2AfterCleanup = (await adminDb.collection('users').doc(STUDENT_2_UID).get()).data()!;
    expect(s2AfterCleanup.courseId).toBeNull();
    expect(s2AfterCleanup.teacherId).toBeNull();

    // Student 1 exports all their learning data and then deletes their account
    const exportRes = await exportAccount(apiReq('account', STUDENT_1_UID, undefined, 'GET'));
    expect(exportRes.status).toBe(200);
    const exportedCollections = await exportRes.json();
    expect(exportedCollections.map((c: any) => c.collection)).toEqual(
      expect.arrayContaining(['submissions', 'notebooks', 'tutor_sessions', 'portfolios', 'users'])
    );

    const deleteRes = await deleteAccount(apiReq('account', STUDENT_1_UID, undefined, 'DELETE'));
    expect(deleteRes.status).toBe(200);
    expect((await adminDb.collection('users').doc(STUDENT_1_UID).get()).exists).toBe(false);
    expect((await adminDb.collection('submissions').doc(submission1Id).get()).exists).toBe(false);
  });
});
