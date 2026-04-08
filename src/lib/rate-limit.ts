import { NextRequest } from 'next/server';
import { adminDb } from './firebase-admin';

export interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
}

/**
 * Checks if a request exceeds the configured rate limit.
 * Uses Firestore to track counts within a sliding window.
 */
export async function checkRateLimit(
  req: NextRequest,
  userId: string | undefined | null,
  endpointType: string,
  config: RateLimitConfig
): Promise<{ allowed: boolean; error?: string }> {
  if (!adminDb) return { allowed: false, error: "Database not initialized" };

  // Use user ID if available, otherwise fallback to IP
  const ip = req.headers.get("x-forwarded-for") || "unknown-ip";
  const identifier = userId || ip;
  
  if (!identifier) {
    return { allowed: false, error: "Unable to identify requestor" };
  }

  const { windowMs, maxRequests } = config;
  
  // Create a unique id for the user + endpoint. Replace invalid characters for Firestore Document ID
  const docId = `${endpointType}_${identifier.replace(/\//g, '_')}`;
  
  try {
    const rateLimitRef = adminDb.collection('rate_limits').doc(docId);
    
    // We can use a transaction to safely read and increment
    return await adminDb.runTransaction(async (transaction) => {
      const doc = await transaction.get(rateLimitRef);
      const now = Date.now();
      
      let usage = { count: 0, windowStart: now };
      if (doc.exists) {
        const data = doc.data();
        if (data) {
          usage = { count: data.count, windowStart: data.windowStart };
        }
      }

      // Reset window if it has passed
      if (now - usage.windowStart > windowMs) {
        usage.count = 0;
        usage.windowStart = now;
      }

      if (usage.count >= maxRequests) {
        const minutes = Math.round(windowMs / 1000 / 60);
        return { 
          allowed: false, 
          error: `Rate limit exceeded. Max ${maxRequests} requests per ${minutes > 0 ? minutes + ' minutes' : windowMs + ' ms'}.` 
        };
      }

      // Increment usage count
      usage.count++;
      transaction.set(rateLimitRef, usage, { merge: true });
      
      return { allowed: true };
    });
  } catch (err) {
    console.error(`Error in checkRateLimit for ${identifier}:`, err);
    // Fail closed on error
    return { allowed: false, error: "Rate limit check failed" };
  }
}
