import sys
import re

def update_readme(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Define the new Mermaid diagram content
    new_mermaid = """graph TD
    classDef client fill:#e1f5fe,stroke:#01579b,stroke-width:2px,color:#01579b;
    classDef crux fill:#f3e5f5,stroke:#4a148c,stroke-width:2px,color:#4a148c;
    classDef backend fill:#fff3e0,stroke:#e65100,stroke-width:2px,color:#e65100;
    classDef external fill:#e8f5e9,stroke:#1b5e20,stroke-width:2px,color:#1b5e20;

    subgraph Client ["Frontend (Next.js 16)"]
        UI[User Interface / React Components]:::client
        Editor[Rich Text Editor / Math Builder]:::client
        Context[Auth & State Contexts]:::client
        Listen["Firestore Real-time Listeners (onSnapshot)"]:::client
    end

    subgraph Crux ["Crux AI Engine (Pedagogical Layer)"]
        Sanitize[PII Scrubber / FERPA Compliance]:::crux
        Layer1[Layer 1: Domain Constraint]:::crux
        Layer2[Layer 2: Pedagogical Discovery]:::crux
        Layer3[Layer 3: Notation & LaTeX]:::crux
        Layer4[Layer 4: Socratic Interaction]:::crux
        Logic[Business Logic / src/lib/ai]:::crux
        Compose[System Prompt Orchestration]:::crux
    end

    subgraph Backend ["Cloud Infrastructure (Firebase)"]
        Auth[Firebase Auth]:::backend
        Firestore[(Cloud Firestore - NoSQL)]:::backend
        Storage[Firebase Storage - Assets]:::backend
        Functions[Cloud Functions - Background Tasks]:::backend
        Event["EventArc V2 / Triggers"]:::backend
    end

    subgraph External ["External Services"]
        Gemini[Google Gemini 2.5 Flash]:::external
        Polar[Polar.sh - Subscriptions]:::external
        Resend[Resend API - Email]:::external
        Vertex[Vertex AI - Enterprise ML]:::external
    end

    %% Interactions
    UI --> Editor
    Editor --> Sanitize
    Sanitize --> Layer1
    Layer1 --> Layer2
    Layer2 --> Layer3
    Layer3 --> Layer4
    Layer4 --> Logic
    Logic --> Compose
    Compose --> Gemini
    Gemini --> UI

    UI --> Auth
    Auth --> Firestore
    UI --> Context
    Context <--> Listen
    Listen <--> Firestore

    Firestore -- "Event Trigger" --> Event
    Event --> Functions
    Functions --> Resend
    Functions -- "AI Grading" --> Gemini
    Functions -- "Enterprise Inference" --> Vertex
    
    UI --> Polar
    Polar -- "Webhook" --> Functions
    Functions --> Firestore"""

    content = re.sub(r'### .* System Data Flow', '### 🔄 System Data Flow', content)
    mermaid_pattern = re.compile(r'```mermaid\n(.*?)\n```', re.DOTALL)
    content = mermaid_pattern.sub(f'```mermaid\\n{new_mermaid}\\n```', content, count=1)
    content = re.sub(r'### .*🛡️ The 4-Layer Constraint System', '### 🛡️ The 4-Layer Constraint System', content)

    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)

if __name__ == "__main__":
    update_readme("README.md")
