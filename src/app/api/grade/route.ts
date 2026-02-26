import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { gradeResponse } from '@/lib/gemini';
import { checkBudget, recordUsage } from '@/lib/usage-limit';

export async function POST(req: NextRequest) {
  if (!adminDb) {
    console.error("Firebase Admin not initialized");
    return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
  }

  try {
    const { submissionId } = await req.json();

    if (!submissionId) {
      return NextResponse.json({ error: 'Missing submissionId' }, { status: 400 });
    }

    // 1. Fetch Submission
    const submissionRef = adminDb.collection('submissions').doc(submissionId);
    const submissionSnap = await submissionRef.get();

    if (!submissionSnap.exists) {
      return NextResponse.json({ error: 'Submission not found' }, { status: 404 });
    }

    const submissionData = submissionSnap.data();
    const assignmentId = submissionData?.assignmentId;
    const studentId = submissionData?.studentId;

    if (!assignmentId || !studentId) {
      return NextResponse.json({ error: 'Invalid submission data' }, { status: 400 });
    }

    // --- Budget Check ---
    const studentDoc = await adminDb.collection("users").doc(studentId).get();
    const studentData = studentDoc.exists ? studentDoc.data() : null;
    let organizationId = studentData?.organizationId;

    // Fallback: If student doesn't have an organization, inherit from teacher
    if (!organizationId && studentData?.role === "student" && studentData?.teacherId) {
        const teacherDoc = await adminDb.collection("users").doc(studentData.teacherId).get();
        if (teacherDoc.exists) {
            organizationId = teacherDoc.data()?.organizationId;
        }
    }

    if (!organizationId) {
        return NextResponse.json({ error: "No organization found for grading budget." }, { status: 403 });
    }

    const budgetCheck = await checkBudget(organizationId, "grading");
    if (!budgetCheck.allowed) {
        return NextResponse.json({ error: budgetCheck.error }, { status: 403 });
    }

    // 2. Fetch Assignment
    const assignmentSnap = await adminDb.collection('assignments').doc(assignmentId).get();
    
    if (!assignmentSnap.exists) {
      return NextResponse.json({ error: 'Assignment not found' }, { status: 404 });
    }

    const assignmentData = assignmentSnap.data();
    const questions = assignmentData?.questions || [];
    const answers = submissionData?.answers || []; 
    const globalRubric = assignmentData?.rubric || "";

    // 3. Grade
    let totalScore = 0;
    let maxScore = 0;
    
    // Calculate accurate maxScore from ALL questions in assignment
    for (const q of questions) {
      maxScore += (q.points || 10);
    }

    const gradedAnswers = [];
    let totalPromptTokens = 0;
    let totalCandidateTokens = 0;

    for (const ans of answers) {
      const question = questions.find((q: any) => q.id === ans.questionId);
      if (!question) {
        gradedAnswers.push(ans);
        continue;
      }

      const points = question.points || 10;
      // We already added points to maxScore above for all questions
      
      let score = 0;
      let feedback = "";
      let reasoning = "";

      // Improved Grading Logic: 
      // 1. Multiple Choice / True-False: Strict match
      // 2. Text / Short Answer: AI Grading for nuance
      if ((question.type === "text" || question.type === "short-answer") && ans.answer) {
        // AI Grading
        try {
            // Combine question-specific rubric (correctAnswer) with global rubric
            const combinedRubric = [question.correctAnswer, globalRubric].filter(Boolean).join("\n\nGlobal Assignment Rubric:\n");
            const result = await gradeResponse(question.text, ans.answer, combinedRubric);
            feedback = result.feedback;
            reasoning = result.reasoning || "";
            
            // Track usage
            if (result.usage) {
                totalPromptTokens += result.usage.inputTokens;
                totalCandidateTokens += result.usage.outputTokens;
            }
            
            // Calculate score based on points
            // result.score is out of 10
            const rawScore = result.score; // 0-10
            score = (rawScore / 10) * points;
            
        } catch (e) {
            console.error("AI Grading failed", e);
            feedback = "Error grading response.";
            score = 0;
        }
      } else if (question.correctAnswer && (question.type === "multiple-choice" || question.type === "true-false")) {
        // Strict match for objective questions
        const isCorrect = ans.answer.trim().toLowerCase() === question.correctAnswer.trim().toLowerCase();
        score = isCorrect ? points : 0;
        feedback = isCorrect ? "Correct!" : `Incorrect. The correct answer was: ${question.correctAnswer}`;
      } else if (question.correctAnswer) {
        // Fallback exact match for other types just in case
        const isCorrect = ans.answer.trim().toLowerCase() === question.correctAnswer.trim().toLowerCase();
        score = isCorrect ? points : 0;
        feedback = isCorrect ? "Correct!" : `Incorrect. Expected: ${question.correctAnswer}`;
      }

      totalScore += score;
      gradedAnswers.push({
        ...ans,
        feedback,
        reasoning,
        score,
        maxPoints: points
      });
    }

    // Record cumulative usage
    if (totalPromptTokens > 0 || totalCandidateTokens > 0) {
        await recordUsage(organizationId, "grading", totalPromptTokens, totalCandidateTokens);
    }

    const finalScore = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0;

    // 4. Update Submission
    await submissionRef.update({
      score: finalScore,
      totalPoints: maxScore,
      earnedPoints: totalScore,
      answers: gradedAnswers,
      graded: true,
      gradedAt: new Date()
    });

    return NextResponse.json({ success: true, score: finalScore });

  } catch (error: any) {
    console.error("Error in grading API:", error);
    return NextResponse.json({ error: error?.message || 'Internal Server Error' }, { status: 500 });
  }
}
