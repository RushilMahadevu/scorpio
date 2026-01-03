import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { gradeResponse } from '@/lib/gemini';

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

    if (!assignmentId) {
      return NextResponse.json({ error: 'Invalid submission data' }, { status: 400 });
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
    const gradedAnswers = [];

    for (const ans of answers) {
      const question = questions.find((q: any) => q.id === ans.questionId);
      if (!question) {
        gradedAnswers.push(ans);
        continue;
      }

      const points = question.points || 10;
      maxScore += points;

      let score = 0;
      let feedback = "";

      if (question.type === "text" && ans.answer) {
        // AI Grading
        try {
            // Combine question-specific rubric (correctAnswer) with global rubric
            const combinedRubric = [question.correctAnswer, globalRubric].filter(Boolean).join("\n\nGlobal Assignment Rubric:\n");
            const gradingResult = await gradeResponse(question.text, ans.answer, combinedRubric);
            feedback = gradingResult.feedback;
            
            // Calculate score based on points
            // gradingResult.score is out of 10
            const rawScore = gradingResult.score; // 0-10
            score = (rawScore / 10) * points;
            
        } catch (e) {
            console.error("AI Grading failed", e);
            feedback = "Error grading response.";
            score = 0;
        }
      } else if (question.correctAnswer) {
        // Exact match
        const isCorrect = ans.answer.trim().toLowerCase() === question.correctAnswer.trim().toLowerCase();
        score = isCorrect ? points : 0;
        feedback = isCorrect ? "Correct!" : `Incorrect. The correct answer was: ${question.correctAnswer}`;
      }

      totalScore += score;
      gradedAnswers.push({
        ...ans,
        feedback,
        score,
        maxPoints: points
      });
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

  } catch (error) {
    console.error("Error in grading API:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
