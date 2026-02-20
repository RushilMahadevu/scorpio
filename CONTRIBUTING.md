# Contributing to Scorpio

Thank you for your interest in Scorpio! We welcome contributions to help improve our AI-driven physics tutoring platform. By contributing, you are helping us build a system that ensures AI serves as a tutor, not a ghostwriter.

## ⚖️ Pedagogical Principles
All contributions must align with our core tutoring philosophy:
*   **0% Direct Answer Rate (DAR)**: For numerical physics problems, the AI must never provide the final answer. It should guide the student through derivations.
*   **Socratic Scaffolding**: Prompt improvements should focus on guided discovery and "scaffolding" rather than direct instruction.
*   **The 4-Layer Constraint System**: Any changes to the AI logic must respect the Domain, Pedagogical, Notation, and Composite layers as defined in [LAYERING.MD](LAYERING.MD).

## 🚀 Getting Started

1.  **Fork the repository** to your own GitHub account.
2.  **Clone the repository**:
    ```bash
    git clone https://github.com/RushilMahadevu/scorpio.git
    cd scorpio
    ```
3.  **Install dependencies**:
    ```bash
    npm install
    ```
4.  **Create a new branch** for your feature or bug fix:
    ```bash
    git checkout -b feature/your-feature-name
    ```

## 🛠️ Development

-   **Environment Variables**: Create a `.env.local` file as described in the [README.md](README.md).
-   **Math Rendering**: If you are working on the UI, ensure all physics equations use **KaTeX** formatting. Raw text for formulas is not permitted.
-   **Run Development Server**:
    ```bash
    npm run dev
    ```
-   **Run Tests**:
    ```bash
    npm test
    ```

## 📝 Contribution Guidelines

### Bug Reports
If you find a bug (especially if you find a way to "jailbreak" the AI into giving direct answers), please open an issue. These "DAR breaches" are considered high-priority bugs.

### Feature Requests
We're looking for features that:
*   Improve LaTeX accessibility and rendering.
*   Enhance the Teacher Dashboard for identifying "learning gaps."
*   Strengthen the AI's adherence to Socratic rules.

### Pull Requests
-   **Tests Required**: For AI-related changes, include test cases showing that the Socratic constraints remain intact.
-   **Notation Check**: Ensure all unit labels and vector notations follow standard physics conventions.
-   Provide a clear description of the changes and how they serve the project's mission.

## ⚖️ License
By contributing to Scorpio, you agree that your contributions will be licensed under the project's [MIT License](LICENSE).

