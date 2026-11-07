/** Run with explicit credentials/project. Defaults to a read-only dry run. */
const admin = require('firebase-admin');
const projectId = process.env.FIREBASE_PROJECT_ID;
if (!projectId) throw new Error('Set FIREBASE_PROJECT_ID explicitly; do not infer the production project');
admin.initializeApp({projectId,credential:admin.credential.applicationDefault()});
const db=admin.firestore();
const apply=process.argv.includes('--apply');
(async()=>{
 let cursor;let count=0;
 do {
  let q=db.collection('assignments').orderBy(admin.firestore.FieldPath.documentId()).limit(100);
  if(cursor)q=q.startAfter(cursor);
  const page=await q.get(); if(page.empty)break;
  for(const doc of page.docs){
   const data=doc.data();if(data.answerKeySeparated)continue;
   const answers={};const questions=(data.questions||[]).map(({correctAnswer,...question})=>{answers[question.id]=correctAnswer??'';return question});
   count++;
   if(apply)await db.runTransaction(async tx=>{
    const fresh=(await tx.get(doc.ref)).data();
    if(fresh?.answerKeySeparated)return;
    const keyRef=db.collection('assignment_keys').doc(doc.id);
    // Re-read live questions inside transaction to avoid losing concurrent teacher edits.
    const keys={};const publicQuestions=(fresh.questions||[]).map(({correctAnswer,...q})=>{keys[q.id]=correctAnswer??'';return q});
    tx.set(keyRef,{answers:keys,rubric:fresh.rubric||'',teacherId:fresh.teacherId});
    tx.update(doc.ref,{questions:publicQuestions,rubric:null,answerKeySeparated:true});
   });
  }
  cursor=page.docs.at(-1);
 }while(cursor);
 console.log(`${apply?'Migrated':'Would migrate'} ${count} assignments in ${projectId}.`);
 console.log('Audit existing teacher identities and enrollment separately before trusting historical profiles.');
})().catch(error=>{console.error(error.message);process.exitCode=1});
