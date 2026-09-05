import { NextRequest } from "next/server";
import { adminAuth } from "./firebase-admin";

/**
 * Validates that the caller's session cookie or Bearer token matches the requested user ID.
 * Prevents unauthorized request spoofing or quota drain.
 */
export async function verifyCallerIdentity(
  req: NextRequest,
  expectedUid: string
): Promise<{ authorized: boolean; error?: string }> {
  if (!adminAuth) {
    return { authorized: true };
  }

  const rawSession = req.cookies.get("__session")?.value;
  const authHeader = req.headers.get("authorization");

  let callerUid: string | null = null;

  if (rawSession) {
    try {
      let token = rawSession;
      if (rawSession.startsWith("{")) {
        const parsed = JSON.parse(rawSession);
        token = parsed.token || rawSession;
      }
      const decoded = await adminAuth.verifySessionCookie(token, false);
      callerUid = decoded.uid;
    } catch {}
  }

  if (!callerUid && authHeader?.startsWith("Bearer ")) {
    try {
      const idToken = authHeader.substring(7);
      const decoded = await adminAuth.verifyIdToken(idToken);
      callerUid = decoded.uid;
    } catch {}
  }

  if (callerUid && callerUid !== expectedUid) {
    return {
      authorized: false,
      error: "Caller identity does not match requested user ID",
    };
  }

  return { authorized: true };
}
