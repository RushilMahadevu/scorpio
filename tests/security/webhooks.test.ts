import * as admin from 'firebase-admin';
jest.mock('../../src/lib/firebase-admin',()=>{
 const admin=require('firebase-admin');if(!process.env.FIRESTORE_EMULATOR_HOST)throw new Error('Emulator required');
 if(!admin.apps.length)admin.initializeApp({projectId:'demo-scorpio-security'});return {adminDb:admin.firestore()};
});
jest.mock('@polar-sh/sdk/webhooks',()=>({validateEvent:(body:string)=>JSON.parse(body)}));
import {POST} from '../../src/app/api/webhooks/polar/route';
import {adminDb} from '../../src/lib/firebase-admin';
const send=(id:string,date:string,period:string,type='subscription.active')=>POST(new Request('http://localhost/api/webhooks/polar',{method:'POST',headers:{'webhook-id':id},body:JSON.stringify({type,data:{id:'sub',customerId:'cust',status:'active',modifiedAt:date,currentPeriodStart:period,metadata:{organizationId:'billing-test',planId:'standard_monthly'}}})}));
afterAll(async()=>{await Promise.all(admin.apps.filter(Boolean).map(app=>app!.delete()))});
test('duplicate, same-period and out-of-order billing events cannot reset accumulated usage',async()=>{
 const ref=adminDb.collection('organizations').doc('billing-test');await ref.set({ownerId:'teacher',aiUsageCurrent:10});
 expect((await send('first','2026-11-01','2026-11-01')).status).toBe(200);await ref.update({aiUsageCurrent:12});
 await send('first','2026-11-01','2026-11-01');expect((await ref.get()).data()!.aiUsageCurrent).toBe(12);
 await send('activation-again','2026-11-02','2026-11-01');expect((await ref.get()).data()!.aiUsageCurrent).toBe(12);
 await send('old','2026-10-01','2026-10-01');expect((await ref.get()).data()!.aiUsageCurrent).toBe(12);
 await send('renewal','2026-12-01','2026-12-01');expect((await ref.get()).data()!.aiUsageCurrent).toBe(0);
});
test('order.created never grants paid access',async()=>{
 await send('order','2027-01-01','2027-01-01','order.created');expect((await adminDb.collection('organizations').doc('billing-test').get()).data()!.billingPeriodStart).toBe('2026-12-01T00:00:00.000Z');
});
