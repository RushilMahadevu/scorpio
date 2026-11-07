import { splitAssignmentQuestions, mergeAnswerKey } from '../src/lib/assignment-security';
test('public assignment never includes answer keys',()=>{
 const {publicQuestions,answers}=splitAssignmentQuestions([{id:'q1',text:'Calculate acceleration',correctAnswer:'2 m/s²',points:10}]);
 expect(JSON.stringify(publicQuestions)).not.toContain('2 m/s²');expect(publicQuestions[0]).not.toHaveProperty('correctAnswer');
 expect(mergeAnswerKey({questions:publicQuestions},{answers}).questions[0].correctAnswer).toBe('2 m/s²');
});
test('reject duplicate question ids rather than silently overwrite keys',()=>expect(()=>splitAssignmentQuestions([{id:'q',text:'first'},{id:'q',text:'second'}])).toThrow());
