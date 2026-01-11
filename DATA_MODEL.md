# Data Model Design: Physics Engine & Canvas Architecture

This document adapts the "SQL differentiation" proposed in the Scorpio Roadmap into a **Firestore NoSQL** structure, optimized for the current tech stack.

## 1. Core Hierarchy (Canvas-Style)

To support the "Module-based linear progression" (Phase 1), the Firestore structure is nested as follows:

```typescript
// Collection: courses
interface Course {
  id: string;
  title: string;       // "AP Physics C - Mechanics"
  isBlueprint: boolean; // True if this is a master course
  teacherIds: string[];
  settings: {
    gradingScale: string;
    strictProgression: boolean; // Enforce prerequisite locks
  }
}

// Sub-collection: courses/{courseId}/modules
interface Module {
  id: string;
  title: string;       // "Unit 1: Kinematics"
  sequence: number;    // 1 (Order in list)
  isPublished: boolean;
  prerequisites: {
    moduleId: string;
    minScore: number;  // e.g., 0.80 (80%)
  }[];
}

// Sub-collection: courses/{courseId}/modules/{moduleId}/items
interface ModuleItem {
  id: string;
  type: 'page' | 'assignment' | 'quiz' | 'external_tool';
  title: string;
  contentId: string; // ID of the actual Quiz/Page document
  indent: number;    // 0 or 1 (Visual hierarchy)
}
```

## 2. The Physics Question Object (Phase 2)

This is the core differentiator. Unlike standard LMSs which store answers as strings, Scorpio stores them as complex Objects.

### Firestore Document Structure (e.g., in `questions` collection)

```typescript
interface PhysicsQuestion {
  id: string;
  type: 'calculated_numeric' | 'calculated_vector' | 'symbolic';
  promptTemplate: string; // "Calculate the force on a {{mass}} kg object accelerating at {{accel}} m/s^2."
  
  // The variables used in the template
  variables: {
    [key: string]: { // e.g., "mass"
      min: number;   // 5.0
      max: number;   // 20.0
      step: number;  // 0.1
      unit: string;  // "kg"
    }
  };

  // The grading logic (The "Answer Object")
  answerKey: {
    formula: string; // "mass * accel" (SymPy/Math.js parsable string)
    unit: string;    // "N" or "kg*m/s^2"
    
    // Grading Tolerances
    tolerance: {
      type: 'absolute' | 'relative';
      value: number; // 0.05 (5%) or 0.1 (absolute units)
    };
    
    // Sig Fig Rules
    sigFigs?: {
      strategy: 'transmit' | 'fixed'; // 'transmit' means min(sigfigs of inputs)
      value?: number;
    };
    
    // Vector Expected?
    isVector: boolean; 
  };
}
```

### Student Attempt & Grading

When a student takes a quiz, the system generates a static instance.

```typescript
// Collection: submissions
interface QuestionState {
  questionId: string;
  // The specific variables assigned to THIS student
  assignedVariables: {
    mass: 10.5,
    accel: 2.0
  };
  
  // Values computed by the backend at generated time (Answer Key Instance)
  correctAnswer: {
    numericValue: 21.0,
    acceptedUnits: ['N', 'Newtons', 'kg*m/s^2'],
    vectorValue: null
  };

  // Student's raw input
  studentResponse: {
    rawValue: "21",
    rawUnit: "Newtons",
    parsedValue: 21.0
  };
  
  isCorrect: boolean;
  pointsEarned: number;
}
```

## 3. Integration Objects (Phase 3)

### Lab Object Structure
An assignment that isn't just a file upload.

```typescript
interface LabAssignment {
  stages: {
    prelab: {
      quizId: string;
      requiredScore: number;
    };
    dataCollection: {
      // Configuration for the embedded table tool
      columns: ['Time (s)', 'Position (m)'];
      graphType: 'scatter';
    };
    analysis: {
      tools: ['linear_regression', 'slope_tool'];
    };
  };
}
```
