import { NextRequest } from 'next/server';
import * as admin from 'firebase-admin';
jest.mock('../../src/lib/firebase-admin',()=>{
 const admin=require('firebase-admin');
 if(!process.env.FIRESTORE_EMULATOR_HOST)throw new Error('Emulator required');
 if(!admin.apps.length)admin.initializeApp({projectId:'demo-scorpio-security'});
 return {adminDb:admin.firestore(),adminAuth:{verifyIdToken:async(token:string)=>({uid:token,email:`${token}@example.test`,auth_time:Math.floor(Date.now()/1000)}),deleteUser:jest.fn(async()=>undefined)}};
});
import { POST as register } from '../../src/app/api/auth/register/route';
import { POST as createAssignment, GET as teacherAssignment } from '../../src/app/api/assignments/route';
import { POST as submit } from '../../src/app/api/submissions/route';
import { DELETE as deleteAccount, GET as exportAccount } from '../../src/app/api/account/route';
import { POST as enroll } from '../../src/app/api/student/enrollment/route';
import { reserveBudget,settleBudget } from '../../functions/src/metering';
import { adminDb } from '../../src/lib/firebase-admin';
const req=(path:string,user:string,body:unknown)=>new NextRequest(`http://localhost/api/${path}`,{method:'POST',headers:{Authorization:`Bearer ${user}`},body:JSON.stringify(body)});
beforeAll(async()=>{
 await adminDb.collection('users').doc('wt').set({role:'teacher',organizationId:'worg'});
 await adminDb.collection('organizations').doc('worg').set({ownerId:'wt',planId:'free',subscriptionStatus:'active',aiBudgetLimit:50,aiUsageCurrent:0});
 await adminDb.collection('courses').doc('wc').set({teacherId:'wt',organizationId:'worg',code:'WORKFLOW'});
});
afterAll(async()=>{await Promise.all(admin.apps.filter(Boolean).map(app=>app!.delete()))});
test('student signup resolves enrollment server-side; teacher signup requires a valid invite',async()=>{
 expect((await register(req('auth/register','ws',{role:'student',name:'Synthetic Student',code:'WORKFLOW',organizationId:'attacker'}))).status).toBe(200);
 const student=(await adminDb.collection('users').doc('ws').get()).data()!;expect(student.organizationId).toBe('worg');expect(student.courseId).toBe('wc');
 expect((await register(req('auth/register','fake-teacher',{role:'teacher',name:'Attacker'}))).status).toBe(400);
});
test('teacher invite is consumed atomically and cannot be reused',async()=>{
 await adminDb.collection('teacherInviteCodes').doc('INVITE').set({organizationId:'worg',expiresAt:new Date(Date.now()+60000),isUsed:false});
 const results=await Promise.all(['wta','wtb'].map(u=>register(req('auth/register',u,{role:'teacher',name:u,code:'INVITE'}))));
 expect(results.map(r=>r.status).sort()).toEqual([200,400]);
});
test('assignment, draft, submission and finalization preserve permissions and answer secrecy',async()=>{
 const created=await createAssignment(req('assignments','wt',{title:'Physics',courseId:'wc',visibility:'private',gradingType:'manual',questions:[{id:'q',text:'2 + 2',points:10,correctAnswer:'4'}],dueDate:new Date(Date.now()-1000).toISOString()}));
 expect(created.status).toBe(200);const {id}=await created.json();
 const publicData=(await adminDb.collection('assignments').doc(id).get()).data()!;expect(publicData.questions[0]).not.toHaveProperty('correctAnswer');
 const key=await teacherAssignment(new NextRequest(`http://localhost/api/assignments?id=${id}`,{headers:{Authorization:'Bearer wt'}}));expect((await key.json()).questions[0].correctAnswer).toBe('4');
 const draft=await submit(req('submissions','ws',{assignmentId:id,status:'draft',score:100,answers:[{questionId:'q',answer:'4',score:100}]}));expect(draft.status).toBe(200);const {id:submissionId}=await draft.json();
 const final=await submit(req('submissions','ws',{submissionId,assignmentId:id,status:'submitted',answers:[{questionId:'q',answer:'4',score:100}],earnedPoints:100}));expect(final.status).toBe(200);
 const saved=(await adminDb.collection('submissions').doc(submissionId).get()).data()!;expect(saved.isLate).toBe(true);expect(saved.earnedPoints).toBeNull();expect(saved.answers[0]).not.toHaveProperty('score');
 await adminDb.collection('submissions').doc(submissionId).update({graded:true,score:80,status:'graded'});
 expect((await submit(req('submissions','ws',{submissionId,assignmentId:id,status:'submitted',answers:[]}))).status).toBe(200);
 expect((await adminDb.collection('submissions').doc(submissionId).get()).data()!.score).toBe(80);
});
test('student may leave and rejoin through verified class codes',async()=>{
 expect((await enroll(req('student/enrollment','ws',{action:'leave'}))).status).toBe(200);
 expect((await adminDb.collection('users').doc('ws').get()).data()!.organizationId).toBeNull();
 expect((await enroll(req('student/enrollment','ws',{code:'WORKFLOW'}))).status).toBe(200);
});
test('concurrent budget reservations cannot exceed the cap; settlement is idempotent',async()=>{
 await adminDb.collection('organizations').doc('budget').set({planId:'free',subscriptionStatus:'active',aiBudgetLimit:5,aiUsageCurrent:0});
 const results=await Promise.allSettled([reserveBudget(adminDb,'budget','grading',undefined,4),reserveBudget(adminDb,'budget','grading',undefined,4)]);
 expect(results.filter(r=>r.status==='fulfilled')).toHaveLength(1);
 const id=(results.find(r=>r.status==='fulfilled') as PromiseFulfilledResult<string>).value;
 await settleBudget(adminDb,id,1000,1000);await settleBudget(adminDb,id,1000,1000);
 const org=(await adminDb.collection('organizations').doc('budget').get()).data()!;expect(org.aiUsageReserved).toBe(0);expect(org.aiUsageCurrent).toBeCloseTo(0.28);
});
test('monthly student allowance rolls over and is reserved atomically',async()=>{
 await adminDb.collection('organizations').doc('allowance').set({planId:'free',subscriptionStatus:'active',aiBudgetLimit:50,aiTutorLimitPerStudent:1});
 await adminDb.collection('users').doc('limit-student').set({usageMonth:'2000-01',tutorUsageCurrent:99});
 await reserveBudget(adminDb,'allowance','tutor','limit-student',1);
 await expect(reserveBudget(adminDb,'allowance','tutor','limit-student',1)).rejects.toThrow('allowance');
 expect((await adminDb.collection('users').doc('limit-student').get()).data()!.tutorUsageCurrent).toBe(1);
});

test('student signup without optional class code remains supported',async()=>{
 expect((await register(req('auth/register','unassigned',{role:'student',name:'Unassigned'}))).status).toBe(200);
 expect((await adminDb.collection('users').doc('unassigned').get()).data()!.organizationId).toBeNull();
});

test('account export and deletion cover all learning-record collections',async()=>{
 if (!process.env.FIREBASE_STORAGE_EMULATOR_HOST) throw new Error('Storage emulator required');
 process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET='demo-scorpio-security.appspot.com';
 await adminDb.collection('users').doc('delete-me').set({role:'student'});
 for(const collection of ['submissions','practice_history','notebooks','tutor_sessions','portfolios'])await adminDb.collection(collection).doc('delete-record').set({studentId:'delete-me'});
 const exported=await exportAccount(req('account','delete-me',{}));expect(exported.status).toBe(200);expect((await exported.json()).length).toBeGreaterThanOrEqual(5);
 const deleted=await deleteAccount(req('account','delete-me',{}));expect(deleted.status).toBe(200);
 for(const collection of ['submissions','practice_history','notebooks','tutor_sessions','portfolios'])expect((await adminDb.collection(collection).doc('delete-record').get()).exists).toBe(false);
 expect((await adminDb.collection('users').doc('delete-me').get()).exists).toBe(false);
});
