# Scorpio Platform - Future Implementation Roadmap

This document outlines planned features and improvements for the Scorpio Physics Platform, categorized by implementation phase.

## Phase 1: Enhanced AI & User Experience (Short Term)

### 1. Multimodal AI Support (Image Input)
- **Goal:** Allow students to upload photos of physics problems or diagrams.
- **Implementation:** 
  - Update `src/lib/gemini.ts` to handle image inputs using Gemini's multimodal capabilities.
  - Add an image upload button to the AI Tutor chat interface.
  - Use Firebase Storage to temporarily store images if needed, or pass base64 directly to the model.

### 2. Advanced Math Rendering
- **Goal:** Display complex physics equations (LaTeX) properly in the chat.
- **Implementation:**
  - Integrate `rehype-katex` and `remark-math` into the React Markdown renderer.
  - Ensure the AI model is prompted to output equations in LaTeX format.

### 3. Enhanced UI/UX & Theming
- **Goal:** Improve visual appeal and usability.
- **Implementation:**
  - **Dark Mode:** Implement a theme toggle (Light/Dark/System) using `next-themes`.
  - **Animations:** Add smooth page transitions and component animations using `framer-motion`.
  - **Responsive Design:** Polish mobile navigation and sidebar behavior.
  - **Loading States:** Add skeleton loaders for data fetching states.

## Phase 2: Teacher Tools & Analytics (Medium Term)

### 4. Class Analytics Dashboard
- **Goal:** Give teachers insights into student performance.
- **Implementation:**
  - Create charts (using `recharts` or similar) showing:
    - Average class scores per assignment.
    - Topics where students struggle the most (based on AI chat tags).
    - Student engagement levels.

### 5. Advanced Assignment Creation
- **Goal:** More control over AI-generated assignments.
- **Implementation:**
  - Allow teachers to edit AI-generated questions before saving.
  - Support for different question types (True/False, Short Answer, Diagram labeling).
  - "Regenerate specific question" feature.

### 6. Grade Export
- **Goal:** Easy integration with external gradebooks.
- **Implementation:**
  - Add functionality to export assignment grades to CSV or PDF formats.
<!-- 
## Phase 3: Gamification & Engagement (Long Term)

### 7. Gamification System
- **Goal:** Increase student motivation.
- **Implementation:**
  - **XP System:** Earn points for completing assignments and chatting with the tutor.
  - **Badges:** Unlock achievements (e.g., "Physics Whiz", "7-Day Streak").
  - **Leaderboards:** Optional class-wide leaderboards.

### 8. Interactive Simulations
- **Goal:** Visual learning for abstract concepts.
- **Implementation:**
  - Integrate open-source physics simulations (like PhET) or build simple canvas-based simulations for core concepts (Projectile Motion, Pendulums).

### 9. Peer Collaboration
- **Goal:** Foster collaborative learning.
- **Implementation:**
  - Discussion boards for specific assignments.
  - "Study Groups" feature where students can chat (moderated by AI).

## Technical Improvements

- **PWA Support:** Make the app installable and work offline.
- **Real-time Notifications:** Use Firestore listeners to notify students of new assignments or graded submissions instantly.
- **Accessibility:** Ensure full WCAG compliance for all student-facing pages. -->
