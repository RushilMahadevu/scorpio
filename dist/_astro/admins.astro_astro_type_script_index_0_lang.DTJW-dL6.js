import{g as y,c as p,a as f}from"./firebase.B6t5wXn_.js";document.addEventListener("DOMContentLoaded",async()=>{try{if(!await y()){window.location.href="/admin/login";return}const s=document.getElementById("add-admin-form");s&&s.addEventListener("submit",g),m()}catch(t){console.error("Error in admin page:",t)}});async function g(t){t.preventDefault();const s=document.getElementById("displayName"),i=document.getElementById("email"),n=document.getElementById("password"),r=document.getElementById("confirmPassword"),e=document.getElementById("form-error"),d=document.getElementById("submit-text"),a=document.getElementById("submit-spinner");if(!s||!i||!n||!r||!e||!d||!a)return;const c=s.value,l=i.value,o=n.value,u=r.value;if(e.textContent="",e.classList.add("hidden"),e.classList.remove("form-success"),o!==u){e.textContent="Passwords do not match",e.classList.remove("hidden");return}d.classList.add("hidden"),a.classList.remove("hidden");try{await p(l,o,c),t.target.reset(),m(),e.textContent="Admin added successfully!",e.classList.remove("hidden"),e.classList.add("form-success")}catch(v){e.textContent=v.message||"Failed to create admin user",e.classList.remove("hidden")}finally{d.classList.remove("hidden"),a.classList.add("hidden")}}async function m(){const t=document.getElementById("admins-list");if(t)try{const s=await f();if(s.length===0){t.innerHTML=`
          <div class="empty-state">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            <p>No admin users found</p>
          </div>
        `;return}const i=s.map(n=>`
        <div class="admin-item">
          <div class="admin-avatar">
            ${n.displayName?n.displayName.charAt(0).toUpperCase():"A"}
          </div>
          <div class="admin-info">
            <div class="admin-name">${n.displayName||"Unknown"}</div>
            <div class="admin-email">${n.email}</div>
          </div>
          <div class="admin-role">Administrator</div>
        </div>
      `).join("");t.innerHTML=i}catch(s){t.innerHTML=`
        <div class="error-state">
          <p>Failed to load admin users: ${s.message}</p>
        </div>
      `}}
