import type { StudentPortfolio } from "@/lib/types";

export interface PreviewCourse {
  id: string;
  name: string;
  code: string;
  restrictedFormulaIds?: string[];
  customFormulas?: PreviewFormula[];
}

export const initialCourses: PreviewCourse[] = [
  { id: "mechanics", name: "AP Physics 1 — Period 2", code: "AP1P2X", restrictedFormulaIds: ["k3"] },
  { id: "em", name: "AP Physics C: E&M", code: "APCE4M", restrictedFormulaIds: [] },
  { id: "foundations", name: "Honors Physics", code: "HPHY09", restrictedFormulaIds: [] },
];

export interface PreviewStudent {
  id: string;
  name: string;
  email: string;
  courseId: string;
  createdAt: string;
}

export const initialStudents: PreviewStudent[] = [
  { id: "avery", name: "Avery Brooks", email: "abrooks@example.com", courseId: "mechanics", createdAt: "2026-09-02" },
  { id: "jordan", name: "Jordan Rivera", email: "jrivera@example.com", courseId: "mechanics", createdAt: "2026-09-02" },
  { id: "chloe", name: "Chloe Lindqvist", email: "clindqvist@example.com", courseId: "mechanics", createdAt: "2026-09-03" },
  { id: "liam", name: "Liam Nakamura", email: "lnakamura@example.com", courseId: "em", createdAt: "2026-09-02" },
  { id: "sam", name: "Sam Patel", email: "spatel@example.com", courseId: "foundations", createdAt: "2026-09-04" },
  { id: "marcus", name: "Marcus Vance", email: "mvance@example.com", courseId: "foundations", createdAt: "2026-09-05" },
];

export const initialPortfolios: Record<string, StudentPortfolio> = {
  avery: {
    studentId: "avery",
    teacherId: "t-mchen84a",
    organizationId: "demo-phys-8492a",
    masteryLevel: "Expert",
    strengths: [
      "Proactive vector decomposition on inclined planes",
      "Demonstrates symbolic manipulation before numerical substitution",
      "Able to connect work-energy theorem to non-conservative forces",
      "Clear free-body diagram isolation",
    ],
    weaknesses: [
      "Needs occasional prompting on rotational sign conventions",
      "Holds minor uncertainty on impulse-momentum area bounds",
    ],
    aiSummary:
      "Avery consistently constructs symbolic derivations before substituting values. Across 18 Raise sessions, Avery resolved multi-body tension and ramp problems after a single conceptual prompt on coordinate axis orientation.",
    lastUpdated: new Date("2026-11-08T14:22:00Z"),
  },
  jordan: {
    studentId: "jordan",
    teacherId: "t-mchen84a",
    organizationId: "demo-phys-8492a",
    masteryLevel: "Advanced",
    strengths: [
      "Strong conservation of mechanical energy setup",
      "Accurately interprets velocity-time graph slopes and areas",
      "Identifies Newton's third-law action-reaction pairs",
      "Consistent dimensional analysis checks",
    ],
    weaknesses: [
      "Conflates applied push force with net force when friction acts",
      "Omits direction vectors in 2D momentum conservation",
      "Prematurely rounds intermediate trigonometric values",
    ],
    aiSummary:
      "Jordan demonstrates strong physical intuition in energy and kinematics. In dynamics problems, Raise guided Jordan to explicitly sum horizontal forces before applying ΣF = ma, improving first-attempt accuracy from 65% to 92%.",
    lastUpdated: new Date("2026-11-08T11:15:00Z"),
  },
  chloe: {
    studentId: "chloe",
    teacherId: "t-mchen84a",
    organizationId: "demo-phys-8492a",
    masteryLevel: "Advanced",
    strengths: [
      "Translates motion narratives into accurate kinematic equations",
      "Distinguishes static vs. kinetic friction thresholds",
      "Applies centripetal acceleration constraints on banked curves",
    ],
    weaknesses: [
      "Needs scaffolding when coupling rotational torque with linear acceleration",
      "Occasionally drops negative signs in gravitational potential energy reference frames",
      "Hesitates on variable-force work integrals",
    ],
    aiSummary:
      "Chloe engages thoughtfully with Socratic hints, frequently testing limiting cases (θ → 0 and θ → 90°) to verify her symbolic expressions during Raise sessions.",
    lastUpdated: new Date("2026-11-07T16:40:00Z"),
  },
  liam: {
    studentId: "liam",
    teacherId: "t-mchen84a",
    organizationId: "demo-phys-8492a",
    masteryLevel: "Expert",
    strengths: [
      "Selects optimal Gaussian surfaces for cylindrical and spherical symmetry",
      "Executes line integrals for electric potential without sign errors",
      "Relates field-line flux density to enclosed charge distributions",
      "Rapidly diagnoses RC circuit transient boundary conditions",
    ],
    weaknesses: [
      "Needs refinement setting integration limits on finite charged rods",
      "Occasionally skips explicit unit-vector notation in Coulomb superpositions",
    ],
    aiSummary:
      "Liam operates at a collegiate calculus-based physics level, using Raise primarily to stress-test boundary conditions on non-uniform charge distributions and dielectric interfaces.",
    lastUpdated: new Date("2026-11-08T09:50:00Z"),
  },
  sam: {
    studentId: "sam",
    teacherId: "t-mchen84a",
    organizationId: "demo-phys-8492a",
    masteryLevel: "Intermediate",
    strengths: [
      "Reads position-time and velocity-time slopes accurately",
      "Correctly identifies gravitational and normal forces on flat surfaces",
      "Substitutes known kinematic quantities with proper SI units",
    ],
    weaknesses: [
      "Needs support isolating simultaneous two-equation systems",
      "Struggles to separate horizontal and vertical projectile components",
      "Tends to set normal force equal to mg on inclined surfaces",
    ],
    aiSummary:
      "Sam is progressing steadily in Honors Physics. Guided questioning in Raise has helped Sam pause and list knowns/unknowns along independent x and y axes before choosing a kinematic equation.",
    lastUpdated: new Date("2026-11-06T15:10:00Z"),
  },
  marcus: {
    studentId: "marcus",
    teacherId: "t-mchen84a",
    organizationId: "demo-phys-8492a",
    masteryLevel: "Beginner",
    strengths: [
      "Proactive in asking clarifying conceptual questions",
      "Demonstrates steady improvement on 1D constant-acceleration problems",
      "Able to identify energy forms at qualitative system waypoints",
    ],
    weaknesses: [
      "Needs structured scaffolding before algebraic rearrangement",
      "Holds misconception that heavier objects fall faster in vacuum",
      "Exhibits sign reversals during deceleration intervals",
    ],
    aiSummary:
      "Marcus benefits significantly from Raise's step-by-step Socratic decomposition. Breaking multi-step word problems into free-body sketches first has reduced his algebraic setup errors.",
    lastUpdated: new Date("2026-11-05T13:30:00Z"),
  },
};

export interface Question {
  id: string;
  text: string;
  type: "text" | "short-answer" | "multiple-choice" | "true-false";
  options?: string[];
  correctAnswer?: string;
  points: number;
}

export interface Assignment {
  id: string;
  courseId: string;
  title: string;
  description: string;
  topic: string;
  due: string;
  timeLimit?: number | null;
  visibility: "private" | "network" | "global";
  questions: Question[];
  hints: boolean;
  calculator: boolean;
  requireWorkSubmission?: boolean;
  enableTabDetection?: boolean;
  lockdownMode?: boolean;
  waypoint?: string;
}

export const initialAssignments: Assignment[] = [
  {
    id: "forces",
    courseId: "mechanics",
    title: "Newtonian Dynamics & Free-Body Analysis",
    description: "Resolve all forces into orthogonal components before applying Newton's second law. Show full symbolic derivations.",
    topic: "dynamics",
    due: "2026-11-20",
    timeLimit: 45,
    visibility: "network",
    hints: true,
    calculator: true,
    requireWorkSubmission: true,
    enableTabDetection: true,
    lockdownMode: false,
    questions: [
      {
        id: "f-q1",
        text: "A $12\\text{ N}$ horizontal push moves a $2.0\\text{ kg}$ lab cart to the right across a track with a kinetic friction force of $4.0\\text{ N}$. Construct the horizontal net force equation $\\sum F_x = ma_x$ and determine the cart's acceleration.",
        type: "text",
        correctAnswer: "Net horizontal force: $\\sum F_x = F_{\\text{push}} - f_k = 12\\text{ N} - 4.0\\text{ N} = 8.0\\text{ N}$ to the right. By Newton's second law, $a_x = \\frac{\\sum F_x}{m} = \\frac{8.0\\text{ N}}{2.0\\text{ kg}} = 4.0\\text{ m/s}^2$ to the right.",
        points: 10,
      },
      {
        id: "f-q2",
        text: "A block of mass $m$ rests on a ramp inclined at angle $\\theta$ with coefficient of static friction $\\mu_s$. Which expression gives the magnitude of the normal force $N$ exerted by the ramp?",
        type: "multiple-choice",
        options: ["$mg$", "$mg\\cos\\theta$", "$mg\\sin\\theta$", "$\\mu_s mg\\cos\\theta$"],
        correctAnswer: "$mg\\cos\\theta$",
        points: 10,
      },
      {
        id: "f-q3",
        text: "Two blocks ($m_1 = 3.0\\text{ kg}$ and $m_2 = 5.0\\text{ kg}$) are connected by a massless string over a frictionless Atwood pulley. Derive the symbolic expression for the system's acceleration $a$ and compute its numerical value.",
        type: "text",
        correctAnswer: "Treating the two-block system together: $\\sum F_{\\text{ext}} = (m_2 - m_1)g = (m_1 + m_2)a \\implies a = \\frac{m_2 - m_1}{m_1 + m_2}g = \\frac{5.0 - 3.0}{8.0}(9.8\\text{ m/s}^2) = 2.45\\text{ m/s}^2$.",
        points: 10,
      },
    ],
  },
  {
    id: "energy",
    courseId: "mechanics",
    title: "Work-Energy Theorem & Ramp Conservation",
    description: "Analyze mechanical energy transfers and non-conservative work done by friction along inclined tracks.",
    topic: "energy",
    due: "2026-11-18",
    timeLimit: 40,
    visibility: "private",
    hints: true,
    calculator: true,
    requireWorkSubmission: false,
    enableTabDetection: true,
    lockdownMode: true,
    questions: [
      {
        id: "e-q1",
        text: "A $1.5\\text{ kg}$ glider is released from rest at height $h = 0.80\\text{ m}$ on a frictionless air track. Using conservation of mechanical energy $\\Delta K + \\Delta U_g = 0$, find its speed at the bottom of the ramp.",
        type: "text",
        correctAnswer: "By conservation of energy: $mgh = \\frac{1}{2}mv^2 \\implies v = \\sqrt{2gh} = \\sqrt{2(9.8\\text{ m/s}^2)(0.80\\text{ m})} = 3.96\\text{ m/s}$.",
        points: 10,
      },
      {
        id: "e-q2",
        text: "If the ramp instead exerts a constant kinetic friction force $f_k$ over ramp length $L$, state the modified energy conservation equation relating initial potential energy $mgh$ to final kinetic energy $K_f$.",
        type: "short-answer",
        correctAnswer: "$K_f = mgh - f_k L$ (or $mgh = \\frac{1}{2}mv^2 + f_k L$).",
        points: 10,
      },
    ],
  },
  {
    id: "gauss",
    courseId: "em",
    title: "Gauss's Law & Cylindrical Charge Symmetry",
    description: "Evaluate closed surface flux integrals and derive electric field expressions for continuous charge distributions.",
    topic: "em",
    due: "2026-11-22",
    timeLimit: 50,
    visibility: "global",
    hints: true,
    calculator: false,
    requireWorkSubmission: true,
    enableTabDetection: true,
    lockdownMode: false,
    questions: [
      {
        id: "g-q1",
        text: "An infinitely long non-conducting cylinder of radius $R$ carries a uniform volume charge density $\\rho$. Using Gauss's Law $\\oint \\vec{E}\\cdot d\\vec{A} = \\frac{Q_{\\text{enc}}}{\\varepsilon_0}$, derive the electric field magnitude $E(r)$ for $r < R$.",
        type: "text",
        correctAnswer: "Choose a coaxial Gaussian cylinder of radius $r < R$ and length $L$. $Q_{\\text{enc}} = \\rho (\\pi r^2 L)$ and $\\oint \\vec{E}\\cdot d\\vec{A} = E(2\\pi r L)$. Thus $E(r) = \\frac{\\rho r}{2\\varepsilon_0}$.",
        points: 15,
      },
      {
        id: "g-q2",
        text: "Outside the cylinder ($r > R$), how does the electric field magnitude $E(r)$ scale with radial distance $r$?",
        type: "multiple-choice",
        options: ["$E \\propto r$", "$E \\propto 1/r$", "$E \\propto 1/r^2$", "$E$ is constant"],
        correctAnswer: "$E \\propto 1/r$",
        points: 10,
      },
    ],
  },
  {
    id: "motion",
    courseId: "foundations",
    title: "1D Kinematics: Motion Graphs & Equations",
    description: "Connect position-time, velocity-time, and acceleration-time graphs to constant-acceleration equations.",
    topic: "kinematics",
    due: "2026-11-06",
    timeLimit: 30,
    visibility: "private",
    hints: true,
    calculator: true,
    requireWorkSubmission: false,
    enableTabDetection: true,
    lockdownMode: false,
    questions: [
      {
        id: "m-q1",
        text: "A position-time graph $x(t)$ has a constant slope of $+3.0\\text{ m/s}$ from $t = 0\\text{ s}$ to $t = 6.0\\text{ s}$. Describe the object's velocity and acceleration over this interval and calculate its displacement $\\Delta x$.",
        type: "short-answer",
        correctAnswer: "Constant velocity $v = +3.0\\text{ m/s}$, acceleration $a = 0\\text{ m/s}^2$, and displacement $\\Delta x = v\\Delta t = 18\\text{ m}$.",
        points: 10,
      },
      {
        id: "m-q2",
        text: "The area bounded between a velocity-time curve $v(t)$ and the time axis over $\\Delta t$ represents the object's displacement $\\Delta x$.",
        type: "true-false",
        options: ["True", "False"],
        correctAnswer: "True",
        points: 10,
      },
    ],
  },
];

export interface SubmissionAnswer {
  questionId: string;
  questionText: string;
  answer: string;
  score?: number;
  feedback?: string;
  reasoning?: string;
}

export interface Submission {
  id: string;
  studentId: string;
  assignmentId: string;
  submittedAt: string;
  graded: boolean;
  score?: number;
  unfocusCount?: number;
  workFiles?: { name: string; url: string; type: string }[];
  answers: SubmissionAnswer[];
}

export const initialSubmissions: Submission[] = [
  {
    id: "sub-jordan-forces",
    studentId: "jordan",
    assignmentId: "forces",
    submittedAt: "2026-11-09T10:14:00Z",
    graded: false,
    unfocusCount: 0,
    workFiles: [
      { name: "jordan-fbd-work.pdf", url: "/scorpio-paper.pdf", type: "application/pdf" },
    ],
    answers: [
      {
        questionId: "f-q1",
        questionText: initialAssignments[0].questions[0].text,
        answer: "Horizontal net force: $\\sum F_x = 12\\text{ N} - 4.0\\text{ N} = 8.0\\text{ N}$ to the right.\nUsing $a_x = \\frac{\\sum F_x}{m} = \\frac{8.0\\text{ N}}{2.0\\text{ kg}} = 4.0\\text{ m/s}^2$ to the right.",
        score: 10,
        feedback: "Clear net force isolation and proper vector direction.",
        reasoning: "Student explicitly subtracted kinetic friction from the applied force to obtain 8.0 N, then divided by 2.0 kg with correct SI units and direction.",
      },
      {
        questionId: "f-q2",
        questionText: initialAssignments[0].questions[1].text,
        answer: "$mg\\cos\\theta$",
        score: 10,
        feedback: "Correct perpendicular component equilibrium.",
        reasoning: "Selected exact match for normal force perpendicular to the inclined plane.",
      },
      {
        questionId: "f-q3",
        questionText: initialAssignments[0].questions[2].text,
        answer: "The heavier block pulls down with $m_2 g$ and the lighter block pulls back with $m_1 g$. So $a = \\frac{(m_2 - m_1)g}{m_1 + m_2} = \\frac{2.0 \\times 9.8}{8.0} = 2.45\\text{ m/s}^2$.",
        score: 9,
        feedback: "Great symbolic derivation—state the direction of acceleration for each mass.",
        reasoning: "Symbolic derivation and numerical evaluation (2.45 m/s²) are both accurate; minor omission of explicit upward/downward direction specification.",
      },
    ],
  },
  {
    id: "sub-chloe-energy",
    studentId: "chloe",
    assignmentId: "energy",
    submittedAt: "2026-11-09T09:42:00Z",
    graded: false,
    unfocusCount: 1,
    answers: [
      {
        questionId: "e-q1",
        questionText: initialAssignments[1].questions[0].text,
        answer: "$\\Delta K = -\\Delta U_g \\implies \\frac{1}{2}mv^2 = mgh$. Mass cancels out, so $v = \\sqrt{2(9.8)(0.80)} = \\sqrt{15.68} = 3.96\\text{ m/s}$.",
        score: 10,
        feedback: "Excellent symbolic cancellation of mass before substituting.",
        reasoning: "Full symbolic setup from energy conservation followed by exact numerical calculation.",
      },
      {
        questionId: "e-q2",
        questionText: initialAssignments[1].questions[1].text,
        answer: "$K_f = mgh - f_k L$ because negative work $W_{\\text{nc}} = -f_k L$ is done by kinetic friction along the ramp.",
        score: 10,
        feedback: "Spot-on explanation of non-conservative work.",
        reasoning: "Correctly accounts for thermal energy dissipated via work-energy theorem.",
      },
    ],
  },
  {
    id: "sub-sam-motion",
    studentId: "sam",
    assignmentId: "motion",
    submittedAt: "2026-11-08T16:05:00Z",
    graded: false,
    unfocusCount: 0,
    answers: [
      {
        questionId: "m-q1",
        questionText: initialAssignments[3].questions[0].text,
        answer: "Since the slope is constant at $+3.0\\text{ m/s}$, the object moves at a constant velocity of $3.0\\text{ m/s}$ with $0\\text{ m/s}^2$ acceleration. Displacement is $3.0\\text{ m/s} \\times 6.0\\text{ s} = 18\\text{ m}$.",
        score: 10,
        feedback: "Complete and well-reasoned response.",
        reasoning: "Accurately identified velocity from slope, zero acceleration, and total displacement.",
      },
      {
        questionId: "m-q2",
        questionText: initialAssignments[3].questions[1].text,
        answer: "True",
        score: 10,
        feedback: "Correct.",
        reasoning: "Matches expected true/false key.",
      },
    ],
  },
  {
    id: "sub-avery-forces",
    studentId: "avery",
    assignmentId: "forces",
    submittedAt: "2026-11-08T13:20:00Z",
    graded: true,
    score: 100,
    workFiles: [
      { name: "avery-brooks-dynamics.pdf", url: "/scorpio-paper.pdf", type: "application/pdf" },
    ],
    answers: [
      {
        questionId: "f-q1",
        questionText: initialAssignments[0].questions[0].text,
        answer: "$\\sum F_x = F_{\\text{push}} - f_k = 12\\text{ N} - 4.0\\text{ N} = 8.0\\text{ N}$ (+x). Therefore $a_x = \\frac{8.0\\text{ N}}{2.0\\text{ kg}} = +4.0\\text{ m/s}^2$.",
        score: 10,
        feedback: "Rigorous notation and sign convention.",
        reasoning: "Complete derivation with coordinate sign convention.",
      },
      {
        questionId: "f-q2",
        questionText: initialAssignments[0].questions[1].text,
        answer: "$mg\\cos\\theta$",
        score: 10,
        feedback: "Correct.",
        reasoning: "Exact match.",
      },
      {
        questionId: "f-q3",
        questionText: initialAssignments[0].questions[2].text,
        answer: "Isolating each mass: $T - m_1 g = m_1 a$ and $m_2 g - T = m_2 a$. Adding both yields $(m_2 - m_1)g = (m_1 + m_2)a \\implies a = \\frac{m_2 - m_1}{m_1 + m_2}g = 2.45\\text{ m/s}^2$ ($m_1$ upward, $m_2$ downward).",
        score: 10,
        feedback: "Exemplary coupled-equation derivation.",
        reasoning: "Derived from individual free-body equations and eliminated internal tension T.",
      },
    ],
  },
  {
    id: "sub-avery-energy",
    studentId: "avery",
    assignmentId: "energy",
    submittedAt: "2026-11-07T15:12:00Z",
    graded: true,
    score: 95,
    answers: [
      {
        questionId: "e-q1",
        questionText: initialAssignments[1].questions[0].text,
        answer: "$U_i = K_f \\implies mgh = \\frac{1}{2}mv^2 \\implies v = \\sqrt{2gh} = 3.96\\text{ m/s}$.",
        score: 10,
        feedback: "Clean conservation setup.",
        reasoning: "Full credit.",
      },
      {
        questionId: "e-q2",
        questionText: initialAssignments[1].questions[1].text,
        answer: "$K_f = mgh - f_k L$.",
        score: 9,
        feedback: "Correct equation; briefly note that $f_k L$ is thermal energy generated.",
        reasoning: "Equation is exact.",
      },
    ],
  },
  {
    id: "sub-liam-gauss",
    studentId: "liam",
    assignmentId: "gauss",
    submittedAt: "2026-11-08T17:45:00Z",
    graded: true,
    score: 100,
    answers: [
      {
        questionId: "g-q1",
        questionText: initialAssignments[2].questions[0].text,
        answer: "For a coaxial cylinder of radius $r < R$ and length $L$: $\\oint \\vec{E}\\cdot d\\vec{A} = E(2\\pi r L)$ and $Q_{\\text{enc}} = \\rho \\pi r^2 L$. Equating via Gauss's Law gives $E(r) = \\frac{\\rho r}{2\\varepsilon_0}$ directed radially outward.",
        score: 15,
        feedback: "Flawless Gaussian surface argument.",
        reasoning: "Explicitly justified symmetry, flux integral, and enclosed volume charge.",
      },
      {
        questionId: "g-q2",
        questionText: initialAssignments[2].questions[1].text,
        answer: "$E \\propto 1/r$",
        score: 10,
        feedback: "Correct cylindrical falloff.",
        reasoning: "Matches key.",
      },
    ],
  },
];

export interface WaypointTemplate {
  id: string;
  title: string;
  description: string;
  topic: string;
  visibility: "global" | "network";
  componentCount: number;
  forkCount: number;
  version: string;
  questions: Question[];
}

export const initialWaypoints: WaypointTemplate[] = [
  {
    id: "wp-kinetic-theory",
    title: "Kinetic Theory & Ideal Gases",
    description: "Molecular interpretation of temperature, pressure, and internal energy; ideal gas law applications and RMS speed distributions.",
    topic: "thermodynamics",
    visibility: "global",
    componentCount: 7,
    forkCount: 3,
    version: "v1",
    questions: [
      {
        id: "wp-kt-1",
        text: "A sealed rigid container holds $2.0\\text{ mol}$ of an ideal monatomic gas at $T = 300\\text{ K}$. Calculate the total translational kinetic energy $U = \\frac{3}{2}nRT$ and the RMS speed $v_{\\text{rms}}$ if the molar mass is $M = 0.040\\text{ kg/mol}$.",
        type: "text",
        correctAnswer: "$U = \\frac{3}{2}(2.0)(8.314)(300) = 7.48\\text{ kJ}$; $v_{\\text{rms}} = \\sqrt{\\frac{3RT}{M}} = 432\\text{ m/s}$.",
        points: 10,
      },
      {
        id: "wp-kt-2",
        text: "If the absolute temperature $T$ of an ideal gas is quadrupled while volume is held constant, by what factor does the RMS molecular speed change?",
        type: "multiple-choice",
        options: ["Increases by a factor of $2$", "Increases by a factor of $4$", "Increases by a factor of $\\sqrt{2}$", "Remains unchanged"],
        correctAnswer: "Increases by a factor of $2$",
        points: 10,
      },
    ],
  },
  {
    id: "wp-1d-kinematics",
    title: "1D Kinematics: Motion Graphs & Equations",
    description: "Mastering position-time, velocity-time, and acceleration-time graphs alongside the kinematic equations for constant acceleration.",
    topic: "kinematics",
    visibility: "global",
    componentCount: 8,
    forkCount: 14,
    version: "v1",
    questions: [
      {
        id: "wp-1d-1",
        text: "A sprinter accelerates uniformly from rest to $9.0\\text{ m/s}$ over $3.0\\text{ s}$, then maintains constant velocity for the next $7.0\\text{ s}$. Sketch or describe the $v(t)$ graph and compute total distance traveled.",
        type: "text",
        correctAnswer: "Triangle area during acceleration: $\\frac{1}{2}(3.0\\text{ s})(9.0\\text{ m/s}) = 13.5\\text{ m}$. Rectangle area at constant speed: $(7.0\\text{ s})(9.0\\text{ m/s}) = 63.0\\text{ m}$. Total distance = $76.5\\text{ m}$.",
        points: 10,
      },
      {
        id: "wp-1d-2",
        text: "A ball is thrown vertically upward with initial speed $v_0 = 19.6\\text{ m/s}$. Using $v^2 = v_0^2 - 2g\\Delta y$, determine the maximum height reached above the launch point.",
        type: "short-answer",
        correctAnswer: "$\\Delta y = \\frac{v_0^2}{2g} = \\frac{(19.6)^2}{2(9.8)} = 19.6\\text{ m}$.",
        points: 10,
      },
    ],
  },
  {
    id: "wp-fluids",
    title: "Fluid Mechanics: Statics & Dynamics",
    description: "Pressure, buoyancy, Archimedes' principle, continuity equation, Bernoulli's equation, and viscous flow.",
    topic: "fluids",
    visibility: "global",
    componentCount: 8,
    forkCount: 5,
    version: "v1",
    questions: [
      {
        id: "wp-fl-1",
        text: "Water ($\\rho = 1000\\text{ kg/m}^3$) flows smoothly through a horizontal pipe that narrows from radius $r_1 = 4.0\\text{ cm}$ to $r_2 = 2.0\\text{ cm}$. If $v_1 = 1.5\\text{ m/s}$ and $P_1 = 180\\text{ kPa}$, use continuity $A_1 v_1 = A_2 v_2$ and Bernoulli's equation to find $P_2$.",
        type: "text",
        correctAnswer: "By continuity, $v_2 = v_1(r_1/r_2)^2 = 4(1.5) = 6.0\\text{ m/s}$. By Bernoulli: $P_2 = P_1 + \\frac{1}{2}\\rho(v_1^2 - v_2^2) = 180\\text{ kPa} - 16.875\\text{ kPa} = 163.1\\text{ kPa}$.",
        points: 15,
      },
    ],
  },
  {
    id: "wp-waves",
    title: "Wave Interference & Quantum Optics",
    description: "From Young's double slit to the basics of photon interference and wave-particle duality.",
    topic: "waves",
    visibility: "global",
    componentCount: 8,
    forkCount: 9,
    version: "v1",
    questions: [
      {
        id: "wp-wv-1",
        text: "Monochromatic light of wavelength $\\lambda = 550\\text{ nm}$ illuminates a double slit with separation $d = 0.25\\text{ mm}$. Find the fringe spacing $\\Delta y = \\frac{\\lambda L}{d}$ on a screen located $L = 2.0\\text{ m}$ away.",
        type: "short-answer",
        correctAnswer: "$\\Delta y = \\frac{(550\\times 10^{-9}\\text{ m})(2.0\\text{ m})}{0.25\\times 10^{-3}\\text{ m}} = 4.4\\text{ mm}$.",
        points: 10,
      },
    ],
  },
  {
    id: "wp-dynamics-dept",
    title: "Connected Masses & Inclined Friction Systems",
    description: "Department benchmark module for coupled Atwood and ramp systems requiring explicit free-body decomposition before solving.",
    topic: "dynamics",
    visibility: "network",
    componentCount: 6,
    forkCount: 11,
    version: "v1",
    questions: initialAssignments[0].questions,
  },
  {
    id: "wp-rotation-dept",
    title: "Rotational Inertia, Torque & Angular Momentum",
    description: "Sample AP Physics problems covering rolling without slipping, parallel-axis theorem, and angular momentum conservation.",
    topic: "rotation",
    visibility: "network",
    componentCount: 7,
    forkCount: 6,
    version: "v1",
    questions: [
      {
        id: "wp-rot-1",
        text: "A solid cylinder ($I = \\frac{1}{2}MR^2$) rolls without slipping down an incline of height $h$. Use energy conservation $Mgh = \\frac{1}{2}Mv^2 + \\frac{1}{2}I\\omega^2$ with $\\omega = v/R$ to derive its speed at the bottom.",
        type: "text",
        correctAnswer: "$Mgh = \\frac{1}{2}Mv^2 + \\frac{1}{4}Mv^2 = \\frac{3}{4}Mv^2 \\implies v = \\sqrt{\\frac{4}{3}gh}$.",
        points: 15,
      },
    ],
  },
];

export interface PreviewFormula {
  id: string;
  name: string;
  latex: string;
  category: string;
  description?: string;
  isCustom?: boolean;
}

export const VAULT_CATEGORIES = [
  { id: "all", name: "All Vaults" },
  { id: "kinematics", name: "Kinematics" },
  { id: "dynamics", name: "Dynamics" },
  { id: "energy", name: "Energy & Momentum" },
  { id: "optics", name: "Waves & Optics" },
  { id: "thermo", name: "Thermodynamics" },
  { id: "electricity", name: "Electricity" },
  { id: "nuclear", name: "Nuclear & Atomic" },
  { id: "custom", name: "Custom Equations" },
];

export const DEFAULT_VAULT_FORMULAS: PreviewFormula[] = [
  // Kinematics
  { id: "k1", name: "Final Velocity", latex: "v = u + at", category: "kinematics", isCustom: false },
  { id: "k2", name: "Displacement", latex: "s = ut + \\frac{1}{2}at^2", category: "kinematics", isCustom: false },
  { id: "k3", name: "Velocity Squared", latex: "v^2 = u^2 + 2as", category: "kinematics", isCustom: false },
  { id: "k4", name: "Average Velocity", latex: "v_{avg} = \\frac{u + v}{2}", category: "kinematics", isCustom: false },
  // Dynamics
  { id: "d1", name: "Newton's Second Law", latex: "F = ma", category: "dynamics", isCustom: false },
  { id: "d2", name: "Friction Force", latex: "f = \\mu N", category: "dynamics", isCustom: false },
  { id: "d3", name: "Centripetal Force", latex: "F_c = \\frac{mv^2}{r}", category: "dynamics", isCustom: false },
  { id: "d4", name: "Gravitational Force", latex: "F = G \\frac{m_1 m_2}{r^2}", category: "dynamics", isCustom: false },
  // Energy
  { id: "e1", name: "Kinetic Energy", latex: "K.E. = \\frac{1}{2}mv^2", category: "energy", isCustom: false },
  { id: "e3", name: "Gravitational PE", latex: "P.E. = mgh", category: "energy", isCustom: false },
  { id: "e4", name: "Momentum", latex: "p = mv", category: "energy", isCustom: false },
  { id: "e5", name: "Elastic Potential Energy", latex: "U_s = \\frac{1}{2}kx^2", category: "energy", isCustom: false },
  // Thermodynamics
  { id: "t1", name: "First Law of Thermo", latex: "\\Delta U = Q - W", category: "thermo", isCustom: false },
  { id: "t2", name: "Ideal Gas Law", latex: "PV = nRT", category: "thermo", isCustom: false },
  { id: "t3", name: "Specific Heat", latex: "Q = mc\\Delta T", category: "thermo", isCustom: false },
  // Waves & Optics
  { id: "w1", name: "Wave Speed", latex: "v = f\\lambda", category: "optics", isCustom: false },
  { id: "w2", name: "Snell's Law", latex: "n_1 \\sin \\theta_1 = n_2 \\sin \\theta_2", category: "optics", isCustom: false },
  { id: "w3", name: "Lens Equation", latex: "\\frac{1}{f} = \\frac{1}{d_o} + \\frac{1}{d_i}", category: "optics", isCustom: false },
  // Electricity
  { id: "el1", name: "Ohm's Law", latex: "V = IR", category: "electricity", isCustom: false },
  { id: "el2", name: "Electrical Power", latex: "P = IV = I^2 R = \\frac{V^2}{R}", category: "electricity", isCustom: false },
  { id: "el3", name: "Coulomb's Law", latex: "F = k_e \\frac{q_1 q_2}{r^2}", category: "electricity", isCustom: false },
  // Nuclear
  { id: "n1", name: "Mass-Energy", latex: "E = mc^2", category: "nuclear", isCustom: false },
  { id: "n2", name: "Photon Energy", latex: "E = hf = \\frac{hc}{\\lambda}", category: "nuclear", isCustom: false },
  { id: "n3", name: "Radioactive Decay", latex: "N(t) = N_0 e^{-\\lambda t}", category: "nuclear", isCustom: false },
];

export interface FacultyMember {
  uid: string;
  name: string;
  email: string;
  isOwner?: boolean;
}

export const initialFaculty: FacultyMember[] = [
  { uid: "t-mchen84a", name: "Dr. Maya Chen", email: "mchen@example.com", isOwner: true },
  { uid: "t-epark29c", name: "Elena Park", email: "epark@example.com" },
  { uid: "t-aortiz71f", name: "Dr. Adrian Ortiz", email: "aortiz@example.com" },
];

export const initialDailyUsage = [
  { date: "Nov 3", queries: 18, totalCost: 0.42 },
  { date: "Nov 4", queries: 26, totalCost: 0.64 },
  { date: "Nov 5", queries: 21, totalCost: 0.51 },
  { date: "Nov 6", queries: 34, totalCost: 0.89 },
  { date: "Nov 7", queries: 29, totalCost: 0.76 },
  { date: "Nov 8", queries: 19, totalCost: 0.48 },
  { date: "Nov 9", queries: 24, totalCost: 0.58 },
];

export const initialTypeDistribution = [
  { name: "tutor", value: 94, color: "#a855f7" },
  { name: "grading", value: 32, color: "#10b981" },
  { name: "notebook", value: 21, color: "#0ea5e9" },
  { name: "portfolio", value: 12, color: "#6366f1" },
  { name: "generation", value: 8, color: "#ec4899" },
  { name: "navigation", value: 4, color: "#3b82f6" },
];

export const initialUsageEvents = [
  { id: "evt-901", type: "tutor", inputTokens: 1420, outputTokens: 380, costCents: 1.84, timestamp: "Nov 9 at 11:42 AM" },
  { id: "evt-902", type: "grading", inputTokens: 2180, outputTokens: 540, costCents: 2.95, timestamp: "Nov 9 at 10:15 AM" },
  { id: "evt-903", type: "notebook", inputTokens: 980, outputTokens: 310, costCents: 1.32, timestamp: "Nov 9 at 09:50 AM" },
  { id: "evt-904", type: "portfolio", inputTokens: 3410, outputTokens: 690, costCents: 4.48, timestamp: "Nov 8 at 04:22 PM" },
  { id: "evt-905", type: "tutor", inputTokens: 1150, outputTokens: 290, costCents: 1.49, timestamp: "Nov 8 at 03:18 PM" },
  { id: "evt-906", type: "generation", inputTokens: 1640, outputTokens: 820, costCents: 3.12, timestamp: "Nov 8 at 01:05 PM" },
  { id: "evt-907", type: "tutor", inputTokens: 1290, outputTokens: 340, costCents: 1.71, timestamp: "Nov 7 at 02:44 PM" },
];

export interface PreviewResource {
  id: string;
  title: string;
  url: string;
  type: "link" | "document" | "video";
  courseId: string;
  createdAt: string;
}

export const initialResources: PreviewResource[] = [
  {
    id: "res-1",
    title: "AP Physics 1 — Free-Body Diagram & Vector Convention Guide.pdf",
    url: "/scorpio-paper.pdf",
    type: "document",
    courseId: "mechanics",
    createdAt: "Nov 2, 2026",
  },
  {
    id: "res-2",
    title: "Gauss's Law Symmetry & Surface Integrals Reference.pdf",
    url: "/architecture.pdf",
    type: "document",
    courseId: "em",
    createdAt: "Oct 28, 2026",
  },
  {
    id: "res-3",
    title: "Kinematics Motion Graphs — Slope & Area Relationships",
    url: "https://phet.colorado.edu/en/simulations/moving-man",
    type: "link",
    courseId: "foundations",
    createdAt: "Oct 21, 2026",
  },
];

export const courseName = (courses: PreviewCourse[], id?: string) =>
  !id || id === "all" ? "All classes" : courses.find((course) => course.id === id)?.name ?? "All classes";

export const studentById = (students: PreviewStudent[], id: string) =>
  students.find((student) => student.id === id);

export const totalPoints = (assignment: Assignment) =>
  assignment.questions.reduce((total, question) => total + question.points, 0);

export const dueLabel = (date: string) =>
  new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(date));
