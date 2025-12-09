# Physics Platform (Scorpio)

A modern, scalable educational platform built with Next.js 15 and React 19, featuring AI-powered tutoring, intelligent document processing, and immersive space-themed UI. Designed for physics teachers and students with a focus on clean architecture, type safety, and exceptional user experience.

## 🚀 Key Features

| Feature | Technology | Description |
|---------|-----------|-------------|
| **AI-Powered Tutoring** | Google Gemini 2.0 Flash | Context-aware explanations with step-by-step problem solving and adaptive learning responses |
| **Mathematical Rendering** | KaTeX + React | Real-time LaTeX rendering with custom math builder interface for complex physics equations |
| **Document Intelligence** | PDF.js + Gemini Vision | Extract and analyze content from PDFs and images with OCR and AI-powered content understanding |
| **Immersive UI** | Canvas API + Framer Motion | Multi-layered parallax space background with smooth animations and transitions |
| **Real-time Sync** | Cloud Firestore | Optimistic updates, offline support, and real-time collaboration with efficient query patterns |
| **Type-Safe Forms** | React Hook Form + Zod | Runtime validation with TypeScript inference for bulletproof form handling |
| **Role-Based Access** | Firebase Auth + Middleware | Server-side authentication with granular permission controls and route protection |

## 💡 Core Capabilities

### For Teachers
- **Assignment Creation**: Rich text editor with math builder, PDF uploads, and flexible grading rubrics
- **Intelligent Grading**: AI-assisted feedback generation and batch grading workflows
- **Student Analytics**: Real-time progress tracking with visual dashboards and performance insights
- **Resource Management**: Upload and organize educational materials with tagging and search

### For Students  
- **Interactive Assignments**: Submit work with LaTeX support, file attachments, and revision tracking
- **AI Tutor Chat**: Conversational interface with physics domain expertise and personalized hints
- **Progress Dashboard**: Visual grade tracking, assignment calendar, and submission history
- **Resource Library**: Searchable collection of teacher-shared materials and study guides

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | Next.js 15 + React 19 | Server Components, App Router, and concurrent rendering for optimal performance |
| **Language** | TypeScript 5.7 | End-to-end type safety with strict mode and path aliases |
| **Authentication** | Firebase Auth | JWT-based authentication with role claims and session management |
| **Database** | Cloud Firestore | NoSQL document store with real-time listeners and composite indexes |
| **AI/ML** | Google Gemini 2.0 Flash | Multi-modal AI for text generation, vision tasks, and document analysis |
| **Document Processing** | PDF.js + Canvas API | Client-side PDF rendering, image extraction, and OCR preparation |
| **Styling** | Tailwind CSS + OKLCH | Utility-first CSS with perceptually uniform color space |
| **Components** | shadcn/ui + Radix UI | Headless, accessible components with custom theming |
| **Math Rendering** | KaTeX + remark-math | Fast LaTeX rendering with SSR support and custom macros |
| **Animations** | Framer Motion | Declarative animations with spring physics and gesture support |
| **Forms** | React Hook Form + Zod | Uncontrolled inputs with schema validation and TypeScript inference |
| **State Management** | React Context + Hooks | Collocated state with custom hooks for auth and theme |
| **Icons** | Lucide React | Tree-shakeable icon library with consistent styling |

## 🎨 Design System & Architecture

### Immersive Space Theme
The platform features a **procedurally-generated space background** that creates an engaging, distraction-free learning environment:

| Component | Implementation | Technical Details |
|-----------|---------------|-------------------|
| **Space Background** | Canvas API + RequestAnimationFrame | Multi-layered parallax starfield with 200+ animated stars, optimized rendering with culling |
| **Parallax Layers** | Transform3D + CSS Variables | Three depth layers (0.2x, 0.5x, 1.0x speed) creating immersive depth perception |
| **Performance** | React Context + useMemo | Centralized animation loop, memoized calculations, 60fps rendering |
| **Adaptive Opacity** | CSS Custom Properties | Dynamic opacity based on theme (50% light, 70% dark) for optimal contrast |

### Color Science
Built on **OKLCH color space** for perceptually uniform colors and consistent lightness across hues:

| Theme | Technique | Benefits |
|-------|-----------|----------|
| **OKLCH Color Space** | Perceptual uniformity | Colors appear equally bright regardless of hue, better than HSL/RGB |
| **Light Mode** | High contrast (0.99/0.09) | Maximum readability with subtle grays for hierarchy |
| **Dark Mode** | Deep space aesthetic (0.09/0.99) | Reduced eye strain with AMOLED-friendly true blacks |
| **Theme Switching** | View Transitions API | Smooth morphing between themes without layout shift |
| **System Detection** | prefers-color-scheme | Auto-detect OS preference with localStorage persistence |

### Component Architecture

| Principle | Implementation | Impact |
|-----------|---------------|--------|
| **Composition over Inheritance** | Radix UI primitives + custom logic | Flexible, reusable components without prop drilling |
| **Headless UI Pattern** | Separate logic from presentation | Accessible by default, easy to style and customize |
| **Responsive Design** | Mobile-first + Tailwind breakpoints | Single codebase scales from 320px to 4K displays |
| **Type Safety** | TypeScript strict mode + discriminated unions | Catch errors at compile time, better IDE support |
| **Accessibility** | ARIA labels + keyboard navigation | WCAG 2.1 Level AA compliant, screen reader tested |

## Project Structure

```
src/
├── app/
│   ├── login/          # Login page
│   ├── signup/         # Registration page
│   ├── student/        # Student portal
│   │   ├── assignments/
│   │   ├── assignment-view/
│   │   ├── grades/
│   │   ├── resources/
│   │   ├── submissions/
│   │   └── tutor/      # AI tutor interface
│   └── teacher/        # Teacher portal
│       ├── assignments/
│       ├── assignment-view/
│       ├── create/     # Assignment creation
│       ├── grades/
│       ├── students/
│       ├── submission/
│       └── uploads/
├── components/
│   ├── ui/            # shadcn/ui components
│   ├── math-builder-modal.tsx
│   ├── math-input.tsx
│   ├── navigation-chatbot.tsx
│   └── protected-route.tsx
├── contexts/
│   └── auth-context.tsx
├── hooks/
│   └── use-mobile.ts
└── lib/
    ├── firebase.ts    # Firebase configuration
    ├── gemini.ts      # AI helper functions
    └── utils.ts
```

## Getting Started

### Prerequisites

- Node.js 20+
- npm, yarn, pnpm, or bun
- Firebase project with:
  - Authentication enabled
  - Firestore database
  - Firebase AI (Gemini API)

### Environment Variables

Create a `.env.local` file in the root directory:

```bash
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd physics-platform
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

### Build for Production

```bash
npm run build
npm start
```

## Firebase Deployment

The project is configured for Firebase Hosting:

```bash
npm run build
firebase deploy
```

## Firestore Collections

The application uses the following Firestore collections:

- `teachers`: Teacher profiles and metadata
- `students`: Student profiles and class associations
- `assignments`: Physics assignments created by teachers
- `submissions`: Student assignment submissions
- `resources`: Educational materials and uploads

## 🧠 Advanced Features & Implementation

### AI-Powered Document Intelligence

| Feature | Technology Stack | Implementation Details |
|---------|-----------------|----------------------|
| **PDF Processing** | PDF.js + Canvas Rendering | Client-side PDF parsing, page-by-page rendering with image extraction |
| **Image Analysis** | Gemini Vision API | Multi-modal AI analyzes images and PDFs to extract physics problems, diagrams, and equations |
| **OCR & Text Extraction** | Canvas→Base64→Gemini | Convert PDF pages to images, process with vision model for accurate text extraction |
| **Smart Content Understanding** | Prompt Engineering | Context-aware prompts guide AI to identify problem statements, variables, and solution steps |
| **Assignment Generation** | Structured Output | AI extracts problems from documents and formats them into assignment templates |

### Mathematical Rendering Engine

| Component | Technology | Technical Approach |
|-----------|-----------|-------------------|
| **Real-time LaTeX** | KaTeX + React | Fast, server-side compatible math rendering without MathJax bloat |
| **Math Builder UI** | Custom Modal Component | Visual interface for constructing equations with LaTeX preview |
| **Equation Parsing** | remark-math + rehype-katex | Unified pipeline for Markdown→Math AST→Rendered HTML |
| **Custom Macros** | KaTeX Macros | Physics-specific shortcuts (e.g., `\vec`, `\unit`, `\deriv`) |
| **Copy-Paste Support** | Clipboard API | Preserve LaTeX source when copying rendered equations |

### Intelligent AI Tutoring System

| Feature | Implementation | Benefit |
|---------|---------------|---------|
| **Context Awareness** | Conversation History + Assignment Context | AI references previous questions and assignment details for coherent tutoring |
| **Adaptive Responses** | Temperature Tuning (0.7) | Balanced creativity and accuracy for educational explanations |
| **Step-by-Step Guidance** | Structured Prompts | AI breaks down problems into manageable steps without giving direct answers |
| **Physics Domain Expertise** | Domain-Specific System Prompts | Constrained to physics topics with proper terminology and notation |
| **Multi-Turn Conversations** | Firestore Message History | Persistent chat sessions with efficient pagination and caching |

### Authentication & Security Architecture

| Layer | Implementation | Security Features |
|-------|---------------|-------------------|
| **JWT Tokens** | Firebase Auth | Signed tokens with role claims, auto-refresh, and secure transmission |
| **Role-Based Access Control** | Custom Claims + Middleware | Server-side route protection with granular permissions (teacher/student) |
| **Protected Routes** | HOC Pattern + useAuth Hook | Client-side route guards with loading states and redirect logic |
| **Session Management** | Firebase onAuthStateChanged | Real-time auth state synchronization across tabs and devices |
| **Secure API Calls** | Server Actions + Auth Context | Validate user identity on every mutation, prevent CSRF attacks |

## Development

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## Contributing

This is an educational platform project. Contributions should focus on:
- Improving physics education features
- Enhancing AI tutoring capabilities
- Better user experience for teachers and students
- Performance optimizations

## License

Private project for educational purposes.
