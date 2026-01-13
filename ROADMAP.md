# Scorpio Roadmap: The Future of Physics Education

This roadmap outlines the improved architecture and feature set for Scorpio, transforming it into an industry-grade Learning Management System (LMS) specifically tailored for high-school physics.

Based on deep research into Canvas architecture and physics-specific constraints, this plan prioritizes module-based progression, CAS-backed grading, and deep LTI integrations.

## Phase 1: Core Architecture Re-design (The Canvas Model)
*Goal: Move from a file repository model to a rigid, scalable Module-based progression system.*
*Implementation Details: See [DATA_MODEL.md](DATA_MODEL.md)*

- [ ] **Hierarchy Restructuring**
    - Implement **Global Level** for District/Department standards and Question Banks.
    - Create **Blueprint Courses** ("Master Courses") that sync content to individual teacher sections.
    - Develop **Module Level** backbone with strict prerequisite locking (e.g., must score >80% on "Forces" to unlock "Energy").

- [ ] **Advanced Role-Based Access Control (RBAC)**
    - **Master Teacher:** Permission to push updates to all Blueprint sections.
    - **Lab TA:** Restricted grading permissions (can grade "Lab" tag, cannot view "Exams").
    - **Parent/Observer:** View deadlines/grades without accessing secure quiz content.
    - **Lab Partner (Student):** Enable "Group Co-submission" where one upload counts for multiple gradebooks.

## Phase 2: Other-Worldly Assessment Engine
*Goal: Move beyond multiple choice into physics-aware evaluation.*

- [ ] **Computer Algebra System (CAS) Integration**
    - Differentiate between equivalent expressions (e.g., `1/2 k x^2` vs `0.5 k x^2`).
    - Smart unit conversion grading (accept `100 cm` or `1 m`).

- [ ] **Dynamic Question Generation**   
    - Algorithmic generation of variables for every student instance to prevent answer sharing.
    - "Check My Work" feature with AI-generated hints based on the specific numbers the student received.

## Phase 3: Specialized Experimentation Modules
*Goal: Digital tools for physical labs.*

- [ ] **Digital Lab Notebook**
    - Collaborative real-time data entry// filepath: /Users/rushilmahadevu/source/typescript/scorpio/ROADMAP.md