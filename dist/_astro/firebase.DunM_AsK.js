const ec=()=>{};var sr={};/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const co=function(n){const e=[];let t=0;for(let s=0;s<n.length;s++){let r=n.charCodeAt(s);r<128?e[t++]=r:r<2048?(e[t++]=r>>6|192,e[t++]=r&63|128):(r&64512)===55296&&s+1<n.length&&(n.charCodeAt(s+1)&64512)===56320?(r=65536+((r&1023)<<10)+(n.charCodeAt(++s)&1023),e[t++]=r>>18|240,e[t++]=r>>12&63|128,e[t++]=r>>6&63|128,e[t++]=r&63|128):(e[t++]=r>>12|224,e[t++]=r>>6&63|128,e[t++]=r&63|128)}return e},tc=function(n){const e=[];let t=0,s=0;for(;t<n.length;){const r=n[t++];if(r<128)e[s++]=String.fromCharCode(r);else if(r>191&&r<224){const c=n[t++];e[s++]=String.fromCharCode((r&31)<<6|c&63)}else if(r>239&&r<365){const c=n[t++],h=n[t++],g=n[t++],w=((r&7)<<18|(c&63)<<12|(h&63)<<6|g&63)-65536;e[s++]=String.fromCharCode(55296+(w>>10)),e[s++]=String.fromCharCode(56320+(w&1023))}else{const c=n[t++],h=n[t++];e[s++]=String.fromCharCode((r&15)<<12|(c&63)<<6|h&63)}}return e.join("")},ho={byteToCharMap_:null,charToByteMap_:null,byteToCharMapWebSafe_:null,charToByteMapWebSafe_:null,ENCODED_VALS_BASE:"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",get ENCODED_VALS(){return this.ENCODED_VALS_BASE+"+/="},get ENCODED_VALS_WEBSAFE(){return this.ENCODED_VALS_BASE+"-_."},HAS_NATIVE_SUPPORT:typeof atob=="function",encodeByteArray(n,e){if(!Array.isArray(n))throw Error("encodeByteArray takes an array as a parameter");this.init_();const t=e?this.byteToCharMapWebSafe_:this.byteToCharMap_,s=[];for(let r=0;r<n.length;r+=3){const c=n[r],h=r+1<n.length,g=h?n[r+1]:0,w=r+2<n.length,v=w?n[r+2]:0,A=c>>2,b=(c&3)<<4|g>>4;let S=(g&15)<<2|v>>6,M=v&63;w||(M=64,h||(S=64)),s.push(t[A],t[b],t[S],t[M])}return s.join("")},encodeString(n,e){return this.HAS_NATIVE_SUPPORT&&!e?btoa(n):this.encodeByteArray(co(n),e)},decodeString(n,e){return this.HAS_NATIVE_SUPPORT&&!e?atob(n):tc(this.decodeStringToByteArray(n,e))},decodeStringToByteArray(n,e){this.init_();const t=e?this.charToByteMapWebSafe_:this.charToByteMap_,s=[];for(let r=0;r<n.length;){const c=t[n.charAt(r++)],g=r<n.length?t[n.charAt(r)]:0;++r;const v=r<n.length?t[n.charAt(r)]:64;++r;const b=r<n.length?t[n.charAt(r)]:64;if(++r,c==null||g==null||v==null||b==null)throw new nc;const S=c<<2|g>>4;if(s.push(S),v!==64){const M=g<<4&240|v>>2;if(s.push(M),b!==64){const O=v<<6&192|b;s.push(O)}}}return s},init_(){if(!this.byteToCharMap_){this.byteToCharMap_={},this.charToByteMap_={},this.byteToCharMapWebSafe_={},this.charToByteMapWebSafe_={};for(let n=0;n<this.ENCODED_VALS.length;n++)this.byteToCharMap_[n]=this.ENCODED_VALS.charAt(n),this.charToByteMap_[this.byteToCharMap_[n]]=n,this.byteToCharMapWebSafe_[n]=this.ENCODED_VALS_WEBSAFE.charAt(n),this.charToByteMapWebSafe_[this.byteToCharMapWebSafe_[n]]=n,n>=this.ENCODED_VALS_BASE.length&&(this.charToByteMap_[this.ENCODED_VALS_WEBSAFE.charAt(n)]=n,this.charToByteMapWebSafe_[this.ENCODED_VALS.charAt(n)]=n)}}};class nc extends Error{constructor(){super(...arguments),this.name="DecodeBase64StringError"}}const ic=function(n){const e=co(n);return ho.encodeByteArray(e,!0)},Pn=function(n){return ic(n).replace(/\./g,"")},lo=function(n){try{return ho.decodeString(n,!0)}catch(e){console.error("base64Decode failed: ",e)}return null};/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function sc(){if(typeof self<"u")return self;if(typeof window<"u")return window;if(typeof global<"u")return global;throw new Error("Unable to locate global object.")}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const rc=()=>sc().__FIREBASE_DEFAULTS__,oc=()=>{if(typeof process>"u"||typeof sr>"u")return;const n=sr.__FIREBASE_DEFAULTS__;if(n)return JSON.parse(n)},ac=()=>{if(typeof document>"u")return;let n;try{n=document.cookie.match(/__FIREBASE_DEFAULTS__=([^;]+)/)}catch{return}const e=n&&lo(n[1]);return e&&JSON.parse(e)},ji=()=>{try{return ec()||rc()||oc()||ac()}catch(n){console.info(`Unable to get __FIREBASE_DEFAULTS__ due to: ${n}`);return}},uo=n=>ji()?.emulatorHosts?.[n],cc=n=>{const e=uo(n);if(!e)return;const t=e.lastIndexOf(":");if(t<=0||t+1===e.length)throw new Error(`Invalid host ${e} with no separate hostname and port!`);const s=parseInt(e.substring(t+1),10);return e[0]==="["?[e.substring(1,t-1),s]:[e.substring(0,t),s]},fo=()=>ji()?.config,po=n=>ji()?.[`_${n}`];/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class hc{constructor(){this.reject=()=>{},this.resolve=()=>{},this.promise=new Promise((e,t)=>{this.resolve=e,this.reject=t})}wrapCallback(e){return(t,s)=>{t?this.reject(t):this.resolve(s),typeof e=="function"&&(this.promise.catch(()=>{}),e.length===1?e(t):e(t,s))}}}/**
 * @license
 * Copyright 2025 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Qt(n){try{return(n.startsWith("http://")||n.startsWith("https://")?new URL(n).hostname:n).endsWith(".cloudworkstations.dev")}catch{return!1}}async function go(n){return(await fetch(n,{credentials:"include"})).ok}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function lc(n,e){if(n.uid)throw new Error('The "uid" field is no longer supported by mockUserToken. Please use "sub" instead for Firebase Auth User ID.');const t={alg:"none",type:"JWT"},s=e||"demo-project",r=n.iat||0,c=n.sub||n.user_id;if(!c)throw new Error("mockUserToken must contain 'sub' or 'user_id' field!");const h={iss:`https://securetoken.google.com/${s}`,aud:s,iat:r,exp:r+3600,auth_time:r,sub:c,user_id:c,firebase:{sign_in_provider:"custom",identities:{}},...n};return[Pn(JSON.stringify(t)),Pn(JSON.stringify(h)),""].join(".")}const Bt={};function uc(){const n={prod:[],emulator:[]};for(const e of Object.keys(Bt))Bt[e]?n.emulator.push(e):n.prod.push(e);return n}function dc(n){let e=document.getElementById(n),t=!1;return e||(e=document.createElement("div"),e.setAttribute("id",n),t=!0),{created:t,element:e}}let rr=!1;function mo(n,e){if(typeof window>"u"||typeof document>"u"||!Qt(window.location.host)||Bt[n]===e||Bt[n]||rr)return;Bt[n]=e;function t(S){return`__firebase__banner__${S}`}const s="__firebase__banner",c=uc().prod.length>0;function h(){const S=document.getElementById(s);S&&S.remove()}function g(S){S.style.display="flex",S.style.background="#7faaf0",S.style.position="fixed",S.style.bottom="5px",S.style.left="5px",S.style.padding=".5em",S.style.borderRadius="5px",S.style.alignItems="center"}function w(S,M){S.setAttribute("width","24"),S.setAttribute("id",M),S.setAttribute("height","24"),S.setAttribute("viewBox","0 0 24 24"),S.setAttribute("fill","none"),S.style.marginLeft="-6px"}function v(){const S=document.createElement("span");return S.style.cursor="pointer",S.style.marginLeft="16px",S.style.fontSize="24px",S.innerHTML=" &times;",S.onclick=()=>{rr=!0,h()},S}function A(S,M){S.setAttribute("id",M),S.innerText="Learn more",S.href="https://firebase.google.com/docs/studio/preview-apps#preview-backend",S.setAttribute("target","__blank"),S.style.paddingLeft="5px",S.style.textDecoration="underline"}function b(){const S=dc(s),M=t("text"),O=document.getElementById(M)||document.createElement("span"),B=t("learnmore"),V=document.getElementById(B)||document.createElement("a"),Q=t("preprendIcon"),Z=document.getElementById(Q)||document.createElementNS("http://www.w3.org/2000/svg","svg");if(S.created){const ee=S.element;g(ee),A(V,B);const Ae=v();w(Z,Q),ee.append(Z,O,V,Ae),document.body.appendChild(ee)}c?(O.innerText="Preview backend disconnected.",Z.innerHTML=`<g clip-path="url(#clip0_6013_33858)">
<path d="M4.8 17.6L12 5.6L19.2 17.6H4.8ZM6.91667 16.4H17.0833L12 7.93333L6.91667 16.4ZM12 15.6C12.1667 15.6 12.3056 15.5444 12.4167 15.4333C12.5389 15.3111 12.6 15.1667 12.6 15C12.6 14.8333 12.5389 14.6944 12.4167 14.5833C12.3056 14.4611 12.1667 14.4 12 14.4C11.8333 14.4 11.6889 14.4611 11.5667 14.5833C11.4556 14.6944 11.4 14.8333 11.4 15C11.4 15.1667 11.4556 15.3111 11.5667 15.4333C11.6889 15.5444 11.8333 15.6 12 15.6ZM11.4 13.6H12.6V10.4H11.4V13.6Z" fill="#212121"/>
</g>
<defs>
<clipPath id="clip0_6013_33858">
<rect width="24" height="24" fill="white"/>
</clipPath>
</defs>`):(Z.innerHTML=`<g clip-path="url(#clip0_6083_34804)">
<path d="M11.4 15.2H12.6V11.2H11.4V15.2ZM12 10C12.1667 10 12.3056 9.94444 12.4167 9.83333C12.5389 9.71111 12.6 9.56667 12.6 9.4C12.6 9.23333 12.5389 9.09444 12.4167 8.98333C12.3056 8.86111 12.1667 8.8 12 8.8C11.8333 8.8 11.6889 8.86111 11.5667 8.98333C11.4556 9.09444 11.4 9.23333 11.4 9.4C11.4 9.56667 11.4556 9.71111 11.5667 9.83333C11.6889 9.94444 11.8333 10 12 10ZM12 18.4C11.1222 18.4 10.2944 18.2333 9.51667 17.9C8.73889 17.5667 8.05556 17.1111 7.46667 16.5333C6.88889 15.9444 6.43333 15.2611 6.1 14.4833C5.76667 13.7056 5.6 12.8778 5.6 12C5.6 11.1111 5.76667 10.2833 6.1 9.51667C6.43333 8.73889 6.88889 8.06111 7.46667 7.48333C8.05556 6.89444 8.73889 6.43333 9.51667 6.1C10.2944 5.76667 11.1222 5.6 12 5.6C12.8889 5.6 13.7167 5.76667 14.4833 6.1C15.2611 6.43333 15.9389 6.89444 16.5167 7.48333C17.1056 8.06111 17.5667 8.73889 17.9 9.51667C18.2333 10.2833 18.4 11.1111 18.4 12C18.4 12.8778 18.2333 13.7056 17.9 14.4833C17.5667 15.2611 17.1056 15.9444 16.5167 16.5333C15.9389 17.1111 15.2611 17.5667 14.4833 17.9C13.7167 18.2333 12.8889 18.4 12 18.4ZM12 17.2C13.4444 17.2 14.6722 16.6944 15.6833 15.6833C16.6944 14.6722 17.2 13.4444 17.2 12C17.2 10.5556 16.6944 9.32778 15.6833 8.31667C14.6722 7.30555 13.4444 6.8 12 6.8C10.5556 6.8 9.32778 7.30555 8.31667 8.31667C7.30556 9.32778 6.8 10.5556 6.8 12C6.8 13.4444 7.30556 14.6722 8.31667 15.6833C9.32778 16.6944 10.5556 17.2 12 17.2Z" fill="#212121"/>
</g>
<defs>
<clipPath id="clip0_6083_34804">
<rect width="24" height="24" fill="white"/>
</clipPath>
</defs>`,O.innerText="Preview backend running in this workspace."),O.setAttribute("id",M)}document.readyState==="loading"?window.addEventListener("DOMContentLoaded",b):b()}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function J(){return typeof navigator<"u"&&typeof navigator.userAgent=="string"?navigator.userAgent:""}function fc(){return typeof window<"u"&&!!(window.cordova||window.phonegap||window.PhoneGap)&&/ios|iphone|ipod|ipad|android|blackberry|iemobile/i.test(J())}function pc(){return typeof navigator<"u"&&navigator.userAgent==="Cloudflare-Workers"}function gc(){const n=typeof chrome=="object"?chrome.runtime:typeof browser=="object"?browser.runtime:void 0;return typeof n=="object"&&n.id!==void 0}function mc(){return typeof navigator=="object"&&navigator.product==="ReactNative"}function _c(){const n=J();return n.indexOf("MSIE ")>=0||n.indexOf("Trident/")>=0}function yc(){try{return typeof indexedDB=="object"}catch{return!1}}function Ec(){return new Promise((n,e)=>{try{let t=!0;const s="validate-browser-context-for-indexeddb-analytics-module",r=self.indexedDB.open(s);r.onsuccess=()=>{r.result.close(),t||self.indexedDB.deleteDatabase(s),n(!0)},r.onupgradeneeded=()=>{t=!1},r.onerror=()=>{e(r.error?.message||"")}}catch(t){e(t)}})}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const wc="FirebaseError";class _e extends Error{constructor(e,t,s){super(t),this.code=e,this.customData=s,this.name=wc,Object.setPrototypeOf(this,_e.prototype),Error.captureStackTrace&&Error.captureStackTrace(this,Zt.prototype.create)}}class Zt{constructor(e,t,s){this.service=e,this.serviceName=t,this.errors=s}create(e,...t){const s=t[0]||{},r=`${this.service}/${e}`,c=this.errors[e],h=c?Ic(c,s):"Error",g=`${this.serviceName}: ${h} (${r}).`;return new _e(r,g,s)}}function Ic(n,e){return n.replace(vc,(t,s)=>{const r=e[s];return r!=null?String(r):`<${s}?>`})}const vc=/\{\$([^}]+)}/g;function Tc(n){for(const e in n)if(Object.prototype.hasOwnProperty.call(n,e))return!1;return!0}function it(n,e){if(n===e)return!0;const t=Object.keys(n),s=Object.keys(e);for(const r of t){if(!s.includes(r))return!1;const c=n[r],h=e[r];if(or(c)&&or(h)){if(!it(c,h))return!1}else if(c!==h)return!1}for(const r of s)if(!t.includes(r))return!1;return!0}function or(n){return n!==null&&typeof n=="object"}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function en(n){const e=[];for(const[t,s]of Object.entries(n))Array.isArray(s)?s.forEach(r=>{e.push(encodeURIComponent(t)+"="+encodeURIComponent(r))}):e.push(encodeURIComponent(t)+"="+encodeURIComponent(s));return e.length?"&"+e.join("&"):""}function Vt(n){const e={};return n.replace(/^\?/,"").split("&").forEach(s=>{if(s){const[r,c]=s.split("=");e[decodeURIComponent(r)]=decodeURIComponent(c)}}),e}function jt(n){const e=n.indexOf("?");if(!e)return"";const t=n.indexOf("#",e);return n.substring(e,t>0?t:void 0)}function Sc(n,e){const t=new Ac(n,e);return t.subscribe.bind(t)}class Ac{constructor(e,t){this.observers=[],this.unsubscribes=[],this.observerCount=0,this.task=Promise.resolve(),this.finalized=!1,this.onNoObservers=t,this.task.then(()=>{e(this)}).catch(s=>{this.error(s)})}next(e){this.forEachObserver(t=>{t.next(e)})}error(e){this.forEachObserver(t=>{t.error(e)}),this.close(e)}complete(){this.forEachObserver(e=>{e.complete()}),this.close()}subscribe(e,t,s){let r;if(e===void 0&&t===void 0&&s===void 0)throw new Error("Missing Observer.");bc(e,["next","error","complete"])?r=e:r={next:e,error:t,complete:s},r.next===void 0&&(r.next=Ei),r.error===void 0&&(r.error=Ei),r.complete===void 0&&(r.complete=Ei);const c=this.unsubscribeOne.bind(this,this.observers.length);return this.finalized&&this.task.then(()=>{try{this.finalError?r.error(this.finalError):r.complete()}catch{}}),this.observers.push(r),c}unsubscribeOne(e){this.observers===void 0||this.observers[e]===void 0||(delete this.observers[e],this.observerCount-=1,this.observerCount===0&&this.onNoObservers!==void 0&&this.onNoObservers(this))}forEachObserver(e){if(!this.finalized)for(let t=0;t<this.observers.length;t++)this.sendOne(t,e)}sendOne(e,t){this.task.then(()=>{if(this.observers!==void 0&&this.observers[e]!==void 0)try{t(this.observers[e])}catch(s){typeof console<"u"&&console.error&&console.error(s)}})}close(e){this.finalized||(this.finalized=!0,e!==void 0&&(this.finalError=e),this.task.then(()=>{this.observers=void 0,this.onNoObservers=void 0}))}}function bc(n,e){if(typeof n!="object"||n===null)return!1;for(const t of e)if(t in n&&typeof n[t]=="function")return!0;return!1}function Ei(){}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function ye(n){return n&&n._delegate?n._delegate:n}class Be{constructor(e,t,s){this.name=e,this.instanceFactory=t,this.type=s,this.multipleInstances=!1,this.serviceProps={},this.instantiationMode="LAZY",this.onInstanceCreated=null}setInstantiationMode(e){return this.instantiationMode=e,this}setMultipleInstances(e){return this.multipleInstances=e,this}setServiceProps(e){return this.serviceProps=e,this}setInstanceCreatedCallback(e){return this.onInstanceCreated=e,this}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Je="[DEFAULT]";/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Rc{constructor(e,t){this.name=e,this.container=t,this.component=null,this.instances=new Map,this.instancesDeferred=new Map,this.instancesOptions=new Map,this.onInitCallbacks=new Map}get(e){const t=this.normalizeInstanceIdentifier(e);if(!this.instancesDeferred.has(t)){const s=new hc;if(this.instancesDeferred.set(t,s),this.isInitialized(t)||this.shouldAutoInitialize())try{const r=this.getOrInitializeService({instanceIdentifier:t});r&&s.resolve(r)}catch{}}return this.instancesDeferred.get(t).promise}getImmediate(e){const t=this.normalizeInstanceIdentifier(e?.identifier),s=e?.optional??!1;if(this.isInitialized(t)||this.shouldAutoInitialize())try{return this.getOrInitializeService({instanceIdentifier:t})}catch(r){if(s)return null;throw r}else{if(s)return null;throw Error(`Service ${this.name} is not available`)}}getComponent(){return this.component}setComponent(e){if(e.name!==this.name)throw Error(`Mismatching Component ${e.name} for Provider ${this.name}.`);if(this.component)throw Error(`Component for ${this.name} has already been provided`);if(this.component=e,!!this.shouldAutoInitialize()){if(Pc(e))try{this.getOrInitializeService({instanceIdentifier:Je})}catch{}for(const[t,s]of this.instancesDeferred.entries()){const r=this.normalizeInstanceIdentifier(t);try{const c=this.getOrInitializeService({instanceIdentifier:r});s.resolve(c)}catch{}}}}clearInstance(e=Je){this.instancesDeferred.delete(e),this.instancesOptions.delete(e),this.instances.delete(e)}async delete(){const e=Array.from(this.instances.values());await Promise.all([...e.filter(t=>"INTERNAL"in t).map(t=>t.INTERNAL.delete()),...e.filter(t=>"_delete"in t).map(t=>t._delete())])}isComponentSet(){return this.component!=null}isInitialized(e=Je){return this.instances.has(e)}getOptions(e=Je){return this.instancesOptions.get(e)||{}}initialize(e={}){const{options:t={}}=e,s=this.normalizeInstanceIdentifier(e.instanceIdentifier);if(this.isInitialized(s))throw Error(`${this.name}(${s}) has already been initialized`);if(!this.isComponentSet())throw Error(`Component ${this.name} has not been registered yet`);const r=this.getOrInitializeService({instanceIdentifier:s,options:t});for(const[c,h]of this.instancesDeferred.entries()){const g=this.normalizeInstanceIdentifier(c);s===g&&h.resolve(r)}return r}onInit(e,t){const s=this.normalizeInstanceIdentifier(t),r=this.onInitCallbacks.get(s)??new Set;r.add(e),this.onInitCallbacks.set(s,r);const c=this.instances.get(s);return c&&e(c,s),()=>{r.delete(e)}}invokeOnInitCallbacks(e,t){const s=this.onInitCallbacks.get(t);if(s)for(const r of s)try{r(e,t)}catch{}}getOrInitializeService({instanceIdentifier:e,options:t={}}){let s=this.instances.get(e);if(!s&&this.component&&(s=this.component.instanceFactory(this.container,{instanceIdentifier:Cc(e),options:t}),this.instances.set(e,s),this.instancesOptions.set(e,t),this.invokeOnInitCallbacks(s,e),this.component.onInstanceCreated))try{this.component.onInstanceCreated(this.container,e,s)}catch{}return s||null}normalizeInstanceIdentifier(e=Je){return this.component?this.component.multipleInstances?e:Je:e}shouldAutoInitialize(){return!!this.component&&this.component.instantiationMode!=="EXPLICIT"}}function Cc(n){return n===Je?void 0:n}function Pc(n){return n.instantiationMode==="EAGER"}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class kc{constructor(e){this.name=e,this.providers=new Map}addComponent(e){const t=this.getProvider(e.name);if(t.isComponentSet())throw new Error(`Component ${e.name} has already been registered with ${this.name}`);t.setComponent(e)}addOrOverwriteComponent(e){this.getProvider(e.name).isComponentSet()&&this.providers.delete(e.name),this.addComponent(e)}getProvider(e){if(this.providers.has(e))return this.providers.get(e);const t=new Rc(e,this);return this.providers.set(e,t),t}getProviders(){return Array.from(this.providers.values())}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */var U;(function(n){n[n.DEBUG=0]="DEBUG",n[n.VERBOSE=1]="VERBOSE",n[n.INFO=2]="INFO",n[n.WARN=3]="WARN",n[n.ERROR=4]="ERROR",n[n.SILENT=5]="SILENT"})(U||(U={}));const Oc={debug:U.DEBUG,verbose:U.VERBOSE,info:U.INFO,warn:U.WARN,error:U.ERROR,silent:U.SILENT},Nc=U.INFO,Dc={[U.DEBUG]:"log",[U.VERBOSE]:"log",[U.INFO]:"info",[U.WARN]:"warn",[U.ERROR]:"error"},Lc=(n,e,...t)=>{if(e<n.logLevel)return;const s=new Date().toISOString(),r=Dc[e];if(r)console[r](`[${s}]  ${n.name}:`,...t);else throw new Error(`Attempted to log a message with an invalid logType (value: ${e})`)};class Vn{constructor(e){this.name=e,this._logLevel=Nc,this._logHandler=Lc,this._userLogHandler=null}get logLevel(){return this._logLevel}set logLevel(e){if(!(e in U))throw new TypeError(`Invalid value "${e}" assigned to \`logLevel\``);this._logLevel=e}setLogLevel(e){this._logLevel=typeof e=="string"?Oc[e]:e}get logHandler(){return this._logHandler}set logHandler(e){if(typeof e!="function")throw new TypeError("Value assigned to `logHandler` must be a function");this._logHandler=e}get userLogHandler(){return this._userLogHandler}set userLogHandler(e){this._userLogHandler=e}debug(...e){this._userLogHandler&&this._userLogHandler(this,U.DEBUG,...e),this._logHandler(this,U.DEBUG,...e)}log(...e){this._userLogHandler&&this._userLogHandler(this,U.VERBOSE,...e),this._logHandler(this,U.VERBOSE,...e)}info(...e){this._userLogHandler&&this._userLogHandler(this,U.INFO,...e),this._logHandler(this,U.INFO,...e)}warn(...e){this._userLogHandler&&this._userLogHandler(this,U.WARN,...e),this._logHandler(this,U.WARN,...e)}error(...e){this._userLogHandler&&this._userLogHandler(this,U.ERROR,...e),this._logHandler(this,U.ERROR,...e)}}const Mc=(n,e)=>e.some(t=>n instanceof t);let ar,cr;function Uc(){return ar||(ar=[IDBDatabase,IDBObjectStore,IDBIndex,IDBCursor,IDBTransaction])}function xc(){return cr||(cr=[IDBCursor.prototype.advance,IDBCursor.prototype.continue,IDBCursor.prototype.continuePrimaryKey])}const _o=new WeakMap,Pi=new WeakMap,yo=new WeakMap,wi=new WeakMap,Bi=new WeakMap;function Fc(n){const e=new Promise((t,s)=>{const r=()=>{n.removeEventListener("success",c),n.removeEventListener("error",h)},c=()=>{t(Fe(n.result)),r()},h=()=>{s(n.error),r()};n.addEventListener("success",c),n.addEventListener("error",h)});return e.then(t=>{t instanceof IDBCursor&&_o.set(t,n)}).catch(()=>{}),Bi.set(e,n),e}function Vc(n){if(Pi.has(n))return;const e=new Promise((t,s)=>{const r=()=>{n.removeEventListener("complete",c),n.removeEventListener("error",h),n.removeEventListener("abort",h)},c=()=>{t(),r()},h=()=>{s(n.error||new DOMException("AbortError","AbortError")),r()};n.addEventListener("complete",c),n.addEventListener("error",h),n.addEventListener("abort",h)});Pi.set(n,e)}let ki={get(n,e,t){if(n instanceof IDBTransaction){if(e==="done")return Pi.get(n);if(e==="objectStoreNames")return n.objectStoreNames||yo.get(n);if(e==="store")return t.objectStoreNames[1]?void 0:t.objectStore(t.objectStoreNames[0])}return Fe(n[e])},set(n,e,t){return n[e]=t,!0},has(n,e){return n instanceof IDBTransaction&&(e==="done"||e==="store")?!0:e in n}};function jc(n){ki=n(ki)}function Bc(n){return n===IDBDatabase.prototype.transaction&&!("objectStoreNames"in IDBTransaction.prototype)?function(e,...t){const s=n.call(Ii(this),e,...t);return yo.set(s,e.sort?e.sort():[e]),Fe(s)}:xc().includes(n)?function(...e){return n.apply(Ii(this),e),Fe(_o.get(this))}:function(...e){return Fe(n.apply(Ii(this),e))}}function $c(n){return typeof n=="function"?Bc(n):(n instanceof IDBTransaction&&Vc(n),Mc(n,Uc())?new Proxy(n,ki):n)}function Fe(n){if(n instanceof IDBRequest)return Fc(n);if(wi.has(n))return wi.get(n);const e=$c(n);return e!==n&&(wi.set(n,e),Bi.set(e,n)),e}const Ii=n=>Bi.get(n);function Hc(n,e,{blocked:t,upgrade:s,blocking:r,terminated:c}={}){const h=indexedDB.open(n,e),g=Fe(h);return s&&h.addEventListener("upgradeneeded",w=>{s(Fe(h.result),w.oldVersion,w.newVersion,Fe(h.transaction),w)}),t&&h.addEventListener("blocked",w=>t(w.oldVersion,w.newVersion,w)),g.then(w=>{c&&w.addEventListener("close",()=>c()),r&&w.addEventListener("versionchange",v=>r(v.oldVersion,v.newVersion,v))}).catch(()=>{}),g}const Gc=["get","getKey","getAll","getAllKeys","count"],Wc=["put","add","delete","clear"],vi=new Map;function hr(n,e){if(!(n instanceof IDBDatabase&&!(e in n)&&typeof e=="string"))return;if(vi.get(e))return vi.get(e);const t=e.replace(/FromIndex$/,""),s=e!==t,r=Wc.includes(t);if(!(t in(s?IDBIndex:IDBObjectStore).prototype)||!(r||Gc.includes(t)))return;const c=async function(h,...g){const w=this.transaction(h,r?"readwrite":"readonly");let v=w.store;return s&&(v=v.index(g.shift())),(await Promise.all([v[t](...g),r&&w.done]))[0]};return vi.set(e,c),c}jc(n=>({...n,get:(e,t,s)=>hr(e,t)||n.get(e,t,s),has:(e,t)=>!!hr(e,t)||n.has(e,t)}));/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class qc{constructor(e){this.container=e}getPlatformInfoString(){return this.container.getProviders().map(t=>{if(zc(t)){const s=t.getImmediate();return`${s.library}/${s.version}`}else return null}).filter(t=>t).join(" ")}}function zc(n){return n.getComponent()?.type==="VERSION"}const Oi="@firebase/app",lr="0.14.4";/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const ve=new Vn("@firebase/app"),Kc="@firebase/app-compat",Jc="@firebase/analytics-compat",Yc="@firebase/analytics",Xc="@firebase/app-check-compat",Qc="@firebase/app-check",Zc="@firebase/auth",eh="@firebase/auth-compat",th="@firebase/database",nh="@firebase/data-connect",ih="@firebase/database-compat",sh="@firebase/functions",rh="@firebase/functions-compat",oh="@firebase/installations",ah="@firebase/installations-compat",ch="@firebase/messaging",hh="@firebase/messaging-compat",lh="@firebase/performance",uh="@firebase/performance-compat",dh="@firebase/remote-config",fh="@firebase/remote-config-compat",ph="@firebase/storage",gh="@firebase/storage-compat",mh="@firebase/firestore",_h="@firebase/ai",yh="@firebase/firestore-compat",Eh="firebase",wh="12.4.0";/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Ni="[DEFAULT]",Ih={[Oi]:"fire-core",[Kc]:"fire-core-compat",[Yc]:"fire-analytics",[Jc]:"fire-analytics-compat",[Qc]:"fire-app-check",[Xc]:"fire-app-check-compat",[Zc]:"fire-auth",[eh]:"fire-auth-compat",[th]:"fire-rtdb",[nh]:"fire-data-connect",[ih]:"fire-rtdb-compat",[sh]:"fire-fn",[rh]:"fire-fn-compat",[oh]:"fire-iid",[ah]:"fire-iid-compat",[ch]:"fire-fcm",[hh]:"fire-fcm-compat",[lh]:"fire-perf",[uh]:"fire-perf-compat",[dh]:"fire-rc",[fh]:"fire-rc-compat",[ph]:"fire-gcs",[gh]:"fire-gcs-compat",[mh]:"fire-fst",[yh]:"fire-fst-compat",[_h]:"fire-vertex","fire-js":"fire-js",[Eh]:"fire-js-all"};/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const kn=new Map,vh=new Map,Di=new Map;function ur(n,e){try{n.container.addComponent(e)}catch(t){ve.debug(`Component ${e.name} failed to register with FirebaseApp ${n.name}`,t)}}function st(n){const e=n.name;if(Di.has(e))return ve.debug(`There were multiple attempts to register component ${e}.`),!1;Di.set(e,n);for(const t of kn.values())ur(t,n);for(const t of vh.values())ur(t,n);return!0}function jn(n,e){const t=n.container.getProvider("heartbeat").getImmediate({optional:!0});return t&&t.triggerHeartbeat(),n.container.getProvider(e)}function ie(n){return n==null?!1:n.settings!==void 0}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Th={"no-app":"No Firebase App '{$appName}' has been created - call initializeApp() first","bad-app-name":"Illegal App name: '{$appName}'","duplicate-app":"Firebase App named '{$appName}' already exists with different options or config","app-deleted":"Firebase App named '{$appName}' already deleted","server-app-deleted":"Firebase Server App has been deleted","no-options":"Need to provide options, when not being deployed to hosting via source.","invalid-app-argument":"firebase.{$appName}() takes either no argument or a Firebase App instance.","invalid-log-argument":"First argument to `onLog` must be null or a function.","idb-open":"Error thrown when opening IndexedDB. Original error: {$originalErrorMessage}.","idb-get":"Error thrown when reading from IndexedDB. Original error: {$originalErrorMessage}.","idb-set":"Error thrown when writing to IndexedDB. Original error: {$originalErrorMessage}.","idb-delete":"Error thrown when deleting from IndexedDB. Original error: {$originalErrorMessage}.","finalization-registry-not-supported":"FirebaseServerApp deleteOnDeref field defined but the JS runtime does not support FinalizationRegistry.","invalid-server-app-environment":"FirebaseServerApp is not for use in browser environments."},Ve=new Zt("app","Firebase",Th);/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Sh{constructor(e,t,s){this._isDeleted=!1,this._options={...e},this._config={...t},this._name=t.name,this._automaticDataCollectionEnabled=t.automaticDataCollectionEnabled,this._container=s,this.container.addComponent(new Be("app",()=>this,"PUBLIC"))}get automaticDataCollectionEnabled(){return this.checkDestroyed(),this._automaticDataCollectionEnabled}set automaticDataCollectionEnabled(e){this.checkDestroyed(),this._automaticDataCollectionEnabled=e}get name(){return this.checkDestroyed(),this._name}get options(){return this.checkDestroyed(),this._options}get config(){return this.checkDestroyed(),this._config}get container(){return this._container}get isDeleted(){return this._isDeleted}set isDeleted(e){this._isDeleted=e}checkDestroyed(){if(this.isDeleted)throw Ve.create("app-deleted",{appName:this._name})}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const wt=wh;function $i(n,e={}){let t=n;typeof e!="object"&&(e={name:e});const s={name:Ni,automaticDataCollectionEnabled:!0,...e},r=s.name;if(typeof r!="string"||!r)throw Ve.create("bad-app-name",{appName:String(r)});if(t||(t=fo()),!t)throw Ve.create("no-options");const c=kn.get(r);if(c){if(it(t,c.options)&&it(s,c.config))return c;throw Ve.create("duplicate-app",{appName:r})}const h=new kc(r);for(const w of Di.values())h.addComponent(w);const g=new Sh(t,s,h);return kn.set(r,g),g}function Hi(n=Ni){const e=kn.get(n);if(!e&&n===Ni&&fo())return $i();if(!e)throw Ve.create("no-app",{appName:n});return e}function pe(n,e,t){let s=Ih[n]??n;t&&(s+=`-${t}`);const r=s.match(/\s|\//),c=e.match(/\s|\//);if(r||c){const h=[`Unable to register library "${s}" with version "${e}":`];r&&h.push(`library name "${s}" contains illegal characters (whitespace or "/")`),r&&c&&h.push("and"),c&&h.push(`version name "${e}" contains illegal characters (whitespace or "/")`),ve.warn(h.join(" "));return}st(new Be(`${s}-version`,()=>({library:s,version:e}),"VERSION"))}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Ah="firebase-heartbeat-database",bh=1,zt="firebase-heartbeat-store";let Ti=null;function Eo(){return Ti||(Ti=Hc(Ah,bh,{upgrade:(n,e)=>{switch(e){case 0:try{n.createObjectStore(zt)}catch(t){console.warn(t)}}}}).catch(n=>{throw Ve.create("idb-open",{originalErrorMessage:n.message})})),Ti}async function Rh(n){try{const t=(await Eo()).transaction(zt),s=await t.objectStore(zt).get(wo(n));return await t.done,s}catch(e){if(e instanceof _e)ve.warn(e.message);else{const t=Ve.create("idb-get",{originalErrorMessage:e?.message});ve.warn(t.message)}}}async function dr(n,e){try{const s=(await Eo()).transaction(zt,"readwrite");await s.objectStore(zt).put(e,wo(n)),await s.done}catch(t){if(t instanceof _e)ve.warn(t.message);else{const s=Ve.create("idb-set",{originalErrorMessage:t?.message});ve.warn(s.message)}}}function wo(n){return`${n.name}!${n.options.appId}`}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Ch=1024,Ph=30;class kh{constructor(e){this.container=e,this._heartbeatsCache=null;const t=this.container.getProvider("app").getImmediate();this._storage=new Nh(t),this._heartbeatsCachePromise=this._storage.read().then(s=>(this._heartbeatsCache=s,s))}async triggerHeartbeat(){try{const t=this.container.getProvider("platform-logger").getImmediate().getPlatformInfoString(),s=fr();if(this._heartbeatsCache?.heartbeats==null&&(this._heartbeatsCache=await this._heartbeatsCachePromise,this._heartbeatsCache?.heartbeats==null)||this._heartbeatsCache.lastSentHeartbeatDate===s||this._heartbeatsCache.heartbeats.some(r=>r.date===s))return;if(this._heartbeatsCache.heartbeats.push({date:s,agent:t}),this._heartbeatsCache.heartbeats.length>Ph){const r=Dh(this._heartbeatsCache.heartbeats);this._heartbeatsCache.heartbeats.splice(r,1)}return this._storage.overwrite(this._heartbeatsCache)}catch(e){ve.warn(e)}}async getHeartbeatsHeader(){try{if(this._heartbeatsCache===null&&await this._heartbeatsCachePromise,this._heartbeatsCache?.heartbeats==null||this._heartbeatsCache.heartbeats.length===0)return"";const e=fr(),{heartbeatsToSend:t,unsentEntries:s}=Oh(this._heartbeatsCache.heartbeats),r=Pn(JSON.stringify({version:2,heartbeats:t}));return this._heartbeatsCache.lastSentHeartbeatDate=e,s.length>0?(this._heartbeatsCache.heartbeats=s,await this._storage.overwrite(this._heartbeatsCache)):(this._heartbeatsCache.heartbeats=[],this._storage.overwrite(this._heartbeatsCache)),r}catch(e){return ve.warn(e),""}}}function fr(){return new Date().toISOString().substring(0,10)}function Oh(n,e=Ch){const t=[];let s=n.slice();for(const r of n){const c=t.find(h=>h.agent===r.agent);if(c){if(c.dates.push(r.date),pr(t)>e){c.dates.pop();break}}else if(t.push({agent:r.agent,dates:[r.date]}),pr(t)>e){t.pop();break}s=s.slice(1)}return{heartbeatsToSend:t,unsentEntries:s}}class Nh{constructor(e){this.app=e,this._canUseIndexedDBPromise=this.runIndexedDBEnvironmentCheck()}async runIndexedDBEnvironmentCheck(){return yc()?Ec().then(()=>!0).catch(()=>!1):!1}async read(){if(await this._canUseIndexedDBPromise){const t=await Rh(this.app);return t?.heartbeats?t:{heartbeats:[]}}else return{heartbeats:[]}}async overwrite(e){if(await this._canUseIndexedDBPromise){const s=await this.read();return dr(this.app,{lastSentHeartbeatDate:e.lastSentHeartbeatDate??s.lastSentHeartbeatDate,heartbeats:e.heartbeats})}else return}async add(e){if(await this._canUseIndexedDBPromise){const s=await this.read();return dr(this.app,{lastSentHeartbeatDate:e.lastSentHeartbeatDate??s.lastSentHeartbeatDate,heartbeats:[...s.heartbeats,...e.heartbeats]})}else return}}function pr(n){return Pn(JSON.stringify({version:2,heartbeats:n})).length}function Dh(n){if(n.length===0)return-1;let e=0,t=n[0].date;for(let s=1;s<n.length;s++)n[s].date<t&&(t=n[s].date,e=s);return e}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Lh(n){st(new Be("platform-logger",e=>new qc(e),"PRIVATE")),st(new Be("heartbeat",e=>new kh(e),"PRIVATE")),pe(Oi,lr,n),pe(Oi,lr,"esm2020"),pe("fire-js","")}Lh("");var Mh="firebase",Uh="12.4.0";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */pe(Mh,Uh,"app");function Io(){return{"dependent-sdk-initialized-before-auth":"Another Firebase SDK was initialized and is trying to use Auth before Auth is initialized. Please be sure to call `initializeAuth` or `getAuth` before starting any other Firebase SDK."}}const xh=Io,vo=new Zt("auth","Firebase",Io());/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const On=new Vn("@firebase/auth");function Fh(n,...e){On.logLevel<=U.WARN&&On.warn(`Auth (${wt}): ${n}`,...e)}function Sn(n,...e){On.logLevel<=U.ERROR&&On.error(`Auth (${wt}): ${n}`,...e)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function ce(n,...e){throw Gi(n,...e)}function ge(n,...e){return Gi(n,...e)}function To(n,e,t){const s={...xh(),[e]:t};return new Zt("auth","Firebase",s).create(e,{appName:n.name})}function je(n){return To(n,"operation-not-supported-in-this-environment","Operations that alter the current user are not supported in conjunction with FirebaseServerApp")}function Gi(n,...e){if(typeof n!="string"){const t=e[0],s=[...e.slice(1)];return s[0]&&(s[0].appName=n.name),n._errorFactory.create(t,...s)}return vo.create(n,...e)}function R(n,e,...t){if(!n)throw Gi(e,...t)}function we(n){const e="INTERNAL ASSERTION FAILED: "+n;throw Sn(e),new Error(e)}function Te(n,e){n||we(e)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Li(){return typeof self<"u"&&self.location?.href||""}function Vh(){return gr()==="http:"||gr()==="https:"}function gr(){return typeof self<"u"&&self.location?.protocol||null}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function jh(){return typeof navigator<"u"&&navigator&&"onLine"in navigator&&typeof navigator.onLine=="boolean"&&(Vh()||gc()||"connection"in navigator)?navigator.onLine:!0}function Bh(){if(typeof navigator>"u")return null;const n=navigator;return n.languages&&n.languages[0]||n.language||null}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class tn{constructor(e,t){this.shortDelay=e,this.longDelay=t,Te(t>e,"Short delay should be less than long delay!"),this.isMobile=fc()||mc()}get(){return jh()?this.isMobile?this.longDelay:this.shortDelay:Math.min(5e3,this.shortDelay)}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Wi(n,e){Te(n.emulator,"Emulator should always be set here");const{url:t}=n.emulator;return e?`${t}${e.startsWith("/")?e.slice(1):e}`:t}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class So{static initialize(e,t,s){this.fetchImpl=e,t&&(this.headersImpl=t),s&&(this.responseImpl=s)}static fetch(){if(this.fetchImpl)return this.fetchImpl;if(typeof self<"u"&&"fetch"in self)return self.fetch;if(typeof globalThis<"u"&&globalThis.fetch)return globalThis.fetch;if(typeof fetch<"u")return fetch;we("Could not find fetch implementation, make sure you call FetchProvider.initialize() with an appropriate polyfill")}static headers(){if(this.headersImpl)return this.headersImpl;if(typeof self<"u"&&"Headers"in self)return self.Headers;if(typeof globalThis<"u"&&globalThis.Headers)return globalThis.Headers;if(typeof Headers<"u")return Headers;we("Could not find Headers implementation, make sure you call FetchProvider.initialize() with an appropriate polyfill")}static response(){if(this.responseImpl)return this.responseImpl;if(typeof self<"u"&&"Response"in self)return self.Response;if(typeof globalThis<"u"&&globalThis.Response)return globalThis.Response;if(typeof Response<"u")return Response;we("Could not find Response implementation, make sure you call FetchProvider.initialize() with an appropriate polyfill")}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const $h={CREDENTIAL_MISMATCH:"custom-token-mismatch",MISSING_CUSTOM_TOKEN:"internal-error",INVALID_IDENTIFIER:"invalid-email",MISSING_CONTINUE_URI:"internal-error",INVALID_PASSWORD:"wrong-password",MISSING_PASSWORD:"missing-password",INVALID_LOGIN_CREDENTIALS:"invalid-credential",EMAIL_EXISTS:"email-already-in-use",PASSWORD_LOGIN_DISABLED:"operation-not-allowed",INVALID_IDP_RESPONSE:"invalid-credential",INVALID_PENDING_TOKEN:"invalid-credential",FEDERATED_USER_ID_ALREADY_LINKED:"credential-already-in-use",MISSING_REQ_TYPE:"internal-error",EMAIL_NOT_FOUND:"user-not-found",RESET_PASSWORD_EXCEED_LIMIT:"too-many-requests",EXPIRED_OOB_CODE:"expired-action-code",INVALID_OOB_CODE:"invalid-action-code",MISSING_OOB_CODE:"internal-error",CREDENTIAL_TOO_OLD_LOGIN_AGAIN:"requires-recent-login",INVALID_ID_TOKEN:"invalid-user-token",TOKEN_EXPIRED:"user-token-expired",USER_NOT_FOUND:"user-token-expired",TOO_MANY_ATTEMPTS_TRY_LATER:"too-many-requests",PASSWORD_DOES_NOT_MEET_REQUIREMENTS:"password-does-not-meet-requirements",INVALID_CODE:"invalid-verification-code",INVALID_SESSION_INFO:"invalid-verification-id",INVALID_TEMPORARY_PROOF:"invalid-credential",MISSING_SESSION_INFO:"missing-verification-id",SESSION_EXPIRED:"code-expired",MISSING_ANDROID_PACKAGE_NAME:"missing-android-pkg-name",UNAUTHORIZED_DOMAIN:"unauthorized-continue-uri",INVALID_OAUTH_CLIENT_ID:"invalid-oauth-client-id",ADMIN_ONLY_OPERATION:"admin-restricted-operation",INVALID_MFA_PENDING_CREDENTIAL:"invalid-multi-factor-session",MFA_ENROLLMENT_NOT_FOUND:"multi-factor-info-not-found",MISSING_MFA_ENROLLMENT_ID:"missing-multi-factor-info",MISSING_MFA_PENDING_CREDENTIAL:"missing-multi-factor-session",SECOND_FACTOR_EXISTS:"second-factor-already-in-use",SECOND_FACTOR_LIMIT_EXCEEDED:"maximum-second-factor-count-exceeded",BLOCKING_FUNCTION_ERROR_RESPONSE:"internal-error",RECAPTCHA_NOT_ENABLED:"recaptcha-not-enabled",MISSING_RECAPTCHA_TOKEN:"missing-recaptcha-token",INVALID_RECAPTCHA_TOKEN:"invalid-recaptcha-token",INVALID_RECAPTCHA_ACTION:"invalid-recaptcha-action",MISSING_CLIENT_TYPE:"missing-client-type",MISSING_RECAPTCHA_VERSION:"missing-recaptcha-version",INVALID_RECAPTCHA_VERSION:"invalid-recaptcha-version",INVALID_REQ_TYPE:"invalid-req-type"};/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Hh=["/v1/accounts:signInWithCustomToken","/v1/accounts:signInWithEmailLink","/v1/accounts:signInWithIdp","/v1/accounts:signInWithPassword","/v1/accounts:signInWithPhoneNumber","/v1/token"],Gh=new tn(3e4,6e4);function at(n,e){return n.tenantId&&!e.tenantId?{...e,tenantId:n.tenantId}:e}async function He(n,e,t,s,r={}){return Ao(n,r,async()=>{let c={},h={};s&&(e==="GET"?h=s:c={body:JSON.stringify(s)});const g=en({key:n.config.apiKey,...h}).slice(1),w=await n._getAdditionalHeaders();w["Content-Type"]="application/json",n.languageCode&&(w["X-Firebase-Locale"]=n.languageCode);const v={method:e,headers:w,...c};return pc()||(v.referrerPolicy="no-referrer"),n.emulatorConfig&&Qt(n.emulatorConfig.host)&&(v.credentials="include"),So.fetch()(await bo(n,n.config.apiHost,t,g),v)})}async function Ao(n,e,t){n._canInitEmulator=!1;const s={...$h,...e};try{const r=new qh(n),c=await Promise.race([t(),r.promise]);r.clearNetworkTimeout();const h=await c.json();if("needConfirmation"in h)throw wn(n,"account-exists-with-different-credential",h);if(c.ok&&!("errorMessage"in h))return h;{const g=c.ok?h.errorMessage:h.error.message,[w,v]=g.split(" : ");if(w==="FEDERATED_USER_ID_ALREADY_LINKED")throw wn(n,"credential-already-in-use",h);if(w==="EMAIL_EXISTS")throw wn(n,"email-already-in-use",h);if(w==="USER_DISABLED")throw wn(n,"user-disabled",h);const A=s[w]||w.toLowerCase().replace(/[_\s]+/g,"-");if(v)throw To(n,A,v);ce(n,A)}}catch(r){if(r instanceof _e)throw r;ce(n,"network-request-failed",{message:String(r)})}}async function Bn(n,e,t,s,r={}){const c=await He(n,e,t,s,r);return"mfaPendingCredential"in c&&ce(n,"multi-factor-auth-required",{_serverResponse:c}),c}async function bo(n,e,t,s){const r=`${e}${t}?${s}`,c=n,h=c.config.emulator?Wi(n.config,r):`${n.config.apiScheme}://${r}`;return Hh.includes(t)&&(await c._persistenceManagerAvailable,c._getPersistenceType()==="COOKIE")?c._getPersistence()._getFinalTarget(h).toString():h}function Wh(n){switch(n){case"ENFORCE":return"ENFORCE";case"AUDIT":return"AUDIT";case"OFF":return"OFF";default:return"ENFORCEMENT_STATE_UNSPECIFIED"}}class qh{clearNetworkTimeout(){clearTimeout(this.timer)}constructor(e){this.auth=e,this.timer=null,this.promise=new Promise((t,s)=>{this.timer=setTimeout(()=>s(ge(this.auth,"network-request-failed")),Gh.get())})}}function wn(n,e,t){const s={appName:n.name};t.email&&(s.email=t.email),t.phoneNumber&&(s.phoneNumber=t.phoneNumber);const r=ge(n,e,s);return r.customData._tokenResponse=t,r}function mr(n){return n!==void 0&&n.enterprise!==void 0}class zh{constructor(e){if(this.siteKey="",this.recaptchaEnforcementState=[],e.recaptchaKey===void 0)throw new Error("recaptchaKey undefined");this.siteKey=e.recaptchaKey.split("/")[3],this.recaptchaEnforcementState=e.recaptchaEnforcementState}getProviderEnforcementState(e){if(!this.recaptchaEnforcementState||this.recaptchaEnforcementState.length===0)return null;for(const t of this.recaptchaEnforcementState)if(t.provider&&t.provider===e)return Wh(t.enforcementState);return null}isProviderEnabled(e){return this.getProviderEnforcementState(e)==="ENFORCE"||this.getProviderEnforcementState(e)==="AUDIT"}isAnyProviderEnabled(){return this.isProviderEnabled("EMAIL_PASSWORD_PROVIDER")||this.isProviderEnabled("PHONE_PROVIDER")}}async function Kh(n,e){return He(n,"GET","/v2/recaptchaConfig",at(n,e))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function Jh(n,e){return He(n,"POST","/v1/accounts:delete",e)}async function Nn(n,e){return He(n,"POST","/v1/accounts:lookup",e)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function $t(n){if(n)try{const e=new Date(Number(n));if(!isNaN(e.getTime()))return e.toUTCString()}catch{}}async function Yh(n,e=!1){const t=ye(n),s=await t.getIdToken(e),r=qi(s);R(r&&r.exp&&r.auth_time&&r.iat,t.auth,"internal-error");const c=typeof r.firebase=="object"?r.firebase:void 0,h=c?.sign_in_provider;return{claims:r,token:s,authTime:$t(Si(r.auth_time)),issuedAtTime:$t(Si(r.iat)),expirationTime:$t(Si(r.exp)),signInProvider:h||null,signInSecondFactor:c?.sign_in_second_factor||null}}function Si(n){return Number(n)*1e3}function qi(n){const[e,t,s]=n.split(".");if(e===void 0||t===void 0||s===void 0)return Sn("JWT malformed, contained fewer than 3 sections"),null;try{const r=lo(t);return r?JSON.parse(r):(Sn("Failed to decode base64 JWT payload"),null)}catch(r){return Sn("Caught error parsing JWT payload as JSON",r?.toString()),null}}function _r(n){const e=qi(n);return R(e,"internal-error"),R(typeof e.exp<"u","internal-error"),R(typeof e.iat<"u","internal-error"),Number(e.exp)-Number(e.iat)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function Kt(n,e,t=!1){if(t)return e;try{return await e}catch(s){throw s instanceof _e&&Xh(s)&&n.auth.currentUser===n&&await n.auth.signOut(),s}}function Xh({code:n}){return n==="auth/user-disabled"||n==="auth/user-token-expired"}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Qh{constructor(e){this.user=e,this.isRunning=!1,this.timerId=null,this.errorBackoff=3e4}_start(){this.isRunning||(this.isRunning=!0,this.schedule())}_stop(){this.isRunning&&(this.isRunning=!1,this.timerId!==null&&clearTimeout(this.timerId))}getInterval(e){if(e){const t=this.errorBackoff;return this.errorBackoff=Math.min(this.errorBackoff*2,96e4),t}else{this.errorBackoff=3e4;const s=(this.user.stsTokenManager.expirationTime??0)-Date.now()-3e5;return Math.max(0,s)}}schedule(e=!1){if(!this.isRunning)return;const t=this.getInterval(e);this.timerId=setTimeout(async()=>{await this.iteration()},t)}async iteration(){try{await this.user.getIdToken(!0)}catch(e){e?.code==="auth/network-request-failed"&&this.schedule(!0);return}this.schedule()}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Mi{constructor(e,t){this.createdAt=e,this.lastLoginAt=t,this._initializeTime()}_initializeTime(){this.lastSignInTime=$t(this.lastLoginAt),this.creationTime=$t(this.createdAt)}_copy(e){this.createdAt=e.createdAt,this.lastLoginAt=e.lastLoginAt,this._initializeTime()}toJSON(){return{createdAt:this.createdAt,lastLoginAt:this.lastLoginAt}}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function Dn(n){const e=n.auth,t=await n.getIdToken(),s=await Kt(n,Nn(e,{idToken:t}));R(s?.users.length,e,"internal-error");const r=s.users[0];n._notifyReloadListener(r);const c=r.providerUserInfo?.length?Ro(r.providerUserInfo):[],h=el(n.providerData,c),g=n.isAnonymous,w=!(n.email&&r.passwordHash)&&!h?.length,v=g?w:!1,A={uid:r.localId,displayName:r.displayName||null,photoURL:r.photoUrl||null,email:r.email||null,emailVerified:r.emailVerified||!1,phoneNumber:r.phoneNumber||null,tenantId:r.tenantId||null,providerData:h,metadata:new Mi(r.createdAt,r.lastLoginAt),isAnonymous:v};Object.assign(n,A)}async function Zh(n){const e=ye(n);await Dn(e),await e.auth._persistUserIfCurrent(e),e.auth._notifyListenersIfCurrent(e)}function el(n,e){return[...n.filter(s=>!e.some(r=>r.providerId===s.providerId)),...e]}function Ro(n){return n.map(({providerId:e,...t})=>({providerId:e,uid:t.rawId||"",displayName:t.displayName||null,email:t.email||null,phoneNumber:t.phoneNumber||null,photoURL:t.photoUrl||null}))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function tl(n,e){const t=await Ao(n,{},async()=>{const s=en({grant_type:"refresh_token",refresh_token:e}).slice(1),{tokenApiHost:r,apiKey:c}=n.config,h=await bo(n,r,"/v1/token",`key=${c}`),g=await n._getAdditionalHeaders();g["Content-Type"]="application/x-www-form-urlencoded";const w={method:"POST",headers:g,body:s};return n.emulatorConfig&&Qt(n.emulatorConfig.host)&&(w.credentials="include"),So.fetch()(h,w)});return{accessToken:t.access_token,expiresIn:t.expires_in,refreshToken:t.refresh_token}}async function nl(n,e){return He(n,"POST","/v2/accounts:revokeToken",at(n,e))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ft{constructor(){this.refreshToken=null,this.accessToken=null,this.expirationTime=null}get isExpired(){return!this.expirationTime||Date.now()>this.expirationTime-3e4}updateFromServerResponse(e){R(e.idToken,"internal-error"),R(typeof e.idToken<"u","internal-error"),R(typeof e.refreshToken<"u","internal-error");const t="expiresIn"in e&&typeof e.expiresIn<"u"?Number(e.expiresIn):_r(e.idToken);this.updateTokensAndExpiration(e.idToken,e.refreshToken,t)}updateFromIdToken(e){R(e.length!==0,"internal-error");const t=_r(e);this.updateTokensAndExpiration(e,null,t)}async getToken(e,t=!1){return!t&&this.accessToken&&!this.isExpired?this.accessToken:(R(this.refreshToken,e,"user-token-expired"),this.refreshToken?(await this.refresh(e,this.refreshToken),this.accessToken):null)}clearRefreshToken(){this.refreshToken=null}async refresh(e,t){const{accessToken:s,refreshToken:r,expiresIn:c}=await tl(e,t);this.updateTokensAndExpiration(s,r,Number(c))}updateTokensAndExpiration(e,t,s){this.refreshToken=t||null,this.accessToken=e||null,this.expirationTime=Date.now()+s*1e3}static fromJSON(e,t){const{refreshToken:s,accessToken:r,expirationTime:c}=t,h=new ft;return s&&(R(typeof s=="string","internal-error",{appName:e}),h.refreshToken=s),r&&(R(typeof r=="string","internal-error",{appName:e}),h.accessToken=r),c&&(R(typeof c=="number","internal-error",{appName:e}),h.expirationTime=c),h}toJSON(){return{refreshToken:this.refreshToken,accessToken:this.accessToken,expirationTime:this.expirationTime}}_assign(e){this.accessToken=e.accessToken,this.refreshToken=e.refreshToken,this.expirationTime=e.expirationTime}_clone(){return Object.assign(new ft,this.toJSON())}_performRefresh(){return we("not implemented")}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function De(n,e){R(typeof n=="string"||typeof n>"u","internal-error",{appName:e})}class oe{constructor({uid:e,auth:t,stsTokenManager:s,...r}){this.providerId="firebase",this.proactiveRefresh=new Qh(this),this.reloadUserInfo=null,this.reloadListener=null,this.uid=e,this.auth=t,this.stsTokenManager=s,this.accessToken=s.accessToken,this.displayName=r.displayName||null,this.email=r.email||null,this.emailVerified=r.emailVerified||!1,this.phoneNumber=r.phoneNumber||null,this.photoURL=r.photoURL||null,this.isAnonymous=r.isAnonymous||!1,this.tenantId=r.tenantId||null,this.providerData=r.providerData?[...r.providerData]:[],this.metadata=new Mi(r.createdAt||void 0,r.lastLoginAt||void 0)}async getIdToken(e){const t=await Kt(this,this.stsTokenManager.getToken(this.auth,e));return R(t,this.auth,"internal-error"),this.accessToken!==t&&(this.accessToken=t,await this.auth._persistUserIfCurrent(this),this.auth._notifyListenersIfCurrent(this)),t}getIdTokenResult(e){return Yh(this,e)}reload(){return Zh(this)}_assign(e){this!==e&&(R(this.uid===e.uid,this.auth,"internal-error"),this.displayName=e.displayName,this.photoURL=e.photoURL,this.email=e.email,this.emailVerified=e.emailVerified,this.phoneNumber=e.phoneNumber,this.isAnonymous=e.isAnonymous,this.tenantId=e.tenantId,this.providerData=e.providerData.map(t=>({...t})),this.metadata._copy(e.metadata),this.stsTokenManager._assign(e.stsTokenManager))}_clone(e){const t=new oe({...this,auth:e,stsTokenManager:this.stsTokenManager._clone()});return t.metadata._copy(this.metadata),t}_onReload(e){R(!this.reloadListener,this.auth,"internal-error"),this.reloadListener=e,this.reloadUserInfo&&(this._notifyReloadListener(this.reloadUserInfo),this.reloadUserInfo=null)}_notifyReloadListener(e){this.reloadListener?this.reloadListener(e):this.reloadUserInfo=e}_startProactiveRefresh(){this.proactiveRefresh._start()}_stopProactiveRefresh(){this.proactiveRefresh._stop()}async _updateTokensIfNecessary(e,t=!1){let s=!1;e.idToken&&e.idToken!==this.stsTokenManager.accessToken&&(this.stsTokenManager.updateFromServerResponse(e),s=!0),t&&await Dn(this),await this.auth._persistUserIfCurrent(this),s&&this.auth._notifyListenersIfCurrent(this)}async delete(){if(ie(this.auth.app))return Promise.reject(je(this.auth));const e=await this.getIdToken();return await Kt(this,Jh(this.auth,{idToken:e})),this.stsTokenManager.clearRefreshToken(),this.auth.signOut()}toJSON(){return{uid:this.uid,email:this.email||void 0,emailVerified:this.emailVerified,displayName:this.displayName||void 0,isAnonymous:this.isAnonymous,photoURL:this.photoURL||void 0,phoneNumber:this.phoneNumber||void 0,tenantId:this.tenantId||void 0,providerData:this.providerData.map(e=>({...e})),stsTokenManager:this.stsTokenManager.toJSON(),_redirectEventId:this._redirectEventId,...this.metadata.toJSON(),apiKey:this.auth.config.apiKey,appName:this.auth.name}}get refreshToken(){return this.stsTokenManager.refreshToken||""}static _fromJSON(e,t){const s=t.displayName??void 0,r=t.email??void 0,c=t.phoneNumber??void 0,h=t.photoURL??void 0,g=t.tenantId??void 0,w=t._redirectEventId??void 0,v=t.createdAt??void 0,A=t.lastLoginAt??void 0,{uid:b,emailVerified:S,isAnonymous:M,providerData:O,stsTokenManager:B}=t;R(b&&B,e,"internal-error");const V=ft.fromJSON(this.name,B);R(typeof b=="string",e,"internal-error"),De(s,e.name),De(r,e.name),R(typeof S=="boolean",e,"internal-error"),R(typeof M=="boolean",e,"internal-error"),De(c,e.name),De(h,e.name),De(g,e.name),De(w,e.name),De(v,e.name),De(A,e.name);const Q=new oe({uid:b,auth:e,email:r,emailVerified:S,displayName:s,isAnonymous:M,photoURL:h,phoneNumber:c,tenantId:g,stsTokenManager:V,createdAt:v,lastLoginAt:A});return O&&Array.isArray(O)&&(Q.providerData=O.map(Z=>({...Z}))),w&&(Q._redirectEventId=w),Q}static async _fromIdTokenResponse(e,t,s=!1){const r=new ft;r.updateFromServerResponse(t);const c=new oe({uid:t.localId,auth:e,stsTokenManager:r,isAnonymous:s});return await Dn(c),c}static async _fromGetAccountInfoResponse(e,t,s){const r=t.users[0];R(r.localId!==void 0,"internal-error");const c=r.providerUserInfo!==void 0?Ro(r.providerUserInfo):[],h=!(r.email&&r.passwordHash)&&!c?.length,g=new ft;g.updateFromIdToken(s);const w=new oe({uid:r.localId,auth:e,stsTokenManager:g,isAnonymous:h}),v={uid:r.localId,displayName:r.displayName||null,photoURL:r.photoUrl||null,email:r.email||null,emailVerified:r.emailVerified||!1,phoneNumber:r.phoneNumber||null,tenantId:r.tenantId||null,providerData:c,metadata:new Mi(r.createdAt,r.lastLoginAt),isAnonymous:!(r.email&&r.passwordHash)&&!c?.length};return Object.assign(w,v),w}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const yr=new Map;function Ie(n){Te(n instanceof Function,"Expected a class definition");let e=yr.get(n);return e?(Te(e instanceof n,"Instance stored in cache mismatched with class"),e):(e=new n,yr.set(n,e),e)}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Co{constructor(){this.type="NONE",this.storage={}}async _isAvailable(){return!0}async _set(e,t){this.storage[e]=t}async _get(e){const t=this.storage[e];return t===void 0?null:t}async _remove(e){delete this.storage[e]}_addListener(e,t){}_removeListener(e,t){}}Co.type="NONE";const Er=Co;/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function An(n,e,t){return`firebase:${n}:${e}:${t}`}class pt{constructor(e,t,s){this.persistence=e,this.auth=t,this.userKey=s;const{config:r,name:c}=this.auth;this.fullUserKey=An(this.userKey,r.apiKey,c),this.fullPersistenceKey=An("persistence",r.apiKey,c),this.boundEventHandler=t._onStorageEvent.bind(t),this.persistence._addListener(this.fullUserKey,this.boundEventHandler)}setCurrentUser(e){return this.persistence._set(this.fullUserKey,e.toJSON())}async getCurrentUser(){const e=await this.persistence._get(this.fullUserKey);if(!e)return null;if(typeof e=="string"){const t=await Nn(this.auth,{idToken:e}).catch(()=>{});return t?oe._fromGetAccountInfoResponse(this.auth,t,e):null}return oe._fromJSON(this.auth,e)}removeCurrentUser(){return this.persistence._remove(this.fullUserKey)}savePersistenceForRedirect(){return this.persistence._set(this.fullPersistenceKey,this.persistence.type)}async setPersistence(e){if(this.persistence===e)return;const t=await this.getCurrentUser();if(await this.removeCurrentUser(),this.persistence=e,t)return this.setCurrentUser(t)}delete(){this.persistence._removeListener(this.fullUserKey,this.boundEventHandler)}static async create(e,t,s="authUser"){if(!t.length)return new pt(Ie(Er),e,s);const r=(await Promise.all(t.map(async v=>{if(await v._isAvailable())return v}))).filter(v=>v);let c=r[0]||Ie(Er);const h=An(s,e.config.apiKey,e.name);let g=null;for(const v of t)try{const A=await v._get(h);if(A){let b;if(typeof A=="string"){const S=await Nn(e,{idToken:A}).catch(()=>{});if(!S)break;b=await oe._fromGetAccountInfoResponse(e,S,A)}else b=oe._fromJSON(e,A);v!==c&&(g=b),c=v;break}}catch{}const w=r.filter(v=>v._shouldAllowMigration);return!c._shouldAllowMigration||!w.length?new pt(c,e,s):(c=w[0],g&&await c._set(h,g.toJSON()),await Promise.all(t.map(async v=>{if(v!==c)try{await v._remove(h)}catch{}})),new pt(c,e,s))}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function wr(n){const e=n.toLowerCase();if(e.includes("opera/")||e.includes("opr/")||e.includes("opios/"))return"Opera";if(No(e))return"IEMobile";if(e.includes("msie")||e.includes("trident/"))return"IE";if(e.includes("edge/"))return"Edge";if(Po(e))return"Firefox";if(e.includes("silk/"))return"Silk";if(Lo(e))return"Blackberry";if(Mo(e))return"Webos";if(ko(e))return"Safari";if((e.includes("chrome/")||Oo(e))&&!e.includes("edge/"))return"Chrome";if(Do(e))return"Android";{const t=/([a-zA-Z\d\.]+)\/[a-zA-Z\d\.]*$/,s=n.match(t);if(s?.length===2)return s[1]}return"Other"}function Po(n=J()){return/firefox\//i.test(n)}function ko(n=J()){const e=n.toLowerCase();return e.includes("safari/")&&!e.includes("chrome/")&&!e.includes("crios/")&&!e.includes("android")}function Oo(n=J()){return/crios\//i.test(n)}function No(n=J()){return/iemobile/i.test(n)}function Do(n=J()){return/android/i.test(n)}function Lo(n=J()){return/blackberry/i.test(n)}function Mo(n=J()){return/webos/i.test(n)}function zi(n=J()){return/iphone|ipad|ipod/i.test(n)||/macintosh/i.test(n)&&/mobile/i.test(n)}function il(n=J()){return zi(n)&&!!window.navigator?.standalone}function sl(){return _c()&&document.documentMode===10}function Uo(n=J()){return zi(n)||Do(n)||Mo(n)||Lo(n)||/windows phone/i.test(n)||No(n)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function xo(n,e=[]){let t;switch(n){case"Browser":t=wr(J());break;case"Worker":t=`${wr(J())}-${n}`;break;default:t=n}const s=e.length?e.join(","):"FirebaseCore-web";return`${t}/JsCore/${wt}/${s}`}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class rl{constructor(e){this.auth=e,this.queue=[]}pushCallback(e,t){const s=c=>new Promise((h,g)=>{try{const w=e(c);h(w)}catch(w){g(w)}});s.onAbort=t,this.queue.push(s);const r=this.queue.length-1;return()=>{this.queue[r]=()=>Promise.resolve()}}async runMiddleware(e){if(this.auth.currentUser===e)return;const t=[];try{for(const s of this.queue)await s(e),s.onAbort&&t.push(s.onAbort)}catch(s){t.reverse();for(const r of t)try{r()}catch{}throw this.auth._errorFactory.create("login-blocked",{originalMessage:s?.message})}}}/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function ol(n,e={}){return He(n,"GET","/v2/passwordPolicy",at(n,e))}/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const al=6;class cl{constructor(e){const t=e.customStrengthOptions;this.customStrengthOptions={},this.customStrengthOptions.minPasswordLength=t.minPasswordLength??al,t.maxPasswordLength&&(this.customStrengthOptions.maxPasswordLength=t.maxPasswordLength),t.containsLowercaseCharacter!==void 0&&(this.customStrengthOptions.containsLowercaseLetter=t.containsLowercaseCharacter),t.containsUppercaseCharacter!==void 0&&(this.customStrengthOptions.containsUppercaseLetter=t.containsUppercaseCharacter),t.containsNumericCharacter!==void 0&&(this.customStrengthOptions.containsNumericCharacter=t.containsNumericCharacter),t.containsNonAlphanumericCharacter!==void 0&&(this.customStrengthOptions.containsNonAlphanumericCharacter=t.containsNonAlphanumericCharacter),this.enforcementState=e.enforcementState,this.enforcementState==="ENFORCEMENT_STATE_UNSPECIFIED"&&(this.enforcementState="OFF"),this.allowedNonAlphanumericCharacters=e.allowedNonAlphanumericCharacters?.join("")??"",this.forceUpgradeOnSignin=e.forceUpgradeOnSignin??!1,this.schemaVersion=e.schemaVersion}validatePassword(e){const t={isValid:!0,passwordPolicy:this};return this.validatePasswordLengthOptions(e,t),this.validatePasswordCharacterOptions(e,t),t.isValid&&(t.isValid=t.meetsMinPasswordLength??!0),t.isValid&&(t.isValid=t.meetsMaxPasswordLength??!0),t.isValid&&(t.isValid=t.containsLowercaseLetter??!0),t.isValid&&(t.isValid=t.containsUppercaseLetter??!0),t.isValid&&(t.isValid=t.containsNumericCharacter??!0),t.isValid&&(t.isValid=t.containsNonAlphanumericCharacter??!0),t}validatePasswordLengthOptions(e,t){const s=this.customStrengthOptions.minPasswordLength,r=this.customStrengthOptions.maxPasswordLength;s&&(t.meetsMinPasswordLength=e.length>=s),r&&(t.meetsMaxPasswordLength=e.length<=r)}validatePasswordCharacterOptions(e,t){this.updatePasswordCharacterOptionsStatuses(t,!1,!1,!1,!1);let s;for(let r=0;r<e.length;r++)s=e.charAt(r),this.updatePasswordCharacterOptionsStatuses(t,s>="a"&&s<="z",s>="A"&&s<="Z",s>="0"&&s<="9",this.allowedNonAlphanumericCharacters.includes(s))}updatePasswordCharacterOptionsStatuses(e,t,s,r,c){this.customStrengthOptions.containsLowercaseLetter&&(e.containsLowercaseLetter||(e.containsLowercaseLetter=t)),this.customStrengthOptions.containsUppercaseLetter&&(e.containsUppercaseLetter||(e.containsUppercaseLetter=s)),this.customStrengthOptions.containsNumericCharacter&&(e.containsNumericCharacter||(e.containsNumericCharacter=r)),this.customStrengthOptions.containsNonAlphanumericCharacter&&(e.containsNonAlphanumericCharacter||(e.containsNonAlphanumericCharacter=c))}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class hl{constructor(e,t,s,r){this.app=e,this.heartbeatServiceProvider=t,this.appCheckServiceProvider=s,this.config=r,this.currentUser=null,this.emulatorConfig=null,this.operations=Promise.resolve(),this.authStateSubscription=new Ir(this),this.idTokenSubscription=new Ir(this),this.beforeStateQueue=new rl(this),this.redirectUser=null,this.isProactiveRefreshEnabled=!1,this.EXPECTED_PASSWORD_POLICY_SCHEMA_VERSION=1,this._canInitEmulator=!0,this._isInitialized=!1,this._deleted=!1,this._initializationPromise=null,this._popupRedirectResolver=null,this._errorFactory=vo,this._agentRecaptchaConfig=null,this._tenantRecaptchaConfigs={},this._projectPasswordPolicy=null,this._tenantPasswordPolicies={},this._resolvePersistenceManagerAvailable=void 0,this.lastNotifiedUid=void 0,this.languageCode=null,this.tenantId=null,this.settings={appVerificationDisabledForTesting:!1},this.frameworks=[],this.name=e.name,this.clientVersion=r.sdkClientVersion,this._persistenceManagerAvailable=new Promise(c=>this._resolvePersistenceManagerAvailable=c)}_initializeWithPersistence(e,t){return t&&(this._popupRedirectResolver=Ie(t)),this._initializationPromise=this.queue(async()=>{if(!this._deleted&&(this.persistenceManager=await pt.create(this,e),this._resolvePersistenceManagerAvailable?.(),!this._deleted)){if(this._popupRedirectResolver?._shouldInitProactively)try{await this._popupRedirectResolver._initialize(this)}catch{}await this.initializeCurrentUser(t),this.lastNotifiedUid=this.currentUser?.uid||null,!this._deleted&&(this._isInitialized=!0)}}),this._initializationPromise}async _onStorageEvent(){if(this._deleted)return;const e=await this.assertedPersistence.getCurrentUser();if(!(!this.currentUser&&!e)){if(this.currentUser&&e&&this.currentUser.uid===e.uid){this._currentUser._assign(e),await this.currentUser.getIdToken();return}await this._updateCurrentUser(e,!0)}}async initializeCurrentUserFromIdToken(e){try{const t=await Nn(this,{idToken:e}),s=await oe._fromGetAccountInfoResponse(this,t,e);await this.directlySetCurrentUser(s)}catch(t){console.warn("FirebaseServerApp could not login user with provided authIdToken: ",t),await this.directlySetCurrentUser(null)}}async initializeCurrentUser(e){if(ie(this.app)){const c=this.app.settings.authIdToken;return c?new Promise(h=>{setTimeout(()=>this.initializeCurrentUserFromIdToken(c).then(h,h))}):this.directlySetCurrentUser(null)}const t=await this.assertedPersistence.getCurrentUser();let s=t,r=!1;if(e&&this.config.authDomain){await this.getOrInitRedirectPersistenceManager();const c=this.redirectUser?._redirectEventId,h=s?._redirectEventId,g=await this.tryRedirectSignIn(e);(!c||c===h)&&g?.user&&(s=g.user,r=!0)}if(!s)return this.directlySetCurrentUser(null);if(!s._redirectEventId){if(r)try{await this.beforeStateQueue.runMiddleware(s)}catch(c){s=t,this._popupRedirectResolver._overrideRedirectResult(this,()=>Promise.reject(c))}return s?this.reloadAndSetCurrentUserOrClear(s):this.directlySetCurrentUser(null)}return R(this._popupRedirectResolver,this,"argument-error"),await this.getOrInitRedirectPersistenceManager(),this.redirectUser&&this.redirectUser._redirectEventId===s._redirectEventId?this.directlySetCurrentUser(s):this.reloadAndSetCurrentUserOrClear(s)}async tryRedirectSignIn(e){let t=null;try{t=await this._popupRedirectResolver._completeRedirectFn(this,e,!0)}catch{await this._setRedirectUser(null)}return t}async reloadAndSetCurrentUserOrClear(e){try{await Dn(e)}catch(t){if(t?.code!=="auth/network-request-failed")return this.directlySetCurrentUser(null)}return this.directlySetCurrentUser(e)}useDeviceLanguage(){this.languageCode=Bh()}async _delete(){this._deleted=!0}async updateCurrentUser(e){if(ie(this.app))return Promise.reject(je(this));const t=e?ye(e):null;return t&&R(t.auth.config.apiKey===this.config.apiKey,this,"invalid-user-token"),this._updateCurrentUser(t&&t._clone(this))}async _updateCurrentUser(e,t=!1){if(!this._deleted)return e&&R(this.tenantId===e.tenantId,this,"tenant-id-mismatch"),t||await this.beforeStateQueue.runMiddleware(e),this.queue(async()=>{await this.directlySetCurrentUser(e),this.notifyAuthListeners()})}async signOut(){return ie(this.app)?Promise.reject(je(this)):(await this.beforeStateQueue.runMiddleware(null),(this.redirectPersistenceManager||this._popupRedirectResolver)&&await this._setRedirectUser(null),this._updateCurrentUser(null,!0))}setPersistence(e){return ie(this.app)?Promise.reject(je(this)):this.queue(async()=>{await this.assertedPersistence.setPersistence(Ie(e))})}_getRecaptchaConfig(){return this.tenantId==null?this._agentRecaptchaConfig:this._tenantRecaptchaConfigs[this.tenantId]}async validatePassword(e){this._getPasswordPolicyInternal()||await this._updatePasswordPolicy();const t=this._getPasswordPolicyInternal();return t.schemaVersion!==this.EXPECTED_PASSWORD_POLICY_SCHEMA_VERSION?Promise.reject(this._errorFactory.create("unsupported-password-policy-schema-version",{})):t.validatePassword(e)}_getPasswordPolicyInternal(){return this.tenantId===null?this._projectPasswordPolicy:this._tenantPasswordPolicies[this.tenantId]}async _updatePasswordPolicy(){const e=await ol(this),t=new cl(e);this.tenantId===null?this._projectPasswordPolicy=t:this._tenantPasswordPolicies[this.tenantId]=t}_getPersistenceType(){return this.assertedPersistence.persistence.type}_getPersistence(){return this.assertedPersistence.persistence}_updateErrorMap(e){this._errorFactory=new Zt("auth","Firebase",e())}onAuthStateChanged(e,t,s){return this.registerStateListener(this.authStateSubscription,e,t,s)}beforeAuthStateChanged(e,t){return this.beforeStateQueue.pushCallback(e,t)}onIdTokenChanged(e,t,s){return this.registerStateListener(this.idTokenSubscription,e,t,s)}authStateReady(){return new Promise((e,t)=>{if(this.currentUser)e();else{const s=this.onAuthStateChanged(()=>{s(),e()},t)}})}async revokeAccessToken(e){if(this.currentUser){const t=await this.currentUser.getIdToken(),s={providerId:"apple.com",tokenType:"ACCESS_TOKEN",token:e,idToken:t};this.tenantId!=null&&(s.tenantId=this.tenantId),await nl(this,s)}}toJSON(){return{apiKey:this.config.apiKey,authDomain:this.config.authDomain,appName:this.name,currentUser:this._currentUser?.toJSON()}}async _setRedirectUser(e,t){const s=await this.getOrInitRedirectPersistenceManager(t);return e===null?s.removeCurrentUser():s.setCurrentUser(e)}async getOrInitRedirectPersistenceManager(e){if(!this.redirectPersistenceManager){const t=e&&Ie(e)||this._popupRedirectResolver;R(t,this,"argument-error"),this.redirectPersistenceManager=await pt.create(this,[Ie(t._redirectPersistence)],"redirectUser"),this.redirectUser=await this.redirectPersistenceManager.getCurrentUser()}return this.redirectPersistenceManager}async _redirectUserForId(e){return this._isInitialized&&await this.queue(async()=>{}),this._currentUser?._redirectEventId===e?this._currentUser:this.redirectUser?._redirectEventId===e?this.redirectUser:null}async _persistUserIfCurrent(e){if(e===this.currentUser)return this.queue(async()=>this.directlySetCurrentUser(e))}_notifyListenersIfCurrent(e){e===this.currentUser&&this.notifyAuthListeners()}_key(){return`${this.config.authDomain}:${this.config.apiKey}:${this.name}`}_startProactiveRefresh(){this.isProactiveRefreshEnabled=!0,this.currentUser&&this._currentUser._startProactiveRefresh()}_stopProactiveRefresh(){this.isProactiveRefreshEnabled=!1,this.currentUser&&this._currentUser._stopProactiveRefresh()}get _currentUser(){return this.currentUser}notifyAuthListeners(){if(!this._isInitialized)return;this.idTokenSubscription.next(this.currentUser);const e=this.currentUser?.uid??null;this.lastNotifiedUid!==e&&(this.lastNotifiedUid=e,this.authStateSubscription.next(this.currentUser))}registerStateListener(e,t,s,r){if(this._deleted)return()=>{};const c=typeof t=="function"?t:t.next.bind(t);let h=!1;const g=this._isInitialized?Promise.resolve():this._initializationPromise;if(R(g,this,"internal-error"),g.then(()=>{h||c(this.currentUser)}),typeof t=="function"){const w=e.addObserver(t,s,r);return()=>{h=!0,w()}}else{const w=e.addObserver(t);return()=>{h=!0,w()}}}async directlySetCurrentUser(e){this.currentUser&&this.currentUser!==e&&this._currentUser._stopProactiveRefresh(),e&&this.isProactiveRefreshEnabled&&e._startProactiveRefresh(),this.currentUser=e,e?await this.assertedPersistence.setCurrentUser(e):await this.assertedPersistence.removeCurrentUser()}queue(e){return this.operations=this.operations.then(e,e),this.operations}get assertedPersistence(){return R(this.persistenceManager,this,"internal-error"),this.persistenceManager}_logFramework(e){!e||this.frameworks.includes(e)||(this.frameworks.push(e),this.frameworks.sort(),this.clientVersion=xo(this.config.clientPlatform,this._getFrameworks()))}_getFrameworks(){return this.frameworks}async _getAdditionalHeaders(){const e={"X-Client-Version":this.clientVersion};this.app.options.appId&&(e["X-Firebase-gmpid"]=this.app.options.appId);const t=await this.heartbeatServiceProvider.getImmediate({optional:!0})?.getHeartbeatsHeader();t&&(e["X-Firebase-Client"]=t);const s=await this._getAppCheckToken();return s&&(e["X-Firebase-AppCheck"]=s),e}async _getAppCheckToken(){if(ie(this.app)&&this.app.settings.appCheckToken)return this.app.settings.appCheckToken;const e=await this.appCheckServiceProvider.getImmediate({optional:!0})?.getToken();return e?.error&&Fh(`Error while retrieving App Check token: ${e.error}`),e?.token}}function It(n){return ye(n)}class Ir{constructor(e){this.auth=e,this.observer=null,this.addObserver=Sc(t=>this.observer=t)}get next(){return R(this.observer,this.auth,"internal-error"),this.observer.next.bind(this.observer)}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let $n={async loadJS(){throw new Error("Unable to load external scripts")},recaptchaV2Script:"",recaptchaEnterpriseScript:"",gapiScript:""};function ll(n){$n=n}function Fo(n){return $n.loadJS(n)}function ul(){return $n.recaptchaEnterpriseScript}function dl(){return $n.gapiScript}function fl(n){return`__${n}${Math.floor(Math.random()*1e6)}`}class pl{constructor(){this.enterprise=new gl}ready(e){e()}execute(e,t){return Promise.resolve("token")}render(e,t){return""}}class gl{ready(e){e()}execute(e,t){return Promise.resolve("token")}render(e,t){return""}}const ml="recaptcha-enterprise",Vo="NO_RECAPTCHA";class _l{constructor(e){this.type=ml,this.auth=It(e)}async verify(e="verify",t=!1){async function s(c){if(!t){if(c.tenantId==null&&c._agentRecaptchaConfig!=null)return c._agentRecaptchaConfig.siteKey;if(c.tenantId!=null&&c._tenantRecaptchaConfigs[c.tenantId]!==void 0)return c._tenantRecaptchaConfigs[c.tenantId].siteKey}return new Promise(async(h,g)=>{Kh(c,{clientType:"CLIENT_TYPE_WEB",version:"RECAPTCHA_ENTERPRISE"}).then(w=>{if(w.recaptchaKey===void 0)g(new Error("recaptcha Enterprise site key undefined"));else{const v=new zh(w);return c.tenantId==null?c._agentRecaptchaConfig=v:c._tenantRecaptchaConfigs[c.tenantId]=v,h(v.siteKey)}}).catch(w=>{g(w)})})}function r(c,h,g){const w=window.grecaptcha;mr(w)?w.enterprise.ready(()=>{w.enterprise.execute(c,{action:e}).then(v=>{h(v)}).catch(()=>{h(Vo)})}):g(Error("No reCAPTCHA enterprise script loaded."))}return this.auth.settings.appVerificationDisabledForTesting?new pl().execute("siteKey",{action:"verify"}):new Promise((c,h)=>{s(this.auth).then(g=>{if(!t&&mr(window.grecaptcha))r(g,c,h);else{if(typeof window>"u"){h(new Error("RecaptchaVerifier is only supported in browser"));return}let w=ul();w.length!==0&&(w+=g),Fo(w).then(()=>{r(g,c,h)}).catch(v=>{h(v)})}}).catch(g=>{h(g)})})}}async function vr(n,e,t,s=!1,r=!1){const c=new _l(n);let h;if(r)h=Vo;else try{h=await c.verify(t)}catch{h=await c.verify(t,!0)}const g={...e};if(t==="mfaSmsEnrollment"||t==="mfaSmsSignIn"){if("phoneEnrollmentInfo"in g){const w=g.phoneEnrollmentInfo.phoneNumber,v=g.phoneEnrollmentInfo.recaptchaToken;Object.assign(g,{phoneEnrollmentInfo:{phoneNumber:w,recaptchaToken:v,captchaResponse:h,clientType:"CLIENT_TYPE_WEB",recaptchaVersion:"RECAPTCHA_ENTERPRISE"}})}else if("phoneSignInInfo"in g){const w=g.phoneSignInInfo.recaptchaToken;Object.assign(g,{phoneSignInInfo:{recaptchaToken:w,captchaResponse:h,clientType:"CLIENT_TYPE_WEB",recaptchaVersion:"RECAPTCHA_ENTERPRISE"}})}return g}return s?Object.assign(g,{captchaResp:h}):Object.assign(g,{captchaResponse:h}),Object.assign(g,{clientType:"CLIENT_TYPE_WEB"}),Object.assign(g,{recaptchaVersion:"RECAPTCHA_ENTERPRISE"}),g}async function Tr(n,e,t,s,r){if(n._getRecaptchaConfig()?.isProviderEnabled("EMAIL_PASSWORD_PROVIDER")){const c=await vr(n,e,t,t==="getOobCode");return s(n,c)}else return s(n,e).catch(async c=>{if(c.code==="auth/missing-recaptcha-token"){console.log(`${t} is protected by reCAPTCHA Enterprise for this project. Automatically triggering the reCAPTCHA flow and restarting the flow.`);const h=await vr(n,e,t,t==="getOobCode");return s(n,h)}else return Promise.reject(c)})}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function yl(n,e){const t=jn(n,"auth");if(t.isInitialized()){const r=t.getImmediate(),c=t.getOptions();if(it(c,e??{}))return r;ce(r,"already-initialized")}return t.initialize({options:e})}function El(n,e){const t=e?.persistence||[],s=(Array.isArray(t)?t:[t]).map(Ie);e?.errorMap&&n._updateErrorMap(e.errorMap),n._initializeWithPersistence(s,e?.popupRedirectResolver)}function wl(n,e,t){const s=It(n);R(/^https?:\/\//.test(e),s,"invalid-emulator-scheme");const r=!1,c=jo(e),{host:h,port:g}=Il(e),w=g===null?"":`:${g}`,v={url:`${c}//${h}${w}/`},A=Object.freeze({host:h,port:g,protocol:c.replace(":",""),options:Object.freeze({disableWarnings:r})});if(!s._canInitEmulator){R(s.config.emulator&&s.emulatorConfig,s,"emulator-config-failed"),R(it(v,s.config.emulator)&&it(A,s.emulatorConfig),s,"emulator-config-failed");return}s.config.emulator=v,s.emulatorConfig=A,s.settings.appVerificationDisabledForTesting=!0,Qt(h)?(go(`${c}//${h}${w}`),mo("Auth",!0)):vl()}function jo(n){const e=n.indexOf(":");return e<0?"":n.substr(0,e+1)}function Il(n){const e=jo(n),t=/(\/\/)?([^?#/]+)/.exec(n.substr(e.length));if(!t)return{host:"",port:null};const s=t[2].split("@").pop()||"",r=/^(\[[^\]]+\])(:|$)/.exec(s);if(r){const c=r[1];return{host:c,port:Sr(s.substr(c.length+1))}}else{const[c,h]=s.split(":");return{host:c,port:Sr(h)}}}function Sr(n){if(!n)return null;const e=Number(n);return isNaN(e)?null:e}function vl(){function n(){const e=document.createElement("p"),t=e.style;e.innerText="Running in emulator mode. Do not use with production credentials.",t.position="fixed",t.width="100%",t.backgroundColor="#ffffff",t.border=".1em solid #000000",t.color="#b50000",t.bottom="0px",t.left="0px",t.margin="0px",t.zIndex="10000",t.textAlign="center",e.classList.add("firebase-emulator-warning"),document.body.appendChild(e)}typeof console<"u"&&typeof console.info=="function"&&console.info("WARNING: You are using the Auth Emulator, which is intended for local testing only.  Do not use with production credentials."),typeof window<"u"&&typeof document<"u"&&(document.readyState==="loading"?window.addEventListener("DOMContentLoaded",n):n())}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ki{constructor(e,t){this.providerId=e,this.signInMethod=t}toJSON(){return we("not implemented")}_getIdTokenResponse(e){return we("not implemented")}_linkToIdToken(e,t){return we("not implemented")}_getReauthenticationResolver(e){return we("not implemented")}}async function Tl(n,e){return He(n,"POST","/v1/accounts:signUp",e)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function Sl(n,e){return Bn(n,"POST","/v1/accounts:signInWithPassword",at(n,e))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function Al(n,e){return Bn(n,"POST","/v1/accounts:signInWithEmailLink",at(n,e))}async function bl(n,e){return Bn(n,"POST","/v1/accounts:signInWithEmailLink",at(n,e))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Jt extends Ki{constructor(e,t,s,r=null){super("password",s),this._email=e,this._password=t,this._tenantId=r}static _fromEmailAndPassword(e,t){return new Jt(e,t,"password")}static _fromEmailAndCode(e,t,s=null){return new Jt(e,t,"emailLink",s)}toJSON(){return{email:this._email,password:this._password,signInMethod:this.signInMethod,tenantId:this._tenantId}}static fromJSON(e){const t=typeof e=="string"?JSON.parse(e):e;if(t?.email&&t?.password){if(t.signInMethod==="password")return this._fromEmailAndPassword(t.email,t.password);if(t.signInMethod==="emailLink")return this._fromEmailAndCode(t.email,t.password,t.tenantId)}return null}async _getIdTokenResponse(e){switch(this.signInMethod){case"password":const t={returnSecureToken:!0,email:this._email,password:this._password,clientType:"CLIENT_TYPE_WEB"};return Tr(e,t,"signInWithPassword",Sl);case"emailLink":return Al(e,{email:this._email,oobCode:this._password});default:ce(e,"internal-error")}}async _linkToIdToken(e,t){switch(this.signInMethod){case"password":const s={idToken:t,returnSecureToken:!0,email:this._email,password:this._password,clientType:"CLIENT_TYPE_WEB"};return Tr(e,s,"signUpPassword",Tl);case"emailLink":return bl(e,{idToken:t,email:this._email,oobCode:this._password});default:ce(e,"internal-error")}}_getReauthenticationResolver(e){return this._getIdTokenResponse(e)}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function gt(n,e){return Bn(n,"POST","/v1/accounts:signInWithIdp",at(n,e))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Rl="http://localhost";class rt extends Ki{constructor(){super(...arguments),this.pendingToken=null}static _fromParams(e){const t=new rt(e.providerId,e.signInMethod);return e.idToken||e.accessToken?(e.idToken&&(t.idToken=e.idToken),e.accessToken&&(t.accessToken=e.accessToken),e.nonce&&!e.pendingToken&&(t.nonce=e.nonce),e.pendingToken&&(t.pendingToken=e.pendingToken)):e.oauthToken&&e.oauthTokenSecret?(t.accessToken=e.oauthToken,t.secret=e.oauthTokenSecret):ce("argument-error"),t}toJSON(){return{idToken:this.idToken,accessToken:this.accessToken,secret:this.secret,nonce:this.nonce,pendingToken:this.pendingToken,providerId:this.providerId,signInMethod:this.signInMethod}}static fromJSON(e){const t=typeof e=="string"?JSON.parse(e):e,{providerId:s,signInMethod:r,...c}=t;if(!s||!r)return null;const h=new rt(s,r);return h.idToken=c.idToken||void 0,h.accessToken=c.accessToken||void 0,h.secret=c.secret,h.nonce=c.nonce,h.pendingToken=c.pendingToken||null,h}_getIdTokenResponse(e){const t=this.buildRequest();return gt(e,t)}_linkToIdToken(e,t){const s=this.buildRequest();return s.idToken=t,gt(e,s)}_getReauthenticationResolver(e){const t=this.buildRequest();return t.autoCreate=!1,gt(e,t)}buildRequest(){const e={requestUri:Rl,returnSecureToken:!0};if(this.pendingToken)e.pendingToken=this.pendingToken;else{const t={};this.idToken&&(t.id_token=this.idToken),this.accessToken&&(t.access_token=this.accessToken),this.secret&&(t.oauth_token_secret=this.secret),t.providerId=this.providerId,this.nonce&&!this.pendingToken&&(t.nonce=this.nonce),e.postBody=en(t)}return e}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Cl(n){switch(n){case"recoverEmail":return"RECOVER_EMAIL";case"resetPassword":return"PASSWORD_RESET";case"signIn":return"EMAIL_SIGNIN";case"verifyEmail":return"VERIFY_EMAIL";case"verifyAndChangeEmail":return"VERIFY_AND_CHANGE_EMAIL";case"revertSecondFactorAddition":return"REVERT_SECOND_FACTOR_ADDITION";default:return null}}function Pl(n){const e=Vt(jt(n)).link,t=e?Vt(jt(e)).deep_link_id:null,s=Vt(jt(n)).deep_link_id;return(s?Vt(jt(s)).link:null)||s||t||e||n}class Ji{constructor(e){const t=Vt(jt(e)),s=t.apiKey??null,r=t.oobCode??null,c=Cl(t.mode??null);R(s&&r&&c,"argument-error"),this.apiKey=s,this.operation=c,this.code=r,this.continueUrl=t.continueUrl??null,this.languageCode=t.lang??null,this.tenantId=t.tenantId??null}static parseLink(e){const t=Pl(e);try{return new Ji(t)}catch{return null}}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class vt{constructor(){this.providerId=vt.PROVIDER_ID}static credential(e,t){return Jt._fromEmailAndPassword(e,t)}static credentialWithLink(e,t){const s=Ji.parseLink(t);return R(s,"argument-error"),Jt._fromEmailAndCode(e,s.code,s.tenantId)}}vt.PROVIDER_ID="password";vt.EMAIL_PASSWORD_SIGN_IN_METHOD="password";vt.EMAIL_LINK_SIGN_IN_METHOD="emailLink";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Bo{constructor(e){this.providerId=e,this.defaultLanguageCode=null,this.customParameters={}}setDefaultLanguage(e){this.defaultLanguageCode=e}setCustomParameters(e){return this.customParameters=e,this}getCustomParameters(){return this.customParameters}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class nn extends Bo{constructor(){super(...arguments),this.scopes=[]}addScope(e){return this.scopes.includes(e)||this.scopes.push(e),this}getScopes(){return[...this.scopes]}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Le extends nn{constructor(){super("facebook.com")}static credential(e){return rt._fromParams({providerId:Le.PROVIDER_ID,signInMethod:Le.FACEBOOK_SIGN_IN_METHOD,accessToken:e})}static credentialFromResult(e){return Le.credentialFromTaggedObject(e)}static credentialFromError(e){return Le.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e||!("oauthAccessToken"in e)||!e.oauthAccessToken)return null;try{return Le.credential(e.oauthAccessToken)}catch{return null}}}Le.FACEBOOK_SIGN_IN_METHOD="facebook.com";Le.PROVIDER_ID="facebook.com";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Me extends nn{constructor(){super("google.com"),this.addScope("profile")}static credential(e,t){return rt._fromParams({providerId:Me.PROVIDER_ID,signInMethod:Me.GOOGLE_SIGN_IN_METHOD,idToken:e,accessToken:t})}static credentialFromResult(e){return Me.credentialFromTaggedObject(e)}static credentialFromError(e){return Me.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e)return null;const{oauthIdToken:t,oauthAccessToken:s}=e;if(!t&&!s)return null;try{return Me.credential(t,s)}catch{return null}}}Me.GOOGLE_SIGN_IN_METHOD="google.com";Me.PROVIDER_ID="google.com";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ue extends nn{constructor(){super("github.com")}static credential(e){return rt._fromParams({providerId:Ue.PROVIDER_ID,signInMethod:Ue.GITHUB_SIGN_IN_METHOD,accessToken:e})}static credentialFromResult(e){return Ue.credentialFromTaggedObject(e)}static credentialFromError(e){return Ue.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e||!("oauthAccessToken"in e)||!e.oauthAccessToken)return null;try{return Ue.credential(e.oauthAccessToken)}catch{return null}}}Ue.GITHUB_SIGN_IN_METHOD="github.com";Ue.PROVIDER_ID="github.com";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class xe extends nn{constructor(){super("twitter.com")}static credential(e,t){return rt._fromParams({providerId:xe.PROVIDER_ID,signInMethod:xe.TWITTER_SIGN_IN_METHOD,oauthToken:e,oauthTokenSecret:t})}static credentialFromResult(e){return xe.credentialFromTaggedObject(e)}static credentialFromError(e){return xe.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e)return null;const{oauthAccessToken:t,oauthTokenSecret:s}=e;if(!t||!s)return null;try{return xe.credential(t,s)}catch{return null}}}xe.TWITTER_SIGN_IN_METHOD="twitter.com";xe.PROVIDER_ID="twitter.com";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class _t{constructor(e){this.user=e.user,this.providerId=e.providerId,this._tokenResponse=e._tokenResponse,this.operationType=e.operationType}static async _fromIdTokenResponse(e,t,s,r=!1){const c=await oe._fromIdTokenResponse(e,s,r),h=Ar(s);return new _t({user:c,providerId:h,_tokenResponse:s,operationType:t})}static async _forOperation(e,t,s){await e._updateTokensIfNecessary(s,!0);const r=Ar(s);return new _t({user:e,providerId:r,_tokenResponse:s,operationType:t})}}function Ar(n){return n.providerId?n.providerId:"phoneNumber"in n?"phone":null}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ln extends _e{constructor(e,t,s,r){super(t.code,t.message),this.operationType=s,this.user=r,Object.setPrototypeOf(this,Ln.prototype),this.customData={appName:e.name,tenantId:e.tenantId??void 0,_serverResponse:t.customData._serverResponse,operationType:s}}static _fromErrorAndOperation(e,t,s,r){return new Ln(e,t,s,r)}}function $o(n,e,t,s){return(e==="reauthenticate"?t._getReauthenticationResolver(n):t._getIdTokenResponse(n)).catch(c=>{throw c.code==="auth/multi-factor-auth-required"?Ln._fromErrorAndOperation(n,c,e,s):c})}async function kl(n,e,t=!1){const s=await Kt(n,e._linkToIdToken(n.auth,await n.getIdToken()),t);return _t._forOperation(n,"link",s)}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function Ol(n,e,t=!1){const{auth:s}=n;if(ie(s.app))return Promise.reject(je(s));const r="reauthenticate";try{const c=await Kt(n,$o(s,r,e,n),t);R(c.idToken,s,"internal-error");const h=qi(c.idToken);R(h,s,"internal-error");const{sub:g}=h;return R(n.uid===g,s,"user-mismatch"),_t._forOperation(n,r,c)}catch(c){throw c?.code==="auth/user-not-found"&&ce(s,"user-mismatch"),c}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function Ho(n,e,t=!1){if(ie(n.app))return Promise.reject(je(n));const s="signIn",r=await $o(n,s,e),c=await _t._fromIdTokenResponse(n,s,r);return t||await n._updateCurrentUser(c.user),c}async function Nl(n,e){return Ho(It(n),e)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function Dl(n){const e=It(n);e._getPasswordPolicyInternal()&&await e._updatePasswordPolicy()}function Ll(n,e,t){return ie(n.app)?Promise.reject(je(n)):Nl(ye(n),vt.credential(e,t)).catch(async s=>{throw s.code==="auth/password-does-not-meet-requirements"&&Dl(n),s})}function Ml(n,e,t,s){return ye(n).onIdTokenChanged(e,t,s)}function Ul(n,e,t){return ye(n).beforeAuthStateChanged(e,t)}function xl(n,e,t,s){return ye(n).onAuthStateChanged(e,t,s)}function Fl(n){return ye(n).signOut()}const Mn="__sak";/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Go{constructor(e,t){this.storageRetriever=e,this.type=t}_isAvailable(){try{return this.storage?(this.storage.setItem(Mn,"1"),this.storage.removeItem(Mn),Promise.resolve(!0)):Promise.resolve(!1)}catch{return Promise.resolve(!1)}}_set(e,t){return this.storage.setItem(e,JSON.stringify(t)),Promise.resolve()}_get(e){const t=this.storage.getItem(e);return Promise.resolve(t?JSON.parse(t):null)}_remove(e){return this.storage.removeItem(e),Promise.resolve()}get storage(){return this.storageRetriever()}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Vl=1e3,jl=10;class Wo extends Go{constructor(){super(()=>window.localStorage,"LOCAL"),this.boundEventHandler=(e,t)=>this.onStorageEvent(e,t),this.listeners={},this.localCache={},this.pollTimer=null,this.fallbackToPolling=Uo(),this._shouldAllowMigration=!0}forAllChangedKeys(e){for(const t of Object.keys(this.listeners)){const s=this.storage.getItem(t),r=this.localCache[t];s!==r&&e(t,r,s)}}onStorageEvent(e,t=!1){if(!e.key){this.forAllChangedKeys((h,g,w)=>{this.notifyListeners(h,w)});return}const s=e.key;t?this.detachListener():this.stopPolling();const r=()=>{const h=this.storage.getItem(s);!t&&this.localCache[s]===h||this.notifyListeners(s,h)},c=this.storage.getItem(s);sl()&&c!==e.newValue&&e.newValue!==e.oldValue?setTimeout(r,jl):r()}notifyListeners(e,t){this.localCache[e]=t;const s=this.listeners[e];if(s)for(const r of Array.from(s))r(t&&JSON.parse(t))}startPolling(){this.stopPolling(),this.pollTimer=setInterval(()=>{this.forAllChangedKeys((e,t,s)=>{this.onStorageEvent(new StorageEvent("storage",{key:e,oldValue:t,newValue:s}),!0)})},Vl)}stopPolling(){this.pollTimer&&(clearInterval(this.pollTimer),this.pollTimer=null)}attachListener(){window.addEventListener("storage",this.boundEventHandler)}detachListener(){window.removeEventListener("storage",this.boundEventHandler)}_addListener(e,t){Object.keys(this.listeners).length===0&&(this.fallbackToPolling?this.startPolling():this.attachListener()),this.listeners[e]||(this.listeners[e]=new Set,this.localCache[e]=this.storage.getItem(e)),this.listeners[e].add(t)}_removeListener(e,t){this.listeners[e]&&(this.listeners[e].delete(t),this.listeners[e].size===0&&delete this.listeners[e]),Object.keys(this.listeners).length===0&&(this.detachListener(),this.stopPolling())}async _set(e,t){await super._set(e,t),this.localCache[e]=JSON.stringify(t)}async _get(e){const t=await super._get(e);return this.localCache[e]=JSON.stringify(t),t}async _remove(e){await super._remove(e),delete this.localCache[e]}}Wo.type="LOCAL";const Bl=Wo;/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class qo extends Go{constructor(){super(()=>window.sessionStorage,"SESSION")}_addListener(e,t){}_removeListener(e,t){}}qo.type="SESSION";const zo=qo;/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function $l(n){return Promise.all(n.map(async e=>{try{return{fulfilled:!0,value:await e}}catch(t){return{fulfilled:!1,reason:t}}}))}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Hn{constructor(e){this.eventTarget=e,this.handlersMap={},this.boundEventHandler=this.handleEvent.bind(this)}static _getInstance(e){const t=this.receivers.find(r=>r.isListeningto(e));if(t)return t;const s=new Hn(e);return this.receivers.push(s),s}isListeningto(e){return this.eventTarget===e}async handleEvent(e){const t=e,{eventId:s,eventType:r,data:c}=t.data,h=this.handlersMap[r];if(!h?.size)return;t.ports[0].postMessage({status:"ack",eventId:s,eventType:r});const g=Array.from(h).map(async v=>v(t.origin,c)),w=await $l(g);t.ports[0].postMessage({status:"done",eventId:s,eventType:r,response:w})}_subscribe(e,t){Object.keys(this.handlersMap).length===0&&this.eventTarget.addEventListener("message",this.boundEventHandler),this.handlersMap[e]||(this.handlersMap[e]=new Set),this.handlersMap[e].add(t)}_unsubscribe(e,t){this.handlersMap[e]&&t&&this.handlersMap[e].delete(t),(!t||this.handlersMap[e].size===0)&&delete this.handlersMap[e],Object.keys(this.handlersMap).length===0&&this.eventTarget.removeEventListener("message",this.boundEventHandler)}}Hn.receivers=[];/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Yi(n="",e=10){let t="";for(let s=0;s<e;s++)t+=Math.floor(Math.random()*10);return n+t}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Hl{constructor(e){this.target=e,this.handlers=new Set}removeMessageHandler(e){e.messageChannel&&(e.messageChannel.port1.removeEventListener("message",e.onMessage),e.messageChannel.port1.close()),this.handlers.delete(e)}async _send(e,t,s=50){const r=typeof MessageChannel<"u"?new MessageChannel:null;if(!r)throw new Error("connection_unavailable");let c,h;return new Promise((g,w)=>{const v=Yi("",20);r.port1.start();const A=setTimeout(()=>{w(new Error("unsupported_event"))},s);h={messageChannel:r,onMessage(b){const S=b;if(S.data.eventId===v)switch(S.data.status){case"ack":clearTimeout(A),c=setTimeout(()=>{w(new Error("timeout"))},3e3);break;case"done":clearTimeout(c),g(S.data.response);break;default:clearTimeout(A),clearTimeout(c),w(new Error("invalid_response"));break}}},this.handlers.add(h),r.port1.addEventListener("message",h.onMessage),this.target.postMessage({eventType:e,eventId:v,data:t},[r.port2])}).finally(()=>{h&&this.removeMessageHandler(h)})}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function me(){return window}function Gl(n){me().location.href=n}/**
 * @license
 * Copyright 2020 Google LLC.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Ko(){return typeof me().WorkerGlobalScope<"u"&&typeof me().importScripts=="function"}async function Wl(){if(!navigator?.serviceWorker)return null;try{return(await navigator.serviceWorker.ready).active}catch{return null}}function ql(){return navigator?.serviceWorker?.controller||null}function zl(){return Ko()?self:null}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Jo="firebaseLocalStorageDb",Kl=1,Un="firebaseLocalStorage",Yo="fbase_key";class sn{constructor(e){this.request=e}toPromise(){return new Promise((e,t)=>{this.request.addEventListener("success",()=>{e(this.request.result)}),this.request.addEventListener("error",()=>{t(this.request.error)})})}}function Gn(n,e){return n.transaction([Un],e?"readwrite":"readonly").objectStore(Un)}function Jl(){const n=indexedDB.deleteDatabase(Jo);return new sn(n).toPromise()}function Ui(){const n=indexedDB.open(Jo,Kl);return new Promise((e,t)=>{n.addEventListener("error",()=>{t(n.error)}),n.addEventListener("upgradeneeded",()=>{const s=n.result;try{s.createObjectStore(Un,{keyPath:Yo})}catch(r){t(r)}}),n.addEventListener("success",async()=>{const s=n.result;s.objectStoreNames.contains(Un)?e(s):(s.close(),await Jl(),e(await Ui()))})})}async function br(n,e,t){const s=Gn(n,!0).put({[Yo]:e,value:t});return new sn(s).toPromise()}async function Yl(n,e){const t=Gn(n,!1).get(e),s=await new sn(t).toPromise();return s===void 0?null:s.value}function Rr(n,e){const t=Gn(n,!0).delete(e);return new sn(t).toPromise()}const Xl=800,Ql=3;class Xo{constructor(){this.type="LOCAL",this._shouldAllowMigration=!0,this.listeners={},this.localCache={},this.pollTimer=null,this.pendingWrites=0,this.receiver=null,this.sender=null,this.serviceWorkerReceiverAvailable=!1,this.activeServiceWorker=null,this._workerInitializationPromise=this.initializeServiceWorkerMessaging().then(()=>{},()=>{})}async _openDb(){return this.db?this.db:(this.db=await Ui(),this.db)}async _withRetries(e){let t=0;for(;;)try{const s=await this._openDb();return await e(s)}catch(s){if(t++>Ql)throw s;this.db&&(this.db.close(),this.db=void 0)}}async initializeServiceWorkerMessaging(){return Ko()?this.initializeReceiver():this.initializeSender()}async initializeReceiver(){this.receiver=Hn._getInstance(zl()),this.receiver._subscribe("keyChanged",async(e,t)=>({keyProcessed:(await this._poll()).includes(t.key)})),this.receiver._subscribe("ping",async(e,t)=>["keyChanged"])}async initializeSender(){if(this.activeServiceWorker=await Wl(),!this.activeServiceWorker)return;this.sender=new Hl(this.activeServiceWorker);const e=await this.sender._send("ping",{},800);e&&e[0]?.fulfilled&&e[0]?.value.includes("keyChanged")&&(this.serviceWorkerReceiverAvailable=!0)}async notifyServiceWorker(e){if(!(!this.sender||!this.activeServiceWorker||ql()!==this.activeServiceWorker))try{await this.sender._send("keyChanged",{key:e},this.serviceWorkerReceiverAvailable?800:50)}catch{}}async _isAvailable(){try{if(!indexedDB)return!1;const e=await Ui();return await br(e,Mn,"1"),await Rr(e,Mn),!0}catch{}return!1}async _withPendingWrite(e){this.pendingWrites++;try{await e()}finally{this.pendingWrites--}}async _set(e,t){return this._withPendingWrite(async()=>(await this._withRetries(s=>br(s,e,t)),this.localCache[e]=t,this.notifyServiceWorker(e)))}async _get(e){const t=await this._withRetries(s=>Yl(s,e));return this.localCache[e]=t,t}async _remove(e){return this._withPendingWrite(async()=>(await this._withRetries(t=>Rr(t,e)),delete this.localCache[e],this.notifyServiceWorker(e)))}async _poll(){const e=await this._withRetries(r=>{const c=Gn(r,!1).getAll();return new sn(c).toPromise()});if(!e)return[];if(this.pendingWrites!==0)return[];const t=[],s=new Set;if(e.length!==0)for(const{fbase_key:r,value:c}of e)s.add(r),JSON.stringify(this.localCache[r])!==JSON.stringify(c)&&(this.notifyListeners(r,c),t.push(r));for(const r of Object.keys(this.localCache))this.localCache[r]&&!s.has(r)&&(this.notifyListeners(r,null),t.push(r));return t}notifyListeners(e,t){this.localCache[e]=t;const s=this.listeners[e];if(s)for(const r of Array.from(s))r(t)}startPolling(){this.stopPolling(),this.pollTimer=setInterval(async()=>this._poll(),Xl)}stopPolling(){this.pollTimer&&(clearInterval(this.pollTimer),this.pollTimer=null)}_addListener(e,t){Object.keys(this.listeners).length===0&&this.startPolling(),this.listeners[e]||(this.listeners[e]=new Set,this._get(e)),this.listeners[e].add(t)}_removeListener(e,t){this.listeners[e]&&(this.listeners[e].delete(t),this.listeners[e].size===0&&delete this.listeners[e]),Object.keys(this.listeners).length===0&&this.stopPolling()}}Xo.type="LOCAL";const Zl=Xo;new tn(3e4,6e4);/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function eu(n,e){return e?Ie(e):(R(n._popupRedirectResolver,n,"argument-error"),n._popupRedirectResolver)}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Xi extends Ki{constructor(e){super("custom","custom"),this.params=e}_getIdTokenResponse(e){return gt(e,this._buildIdpRequest())}_linkToIdToken(e,t){return gt(e,this._buildIdpRequest(t))}_getReauthenticationResolver(e){return gt(e,this._buildIdpRequest())}_buildIdpRequest(e){const t={requestUri:this.params.requestUri,sessionId:this.params.sessionId,postBody:this.params.postBody,tenantId:this.params.tenantId,pendingToken:this.params.pendingToken,returnSecureToken:!0,returnIdpCredential:!0};return e&&(t.idToken=e),t}}function tu(n){return Ho(n.auth,new Xi(n),n.bypassAuthState)}function nu(n){const{auth:e,user:t}=n;return R(t,e,"internal-error"),Ol(t,new Xi(n),n.bypassAuthState)}async function iu(n){const{auth:e,user:t}=n;return R(t,e,"internal-error"),kl(t,new Xi(n),n.bypassAuthState)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Qo{constructor(e,t,s,r,c=!1){this.auth=e,this.resolver=s,this.user=r,this.bypassAuthState=c,this.pendingPromise=null,this.eventManager=null,this.filter=Array.isArray(t)?t:[t]}execute(){return new Promise(async(e,t)=>{this.pendingPromise={resolve:e,reject:t};try{this.eventManager=await this.resolver._initialize(this.auth),await this.onExecution(),this.eventManager.registerConsumer(this)}catch(s){this.reject(s)}})}async onAuthEvent(e){const{urlResponse:t,sessionId:s,postBody:r,tenantId:c,error:h,type:g}=e;if(h){this.reject(h);return}const w={auth:this.auth,requestUri:t,sessionId:s,tenantId:c||void 0,postBody:r||void 0,user:this.user,bypassAuthState:this.bypassAuthState};try{this.resolve(await this.getIdpTask(g)(w))}catch(v){this.reject(v)}}onError(e){this.reject(e)}getIdpTask(e){switch(e){case"signInViaPopup":case"signInViaRedirect":return tu;case"linkViaPopup":case"linkViaRedirect":return iu;case"reauthViaPopup":case"reauthViaRedirect":return nu;default:ce(this.auth,"internal-error")}}resolve(e){Te(this.pendingPromise,"Pending promise was never set"),this.pendingPromise.resolve(e),this.unregisterAndCleanUp()}reject(e){Te(this.pendingPromise,"Pending promise was never set"),this.pendingPromise.reject(e),this.unregisterAndCleanUp()}unregisterAndCleanUp(){this.eventManager&&this.eventManager.unregisterConsumer(this),this.pendingPromise=null,this.cleanUp()}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const su=new tn(2e3,1e4);class dt extends Qo{constructor(e,t,s,r,c){super(e,t,r,c),this.provider=s,this.authWindow=null,this.pollId=null,dt.currentPopupAction&&dt.currentPopupAction.cancel(),dt.currentPopupAction=this}async executeNotNull(){const e=await this.execute();return R(e,this.auth,"internal-error"),e}async onExecution(){Te(this.filter.length===1,"Popup operations only handle one event");const e=Yi();this.authWindow=await this.resolver._openPopup(this.auth,this.provider,this.filter[0],e),this.authWindow.associatedEvent=e,this.resolver._originValidation(this.auth).catch(t=>{this.reject(t)}),this.resolver._isIframeWebStorageSupported(this.auth,t=>{t||this.reject(ge(this.auth,"web-storage-unsupported"))}),this.pollUserCancellation()}get eventId(){return this.authWindow?.associatedEvent||null}cancel(){this.reject(ge(this.auth,"cancelled-popup-request"))}cleanUp(){this.authWindow&&this.authWindow.close(),this.pollId&&window.clearTimeout(this.pollId),this.authWindow=null,this.pollId=null,dt.currentPopupAction=null}pollUserCancellation(){const e=()=>{if(this.authWindow?.window?.closed){this.pollId=window.setTimeout(()=>{this.pollId=null,this.reject(ge(this.auth,"popup-closed-by-user"))},8e3);return}this.pollId=window.setTimeout(e,su.get())};e()}}dt.currentPopupAction=null;/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const ru="pendingRedirect",bn=new Map;class ou extends Qo{constructor(e,t,s=!1){super(e,["signInViaRedirect","linkViaRedirect","reauthViaRedirect","unknown"],t,void 0,s),this.eventId=null}async execute(){let e=bn.get(this.auth._key());if(!e){try{const s=await au(this.resolver,this.auth)?await super.execute():null;e=()=>Promise.resolve(s)}catch(t){e=()=>Promise.reject(t)}bn.set(this.auth._key(),e)}return this.bypassAuthState||bn.set(this.auth._key(),()=>Promise.resolve(null)),e()}async onAuthEvent(e){if(e.type==="signInViaRedirect")return super.onAuthEvent(e);if(e.type==="unknown"){this.resolve(null);return}if(e.eventId){const t=await this.auth._redirectUserForId(e.eventId);if(t)return this.user=t,super.onAuthEvent(e);this.resolve(null)}}async onExecution(){}cleanUp(){}}async function au(n,e){const t=lu(e),s=hu(n);if(!await s._isAvailable())return!1;const r=await s._get(t)==="true";return await s._remove(t),r}function cu(n,e){bn.set(n._key(),e)}function hu(n){return Ie(n._redirectPersistence)}function lu(n){return An(ru,n.config.apiKey,n.name)}async function uu(n,e,t=!1){if(ie(n.app))return Promise.reject(je(n));const s=It(n),r=eu(s,e),h=await new ou(s,r,t).execute();return h&&!t&&(delete h.user._redirectEventId,await s._persistUserIfCurrent(h.user),await s._setRedirectUser(null,e)),h}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const du=600*1e3;class fu{constructor(e){this.auth=e,this.cachedEventUids=new Set,this.consumers=new Set,this.queuedRedirectEvent=null,this.hasHandledPotentialRedirect=!1,this.lastProcessedEventTime=Date.now()}registerConsumer(e){this.consumers.add(e),this.queuedRedirectEvent&&this.isEventForConsumer(this.queuedRedirectEvent,e)&&(this.sendToConsumer(this.queuedRedirectEvent,e),this.saveEventToCache(this.queuedRedirectEvent),this.queuedRedirectEvent=null)}unregisterConsumer(e){this.consumers.delete(e)}onEvent(e){if(this.hasEventBeenHandled(e))return!1;let t=!1;return this.consumers.forEach(s=>{this.isEventForConsumer(e,s)&&(t=!0,this.sendToConsumer(e,s),this.saveEventToCache(e))}),this.hasHandledPotentialRedirect||!pu(e)||(this.hasHandledPotentialRedirect=!0,t||(this.queuedRedirectEvent=e,t=!0)),t}sendToConsumer(e,t){if(e.error&&!Zo(e)){const s=e.error.code?.split("auth/")[1]||"internal-error";t.onError(ge(this.auth,s))}else t.onAuthEvent(e)}isEventForConsumer(e,t){const s=t.eventId===null||!!e.eventId&&e.eventId===t.eventId;return t.filter.includes(e.type)&&s}hasEventBeenHandled(e){return Date.now()-this.lastProcessedEventTime>=du&&this.cachedEventUids.clear(),this.cachedEventUids.has(Cr(e))}saveEventToCache(e){this.cachedEventUids.add(Cr(e)),this.lastProcessedEventTime=Date.now()}}function Cr(n){return[n.type,n.eventId,n.sessionId,n.tenantId].filter(e=>e).join("-")}function Zo({type:n,error:e}){return n==="unknown"&&e?.code==="auth/no-auth-event"}function pu(n){switch(n.type){case"signInViaRedirect":case"linkViaRedirect":case"reauthViaRedirect":return!0;case"unknown":return Zo(n);default:return!1}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function gu(n,e={}){return He(n,"GET","/v1/projects",e)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const mu=/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/,_u=/^https?/;async function yu(n){if(n.config.emulator)return;const{authorizedDomains:e}=await gu(n);for(const t of e)try{if(Eu(t))return}catch{}ce(n,"unauthorized-domain")}function Eu(n){const e=Li(),{protocol:t,hostname:s}=new URL(e);if(n.startsWith("chrome-extension://")){const h=new URL(n);return h.hostname===""&&s===""?t==="chrome-extension:"&&n.replace("chrome-extension://","")===e.replace("chrome-extension://",""):t==="chrome-extension:"&&h.hostname===s}if(!_u.test(t))return!1;if(mu.test(n))return s===n;const r=n.replace(/\./g,"\\.");return new RegExp("^(.+\\."+r+"|"+r+")$","i").test(s)}/**
 * @license
 * Copyright 2020 Google LLC.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const wu=new tn(3e4,6e4);function Pr(){const n=me().___jsl;if(n?.H){for(const e of Object.keys(n.H))if(n.H[e].r=n.H[e].r||[],n.H[e].L=n.H[e].L||[],n.H[e].r=[...n.H[e].L],n.CP)for(let t=0;t<n.CP.length;t++)n.CP[t]=null}}function Iu(n){return new Promise((e,t)=>{function s(){Pr(),gapi.load("gapi.iframes",{callback:()=>{e(gapi.iframes.getContext())},ontimeout:()=>{Pr(),t(ge(n,"network-request-failed"))},timeout:wu.get()})}if(me().gapi?.iframes?.Iframe)e(gapi.iframes.getContext());else if(me().gapi?.load)s();else{const r=fl("iframefcb");return me()[r]=()=>{gapi.load?s():t(ge(n,"network-request-failed"))},Fo(`${dl()}?onload=${r}`).catch(c=>t(c))}}).catch(e=>{throw Rn=null,e})}let Rn=null;function vu(n){return Rn=Rn||Iu(n),Rn}/**
 * @license
 * Copyright 2020 Google LLC.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Tu=new tn(5e3,15e3),Su="__/auth/iframe",Au="emulator/auth/iframe",bu={style:{position:"absolute",top:"-100px",width:"1px",height:"1px"},"aria-hidden":"true",tabindex:"-1"},Ru=new Map([["identitytoolkit.googleapis.com","p"],["staging-identitytoolkit.sandbox.googleapis.com","s"],["test-identitytoolkit.sandbox.googleapis.com","t"]]);function Cu(n){const e=n.config;R(e.authDomain,n,"auth-domain-config-required");const t=e.emulator?Wi(e,Au):`https://${n.config.authDomain}/${Su}`,s={apiKey:e.apiKey,appName:n.name,v:wt},r=Ru.get(n.config.apiHost);r&&(s.eid=r);const c=n._getFrameworks();return c.length&&(s.fw=c.join(",")),`${t}?${en(s).slice(1)}`}async function Pu(n){const e=await vu(n),t=me().gapi;return R(t,n,"internal-error"),e.open({where:document.body,url:Cu(n),messageHandlersFilter:t.iframes.CROSS_ORIGIN_IFRAMES_FILTER,attributes:bu,dontclear:!0},s=>new Promise(async(r,c)=>{await s.restyle({setHideOnLeave:!1});const h=ge(n,"network-request-failed"),g=me().setTimeout(()=>{c(h)},Tu.get());function w(){me().clearTimeout(g),r(s)}s.ping(w).then(w,()=>{c(h)})}))}/**
 * @license
 * Copyright 2020 Google LLC.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const ku={location:"yes",resizable:"yes",statusbar:"yes",toolbar:"no"},Ou=500,Nu=600,Du="_blank",Lu="http://localhost";class kr{constructor(e){this.window=e,this.associatedEvent=null}close(){if(this.window)try{this.window.close()}catch{}}}function Mu(n,e,t,s=Ou,r=Nu){const c=Math.max((window.screen.availHeight-r)/2,0).toString(),h=Math.max((window.screen.availWidth-s)/2,0).toString();let g="";const w={...ku,width:s.toString(),height:r.toString(),top:c,left:h},v=J().toLowerCase();t&&(g=Oo(v)?Du:t),Po(v)&&(e=e||Lu,w.scrollbars="yes");const A=Object.entries(w).reduce((S,[M,O])=>`${S}${M}=${O},`,"");if(il(v)&&g!=="_self")return Uu(e||"",g),new kr(null);const b=window.open(e||"",g,A);R(b,n,"popup-blocked");try{b.focus()}catch{}return new kr(b)}function Uu(n,e){const t=document.createElement("a");t.href=n,t.target=e;const s=document.createEvent("MouseEvent");s.initMouseEvent("click",!0,!0,window,1,0,0,0,0,!1,!1,!1,!1,1,null),t.dispatchEvent(s)}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const xu="__/auth/handler",Fu="emulator/auth/handler",Vu=encodeURIComponent("fac");async function Or(n,e,t,s,r,c){R(n.config.authDomain,n,"auth-domain-config-required"),R(n.config.apiKey,n,"invalid-api-key");const h={apiKey:n.config.apiKey,appName:n.name,authType:t,redirectUrl:s,v:wt,eventId:r};if(e instanceof Bo){e.setDefaultLanguage(n.languageCode),h.providerId=e.providerId||"",Tc(e.getCustomParameters())||(h.customParameters=JSON.stringify(e.getCustomParameters()));for(const[A,b]of Object.entries({}))h[A]=b}if(e instanceof nn){const A=e.getScopes().filter(b=>b!=="");A.length>0&&(h.scopes=A.join(","))}n.tenantId&&(h.tid=n.tenantId);const g=h;for(const A of Object.keys(g))g[A]===void 0&&delete g[A];const w=await n._getAppCheckToken(),v=w?`#${Vu}=${encodeURIComponent(w)}`:"";return`${ju(n)}?${en(g).slice(1)}${v}`}function ju({config:n}){return n.emulator?Wi(n,Fu):`https://${n.authDomain}/${xu}`}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Ai="webStorageSupport";class Bu{constructor(){this.eventManagers={},this.iframes={},this.originValidationPromises={},this._redirectPersistence=zo,this._completeRedirectFn=uu,this._overrideRedirectResult=cu}async _openPopup(e,t,s,r){Te(this.eventManagers[e._key()]?.manager,"_initialize() not called before _openPopup()");const c=await Or(e,t,s,Li(),r);return Mu(e,c,Yi())}async _openRedirect(e,t,s,r){await this._originValidation(e);const c=await Or(e,t,s,Li(),r);return Gl(c),new Promise(()=>{})}_initialize(e){const t=e._key();if(this.eventManagers[t]){const{manager:r,promise:c}=this.eventManagers[t];return r?Promise.resolve(r):(Te(c,"If manager is not set, promise should be"),c)}const s=this.initAndGetManager(e);return this.eventManagers[t]={promise:s},s.catch(()=>{delete this.eventManagers[t]}),s}async initAndGetManager(e){const t=await Pu(e),s=new fu(e);return t.register("authEvent",r=>(R(r?.authEvent,e,"invalid-auth-event"),{status:s.onEvent(r.authEvent)?"ACK":"ERROR"}),gapi.iframes.CROSS_ORIGIN_IFRAMES_FILTER),this.eventManagers[e._key()]={manager:s},this.iframes[e._key()]=t,s}_isIframeWebStorageSupported(e,t){this.iframes[e._key()].send(Ai,{type:Ai},r=>{const c=r?.[0]?.[Ai];c!==void 0&&t(!!c),ce(e,"internal-error")},gapi.iframes.CROSS_ORIGIN_IFRAMES_FILTER)}_originValidation(e){const t=e._key();return this.originValidationPromises[t]||(this.originValidationPromises[t]=yu(e)),this.originValidationPromises[t]}get _shouldInitProactively(){return Uo()||ko()||zi()}}const $u=Bu;var Nr="@firebase/auth",Dr="1.11.0";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Hu{constructor(e){this.auth=e,this.internalListeners=new Map}getUid(){return this.assertAuthConfigured(),this.auth.currentUser?.uid||null}async getToken(e){return this.assertAuthConfigured(),await this.auth._initializationPromise,this.auth.currentUser?{accessToken:await this.auth.currentUser.getIdToken(e)}:null}addAuthTokenListener(e){if(this.assertAuthConfigured(),this.internalListeners.has(e))return;const t=this.auth.onIdTokenChanged(s=>{e(s?.stsTokenManager.accessToken||null)});this.internalListeners.set(e,t),this.updateProactiveRefresh()}removeAuthTokenListener(e){this.assertAuthConfigured();const t=this.internalListeners.get(e);t&&(this.internalListeners.delete(e),t(),this.updateProactiveRefresh())}assertAuthConfigured(){R(this.auth._initializationPromise,"dependent-sdk-initialized-before-auth")}updateProactiveRefresh(){this.internalListeners.size>0?this.auth._startProactiveRefresh():this.auth._stopProactiveRefresh()}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Gu(n){switch(n){case"Node":return"node";case"ReactNative":return"rn";case"Worker":return"webworker";case"Cordova":return"cordova";case"WebExtension":return"web-extension";default:return}}function Wu(n){st(new Be("auth",(e,{options:t})=>{const s=e.getProvider("app").getImmediate(),r=e.getProvider("heartbeat"),c=e.getProvider("app-check-internal"),{apiKey:h,authDomain:g}=s.options;R(h&&!h.includes(":"),"invalid-api-key",{appName:s.name});const w={apiKey:h,authDomain:g,clientPlatform:n,apiHost:"identitytoolkit.googleapis.com",tokenApiHost:"securetoken.googleapis.com",apiScheme:"https",sdkClientVersion:xo(n)},v=new hl(s,r,c,w);return El(v,t),v},"PUBLIC").setInstantiationMode("EXPLICIT").setInstanceCreatedCallback((e,t,s)=>{e.getProvider("auth-internal").initialize()})),st(new Be("auth-internal",e=>{const t=It(e.getProvider("auth").getImmediate());return(s=>new Hu(s))(t)},"PRIVATE").setInstantiationMode("EXPLICIT")),pe(Nr,Dr,Gu(n)),pe(Nr,Dr,"esm2020")}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const qu=300,zu=po("authIdTokenMaxAge")||qu;let Lr=null;const Ku=n=>async e=>{const t=e&&await e.getIdTokenResult(),s=t&&(new Date().getTime()-Date.parse(t.issuedAtTime))/1e3;if(s&&s>zu)return;const r=t?.token;Lr!==r&&(Lr=r,await fetch(n,{method:r?"POST":"DELETE",headers:r?{Authorization:`Bearer ${r}`}:{}}))};function Ju(n=Hi()){const e=jn(n,"auth");if(e.isInitialized())return e.getImmediate();const t=yl(n,{popupRedirectResolver:$u,persistence:[Zl,Bl,zo]}),s=po("authTokenSyncURL");if(s&&typeof isSecureContext=="boolean"&&isSecureContext){const c=new URL(s,location.origin);if(location.origin===c.origin){const h=Ku(c.toString());Ul(t,h,()=>h(t.currentUser)),Ml(t,g=>h(g))}}const r=uo("auth");return r&&wl(t,`http://${r}`),t}function Yu(){return document.getElementsByTagName("head")?.[0]??document}ll({loadJS(n){return new Promise((e,t)=>{const s=document.createElement("script");s.setAttribute("src",n),s.onload=e,s.onerror=r=>{const c=ge("internal-error");c.customData=r,t(c)},s.type="text/javascript",s.charset="UTF-8",Yu().appendChild(s)})},gapiScript:"https://apis.google.com/js/api.js",recaptchaV2Script:"https://www.google.com/recaptcha/api.js",recaptchaEnterpriseScript:"https://www.google.com/recaptcha/enterprise.js?render="});Wu("Browser");var Mr=typeof globalThis<"u"?globalThis:typeof window<"u"?window:typeof global<"u"?global:typeof self<"u"?self:{};/** @license
Copyright The Closure Library Authors.
SPDX-License-Identifier: Apache-2.0
*/var Qi;(function(){var n;/** @license

 Copyright The Closure Library Authors.
 SPDX-License-Identifier: Apache-2.0
*/function e(m,u){function f(){}f.prototype=u.prototype,m.F=u.prototype,m.prototype=new f,m.prototype.constructor=m,m.D=function(_,p,E){for(var d=Array(arguments.length-2),Y=2;Y<arguments.length;Y++)d[Y-2]=arguments[Y];return u.prototype[p].apply(_,d)}}function t(){this.blockSize=-1}function s(){this.blockSize=-1,this.blockSize=64,this.g=Array(4),this.C=Array(this.blockSize),this.o=this.h=0,this.u()}e(s,t),s.prototype.u=function(){this.g[0]=1732584193,this.g[1]=4023233417,this.g[2]=2562383102,this.g[3]=271733878,this.o=this.h=0};function r(m,u,f){f||(f=0);const _=Array(16);if(typeof u=="string")for(var p=0;p<16;++p)_[p]=u.charCodeAt(f++)|u.charCodeAt(f++)<<8|u.charCodeAt(f++)<<16|u.charCodeAt(f++)<<24;else for(p=0;p<16;++p)_[p]=u[f++]|u[f++]<<8|u[f++]<<16|u[f++]<<24;u=m.g[0],f=m.g[1],p=m.g[2];let E=m.g[3],d;d=u+(E^f&(p^E))+_[0]+3614090360&4294967295,u=f+(d<<7&4294967295|d>>>25),d=E+(p^u&(f^p))+_[1]+3905402710&4294967295,E=u+(d<<12&4294967295|d>>>20),d=p+(f^E&(u^f))+_[2]+606105819&4294967295,p=E+(d<<17&4294967295|d>>>15),d=f+(u^p&(E^u))+_[3]+3250441966&4294967295,f=p+(d<<22&4294967295|d>>>10),d=u+(E^f&(p^E))+_[4]+4118548399&4294967295,u=f+(d<<7&4294967295|d>>>25),d=E+(p^u&(f^p))+_[5]+1200080426&4294967295,E=u+(d<<12&4294967295|d>>>20),d=p+(f^E&(u^f))+_[6]+2821735955&4294967295,p=E+(d<<17&4294967295|d>>>15),d=f+(u^p&(E^u))+_[7]+4249261313&4294967295,f=p+(d<<22&4294967295|d>>>10),d=u+(E^f&(p^E))+_[8]+1770035416&4294967295,u=f+(d<<7&4294967295|d>>>25),d=E+(p^u&(f^p))+_[9]+2336552879&4294967295,E=u+(d<<12&4294967295|d>>>20),d=p+(f^E&(u^f))+_[10]+4294925233&4294967295,p=E+(d<<17&4294967295|d>>>15),d=f+(u^p&(E^u))+_[11]+2304563134&4294967295,f=p+(d<<22&4294967295|d>>>10),d=u+(E^f&(p^E))+_[12]+1804603682&4294967295,u=f+(d<<7&4294967295|d>>>25),d=E+(p^u&(f^p))+_[13]+4254626195&4294967295,E=u+(d<<12&4294967295|d>>>20),d=p+(f^E&(u^f))+_[14]+2792965006&4294967295,p=E+(d<<17&4294967295|d>>>15),d=f+(u^p&(E^u))+_[15]+1236535329&4294967295,f=p+(d<<22&4294967295|d>>>10),d=u+(p^E&(f^p))+_[1]+4129170786&4294967295,u=f+(d<<5&4294967295|d>>>27),d=E+(f^p&(u^f))+_[6]+3225465664&4294967295,E=u+(d<<9&4294967295|d>>>23),d=p+(u^f&(E^u))+_[11]+643717713&4294967295,p=E+(d<<14&4294967295|d>>>18),d=f+(E^u&(p^E))+_[0]+3921069994&4294967295,f=p+(d<<20&4294967295|d>>>12),d=u+(p^E&(f^p))+_[5]+3593408605&4294967295,u=f+(d<<5&4294967295|d>>>27),d=E+(f^p&(u^f))+_[10]+38016083&4294967295,E=u+(d<<9&4294967295|d>>>23),d=p+(u^f&(E^u))+_[15]+3634488961&4294967295,p=E+(d<<14&4294967295|d>>>18),d=f+(E^u&(p^E))+_[4]+3889429448&4294967295,f=p+(d<<20&4294967295|d>>>12),d=u+(p^E&(f^p))+_[9]+568446438&4294967295,u=f+(d<<5&4294967295|d>>>27),d=E+(f^p&(u^f))+_[14]+3275163606&4294967295,E=u+(d<<9&4294967295|d>>>23),d=p+(u^f&(E^u))+_[3]+4107603335&4294967295,p=E+(d<<14&4294967295|d>>>18),d=f+(E^u&(p^E))+_[8]+1163531501&4294967295,f=p+(d<<20&4294967295|d>>>12),d=u+(p^E&(f^p))+_[13]+2850285829&4294967295,u=f+(d<<5&4294967295|d>>>27),d=E+(f^p&(u^f))+_[2]+4243563512&4294967295,E=u+(d<<9&4294967295|d>>>23),d=p+(u^f&(E^u))+_[7]+1735328473&4294967295,p=E+(d<<14&4294967295|d>>>18),d=f+(E^u&(p^E))+_[12]+2368359562&4294967295,f=p+(d<<20&4294967295|d>>>12),d=u+(f^p^E)+_[5]+4294588738&4294967295,u=f+(d<<4&4294967295|d>>>28),d=E+(u^f^p)+_[8]+2272392833&4294967295,E=u+(d<<11&4294967295|d>>>21),d=p+(E^u^f)+_[11]+1839030562&4294967295,p=E+(d<<16&4294967295|d>>>16),d=f+(p^E^u)+_[14]+4259657740&4294967295,f=p+(d<<23&4294967295|d>>>9),d=u+(f^p^E)+_[1]+2763975236&4294967295,u=f+(d<<4&4294967295|d>>>28),d=E+(u^f^p)+_[4]+1272893353&4294967295,E=u+(d<<11&4294967295|d>>>21),d=p+(E^u^f)+_[7]+4139469664&4294967295,p=E+(d<<16&4294967295|d>>>16),d=f+(p^E^u)+_[10]+3200236656&4294967295,f=p+(d<<23&4294967295|d>>>9),d=u+(f^p^E)+_[13]+681279174&4294967295,u=f+(d<<4&4294967295|d>>>28),d=E+(u^f^p)+_[0]+3936430074&4294967295,E=u+(d<<11&4294967295|d>>>21),d=p+(E^u^f)+_[3]+3572445317&4294967295,p=E+(d<<16&4294967295|d>>>16),d=f+(p^E^u)+_[6]+76029189&4294967295,f=p+(d<<23&4294967295|d>>>9),d=u+(f^p^E)+_[9]+3654602809&4294967295,u=f+(d<<4&4294967295|d>>>28),d=E+(u^f^p)+_[12]+3873151461&4294967295,E=u+(d<<11&4294967295|d>>>21),d=p+(E^u^f)+_[15]+530742520&4294967295,p=E+(d<<16&4294967295|d>>>16),d=f+(p^E^u)+_[2]+3299628645&4294967295,f=p+(d<<23&4294967295|d>>>9),d=u+(p^(f|~E))+_[0]+4096336452&4294967295,u=f+(d<<6&4294967295|d>>>26),d=E+(f^(u|~p))+_[7]+1126891415&4294967295,E=u+(d<<10&4294967295|d>>>22),d=p+(u^(E|~f))+_[14]+2878612391&4294967295,p=E+(d<<15&4294967295|d>>>17),d=f+(E^(p|~u))+_[5]+4237533241&4294967295,f=p+(d<<21&4294967295|d>>>11),d=u+(p^(f|~E))+_[12]+1700485571&4294967295,u=f+(d<<6&4294967295|d>>>26),d=E+(f^(u|~p))+_[3]+2399980690&4294967295,E=u+(d<<10&4294967295|d>>>22),d=p+(u^(E|~f))+_[10]+4293915773&4294967295,p=E+(d<<15&4294967295|d>>>17),d=f+(E^(p|~u))+_[1]+2240044497&4294967295,f=p+(d<<21&4294967295|d>>>11),d=u+(p^(f|~E))+_[8]+1873313359&4294967295,u=f+(d<<6&4294967295|d>>>26),d=E+(f^(u|~p))+_[15]+4264355552&4294967295,E=u+(d<<10&4294967295|d>>>22),d=p+(u^(E|~f))+_[6]+2734768916&4294967295,p=E+(d<<15&4294967295|d>>>17),d=f+(E^(p|~u))+_[13]+1309151649&4294967295,f=p+(d<<21&4294967295|d>>>11),d=u+(p^(f|~E))+_[4]+4149444226&4294967295,u=f+(d<<6&4294967295|d>>>26),d=E+(f^(u|~p))+_[11]+3174756917&4294967295,E=u+(d<<10&4294967295|d>>>22),d=p+(u^(E|~f))+_[2]+718787259&4294967295,p=E+(d<<15&4294967295|d>>>17),d=f+(E^(p|~u))+_[9]+3951481745&4294967295,m.g[0]=m.g[0]+u&4294967295,m.g[1]=m.g[1]+(p+(d<<21&4294967295|d>>>11))&4294967295,m.g[2]=m.g[2]+p&4294967295,m.g[3]=m.g[3]+E&4294967295}s.prototype.v=function(m,u){u===void 0&&(u=m.length);const f=u-this.blockSize,_=this.C;let p=this.h,E=0;for(;E<u;){if(p==0)for(;E<=f;)r(this,m,E),E+=this.blockSize;if(typeof m=="string"){for(;E<u;)if(_[p++]=m.charCodeAt(E++),p==this.blockSize){r(this,_),p=0;break}}else for(;E<u;)if(_[p++]=m[E++],p==this.blockSize){r(this,_),p=0;break}}this.h=p,this.o+=u},s.prototype.A=function(){var m=Array((this.h<56?this.blockSize:this.blockSize*2)-this.h);m[0]=128;for(var u=1;u<m.length-8;++u)m[u]=0;u=this.o*8;for(var f=m.length-8;f<m.length;++f)m[f]=u&255,u/=256;for(this.v(m),m=Array(16),u=0,f=0;f<4;++f)for(let _=0;_<32;_+=8)m[u++]=this.g[f]>>>_&255;return m};function c(m,u){var f=g;return Object.prototype.hasOwnProperty.call(f,m)?f[m]:f[m]=u(m)}function h(m,u){this.h=u;const f=[];let _=!0;for(let p=m.length-1;p>=0;p--){const E=m[p]|0;_&&E==u||(f[p]=E,_=!1)}this.g=f}var g={};function w(m){return-128<=m&&m<128?c(m,function(u){return new h([u|0],u<0?-1:0)}):new h([m|0],m<0?-1:0)}function v(m){if(isNaN(m)||!isFinite(m))return b;if(m<0)return V(v(-m));const u=[];let f=1;for(let _=0;m>=f;_++)u[_]=m/f|0,f*=4294967296;return new h(u,0)}function A(m,u){if(m.length==0)throw Error("number format error: empty string");if(u=u||10,u<2||36<u)throw Error("radix out of range: "+u);if(m.charAt(0)=="-")return V(A(m.substring(1),u));if(m.indexOf("-")>=0)throw Error('number format error: interior "-" character');const f=v(Math.pow(u,8));let _=b;for(let E=0;E<m.length;E+=8){var p=Math.min(8,m.length-E);const d=parseInt(m.substring(E,E+p),u);p<8?(p=v(Math.pow(u,p)),_=_.j(p).add(v(d))):(_=_.j(f),_=_.add(v(d)))}return _}var b=w(0),S=w(1),M=w(16777216);n=h.prototype,n.m=function(){if(B(this))return-V(this).m();let m=0,u=1;for(let f=0;f<this.g.length;f++){const _=this.i(f);m+=(_>=0?_:4294967296+_)*u,u*=4294967296}return m},n.toString=function(m){if(m=m||10,m<2||36<m)throw Error("radix out of range: "+m);if(O(this))return"0";if(B(this))return"-"+V(this).toString(m);const u=v(Math.pow(m,6));var f=this;let _="";for(;;){const p=Ae(f,u).g;f=Q(f,p.j(u));let E=((f.g.length>0?f.g[0]:f.h)>>>0).toString(m);if(f=p,O(f))return E+_;for(;E.length<6;)E="0"+E;_=E+_}},n.i=function(m){return m<0?0:m<this.g.length?this.g[m]:this.h};function O(m){if(m.h!=0)return!1;for(let u=0;u<m.g.length;u++)if(m.g[u]!=0)return!1;return!0}function B(m){return m.h==-1}n.l=function(m){return m=Q(this,m),B(m)?-1:O(m)?0:1};function V(m){const u=m.g.length,f=[];for(let _=0;_<u;_++)f[_]=~m.g[_];return new h(f,~m.h).add(S)}n.abs=function(){return B(this)?V(this):this},n.add=function(m){const u=Math.max(this.g.length,m.g.length),f=[];let _=0;for(let p=0;p<=u;p++){let E=_+(this.i(p)&65535)+(m.i(p)&65535),d=(E>>>16)+(this.i(p)>>>16)+(m.i(p)>>>16);_=d>>>16,E&=65535,d&=65535,f[p]=d<<16|E}return new h(f,f[f.length-1]&-2147483648?-1:0)};function Q(m,u){return m.add(V(u))}n.j=function(m){if(O(this)||O(m))return b;if(B(this))return B(m)?V(this).j(V(m)):V(V(this).j(m));if(B(m))return V(this.j(V(m)));if(this.l(M)<0&&m.l(M)<0)return v(this.m()*m.m());const u=this.g.length+m.g.length,f=[];for(var _=0;_<2*u;_++)f[_]=0;for(_=0;_<this.g.length;_++)for(let p=0;p<m.g.length;p++){const E=this.i(_)>>>16,d=this.i(_)&65535,Y=m.i(p)>>>16,Ge=m.i(p)&65535;f[2*_+2*p]+=d*Ge,Z(f,2*_+2*p),f[2*_+2*p+1]+=E*Ge,Z(f,2*_+2*p+1),f[2*_+2*p+1]+=d*Y,Z(f,2*_+2*p+1),f[2*_+2*p+2]+=E*Y,Z(f,2*_+2*p+2)}for(m=0;m<u;m++)f[m]=f[2*m+1]<<16|f[2*m];for(m=u;m<2*u;m++)f[m]=0;return new h(f,0)};function Z(m,u){for(;(m[u]&65535)!=m[u];)m[u+1]+=m[u]>>>16,m[u]&=65535,u++}function ee(m,u){this.g=m,this.h=u}function Ae(m,u){if(O(u))throw Error("division by zero");if(O(m))return new ee(b,b);if(B(m))return u=Ae(V(m),u),new ee(V(u.g),V(u.h));if(B(u))return u=Ae(m,V(u)),new ee(V(u.g),u.h);if(m.g.length>30){if(B(m)||B(u))throw Error("slowDivide_ only works with positive integers.");for(var f=S,_=u;_.l(m)<=0;)f=be(f),_=be(_);var p=te(f,1),E=te(_,1);for(_=te(_,2),f=te(f,2);!O(_);){var d=E.add(_);d.l(m)<=0&&(p=p.add(f),E=d),_=te(_,1),f=te(f,1)}return u=Q(m,p.j(u)),new ee(p,u)}for(p=b;m.l(u)>=0;){for(f=Math.max(1,Math.floor(m.m()/u.m())),_=Math.ceil(Math.log(f)/Math.LN2),_=_<=48?1:Math.pow(2,_-48),E=v(f),d=E.j(u);B(d)||d.l(m)>0;)f-=_,E=v(f),d=E.j(u);O(E)&&(E=S),p=p.add(E),m=Q(m,d)}return new ee(p,m)}n.B=function(m){return Ae(this,m).h},n.and=function(m){const u=Math.max(this.g.length,m.g.length),f=[];for(let _=0;_<u;_++)f[_]=this.i(_)&m.i(_);return new h(f,this.h&m.h)},n.or=function(m){const u=Math.max(this.g.length,m.g.length),f=[];for(let _=0;_<u;_++)f[_]=this.i(_)|m.i(_);return new h(f,this.h|m.h)},n.xor=function(m){const u=Math.max(this.g.length,m.g.length),f=[];for(let _=0;_<u;_++)f[_]=this.i(_)^m.i(_);return new h(f,this.h^m.h)};function be(m){const u=m.g.length+1,f=[];for(let _=0;_<u;_++)f[_]=m.i(_)<<1|m.i(_-1)>>>31;return new h(f,m.h)}function te(m,u){const f=u>>5;u%=32;const _=m.g.length-f,p=[];for(let E=0;E<_;E++)p[E]=u>0?m.i(E+f)>>>u|m.i(E+f+1)<<32-u:m.i(E+f);return new h(p,m.h)}s.prototype.digest=s.prototype.A,s.prototype.reset=s.prototype.u,s.prototype.update=s.prototype.v,h.prototype.add=h.prototype.add,h.prototype.multiply=h.prototype.j,h.prototype.modulo=h.prototype.B,h.prototype.compare=h.prototype.l,h.prototype.toNumber=h.prototype.m,h.prototype.toString=h.prototype.toString,h.prototype.getBits=h.prototype.i,h.fromNumber=v,h.fromString=A,Qi=h}).apply(typeof Mr<"u"?Mr:typeof self<"u"?self:typeof window<"u"?window:{});var In=typeof globalThis<"u"?globalThis:typeof window<"u"?window:typeof global<"u"?global:typeof self<"u"?self:{};(function(){var n,e=Object.defineProperty;function t(i){i=[typeof globalThis=="object"&&globalThis,i,typeof window=="object"&&window,typeof self=="object"&&self,typeof In=="object"&&In];for(var o=0;o<i.length;++o){var a=i[o];if(a&&a.Math==Math)return a}throw Error("Cannot find global object")}var s=t(this);function r(i,o){if(o)e:{var a=s;i=i.split(".");for(var l=0;l<i.length-1;l++){var y=i[l];if(!(y in a))break e;a=a[y]}i=i[i.length-1],l=a[i],o=o(l),o!=l&&o!=null&&e(a,i,{configurable:!0,writable:!0,value:o})}}r("Symbol.dispose",function(i){return i||Symbol("Symbol.dispose")}),r("Array.prototype.values",function(i){return i||function(){return this[Symbol.iterator]()}}),r("Object.entries",function(i){return i||function(o){var a=[],l;for(l in o)Object.prototype.hasOwnProperty.call(o,l)&&a.push([l,o[l]]);return a}});/** @license

 Copyright The Closure Library Authors.
 SPDX-License-Identifier: Apache-2.0
*/var c=c||{},h=this||self;function g(i){var o=typeof i;return o=="object"&&i!=null||o=="function"}function w(i,o,a){return i.call.apply(i.bind,arguments)}function v(i,o,a){return v=w,v.apply(null,arguments)}function A(i,o){var a=Array.prototype.slice.call(arguments,1);return function(){var l=a.slice();return l.push.apply(l,arguments),i.apply(this,l)}}function b(i,o){function a(){}a.prototype=o.prototype,i.Z=o.prototype,i.prototype=new a,i.prototype.constructor=i,i.Ob=function(l,y,I){for(var T=Array(arguments.length-2),k=2;k<arguments.length;k++)T[k-2]=arguments[k];return o.prototype[y].apply(l,T)}}var S=typeof AsyncContext<"u"&&typeof AsyncContext.Snapshot=="function"?i=>i&&AsyncContext.Snapshot.wrap(i):i=>i;function M(i){const o=i.length;if(o>0){const a=Array(o);for(let l=0;l<o;l++)a[l]=i[l];return a}return[]}function O(i,o){for(let l=1;l<arguments.length;l++){const y=arguments[l];var a=typeof y;if(a=a!="object"?a:y?Array.isArray(y)?"array":a:"null",a=="array"||a=="object"&&typeof y.length=="number"){a=i.length||0;const I=y.length||0;i.length=a+I;for(let T=0;T<I;T++)i[a+T]=y[T]}else i.push(y)}}class B{constructor(o,a){this.i=o,this.j=a,this.h=0,this.g=null}get(){let o;return this.h>0?(this.h--,o=this.g,this.g=o.next,o.next=null):o=this.i(),o}}function V(i){h.setTimeout(()=>{throw i},0)}function Q(){var i=m;let o=null;return i.g&&(o=i.g,i.g=i.g.next,i.g||(i.h=null),o.next=null),o}class Z{constructor(){this.h=this.g=null}add(o,a){const l=ee.get();l.set(o,a),this.h?this.h.next=l:this.g=l,this.h=l}}var ee=new B(()=>new Ae,i=>i.reset());class Ae{constructor(){this.next=this.g=this.h=null}set(o,a){this.h=o,this.g=a,this.next=null}reset(){this.next=this.g=this.h=null}}let be,te=!1,m=new Z,u=()=>{const i=Promise.resolve(void 0);be=()=>{i.then(f)}};function f(){for(var i;i=Q();){try{i.h.call(i.g)}catch(a){V(a)}var o=ee;o.j(i),o.h<100&&(o.h++,i.next=o.g,o.g=i)}te=!1}function _(){this.u=this.u,this.C=this.C}_.prototype.u=!1,_.prototype.dispose=function(){this.u||(this.u=!0,this.N())},_.prototype[Symbol.dispose]=function(){this.dispose()},_.prototype.N=function(){if(this.C)for(;this.C.length;)this.C.shift()()};function p(i,o){this.type=i,this.g=this.target=o,this.defaultPrevented=!1}p.prototype.h=function(){this.defaultPrevented=!0};var E=(function(){if(!h.addEventListener||!Object.defineProperty)return!1;var i=!1,o=Object.defineProperty({},"passive",{get:function(){i=!0}});try{const a=()=>{};h.addEventListener("test",a,o),h.removeEventListener("test",a,o)}catch{}return i})();function d(i){return/^[\s\xa0]*$/.test(i)}function Y(i,o){p.call(this,i?i.type:""),this.relatedTarget=this.g=this.target=null,this.button=this.screenY=this.screenX=this.clientY=this.clientX=0,this.key="",this.metaKey=this.shiftKey=this.altKey=this.ctrlKey=!1,this.state=null,this.pointerId=0,this.pointerType="",this.i=null,i&&this.init(i,o)}b(Y,p),Y.prototype.init=function(i,o){const a=this.type=i.type,l=i.changedTouches&&i.changedTouches.length?i.changedTouches[0]:null;this.target=i.target||i.srcElement,this.g=o,o=i.relatedTarget,o||(a=="mouseover"?o=i.fromElement:a=="mouseout"&&(o=i.toElement)),this.relatedTarget=o,l?(this.clientX=l.clientX!==void 0?l.clientX:l.pageX,this.clientY=l.clientY!==void 0?l.clientY:l.pageY,this.screenX=l.screenX||0,this.screenY=l.screenY||0):(this.clientX=i.clientX!==void 0?i.clientX:i.pageX,this.clientY=i.clientY!==void 0?i.clientY:i.pageY,this.screenX=i.screenX||0,this.screenY=i.screenY||0),this.button=i.button,this.key=i.key||"",this.ctrlKey=i.ctrlKey,this.altKey=i.altKey,this.shiftKey=i.shiftKey,this.metaKey=i.metaKey,this.pointerId=i.pointerId||0,this.pointerType=i.pointerType,this.state=i.state,this.i=i,i.defaultPrevented&&Y.Z.h.call(this)},Y.prototype.h=function(){Y.Z.h.call(this);const i=this.i;i.preventDefault?i.preventDefault():i.returnValue=!1};var Ge="closure_listenable_"+(Math.random()*1e6|0),wa=0;function Ia(i,o,a,l,y){this.listener=i,this.proxy=null,this.src=o,this.type=a,this.capture=!!l,this.ha=y,this.key=++wa,this.da=this.fa=!1}function cn(i){i.da=!0,i.listener=null,i.proxy=null,i.src=null,i.ha=null}function hn(i,o,a){for(const l in i)o.call(a,i[l],l,i)}function va(i,o){for(const a in i)o.call(void 0,i[a],a,i)}function rs(i){const o={};for(const a in i)o[a]=i[a];return o}const os="constructor hasOwnProperty isPrototypeOf propertyIsEnumerable toLocaleString toString valueOf".split(" ");function as(i,o){let a,l;for(let y=1;y<arguments.length;y++){l=arguments[y];for(a in l)i[a]=l[a];for(let I=0;I<os.length;I++)a=os[I],Object.prototype.hasOwnProperty.call(l,a)&&(i[a]=l[a])}}function ln(i){this.src=i,this.g={},this.h=0}ln.prototype.add=function(i,o,a,l,y){const I=i.toString();i=this.g[I],i||(i=this.g[I]=[],this.h++);const T=Kn(i,o,l,y);return T>-1?(o=i[T],a||(o.fa=!1)):(o=new Ia(o,this.src,I,!!l,y),o.fa=a,i.push(o)),o};function zn(i,o){const a=o.type;if(a in i.g){var l=i.g[a],y=Array.prototype.indexOf.call(l,o,void 0),I;(I=y>=0)&&Array.prototype.splice.call(l,y,1),I&&(cn(o),i.g[a].length==0&&(delete i.g[a],i.h--))}}function Kn(i,o,a,l){for(let y=0;y<i.length;++y){const I=i[y];if(!I.da&&I.listener==o&&I.capture==!!a&&I.ha==l)return y}return-1}var Jn="closure_lm_"+(Math.random()*1e6|0),Yn={};function cs(i,o,a,l,y){if(Array.isArray(o)){for(let I=0;I<o.length;I++)cs(i,o[I],a,l,y);return null}return a=us(a),i&&i[Ge]?i.J(o,a,g(l)?!!l.capture:!1,y):Ta(i,o,a,!1,l,y)}function Ta(i,o,a,l,y,I){if(!o)throw Error("Invalid event type");const T=g(y)?!!y.capture:!!y;let k=Qn(i);if(k||(i[Jn]=k=new ln(i)),a=k.add(o,a,l,T,I),a.proxy)return a;if(l=Sa(),a.proxy=l,l.src=i,l.listener=a,i.addEventListener)E||(y=T),y===void 0&&(y=!1),i.addEventListener(o.toString(),l,y);else if(i.attachEvent)i.attachEvent(ls(o.toString()),l);else if(i.addListener&&i.removeListener)i.addListener(l);else throw Error("addEventListener and attachEvent are unavailable.");return a}function Sa(){function i(a){return o.call(i.src,i.listener,a)}const o=Aa;return i}function hs(i,o,a,l,y){if(Array.isArray(o))for(var I=0;I<o.length;I++)hs(i,o[I],a,l,y);else l=g(l)?!!l.capture:!!l,a=us(a),i&&i[Ge]?(i=i.i,I=String(o).toString(),I in i.g&&(o=i.g[I],a=Kn(o,a,l,y),a>-1&&(cn(o[a]),Array.prototype.splice.call(o,a,1),o.length==0&&(delete i.g[I],i.h--)))):i&&(i=Qn(i))&&(o=i.g[o.toString()],i=-1,o&&(i=Kn(o,a,l,y)),(a=i>-1?o[i]:null)&&Xn(a))}function Xn(i){if(typeof i!="number"&&i&&!i.da){var o=i.src;if(o&&o[Ge])zn(o.i,i);else{var a=i.type,l=i.proxy;o.removeEventListener?o.removeEventListener(a,l,i.capture):o.detachEvent?o.detachEvent(ls(a),l):o.addListener&&o.removeListener&&o.removeListener(l),(a=Qn(o))?(zn(a,i),a.h==0&&(a.src=null,o[Jn]=null)):cn(i)}}}function ls(i){return i in Yn?Yn[i]:Yn[i]="on"+i}function Aa(i,o){if(i.da)i=!0;else{o=new Y(o,this);const a=i.listener,l=i.ha||i.src;i.fa&&Xn(i),i=a.call(l,o)}return i}function Qn(i){return i=i[Jn],i instanceof ln?i:null}var Zn="__closure_events_fn_"+(Math.random()*1e9>>>0);function us(i){return typeof i=="function"?i:(i[Zn]||(i[Zn]=function(o){return i.handleEvent(o)}),i[Zn])}function W(){_.call(this),this.i=new ln(this),this.M=this,this.G=null}b(W,_),W.prototype[Ge]=!0,W.prototype.removeEventListener=function(i,o,a,l){hs(this,i,o,a,l)};function q(i,o){var a,l=i.G;if(l)for(a=[];l;l=l.G)a.push(l);if(i=i.M,l=o.type||o,typeof o=="string")o=new p(o,i);else if(o instanceof p)o.target=o.target||i;else{var y=o;o=new p(l,i),as(o,y)}y=!0;let I,T;if(a)for(T=a.length-1;T>=0;T--)I=o.g=a[T],y=un(I,l,!0,o)&&y;if(I=o.g=i,y=un(I,l,!0,o)&&y,y=un(I,l,!1,o)&&y,a)for(T=0;T<a.length;T++)I=o.g=a[T],y=un(I,l,!1,o)&&y}W.prototype.N=function(){if(W.Z.N.call(this),this.i){var i=this.i;for(const o in i.g){const a=i.g[o];for(let l=0;l<a.length;l++)cn(a[l]);delete i.g[o],i.h--}}this.G=null},W.prototype.J=function(i,o,a,l){return this.i.add(String(i),o,!1,a,l)},W.prototype.K=function(i,o,a,l){return this.i.add(String(i),o,!0,a,l)};function un(i,o,a,l){if(o=i.i.g[String(o)],!o)return!0;o=o.concat();let y=!0;for(let I=0;I<o.length;++I){const T=o[I];if(T&&!T.da&&T.capture==a){const k=T.listener,H=T.ha||T.src;T.fa&&zn(i.i,T),y=k.call(H,l)!==!1&&y}}return y&&!l.defaultPrevented}function ba(i,o){if(typeof i!="function")if(i&&typeof i.handleEvent=="function")i=v(i.handleEvent,i);else throw Error("Invalid listener argument");return Number(o)>2147483647?-1:h.setTimeout(i,o||0)}function ds(i){i.g=ba(()=>{i.g=null,i.i&&(i.i=!1,ds(i))},i.l);const o=i.h;i.h=null,i.m.apply(null,o)}class Ra extends _{constructor(o,a){super(),this.m=o,this.l=a,this.h=null,this.i=!1,this.g=null}j(o){this.h=arguments,this.g?this.i=!0:ds(this)}N(){super.N(),this.g&&(h.clearTimeout(this.g),this.g=null,this.i=!1,this.h=null)}}function Tt(i){_.call(this),this.h=i,this.g={}}b(Tt,_);var fs=[];function ps(i){hn(i.g,function(o,a){this.g.hasOwnProperty(a)&&Xn(o)},i),i.g={}}Tt.prototype.N=function(){Tt.Z.N.call(this),ps(this)},Tt.prototype.handleEvent=function(){throw Error("EventHandler.handleEvent not implemented")};var ei=h.JSON.stringify,Ca=h.JSON.parse,Pa=class{stringify(i){return h.JSON.stringify(i,void 0)}parse(i){return h.JSON.parse(i,void 0)}};function gs(){}function ka(){}var St={OPEN:"a",hb:"b",ERROR:"c",tb:"d"};function ti(){p.call(this,"d")}b(ti,p);function ni(){p.call(this,"c")}b(ni,p);var ct={},ms=null;function ii(){return ms=ms||new W}ct.Ia="serverreachability";function _s(i){p.call(this,ct.Ia,i)}b(_s,p);function At(i){const o=ii();q(o,new _s(o))}ct.STAT_EVENT="statevent";function ys(i,o){p.call(this,ct.STAT_EVENT,i),this.stat=o}b(ys,p);function z(i){const o=ii();q(o,new ys(o,i))}ct.Ja="timingevent";function Es(i,o){p.call(this,ct.Ja,i),this.size=o}b(Es,p);function bt(i,o){if(typeof i!="function")throw Error("Fn must not be null and must be a function");return h.setTimeout(function(){i()},o)}function Rt(){this.g=!0}Rt.prototype.ua=function(){this.g=!1};function Oa(i,o,a,l,y,I){i.info(function(){if(i.g)if(I){var T="",k=I.split("&");for(let x=0;x<k.length;x++){var H=k[x].split("=");if(H.length>1){const G=H[0];H=H[1];const le=G.split("_");T=le.length>=2&&le[1]=="type"?T+(G+"="+H+"&"):T+(G+"=redacted&")}}}else T=null;else T=I;return"XMLHTTP REQ ("+l+") [attempt "+y+"]: "+o+`
`+a+`
`+T})}function Na(i,o,a,l,y,I,T){i.info(function(){return"XMLHTTP RESP ("+l+") [ attempt "+y+"]: "+o+`
`+a+`
`+I+" "+T})}function ht(i,o,a,l){i.info(function(){return"XMLHTTP TEXT ("+o+"): "+La(i,a)+(l?" "+l:"")})}function Da(i,o){i.info(function(){return"TIMEOUT: "+o})}Rt.prototype.info=function(){};function La(i,o){if(!i.g)return o;if(!o)return null;try{const I=JSON.parse(o);if(I){for(i=0;i<I.length;i++)if(Array.isArray(I[i])){var a=I[i];if(!(a.length<2)){var l=a[1];if(Array.isArray(l)&&!(l.length<1)){var y=l[0];if(y!="noop"&&y!="stop"&&y!="close")for(let T=1;T<l.length;T++)l[T]=""}}}}return ei(I)}catch{return o}}var si={NO_ERROR:0,TIMEOUT:8},Ma={},ws;function ri(){}b(ri,gs),ri.prototype.g=function(){return new XMLHttpRequest},ws=new ri;function Ct(i){return encodeURIComponent(String(i))}function Ua(i){var o=1;i=i.split(":");const a=[];for(;o>0&&i.length;)a.push(i.shift()),o--;return i.length&&a.push(i.join(":")),a}function Re(i,o,a,l){this.j=i,this.i=o,this.l=a,this.S=l||1,this.V=new Tt(this),this.H=45e3,this.J=null,this.o=!1,this.u=this.B=this.A=this.M=this.F=this.T=this.D=null,this.G=[],this.g=null,this.C=0,this.m=this.v=null,this.X=-1,this.K=!1,this.P=0,this.O=null,this.W=this.L=this.U=this.R=!1,this.h=new Is}function Is(){this.i=null,this.g="",this.h=!1}var vs={},oi={};function ai(i,o,a){i.M=1,i.A=fn(he(o)),i.u=a,i.R=!0,Ts(i,null)}function Ts(i,o){i.F=Date.now(),dn(i),i.B=he(i.A);var a=i.B,l=i.S;Array.isArray(l)||(l=[String(l)]),Us(a.i,"t",l),i.C=0,a=i.j.L,i.h=new Is,i.g=er(i.j,a?o:null,!i.u),i.P>0&&(i.O=new Ra(v(i.Y,i,i.g),i.P)),o=i.V,a=i.g,l=i.ba;var y="readystatechange";Array.isArray(y)||(y&&(fs[0]=y.toString()),y=fs);for(let I=0;I<y.length;I++){const T=cs(a,y[I],l||o.handleEvent,!1,o.h||o);if(!T)break;o.g[T.key]=T}o=i.J?rs(i.J):{},i.u?(i.v||(i.v="POST"),o["Content-Type"]="application/x-www-form-urlencoded",i.g.ea(i.B,i.v,i.u,o)):(i.v="GET",i.g.ea(i.B,i.v,null,o)),At(),Oa(i.i,i.v,i.B,i.l,i.S,i.u)}Re.prototype.ba=function(i){i=i.target;const o=this.O;o&&ke(i)==3?o.j():this.Y(i)},Re.prototype.Y=function(i){try{if(i==this.g)e:{const k=ke(this.g),H=this.g.ya(),x=this.g.ca();if(!(k<3)&&(k!=3||this.g&&(this.h.h||this.g.la()||Hs(this.g)))){this.K||k!=4||H==7||(H==8||x<=0?At(3):At(2)),ci(this);var o=this.g.ca();this.X=o;var a=xa(this);if(this.o=o==200,Na(this.i,this.v,this.B,this.l,this.S,k,o),this.o){if(this.U&&!this.L){t:{if(this.g){var l,y=this.g;if((l=y.g?y.g.getResponseHeader("X-HTTP-Initial-Response"):null)&&!d(l)){var I=l;break t}}I=null}if(i=I)ht(this.i,this.l,i,"Initial handshake response via X-HTTP-Initial-Response"),this.L=!0,hi(this,i);else{this.o=!1,this.m=3,z(12),We(this),Pt(this);break e}}if(this.R){i=!0;let G;for(;!this.K&&this.C<a.length;)if(G=Fa(this,a),G==oi){k==4&&(this.m=4,z(14),i=!1),ht(this.i,this.l,null,"[Incomplete Response]");break}else if(G==vs){this.m=4,z(15),ht(this.i,this.l,a,"[Invalid Chunk]"),i=!1;break}else ht(this.i,this.l,G,null),hi(this,G);if(Ss(this)&&this.C!=0&&(this.h.g=this.h.g.slice(this.C),this.C=0),k!=4||a.length!=0||this.h.h||(this.m=1,z(16),i=!1),this.o=this.o&&i,!i)ht(this.i,this.l,a,"[Invalid Chunked Response]"),We(this),Pt(this);else if(a.length>0&&!this.W){this.W=!0;var T=this.j;T.g==this&&T.aa&&!T.P&&(T.j.info("Great, no buffering proxy detected. Bytes received: "+a.length),_i(T),T.P=!0,z(11))}}else ht(this.i,this.l,a,null),hi(this,a);k==4&&We(this),this.o&&!this.K&&(k==4?Ys(this.j,this):(this.o=!1,dn(this)))}else Qa(this.g),o==400&&a.indexOf("Unknown SID")>0?(this.m=3,z(12)):(this.m=0,z(13)),We(this),Pt(this)}}}catch{}finally{}};function xa(i){if(!Ss(i))return i.g.la();const o=Hs(i.g);if(o==="")return"";let a="";const l=o.length,y=ke(i.g)==4;if(!i.h.i){if(typeof TextDecoder>"u")return We(i),Pt(i),"";i.h.i=new h.TextDecoder}for(let I=0;I<l;I++)i.h.h=!0,a+=i.h.i.decode(o[I],{stream:!(y&&I==l-1)});return o.length=0,i.h.g+=a,i.C=0,i.h.g}function Ss(i){return i.g?i.v=="GET"&&i.M!=2&&i.j.Aa:!1}function Fa(i,o){var a=i.C,l=o.indexOf(`
`,a);return l==-1?oi:(a=Number(o.substring(a,l)),isNaN(a)?vs:(l+=1,l+a>o.length?oi:(o=o.slice(l,l+a),i.C=l+a,o)))}Re.prototype.cancel=function(){this.K=!0,We(this)};function dn(i){i.T=Date.now()+i.H,As(i,i.H)}function As(i,o){if(i.D!=null)throw Error("WatchDog timer not null");i.D=bt(v(i.aa,i),o)}function ci(i){i.D&&(h.clearTimeout(i.D),i.D=null)}Re.prototype.aa=function(){this.D=null;const i=Date.now();i-this.T>=0?(Da(this.i,this.B),this.M!=2&&(At(),z(17)),We(this),this.m=2,Pt(this)):As(this,this.T-i)};function Pt(i){i.j.I==0||i.K||Ys(i.j,i)}function We(i){ci(i);var o=i.O;o&&typeof o.dispose=="function"&&o.dispose(),i.O=null,ps(i.V),i.g&&(o=i.g,i.g=null,o.abort(),o.dispose())}function hi(i,o){try{var a=i.j;if(a.I!=0&&(a.g==i||li(a.h,i))){if(!i.L&&li(a.h,i)&&a.I==3){try{var l=a.Ba.g.parse(o)}catch{l=null}if(Array.isArray(l)&&l.length==3){var y=l;if(y[0]==0){e:if(!a.v){if(a.g)if(a.g.F+3e3<i.F)yn(a),mn(a);else break e;mi(a),z(18)}}else a.xa=y[1],0<a.xa-a.K&&y[2]<37500&&a.F&&a.A==0&&!a.C&&(a.C=bt(v(a.Va,a),6e3));Cs(a.h)<=1&&a.ta&&(a.ta=void 0)}else ze(a,11)}else if((i.L||a.g==i)&&yn(a),!d(o))for(y=a.Ba.g.parse(o),o=0;o<y.length;o++){let x=y[o];const G=x[0];if(!(G<=a.K))if(a.K=G,x=x[1],a.I==2)if(x[0]=="c"){a.M=x[1],a.ba=x[2];const le=x[3];le!=null&&(a.ka=le,a.j.info("VER="+a.ka));const Ke=x[4];Ke!=null&&(a.za=Ke,a.j.info("SVER="+a.za));const Oe=x[5];Oe!=null&&typeof Oe=="number"&&Oe>0&&(l=1.5*Oe,a.O=l,a.j.info("backChannelRequestTimeoutMs_="+l)),l=a;const Ne=i.g;if(Ne){const En=Ne.g?Ne.g.getResponseHeader("X-Client-Wire-Protocol"):null;if(En){var I=l.h;I.g||En.indexOf("spdy")==-1&&En.indexOf("quic")==-1&&En.indexOf("h2")==-1||(I.j=I.l,I.g=new Set,I.h&&(ui(I,I.h),I.h=null))}if(l.G){const yi=Ne.g?Ne.g.getResponseHeader("X-HTTP-Session-Id"):null;yi&&(l.wa=yi,F(l.J,l.G,yi))}}a.I=3,a.l&&a.l.ra(),a.aa&&(a.T=Date.now()-i.F,a.j.info("Handshake RTT: "+a.T+"ms")),l=a;var T=i;if(l.na=Zs(l,l.L?l.ba:null,l.W),T.L){Ps(l.h,T);var k=T,H=l.O;H&&(k.H=H),k.D&&(ci(k),dn(k)),l.g=T}else Ks(l);a.i.length>0&&_n(a)}else x[0]!="stop"&&x[0]!="close"||ze(a,7);else a.I==3&&(x[0]=="stop"||x[0]=="close"?x[0]=="stop"?ze(a,7):gi(a):x[0]!="noop"&&a.l&&a.l.qa(x),a.A=0)}}At(4)}catch{}}var Va=class{constructor(i,o){this.g=i,this.map=o}};function bs(i){this.l=i||10,h.PerformanceNavigationTiming?(i=h.performance.getEntriesByType("navigation"),i=i.length>0&&(i[0].nextHopProtocol=="hq"||i[0].nextHopProtocol=="h2")):i=!!(h.chrome&&h.chrome.loadTimes&&h.chrome.loadTimes()&&h.chrome.loadTimes().wasFetchedViaSpdy),this.j=i?this.l:1,this.g=null,this.j>1&&(this.g=new Set),this.h=null,this.i=[]}function Rs(i){return i.h?!0:i.g?i.g.size>=i.j:!1}function Cs(i){return i.h?1:i.g?i.g.size:0}function li(i,o){return i.h?i.h==o:i.g?i.g.has(o):!1}function ui(i,o){i.g?i.g.add(o):i.h=o}function Ps(i,o){i.h&&i.h==o?i.h=null:i.g&&i.g.has(o)&&i.g.delete(o)}bs.prototype.cancel=function(){if(this.i=ks(this),this.h)this.h.cancel(),this.h=null;else if(this.g&&this.g.size!==0){for(const i of this.g.values())i.cancel();this.g.clear()}};function ks(i){if(i.h!=null)return i.i.concat(i.h.G);if(i.g!=null&&i.g.size!==0){let o=i.i;for(const a of i.g.values())o=o.concat(a.G);return o}return M(i.i)}var Os=RegExp("^(?:([^:/?#.]+):)?(?://(?:([^\\\\/?#]*)@)?([^\\\\/?#]*?)(?::([0-9]+))?(?=[\\\\/?#]|$))?([^?#]+)?(?:\\?([^#]*))?(?:#([\\s\\S]*))?$");function ja(i,o){if(i){i=i.split("&");for(let a=0;a<i.length;a++){const l=i[a].indexOf("=");let y,I=null;l>=0?(y=i[a].substring(0,l),I=i[a].substring(l+1)):y=i[a],o(y,I?decodeURIComponent(I.replace(/\+/g," ")):"")}}}function Ce(i){this.g=this.o=this.j="",this.u=null,this.m=this.h="",this.l=!1;let o;i instanceof Ce?(this.l=i.l,kt(this,i.j),this.o=i.o,this.g=i.g,Ot(this,i.u),this.h=i.h,di(this,xs(i.i)),this.m=i.m):i&&(o=String(i).match(Os))?(this.l=!1,kt(this,o[1]||"",!0),this.o=Nt(o[2]||""),this.g=Nt(o[3]||"",!0),Ot(this,o[4]),this.h=Nt(o[5]||"",!0),di(this,o[6]||"",!0),this.m=Nt(o[7]||"")):(this.l=!1,this.i=new Lt(null,this.l))}Ce.prototype.toString=function(){const i=[];var o=this.j;o&&i.push(Dt(o,Ns,!0),":");var a=this.g;return(a||o=="file")&&(i.push("//"),(o=this.o)&&i.push(Dt(o,Ns,!0),"@"),i.push(Ct(a).replace(/%25([0-9a-fA-F]{2})/g,"%$1")),a=this.u,a!=null&&i.push(":",String(a))),(a=this.h)&&(this.g&&a.charAt(0)!="/"&&i.push("/"),i.push(Dt(a,a.charAt(0)=="/"?Ha:$a,!0))),(a=this.i.toString())&&i.push("?",a),(a=this.m)&&i.push("#",Dt(a,Wa)),i.join("")},Ce.prototype.resolve=function(i){const o=he(this);let a=!!i.j;a?kt(o,i.j):a=!!i.o,a?o.o=i.o:a=!!i.g,a?o.g=i.g:a=i.u!=null;var l=i.h;if(a)Ot(o,i.u);else if(a=!!i.h){if(l.charAt(0)!="/")if(this.g&&!this.h)l="/"+l;else{var y=o.h.lastIndexOf("/");y!=-1&&(l=o.h.slice(0,y+1)+l)}if(y=l,y==".."||y==".")l="";else if(y.indexOf("./")!=-1||y.indexOf("/.")!=-1){l=y.lastIndexOf("/",0)==0,y=y.split("/");const I=[];for(let T=0;T<y.length;){const k=y[T++];k=="."?l&&T==y.length&&I.push(""):k==".."?((I.length>1||I.length==1&&I[0]!="")&&I.pop(),l&&T==y.length&&I.push("")):(I.push(k),l=!0)}l=I.join("/")}else l=y}return a?o.h=l:a=i.i.toString()!=="",a?di(o,xs(i.i)):a=!!i.m,a&&(o.m=i.m),o};function he(i){return new Ce(i)}function kt(i,o,a){i.j=a?Nt(o,!0):o,i.j&&(i.j=i.j.replace(/:$/,""))}function Ot(i,o){if(o){if(o=Number(o),isNaN(o)||o<0)throw Error("Bad port number "+o);i.u=o}else i.u=null}function di(i,o,a){o instanceof Lt?(i.i=o,qa(i.i,i.l)):(a||(o=Dt(o,Ga)),i.i=new Lt(o,i.l))}function F(i,o,a){i.i.set(o,a)}function fn(i){return F(i,"zx",Math.floor(Math.random()*2147483648).toString(36)+Math.abs(Math.floor(Math.random()*2147483648)^Date.now()).toString(36)),i}function Nt(i,o){return i?o?decodeURI(i.replace(/%25/g,"%2525")):decodeURIComponent(i):""}function Dt(i,o,a){return typeof i=="string"?(i=encodeURI(i).replace(o,Ba),a&&(i=i.replace(/%25([0-9a-fA-F]{2})/g,"%$1")),i):null}function Ba(i){return i=i.charCodeAt(0),"%"+(i>>4&15).toString(16)+(i&15).toString(16)}var Ns=/[#\/\?@]/g,$a=/[#\?:]/g,Ha=/[#\?]/g,Ga=/[#\?@]/g,Wa=/#/g;function Lt(i,o){this.h=this.g=null,this.i=i||null,this.j=!!o}function qe(i){i.g||(i.g=new Map,i.h=0,i.i&&ja(i.i,function(o,a){i.add(decodeURIComponent(o.replace(/\+/g," ")),a)}))}n=Lt.prototype,n.add=function(i,o){qe(this),this.i=null,i=lt(this,i);let a=this.g.get(i);return a||this.g.set(i,a=[]),a.push(o),this.h+=1,this};function Ds(i,o){qe(i),o=lt(i,o),i.g.has(o)&&(i.i=null,i.h-=i.g.get(o).length,i.g.delete(o))}function Ls(i,o){return qe(i),o=lt(i,o),i.g.has(o)}n.forEach=function(i,o){qe(this),this.g.forEach(function(a,l){a.forEach(function(y){i.call(o,y,l,this)},this)},this)};function Ms(i,o){qe(i);let a=[];if(typeof o=="string")Ls(i,o)&&(a=a.concat(i.g.get(lt(i,o))));else for(i=Array.from(i.g.values()),o=0;o<i.length;o++)a=a.concat(i[o]);return a}n.set=function(i,o){return qe(this),this.i=null,i=lt(this,i),Ls(this,i)&&(this.h-=this.g.get(i).length),this.g.set(i,[o]),this.h+=1,this},n.get=function(i,o){return i?(i=Ms(this,i),i.length>0?String(i[0]):o):o};function Us(i,o,a){Ds(i,o),a.length>0&&(i.i=null,i.g.set(lt(i,o),M(a)),i.h+=a.length)}n.toString=function(){if(this.i)return this.i;if(!this.g)return"";const i=[],o=Array.from(this.g.keys());for(let l=0;l<o.length;l++){var a=o[l];const y=Ct(a);a=Ms(this,a);for(let I=0;I<a.length;I++){let T=y;a[I]!==""&&(T+="="+Ct(a[I])),i.push(T)}}return this.i=i.join("&")};function xs(i){const o=new Lt;return o.i=i.i,i.g&&(o.g=new Map(i.g),o.h=i.h),o}function lt(i,o){return o=String(o),i.j&&(o=o.toLowerCase()),o}function qa(i,o){o&&!i.j&&(qe(i),i.i=null,i.g.forEach(function(a,l){const y=l.toLowerCase();l!=y&&(Ds(this,l),Us(this,y,a))},i)),i.j=o}function za(i,o){const a=new Rt;if(h.Image){const l=new Image;l.onload=A(Pe,a,"TestLoadImage: loaded",!0,o,l),l.onerror=A(Pe,a,"TestLoadImage: error",!1,o,l),l.onabort=A(Pe,a,"TestLoadImage: abort",!1,o,l),l.ontimeout=A(Pe,a,"TestLoadImage: timeout",!1,o,l),h.setTimeout(function(){l.ontimeout&&l.ontimeout()},1e4),l.src=i}else o(!1)}function Ka(i,o){const a=new Rt,l=new AbortController,y=setTimeout(()=>{l.abort(),Pe(a,"TestPingServer: timeout",!1,o)},1e4);fetch(i,{signal:l.signal}).then(I=>{clearTimeout(y),I.ok?Pe(a,"TestPingServer: ok",!0,o):Pe(a,"TestPingServer: server error",!1,o)}).catch(()=>{clearTimeout(y),Pe(a,"TestPingServer: error",!1,o)})}function Pe(i,o,a,l,y){try{y&&(y.onload=null,y.onerror=null,y.onabort=null,y.ontimeout=null),l(a)}catch{}}function Ja(){this.g=new Pa}function fi(i){this.i=i.Sb||null,this.h=i.ab||!1}b(fi,gs),fi.prototype.g=function(){return new pn(this.i,this.h)};function pn(i,o){W.call(this),this.H=i,this.o=o,this.m=void 0,this.status=this.readyState=0,this.responseType=this.responseText=this.response=this.statusText="",this.onreadystatechange=null,this.A=new Headers,this.h=null,this.F="GET",this.D="",this.g=!1,this.B=this.j=this.l=null,this.v=new AbortController}b(pn,W),n=pn.prototype,n.open=function(i,o){if(this.readyState!=0)throw this.abort(),Error("Error reopening a connection");this.F=i,this.D=o,this.readyState=1,Ut(this)},n.send=function(i){if(this.readyState!=1)throw this.abort(),Error("need to call open() first. ");if(this.v.signal.aborted)throw this.abort(),Error("Request was aborted.");this.g=!0;const o={headers:this.A,method:this.F,credentials:this.m,cache:void 0,signal:this.v.signal};i&&(o.body=i),(this.H||h).fetch(new Request(this.D,o)).then(this.Pa.bind(this),this.ga.bind(this))},n.abort=function(){this.response=this.responseText="",this.A=new Headers,this.status=0,this.v.abort(),this.j&&this.j.cancel("Request was aborted.").catch(()=>{}),this.readyState>=1&&this.g&&this.readyState!=4&&(this.g=!1,Mt(this)),this.readyState=0},n.Pa=function(i){if(this.g&&(this.l=i,this.h||(this.status=this.l.status,this.statusText=this.l.statusText,this.h=i.headers,this.readyState=2,Ut(this)),this.g&&(this.readyState=3,Ut(this),this.g)))if(this.responseType==="arraybuffer")i.arrayBuffer().then(this.Na.bind(this),this.ga.bind(this));else if(typeof h.ReadableStream<"u"&&"body"in i){if(this.j=i.body.getReader(),this.o){if(this.responseType)throw Error('responseType must be empty for "streamBinaryChunks" mode responses.');this.response=[]}else this.response=this.responseText="",this.B=new TextDecoder;Fs(this)}else i.text().then(this.Oa.bind(this),this.ga.bind(this))};function Fs(i){i.j.read().then(i.Ma.bind(i)).catch(i.ga.bind(i))}n.Ma=function(i){if(this.g){if(this.o&&i.value)this.response.push(i.value);else if(!this.o){var o=i.value?i.value:new Uint8Array(0);(o=this.B.decode(o,{stream:!i.done}))&&(this.response=this.responseText+=o)}i.done?Mt(this):Ut(this),this.readyState==3&&Fs(this)}},n.Oa=function(i){this.g&&(this.response=this.responseText=i,Mt(this))},n.Na=function(i){this.g&&(this.response=i,Mt(this))},n.ga=function(){this.g&&Mt(this)};function Mt(i){i.readyState=4,i.l=null,i.j=null,i.B=null,Ut(i)}n.setRequestHeader=function(i,o){this.A.append(i,o)},n.getResponseHeader=function(i){return this.h&&this.h.get(i.toLowerCase())||""},n.getAllResponseHeaders=function(){if(!this.h)return"";const i=[],o=this.h.entries();for(var a=o.next();!a.done;)a=a.value,i.push(a[0]+": "+a[1]),a=o.next();return i.join(`\r
`)};function Ut(i){i.onreadystatechange&&i.onreadystatechange.call(i)}Object.defineProperty(pn.prototype,"withCredentials",{get:function(){return this.m==="include"},set:function(i){this.m=i?"include":"same-origin"}});function Vs(i){let o="";return hn(i,function(a,l){o+=l,o+=":",o+=a,o+=`\r
`}),o}function pi(i,o,a){e:{for(l in a){var l=!1;break e}l=!0}l||(a=Vs(a),typeof i=="string"?a!=null&&Ct(a):F(i,o,a))}function j(i){W.call(this),this.headers=new Map,this.L=i||null,this.h=!1,this.g=null,this.D="",this.o=0,this.l="",this.j=this.B=this.v=this.A=!1,this.m=null,this.F="",this.H=!1}b(j,W);var Ya=/^https?$/i,Xa=["POST","PUT"];n=j.prototype,n.Fa=function(i){this.H=i},n.ea=function(i,o,a,l){if(this.g)throw Error("[goog.net.XhrIo] Object is active with another request="+this.D+"; newUri="+i);o=o?o.toUpperCase():"GET",this.D=i,this.l="",this.o=0,this.A=!1,this.h=!0,this.g=this.L?this.L.g():ws.g(),this.g.onreadystatechange=S(v(this.Ca,this));try{this.B=!0,this.g.open(o,String(i),!0),this.B=!1}catch(I){js(this,I);return}if(i=a||"",a=new Map(this.headers),l)if(Object.getPrototypeOf(l)===Object.prototype)for(var y in l)a.set(y,l[y]);else if(typeof l.keys=="function"&&typeof l.get=="function")for(const I of l.keys())a.set(I,l.get(I));else throw Error("Unknown input type for opt_headers: "+String(l));l=Array.from(a.keys()).find(I=>I.toLowerCase()=="content-type"),y=h.FormData&&i instanceof h.FormData,!(Array.prototype.indexOf.call(Xa,o,void 0)>=0)||l||y||a.set("Content-Type","application/x-www-form-urlencoded;charset=utf-8");for(const[I,T]of a)this.g.setRequestHeader(I,T);this.F&&(this.g.responseType=this.F),"withCredentials"in this.g&&this.g.withCredentials!==this.H&&(this.g.withCredentials=this.H);try{this.m&&(clearTimeout(this.m),this.m=null),this.v=!0,this.g.send(i),this.v=!1}catch(I){js(this,I)}};function js(i,o){i.h=!1,i.g&&(i.j=!0,i.g.abort(),i.j=!1),i.l=o,i.o=5,Bs(i),gn(i)}function Bs(i){i.A||(i.A=!0,q(i,"complete"),q(i,"error"))}n.abort=function(i){this.g&&this.h&&(this.h=!1,this.j=!0,this.g.abort(),this.j=!1,this.o=i||7,q(this,"complete"),q(this,"abort"),gn(this))},n.N=function(){this.g&&(this.h&&(this.h=!1,this.j=!0,this.g.abort(),this.j=!1),gn(this,!0)),j.Z.N.call(this)},n.Ca=function(){this.u||(this.B||this.v||this.j?$s(this):this.Xa())},n.Xa=function(){$s(this)};function $s(i){if(i.h&&typeof c<"u"){if(i.v&&ke(i)==4)setTimeout(i.Ca.bind(i),0);else if(q(i,"readystatechange"),ke(i)==4){i.h=!1;try{const I=i.ca();e:switch(I){case 200:case 201:case 202:case 204:case 206:case 304:case 1223:var o=!0;break e;default:o=!1}var a;if(!(a=o)){var l;if(l=I===0){let T=String(i.D).match(Os)[1]||null;!T&&h.self&&h.self.location&&(T=h.self.location.protocol.slice(0,-1)),l=!Ya.test(T?T.toLowerCase():"")}a=l}if(a)q(i,"complete"),q(i,"success");else{i.o=6;try{var y=ke(i)>2?i.g.statusText:""}catch{y=""}i.l=y+" ["+i.ca()+"]",Bs(i)}}finally{gn(i)}}}}function gn(i,o){if(i.g){i.m&&(clearTimeout(i.m),i.m=null);const a=i.g;i.g=null,o||q(i,"ready");try{a.onreadystatechange=null}catch{}}}n.isActive=function(){return!!this.g};function ke(i){return i.g?i.g.readyState:0}n.ca=function(){try{return ke(this)>2?this.g.status:-1}catch{return-1}},n.la=function(){try{return this.g?this.g.responseText:""}catch{return""}},n.La=function(i){if(this.g){var o=this.g.responseText;return i&&o.indexOf(i)==0&&(o=o.substring(i.length)),Ca(o)}};function Hs(i){try{if(!i.g)return null;if("response"in i.g)return i.g.response;switch(i.F){case"":case"text":return i.g.responseText;case"arraybuffer":if("mozResponseArrayBuffer"in i.g)return i.g.mozResponseArrayBuffer}return null}catch{return null}}function Qa(i){const o={};i=(i.g&&ke(i)>=2&&i.g.getAllResponseHeaders()||"").split(`\r
`);for(let l=0;l<i.length;l++){if(d(i[l]))continue;var a=Ua(i[l]);const y=a[0];if(a=a[1],typeof a!="string")continue;a=a.trim();const I=o[y]||[];o[y]=I,I.push(a)}va(o,function(l){return l.join(", ")})}n.ya=function(){return this.o},n.Ha=function(){return typeof this.l=="string"?this.l:String(this.l)};function xt(i,o,a){return a&&a.internalChannelParams&&a.internalChannelParams[i]||o}function Gs(i){this.za=0,this.i=[],this.j=new Rt,this.ba=this.na=this.J=this.W=this.g=this.wa=this.G=this.H=this.u=this.U=this.o=null,this.Ya=this.V=0,this.Sa=xt("failFast",!1,i),this.F=this.C=this.v=this.m=this.l=null,this.X=!0,this.xa=this.K=-1,this.Y=this.A=this.D=0,this.Qa=xt("baseRetryDelayMs",5e3,i),this.Za=xt("retryDelaySeedMs",1e4,i),this.Ta=xt("forwardChannelMaxRetries",2,i),this.va=xt("forwardChannelRequestTimeoutMs",2e4,i),this.ma=i&&i.xmlHttpFactory||void 0,this.Ua=i&&i.Rb||void 0,this.Aa=i&&i.useFetchStreams||!1,this.O=void 0,this.L=i&&i.supportsCrossDomainXhr||!1,this.M="",this.h=new bs(i&&i.concurrentRequestLimit),this.Ba=new Ja,this.S=i&&i.fastHandshake||!1,this.R=i&&i.encodeInitMessageHeaders||!1,this.S&&this.R&&(this.R=!1),this.Ra=i&&i.Pb||!1,i&&i.ua&&this.j.ua(),i&&i.forceLongPolling&&(this.X=!1),this.aa=!this.S&&this.X&&i&&i.detectBufferingProxy||!1,this.ia=void 0,i&&i.longPollingTimeout&&i.longPollingTimeout>0&&(this.ia=i.longPollingTimeout),this.ta=void 0,this.T=0,this.P=!1,this.ja=this.B=null}n=Gs.prototype,n.ka=8,n.I=1,n.connect=function(i,o,a,l){z(0),this.W=i,this.H=o||{},a&&l!==void 0&&(this.H.OSID=a,this.H.OAID=l),this.F=this.X,this.J=Zs(this,null,this.W),_n(this)};function gi(i){if(Ws(i),i.I==3){var o=i.V++,a=he(i.J);if(F(a,"SID",i.M),F(a,"RID",o),F(a,"TYPE","terminate"),Ft(i,a),o=new Re(i,i.j,o),o.M=2,o.A=fn(he(a)),a=!1,h.navigator&&h.navigator.sendBeacon)try{a=h.navigator.sendBeacon(o.A.toString(),"")}catch{}!a&&h.Image&&(new Image().src=o.A,a=!0),a||(o.g=er(o.j,null),o.g.ea(o.A)),o.F=Date.now(),dn(o)}Qs(i)}function mn(i){i.g&&(_i(i),i.g.cancel(),i.g=null)}function Ws(i){mn(i),i.v&&(h.clearTimeout(i.v),i.v=null),yn(i),i.h.cancel(),i.m&&(typeof i.m=="number"&&h.clearTimeout(i.m),i.m=null)}function _n(i){if(!Rs(i.h)&&!i.m){i.m=!0;var o=i.Ea;be||u(),te||(be(),te=!0),m.add(o,i),i.D=0}}function Za(i,o){return Cs(i.h)>=i.h.j-(i.m?1:0)?!1:i.m?(i.i=o.G.concat(i.i),!0):i.I==1||i.I==2||i.D>=(i.Sa?0:i.Ta)?!1:(i.m=bt(v(i.Ea,i,o),Xs(i,i.D)),i.D++,!0)}n.Ea=function(i){if(this.m)if(this.m=null,this.I==1){if(!i){this.V=Math.floor(Math.random()*1e5),i=this.V++;const y=new Re(this,this.j,i);let I=this.o;if(this.U&&(I?(I=rs(I),as(I,this.U)):I=this.U),this.u!==null||this.R||(y.J=I,I=null),this.S)e:{for(var o=0,a=0;a<this.i.length;a++){t:{var l=this.i[a];if("__data__"in l.map&&(l=l.map.__data__,typeof l=="string")){l=l.length;break t}l=void 0}if(l===void 0)break;if(o+=l,o>4096){o=a;break e}if(o===4096||a===this.i.length-1){o=a+1;break e}}o=1e3}else o=1e3;o=zs(this,y,o),a=he(this.J),F(a,"RID",i),F(a,"CVER",22),this.G&&F(a,"X-HTTP-Session-Id",this.G),Ft(this,a),I&&(this.R?o="headers="+Ct(Vs(I))+"&"+o:this.u&&pi(a,this.u,I)),ui(this.h,y),this.Ra&&F(a,"TYPE","init"),this.S?(F(a,"$req",o),F(a,"SID","null"),y.U=!0,ai(y,a,null)):ai(y,a,o),this.I=2}}else this.I==3&&(i?qs(this,i):this.i.length==0||Rs(this.h)||qs(this))};function qs(i,o){var a;o?a=o.l:a=i.V++;const l=he(i.J);F(l,"SID",i.M),F(l,"RID",a),F(l,"AID",i.K),Ft(i,l),i.u&&i.o&&pi(l,i.u,i.o),a=new Re(i,i.j,a,i.D+1),i.u===null&&(a.J=i.o),o&&(i.i=o.G.concat(i.i)),o=zs(i,a,1e3),a.H=Math.round(i.va*.5)+Math.round(i.va*.5*Math.random()),ui(i.h,a),ai(a,l,o)}function Ft(i,o){i.H&&hn(i.H,function(a,l){F(o,l,a)}),i.l&&hn({},function(a,l){F(o,l,a)})}function zs(i,o,a){a=Math.min(i.i.length,a);const l=i.l?v(i.l.Ka,i.l,i):null;e:{var y=i.i;let k=-1;for(;;){const H=["count="+a];k==-1?a>0?(k=y[0].g,H.push("ofs="+k)):k=0:H.push("ofs="+k);let x=!0;for(let G=0;G<a;G++){var I=y[G].g;const le=y[G].map;if(I-=k,I<0)k=Math.max(0,y[G].g-100),x=!1;else try{I="req"+I+"_"||"";try{var T=le instanceof Map?le:Object.entries(le);for(const[Ke,Oe]of T){let Ne=Oe;g(Oe)&&(Ne=ei(Oe)),H.push(I+Ke+"="+encodeURIComponent(Ne))}}catch(Ke){throw H.push(I+"type="+encodeURIComponent("_badmap")),Ke}}catch{l&&l(le)}}if(x){T=H.join("&");break e}}T=void 0}return i=i.i.splice(0,a),o.G=i,T}function Ks(i){if(!i.g&&!i.v){i.Y=1;var o=i.Da;be||u(),te||(be(),te=!0),m.add(o,i),i.A=0}}function mi(i){return i.g||i.v||i.A>=3?!1:(i.Y++,i.v=bt(v(i.Da,i),Xs(i,i.A)),i.A++,!0)}n.Da=function(){if(this.v=null,Js(this),this.aa&&!(this.P||this.g==null||this.T<=0)){var i=4*this.T;this.j.info("BP detection timer enabled: "+i),this.B=bt(v(this.Wa,this),i)}},n.Wa=function(){this.B&&(this.B=null,this.j.info("BP detection timeout reached."),this.j.info("Buffering proxy detected and switch to long-polling!"),this.F=!1,this.P=!0,z(10),mn(this),Js(this))};function _i(i){i.B!=null&&(h.clearTimeout(i.B),i.B=null)}function Js(i){i.g=new Re(i,i.j,"rpc",i.Y),i.u===null&&(i.g.J=i.o),i.g.P=0;var o=he(i.na);F(o,"RID","rpc"),F(o,"SID",i.M),F(o,"AID",i.K),F(o,"CI",i.F?"0":"1"),!i.F&&i.ia&&F(o,"TO",i.ia),F(o,"TYPE","xmlhttp"),Ft(i,o),i.u&&i.o&&pi(o,i.u,i.o),i.O&&(i.g.H=i.O);var a=i.g;i=i.ba,a.M=1,a.A=fn(he(o)),a.u=null,a.R=!0,Ts(a,i)}n.Va=function(){this.C!=null&&(this.C=null,mn(this),mi(this),z(19))};function yn(i){i.C!=null&&(h.clearTimeout(i.C),i.C=null)}function Ys(i,o){var a=null;if(i.g==o){yn(i),_i(i),i.g=null;var l=2}else if(li(i.h,o))a=o.G,Ps(i.h,o),l=1;else return;if(i.I!=0){if(o.o)if(l==1){a=o.u?o.u.length:0,o=Date.now()-o.F;var y=i.D;l=ii(),q(l,new Es(l,a)),_n(i)}else Ks(i);else if(y=o.m,y==3||y==0&&o.X>0||!(l==1&&Za(i,o)||l==2&&mi(i)))switch(a&&a.length>0&&(o=i.h,o.i=o.i.concat(a)),y){case 1:ze(i,5);break;case 4:ze(i,10);break;case 3:ze(i,6);break;default:ze(i,2)}}}function Xs(i,o){let a=i.Qa+Math.floor(Math.random()*i.Za);return i.isActive()||(a*=2),a*o}function ze(i,o){if(i.j.info("Error code "+o),o==2){var a=v(i.bb,i),l=i.Ua;const y=!l;l=new Ce(l||"//www.google.com/images/cleardot.gif"),h.location&&h.location.protocol=="http"||kt(l,"https"),fn(l),y?za(l.toString(),a):Ka(l.toString(),a)}else z(2);i.I=0,i.l&&i.l.pa(o),Qs(i),Ws(i)}n.bb=function(i){i?(this.j.info("Successfully pinged google.com"),z(2)):(this.j.info("Failed to ping google.com"),z(1))};function Qs(i){if(i.I=0,i.ja=[],i.l){const o=ks(i.h);(o.length!=0||i.i.length!=0)&&(O(i.ja,o),O(i.ja,i.i),i.h.i.length=0,M(i.i),i.i.length=0),i.l.oa()}}function Zs(i,o,a){var l=a instanceof Ce?he(a):new Ce(a);if(l.g!="")o&&(l.g=o+"."+l.g),Ot(l,l.u);else{var y=h.location;l=y.protocol,o=o?o+"."+y.hostname:y.hostname,y=+y.port;const I=new Ce(null);l&&kt(I,l),o&&(I.g=o),y&&Ot(I,y),a&&(I.h=a),l=I}return a=i.G,o=i.wa,a&&o&&F(l,a,o),F(l,"VER",i.ka),Ft(i,l),l}function er(i,o,a){if(o&&!i.L)throw Error("Can't create secondary domain capable XhrIo object.");return o=i.Aa&&!i.ma?new j(new fi({ab:a})):new j(i.ma),o.Fa(i.L),o}n.isActive=function(){return!!this.l&&this.l.isActive(this)};function tr(){}n=tr.prototype,n.ra=function(){},n.qa=function(){},n.pa=function(){},n.oa=function(){},n.isActive=function(){return!0},n.Ka=function(){};function ne(i,o){W.call(this),this.g=new Gs(o),this.l=i,this.h=o&&o.messageUrlParams||null,i=o&&o.messageHeaders||null,o&&o.clientProtocolHeaderRequired&&(i?i["X-Client-Protocol"]="webchannel":i={"X-Client-Protocol":"webchannel"}),this.g.o=i,i=o&&o.initMessageHeaders||null,o&&o.messageContentType&&(i?i["X-WebChannel-Content-Type"]=o.messageContentType:i={"X-WebChannel-Content-Type":o.messageContentType}),o&&o.sa&&(i?i["X-WebChannel-Client-Profile"]=o.sa:i={"X-WebChannel-Client-Profile":o.sa}),this.g.U=i,(i=o&&o.Qb)&&!d(i)&&(this.g.u=i),this.A=o&&o.supportsCrossDomainXhr||!1,this.v=o&&o.sendRawJson||!1,(o=o&&o.httpSessionIdParam)&&!d(o)&&(this.g.G=o,i=this.h,i!==null&&o in i&&(i=this.h,o in i&&delete i[o])),this.j=new ut(this)}b(ne,W),ne.prototype.m=function(){this.g.l=this.j,this.A&&(this.g.L=!0),this.g.connect(this.l,this.h||void 0)},ne.prototype.close=function(){gi(this.g)},ne.prototype.o=function(i){var o=this.g;if(typeof i=="string"){var a={};a.__data__=i,i=a}else this.v&&(a={},a.__data__=ei(i),i=a);o.i.push(new Va(o.Ya++,i)),o.I==3&&_n(o)},ne.prototype.N=function(){this.g.l=null,delete this.j,gi(this.g),delete this.g,ne.Z.N.call(this)};function nr(i){ti.call(this),i.__headers__&&(this.headers=i.__headers__,this.statusCode=i.__status__,delete i.__headers__,delete i.__status__);var o=i.__sm__;if(o){e:{for(const a in o){i=a;break e}i=void 0}(this.i=i)&&(i=this.i,o=o!==null&&i in o?o[i]:void 0),this.data=o}else this.data=i}b(nr,ti);function ir(){ni.call(this),this.status=1}b(ir,ni);function ut(i){this.g=i}b(ut,tr),ut.prototype.ra=function(){q(this.g,"a")},ut.prototype.qa=function(i){q(this.g,new nr(i))},ut.prototype.pa=function(i){q(this.g,new ir)},ut.prototype.oa=function(){q(this.g,"b")},ne.prototype.send=ne.prototype.o,ne.prototype.open=ne.prototype.m,ne.prototype.close=ne.prototype.close,si.NO_ERROR=0,si.TIMEOUT=8,si.HTTP_ERROR=6,Ma.COMPLETE="complete",ka.EventType=St,St.OPEN="a",St.CLOSE="b",St.ERROR="c",St.MESSAGE="d",W.prototype.listen=W.prototype.J,j.prototype.listenOnce=j.prototype.K,j.prototype.getLastError=j.prototype.Ha,j.prototype.getLastErrorCode=j.prototype.ya,j.prototype.getStatus=j.prototype.ca,j.prototype.getResponseJson=j.prototype.La,j.prototype.getResponseText=j.prototype.la,j.prototype.send=j.prototype.ea,j.prototype.setWithCredentials=j.prototype.Fa}).apply(typeof In<"u"?In:typeof self<"u"?self:typeof window<"u"?window:{});const Ur="@firebase/firestore",xr="4.9.2";/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class K{constructor(e){this.uid=e}isAuthenticated(){return this.uid!=null}toKey(){return this.isAuthenticated()?"uid:"+this.uid:"anonymous-user"}isEqual(e){return e.uid===this.uid}}K.UNAUTHENTICATED=new K(null),K.GOOGLE_CREDENTIALS=new K("google-credentials-uid"),K.FIRST_PARTY=new K("first-party-uid"),K.MOCK_USER=new K("mock-user");/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let rn="12.3.0";/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const yt=new Vn("@firebase/firestore");function ae(n,...e){if(yt.logLevel<=U.DEBUG){const t=e.map(Zi);yt.debug(`Firestore (${rn}): ${n}`,...t)}}function ea(n,...e){if(yt.logLevel<=U.ERROR){const t=e.map(Zi);yt.error(`Firestore (${rn}): ${n}`,...t)}}function Xu(n,...e){if(yt.logLevel<=U.WARN){const t=e.map(Zi);yt.warn(`Firestore (${rn}): ${n}`,...t)}}function Zi(n){if(typeof n=="string")return n;try{/**
* @license
* Copyright 2020 Google LLC
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*   http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/return(function(t){return JSON.stringify(t)})(n)}catch{return n}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Yt(n,e,t){let s="Unexpected state";typeof e=="string"?s=e:t=e,ta(n,s,t)}function ta(n,e,t){let s=`FIRESTORE (${rn}) INTERNAL ASSERTION FAILED: ${e} (ID: ${n.toString(16)})`;if(t!==void 0)try{s+=" CONTEXT: "+JSON.stringify(t)}catch{s+=" CONTEXT: "+t}throw ea(s),new Error(s)}function Ht(n,e,t,s){let r="Unexpected state";typeof t=="string"?r=t:s=t,n||ta(e,r,s)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const D={CANCELLED:"cancelled",INVALID_ARGUMENT:"invalid-argument",FAILED_PRECONDITION:"failed-precondition"};class L extends _e{constructor(e,t){super(e,t),this.code=e,this.message=t,this.toString=()=>`${this.name}: [code=${this.code}]: ${this.message}`}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Gt{constructor(){this.promise=new Promise(((e,t)=>{this.resolve=e,this.reject=t}))}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class na{constructor(e,t){this.user=t,this.type="OAuth",this.headers=new Map,this.headers.set("Authorization",`Bearer ${e}`)}}class Qu{getToken(){return Promise.resolve(null)}invalidateToken(){}start(e,t){e.enqueueRetryable((()=>t(K.UNAUTHENTICATED)))}shutdown(){}}class Zu{constructor(e){this.token=e,this.changeListener=null}getToken(){return Promise.resolve(this.token)}invalidateToken(){}start(e,t){this.changeListener=t,e.enqueueRetryable((()=>t(this.token.user)))}shutdown(){this.changeListener=null}}class ed{constructor(e){this.t=e,this.currentUser=K.UNAUTHENTICATED,this.i=0,this.forceRefresh=!1,this.auth=null}start(e,t){Ht(this.o===void 0,42304);let s=this.i;const r=w=>this.i!==s?(s=this.i,t(w)):Promise.resolve();let c=new Gt;this.o=()=>{this.i++,this.currentUser=this.u(),c.resolve(),c=new Gt,e.enqueueRetryable((()=>r(this.currentUser)))};const h=()=>{const w=c;e.enqueueRetryable((async()=>{await w.promise,await r(this.currentUser)}))},g=w=>{ae("FirebaseAuthCredentialsProvider","Auth detected"),this.auth=w,this.o&&(this.auth.addAuthTokenListener(this.o),h())};this.t.onInit((w=>g(w))),setTimeout((()=>{if(!this.auth){const w=this.t.getImmediate({optional:!0});w?g(w):(ae("FirebaseAuthCredentialsProvider","Auth not yet detected"),c.resolve(),c=new Gt)}}),0),h()}getToken(){const e=this.i,t=this.forceRefresh;return this.forceRefresh=!1,this.auth?this.auth.getToken(t).then((s=>this.i!==e?(ae("FirebaseAuthCredentialsProvider","getToken aborted due to token change."),this.getToken()):s?(Ht(typeof s.accessToken=="string",31837,{l:s}),new na(s.accessToken,this.currentUser)):null)):Promise.resolve(null)}invalidateToken(){this.forceRefresh=!0}shutdown(){this.auth&&this.o&&this.auth.removeAuthTokenListener(this.o),this.o=void 0}u(){const e=this.auth&&this.auth.getUid();return Ht(e===null||typeof e=="string",2055,{h:e}),new K(e)}}class td{constructor(e,t,s){this.P=e,this.T=t,this.I=s,this.type="FirstParty",this.user=K.FIRST_PARTY,this.A=new Map}R(){return this.I?this.I():null}get headers(){this.A.set("X-Goog-AuthUser",this.P);const e=this.R();return e&&this.A.set("Authorization",e),this.T&&this.A.set("X-Goog-Iam-Authorization-Token",this.T),this.A}}class nd{constructor(e,t,s){this.P=e,this.T=t,this.I=s}getToken(){return Promise.resolve(new td(this.P,this.T,this.I))}start(e,t){e.enqueueRetryable((()=>t(K.FIRST_PARTY)))}shutdown(){}invalidateToken(){}}class Fr{constructor(e){this.value=e,this.type="AppCheck",this.headers=new Map,e&&e.length>0&&this.headers.set("x-firebase-appcheck",this.value)}}class id{constructor(e,t){this.V=t,this.forceRefresh=!1,this.appCheck=null,this.m=null,this.p=null,ie(e)&&e.settings.appCheckToken&&(this.p=e.settings.appCheckToken)}start(e,t){Ht(this.o===void 0,3512);const s=c=>{c.error!=null&&ae("FirebaseAppCheckTokenProvider",`Error getting App Check token; using placeholder token instead. Error: ${c.error.message}`);const h=c.token!==this.m;return this.m=c.token,ae("FirebaseAppCheckTokenProvider",`Received ${h?"new":"existing"} token.`),h?t(c.token):Promise.resolve()};this.o=c=>{e.enqueueRetryable((()=>s(c)))};const r=c=>{ae("FirebaseAppCheckTokenProvider","AppCheck detected"),this.appCheck=c,this.o&&this.appCheck.addTokenListener(this.o)};this.V.onInit((c=>r(c))),setTimeout((()=>{if(!this.appCheck){const c=this.V.getImmediate({optional:!0});c?r(c):ae("FirebaseAppCheckTokenProvider","AppCheck not yet detected")}}),0)}getToken(){if(this.p)return Promise.resolve(new Fr(this.p));const e=this.forceRefresh;return this.forceRefresh=!1,this.appCheck?this.appCheck.getToken(e).then((t=>t?(Ht(typeof t.token=="string",44558,{tokenResult:t}),this.m=t.token,new Fr(t.token)):null)):Promise.resolve(null)}invalidateToken(){this.forceRefresh=!0}shutdown(){this.appCheck&&this.o&&this.appCheck.removeTokenListener(this.o),this.o=void 0}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function sd(n){const e=typeof self<"u"&&(self.crypto||self.msCrypto),t=new Uint8Array(n);if(e&&typeof e.getRandomValues=="function")e.getRandomValues(t);else for(let s=0;s<n;s++)t[s]=Math.floor(256*Math.random());return t}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class rd{static newId(){const e="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",t=62*Math.floor(4.129032258064516);let s="";for(;s.length<20;){const r=sd(40);for(let c=0;c<r.length;++c)s.length<20&&r[c]<t&&(s+=e.charAt(r[c]%62))}return s}}function $e(n,e){return n<e?-1:n>e?1:0}function od(n,e){const t=Math.min(n.length,e.length);for(let s=0;s<t;s++){const r=n.charAt(s),c=e.charAt(s);if(r!==c)return bi(r)===bi(c)?$e(r,c):bi(r)?1:-1}return $e(n.length,e.length)}const ad=55296,cd=57343;function bi(n){const e=n.charCodeAt(0);return e>=ad&&e<=cd}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Vr="__name__";class ue{constructor(e,t,s){t===void 0?t=0:t>e.length&&Yt(637,{offset:t,range:e.length}),s===void 0?s=e.length-t:s>e.length-t&&Yt(1746,{length:s,range:e.length-t}),this.segments=e,this.offset=t,this.len=s}get length(){return this.len}isEqual(e){return ue.comparator(this,e)===0}child(e){const t=this.segments.slice(this.offset,this.limit());return e instanceof ue?e.forEach((s=>{t.push(s)})):t.push(e),this.construct(t)}limit(){return this.offset+this.length}popFirst(e){return e=e===void 0?1:e,this.construct(this.segments,this.offset+e,this.length-e)}popLast(){return this.construct(this.segments,this.offset,this.length-1)}firstSegment(){return this.segments[this.offset]}lastSegment(){return this.get(this.length-1)}get(e){return this.segments[this.offset+e]}isEmpty(){return this.length===0}isPrefixOf(e){if(e.length<this.length)return!1;for(let t=0;t<this.length;t++)if(this.get(t)!==e.get(t))return!1;return!0}isImmediateParentOf(e){if(this.length+1!==e.length)return!1;for(let t=0;t<this.length;t++)if(this.get(t)!==e.get(t))return!1;return!0}forEach(e){for(let t=this.offset,s=this.limit();t<s;t++)e(this.segments[t])}toArray(){return this.segments.slice(this.offset,this.limit())}static comparator(e,t){const s=Math.min(e.length,t.length);for(let r=0;r<s;r++){const c=ue.compareSegments(e.get(r),t.get(r));if(c!==0)return c}return $e(e.length,t.length)}static compareSegments(e,t){const s=ue.isNumericId(e),r=ue.isNumericId(t);return s&&!r?-1:!s&&r?1:s&&r?ue.extractNumericId(e).compare(ue.extractNumericId(t)):od(e,t)}static isNumericId(e){return e.startsWith("__id")&&e.endsWith("__")}static extractNumericId(e){return Qi.fromString(e.substring(4,e.length-2))}}class re extends ue{construct(e,t,s){return new re(e,t,s)}canonicalString(){return this.toArray().join("/")}toString(){return this.canonicalString()}toUriEncodedString(){return this.toArray().map(encodeURIComponent).join("/")}static fromString(...e){const t=[];for(const s of e){if(s.indexOf("//")>=0)throw new L(D.INVALID_ARGUMENT,`Invalid segment (${s}). Paths must not contain // in them.`);t.push(...s.split("/").filter((r=>r.length>0)))}return new re(t)}static emptyPath(){return new re([])}}const hd=/^[_a-zA-Z][_a-zA-Z0-9]*$/;class Ye extends ue{construct(e,t,s){return new Ye(e,t,s)}static isValidIdentifier(e){return hd.test(e)}canonicalString(){return this.toArray().map((e=>(e=e.replace(/\\/g,"\\\\").replace(/`/g,"\\`"),Ye.isValidIdentifier(e)||(e="`"+e+"`"),e))).join(".")}toString(){return this.canonicalString()}isKeyField(){return this.length===1&&this.get(0)===Vr}static keyField(){return new Ye([Vr])}static fromServerFormat(e){const t=[];let s="",r=0;const c=()=>{if(s.length===0)throw new L(D.INVALID_ARGUMENT,`Invalid field path (${e}). Paths must not be empty, begin with '.', end with '.', or contain '..'`);t.push(s),s=""};let h=!1;for(;r<e.length;){const g=e[r];if(g==="\\"){if(r+1===e.length)throw new L(D.INVALID_ARGUMENT,"Path has trailing escape character: "+e);const w=e[r+1];if(w!=="\\"&&w!=="."&&w!=="`")throw new L(D.INVALID_ARGUMENT,"Path has invalid escape sequence: "+e);s+=w,r+=2}else g==="`"?(h=!h,r++):g!=="."||h?(s+=g,r++):(c(),r++)}if(c(),h)throw new L(D.INVALID_ARGUMENT,"Unterminated ` in path: "+e);return new Ye(t)}static emptyPath(){return new Ye([])}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Qe{constructor(e){this.path=e}static fromPath(e){return new Qe(re.fromString(e))}static fromName(e){return new Qe(re.fromString(e).popFirst(5))}static empty(){return new Qe(re.emptyPath())}get collectionGroup(){return this.path.popLast().lastSegment()}hasCollectionId(e){return this.path.length>=2&&this.path.get(this.path.length-2)===e}getCollectionGroup(){return this.path.get(this.path.length-2)}getCollectionPath(){return this.path.popLast()}isEqual(e){return e!==null&&re.comparator(this.path,e.path)===0}toString(){return this.path.toString()}static comparator(e,t){return re.comparator(e.path,t.path)}static isDocumentKey(e){return e.length%2==0}static fromSegments(e){return new Qe(new re(e.slice()))}}function ld(n,e,t,s){if(e===!0&&s===!0)throw new L(D.INVALID_ARGUMENT,`${n} and ${t} cannot be used together.`)}function ud(n){return typeof n=="object"&&n!==null&&(Object.getPrototypeOf(n)===Object.prototype||Object.getPrototypeOf(n)===null)}function dd(n){if(n===void 0)return"undefined";if(n===null)return"null";if(typeof n=="string")return n.length>20&&(n=`${n.substring(0,20)}...`),JSON.stringify(n);if(typeof n=="number"||typeof n=="boolean")return""+n;if(typeof n=="object"){if(n instanceof Array)return"an array";{const e=(function(s){return s.constructor?s.constructor.name:null})(n);return e?`a custom ${e} object`:"an object"}}return typeof n=="function"?"a function":Yt(12329,{type:typeof n})}function fd(n,e){if("_delegate"in n&&(n=n._delegate),!(n instanceof e)){if(e.name===n.constructor.name)throw new L(D.INVALID_ARGUMENT,"Type does not match the expected instance. Did you pass a reference from a different Firestore SDK?");{const t=dd(n);throw new L(D.INVALID_ARGUMENT,`Expected type '${e.name}', but it was: ${t}`)}}return n}/**
 * @license
 * Copyright 2025 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function $(n,e){const t={typeString:n};return e&&(t.value=e),t}function on(n,e){if(!ud(n))throw new L(D.INVALID_ARGUMENT,"JSON must be an object");let t;for(const s in e)if(e[s]){const r=e[s].typeString,c="value"in e[s]?{value:e[s].value}:void 0;if(!(s in n)){t=`JSON missing required field: '${s}'`;break}const h=n[s];if(r&&typeof h!==r){t=`JSON field '${s}' must be a ${r}.`;break}if(c!==void 0&&h!==c.value){t=`Expected '${s}' field to equal '${c.value}'`;break}}if(t)throw new L(D.INVALID_ARGUMENT,t);return!0}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const jr=-62135596800,Br=1e6;class de{static now(){return de.fromMillis(Date.now())}static fromDate(e){return de.fromMillis(e.getTime())}static fromMillis(e){const t=Math.floor(e/1e3),s=Math.floor((e-1e3*t)*Br);return new de(t,s)}constructor(e,t){if(this.seconds=e,this.nanoseconds=t,t<0)throw new L(D.INVALID_ARGUMENT,"Timestamp nanoseconds out of range: "+t);if(t>=1e9)throw new L(D.INVALID_ARGUMENT,"Timestamp nanoseconds out of range: "+t);if(e<jr)throw new L(D.INVALID_ARGUMENT,"Timestamp seconds out of range: "+e);if(e>=253402300800)throw new L(D.INVALID_ARGUMENT,"Timestamp seconds out of range: "+e)}toDate(){return new Date(this.toMillis())}toMillis(){return 1e3*this.seconds+this.nanoseconds/Br}_compareTo(e){return this.seconds===e.seconds?$e(this.nanoseconds,e.nanoseconds):$e(this.seconds,e.seconds)}isEqual(e){return e.seconds===this.seconds&&e.nanoseconds===this.nanoseconds}toString(){return"Timestamp(seconds="+this.seconds+", nanoseconds="+this.nanoseconds+")"}toJSON(){return{type:de._jsonSchemaVersion,seconds:this.seconds,nanoseconds:this.nanoseconds}}static fromJSON(e){if(on(e,de._jsonSchema))return new de(e.seconds,e.nanoseconds)}valueOf(){const e=this.seconds-jr;return String(e).padStart(12,"0")+"."+String(this.nanoseconds).padStart(9,"0")}}de._jsonSchemaVersion="firestore/timestamp/1.0",de._jsonSchema={type:$("string",de._jsonSchemaVersion),seconds:$("number"),nanoseconds:$("number")};function pd(n){return n.name==="IndexedDbTransactionError"}/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class gd extends Error{constructor(){super(...arguments),this.name="Base64DecodeError"}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ot{constructor(e){this.binaryString=e}static fromBase64String(e){const t=(function(r){try{return atob(r)}catch(c){throw typeof DOMException<"u"&&c instanceof DOMException?new gd("Invalid base64 string: "+c):c}})(e);return new ot(t)}static fromUint8Array(e){const t=(function(r){let c="";for(let h=0;h<r.length;++h)c+=String.fromCharCode(r[h]);return c})(e);return new ot(t)}[Symbol.iterator](){let e=0;return{next:()=>e<this.binaryString.length?{value:this.binaryString.charCodeAt(e++),done:!1}:{value:void 0,done:!0}}}toBase64(){return(function(t){return btoa(t)})(this.binaryString)}toUint8Array(){return(function(t){const s=new Uint8Array(t.length);for(let r=0;r<t.length;r++)s[r]=t.charCodeAt(r);return s})(this.binaryString)}approximateByteSize(){return 2*this.binaryString.length}compareTo(e){return $e(this.binaryString,e.binaryString)}isEqual(e){return this.binaryString===e.binaryString}}ot.EMPTY_BYTE_STRING=new ot("");const xi="(default)";class xn{constructor(e,t){this.projectId=e,this.database=t||xi}static empty(){return new xn("","")}get isDefaultDatabase(){return this.database===xi}isEqual(e){return e instanceof xn&&e.projectId===this.projectId&&e.database===this.database}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class md{constructor(e,t=null,s=[],r=[],c=null,h="F",g=null,w=null){this.path=e,this.collectionGroup=t,this.explicitOrderBy=s,this.filters=r,this.limit=c,this.limitType=h,this.startAt=g,this.endAt=w,this.Ie=null,this.Ee=null,this.de=null,this.startAt,this.endAt}}function _d(n){return new md(n)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */var $r,N;(N=$r||($r={}))[N.OK=0]="OK",N[N.CANCELLED=1]="CANCELLED",N[N.UNKNOWN=2]="UNKNOWN",N[N.INVALID_ARGUMENT=3]="INVALID_ARGUMENT",N[N.DEADLINE_EXCEEDED=4]="DEADLINE_EXCEEDED",N[N.NOT_FOUND=5]="NOT_FOUND",N[N.ALREADY_EXISTS=6]="ALREADY_EXISTS",N[N.PERMISSION_DENIED=7]="PERMISSION_DENIED",N[N.UNAUTHENTICATED=16]="UNAUTHENTICATED",N[N.RESOURCE_EXHAUSTED=8]="RESOURCE_EXHAUSTED",N[N.FAILED_PRECONDITION=9]="FAILED_PRECONDITION",N[N.ABORTED=10]="ABORTED",N[N.OUT_OF_RANGE=11]="OUT_OF_RANGE",N[N.UNIMPLEMENTED=12]="UNIMPLEMENTED",N[N.INTERNAL=13]="INTERNAL",N[N.UNAVAILABLE=14]="UNAVAILABLE",N[N.DATA_LOSS=15]="DATA_LOSS";/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */new Qi([4294967295,4294967295],0);/**
 * @license
 * Copyright 2018 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const yd=41943040;/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Ed=1048576;function Ri(){return typeof document<"u"?document:null}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class wd{constructor(e,t,s=1e3,r=1.5,c=6e4){this.Mi=e,this.timerId=t,this.d_=s,this.A_=r,this.R_=c,this.V_=0,this.m_=null,this.f_=Date.now(),this.reset()}reset(){this.V_=0}g_(){this.V_=this.R_}p_(e){this.cancel();const t=Math.floor(this.V_+this.y_()),s=Math.max(0,Date.now()-this.f_),r=Math.max(0,t-s);r>0&&ae("ExponentialBackoff",`Backing off for ${r} ms (base delay: ${this.V_} ms, delay with jitter: ${t} ms, last attempt: ${s} ms ago)`),this.m_=this.Mi.enqueueAfterDelay(this.timerId,r,(()=>(this.f_=Date.now(),e()))),this.V_*=this.A_,this.V_<this.d_&&(this.V_=this.d_),this.V_>this.R_&&(this.V_=this.R_)}w_(){this.m_!==null&&(this.m_.skipDelay(),this.m_=null)}cancel(){this.m_!==null&&(this.m_.cancel(),this.m_=null)}y_(){return(Math.random()-.5)*this.V_}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class es{constructor(e,t,s,r,c){this.asyncQueue=e,this.timerId=t,this.targetTimeMs=s,this.op=r,this.removalCallback=c,this.deferred=new Gt,this.then=this.deferred.promise.then.bind(this.deferred.promise),this.deferred.promise.catch((h=>{}))}get promise(){return this.deferred.promise}static createAndSchedule(e,t,s,r,c){const h=Date.now()+s,g=new es(e,t,h,r,c);return g.start(s),g}start(e){this.timerHandle=setTimeout((()=>this.handleDelayElapsed()),e)}skipDelay(){return this.handleDelayElapsed()}cancel(e){this.timerHandle!==null&&(this.clearTimeout(),this.deferred.reject(new L(D.CANCELLED,"Operation cancelled"+(e?": "+e:""))))}handleDelayElapsed(){this.asyncQueue.enqueueAndForget((()=>this.timerHandle!==null?(this.clearTimeout(),this.op().then((e=>this.deferred.resolve(e)))):Promise.resolve()))}clearTimeout(){this.timerHandle!==null&&(this.removalCallback(this),clearTimeout(this.timerHandle),this.timerHandle=null)}}var Hr,Gr;(Gr=Hr||(Hr={})).Ma="default",Gr.Cache="cache";/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Id(n){const e={};return n.timeoutSeconds!==void 0&&(e.timeoutSeconds=n.timeoutSeconds),e}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Wr=new Map;/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const ia="firestore.googleapis.com",qr=!0;class zr{constructor(e){if(e.host===void 0){if(e.ssl!==void 0)throw new L(D.INVALID_ARGUMENT,"Can't provide ssl option if host option is not set");this.host=ia,this.ssl=qr}else this.host=e.host,this.ssl=e.ssl??qr;if(this.isUsingEmulator=e.emulatorOptions!==void 0,this.credentials=e.credentials,this.ignoreUndefinedProperties=!!e.ignoreUndefinedProperties,this.localCache=e.localCache,e.cacheSizeBytes===void 0)this.cacheSizeBytes=yd;else{if(e.cacheSizeBytes!==-1&&e.cacheSizeBytes<Ed)throw new L(D.INVALID_ARGUMENT,"cacheSizeBytes must be at least 1048576");this.cacheSizeBytes=e.cacheSizeBytes}ld("experimentalForceLongPolling",e.experimentalForceLongPolling,"experimentalAutoDetectLongPolling",e.experimentalAutoDetectLongPolling),this.experimentalForceLongPolling=!!e.experimentalForceLongPolling,this.experimentalForceLongPolling?this.experimentalAutoDetectLongPolling=!1:e.experimentalAutoDetectLongPolling===void 0?this.experimentalAutoDetectLongPolling=!0:this.experimentalAutoDetectLongPolling=!!e.experimentalAutoDetectLongPolling,this.experimentalLongPollingOptions=Id(e.experimentalLongPollingOptions??{}),(function(s){if(s.timeoutSeconds!==void 0){if(isNaN(s.timeoutSeconds))throw new L(D.INVALID_ARGUMENT,`invalid long polling timeout: ${s.timeoutSeconds} (must not be NaN)`);if(s.timeoutSeconds<5)throw new L(D.INVALID_ARGUMENT,`invalid long polling timeout: ${s.timeoutSeconds} (minimum allowed value is 5)`);if(s.timeoutSeconds>30)throw new L(D.INVALID_ARGUMENT,`invalid long polling timeout: ${s.timeoutSeconds} (maximum allowed value is 30)`)}})(this.experimentalLongPollingOptions),this.useFetchStreams=!!e.useFetchStreams}isEqual(e){return this.host===e.host&&this.ssl===e.ssl&&this.credentials===e.credentials&&this.cacheSizeBytes===e.cacheSizeBytes&&this.experimentalForceLongPolling===e.experimentalForceLongPolling&&this.experimentalAutoDetectLongPolling===e.experimentalAutoDetectLongPolling&&(function(s,r){return s.timeoutSeconds===r.timeoutSeconds})(this.experimentalLongPollingOptions,e.experimentalLongPollingOptions)&&this.ignoreUndefinedProperties===e.ignoreUndefinedProperties&&this.useFetchStreams===e.useFetchStreams}}class sa{constructor(e,t,s,r){this._authCredentials=e,this._appCheckCredentials=t,this._databaseId=s,this._app=r,this.type="firestore-lite",this._persistenceKey="(lite)",this._settings=new zr({}),this._settingsFrozen=!1,this._emulatorOptions={},this._terminateTask="notTerminated"}get app(){if(!this._app)throw new L(D.FAILED_PRECONDITION,"Firestore was not initialized using the Firebase SDK. 'app' is not available");return this._app}get _initialized(){return this._settingsFrozen}get _terminated(){return this._terminateTask!=="notTerminated"}_setSettings(e){if(this._settingsFrozen)throw new L(D.FAILED_PRECONDITION,"Firestore has already been started and its settings can no longer be changed. You can only modify settings before calling any other methods on a Firestore object.");this._settings=new zr(e),this._emulatorOptions=e.emulatorOptions||{},e.credentials!==void 0&&(this._authCredentials=(function(s){if(!s)return new Qu;switch(s.type){case"firstParty":return new nd(s.sessionIndex||"0",s.iamToken||null,s.authTokenFactory||null);case"provider":return s.client;default:throw new L(D.INVALID_ARGUMENT,"makeAuthCredentialsProvider failed due to invalid credential type")}})(e.credentials))}_getSettings(){return this._settings}_getEmulatorOptions(){return this._emulatorOptions}_freezeSettings(){return this._settingsFrozen=!0,this._settings}_delete(){return this._terminateTask==="notTerminated"&&(this._terminateTask=this._terminate()),this._terminateTask}async _restart(){this._terminateTask==="notTerminated"?await this._terminate():this._terminateTask="notTerminated"}toJSON(){return{app:this._app,databaseId:this._databaseId,settings:this._settings}}_terminate(){return(function(t){const s=Wr.get(t);s&&(ae("ComponentProvider","Removing Datastore"),Wr.delete(t),s.terminate())})(this),Promise.resolve()}}function vd(n,e,t,s={}){n=fd(n,sa);const r=Qt(e),c=n._getSettings(),h={...c,emulatorOptions:n._getEmulatorOptions()},g=`${e}:${t}`;r&&(go(`https://${g}`),mo("Firestore",!0)),c.host!==ia&&c.host!==g&&Xu("Host has been set in both settings() and connectFirestoreEmulator(), emulator host will be used.");const w={...c,host:g,ssl:r,emulatorOptions:s};if(!it(w,h)&&(n._setSettings(w),s.mockUserToken)){let v,A;if(typeof s.mockUserToken=="string")v=s.mockUserToken,A=K.MOCK_USER;else{v=lc(s.mockUserToken,n._app?.options.projectId);const b=s.mockUserToken.sub||s.mockUserToken.user_id;if(!b)throw new L(D.INVALID_ARGUMENT,"mockUserToken must contain 'sub' or 'user_id' field!");A=new K(b)}n._authCredentials=new Zu(new na(v,A))}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ts{constructor(e,t,s){this.converter=t,this._query=s,this.type="query",this.firestore=e}withConverter(e){return new ts(this.firestore,e,this._query)}}class fe{constructor(e,t,s){this.converter=t,this._key=s,this.type="document",this.firestore=e}get _path(){return this._key.path}get id(){return this._key.path.lastSegment()}get path(){return this._key.path.canonicalString()}get parent(){return new ns(this.firestore,this.converter,this._key.path.popLast())}withConverter(e){return new fe(this.firestore,e,this._key)}toJSON(){return{type:fe._jsonSchemaVersion,referencePath:this._key.toString()}}static fromJSON(e,t,s){if(on(t,fe._jsonSchema))return new fe(e,s||null,new Qe(re.fromString(t.referencePath)))}}fe._jsonSchemaVersion="firestore/documentReference/1.0",fe._jsonSchema={type:$("string",fe._jsonSchemaVersion),referencePath:$("string")};class ns extends ts{constructor(e,t,s){super(e,t,_d(s)),this._path=s,this.type="collection"}get id(){return this._query.path.lastSegment()}get path(){return this._query.path.canonicalString()}get parent(){const e=this._path.popLast();return e.isEmpty()?null:new fe(this.firestore,null,new Qe(e))}withConverter(e){return new ns(this.firestore,e,this._path)}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Kr="AsyncQueue";class Jr{constructor(e=Promise.resolve()){this.Xu=[],this.ec=!1,this.tc=[],this.nc=null,this.rc=!1,this.sc=!1,this.oc=[],this.M_=new wd(this,"async_queue_retry"),this._c=()=>{const s=Ri();s&&ae(Kr,"Visibility state changed to "+s.visibilityState),this.M_.w_()},this.ac=e;const t=Ri();t&&typeof t.addEventListener=="function"&&t.addEventListener("visibilitychange",this._c)}get isShuttingDown(){return this.ec}enqueueAndForget(e){this.enqueue(e)}enqueueAndForgetEvenWhileRestricted(e){this.uc(),this.cc(e)}enterRestrictedMode(e){if(!this.ec){this.ec=!0,this.sc=e||!1;const t=Ri();t&&typeof t.removeEventListener=="function"&&t.removeEventListener("visibilitychange",this._c)}}enqueue(e){if(this.uc(),this.ec)return new Promise((()=>{}));const t=new Gt;return this.cc((()=>this.ec&&this.sc?Promise.resolve():(e().then(t.resolve,t.reject),t.promise))).then((()=>t.promise))}enqueueRetryable(e){this.enqueueAndForget((()=>(this.Xu.push(e),this.lc())))}async lc(){if(this.Xu.length!==0){try{await this.Xu[0](),this.Xu.shift(),this.M_.reset()}catch(e){if(!pd(e))throw e;ae(Kr,"Operation failed with retryable error: "+e)}this.Xu.length>0&&this.M_.p_((()=>this.lc()))}}cc(e){const t=this.ac.then((()=>(this.rc=!0,e().catch((s=>{throw this.nc=s,this.rc=!1,ea("INTERNAL UNHANDLED ERROR: ",Yr(s)),s})).then((s=>(this.rc=!1,s))))));return this.ac=t,t}enqueueAfterDelay(e,t,s){this.uc(),this.oc.indexOf(e)>-1&&(t=0);const r=es.createAndSchedule(this,e,t,s,(c=>this.hc(c)));return this.tc.push(r),r}uc(){this.nc&&Yt(47125,{Pc:Yr(this.nc)})}verifyOperationInProgress(){}async Tc(){let e;do e=this.ac,await e;while(e!==this.ac)}Ic(e){for(const t of this.tc)if(t.timerId===e)return!0;return!1}Ec(e){return this.Tc().then((()=>{this.tc.sort(((t,s)=>t.targetTimeMs-s.targetTimeMs));for(const t of this.tc)if(t.skipDelay(),e!=="all"&&t.timerId===e)break;return this.Tc()}))}dc(e){this.oc.push(e)}hc(e){const t=this.tc.indexOf(e);this.tc.splice(t,1)}}function Yr(n){let e=n.message||"";return n.stack&&(e=n.stack.includes(n.message)?n.stack:n.message+`
`+n.stack),e}class Td extends sa{constructor(e,t,s,r){super(e,t,s,r),this.type="firestore",this._queue=new Jr,this._persistenceKey=r?.name||"[DEFAULT]"}async _terminate(){if(this._firestoreClient){const e=this._firestoreClient.terminate();this._queue=new Jr(e),this._firestoreClient=void 0,await e}}}function Sd(n,e){const t=typeof n=="object"?n:Hi(),s=typeof n=="string"?n:xi,r=jn(t,"firestore").getImmediate({identifier:s});if(!r._initialized){const c=cc("firestore");c&&vd(r,...c)}return r}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ee{constructor(e){this._byteString=e}static fromBase64String(e){try{return new Ee(ot.fromBase64String(e))}catch(t){throw new L(D.INVALID_ARGUMENT,"Failed to construct data from Base64 string: "+t)}}static fromUint8Array(e){return new Ee(ot.fromUint8Array(e))}toBase64(){return this._byteString.toBase64()}toUint8Array(){return this._byteString.toUint8Array()}toString(){return"Bytes(base64: "+this.toBase64()+")"}isEqual(e){return this._byteString.isEqual(e._byteString)}toJSON(){return{type:Ee._jsonSchemaVersion,bytes:this.toBase64()}}static fromJSON(e){if(on(e,Ee._jsonSchema))return Ee.fromBase64String(e.bytes)}}Ee._jsonSchemaVersion="firestore/bytes/1.0",Ee._jsonSchema={type:$("string",Ee._jsonSchemaVersion),bytes:$("string")};/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ra{constructor(...e){for(let t=0;t<e.length;++t)if(e[t].length===0)throw new L(D.INVALID_ARGUMENT,"Invalid field name at argument $(i + 1). Field names must not be empty.");this._internalPath=new Ye(e)}isEqual(e){return this._internalPath.isEqual(e._internalPath)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class tt{constructor(e,t){if(!isFinite(e)||e<-90||e>90)throw new L(D.INVALID_ARGUMENT,"Latitude must be a number between -90 and 90, but was: "+e);if(!isFinite(t)||t<-180||t>180)throw new L(D.INVALID_ARGUMENT,"Longitude must be a number between -180 and 180, but was: "+t);this._lat=e,this._long=t}get latitude(){return this._lat}get longitude(){return this._long}isEqual(e){return this._lat===e._lat&&this._long===e._long}_compareTo(e){return $e(this._lat,e._lat)||$e(this._long,e._long)}toJSON(){return{latitude:this._lat,longitude:this._long,type:tt._jsonSchemaVersion}}static fromJSON(e){if(on(e,tt._jsonSchema))return new tt(e.latitude,e.longitude)}}tt._jsonSchemaVersion="firestore/geoPoint/1.0",tt._jsonSchema={type:$("string",tt._jsonSchemaVersion),latitude:$("number"),longitude:$("number")};/**
 * @license
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class nt{constructor(e){this._values=(e||[]).map((t=>t))}toArray(){return this._values.map((e=>e))}isEqual(e){return(function(s,r){if(s.length!==r.length)return!1;for(let c=0;c<s.length;++c)if(s[c]!==r[c])return!1;return!0})(this._values,e._values)}toJSON(){return{type:nt._jsonSchemaVersion,vectorValues:this._values}}static fromJSON(e){if(on(e,nt._jsonSchema)){if(Array.isArray(e.vectorValues)&&e.vectorValues.every((t=>typeof t=="number")))return new nt(e.vectorValues);throw new L(D.INVALID_ARGUMENT,"Expected 'vectorValues' field to be a number array")}}}nt._jsonSchemaVersion="firestore/vectorValue/1.0",nt._jsonSchema={type:$("string",nt._jsonSchemaVersion),vectorValues:$("object")};const Ad=new RegExp("[~\\*/\\[\\]]");function bd(n,e,t){if(e.search(Ad)>=0)throw Xr(`Invalid field path (${e}). Paths must not contain '~', '*', '/', '[', or ']'`,n);try{return new ra(...e.split("."))._internalPath}catch{throw Xr(`Invalid field path (${e}). Paths must not be empty, begin with '.', end with '.', or contain '..'`,n)}}function Xr(n,e,t,s,r){let c=`Function ${e}() called with invalid data`;c+=". ";let h="";return new L(D.INVALID_ARGUMENT,c+n+h)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class oa{constructor(e,t,s,r,c){this._firestore=e,this._userDataWriter=t,this._key=s,this._document=r,this._converter=c}get id(){return this._key.path.lastSegment()}get ref(){return new fe(this._firestore,this._converter,this._key)}exists(){return this._document!==null}data(){if(this._document){if(this._converter){const e=new Rd(this._firestore,this._userDataWriter,this._key,this._document,null);return this._converter.fromFirestore(e)}return this._userDataWriter.convertValue(this._document.data.value)}}get(e){if(this._document){const t=this._document.data.field(aa("DocumentSnapshot.get",e));if(t!==null)return this._userDataWriter.convertValue(t)}}}class Rd extends oa{data(){return super.data()}}function aa(n,e){return typeof e=="string"?bd(n,e):e instanceof ra?e._internalPath:e._delegate._internalPath}class vn{constructor(e,t){this.hasPendingWrites=e,this.fromCache=t}isEqual(e){return this.hasPendingWrites===e.hasPendingWrites&&this.fromCache===e.fromCache}}class mt extends oa{constructor(e,t,s,r,c,h){super(e,t,s,r,h),this._firestore=e,this._firestoreImpl=e,this.metadata=c}exists(){return super.exists()}data(e={}){if(this._document){if(this._converter){const t=new Cn(this._firestore,this._userDataWriter,this._key,this._document,this.metadata,null);return this._converter.fromFirestore(t,e)}return this._userDataWriter.convertValue(this._document.data.value,e.serverTimestamps)}}get(e,t={}){if(this._document){const s=this._document.data.field(aa("DocumentSnapshot.get",e));if(s!==null)return this._userDataWriter.convertValue(s,t.serverTimestamps)}}toJSON(){if(this.metadata.hasPendingWrites)throw new L(D.FAILED_PRECONDITION,"DocumentSnapshot.toJSON() attempted to serialize a document with pending writes. Await waitForPendingWrites() before invoking toJSON().");const e=this._document,t={};return t.type=mt._jsonSchemaVersion,t.bundle="",t.bundleSource="DocumentSnapshot",t.bundleName=this._key.toString(),!e||!e.isValidDocument()||!e.isFoundDocument()?t:(this._userDataWriter.convertObjectMap(e.data.value.mapValue.fields,"previous"),t.bundle=(this._firestore,this.ref.path,"NOT SUPPORTED"),t)}}mt._jsonSchemaVersion="firestore/documentSnapshot/1.0",mt._jsonSchema={type:$("string",mt._jsonSchemaVersion),bundleSource:$("string","DocumentSnapshot"),bundleName:$("string"),bundle:$("string")};class Cn extends mt{data(e={}){return super.data(e)}}class Wt{constructor(e,t,s,r){this._firestore=e,this._userDataWriter=t,this._snapshot=r,this.metadata=new vn(r.hasPendingWrites,r.fromCache),this.query=s}get docs(){const e=[];return this.forEach((t=>e.push(t))),e}get size(){return this._snapshot.docs.size}get empty(){return this.size===0}forEach(e,t){this._snapshot.docs.forEach((s=>{e.call(t,new Cn(this._firestore,this._userDataWriter,s.key,s,new vn(this._snapshot.mutatedKeys.has(s.key),this._snapshot.fromCache),this.query.converter))}))}docChanges(e={}){const t=!!e.includeMetadataChanges;if(t&&this._snapshot.excludesMetadataChanges)throw new L(D.INVALID_ARGUMENT,"To include metadata changes with your document changes, you must also pass { includeMetadataChanges:true } to onSnapshot().");return this._cachedChanges&&this._cachedChangesIncludeMetadataChanges===t||(this._cachedChanges=(function(r,c){if(r._snapshot.oldDocs.isEmpty()){let h=0;return r._snapshot.docChanges.map((g=>{const w=new Cn(r._firestore,r._userDataWriter,g.doc.key,g.doc,new vn(r._snapshot.mutatedKeys.has(g.doc.key),r._snapshot.fromCache),r.query.converter);return g.doc,{type:"added",doc:w,oldIndex:-1,newIndex:h++}}))}{let h=r._snapshot.oldDocs;return r._snapshot.docChanges.filter((g=>c||g.type!==3)).map((g=>{const w=new Cn(r._firestore,r._userDataWriter,g.doc.key,g.doc,new vn(r._snapshot.mutatedKeys.has(g.doc.key),r._snapshot.fromCache),r.query.converter);let v=-1,A=-1;return g.type!==0&&(v=h.indexOf(g.doc.key),h=h.delete(g.doc.key)),g.type!==1&&(h=h.add(g.doc),A=h.indexOf(g.doc.key)),{type:Cd(g.type),doc:w,oldIndex:v,newIndex:A}}))}})(this,t),this._cachedChangesIncludeMetadataChanges=t),this._cachedChanges}toJSON(){if(this.metadata.hasPendingWrites)throw new L(D.FAILED_PRECONDITION,"QuerySnapshot.toJSON() attempted to serialize a document with pending writes. Await waitForPendingWrites() before invoking toJSON().");const e={};e.type=Wt._jsonSchemaVersion,e.bundleSource="QuerySnapshot",e.bundleName=rd.newId(),this._firestore._databaseId.database,this._firestore._databaseId.projectId;const t=[],s=[],r=[];return this.docs.forEach((c=>{c._document!==null&&(t.push(c._document),s.push(this._userDataWriter.convertObjectMap(c._document.data.value.mapValue.fields,"previous")),r.push(c.ref.path))})),e.bundle=(this._firestore,this.query._query,e.bundleName,"NOT SUPPORTED"),e}}function Cd(n){switch(n){case 0:return"added";case 2:case 3:return"modified";case 1:return"removed";default:return Yt(61501,{type:n})}}Wt._jsonSchemaVersion="firestore/querySnapshot/1.0",Wt._jsonSchema={type:$("string",Wt._jsonSchemaVersion),bundleSource:$("string","QuerySnapshot"),bundleName:$("string"),bundle:$("string")};(function(e,t=!0){(function(r){rn=r})(wt),st(new Be("firestore",((s,{instanceIdentifier:r,options:c})=>{const h=s.getProvider("app").getImmediate(),g=new Td(new ed(s.getProvider("auth-internal")),new id(h,s.getProvider("app-check-internal")),(function(v,A){if(!Object.prototype.hasOwnProperty.apply(v.options,["projectId"]))throw new L(D.INVALID_ARGUMENT,'"projectId" not provided in firebase.initializeApp.');return new xn(v.options.projectId,A)})(h,r),h);return c={useFetchStreams:t,...c},g._setSettings(c),g}),"PUBLIC").setMultipleInstances(!0)),pe(Ur,xr,e),pe(Ur,xr,"esm2020")})();var Qr="@firebase/ai",Fi="2.4.0";/**
 * @license
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Et="AI",Zr="us-central1",Pd="firebasevertexai.googleapis.com",kd="v1beta",eo=Fi,Od="gl-js",Nd=180*1e3,Dd="gemini-2.0-flash-lite";/**
 * @license
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class P extends _e{constructor(e,t,s){const r=Et,c=`${r}/${e}`,h=`${r}: ${t} (${c})`;super(e,h),this.code=e,this.customErrorData=s,Error.captureStackTrace&&Error.captureStackTrace(this,P),Object.setPrototypeOf(this,P.prototype),this.toString=()=>h}}/**
 * @license
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const to=["user","model","function","system"],ca={HARM_SEVERITY_UNSUPPORTED:"HARM_SEVERITY_UNSUPPORTED"},no={SAFETY:"SAFETY",RECITATION:"RECITATION"},Ze={PREFER_ON_DEVICE:"prefer_on_device",ONLY_ON_DEVICE:"only_on_device",ONLY_IN_CLOUD:"only_in_cloud",PREFER_IN_CLOUD:"prefer_in_cloud"};/**
 * @license
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const C={ERROR:"error",REQUEST_ERROR:"request-error",RESPONSE_ERROR:"response-error",FETCH_ERROR:"fetch-error",SESSION_CLOSED:"session-closed",INVALID_CONTENT:"invalid-content",API_NOT_ENABLED:"api-not-enabled",INVALID_SCHEMA:"invalid-schema",NO_API_KEY:"no-api-key",NO_APP_ID:"no-app-id",NO_MODEL:"no-model",NO_PROJECT_ID:"no-project-id",PARSE_FAILED:"parse-failed",UNSUPPORTED:"unsupported"};/**
 * @license
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Se={VERTEX_AI:"VERTEX_AI",GOOGLE_AI:"GOOGLE_AI"};/**
 * @license
 * Copyright 2025 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ha{constructor(e){this.backendType=e}}class an extends ha{constructor(){super(Se.GOOGLE_AI)}}class Wn extends ha{constructor(e=Zr){super(Se.VERTEX_AI),e?this.location=e:this.location=Zr}}/**
 * @license
 * Copyright 2025 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Ld(n){if(n instanceof an)return`${Et}/googleai`;if(n instanceof Wn)return`${Et}/vertexai/${n.location}`;throw new P(C.ERROR,`Invalid backend: ${JSON.stringify(n.backendType)}`)}function Md(n){const e=n.split("/");if(e[0]!==Et)throw new P(C.ERROR,`Invalid instance identifier, unknown prefix '${e[0]}'`);switch(e[1]){case"vertexai":const s=e[2];if(!s)throw new P(C.ERROR,`Invalid instance identifier, unknown location '${n}'`);return new Wn(s);case"googleai":return new an;default:throw new P(C.ERROR,`Invalid instance identifier string: '${n}'`)}}/**
 * @license
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const X=new Vn("@firebase/vertexai");var Xe;(function(n){n.UNAVAILABLE="unavailable",n.DOWNLOADABLE="downloadable",n.DOWNLOADING="downloading",n.AVAILABLE="available"})(Xe||(Xe={}));/**
 * @license
 * Copyright 2025 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class se{constructor(e,t,s={createOptions:{expectedInputs:[{type:"image"}]}}){this.languageModelProvider=e,this.mode=t,this.onDeviceParams=s,this.isDownloading=!1}async isAvailable(e){if(!this.mode)return X.debug("On-device inference unavailable because mode is undefined."),!1;if(this.mode===Ze.ONLY_IN_CLOUD)return X.debug('On-device inference unavailable because mode is "only_in_cloud".'),!1;const t=await this.downloadIfAvailable();if(this.mode===Ze.ONLY_ON_DEVICE){if(t===Xe.UNAVAILABLE)throw new P(C.API_NOT_ENABLED,"Local LanguageModel API not available in this environment.");return(t===Xe.DOWNLOADABLE||t===Xe.DOWNLOADING)&&(X.debug("Waiting for download of LanguageModel to complete."),await this.downloadPromise),!0}return t!==Xe.AVAILABLE?(X.debug(`On-device inference unavailable because availability is "${t}".`),!1):se.isOnDeviceRequest(e)?!0:(X.debug("On-device inference unavailable because request is incompatible."),!1)}async generateContent(e){const t=await this.createSession(),s=await Promise.all(e.contents.map(se.toLanguageModelMessage)),r=await t.prompt(s,this.onDeviceParams.promptOptions);return se.toResponse(r)}async generateContentStream(e){const t=await this.createSession(),s=await Promise.all(e.contents.map(se.toLanguageModelMessage)),r=t.promptStreaming(s,this.onDeviceParams.promptOptions);return se.toStreamResponse(r)}async countTokens(e){throw new P(C.REQUEST_ERROR,"Count Tokens is not yet available for on-device model.")}static isOnDeviceRequest(e){if(e.contents.length===0)return X.debug("Empty prompt rejected for on-device inference."),!1;for(const t of e.contents){if(t.role==="function")return X.debug('"Function" role rejected for on-device inference.'),!1;for(const s of t.parts)if(s.inlineData&&se.SUPPORTED_MIME_TYPES.indexOf(s.inlineData.mimeType)===-1)return X.debug(`Unsupported mime type "${s.inlineData.mimeType}" rejected for on-device inference.`),!1}return!0}async downloadIfAvailable(){const e=await this.languageModelProvider?.availability(this.onDeviceParams.createOptions);return e===Xe.DOWNLOADABLE&&this.download(),e}download(){this.isDownloading||(this.isDownloading=!0,this.downloadPromise=this.languageModelProvider?.create(this.onDeviceParams.createOptions).finally(()=>{this.isDownloading=!1}))}static async toLanguageModelMessage(e){const t=await Promise.all(e.parts.map(se.toLanguageModelMessageContent));return{role:se.toLanguageModelMessageRole(e.role),content:t}}static async toLanguageModelMessageContent(e){if(e.text)return{type:"text",value:e.text};if(e.inlineData){const s=await(await fetch(`data:${e.inlineData.mimeType};base64,${e.inlineData.data}`)).blob();return{type:"image",value:await createImageBitmap(s)}}throw new P(C.REQUEST_ERROR,"Processing of this Part type is not currently supported.")}static toLanguageModelMessageRole(e){return e==="model"?"assistant":"user"}async createSession(){if(!this.languageModelProvider)throw new P(C.UNSUPPORTED,"Chrome AI requested for unsupported browser version.");const e=await this.languageModelProvider.create(this.onDeviceParams.createOptions);return this.oldSession&&this.oldSession.destroy(),this.oldSession=e,e}static toResponse(e){return{json:async()=>({candidates:[{content:{parts:[{text:e}]}}]})}}static toStreamResponse(e){const t=new TextEncoder;return{body:e.pipeThrough(new TransformStream({transform(s,r){const c=JSON.stringify({candidates:[{content:{role:"model",parts:[{text:s}]}}]});r.enqueue(t.encode(`data: ${c}

`))}}))}}}se.SUPPORTED_MIME_TYPES=["image/jpeg","image/png"];function Ud(n,e,t){if(typeof e<"u"&&n)return new se(e.LanguageModel,n,t)}/**
 * @license
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class xd{constructor(e,t,s,r,c){this.app=e,this.backend=t,this.chromeAdapterFactory=c;const h=r?.getImmediate({optional:!0}),g=s?.getImmediate({optional:!0});this.auth=g||null,this.appCheck=h||null,t instanceof Wn?this.location=t.location:this.location=""}_delete(){return Promise.resolve()}set options(e){this._options=e}get options(){return this._options}}/**
 * @license
 * Copyright 2025 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Fd(n,{instanceIdentifier:e}){if(!e)throw new P(C.ERROR,"AIService instance identifier is undefined.");const t=Md(e),s=n.getProvider("app").getImmediate(),r=n.getProvider("auth-internal"),c=n.getProvider("app-check-internal");return new xd(s,t,r,c,Ud)}/**
 * @license
 * Copyright 2025 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class qt{constructor(e,t){if(e.app?.options?.apiKey)if(e.app?.options?.projectId)if(e.app?.options?.appId){if(this._apiSettings={apiKey:e.app.options.apiKey,project:e.app.options.projectId,appId:e.app.options.appId,automaticDataCollectionEnabled:e.app.automaticDataCollectionEnabled,location:e.location,backend:e.backend},ie(e.app)&&e.app.settings.appCheckToken){const s=e.app.settings.appCheckToken;this._apiSettings.getAppCheckToken=()=>Promise.resolve({token:s})}else e.appCheck&&(e.options?.useLimitedUseAppCheckTokens?this._apiSettings.getAppCheckToken=()=>e.appCheck.getLimitedUseToken():this._apiSettings.getAppCheckToken=()=>e.appCheck.getToken());e.auth&&(this._apiSettings.getAuthToken=()=>e.auth.getToken()),this.model=qt.normalizeModelName(t,this._apiSettings.backend.backendType)}else throw new P(C.NO_APP_ID,'The "appId" field is empty in the local Firebase config. Firebase AI requires this field to contain a valid app ID.');else throw new P(C.NO_PROJECT_ID,'The "projectId" field is empty in the local Firebase config. Firebase AI requires this field to contain a valid project ID.');else throw new P(C.NO_API_KEY,'The "apiKey" field is empty in the local Firebase config. Firebase AI requires this field to contain a valid API key.')}static normalizeModelName(e,t){return t===Se.GOOGLE_AI?qt.normalizeGoogleAIModelName(e):qt.normalizeVertexAIModelName(e)}static normalizeGoogleAIModelName(e){return`models/${e}`}static normalizeVertexAIModelName(e){let t;return e.includes("/")?e.startsWith("models/")?t=`publishers/google/${e}`:t=e:t=`publishers/google/models/${e}`,t}}/**
 * @license
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */var Xt;(function(n){n.GENERATE_CONTENT="generateContent",n.STREAM_GENERATE_CONTENT="streamGenerateContent",n.COUNT_TOKENS="countTokens",n.PREDICT="predict"})(Xt||(Xt={}));class la{constructor(e,t,s,r,c){this.model=e,this.task=t,this.apiSettings=s,this.stream=r,this.requestOptions=c}toString(){const e=new URL(this.baseUrl);return e.pathname=`/${this.apiVersion}/${this.modelPath}:${this.task}`,e.search=this.queryParams.toString(),e.toString()}get baseUrl(){return this.requestOptions?.baseUrl||`https://${Pd}`}get apiVersion(){return kd}get modelPath(){if(this.apiSettings.backend instanceof an)return`projects/${this.apiSettings.project}/${this.model}`;if(this.apiSettings.backend instanceof Wn)return`projects/${this.apiSettings.project}/locations/${this.apiSettings.backend.location}/${this.model}`;throw new P(C.ERROR,`Invalid backend: ${JSON.stringify(this.apiSettings.backend)}`)}get queryParams(){const e=new URLSearchParams;return this.stream&&e.set("alt","sse"),e}}function Vd(){const n=[];return n.push(`${Od}/${eo}`),n.push(`fire/${eo}`),n.join(" ")}async function jd(n){const e=new Headers;if(e.append("Content-Type","application/json"),e.append("x-goog-api-client",Vd()),e.append("x-goog-api-key",n.apiSettings.apiKey),n.apiSettings.automaticDataCollectionEnabled&&e.append("X-Firebase-Appid",n.apiSettings.appId),n.apiSettings.getAppCheckToken){const t=await n.apiSettings.getAppCheckToken();t&&(e.append("X-Firebase-AppCheck",t.token),t.error&&X.warn(`Unable to obtain a valid App Check token: ${t.error.message}`))}if(n.apiSettings.getAuthToken){const t=await n.apiSettings.getAuthToken();t&&e.append("Authorization",`Firebase ${t.accessToken}`)}return e}async function Bd(n,e,t,s,r,c){const h=new la(n,e,t,s,c);return{url:h.toString(),fetchOptions:{method:"POST",headers:await jd(h),body:r}}}async function is(n,e,t,s,r,c){const h=new la(n,e,t,s,c);let g,w;try{const v=await Bd(n,e,t,s,r,c),A=c?.timeout!=null&&c.timeout>=0?c.timeout:Nd,b=new AbortController;if(w=setTimeout(()=>b.abort(),A),v.fetchOptions.signal=b.signal,g=await fetch(v.url,v.fetchOptions),!g.ok){let S="",M;try{const O=await g.json();S=O.error.message,O.error.details&&(S+=` ${JSON.stringify(O.error.details)}`,M=O.error.details)}catch{}throw g.status===403&&M&&M.some(O=>O.reason==="SERVICE_DISABLED")&&M.some(O=>O.links?.[0]?.description.includes("Google developers console API activation"))?new P(C.API_NOT_ENABLED,`The Firebase AI SDK requires the Firebase AI API ('firebasevertexai.googleapis.com') to be enabled in your Firebase project. Enable this API by visiting the Firebase Console at https://console.firebase.google.com/project/${h.apiSettings.project}/genai/ and clicking "Get started". If you enabled this API recently, wait a few minutes for the action to propagate to our systems and then retry.`,{status:g.status,statusText:g.statusText,errorDetails:M}):new P(C.FETCH_ERROR,`Error fetching from ${h}: [${g.status} ${g.statusText}] ${S}`,{status:g.status,statusText:g.statusText,errorDetails:M})}}catch(v){let A=v;throw v.code!==C.FETCH_ERROR&&v.code!==C.API_NOT_ENABLED&&v instanceof Error&&(A=new P(C.ERROR,`Error fetching from ${h.toString()}: ${v.message}`),A.stack=v.stack),A}finally{w&&clearTimeout(w)}return g}/**
 * @license
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Tn(n){if(n.candidates&&n.candidates.length>0){if(n.candidates.length>1&&X.warn(`This response had ${n.candidates.length} candidates. Returning text from the first candidate only. Access response.candidates directly to use the other candidates.`),ua(n.candidates[0]))throw new P(C.RESPONSE_ERROR,`Response error: ${et(n)}. Response body stored in error.response`,{response:n});return!0}else return!1}function Fn(n){return n.candidates&&!n.candidates[0].hasOwnProperty("index")&&(n.candidates[0].index=0),$d(n)}function $d(n){return n.text=()=>{if(Tn(n))return io(n,e=>!e.thought);if(n.promptFeedback)throw new P(C.RESPONSE_ERROR,`Text not available. ${et(n)}`,{response:n});return""},n.thoughtSummary=()=>{if(Tn(n)){const e=io(n,t=>!!t.thought);return e===""?void 0:e}else if(n.promptFeedback)throw new P(C.RESPONSE_ERROR,`Thought summary not available. ${et(n)}`,{response:n})},n.inlineDataParts=()=>{if(Tn(n))return Gd(n);if(n.promptFeedback)throw new P(C.RESPONSE_ERROR,`Data not available. ${et(n)}`,{response:n})},n.functionCalls=()=>{if(Tn(n))return Hd(n);if(n.promptFeedback)throw new P(C.RESPONSE_ERROR,`Function call not available. ${et(n)}`,{response:n})},n}function io(n,e){const t=[];if(n.candidates?.[0].content?.parts)for(const s of n.candidates?.[0].content?.parts)s.text&&e(s)&&t.push(s.text);return t.length>0?t.join(""):""}function Hd(n){const e=[];if(n.candidates?.[0].content?.parts)for(const t of n.candidates?.[0].content?.parts)t.functionCall&&e.push(t.functionCall);if(e.length>0)return e}function Gd(n){const e=[];if(n.candidates?.[0].content?.parts)for(const t of n.candidates?.[0].content?.parts)t.inlineData&&e.push(t);if(e.length>0)return e}const Wd=[no.RECITATION,no.SAFETY];function ua(n){return!!n.finishReason&&Wd.some(e=>e===n.finishReason)}function et(n){let e="";if((!n.candidates||n.candidates.length===0)&&n.promptFeedback)e+="Response was blocked",n.promptFeedback?.blockReason&&(e+=` due to ${n.promptFeedback.blockReason}`),n.promptFeedback?.blockReasonMessage&&(e+=`: ${n.promptFeedback.blockReasonMessage}`);else if(n.candidates?.[0]){const t=n.candidates[0];ua(t)&&(e+=`Candidate was blocked due to ${t.finishReason}`,t.finishMessage&&(e+=`: ${t.finishMessage}`))}return e}/**
 * @license
 * Copyright 2025 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function da(n){if(n.safetySettings?.forEach(e=>{if(e.method)throw new P(C.UNSUPPORTED,"SafetySetting.method is not supported in the the Gemini Developer API. Please remove this property.")}),n.generationConfig?.topK){const e=Math.round(n.generationConfig.topK);e!==n.generationConfig.topK&&(X.warn("topK in GenerationConfig has been rounded to the nearest integer to match the format for requests to the Gemini Developer API."),n.generationConfig.topK=e)}return n}function ss(n){return{candidates:n.candidates?zd(n.candidates):void 0,prompt:n.promptFeedback?Kd(n.promptFeedback):void 0,usageMetadata:n.usageMetadata}}function qd(n,e){return{generateContentRequest:{model:e,...n}}}function zd(n){const e=[];let t;return e&&n.forEach(s=>{let r;if(s.citationMetadata&&(r={citations:s.citationMetadata.citationSources}),s.safetyRatings&&(t=s.safetyRatings.map(h=>({...h,severity:h.severity??ca.HARM_SEVERITY_UNSUPPORTED,probabilityScore:h.probabilityScore??0,severityScore:h.severityScore??0}))),s.content?.parts?.some(h=>h?.videoMetadata))throw new P(C.UNSUPPORTED,"Part.videoMetadata is not supported in the Gemini Developer API. Please remove this property.");const c={index:s.index,content:s.content,finishReason:s.finishReason,finishMessage:s.finishMessage,safetyRatings:t,citationMetadata:r,groundingMetadata:s.groundingMetadata,urlContextMetadata:s.urlContextMetadata};e.push(c)}),e}function Kd(n){const e=[];return n.safetyRatings.forEach(s=>{e.push({category:s.category,probability:s.probability,severity:s.severity??ca.HARM_SEVERITY_UNSUPPORTED,probabilityScore:s.probabilityScore??0,severityScore:s.severityScore??0,blocked:s.blocked})}),{blockReason:n.blockReason,safetyRatings:e,blockReasonMessage:n.blockReasonMessage}}/**
 * @license
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const so=/^data\: (.*)(?:\n\n|\r\r|\r\n\r\n)/;function Jd(n,e){const t=n.body.pipeThrough(new TextDecoderStream("utf8",{fatal:!0})),s=Qd(t),[r,c]=s.tee();return{stream:Xd(r,e),response:Yd(c,e)}}async function Yd(n,e){const t=[],s=n.getReader();for(;;){const{done:r,value:c}=await s.read();if(r){let h=Zd(t);return e.backend.backendType===Se.GOOGLE_AI&&(h=ss(h)),Fn(h)}t.push(c)}}async function*Xd(n,e){const t=n.getReader();for(;;){const{value:s,done:r}=await t.read();if(r)break;let c;e.backend.backendType===Se.GOOGLE_AI?c=Fn(ss(s)):c=Fn(s);const h=c.candidates?.[0];!h?.content?.parts&&!h?.finishReason&&!h?.citationMetadata&&!h?.urlContextMetadata||(yield c)}}function Qd(n){const e=n.getReader();return new ReadableStream({start(s){let r="";return c();function c(){return e.read().then(({value:h,done:g})=>{if(g){if(r.trim()){s.error(new P(C.PARSE_FAILED,"Failed to parse stream"));return}s.close();return}r+=h;let w=r.match(so),v;for(;w;){try{v=JSON.parse(w[1])}catch{s.error(new P(C.PARSE_FAILED,`Error parsing JSON response: "${w[1]}`));return}s.enqueue(v),r=r.substring(w[0].length),w=r.match(so)}return c()})}}})}function Zd(n){const t={promptFeedback:n[n.length-1]?.promptFeedback};for(const s of n)if(s.candidates)for(const r of s.candidates){const c=r.index||0;t.candidates||(t.candidates=[]),t.candidates[c]||(t.candidates[c]={index:r.index}),t.candidates[c].citationMetadata=r.citationMetadata,t.candidates[c].finishReason=r.finishReason,t.candidates[c].finishMessage=r.finishMessage,t.candidates[c].safetyRatings=r.safetyRatings,t.candidates[c].groundingMetadata=r.groundingMetadata;const h=r.urlContextMetadata;if(typeof h=="object"&&h!==null&&Object.keys(h).length>0&&(t.candidates[c].urlContextMetadata=h),r.content){if(!r.content.parts)continue;t.candidates[c].content||(t.candidates[c].content={role:r.content.role||"user",parts:[]});for(const g of r.content.parts){const w={...g};g.text!==""&&Object.keys(w).length>0&&t.candidates[c].content.parts.push(w)}}}return t}/**
 * @license
 * Copyright 2025 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const ef=[C.FETCH_ERROR,C.ERROR,C.API_NOT_ENABLED];async function fa(n,e,t,s){if(!e)return s();switch(e.mode){case Ze.ONLY_ON_DEVICE:if(await e.isAvailable(n))return t();throw new P(C.UNSUPPORTED,"Inference mode is ONLY_ON_DEVICE, but an on-device model is not available.");case Ze.ONLY_IN_CLOUD:return s();case Ze.PREFER_IN_CLOUD:try{return await s()}catch(r){if(r instanceof P&&ef.includes(r.code))return t();throw r}case Ze.PREFER_ON_DEVICE:return await e.isAvailable(n)?t():s();default:throw new P(C.ERROR,`Unexpected infererence mode: ${e.mode}`)}}/**
 * @license
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function tf(n,e,t,s){return n.backend.backendType===Se.GOOGLE_AI&&(t=da(t)),is(e,Xt.STREAM_GENERATE_CONTENT,n,!0,JSON.stringify(t),s)}async function pa(n,e,t,s,r){const c=await fa(t,s,()=>s.generateContentStream(t),()=>tf(n,e,t,r));return Jd(c,n)}async function nf(n,e,t,s){return n.backend.backendType===Se.GOOGLE_AI&&(t=da(t)),is(e,Xt.GENERATE_CONTENT,n,!1,JSON.stringify(t),s)}async function ga(n,e,t,s,r){const c=await fa(t,s,()=>s.generateContent(t),()=>nf(n,e,t,r)),h=await sf(c,n);return{response:Fn(h)}}async function sf(n,e){const t=await n.json();return e.backend.backendType===Se.GOOGLE_AI?ss(t):t}/**
 * @license
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function ma(n){if(n!=null){if(typeof n=="string")return{role:"system",parts:[{text:n}]};if(n.text)return{role:"system",parts:[n]};if(n.parts)return n.role?n:{role:"system",parts:n.parts}}}function Vi(n){let e=[];if(typeof n=="string")e=[{text:n}];else for(const t of n)typeof t=="string"?e.push({text:t}):e.push(t);return rf(e)}function rf(n){const e={role:"user",parts:[]},t={role:"function",parts:[]};let s=!1,r=!1;for(const c of n)"functionResponse"in c?(t.parts.push(c),r=!0):(e.parts.push(c),s=!0);if(s&&r)throw new P(C.INVALID_CONTENT,"Within a single message, FunctionResponse cannot be mixed with other type of Part in the request for sending chat message.");if(!s&&!r)throw new P(C.INVALID_CONTENT,"No Content is provided for sending chat message.");return s?e:t}function Ci(n){let e;return n.contents?e=n:e={contents:[Vi(n)]},n.systemInstruction&&(e.systemInstruction=ma(n.systemInstruction)),e}/**
 * @license
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const ro=["text","inlineData","functionCall","functionResponse","thought","thoughtSignature"],of={user:["text","inlineData"],function:["functionResponse"],model:["text","functionCall","thought","thoughtSignature"],system:["text"]},oo={user:["model"],function:["model"],model:["user","function"],system:[]};function af(n){let e=null;for(const t of n){const{role:s,parts:r}=t;if(!e&&s!=="user")throw new P(C.INVALID_CONTENT,`First Content should be with role 'user', got ${s}`);if(!to.includes(s))throw new P(C.INVALID_CONTENT,`Each item should include role field. Got ${s} but valid roles are: ${JSON.stringify(to)}`);if(!Array.isArray(r))throw new P(C.INVALID_CONTENT,"Content should have 'parts' property with an array of Parts");if(r.length===0)throw new P(C.INVALID_CONTENT,"Each Content should have at least one part");const c={text:0,inlineData:0,functionCall:0,functionResponse:0,thought:0,thoughtSignature:0,executableCode:0,codeExecutionResult:0};for(const g of r)for(const w of ro)w in g&&(c[w]+=1);const h=of[s];for(const g of ro)if(!h.includes(g)&&c[g]>0)throw new P(C.INVALID_CONTENT,`Content with role '${s}' can't contain '${g}' part`);if(e&&!oo[s].includes(e.role))throw new P(C.INVALID_CONTENT,`Content with role '${s}' can't follow '${e.role}'. Valid previous roles: ${JSON.stringify(oo)}`);e=t}}/**
 * @license
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const ao="SILENT_ERROR";class cf{constructor(e,t,s,r,c){this.model=t,this.chromeAdapter=s,this.params=r,this.requestOptions=c,this._history=[],this._sendPromise=Promise.resolve(),this._apiSettings=e,r?.history&&(af(r.history),this._history=r.history)}async getHistory(){return await this._sendPromise,this._history}async sendMessage(e){await this._sendPromise;const t=Vi(e),s={safetySettings:this.params?.safetySettings,generationConfig:this.params?.generationConfig,tools:this.params?.tools,toolConfig:this.params?.toolConfig,systemInstruction:this.params?.systemInstruction,contents:[...this._history,t]};let r={};return this._sendPromise=this._sendPromise.then(()=>ga(this._apiSettings,this.model,s,this.chromeAdapter,this.requestOptions)).then(c=>{if(c.response.candidates&&c.response.candidates.length>0){this._history.push(t);const h={parts:c.response.candidates?.[0].content.parts||[],role:c.response.candidates?.[0].content.role||"model"};this._history.push(h)}else{const h=et(c.response);h&&X.warn(`sendMessage() was unsuccessful. ${h}. Inspect response object for details.`)}r=c}),await this._sendPromise,r}async sendMessageStream(e){await this._sendPromise;const t=Vi(e),s={safetySettings:this.params?.safetySettings,generationConfig:this.params?.generationConfig,tools:this.params?.tools,toolConfig:this.params?.toolConfig,systemInstruction:this.params?.systemInstruction,contents:[...this._history,t]},r=pa(this._apiSettings,this.model,s,this.chromeAdapter,this.requestOptions);return this._sendPromise=this._sendPromise.then(()=>r).catch(c=>{throw new Error(ao)}).then(c=>c.response).then(c=>{if(c.candidates&&c.candidates.length>0){this._history.push(t);const h={...c.candidates[0].content};h.role||(h.role="model"),this._history.push(h)}else{const h=et(c);h&&X.warn(`sendMessageStream() was unsuccessful. ${h}. Inspect response object for details.`)}}).catch(c=>{c.message!==ao&&X.error(c)}),r}}/**
 * @license
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function hf(n,e,t,s){let r="";if(n.backend.backendType===Se.GOOGLE_AI){const h=qd(t,e);r=JSON.stringify(h)}else r=JSON.stringify(t);return(await is(e,Xt.COUNT_TOKENS,n,!1,r,s)).json()}async function lf(n,e,t,s,r){if(s?.mode===Ze.ONLY_ON_DEVICE)throw new P(C.UNSUPPORTED,"countTokens() is not supported for on-device models.");return hf(n,e,t,r)}/**
 * @license
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class uf extends qt{constructor(e,t,s,r){super(e,t.model),this.chromeAdapter=r,this.generationConfig=t.generationConfig||{},this.safetySettings=t.safetySettings||[],this.tools=t.tools,this.toolConfig=t.toolConfig,this.systemInstruction=ma(t.systemInstruction),this.requestOptions=s||{}}async generateContent(e){const t=Ci(e);return ga(this._apiSettings,this.model,{generationConfig:this.generationConfig,safetySettings:this.safetySettings,tools:this.tools,toolConfig:this.toolConfig,systemInstruction:this.systemInstruction,...t},this.chromeAdapter,this.requestOptions)}async generateContentStream(e){const t=Ci(e);return pa(this._apiSettings,this.model,{generationConfig:this.generationConfig,safetySettings:this.safetySettings,tools:this.tools,toolConfig:this.toolConfig,systemInstruction:this.systemInstruction,...t},this.chromeAdapter,this.requestOptions)}startChat(e){return new cf(this._apiSettings,this.model,this.chromeAdapter,{tools:this.tools,toolConfig:this.toolConfig,systemInstruction:this.systemInstruction,generationConfig:this.generationConfig,safetySettings:this.safetySettings,...e},this.requestOptions)}async countTokens(e){const t=Ci(e);return lf(this._apiSettings,this.model,t,this.chromeAdapter)}}/**
 * @license
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function df(n=Hi(),e){n=ye(n);const t=jn(n,Et),s=e?.backend??new an,r={useLimitedUseAppCheckTokens:e?.useLimitedUseAppCheckTokens??!1},c=Ld(s),h=t.getImmediate({identifier:c});return h.options=r,h}function ff(n,e,t){const s=e;let r;if(s.mode?r=s.inCloudParams||{model:Dd}:r=e,!r.model)throw new P(C.NO_MODEL,"Must provide a model name. Example: getGenerativeModel({ model: 'my-model-name' })");const c=n.chromeAdapterFactory?.(s.mode,typeof window>"u"?void 0:window,s.onDeviceParams);return new uf(n,r,t,c)}function pf(){st(new Be(Et,Fd,"PUBLIC").setMultipleInstances(!0)),pe(Qr,Fi),pe(Qr,Fi,"esm2020")}pf();const _a={apiKey:"AIzaSyD09EUMBmbJb8d6AlIpsJvFFnQxdFi5MVM",authDomain:"scorpio-srs.firebaseapp.com",projectId:"scorpio-srs",storageBucket:"scorpio-srs.firebasestorage.app",messagingSenderId:"247809684573",appId:"1:247809684573:web:2850103cc100bb6fa409b4"},ya=$i(_a),qn=Ju(ya);Sd(ya);const gf=$i(_a),Ea=df(gf,{backend:new an}),mf=ff(Ea,{model:"gemini-2.5-flash"}),_f=async(n,e)=>{try{return(await Ll(qn,n,e)).user}catch(t){throw console.error("Login error:",t),t}},yf=async()=>{try{return await Fl(qn),!0}catch(n){throw console.error("Logout error:",n),n}},Ef=()=>new Promise((n,e)=>{const t=xl(qn,s=>{t(),n(s)},e)}),wf=Object.freeze(Object.defineProperty({__proto__:null,ai:Ea,auth:qn,getCurrentUser:Ef,login:_f,logout:yf,model:mf},Symbol.toStringTag,{value:"Module"}));export{qn as a,yf as b,wf as f,Ef as g,_f as l,xl as o};
