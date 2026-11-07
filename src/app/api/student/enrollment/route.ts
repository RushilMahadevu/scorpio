import { NextResponse } from 'next/server';
import { authenticateRequest, withAuthorizedRequest } from '@/lib/auth-verify';
import { adminDb } from '@/lib/firebase-admin';
export const POST = withAuthorizedRequest(async req => {
 const caller=(await authenticateRequest(req))!;
 const {code,action}=await req.json();
 const profile=(await adminDb.collection('users').doc(caller.uid).get()).data();
 if(profile?.role!=='student') return NextResponse.json({error:'Student account required'},{status:403});
 let enrollment={teacherId:null as string|null,courseId:null as string|null,organizationId:null as string|null};
 if(action!=='leave') {
  if(typeof code!=='string'||code.length>128) return NextResponse.json({error:'Invalid class code'},{status:400});
  const course=(await adminDb.collection('courses').where('code','==',code.trim()).limit(1).get()).docs[0];
  const teacher=course ? (await adminDb.collection('users').doc(course.data().teacherId).get()).data():null;
  if(!course||teacher?.role!=='teacher'||!teacher.organizationId) return NextResponse.json({error:'Invalid class code'},{status:400});
  enrollment={teacherId:course.data().teacherId,courseId:course.id,organizationId:teacher.organizationId};
 }
 const batch=adminDb.batch();
 for(const name of ['users','students']) batch.set(adminDb.collection(name).doc(caller.uid),enrollment,{merge:true});
 await batch.commit();
 return NextResponse.json({success:true});
});
