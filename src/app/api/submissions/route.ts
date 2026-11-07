import type { AssignmentQuestion } from "@/lib/assignment-security";
import { NextResponse } from 'next/server';
import { authenticateRequest, withAuthorizedRequest } from '@/lib/auth-verify';
import { adminDb } from '@/lib/firebase-admin';

export const POST = withAuthorizedRequest(async req => {
  const caller = (await authenticateRequest(req))!;
  const { submissionId, ...body } = await req.json();
  if (typeof body.assignmentId !== 'string' || body.assignmentId.includes('/') || !['draft','submitted'].includes(body.status)) return NextResponse.json({ error: 'Invalid submission' }, { status: 400 });
  if (submissionId !== undefined && (typeof submissionId !== 'string' || submissionId.includes('/'))) return NextResponse.json({ error: 'Invalid submission ID' }, { status: 400 });
  const profile = (await adminDb.collection('users').doc(caller.uid).get()).data()!;
  if (profile.role !== 'student') return NextResponse.json({ error: 'Student account required' }, { status: 403 });
  try {
    // Stable ID prevents duplicate submissions and duplicate grading on repeated clicks.
    const ref = submissionId ? adminDb.collection('submissions').doc(submissionId) : adminDb.collection('submissions').doc(`${caller.uid}_${body.assignmentId}`);
    await adminDb.runTransaction(async tx => {
      const assignment = (await tx.get(adminDb.collection('assignments').doc(body.assignmentId))).data();
      const existing = (await tx.get(ref)).data();
      if (!assignment || !assignment.answerKeySeparated) throw new Error('Assignment unavailable');
      const enrolled = assignment.visibility === 'global' ||
        (assignment.visibility === 'network' && profile.organizationId && assignment.organizationId === profile.organizationId) ||
        (assignment.courseId ? assignment.courseId === profile.courseId : assignment.teacherId === profile.teacherId);
      if (!enrolled) throw new Error('You are not enrolled in this assignment');
      if (existing && (existing.studentId !== caller.uid || existing.assignmentId !== body.assignmentId)) throw new Error('Access denied');
      if (existing && existing.status !== 'draft') {
        if (body.status === 'submitted') return; // Idempotent submit; never overwrite a grade.
        throw new Error('This submission is already final');
      }
      if (!Array.isArray(body.answers) || body.answers.length > 100) throw new Error('Invalid answers');
      const answers = (assignment.questions || []).map((q: AssignmentQuestion) => {
        const answer = body.answers.find((a: { questionId: string; answer?: string }) => a.questionId === q.id)?.answer || '';
        if (typeof answer !== 'string' || answer.length > 50000) throw new Error('Answer is too long');
        return { questionId: q.id, questionText: q.text, answer };
      });
      const now = new Date();
      const due = assignment.dueDate?.toDate?.();
      const files = Array.isArray(body.workFiles) ? body.workFiles : [];
      if (files.length > 20) throw new Error('Too many attachments');
      for (const file of files) {
        const url = new URL(file.url);
        const object = decodeURIComponent(url.pathname.split('/o/')[1] || '');
        const bucket = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;
        if (url.protocol !== 'https:' || url.hostname !== 'firebasestorage.googleapis.com' || !bucket || !url.pathname.startsWith(`/v0/b/${bucket}/o/`) || !object.startsWith(`submissions/${caller.uid}/`)) throw new Error('Invalid attachment');
      }
      tx.set(ref, { assignmentId: body.assignmentId, studentId: caller.uid, studentName: profile.displayName || '', studentEmail: caller.email || '',
        teacherId: assignment.teacherId, courseId: assignment.courseId || null, answers, status: body.status,
        updatedAt: now, ...(body.status === 'submitted' ? { submittedAt: now } : {}), isLate: !!due && now > due,
        graded: false, totalPoints: (assignment.questions || []).reduce((n: number, q: AssignmentQuestion) => n + (q.points ?? 10), 0),
        earnedPoints: null, workFiles: files, unfocusCount: Number.isFinite(body.unfocusCount) ? Math.max(0, body.unfocusCount) : 0 });
    });
    return NextResponse.json({ id: ref.id });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Submission failed' }, { status: 400 });
  }
});
