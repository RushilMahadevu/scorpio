import { randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import { authenticateRequest, withAuthorizedRequest } from "@/lib/auth-verify";
import { adminDb, adminFieldWithValue } from "@/lib/firebase-admin";

export const POST = withAuthorizedRequest(async req => {
  const caller = (await authenticateRequest(req))!;
  const code = `SCORP-${randomBytes(16).toString("hex").toUpperCase()}`;

  const created = await adminDb.runTransaction(async transaction => {
    const profile = (await transaction.get(adminDb.collection("users").doc(caller.uid))).data();
    if (profile?.role !== "teacher" || !profile.organizationId) return false;

    const network = (await transaction.get(adminDb.collection("organizations").doc(profile.organizationId))).data();
    if (network?.ownerId !== caller.uid) return false;

    transaction.create(adminDb.collection("teacherInviteCodes").doc(code), {
      code,
      label: network.name || "Network invitation",
      organizationId: profile.organizationId,
      createdBy: caller.uid,
      createdAt: adminFieldWithValue.serverTimestamp(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      isUsed: false,
      usedAt: null,
      usedBy: null,
      usedByEmail: null,
    });
    return true;
  });

  return created
    ? NextResponse.json({ code }, { status: 201 })
    : NextResponse.json({ error: "Only the Network owner can create colleague invites." }, { status: 403 });
}, { teacher: true });
