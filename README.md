# <img src="./public/favicon.svg" alt="Scorpio Logo" width="24" /> Scorpio

Scorpio is a modern, space-inspired physics learning platform designed to help students and teachers collaborate, assign, and grade assignments with ease. Explore the cosmos of knowledge with interactive tools, real-time feedback, and a stellar user experience.

## Overview

Scorpio addresses a fundamental challenge in physics education: the disconnect between how teachers need to deliver content and how students naturally learn. Traditional learning management systems force both groups into rigid workflows that don't reflect the dynamic nature of physics problem-solving.

This platform reimagines that experience by:

- **Reducing friction in the assignment lifecycle** - Teachers create, distribute, and grade assignments in one cohesive environment without switching between multiple tools
- **Meeting students where they are** - Real-time feedback, conversational AI tutoring, and visual math input lower the barrier to getting help
- **Making progress transparent** - Both teachers and students have clear visibility into understanding and performance without manual tracking

The result is more time for actual teaching and learning, less time managing logistics.

---

## Core Features

| Feature | Technology | Description |
|---------|-----------|-------------|
| **AI-Powered Tutoring** | Google Gemini 2.0 Flash | Context-aware explanations with conversation memory, step-by-step problem solving, and adaptive learning responses |
| **Mathematical Rendering** | KaTeX + React | Real-time LaTeX rendering with custom math builder modals for complex physics equations |
| **Immersive UI** | Canvas API + Framer Motion | Multi-layered parallax space background with customizable effects and smooth animations |
| **Real-time Sync** | Cloud Firestore | Optimistic updates, offline support, and real-time collaboration with efficient query patterns |
| **Type-Safe Forms** | React Hook Form + Zod | Runtime validation with TypeScript inference for bulletproof form handling |
| **Role-Based Access** | Firebase Auth + Middleware | Server-side authentication with granular permission controls and route protection |
| **AI Navigation Assistant** | Gemini + Custom UI | Redesigned chatbot for intuitive platform guidance and help |
| **File Submissions** | Base64 Storage | Student work uploads compatible with Firebase Spark plan |

## Teacher Workflow

The platform is built around how teachers actually work:

- **Assignment Creation** - Rich text editor with integrated math builder, PDF uploads, and customizable grading rubrics
- **Filtering & Organization** - Sort and filter assignments with intuitive dropdown controls
- **Flexible Grading** - AI-assisted feedback with manual override capabilities and batch processing for efficiency
- **Student Analytics** - Real-time dashboards showing submission status, grade distributions, and individual progress
- **Resource Management** - Centralized library for course materials with tagging, search, and Google Form embedding

## Student Experience

Students get tools that support independent learning:

- **Interactive Assignments** - Submit work with LaTeX support, file attachments, and ability to track revisions
- **AI Tutor** - Conversational interface that remembers context, provides hints without giving answers, and adapts to individual learning patterns
- **Progress Tracking** - Clear view of grades, upcoming assignments, and submission history
- **Resource Access** - Searchable library of teacher-provided materials and study guides

---

## Technical Architecture

### Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | Next.js 15 + React 19 | Server Components, App Router, and concurrent rendering for optimal performance |
| **Language** | TypeScript 5.7 | End-to-end type safety with strict mode and path aliases |
| **Authentication** | Firebase Auth | JWT-based authentication with role claims and session management |
| **Database** | Cloud Firestore | NoSQL document store with real-time listeners and composite indexes |
| **AI/ML** | Google Gemini 2.0 Flash | Multi-modal AI for text generation, tutoring, and document analysis |
| **Document Processing** | PDF.js + Canvas API | Client-side PDF rendering, image extraction, and OCR preparation |
| **Styling** | Tailwind CSS + OKLCH | Utility-first CSS with perceptually uniform color space |
| **Components** | shadcn/ui + Radix UI | Headless, accessible components with custom theming |
| **Math Rendering** | KaTeX + remark-math | Fast LaTeX rendering with SSR support and custom macros |
| **Animations** | Framer Motion | Declarative animations with spring physics and gesture support |
| **Forms** | React Hook Form + Zod | Uncontrolled inputs with schema validation and TypeScript inference |
| **State Management** | React Context + Hooks | Collocated state with custom hooks for auth and theme |
| **Icons** | Lucide React | Tree-shakeable icon library with consistent styling |

### Design System

**Space Theme**  
The interface uses a procedurally-generated space background that provides visual interest without competing for attention:

| Component | Implementation | Technical Details |
|-----------|---------------|-------------------|
| **Space Background** | Canvas API + RequestAnimationFrame | Multi-layered parallax starfield with 200+ animated stars, optimized rendering with culling |
| **Parallax Layers** | Transform3D + CSS Variables | Three depth layers (0.2x, 0.5x, 1.0x speed) creating immersive depth perception |
| **Performance** | React Context + useMemo | Centralized animation loop, memoized calculations, 60fps rendering |
| **Adaptive Opacity** | CSS Custom Properties | Dynamic opacity based on theme (50% light, 70% dark) for optimal contrast |
| **Customization** | Dynamic Controls | Adjustable "spacy level" and nebula brightness (default: 12) for personalized experience |

**Color System**  
Built on OKLCH color space for perceptually uniform colors:

| Theme | Technique | Benefits |
|-------|-----------|----------|
| **OKLCH Color Space** | Perceptual uniformity | Colors appear equally bright regardless of hue, better than HSL/RGB |
| **Light Mode** | High contrast (0.99/0.09) | Maximum readability with subtle grays for hierarchy |
| **Dark Mode** | Deep space aesthetic (0.09/0.99) | Reduced eye strain with AMOLED-friendly true blacks, set as default |
| **Theme Switching** | View Transitions API | Smooth morphing between themes without layout shift |
| **System Detection** | prefers-color-scheme | Auto-detect OS preference with localStorage persistence |
| **Favicon Integration** | Dynamic Icons | Light and dark mode favicon toggles for system consistency |

**Component Design**

| Principle | Implementation | Impact |
|-----------|---------------|--------|
| **Composition over Inheritance** | Radix UI primitives + custom logic | Flexible, reusable components without prop drilling |
| **Headless UI Pattern** | Separate logic from presentation | Accessible by default, easy to style and customize |
| **Responsive Design** | Mobile-first + Tailwind breakpoints | Single codebase scales from 320px to 4K displays |
| **Type Safety** | TypeScript strict mode + discriminated unions | Catch errors at compile time, better IDE support |
| **Accessibility** | ARIA labels + keyboard navigation | WCAG 2.1 Level AA compliant, screen reader tested |

---

## Project Structure

```
src/
├── app/
│   ├── login/          # Authentication pages with space theme
│   ├── signup/
│   ├── student/        # Student portal
│   │   ├── assignments/
│   │   ├── assignment-view/
│   │   ├── grades/     # Enhanced graded copy display
│   │   ├── resources/
│   │   ├── submissions/
│   │   └── tutor/      # AI tutor with conversation context
│   └── teacher/        # Teacher portal
│       ├── assignments/ # With filtering/sorting dropdowns
│       ├── assignment-view/
│       ├── create/     # Assignment creation
│       ├── grades/
│       ├── students/
│       ├── submission/
│       └── uploads/
├── components/
│   ├── ui/            # shadcn/ui components
│   ├── math-builder-modal.tsx  # Modal-based equation builder
│   ├── math-input.tsx
│   ├── navigation-chatbot.tsx  # AI-powered redesign
│   ├── protected-route.tsx
│   └── space-background.tsx    # Dynamic starfield with effects
├── contexts/
│   └── auth-context.tsx
├── hooks/
│   └── use-mobile.ts
└── lib/
    ├── firebase.ts    # Firebase configuration
    ├── gemini.ts      # AI helper functions
    └── utils.ts
```

---

## Implementation Details

### Mathematical Rendering Engine

| Component | Technology | Technical Approach |
|-----------|-----------|-------------------|
| **Real-time LaTeX** | KaTeX + React | Fast, server-side compatible math rendering without MathJax bloat |
| **Math Builder UI** | Custom Modal Component | Visual interface for constructing equations with LaTeX preview |
| **Equation Parsing** | remark-math + rehype-katex | Unified pipeline for Markdown→Math AST→Rendered HTML |
| **Custom Macros** | KaTeX Macros | Physics-specific shortcuts (e.g., `\vec`, `\unit`, `\deriv`) |
| **Copy-Paste Support** | Clipboard API | Preserve LaTeX source when copying rendered equations |

### AI Tutoring System

The tutoring system is designed to guide students without providing direct answers:

| Feature | Implementation | Benefit |
|---------|---------------|---------|
| **Context Awareness** | Conversation History + Assignment Context | AI references previous questions and assignment details for coherent tutoring |
| **Conversation Memory** | Firestore Message History | Persistent chat sessions with efficient pagination and caching |
| **Adaptive Responses** | Temperature Tuning (0.7) | Balanced creativity and accuracy for educational explanations |
| **Step-by-Step Guidance** | Structured Prompts | AI breaks down problems into manageable steps without giving direct answers |
| **Physics Domain Expertise** | Domain-Specific System Prompts | Constrained to physics topics with proper terminology and notation |
| **Multi-Turn Conversations** | Context Injection | Maintains coherent dialogue across sessions |

### Security Architecture

| Layer | Implementation | Security Features |
|-------|---------------|-------------------|
| **JWT Tokens** | Firebase Auth | Signed tokens with role claims, auto-refresh, and secure transmission |
| **Role-Based Access Control** | Custom Claims + Middleware | Server-side route protection with granular permissions (teacher/student) |
| **Protected Routes** | HOC Pattern + useAuth Hook | Client-side route guards with loading states and redirect logic |
| **Session Management** | Firebase onAuthStateChanged | Real-time auth state synchronization across tabs and devices |
| **Secure API Calls** | Server Actions + Auth Context | Validate user identity on every mutation, prevent CSRF attacks |

---

## Data Model

Firestore collections:

- `teachers` - Teacher profiles and metadata
- `students` - Student profiles and class associations
- `assignments` - Physics assignments created by teachers
- `submissions` - Student assignment submissions with base64 file storage
- `resources` - Educational materials and uploads
- `conversations` - AI tutor chat history with conversation context

---

## Security

This platform is built for Sage Ridge School's internal use. Security measures include:

- Role-based access control with JWT authentication
- Server-side validation on all database operations
- Protected routes with middleware enforcement
- Real-time auth state synchronization
- CSRF protection through Firebase Security Rules

---

Built by Rushil Mahadevu for Sage Ridge School