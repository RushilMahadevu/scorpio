const S="modulepreload",w=function(g){return"/"+g},C={},L=function(l,r,f){let u=Promise.resolve();if(r&&r.length>0){let o=function(n){return Promise.all(n.map(s=>Promise.resolve(s).then(d=>({status:"fulfilled",value:d}),d=>({status:"rejected",reason:d}))))};document.getElementsByTagName("link");const i=document.querySelector("meta[property=csp-nonce]"),p=i?.nonce||i?.getAttribute("nonce");u=o(r.map(n=>{if(n=w(n),n in C)return;C[n]=!0;const s=n.endsWith(".css"),d=s?'[rel="stylesheet"]':"";if(document.querySelector(`link[href="${n}"]${d}`))return;const a=document.createElement("link");if(a.rel=s?"stylesheet":S,s||(a.as="script"),a.crossOrigin="",a.href=n,p&&a.setAttribute("nonce",p),document.head.appendChild(a),s)return new Promise((t,e)=>{a.addEventListener("load",t),a.addEventListener("error",()=>e(new Error(`Unable to preload CSS for ${n}`)))})}))}function h(o){const i=new Event("vite:preloadError",{cancelable:!0});if(i.payload=o,window.dispatchEvent(i),!i.defaultPrevented)throw o}return u.then(o=>{for(const i of o||[])i.status==="rejected"&&h(i.reason);return l().catch(h)})};document.addEventListener("DOMContentLoaded",()=>{const g=document.getElementById("chat-button"),l=document.getElementById("scorpio-ai-sidebar"),r=document.getElementById("sidebar-overlay"),f=document.getElementById("close-sidebar"),u=document.getElementById("chat-input"),h=document.getElementById("send-button"),o=document.getElementById("chat-messages");function i(){l?.classList.remove("hidden"),r?.classList.remove("hidden"),l?.offsetHeight,r?.offsetHeight,setTimeout(()=>{l?.classList.add("open"),r?.classList.add("visible")},10),setTimeout(()=>{u?.focus()},300)}function p(){l?.classList.remove("open"),r?.classList.remove("visible"),setTimeout(()=>{l?.classList.add("hidden"),r?.classList.add("hidden")},300)}function n(t,e=!1){const m=document.createElement("div");m.className=`message ${e?"user-message":"ai-message"}`;let c=t;e||(c=c.replace(/\*\*(.*?)\*\*/g,"<strong>$1</strong>"),c=c.replace(/\*(.*?)\*/g,"<em>$1</em>"),c=c.replace(/\n/g,"<br>")),m.innerHTML=`<p>${c}</p>`,o?.appendChild(m),o?.scrollTo({top:o.scrollHeight,behavior:"smooth"})}let s=[];function d(t){const e=t.toLowerCase();return e.includes("derivative")||e.includes("velocity")||e.includes("acceleration")?"kinematics_calculus":e.includes("force")||e.includes("newton")||e.includes("mass")?"dynamics":e.includes("energy")||e.includes("work")||e.includes("kinetic")||e.includes("potential")?"energy":e.includes("momentum")||e.includes("collision")||e.includes("impulse")?"momentum":e.includes("rotation")||e.includes("angular")||e.includes("torque")?"rotational":e.includes("oscillation")||e.includes("harmonic")||e.includes("pendulum")||e.includes("spring")?"oscillations":e.includes("gravity")||e.includes("orbit")||e.includes("satellite")?"gravitation":"general"}async function a(){const t=u?.value.trim();if(!t)return;s.push({role:"user",content:t}),n(t,!0),u.value="";const e=document.createElement("div");e.className="message ai-message typing",e.innerHTML='<p><span class="typing-dots"><span>.</span><span>.</span><span>.</span></span></p>',o?.appendChild(e),o?.scrollTo({top:o.scrollHeight,behavior:"smooth"});try{const{model:m}=await L(async()=>{const{model:v}=await import("./firebase.DunM_AsK.js").then(I=>I.f);return{model:v}},[]),c=d(t),y=s.slice(-6).map(v=>`${v.role==="user"?"Student":"Scorpio AI"}: ${v.content}`).join(`
`),P=`# ROLE & EXPERTISE
You are Scorpio AI, an expert AP Physics C: Mechanics tutor with deep knowledge of calculus-based physics. You have years of experience helping students master complex concepts and excel on the AP exam.

# CORE COMPETENCIES
- Kinematics with calculus (derivatives for velocity/acceleration)
- Newton's Laws and their applications
- Work-Energy Theorem and Conservation of Energy  
- Linear and Angular Momentum Conservation
- Rotational Motion and Moment of Inertia
- Simple Harmonic Motion and Oscillations
- Universal Gravitation and Orbital Mechanics

${{kinematics_calculus:`
# SPECIALIZED FOCUS: Calculus-Based Kinematics
Pay special attention to:
- Position, velocity, acceleration relationships: x(t), v(t) = dx/dt, a(t) = dv/dt
- Integration techniques for finding position from acceleration
- Graph interpretation and slope/area relationships
- Relative motion problems`,dynamics:`
# SPECIALIZED FOCUS: Newton's Laws & Forces
Pay special attention to:
- Free body diagrams and force analysis
- Newton's 2nd Law: ΣF = ma (vector form)
- Friction (static μs, kinetic μk)
- Inclined planes and constraint forces`,energy:`
# SPECIALIZED FOCUS: Work-Energy Theorem
Pay special attention to:
- Work: W = ∫F⃗·dr⃗ (calculus definition)
- Kinetic Energy: KE = ½mv²
- Potential Energy: gravitational (mgh), elastic (½kx²)
- Conservation of mechanical energy`,momentum:`
# SPECIALIZED FOCUS: Momentum & Collisions
Pay special attention to:
- Linear momentum: p⃗ = mv⃗
- Impulse-momentum theorem: J⃗ = Δp⃗ = ∫F⃗dt
- Conservation in collisions (elastic vs inelastic)
- Center of mass motion`,rotational:`
# SPECIALIZED FOCUS: Rotational Motion
Pay special attention to:
- Angular kinematics: θ, ω = dθ/dt, α = dω/dt
- Rotational dynamics: τ = Iα
- Moment of inertia calculations
- Angular momentum: L = Iω`,oscillations:`
# SPECIALIZED FOCUS: Simple Harmonic Motion
Pay special attention to:
- SHM equations: x(t) = A cos(ωt + φ)
- Period and frequency relationships
- Energy in oscillatory systems
- Physical vs simple pendulum`,gravitation:`
# SPECIALIZED FOCUS: Universal Gravitation
Pay special attention to:
- Newton's law of gravitation: F = Gm₁m₂/r²
- Gravitational potential energy: U = -Gm₁m₂/r
- Orbital mechanics and Kepler's laws
- Escape velocity calculations`,general:""}[c]}

# RESPONSE FRAMEWORK
When answering questions, follow this structure:
1. **Concept Identification**: Identify the key physics principles involved
2. **Equation Setup**: Present relevant equations with clear variable definitions
3. **Step-by-Step Solution**: Break down problem-solving into logical steps
4. **Conceptual Explanation**: Explain the underlying physics concepts
5. **Common Pitfalls**: Highlight frequent student mistakes to avoid
6. **AP Exam Context**: Relate to typical AP exam question types when relevant

# COMMUNICATION STYLE
- Use clear, concise language appropriate for high school students
- Include mathematical notation when helpful: use * for multiplication, ^ for exponents
- Provide analogies and real-world examples to illustrate abstract concepts
- Ask follow-up questions to gauge understanding
- Encourage active problem-solving rather than just giving answers

# CONSTRAINTS
- Focus exclusively on AP Physics C: Mechanics curriculum
- Use calculus when appropriate (derivatives, integrals)
- Provide hints before full solutions to promote learning
- Limit responses to 200-300 words for clarity

# CONVERSATION CONTEXT
${y?`Recent conversation:
${y}
`:""}

# STUDENT CONTEXT
This student is preparing for the AP Physics C: Mechanics exam and needs support with both conceptual understanding and problem-solving techniques.

---

**Current Student Question**: ${t}

**Response**:`,E=(await(await m.generateContent(P)).response).text();e&&e.remove(),s.push({role:"assistant",content:E}),s.length>20&&(s=s.slice(-20)),n(E,!1)}catch(m){console.error("AI response error:",m),e&&e.remove(),n("I apologize, but I'm having trouble processing your request right now. Please try again in a moment.",!1)}}g?.addEventListener("click",i),f?.addEventListener("click",p),r?.addEventListener("click",p),h?.addEventListener("click",a),u?.addEventListener("keypress",t=>{t.key==="Enter"&&a()}),l?.addEventListener("click",t=>{t.stopPropagation()})});
