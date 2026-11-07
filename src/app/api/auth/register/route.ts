import { NextRequest, NextResponse } from "next/server";
import { authenticateRequest } from "@/lib/auth-verify";
import { adminDb } from "@/lib/firebase-admin";

export async function POST(req: NextRequest) {
  const caller = await authenticateRequest(req);
  if (!caller) return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  try {
    const { role, name, code } = await req.json();
    if (!["teacher", "student"].includes(role) || typeof name !== "string" || !name.trim() || name.length > 120) {
      return NextResponse.json({ error: "Invalid profile" }, { status: 400 });
    }
    const userRef = adminDb.collection("users").doc(caller.uid);
    const normalizedCode = typeof code === "string" ? code.trim() : "";
    if (normalizedCode.includes("/") || normalizedCode.length > 128) throw new Error("Invalid code");
    const course = role === "student" && normalizedCode
      ? await adminDb.collection("courses").where("code", "==", normalizedCode).limit(1).get() : null;
    if (role === "student" && normalizedCode && (!course || course.empty)) throw new Error("A valid class code is required");
    const courseData = course?.docs[0]?.data();
    const teacher = courseData ? (await adminDb.collection("users").doc(courseData.teacherId).get()).data() : null;
    if (role === "student" && normalizedCode && (!teacher || teacher.role !== "teacher" || !teacher.organizationId)) throw new Error("Class is not available");
    const newOrg = adminDb.collection("organizations").doc();
    await adminDb.runTransaction(async tx => {
      const existing = await tx.get(userRef);
      if (existing.exists) throw new Error("Profile already exists; sign in instead");
      let orgId = teacher?.organizationId || null;
      let inviteRef;
      if (role === "teacher") {
        if (!normalizedCode) throw new Error("A teacher invite code is required");
        inviteRef = adminDb.collection("teacherInviteCodes").doc(normalizedCode.toUpperCase());
        const invite = (await tx.get(inviteRef)).data();
        if (!invite || invite.isUsed || !invite.expiresAt || invite.expiresAt.toDate() <= new Date()) throw new Error("Invalid or expired invite code");
        orgId = invite.organizationId || newOrg.id;
        if (invite.organizationId && !(await tx.get(adminDb.collection("organizations").doc(orgId))).exists) throw new Error("Network no longer exists");
        if (invite.organizationId && (await tx.get(adminDb.collection("users").where("organizationId", "==", orgId).where("role", "==", "teacher").limit(50))).size >= 50) throw new Error("Network teacher capacity reached");
      }
      const data = { uid: caller.uid, email: caller.email || "", displayName: name.trim(), role,
        organizationId: orgId, teacherId: courseData?.teacherId || null, courseId: course?.docs[0]?.id || null,
        createdAt: new Date(), lastLoginAt: new Date() };
      if (role === "teacher" && orgId === newOrg.id) tx.set(newOrg, {
        id: orgId, name: `${name.trim()}'s Network`, ownerId: caller.uid, ownerEmail: caller.email || "",
        subscriptionStatus: "active", planId: "free", aiUsageCurrent: 0, aiBudgetLimit: 50,
        practiceLimitPerStudent: 10, practiceLimit: 0, practiceUsageCurrent: 0, baseMonthlyFee: 0, createdAt: new Date(),
      });
      if (inviteRef) tx.update(inviteRef, { isUsed: true, usedAt: new Date(), usedBy: caller.uid, usedByEmail: caller.email || "" });
      tx.set(userRef, data);
      tx.set(adminDb.collection(role === "teacher" ? "teachers" : "students").doc(caller.uid), { ...data, name: data.displayName });
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Registration failed" }, { status: 400 });
  }
}
