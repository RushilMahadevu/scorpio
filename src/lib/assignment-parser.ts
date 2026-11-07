export function parseQuestionsManually(text: string): any[] {
  const questions: any[] = [];
  const lines = text.split('\n').map(l => l.trim()).filter(l => l);
  let currentQuestion: any = null;
  let currentOptions: string[] = [];
  let lastWasOptions = false;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Skip section headers
    if (/^(Multiple Choice|Short Answer|True\/?False|THERMODYNAMICS|Waves and Sound|Physics Quiz)/i.test(line)) {
      continue;
    }
    
    // Check for "Question N:" format
    const questionPrefixMatch = line.match(/^Question\s+(\d+):\s*(.+)$/i);
    // Check for "N." or "N)" format (must have substantial text)
    const questionNumberMatch = line.match(/^(\d+)[\.)]\s*(.{10,})$/);
    
    if (questionPrefixMatch || questionNumberMatch) {
      // Save previous question
      if (currentQuestion) {
        currentQuestion.options = currentOptions;
        questions.push(currentQuestion);
      }
      
      // Extract question text
      let questionText = questionPrefixMatch ? questionPrefixMatch[2] : questionNumberMatch![2];
      
      // Check if options are inline in the question text
      const inlineOptionsMatch = questionText.match(/^(.+?)\s+([A-D]\).*(?:[A-D]\).*)+)$/);
      
      if (inlineOptionsMatch) {
        // Question has inline options
        questionText = inlineOptionsMatch[1].trim();
        const optionsText = inlineOptionsMatch[2];
        
        // Parse inline options
        const optionParts = optionsText.split(/(?=[A-D]\))/);
        currentOptions = [];
        
        for (const part of optionParts) {
          const trimmed = part.trim();
          if (trimmed) {
            // Remove letter and extract option text (stop at next letter or "Answer:")
            const option = trimmed
              .replace(/^[A-D]\)\s*/, '')
              .replace(/\s+Answer:.*$/, '')
              .trim();
            if (option) {
              currentOptions.push(option);
            }
          }
        }
        
        currentQuestion = {
          text: questionText,
          type: 'multiple-choice',
          options: [],
          correctAnswer: '',
        };
        lastWasOptions = true;
      } else {
        // No inline options
        currentQuestion = {
          text: questionText,
          type: 'text',
          options: [],
          correctAnswer: '',
        };
        currentOptions = [];
        lastWasOptions = false;
      }
    }
    // Check for options with various formats: A), a), (A), (1), 1), - Option
    else if (currentQuestion && /^[\(\[]?[A-Da-d1-4][\)\.\]]\s+.+|^[-•]\s+.+/.test(line)) {
      // Extract the option text (remove the prefix)
      const option = line
        .replace(/^[\(\[]?[A-Da-d1-4][\)\.\]]\s*/, '')
        .replace(/^[-•]\s*/, '')
        .trim();
      
      if (option && !option.toLowerCase().startsWith('answer')) {
        currentOptions.push(option);
        currentQuestion.type = 'multiple-choice';
        lastWasOptions = true;
      }
    }
    // Check for "Options:" label
    else if (/^Options:\s*$/i.test(line)) {
      lastWasOptions = false; // Next lines will be options
      continue;
    }
    // Check for various answer formats
    else if (/^(Answer|Correct Answer):\s*/i.test(line)) {
      const answer = line.replace(/^(Answer|Correct Answer):\s*/i, '').trim();
      
      if (currentQuestion && answer) {
        // For multiple choice with letter answers
        if (currentQuestion.type === 'multiple-choice') {
          // Check if answer is a letter (A, B, C, D) or number (1, 2, 3, 4)
          const letterMatch = answer.match(/^([A-Da-d])$/i);
          const numberMatch = answer.match(/^([1-4])$/);
          
          if (letterMatch) {
            const letterIndex = letterMatch[1].toUpperCase().charCodeAt(0) - 'A'.charCodeAt(0);
            if (letterIndex >= 0 && letterIndex < currentOptions.length) {
              currentQuestion.correctAnswer = currentOptions[letterIndex];
            }
          } else if (numberMatch) {
            const numberIndex = parseInt(numberMatch[1]) - 1;
            if (numberIndex >= 0 && numberIndex < currentOptions.length) {
              currentQuestion.correctAnswer = currentOptions[numberIndex];
            }
          } else {
            // Answer is the full text
            currentQuestion.correctAnswer = answer;
          }
        } else {
          // For short answer questions
          currentQuestion.correctAnswer = answer;
          if (currentOptions.length === 0) {
            currentQuestion.type = 'short-answer';
          }
        }
      }
      lastWasOptions = false;
    }
    // Check for True/False answers
    else if (currentQuestion && /^(True|False)$/i.test(line) && !lastWasOptions) {
      if (currentOptions.length === 0) {
        currentOptions.push('True', 'False');
        currentQuestion.type = 'true-false';
        lastWasOptions = true;
      }
    }
    // Check if line contains "Use" (formula hint)
    else if (currentQuestion && /^Use\s+/i.test(line)) {
      currentQuestion.text += ' ' + line;
    }
    // Continuation of question text
    else if (currentQuestion && !lastWasOptions && currentOptions.length === 0 && line.length > 3) {
      if (/[a-zA-Z?]/.test(line) && !line.match(/^[A-D]\)/)) {
        currentQuestion.text += ' ' + line;
      }
    }
  }
  
  // Save last question
  if (currentQuestion) {
    currentQuestion.options = currentOptions;
    questions.push(currentQuestion);
  }
  
  // Clean up and validate
  return questions
    .map(q => ({
      ...q,
      text: q.text.trim().replace(/\s+/g, ' '),
      correctAnswer: q.correctAnswer.trim(),
    }))
    .filter(q => q.text.length > 5);
}

