import { NextRequest, NextResponse } from 'next/server';
import { billingContext } from '@/lib/billing-context';
import { explainPhysicsConcept, helpSolveProblem } from '@/lib/ai/tutor';
import { CONSTRAINT_LEVELS, ConstraintLevel } from '@/lib/ai/constants';
export async function POST(req: NextRequest) {
  if (!process.env.ADMIN_SECRET || req.headers.get('x-admin-secret') !== process.env.ADMIN_SECRET) return NextResponse.json({error:'Unauthorized'},{status:401});
  const {message,mode,level}=await req.json();
  if(typeof message!=='string'||message.length>10000||!(level in CONSTRAINT_LEVELS))return NextResponse.json({error:'Invalid research request'},{status:400});
  try {
    const response=await billingContext.run({organizationId:process.env.LANDING_ORG_ID||'',type:'research'},()=>mode==='concept'?explainPhysicsConcept(message,[],level as ConstraintLevel):helpSolveProblem(message,[],level as ConstraintLevel));
    return NextResponse.json(response);
  } catch {return NextResponse.json({error:'Research request failed; check budget and provider configuration'},{status:503});}
}
