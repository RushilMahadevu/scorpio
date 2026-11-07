import { NextResponse } from 'next/server';
import { authenticateRequest, withAuthorizedRequest } from '@/lib/auth-verify';
import { adminDb } from '@/lib/firebase-admin';

export const POST = withAuthorizedRequest(async req => {
  const caller = (await authenticateRequest(req))!;
  const { action, name, code, memberId } = await req.json();
  try {
    await adminDb.runTransaction(async tx => {
      const ref = adminDb.collection('users').doc(caller.uid);
      const profile = (await tx.get(ref)).data()!;
      const orgRef = profile.organizationId ? adminDb.collection('organizations').doc(profile.organizationId) : null;
      const org = orgRef ? (await tx.get(orgRef)).data() : null;
      if (action === 'create') {
        if (profile.organizationId || typeof name !== 'string' || !name.trim()) throw new Error('Leave your current network first');
        const fresh = adminDb.collection('organizations').doc();
        tx.set(fresh, { id: fresh.id, name: name.trim().slice(0, 120), ownerId: caller.uid, ownerEmail: caller.email || '', planId: 'free', subscriptionStatus: 'none', aiUsageCurrent: 0, aiBudgetLimit: 0, createdAt: new Date() });
        tx.update(ref, { organizationId: fresh.id });
      } else if (action === 'join') {
        if (profile.organizationId) throw new Error('Leave your current network first');
        if (typeof code !== 'string' || code.includes('/') || !code.trim()) throw new Error('A network-linked teacher invite code is required');
        const inviteRef = adminDb.collection('teacherInviteCodes').doc(code.trim().toUpperCase());
        const invite = (await tx.get(inviteRef)).data();
        if (!invite?.organizationId || invite.isUsed || !invite.expiresAt || invite.expiresAt.toDate() <= new Date()) throw new Error('Invalid network invite');
        const target = adminDb.collection('organizations').doc(invite.organizationId);
        if (!(await tx.get(target)).exists) throw new Error('Network not found');
        if ((await tx.get(adminDb.collection('users').where('organizationId', '==', invite.organizationId).where('role', '==', 'teacher').limit(50))).size >= 50) throw new Error('Network teacher capacity reached');
        tx.update(ref, { organizationId: invite.organizationId });
        tx.update(inviteRef, { isUsed: true, usedBy: caller.uid, usedAt: new Date() });
      } else if (action === 'leave' || action === 'remove') {
        const targetId = action === 'leave' ? caller.uid : memberId;
        if (typeof targetId !== 'string' || targetId.includes('/')) throw new Error('Invalid member');
        if (action === 'remove' && org?.ownerId !== caller.uid) throw new Error('Only the owner can remove members');
        if (targetId === org?.ownerId) {
          const members = await tx.get(adminDb.collection('users').where('organizationId', '==', profile.organizationId).limit(2));
          if (members.size > 1) throw new Error('Transfer network ownership before leaving');
          if (org?.planId !== 'free' && !['canceled','revoked'].includes(org?.subscriptionStatus)) throw new Error('Cancel the network subscription before disbanding');
        }
        const targetRef = adminDb.collection('users').doc(targetId);
        const target = (await tx.get(targetRef)).data();
        if (!profile.organizationId || target?.organizationId !== profile.organizationId) throw new Error('Invalid member');
        const students = await tx.get(adminDb.collection('users').where('teacherId', '==', targetId).limit(1));
        if (!students.empty) throw new Error('Reassign or remove enrolled students before leaving the network');
        tx.update(targetRef, { organizationId: null });
        if (targetId === org?.ownerId && orgRef) tx.delete(orgRef);
      } else throw new Error('Unknown action');
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Membership update failed' }, { status: 400 });
  }
}, { teacher: true });
