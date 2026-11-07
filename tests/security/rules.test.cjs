const { initializeTestEnvironment, assertFails, assertSucceeds } = require('@firebase/rules-unit-testing');
const { doc, getDoc, setDoc, updateDoc, collection, query, where, getDocs } = require('firebase/firestore');
const fs = require('node:fs');
const {ref,uploadBytes,getBytes}=require('firebase/storage');
let env;
beforeAll(async () => {
 env = await initializeTestEnvironment({ projectId: 'demo-scorpio-security', firestore: { host: '127.0.0.1', port: 8188, rules: fs.readFileSync('firestore.rules','utf8') }, storage: {host:'127.0.0.1',port:9298,rules:fs.readFileSync('storage.rules','utf8')} });
 await env.withSecurityRulesDisabled(async ctx => {
  const db=ctx.firestore();
  const docs={
   'users/ta':{role:'teacher',organizationId:'a'}, 'users/tb':{role:'teacher',organizationId:'b'},
   'users/sa':{role:'student',teacherId:'ta',courseId:'ca',organizationId:'a'},'users/sb':{role:'student',teacherId:'tb',courseId:'cb',organizationId:'b'},
   'organizations/a':{ownerId:'ta',planId:'free'}, 'organizations/b':{ownerId:'tb'},
   'courses/ca':{teacherId:'ta',organizationId:'a'},'courses/cb':{teacherId:'tb',organizationId:'b'},
   'assignments/aa':{teacherId:'ta',courseId:'ca',organizationId:'a',visibility:'private',answerKeySeparated:true,questions:[]},
   'assignments/legacy':{teacherId:'ta',courseId:'ca',organizationId:'a',visibility:'private',questions:[{correctAnswer:'secret'}]},
   'assignment_keys/aa':{teacherId:'ta',answers:{q:'secret'}},
   'submissions/suba':{studentId:'sa',assignmentId:'aa',teacherId:'ta',status:'submitted',graded:false},
   'notebooks/na':{studentId:'sa'}, 'tutor_sessions/sa':{studentId:'sa'},
   'portfolios/sa':{studentId:'sa',teacherId:'ta',organizationId:'a'}
  };
  await Promise.all(Object.entries(docs).map(([path,data])=>setDoc(doc(db,path),data)));
 });
},30000);
afterAll(async()=>{await env?.cleanup()});
const db = id => env.authenticatedContext(id).firestore();
test('unauthenticated users cannot read student records',async()=>assertFails(getDoc(doc(env.unauthenticatedContext().firestore(),'users/sa'))));
test('a fresh account cannot create a teacher profile',async()=>assertFails(setDoc(doc(db('new'),'users/new'),{role:'teacher'})));
test('student cannot self-promote, change school, or reset usage',async()=>{
 for(const change of [{role:'teacher'},{organizationId:'b'},{teacherId:'tb'},{tutorUsageCurrent:0}]) await assertFails(updateDoc(doc(db('sa'),'users/sa'),change));
});
test('teacher can read own students and their submissions',async()=>{
 await assertSucceeds(getDoc(doc(db('ta'),'users/sa')));
 await assertSucceeds(getDocs(query(collection(db('ta'),'users'),where('teacherId','==','ta'),where('role','==','student'))));
 await assertSucceeds(getDocs(query(collection(db('ta'),'submissions'),where('assignmentId','==','aa'))));
});
test('teacher cannot cross school boundaries',async()=>{
 for(const path of ['users/sa','submissions/suba','portfolios/sa','courses/ca','assignment_keys/aa']) await assertFails(getDoc(doc(db('tb'),path)));
 await assertFails(updateDoc(doc(db('tb'),'courses/ca'),{name:'hijack'}));
});
test('student can read sanitized assignment but not keys or legacy answer documents',async()=>{
 await assertSucceeds(getDoc(doc(db('sa'),'assignments/aa')));
 await assertFails(getDoc(doc(db('sa'),'assignment_keys/aa')));
 await assertFails(getDoc(doc(db('sa'),'assignments/legacy')));
});
test('student cannot forge grading fields or create submissions directly',async()=>{
 await assertFails(updateDoc(doc(db('sa'),'submissions/suba'),{graded:true,earnedPoints:100}));
 await assertFails(setDoc(doc(db('sa'),'submissions/fake'),{studentId:'sa',score:100}));
});
test('student cannot take ownership of another notebook or tutor session',async()=>{
 await assertFails(setDoc(doc(db('sb'),'notebooks/na'),{studentId:'sb'}));
 await assertFails(setDoc(doc(db('sb'),'tutor_sessions/sa'),{studentId:'sb'}));
});
test('owner can change display settings but cannot forge subscription or usage',async()=>{
 await assertSucceeds(updateDoc(doc(db('ta'),'organizations/a'),{name:'Physics'}));
 await assertFails(updateDoc(doc(db('ta'),'organizations/a'),{planId:'paid',aiUsageCurrent:0}));
});

test('student assignment queries remain valid with sanitized marker',async()=>{
 await assertSucceeds(getDocs(query(collection(db('sa'),'assignments'),where('courseId','==','ca'),where('answerKeySeparated','==',true))));
});
test('network portfolio queries remain authorized only for the owning network',async()=>{
 await assertSucceeds(getDocs(query(collection(db('ta'),'portfolios'),where('studentId','in',['sa']))));
 await assertFails(getDocs(query(collection(db('tb'),'portfolios'),where('studentId','in',['sa']))));
});
test('storage accepts own work, rejects other students and unrelated teachers',async()=>{
 const storage=env.authenticatedContext('sa').storage();
 await assertSucceeds(uploadBytes(ref(storage,'submissions/sa/work.txt'),new TextEncoder().encode('physics'),{contentType:'text/plain'}));
 await assertSucceeds(getBytes(ref(env.authenticatedContext('ta').storage(),'submissions/sa/work.txt')));
 await assertFails(getBytes(ref(env.authenticatedContext('tb').storage(),'submissions/sa/work.txt')));
 await assertFails(uploadBytes(ref(env.authenticatedContext('sb').storage(),'submissions/sa/fake.txt'),new TextEncoder().encode('fake'),{contentType:'text/plain'}));
});
