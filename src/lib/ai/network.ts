import { model } from "./config";

/**
 * Network Limits Assistant — answers teacher questions about their org's AI limits,
 * budgets, and capacities using real-time org data as context.
 */
export interface NetworkLimitsContext {
  orgName: string;
  planId: string;
  aiBudgetLimit: number;       // in cents
  aiUsageCurrent: number;      // in cents
  practiceLimit: number;       // total pool
  practiceUsageCurrent: number;
  practiceLimitPerStudent: number;
  notebookLimitPerStudent: number;
  aiNotebookLimitPerStudent: number;
  aiTutorLimitPerStudent: number;
  studentCount: number;
}

export async function getNetworkLimitsHelp(
  message: string,
  chatHistory: { role: "user" | "assistant"; content: string }[],
  ctx: NetworkLimitsContext
): Promise<{ text: string; usage?: { inputTokens: number; outputTokens: number } }> {
  try {
    const budgetUsedPercent = ctx.aiBudgetLimit > 0
      ? ((ctx.aiUsageCurrent / ctx.aiBudgetLimit) * 100).toFixed(1)
      : "0";
    const practiceUsedPercent = ctx.practiceLimit > 0
      ? ((ctx.practiceUsageCurrent / ctx.practiceLimit) * 100).toFixed(1)
      : "0";

    const systemPrompt = `You are **Crux**, an expert assistant for physics teachers managing their Scorpio Network.
Your job is to answer questions about limits, budgets, and capacities — clearly, concisely, and in plain English.

=== CURRENT NETWORK SNAPSHOT ===
Network: ${ctx.orgName}
Plan: ${ctx.planId === "free" ? "Free (upgrade required for most features)" : ctx.planId}

💰 AI BUDGET (Safety Cap)
  • Monthly cap: $${(ctx.aiBudgetLimit / 100).toFixed(4)}
  • Used this period: $${(ctx.aiUsageCurrent / 100).toFixed(4)} (${budgetUsedPercent}%)
  • Remaining headroom: $${Math.max(0, (ctx.aiBudgetLimit - ctx.aiUsageCurrent) / 100).toFixed(4)}
  • Effect: When current bill hits the cap, ALL AI features pause for the billing period.

🏹 PRACTICE CAPACITY (Physics Scenario Generator)
  • Per-student allowance: ${ctx.practiceLimitPerStudent} scenarios/month
  • Total network pool: ${ctx.practiceLimit} scenarios (${ctx.studentCount} students × allowance)
  • Used this period: ${ctx.practiceUsageCurrent} (${practiceUsedPercent}%)
  • Effect: Students cannot generate new practice scenarios once the pool is exhausted.

📒 NOTEBOOK CAPACITY (Research Workspace)
  • Max notebooks per student: ${ctx.notebookLimitPerStudent}
  • AI chat messages per student/month: ${ctx.aiNotebookLimitPerStudent}
  • Effect: Students are blocked from creating more notebooks or sending AI messages once their individual limits are hit.

🤖 AI TUTOR CAPACITY (Physics Tutor Chat)
  • AI tutor messages per student/month: ${ctx.aiTutorLimitPerStudent}
  • Effect: Students cannot send new tutor messages once this individual monthly limit is reached.

👥 ENROLLMENT
  • Active students: ${ctx.studentCount}
================================

RESPONSE GUIDELINES:
- Be concise and friendly. Use bullet points when listing options.
- Recommend realistic values based on class size when asked (e.g., "For ${ctx.studentCount} students I'd suggest…").
- If the teacher asks how to change a setting, explain it's in the "Capacities & Limits" section above.
- Do NOT mention internal field names like "aiNotebookLimitPerStudent". Use plain labels instead.
- If the plan is free, gently mention that most limits require a Standard subscription.
- Always end with a short actionable tip if relevant.`;

    const chatHistoryContext = chatHistory.length > 0 
      ? `Previous conversation history:\n${chatHistory.map(m => `${m.role === "user" ? "Teacher" : "Crux"}: ${m.content}`).join("\n")}\n\n`
      : "";

    const fullPrompt = `${systemPrompt}\n\n${chatHistoryContext}Teacher Question: ${message}`;

    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: fullPrompt }] }],
      generationConfig: {
        maxOutputTokens: 1024,
        temperature: 0.1,
      }
    });
    const response = await result.response;

    return {
      text: response.text(),
      usage: {
        inputTokens: response.usageMetadata?.promptTokenCount || 0,
        outputTokens: response.usageMetadata?.candidatesTokenCount || 0
      }
    };
  } catch (error) {
    console.error("Network limits assistant error:", error);
    throw error;
  }
}

/**
 * Generates a structured student portfolio based on the student's recent AI Tutor chat history.
 */
export async function generateStudentPortfolio(
  studentName: string,
  chatHistory: { role: "user" | "assistant"; content: string }[]
): Promise<{ 
  portfolio: { 
    strengths: string[]; 
    weaknesses: string[]; 
    masteryLevel: "Beginner" | "Intermediate" | "Advanced" | "Expert"; 
    aiSummary: string;
  };
  usage?: { inputTokens: number; outputTokens: number } 
}> {
  try {
    const systemPrompt = `You are an expert Physics Education Professor. 
Your task is to analyze a student's recent interactions with an AI tutor and generate a structured portfolio summary.

Student Name: ${studentName}

Guidelines:
1. Analyze the student's questions, problem-solving approach, and conceptual understanding.
2. Identify 2-4 key "strengths" (e.g., "Understands kinematics equations", "Good at identifying known variables").
3. Identify 2-4 key "weaknesses" or areas for improvement (e.g., "Struggles with vector components", "Forgets units").
4. Determine their overall "masteryLevel" from: "Beginner", "Intermediate", "Advanced", "Expert".
5. Write a concise, professional 2-3 paragraph "aiSummary" addressing the teacher. Describe the student's learning trajectory, common misconceptions, and specific concepts they are working on.

IMPORTANT: Return ONLY a valid JSON object matching this structure:
{
  "strengths": ["string", "string"],
  "weaknesses": ["string", "string"],
  "masteryLevel": "Intermediate",
  "aiSummary": "narrative paragraph..."
}`;

    const chatContext = chatHistory.length > 0 
      ? `=== RECENT TUTOR SESSIONS ===\n${chatHistory.map(m => `${m.role === "user" ? "Student" : "Tutor"}: ${m.content}`).join("\n\n")}`
      : "No completely recent sessions available or student hasn't asked enough questions. Please infer based on lack of data (e.g., student hasn't engaged much).";

    const prompt = `${systemPrompt}\n\n${chatContext}`;

    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        maxOutputTokens: 8192,
        temperature: 0.2, // Low temperature for consistent JSON
        responseMimeType: "application/json",
      },
      safetySettings: [
        {
          category: "HARM_CATEGORY_HARASSMENT",
          threshold: "BLOCK_NONE",
        },
        {
          category: "HARM_CATEGORY_HATE_SPEECH",
          threshold: "BLOCK_NONE",
        },
        {
          category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
          threshold: "BLOCK_NONE",
        },
        {
          category: "HARM_CATEGORY_DANGEROUS_CONTENT",
          threshold: "BLOCK_NONE",
        },
      ],
    });

    const response = await result.response;
    let text = response.text().trim();
    
    // Isolation logic for robustness (strip markdown blocks if AI ignored responseMimeType format)
    const startIdx = text.indexOf('{');
    const endIdx = text.lastIndexOf('}');
    
    if (startIdx !== -1 && endIdx !== -1) {
      text = text.substring(startIdx, endIdx + 1);
    }
    
    // Parse JSON
    let parsed: any;
    try {
      parsed = JSON.parse(text);
    } catch (e) {
      // Robust backup: sanitize common AI JSON formatting errors
      const sanitized = text
        .replace(/\\n/g, '__NL__')
        .replace(/\\(?!["\\\/bfnrtu])/g, '\\\\') // Double escape backslashes
        .replace(/__NL__/g, '\\n')
        .replace(/,\s*([\}\]])/g, '$1') // Remove trailing commas
        .replace(/[\n\r]/g, ' ') // Flatten newlines
        .trim();

      try {
        parsed = JSON.parse(sanitized);
      } catch (e2) {
        console.error("Failed to parse portfolio JSON:", text);
        throw new Error(`AI returned invalid JSON: ${text}`);
      }
    }

    // Validate fields
    const validLevels = ["Beginner", "Intermediate", "Advanced", "Expert"];
    const masteryLevel = validLevels.includes(parsed.masteryLevel) ? parsed.masteryLevel : "Beginner";

    return {
      portfolio: {
        strengths: Array.isArray(parsed.strengths) ? parsed.strengths.slice(0, 5) : ["Engaging with the tutor"],
        weaknesses: Array.isArray(parsed.weaknesses) ? parsed.weaknesses.slice(0, 5) : ["Needs more practice"],
        masteryLevel: masteryLevel as any,
        aiSummary: parsed.aiSummary || "The student has primarily been using the tutor casually. More intensive sessions are needed for a deeper analysis.",
      },
      usage: {
        inputTokens: response.usageMetadata?.promptTokenCount || 0,
        outputTokens: response.usageMetadata?.candidatesTokenCount || 0
      }
    };
  } catch (error) {
    console.error("Error generating student portfolio:", error);
    throw error;
  }
}
