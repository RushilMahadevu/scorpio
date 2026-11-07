import { NextRequest, NextResponse } from 'next/server';
jest.mock('../src/lib/firebase-admin', () => ({ adminAuth: { verifyIdToken: jest.fn(), verifySessionCookie: jest.fn() }, adminDb: { collection: jest.fn() } }));
import { adminAuth, adminDb } from '../src/lib/firebase-admin';
import { authenticateRequest, verifyCallerIdentity, withAuthorizedRequest } from '../src/lib/auth-verify';
const verify = adminAuth.verifyIdToken as jest.Mock;
const session = adminAuth.verifySessionCookie as jest.Mock;
const collection = adminDb.collection as jest.Mock;
beforeEach(()=>{jest.resetAllMocks();collection.mockReturnValue({doc:()=>({get:async()=>({data:()=>({role:'student',organizationId:'a'})})})});});
const request = (headers: Record<string,string> = {}, body = {}) => new NextRequest('https://scorpio.test/api/student/tutor',{method:'POST',headers,body:JSON.stringify(body)});
test('missing credentials fail closed',async()=>expect(await verifyCallerIdentity(request(),'sa')).toEqual(expect.objectContaining({authorized:false})));
test('invalid bearer fails closed',async()=>{verify.mockRejectedValue(new Error('invalid'));expect(await authenticateRequest(request({Authorization:'Bearer bad'}))).toBeNull();});
test('valid credentials cannot impersonate another account',async()=>{verify.mockResolvedValue({uid:'sa'});expect((await verifyCallerIdentity(request({Authorization:'Bearer valid'}),'sb')).authorized).toBe(false);});
test('checks revocation for bearer and session tokens',async()=>{
 verify.mockResolvedValue({uid:'sa'});await authenticateRequest(request({Authorization:'Bearer valid'}));expect(verify).toHaveBeenCalledWith('valid',true);
 session.mockResolvedValue({uid:'sa'});await authenticateRequest(request({cookie:'__session=signed'}));expect(session).toHaveBeenCalledWith('signed',true);
});
test('legacy packed cookies are supported but their claimed role is not used',async()=>{
 session.mockResolvedValue({uid:'sa'});expect(await authenticateRequest(request({cookie:`__session=${JSON.stringify({token:'signed',role:'teacher'})}`}))).toEqual({uid:'sa'});
});
test('guard rejects unauthenticated and wrong-account requests before handler',async()=>{
 const handler=jest.fn(async()=>NextResponse.json({ok:true}));const guarded=withAuthorizedRequest(handler,{identityField:'userId'});
 expect((await guarded(request())).status).toBe(401);
 verify.mockResolvedValue({uid:'sa'});expect((await guarded(request({Authorization:'Bearer valid'},{userId:'sb'}))).status).toBe(403);expect(handler).not.toHaveBeenCalled();
});
test('student cannot call teacher-only endpoints',async()=>{
 verify.mockResolvedValue({uid:'sa'});const handler=jest.fn();expect((await withAuthorizedRequest(handler,{teacher:true})(request({Authorization:'Bearer valid'}))).status).toBe(403);expect(handler).not.toHaveBeenCalled();
});
test('authorized student request reaches handler',async()=>{
 verify.mockResolvedValue({uid:'sa'});const handler=jest.fn(async()=>NextResponse.json({ok:true}));expect((await withAuthorizedRequest(handler,{identityField:'userId'})(request({Authorization:'Bearer valid'},{userId:'sa'}))).status).toBe(200);expect(handler).toHaveBeenCalledTimes(1);
});
