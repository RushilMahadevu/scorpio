import { NextResponse } from 'next/server';
import { authenticateRequest, withAuthorizedRequest } from '@/lib/auth-verify';
import { adminDb } from '@/lib/firebase-admin';
import { getStorage } from 'firebase-admin/storage';
export const POST = withAuthorizedRequest(async req => {
 const caller=(await authenticateRequest(req))!;
 const {studentId,courseId,unlink}=await req.json();
 if(typeof studentId!=='string'||studentId.includes('/'))return NextResponse.json({error:'Invalid student'},{status:400});
 const profile=(await adminDb.collection('users').doc(studentId).get()).data();
 if(profile?.teacherId!==caller.uid)return NextResponse.json({error:'Access denied'},{status:403});
 const submissions=await adminDb.collection('submissions').where('studentId','==',studentId).get();
 const refs: FirebaseFirestore.DocumentReference[]=[];
 for(const submission of submissions.docs) {
  const data=submission.data();
  const assignment=(await adminDb.collection('assignments').doc(data.assignmentId).get()).data();
  if(assignment?.teacherId!==caller.uid||(courseId&&assignment.courseId!==courseId))continue;
  for(const file of data.workFiles||[]) {
   const url=new URL(file.url);const object=decodeURIComponent(url.pathname.split('/o/')[1]||'');
   if(object.startsWith(`submissions/${studentId}/`))await getStorage().bucket(process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET).file(object).delete({ignoreNotFound:true});
  }
  refs.push(submission.ref);
 }
 for(let i=0;i<refs.length;i+=400){const batch=adminDb.batch();refs.slice(i,i+400).forEach(ref=>batch.delete(ref));await batch.commit();}
 if(unlink){const batch=adminDb.batch();for(const name of ['users','students'])batch.set(adminDb.collection(name).doc(studentId),{teacherId:null,courseId:null,organizationId:null},{merge:true});await batch.commit();}
 return NextResponse.json({success:true});
},{teacher:true});
