# Physics Platform (Scorpio)

A comprehensive educational platform built with Next.js 16 for physics teachers and students, featuring AI-powered tutoring, assignment management, and real-time collaboration.

## Features

### For Teachers
- **Assignment Management**: Create, distribute, and track physics assignments
- **Student Management**: Monitor student progress and performance
- **Grading System**: Review and grade student submissions with detailed feedback
- **Resource Uploads**: Share educational materials and resources
- **Analytics Dashboard**: View statistics on assignments, submissions, and student engagement

### For Students
- **Assignment Viewer**: Access and complete assigned physics problems
- **AI Tutor**: Get step-by-step explanations of physics concepts powered by Google Gemini 2.5
- **Submission Tracking**: Submit work and track submission history
- **Grades Portal**: View grades and feedback from teachers
- **Resources Library**: Access educational materials shared by teachers

### Core Capabilities
- **Math Support**: LaTeX/KaTeX rendering for complex physics equations
- **AI-Powered Assistance**: Google Gemini integration for concept explanations and problem-solving
- **Role-Based Access**: Separate portals for teachers and students
- **Real-time Updates**: Firebase-powered backend for instant synchronization
- **Responsive Design**: Modern UI with dark mode support
- **Markdown Support**: Rich text formatting for assignments and submissions

## Tech Stack

- **Framework**: Next.js 16 with App Router and React 19
- **Authentication**: Firebase Authentication
- **Database**: Cloud Firestore
- **AI Integration**: Google Gemini AI (via Firebase AI)
- **Styling**: Tailwind CSS with shadcn/ui components
- **Math Rendering**: KaTeX with remark-math and rehype-katex
- **Forms**: React Hook Form with Zod validation
- **Animations**: Framer Motion
- **Icons**: Lucide React

## Design & Theme

### Visual Identity
The platform features a **space-themed design** that reflects the astronomical nature of the project name "Scorpio" and creates an engaging educational environment:

- **Animated Space Background**: A subtle, multi-layered starfield with animated drift effects that creates depth and movement
- **Custom Logos**: 
  - **Orbit Logo**: Atomic/orbital visualization representing physics concepts
  - **Compass Logo**: Navigation and guidance symbolism for the learning journey

### Color System
Built on **OKLCH color space** for perceptually uniform colors across the interface:

- **Light Mode**: Clean, bright interface with high contrast for readability
  - Background: Near-white (oklch 0.99)
  - Foreground: Near-black (oklch 0.09)
  - Subtle grays for secondary elements

- **Dark Mode**: Deep space aesthetic with comfortable contrast
  - Background: Deep black (oklch 0.09)
  - Foreground: Near-white (oklch 0.99)
  - Muted colors for reduced eye strain

- **Adaptive Opacity**: Space background reduces opacity in light mode (50%) and increases in dark mode (70%) for optimal visibility

### Theme Features
- **Seamless Theme Switching**: View transitions API for smooth light/dark mode changes
- **System Preference Detection**: Automatically matches user's OS theme preference
- **Persistent Preferences**: Theme choice saved across sessions
- **Accessible Contrast**: WCAG-compliant color ratios for all text elements

### Component Design Philosophy
- **shadcn/ui**: High-quality, accessible components with consistent styling
- **Responsive Layout**: Mobile-first design adapting to all screen sizes
- **Modern Aesthetics**: Clean, minimal interface that doesn't distract from learning
- **Physics-Appropriate**: Professional appearance suitable for educational use

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

## Key Features Implementation

### AI Tutoring
The platform integrates Google Gemini AI for:
- Explaining physics concepts in simple terms
- Providing step-by-step problem-solving guidance
- Answering student questions about physics topics

### Math Rendering
Mathematical equations are rendered using KaTeX, supporting:
- Inline math expressions
- Block-level equations
- Complex physics formulas

### Authentication Flow
1. Users sign up as either teacher or student
2. Role-based routing to appropriate dashboard
3. Protected routes ensure secure access
4. Firebase Authentication handles session management

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
