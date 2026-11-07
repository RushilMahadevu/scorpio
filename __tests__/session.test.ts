import {NextRequest} from 'next/server';
const setCookie=jest.fn();
jest.mock('next/headers',()=>({cookies:async()=>({set:(...args:unknown[])=>setCookie(...args),delete:jest.fn()})}));
jest.mock('../src/lib/firebase-admin',()=>({adminAuth:{verifyIdToken:jest.fn(async()=>({uid:'student'})),createSessionCookie:jest.fn(async()=> 'signed-session')},adminDb:{collection:()=>({doc:()=>({get:async()=>({data:()=>({role:'student',organizationId:'school-a'})})})})}}));
import {POST} from '../src/app/api/auth/session/route';
test('session ignores forged role and organization, and sets seconds-based lifetime',async()=>{
 const res=await POST(new NextRequest('https://scorpio.test/api/auth/session',{method:'POST',headers:{origin:'https://scorpio.test'},body:JSON.stringify({idToken:'valid',role:'teacher',organizationId:'school-b'})}));
 expect(res.status).toBe(200);expect((await res.json()).role).toBe('student');expect(setCookie).toHaveBeenCalledWith('__session','signed-session',expect.objectContaining({maxAge:432000,httpOnly:true}));
});
test('session rejects cross-origin login requests',async()=>{
 const res=await POST(new NextRequest('https://scorpio.test/api/auth/session',{method:'POST',headers:{origin:'https://evil.test'},body:'{}'}));expect(res.status).toBe(403);
});
