/* ============ Utilities ========= */
const $ = (sel, parent=document) => parent.querySelector(sel);
const $$ = (sel, parent=document) => [...parent.querySelectorAll(sel)];

const money = (n) => `₹${n.toLocaleString("en-IN")}`;

/* ============ Navbar =========== */
const hamburger = $("#hamburger");
const navLinks = $("#navLinks");
hamburger.addEventListener("click", () => navLinks.classList.toggle("show"));
$$(".nav-links a").forEach(a => a.addEventListener("click", ()=> navLinks.classList.remove("show")));

/* ============ Reveal on scroll (animations) ========== */
const ob = new IntersectionObserver((entries)=>{
  entries.forEach(e=>{
    if(e.isIntersecting){ e.target.classList.add("show"); ob.unobserve(e.target); }
  });
},{threshold:.15});
$$(".reveal").forEach(el=> ob.observe(el));

/* ============ Year in footer =========== */
$("#year").textContent = new Date().getFullYear();

/* ============ Menu Data =========== */
const MENU_ITEMS = [
  // id, name, price, category, img
  {id:"paneer-tikka", name:"Paneer Tikka", price:220, cat:"veg", img:"images/paneer-tikka.jpg"},
  {id:"veg-biryani", name:"Veg Biryani", price:190, cat:"veg", img:"images/veg-biryani.jpg"},
  {id:"masala-dosa", name:"Masala Dosa", price:120, cat:"veg", img:"images/masala-dosa.jpg"},
  {id:"chicken-biryani", name:"Chicken Biryani", price:260, cat:"non-veg", img:"images/chicken-biryani.jpg"},
  {id:"butter-chicken", name:"Butter Chicken", price:280, cat:"non-veg", img:"images/butter-chicken.jpg"},
  {id:"mutton-korma", name:"Mutton Korma", price:340, cat:"non-veg", img:"images/mutton-korma.jpg"},
  {id:"thali", name:"South Indian Thali", price:200, cat:"veg", img:"images/thali.jpg"},
  {id:"tandoori-roti", name:"Tandoori Roti", price:25, cat:"veg", img:"images/roti.jpg"},
  {id:"jeera-rice", name:"Jeera Rice", price:120, cat:"veg", img:"images/jeera-rice.jpg"},
  {id:"lassi", name:"Sweet Lassi", price:80, cat:"drinks", img:"images/lassi.jpg"},
  {id:"lime-soda", name:"Lime Soda", price:60, cat:"drinks", img:"images/lime-soda.jpg"},
  {id:"filter-coffee", name:"Filter Coffee", price:70, cat:"drinks", img:"images/coffee.jpg"},
];

/* ============ Render Menu Grid =========== */
const menuGrid = $("#menuGrid");
function createCard(item){
  const card = document.createElement("div");
  card.className = "card";
  card.dataset.cat = item.cat;

  card.innerHTML = `
    <div class="card-img">
      <img src="${item.img}" alt="${item.name}" onerror="this.src='https://picsum.photos/seed/${item.id}/600/400'">
    </div>
    <div class="card-body">
      <div class="card-row">
        <h3>${item.name}</h3>
        <div class="price">${money(item.price)}</div>
      </div>
      <div class="add">
        <div class="qty">
          <button class="dec" aria-label="decrease">−</button>
          <span class="q">1</span>
          <button class="inc" aria-label="increase">+</button>
        </div>
        <button class="btn primary add-btn">Add to Cart</button>
      </div>
    </div>
  `;

  const qEl = $(".q", card);
  let qty = 1;
  $(".inc", card).addEventListener("click", ()=>{ qty++; qEl.textContent = qty; });
  $(".dec", card).addEventListener("click", ()=>{ qty = Math.max(1, qty-1); qEl.textContent = qty; });
  $(".add-btn", card).addEventListener("click", ()=> addToCart(item, qty));

  return card;
}
function renderMenu(items=MENU_ITEMS){
  menuGrid.innerHTML = "";
  items.forEach(i => menuGrid.appendChild(createCard(i)));
}
renderMenu();

/* ============ Filters =========== */
$$(".chip").forEach(chip=>{
  chip.addEventListener("click", ()=>{
    $$(".chip").forEach(c=>c.classList.remove("active"));
    chip.classList.add("active");
    const f = chip.dataset.filter;
    if (f === "all") renderMenu(MENU_ITEMS);
    else renderMenu(MENU_ITEMS.filter(i => i.cat === f));
  });
});

/* ============ Cart Logic =========== */
let cart = JSON.parse(localStorage.getItem("sangam_cart") || "[]"); // [{id,name,price,qty,img}]
const cartList = $("#cartList");
const subtotalEl = $("#subtotal");
const taxEl = $("#tax");
const totalEl = $("#total");
const TAX_RATE = 0.05;

function persist(){ localStorage.setItem("sangam_cart", JSON.stringify(cart)); }

function addToCart(item, qty=1){
  const found = cart.find(c => c.id === item.id);
  if(found) found.qty += qty;
  else cart.push({id:item.id, name:item.name, price:item.price, qty, img:item.img});
  persist(); renderCart();
  // Smooth scroll to Order section (optional UX)
  document.querySelector("#order").scrollIntoView({behavior:"smooth"});
}

function updateQty(id, delta){
  const it = cart.find(c => c.id === id);
  if(!it) return;
  it.qty += delta;
  if(it.qty <= 0) cart = cart.filter(c => c.id !== id);
  persist(); renderCart();
}

function removeItem(id){
  cart = cart.filter(c => c.id !== id);
  persist(); renderCart();
}

function totals(){
  const sub = cart.reduce((s,i)=> s + i.price * i.qty, 0);
  const tax = Math.round(sub * TAX_RATE);
  const tot = sub + tax;
  return {sub, tax, tot};
}

function renderCart(){
  if(cart.length === 0){
    cartList.innerHTML = `<div class="cart-empty">Your cart is empty. Add some yum from the Menu!</div>`;
  }else{
    cartList.innerHTML = "";
    cart.forEach(it=>{
      const row = document.createElement("div");
      row.className = "cart-item";
      row.innerHTML = `
        <div class="cart-img"><img src="${it.img}" alt="${it.name}" onerror="this.src='https://picsum.photos/seed/${it.id}/200/200'"></div>
        <div class="cart-name">${it.name}</div>
        <div class="cart-price">${money(it.price)}</div>
        <div class="cart-qty">
          <button aria-label="minus">−</button>
          <span>${it.qty}</span>
          <button aria-label="plus">+</button>
        </div>
        <button class="remove" title="Remove"><i class="fa-solid fa-trash"></i></button>
      `;
      const [minus, plus] = $$(".cart-qty button", row);
      minus.addEventListener("click", ()=> updateQty(it.id, -1));
      plus.addEventListener("click", ()=> updateQty(it.id, +1));
      $(".remove", row).addEventListener("click", ()=> removeItem(it.id));
      cartList.appendChild(row);
    });
  }
  const {sub, tax, tot} = totals();
  subtotalEl.textContent = money(sub);
  taxEl.textContent = money(tax);
  totalEl.textContent = money(tot);
}
renderCart();

$("#placeOrder").addEventListener("click", ()=>{
  if(cart.length === 0){
    alert("Your cart is empty.");
    return;
  }
  const {tot} = totals();
  alert(`Thank you! Your order for ${money(tot)} has been placed.\n(Prototype demo)`);
  cart = []; persist(); renderCart();
});

/* ============ Reviews =========== */
const reviewList = $("#reviewList");
const defaultReviews = [
  {name:"Aarav", stars:5, msg:"Delicious food and warm hospitality. The biryani is a must-try!"},
  {name:"Meera", stars:4, msg:"Loved the thali! Great value for money and quick service."},
  {name:"Rahul", stars:5, msg:"Authentic flavors. Butter chicken was outstanding!"}
];
function starHTML(n){
  return `<span class="stars">${"★".repeat(n)}${"☆".repeat(5-n)}</span>`;
}
function reviewCard({name, stars=5, msg}){
  const div = document.createElement("div");
  div.className = "review-card";
  const initials = (name||"G").slice(0,1).toUpperCase();
  div.innerHTML = `
    <div class="meta">
      <div class="avatar">${initials}</div>
      <div><strong>${escapeHTML(name)}</strong><br>${starHTML(stars)}</div>
    </div>
    <p>${escapeHTML(msg)}</p>
  `;
  return div;
}
function renderReviews(arr){
  reviewList.innerHTML = "";
  arr.forEach(r => reviewList.appendChild(reviewCard(r)));
}
renderReviews(defaultReviews);

/* ============ Review Form =========== */
const reviewForm = $("#reviewForm");
reviewForm.addEventListener("submit", (e)=>{
  e.preventDefault();
  const name = $("#revName").value.trim();
  const email = $("#revEmail").value.trim();
  const msg = $("#revMsg").value.trim();
  if(!name || !email || !msg){ alert("Please fill all fields."); return; }
  defaultReviews.unshift({name, stars:5, msg});
  renderReviews(defaultReviews);
  reviewForm.reset();
  alert("Thanks for your review!");
});

/* ============ Helpers =========== */
function escapeHTML(str){
  return str.replace(/[&<>"']/g, m => ({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"
  }[m]));
}
