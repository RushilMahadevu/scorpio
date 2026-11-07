jest.mock('../src/lib/ai/config',()=>({model:{generateContent:jest.fn()}}));
import { model } from '../src/lib/ai/config';
import { gradeResponse } from '../src/lib/ai/grading';
const generate=model.generateContent as jest.Mock;
beforeEach(()=>jest.clearAllMocks());
test('provider failures do not become zero grades',async()=>{generate.mockRejectedValue(new Error('offline'));await expect(gradeResponse('question','answer')).rejects.toThrow('manual review');});
test('invalid provider JSON does not become zero grade',async()=>{generate.mockResolvedValue({response:Promise.resolve({text:()=>'{invalid}',usageMetadata:{}})});await expect(gradeResponse('question','answer')).rejects.toThrow();});
test('missing scores require review rather than defaulting to zero',async()=>{generate.mockResolvedValue({response:Promise.resolve({text:()=>'{"student_feedback":"ok"}',usageMetadata:{}})});await expect(gradeResponse('question','answer')).rejects.toThrow();});
test('valid zero score remains a legitimate grade',async()=>{generate.mockResolvedValue({response:Promise.resolve({text:()=>'{"score":0,"student_feedback":"Try again"}',usageMetadata:{}})});expect((await gradeResponse('question','answer')).score).toBe(0);});
