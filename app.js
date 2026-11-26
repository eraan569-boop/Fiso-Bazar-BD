/* Fiso Bazar BD — front-end demo.
   Production: move auth, roles, moderation, messaging and subscription checks to a trusted server. */
(() => {
  "use strict";
  const OWNER_EMAILS = ["owner1@example.com", "owner2@example.com", "owner3@example.com"]; // Replace with your 3 approved addresses.
  const WHATSAPP_NUMBER = "8801XXXXXXXXX"; // International format, digits only. Configure before deployment.
  const STORAGE_KEY = "fiso-bazar-demo-v1";
  const money = n => "৳" + Number(n).toLocaleString("en-BD");
  const seedProducts = [
    {id:"p1",title:"Studio Wireless Headphones",category:"Electronics",price:2450,emoji:"🎧",rating:4.8,reviews:128,tag:"Popular",description:"Comfortable wireless sound for work, study, and everyday listening."},
    {id:"p2",title:"Everyday Canvas Tote",category:"Fashion",price:790,emoji:"👜",rating:4.7,reviews:64,tag:"Lovely find",description:"A lightweight everyday tote with a roomy, easy-carry design."},
    {id:"p3",title:"Cloud Ceramic Mug",category:"Home",price:590,emoji:"☕",rating:4.9,reviews:42,tag:"New",description:"A simple ceramic mug for slow mornings and cozy evenings."},
    {id:"p4",title:"Soft Glow Skincare Set",category:"Beauty",price:1350,emoji:"🧴",rating:4.6,reviews:87,tag:"Bestseller",description:"A gentle everyday care set. Check the product label for ingredients."},
    {id:"p5",title:"Mini Bluetooth Speaker",category:"Electronics",price:1890,emoji:"🔊",rating:4.8,reviews:93,tag:"Top rated",description:"Compact sound for desks, rooms, and small get-togethers."},
    {id:"p6",title:"Classic Everyday Sneakers",category:"Fashion",price:2190,emoji:"👟",rating:4.5,reviews:51,tag:"Fresh pick",description:"Versatile everyday sneakers with a clean, casual look."},
    {id:"p7",title:"Minimal Desk Lamp",category:"Home",price:1590,emoji:"💡",rating:4.7,reviews:35,tag:"Editor pick",description:"A warm, minimal lamp for a calm reading or work corner."},
    {id:"p8",title:"Pocket Digital Camera",category:"Electronics",price:4990,emoji:"📷",rating:4.6,reviews:29,tag:"Explore",description:"A compact camera-inspired pick for creative everyday moments."}
  ];
  const defaultState = {products:seedProducts,cart:{},user:null,admins:[],messages:[],reviews:{},ownerControls:{},subscriptionEnds:{}};
  let state = loadState(), activeCategory = "All", searchTerm = "", toastTimer;
  const $ = id => document.getElementById(id);
  function loadState(){try{return {...defaultState,...JSON.parse(localStorage.getItem(STORAGE_KEY)||"{}")}}catch{return {...defaultState}}}
  function save(){localStorage.setItem(STORAGE_KEY,JSON.stringify(state))}
  function toast(msg){const el=$("toast");el.textContent=msg;el.classList.add("show");clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove("show"),2600)}
  function esc(s){return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
  function getProducts(){return state.products.filter(p=>(activeCategory==="All"||p.category===activeCategory)&&(`${p.title} ${p.category} ${p.description||""}`).toLowerCase().includes(searchTerm.toLowerCase()))}
  function renderProducts(){
    const products=getProducts();$("result-count").textContent=`${products.length} product${products.length===1?"":"s"}`;
    $("empty-state").classList.toggle("hidden",products.length>0);
    $("product-grid").innerHTML=products.map((p,i)=>`<article class="product-card" style="animation-delay:${i*45}ms">
      <div class="product-image">${p.image?`<img src="${esc(p.image)}" alt="${esc(p.title)}" loading="lazy">`:`<span class="product-emoji">${esc(p.emoji||"✧")}</span>`}<span class="product-tag">${esc(p.tag||p.category)}</span></div>
      <div class="product-info"><h3>${esc(p.title)}</h3><div class="rating">★★★★★ <span>${Number(p.rating||0).toFixed(1)} (${Number(p.reviews||0)})</span></div><div class="product-bottom"><span class="price">${money(p.price)}</span><button class="add-cart" data-add="${esc(p.id)}" aria-label="Add ${esc(p.title)} to cart">＋</button></div></div></article>`).join("");
  }
  function cartCount(){return Object.values(state.cart).reduce((a,b)=>a+b,0)}
  function renderCount(){$("cart-count").textContent=cartCount()}
  function openModal(content){$("modal-content").innerHTML=content;$("modal-backdrop").classList.remove("hidden");$("modal").scrollTop=0}
  function closeModal(){$("modal-backdrop").classList.add("hidden")}
  function inputField(label,name,placeholder="",type="text",required=true){return `<div class="field"><label for="${name}">${label}</label><input id="${name}" name="${name}" type="${type}" placeholder="${placeholder}" ${required?"required":""}></div>`}
  function accountModal(){
    if(state.user){const u=state.user;openModal(`<h2 id="modal-title">Your account</h2><p>Signed in as <b>${esc(u.email)}</b></p><div class="seller-only"><h3>Account type: ${esc(u.role)}</h3><p>This is a local demo session. A production account must be verified by a secure server.</p></div><button class="wide-button" id="logout">Sign out</button>`);$("logout").onclick=()=>{state.user=null;save();closeModal();toast("Signed out")};return}
    openModal(`<h2 id="modal-title">Welcome to Fiso</h2><p>Sign in or create a customer account to continue.</p><div class="modal-tabs"><button class="active" data-tab="signin">Sign in</button><button data-tab="signup">Create account</button></div><form id="account-form">${inputField("Email address","auth-email","you@example.com","email")}${inputField("Password","auth-password","At least 8 characters","password")}<button class="wide-button">Continue</button></form><div class="notice">Demo mode: this form stores a local session only. Do not use a real password. Admin and Owner privileges require server-side verification in production.</div>`);
    $("modal").querySelectorAll("[data-tab]").forEach(b=>b.onclick=()=>{ $("modal").querySelectorAll("[data-tab]").forEach(x=>x.classList.toggle("active",x===b));$("auth-password").autocomplete=b.dataset.tab==="signup"?"new-password":"current-password";$("account-form").dataset.mode=b.dataset.tab});
    $("account-form").onsubmit=e=>{e.preventDefault();const email=$("auth-email").value.trim().toLowerCase(),password=$("auth-password").value;if(password.length<8){toast("Use at least 8 characters");return}const isOwner=OWNER_EMAILS.includes(email);state.user={email,role:isOwner?"Owner":"Customer"};save();closeModal();toast(isOwner?"Owner demo session opened":"Welcome to Fiso Bazar BD");};
  }
  function cartModal(){
    const items=Object.entries(state.cart).filter(([,q])=>q>0).map(([id,q])=>({p:state.products.find(p=>p.id===id),q})).filter(x=>x.p);
    const total=items.reduce((s,x)=>s+x.p.price*x.q,0);
    openModal(`<h2 id="modal-title">Your cart</h2><p>Review your finds before contacting the seller.</p>${items.length?items.map(({p,q})=>`<div class="cart-line"><div class="cart-thumb">${p.image?`<img src="${esc(p.image)}" alt="" style="width:100%;height:100%;object-fit:cover;border-radius:13px">`:esc(p.emoji||"✧")}</div><div class="line-copy"><b>${esc(p.title)}</b><small>${money(p.price)} each</small></div><div class="quantity"><button data-qty="${p.id}" data-delta="-1">−</button><span>${q}</span><button data-qty="${p.id}" data-delta="1">+</button></div></div>`).join(""):`<div class="empty"><span>♧</span><h3>Your cart is waiting</h3><p>Add something lovely from the bazar.</p></div>`}<div class="cart-total"><span>Estimated total</span><span>${money(total)}</span></div><div class="notice">No payment is collected in this app. Checkout is a demo; connect a secure order service to accept orders.</div><button class="wide-button" id="checkout" ${items.length?"":"disabled"}>Continue to order inquiry</button>`);
    $("modal").querySelectorAll("[data-qty]").forEach(b=>b.onclick=()=>{const id=b.dataset.qty;state.cart[id]=(state.cart[id]||0)+Number(b.dataset.delta);if(state.cart[id]<=0)delete state.cart[id];save();renderCount();cartModal()});
    $("checkout").onclick=()=>{if(!state.user){closeModal();accountModal();toast("Sign in to continue");return}openModal(`<h2 id="modal-title">Order inquiry</h2><p>Order inquiries are not submitted to a server in this demo.</p><div class="notice">Estimated cart total: ${money(total)}. No payment will be taken here.</div><button class="wide-button" id="done-inquiry">Got it</button>`);$("done-inquiry").onclick=()=>{state.cart={};save();renderCount();closeModal();toast("Demo inquiry complete")};
  }
  function canPost(){if(!state.user)return false;if(state.user.role==="Owner")return true;const a=state.admins.find(x=>x.email===state.user.email);return !!a&&!state.ownerControls[state.user.email]&&new Date(a.endsAt)>new Date()}
  function sellerModal(){
    if(!state.user){accountModal();toast("Sign in first");return}
    if(state.user.role==="Customer"){openModal(`<h2 id="modal-title">Seller access</h2><p>Seller posting is for approved Admin accounts.</p><div class="notice">In this demo, Admin approval and the three-month free period must be assigned by an Owner. Contact the marketplace Owner to request access.</div>`);return}
    if(state.user.role==="Owner"){ownerModal();return}
    if(!canPost()){openModal(`<h2 id="modal-title">Posting paused</h2><p>Your posting permission is currently disabled or your free period has ended.</p><div class="notice">Contact the Owner to request access or renewal. No payment is collected in this app.</div>`);return}
    openModal(`<h2 id="modal-title">Post a product</h2><p>Share the details buyers need. Add up to 10 image URLs.</p><form id="product-form">${inputField("Product title","prod-title","A clear, descriptive title")}${inputField("Price (৳)","prod-price","0","number")}<div class="field"><label for="prod-category">Category</label><select id="prod-category"><option>Electronics</option><option>Fashion</option><option>Home</option><option>Beauty</option><option>Other</option></select></div><div class="field"><label for="prod-desc">Description</label><textarea id="prod-desc" required placeholder="Describe the product, condition, size, or key details"></textarea></div><div class="field"><label for="prod-images">Image URLs (up to 10, one per line)</label><textarea id="prod-images" placeholder="https://…"></textarea></div><button class="wide-button">Publish product</button></form><div class="notice">Ratings and reviews are shown on products. Buyer-submitted review verification requires a backend.</div>`);
    $("product-form").onsubmit=e=>{e.preventDefault();const title=$("prod-title").value.trim(),price=Number($("prod-price").value),urls=$("prod-images").value.split(/\n/).map(s=>s.trim()).filter(Boolean).slice(0,10);if(!title||price<=0){toast("Enter a title and valid price");return}if(urls.some(u=>!/^https?:\/\//i.test(u))){toast("Use valid http(s) image URLs");return}state.products.unshift({id:"u"+Date.now(),title,price,category:$("prod-category").value,description:$("prod-desc").value,images:urls,image:urls[0]||"",rating:0,reviews:0,tag:"Seller post",owner:state.user.email});save();closeModal();renderProducts();toast("Product posted in this demo")};
  }
  function ownerModal(){
    const admins=state.admins;
    openModal(`<h2 id="modal-title">Owner control center</h2><p>Manage approved sellers and posting access.</p><div class="notice">Owner email allowlisting in this file is for demo display only. Production access must be enforced by the server.</div><form id="admin-form">${inputField("Admin email","admin-email","seller@example.com","email")}${inputField("Free period ends (date)","admin-end","","date")}<button class="wide-button">Add / update admin</button></form><div style="margin-top:18px"><h3>Approved admins</h3>${admins.length?admins.map(a=>`<div class="seller-only"><h3>${esc(a.email)}</h3><p>Free period ends: ${new Date(a.endsAt).toLocaleDateString()}</p><button class="secondary-button" data-toggle="${esc(a.email)}">${state.ownerControls[a.email]?"Enable posting":"Disable posting"}</button> <button class="secondary-button" data-remove="${esc(a.email)}">Remove</button></div>`).join(""):`<p>No admins added yet.</p>`}</div>`);
    $("admin-form").onsubmit=e=>{e.preventDefault();const email=$("admin-email").value.trim().toLowerCase(),end=$("admin-end").value;if(!email||!end){toast("Enter email and end date");return}state.admins=state.admins.filter(a=>a.email!==email);state.admins.push({email,endsAt:new Date(end+"T23:59:59").toISOString()});delete state.ownerControls[email];save();ownerModal();toast("Admin updated")};
    $("modal").querySelectorAll("[data-toggle]").forEach(b=>b.onclick=()=>{const e=b.dataset.toggle;state.ownerControls[e]=!state.ownerControls[e];save();ownerModal()});
    $("modal").querySelectorAll("[data-remove]").forEach(b=>b.onclick=()=>{state.admins=state.admins.filter(a=>a.email!==b.dataset.remove);delete state.ownerControls[b.dataset.remove];save();ownerModal()});
  }
  function messagingModal(){
    if(!state.user){accountModal();return}
    openModal(`<h2 id="modal-title">Messages</h2><p>Contact an admin about a product or order.</p><div id="message-list">${state.messages.filter(m=>m.from===state.user.email||m.to===state.user.email).map(m=>`<div class="seller-only"><b>${esc(m.from)}</b><p>${esc(m.body)}</p></div>`).join("")||"<p>No messages yet.</p>"}</div><form id="message-form">${inputField("Admin email","msg-to","admin@example.com","email")}<div class="field"><label for="msg-body">Message</label><textarea id="msg-body" required placeholder="Write your message…"></textarea></div><button class="wide-button">Send message</button></form><div class="notice">Messages stay in this browser demo and are not delivered. Use a backend for real-time messaging.</div>`);
    $("message-form").onsubmit=e=>{e.preventDefault();state.messages.push({from:state.user.email,to:$("msg-to").value.trim().toLowerCase(),body:$("msg-body").value.trim(),at:Date.now()});save();messagingModal();toast("Saved locally in this demo")};
  }
  function whatsapp(){if(!/^880\d{9,10}$/.test(WHATSAPP_NUMBER)){toast("WhatsApp contact is not configured yet");return}window.open(`https://wa.me/${WHATSAPP_NUMBER}`,"_blank","noopener,noreferrer")}
  $("product-grid").addEventListener("click",e=>{const b=e.target.closest("[data-add]");if(!b)return;const id=b.dataset.add;state.cart[id]=(state.cart[id]||0)+1;save();renderCount();toast("Added to your cart")});
  $("search-form").onsubmit=e=>{e.preventDefault();searchTerm=$("search-input").value.trim();renderProducts();$("products").scrollIntoView({behavior:"smooth"})};
  $("search-input").addEventListener("input",()=>{searchTerm=$("search-input").value.trim();renderProducts()});
  document.querySelectorAll("[data-category]").forEach(b=>b.onclick=()=>{activeCategory=b.dataset.category;document.querySelectorAll("[data-category]").forEach(x=>x.classList.toggle("active",x===b));renderProducts()});
  $("clear-filters").onclick=()=>{activeCategory="All";searchTerm="";$("search-input").value="";document.querySelectorAll("[data-category]").forEach(x=>x.classList.toggle("active",x.dataset.category==="All"));renderProducts()};
  $("account-button").onclick=accountModal;$("cart-button").onclick=cartModal;$("seller-plus").onclick=sellerModal;$("whatsapp-button").onclick=whatsapp;
  $("modal-close").onclick=closeModal;$("modal-backdrop").addEventListener("click",e=>{if(e.target===$("modal-backdrop"))closeModal()});document.addEventListener("keydown",e=>{if(e.key==="Escape")closeModal()});
  document.querySelectorAll("[data-nav]").forEach(b=>b.onclick=()=>{document.querySelectorAll("[data-nav]").forEach(x=>x.classList.toggle("selected",x===b));({home:()=>window.scrollTo({top:0,behavior:"smooth"}),search:()=>{$("search-input").focus();window.scrollTo({top:0,behavior:"smooth"})},cart:cartModal,account:accountModal})[b.dataset.nav]?.()});
  renderProducts();renderCount();
})();