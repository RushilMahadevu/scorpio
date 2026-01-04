# <img src="./public/favicon.svg" alt="Scorpio Logo" width="32" /> Scorpio

**Next-Generation Physics Learning Environment**

Scorpio is a research-driven educational platform engineered to transform physics instruction. By integrating a novel 4-layer AI constraint architecture with a high-performance, space-themed interface, Scorpio bridges the gap between traditional Learning Management Systems (LMS) and the dynamic cognitive requirements of physics problem-solving.

It is designed not merely as a tool for assignment submission, but as an intelligent pedagogical agent that facilitates Socratic learning, real-time collaboration, and advanced mathematical communication.

---

## 🏗️ Technical Architecture

Scorpio is built upon a sophisticated stack designed for concurrency, type safety, and real-time data synchronization.

### The 4-Layer Constraint System
At the heart of Scorpio's AI tutoring capabilities is a proprietary constraint architecture designed to prevent hallucination and ensure pedagogical validity. Unlike standard LLM wrappers, Scorpio utilizes a multi-stage prompt engineering strategy powered by **Google Gemini 2.5 Flash**.

[**📄 View System Architecture (PDF)**](./public/architecture.pdf)

The system enforces strict adherence through four distinct layers:
1.  **Domain Constraint:** Restricts the model's knowledge base exclusively to physics principles, rejecting non-relevant queries.
2.  **Pedagogical Constraint:** Enforces the Socratic method. The AI is prohibited from providing direct answers, instead guiding students through conceptual decomposition.
3.  **Notation Constraint:** Mandates the use of proper LaTeX formatting and SI units in all responses.
4.  **Full Constraint Stack:** A composite of all layers, delivering a research-grade tutoring experience that mimics expert human instruction.

### Data & Synchronization
*   **Real-Time State:** Powered by **Cloud Firestore**, the platform utilizes optimistic UI updates to ensure zero-latency interaction for students and teachers, even on unstable networks.
*   **Asset Management:** Student submissions (PDFs, images) are processed client-side and stored securely using optimized base64 encoding and **Firebase Storage**, ensuring data integrity and rapid retrieval.

---

## 🚀 Core Capabilities

### Research-Grade AI Tutoring
Scorpio's "AI Tutor" is not a chatbot; it is a context-aware educational assistant.
*   **Context Retention:** Remembers the specific assignment and problem context during a session.
*   **Adaptive Guidance:** Dynamically adjusts the complexity of hints based on student performance.
*   **Guardrails:** Rigorously tested against "jailbreak" attempts to ensure academic integrity.

### Advanced Mathematical Rendering
Physics requires precise communication. Scorpio implements a custom rendering engine:
*   **KaTeX Integration:** High-performance, client-side LaTeX rendering for complex equations.
*   **Visual Math Builder:** A custom UI component allowing users to construct equations intuitively without raw LaTeX knowledge, bridging the technical barrier for students.

### Immersive User Experience
The interface is designed to reduce cognitive load and increase engagement through "Space-Themed" aesthetics.
*   **Parallax Depth:** Multi-layered background systems powered by **Framer Motion** create a sense of depth and immersion.
*   **Glassmorphism:** UI components utilize `backdrop-blur` and semi-transparent layers to maintain context while focusing attention.
*   **Accessibility:** Built on **Radix UI** primitives (via Shadcn UI) to ensure full keyboard navigation and screen reader support.

---

## 🔬 Research & Efficacy

Scorpio includes a dedicated research dashboard to monitor the performance of its AI architecture. System metrics track:
*   **Rule Adherence %:** The frequency with which the AI successfully maintains Socratic constraints.
*   **Response Quality:** Automated evaluation of pedagogical relevance.
*   **Token Efficiency:** Optimization of prompt length versus output quality.

*Data indicates that the Full Constraint Stack significantly outperforms standard models in educational utility, maintaining a high quality score across varying difficulty levels.*

---

## 🛠️ Technology Stack

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend** | Next.js 15 (App Router) | Server Components, Streaming, and Routing |
| **Language** | TypeScript 5.7 | Strict type safety and developer ergonomics |
| **Styling** | Tailwind CSS + OKLCH | Utility-first styling with perceptually uniform colors |
| **UI Library** | Shadcn UI + Radix | Accessible, headless component primitives |
| **Motion** | Framer Motion | Physics-based animations and gesture handling |
| **Backend** | Firebase (BaaS) | Auth, Firestore (NoSQL), Functions, Storage |
| **AI Model** | Google Gemini 2.5 Flash | Multimodal reasoning and constraint adherence |
| **Math** | KaTeX + remark-math | Fast, accessible equation rendering |

---

© 2025 Scorpio. Built for the advancement of physics education.
