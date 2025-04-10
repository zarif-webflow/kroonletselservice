class j extends Error{constructor(r){super(r),this.name="AssertionError"}}const x=(e,r,n)=>{if(e==null||Number.isNaN(e)||n)throw new j(r);return e},g=(e,r)=>x((r||document).querySelector(e),`Element: ${e} was not found!`);var b;function h(e){return{lang:e?.lang??b?.lang,message:e?.message,abortEarly:e?.abortEarly??b?.abortEarly,abortPipeEarly:e?.abortPipeEarly??b?.abortPipeEarly}}var A;function q(e){return A?.get(e)}var I;function L(e){return I?.get(e)}var D;function M(e,r){return D?.get(e)?.get(r)}function O(e){const r=typeof e;return r==="string"?`"${e}"`:r==="number"||r==="bigint"||r==="boolean"?`${e}`:r==="object"||r==="function"?(e&&Object.getPrototypeOf(e)?.constructor?.name)??"null":r}function m(e,r,n,t,i){const u=i&&"input"in i?i.input:n.value,s=i?.expected??e.expects??null,c=i?.received??O(u),a={kind:e.kind,type:e.type,input:u,expected:s,received:c,message:`Invalid ${r}: ${s?`Expected ${s} but r`:"R"}eceived ${c}`,requirement:e.requirement,path:i?.path,issues:i?.issues,lang:t.lang,abortEarly:t.abortEarly,abortPipeEarly:t.abortPipeEarly},o=e.kind==="schema",l=i?.message??e.message??M(e.reference,a.lang)??(o?L(a.lang):null)??t.message??q(a.lang);l!==void 0&&(a.message=typeof l=="function"?l(a):l),o&&(n.typed=!1),n.issues?n.issues.push(a):n.issues=[a]}function v(e){return{version:1,vendor:"valibot",validate(r){return e["~run"]({value:r},h())}}}var V=/^[\w+-]+(?:\.[\w+-]+)*@[\da-z]+(?:[.-][\da-z]+)*\.[a-z]{2,}$/iu;function k(e){return{kind:"validation",type:"email",reference:k,expects:null,async:!1,requirement:V,message:e,"~run"(r,n){return r.typed&&!this.requirement.test(r.value)&&m(this,"email",r,n),r}}}function E(e,r){return{kind:"validation",type:"min_length",reference:E,async:!1,expects:`>=${e}`,requirement:e,message:r,"~run"(n,t){return n.typed&&n.value.length<this.requirement&&m(this,"length",n,t,{received:`${n.value.length}`}),n}}}function w(e){return{kind:"transformation",type:"transform",reference:w,async:!1,operation:e,"~run"(r){return r.value=this.operation(r.value),r}}}function p(){return{kind:"transformation",type:"trim",reference:p,async:!1,"~run"(e){return e.value=e.value.trim(),e}}}function G(e,r,n){return typeof e.fallback=="function"?e.fallback(r,n):e.fallback}function _(e,r,n){return typeof e.default=="function"?e.default(r,n):e.default}function $(e,r){return{kind:"schema",type:"object",reference:$,expects:"Object",async:!1,entries:e,message:r,get"~standard"(){return v(this)},"~run"(n,t){const i=n.value;if(i&&typeof i=="object"){n.typed=!0,n.value={};for(const u in this.entries){const s=this.entries[u];if(u in i||(s.type==="exact_optional"||s.type==="optional"||s.type==="nullish")&&s.default!==void 0){const c=u in i?i[u]:_(s),a=s["~run"]({value:c},t);if(a.issues){const o={type:"object",origin:"value",input:i,key:u,value:c};for(const l of a.issues)l.path?l.path.unshift(o):l.path=[o],n.issues?.push(l);if(n.issues||(n.issues=a.issues),t.abortEarly){n.typed=!1;break}}a.typed||(n.typed=!1),n.value[u]=a.value}else if(s.fallback!==void 0)n.value[u]=G(s);else if(s.type!=="exact_optional"&&s.type!=="optional"&&s.type!=="nullish"&&(m(this,"key",n,t,{input:void 0,expected:`"${u}"`,path:[{type:"object",origin:"key",input:i,key:u,value:i[u]}]}),t.abortEarly))break}}else m(this,"type",n,t);return n}}}function d(e,r){return{kind:"schema",type:"optional",reference:d,expects:`(${e.expects} | undefined)`,async:!1,wrapped:e,default:r,get"~standard"(){return v(this)},"~run"(n,t){return n.value===void 0&&(this.default!==void 0&&(n.value=_(this,n,t)),n.value===void 0)?(n.typed=!0,n):this.wrapped["~run"](n,t)}}}function f(e){return{kind:"schema",type:"string",reference:f,expects:"string",async:!1,message:e,get"~standard"(){return v(this)},"~run"(r,n){return typeof r.value=="string"?r.typed=!0:m(this,"type",r,n),r}}}function y(...e){return{...e[0],pipe:e,get"~standard"(){return v(this)},"~run"(r,n){for(const t of e)if(t.kind!=="metadata"){if(r.issues&&(t.kind==="schema"||t.kind==="transformation")){r.typed=!1;break}(!r.issues||!n.abortEarly&&!n.abortPipeEarly)&&(r=t["~run"](r,n))}return r}}}function N(e,r,n){const t=e["~run"]({value:r},h(n));return{typed:t.typed,success:!t.issues,output:t.value,issues:t.issues}}const S="#wf-form-Multi-Step---Report-Damage",z=e=>!!e.querySelector('[name="g-recaptcha-response"]'),R=e=>y($({Voornaam:y(f(),p()),Achternaam:y(f(),p()),Gegevens:d(y(f(),p())),Telefoonnummer:d(y(f(),p())),"E-mail-adres":y(f(),p(),k()),"g-recaptcha-response":e?y(f(),p(),E(10)):d(f())}),w(r=>({email:r["E-mail-adres"],phone_number:r.Telefoonnummer,address:{first_name:r.Voornaam,last_name:r.Achternaam}}))),F=e=>{window.dataLayer=window.dataLayer||[],window.dataLayer.push({event:"form_submit","gtm.elementId":S,user_data:e})},T=()=>{const e=g(S),r=Array.from(e.querySelectorAll("input, select, textarea")),n=g("[type=submit]",e);n.type="button";const t=z(e),i=R(t);n.addEventListener("click",()=>{for(const o of r)if(!o.checkValidity()){o.reportValidity();return}const u=new FormData(e),s=Object.fromEntries(u.entries()),c=N(i,s);if(!c.success){const o=c.issues;if(t&&o.find(l=>l.path?.some(P=>P.key==="g-recaptcha-response"))){alert("Please confirm you\u2019re not a robot.");return}console.error(JSON.stringify(o));return}const a=c.output;F(a),n.type="submit",n.click()})};T();
