import { NextRequest, NextResponse } from 'next/server';
import { adminDb, adminFieldWithValue } from '@/lib/firebase-admin';
import { checkBudget, recordUsage } from '@/lib/usage-limit';
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const model = genAI.getGenerativeModel({ 
  model: "gemini-2.0-flash", // Using 2.0-flash for consistent performance
  generationConfig: {
    temperature: 0.7,
    maxOutputTokens: 1024,
  }
});

export async function POST(req: NextRequest) {
  if (!adminDb) {
    return NextResponse.json({ error: 'Database not initialized' }, { status: 500 });
  }

  try {
    const { messages, notebookContent, studentId } = await req.json();

    if (!messages || !studentId) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    // 1. Resolve Organization for budget
    const studentDoc = await adminDb.collection("users").doc(studentId).get();
    if (!studentDoc.exists) {
        return NextResponse.json({ error: "Student profile not found" }, { status: 404 });
    }
    const studentData = studentDoc.data();
    let organizationId = studentData?.organizationId;

    if (!organizationId && studentData?.teacherId) {
        const teacherDoc = await adminDb.collection("users").doc(studentData.teacherId).get();
        if (teacherDoc.exists) {
            organizationId = teacherDoc.data()?.organizationId;
        }
    }

    if (!organizationId) {
        return NextResponse.json({ error: "No organization found. Please join a Scorpio Network." }, { status: 403 });
    }

    // 2. Check Notebook Budget
    const orgRef = adminDb.collection("organizations").doc(organizationId);
    const orgSnap = await orgRef.get();
    const orgData = orgSnap.data();

    const notebookLimit = orgData?.notebookLimit || 0;
    const notebookUsage = orgData?.notebookUsageCurrent || 0;

    if (notebookUsage >= notebookLimit) {
        return NextResponse.json({ error: "The monthly notebook AI limit for your network has been reached." }, { status: 403 });
    }

    const budgetCheck = await checkBudget(organizationId, "notebook");
    if (!budgetCheck.allowed) {
        return NextResponse.json({ error: budgetCheck.error }, { status: 403 });
    }

    // 3. Prepare System Prompt with Notebook Context
    const systemPrompt = `You are an AI Study Copilot for a student's digital notebook. 
Your goal is to help them organize their thoughts, explain complex concepts, and provide research assistance.
Keep your answers concise and academically useful.

CONTEXT (The student's current notebook content):
---
${notebookContent || "Notebook is empty."}
---

Guide the student based on their notes or answer their questions directly.`;

    const chat = model.startChat({
      history: [
        { role: "user", parts: [{ text: systemPrompt }] },
        { role: "model", parts: [{ text: "Understood. I'm ready to help you with your notebook." }] },
        ...messages.map((m: any) => ({
          role: m.role === 'user' ? 'user' : 'model',
          parts: [{ text: m.content }]
        })).slice(0, -1) // All but the last message which goes into sendMessage
      ]
    });

    const lastMessage = messages[messages.length - 1].content;
    const result = await chat.sendMessage(lastMessage);
    const response = await result.response;
    const responseText = response.text();

    // 4. Record Usage and Increment Notebook Count
    if (response.usageMetadata) {
        await recordUsage(
          organizationId, 
          "notebook", 
          response.usageMetadata.promptTokenCount, 
          response.usageMetadata.candidatesTokenCount
        );
    }

    await orgRef.update({
        notebookUsageCurrent: adminFieldWithValue.increment(1)
    });

    return NextResponse.json({ content: responseText });

  } catch (error: any) {
    console.error('Notebook Copilot API Error:', error);
    return NextResponse.json({ 
      error: error?.message || 'Digital resonance failure. Copilot is offline.' 
    }, { status: 500 });
  }
}
