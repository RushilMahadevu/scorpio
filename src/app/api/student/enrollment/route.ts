import { NextResponse } from "next/server";
import { authenticateRequest, withAuthorizedRequest } from "@/lib/auth-verify";
import { findClassByCode } from "@/lib/class-enrollment";
import { adminDb } from "@/lib/firebase-admin";

export const POST = withAuthorizedRequest(async req => {
  const caller = (await authenticateRequest(req))!;
  const { code, action } = await req.json();
  const userRef = adminDb.collection("users").doc(caller.uid);
  const studentRef = adminDb.collection("students").doc(caller.uid);

  const result = await adminDb.runTransaction(async transaction => {
    const profile = (await transaction.get(userRef)).data();
    if (profile?.role !== "student") return { error: "Student account required", status: 403 };

    let enrollment: { teacherId: string | null; courseId: string | null; organizationId: string | null } = {
      teacherId: null, courseId: null, organizationId: null,
    };
    if (action !== "leave") {
      const course = await findClassByCode(code, transaction);
      if (!course) return { error: "This class code is invalid or the class is no longer available.", status: 400 };
      if (profile.courseId && profile.courseId !== course.courseId) {
        return { error: "You already belong to another class. Manage your enrollment from your dashboard.", status: 409 };
      }
      const { teacherId, courseId, organizationId } = course;
      enrollment = { teacherId, courseId, organizationId };
    }
    transaction.set(userRef, enrollment, { merge: true });
    transaction.set(studentRef, enrollment, { merge: true });
    return null;
  });

  return result
    ? NextResponse.json({ error: result.error }, { status: result.status })
    : NextResponse.json({ success: true });
});
