/* Wali World storefront — minimal JS cart + filtering
   Checkout is a placeholder; Stripe-ready wiring can be added later.
*/

const STATE = {
  products: [],
  currency: 'USD',
  cart: {}, // id -> qty
};

const qs = (sel, root=document) => root.querySelector(sel);
const qsa = (sel, root=document) => Array.from(root.querySelectorAll(sel));

function money(n){
  try {
    return new Intl.NumberFormat(undefined, {style:'currency', currency: STATE.currency}).format(n);
  } catch (e){
    return `$${Number(n).toFixed(2)}`;
  }
}

function loadCart(){
  try{
    const raw = localStorage.getItem('wali_cart_v1');
    STATE.cart = raw ? JSON.parse(raw) : {};
  }catch{ STATE.cart = {}; }
}
function saveCart(){
  localStorage.setItem('wali_cart_v1', JSON.stringify(STATE.cart));
}

function cartCount(){
  return Object.values(STATE.cart).reduce((a,b)=>a+Number(b||0), 0);
}

function cartSubtotal(){
  const map = new Map(STATE.products.map(p => [p.id, p]));
  let sum = 0;
  for (const [id, qty] of Object.entries(STATE.cart)){
    const p = map.get(id);
    if (p) sum += p.price * Number(qty||0);
  }
  return sum;
}

function setCartCountUI(){
  const el = qs('#cartCount');
  if (!el) return;
  const c = cartCount();
  el.textContent = String(c);
  el.style.display = c ? 'grid' : 'none';
}

function addToCart(id, qty=1){
  STATE.cart[id] = (Number(STATE.cart[id]||0) + Number(qty||1));
  if (STATE.cart[id] <= 0) delete STATE.cart[id];
  saveCart();
  setCartCountUI();
  renderCartDrawer();
}

function setQty(id, qty){
  const q = Math.max(0, Math.min(99, Number(qty||0)));
  if (q === 0) delete STATE.cart[id];
  else STATE.cart[id] = q;
  saveCart();
  setCartCountUI();
  renderCartDrawer();
}

function renderProducts(list){
  const grid = qs('#productsGrid');
  if (!grid) return;
  grid.innerHTML = '';

  list.forEach(p => {
    const card = document.createElement('article');
    card.className = 'product';
    card.innerHTML = `
      <div class="product__img" aria-hidden="true">
        <img src="${p.image}" alt="" loading="lazy" decoding="async" />
      </div>
      <div class="product__body">
        <div class="product__top">
          <div style="min-width:0;">
            <p class="product__name">${escapeHtml(p.name)}</p>
            <div class="product__meta">${escapeHtml(p.category)} • <span class="product__price">${money(p.price)}</span></div>
          </div>
          ${p.badge ? `<span class="badge">${escapeHtml(p.badge)}</span>` : ''}
        </div>

        <div class="rating" aria-label="Rating">
          <span aria-hidden="true">★★★★★</span>
          <b>${Number(p.rating).toFixed(1)}</b>
          <span>(${Number(p.reviews||0)})</span>
        </div>

        <div class="product__actions">
          <button class="btn btn--primary btn--pill" data-add="${p.id}">Add to cart</button>
          <button class="btn btn--ghost btn--pill" data-view="${p.id}">Details</button>
        </div>
      </div>
    `;
    grid.appendChild(card);
  });

  qsa('[data-add]').forEach(btn => {
    btn.addEventListener('click', () => {
      addToCart(btn.getAttribute('data-add'), 1);
      openDrawer();
    });
  });

  qsa('[data-view]').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-view');
      const p = STATE.products.find(x => x.id === id);
      if (p) openProductModal(p);
    });
  });
}

function escapeHtml(s){
  return String(s||'')
    .replaceAll('&','&amp;')
    .replaceAll('<','&lt;')
    .replaceAll('>','&gt;')
    .replaceAll('"','&quot;')
    .replaceAll("'",'&#39;');
}

function uniqueCategories(){
  return Array.from(new Set(STATE.products.map(p=>p.category))).sort();
}

function initFilters(){
  const cat = qs('#filterCategory');
  if (cat){
    cat.innerHTML = '<option value="">All categories</option>' +
      uniqueCategories().map(c => `<option value="${escapeHtml(c)}">${escapeHtml(c)}</option>`).join('');
  }

  const apply = () => {
    const catVal = (qs('#filterCategory')?.value || '').trim();
    const sortVal = (qs('#filterSort')?.value || 'featured').trim();
    const priceVal = (qs('#filterPrice')?.value || '').trim();

    let out = [...STATE.products];

    if (catVal) out = out.filter(p => p.category === catVal);

    if (priceVal){
      const [lo, hi] = priceVal.split('-').map(x => Number(x));
      out = out.filter(p => {
        const pr = Number(p.price);
        if (!isFinite(pr)) return false;
        if (isFinite(lo) && pr < lo) return false;
        if (isFinite(hi) && pr > hi) return false;
        return true;
      });
    }

    if (sortVal === 'price-asc') out.sort((a,b)=>a.price-b.price);
    if (sortVal === 'price-desc') out.sort((a,b)=>b.price-a.price);
    if (sortVal === 'rating') out.sort((a,b)=>b.rating-a.rating);

    renderProducts(out);
  };

  qsa('#filterCategory,#filterSort,#filterPrice').forEach(el => el?.addEventListener('change', apply));
  apply();
}

/* Drawer */
function openDrawer(){
  qs('#drawerBackdrop')?.classList.add('is-open');
  qs('#cartDrawer')?.classList.add('is-open');
}
function closeDrawer(){
  qs('#drawerBackdrop')?.classList.remove('is-open');
  qs('#cartDrawer')?.classList.remove('is-open');
}

function renderCartDrawer(){
  const body = qs('#cartItems');
  const subtotalEl = qs('#cartSubtotal');
  if (!body || !subtotalEl) return;

  const map = new Map(STATE.products.map(p => [p.id, p]));
  body.innerHTML = '';

  const ids = Object.keys(STATE.cart);
  if (!ids.length){
    body.innerHTML = `<div class="card card--glass"><b>Your cart is empty.</b><div style="margin-top:8px; color: rgba(255,255,255,0.72);">Add a few items from the shop to get started.</div></div>`;
    subtotalEl.textContent = money(0);
    return;
  }

  ids.forEach(id => {
    const p = map.get(id);
    if (!p) return;
    const qty = Number(STATE.cart[id]||0);
    const row = document.createElement('div');
    row.className = 'cartitem';
    row.innerHTML = `
      <img src="${p.image}" alt="" aria-hidden="true" />
      <div class="cartitem__meta">
        <p class="cartitem__title">${escapeHtml(p.name)}</p>
        <div class="cartitem__sub">${escapeHtml(p.category)} • ${money(p.price)}</div>
      </div>
      <div class="cartitem__qty" aria-label="Quantity">
        <button class="qtybtn" data-dec="${id}" aria-label="Decrease quantity">−</button>
        <b style="min-width:18px; text-align:center;">${qty}</b>
        <button class="qtybtn" data-inc="${id}" aria-label="Increase quantity">+</button>
      </div>
    `;
    body.appendChild(row);
  });

  qsa('[data-inc]').forEach(b => b.addEventListener('click', ()=> addToCart(b.getAttribute('data-inc'), 1)));
  qsa('[data-dec]').forEach(b => b.addEventListener('click', ()=> addToCart(b.getAttribute('data-dec'), -1)));

  subtotalEl.textContent = money(cartSubtotal());
}

/* Product modal */
function openProductModal(p){
  const modal = qs('#productModal');
  if (!modal) return;
  qs('#pmTitle').textContent = p.name;
  qs('#pmDesc').textContent = p.description || '';
  qs('#pmPrice').textContent = money(p.price);
  qs('#pmCategory').textContent = p.category;
  qs('#pmImg').setAttribute('src', p.image);
  qs('#pmAdd').setAttribute('data-add', p.id);
  modal.showModal();
}

function initModal(){
  const modal = qs('#productModal');
  if (!modal) return;
  qs('#pmClose')?.addEventListener('click', ()=> modal.close());
  qs('#pmAdd')?.addEventListener('click', (e)=>{
    const id = e.currentTarget.getAttribute('data-add');
    addToCart(id, 1);
    modal.close();
    openDrawer();
  });
}

/* Smooth anchors */
function initAnchors(){
  qsa('a[href^="#"]').forEach(a => {
    a.addEventListener('click', (e)=>{
      const href = a.getAttribute('href');
      if (!href || href === '#') return;
      const t = qs(href);
      if (!t) return;
      e.preventDefault();
      history.pushState(null, '', href);
      t.scrollIntoView({behavior:'smooth', block:'start'});
    });
  });
}

async function boot(){
  loadCart();
  setCartCountUI();

  qs('#openCart')?.addEventListener('click', (e)=>{ e.preventDefault(); openDrawer(); });
  qs('#drawerBackdrop')?.addEventListener('click', closeDrawer);
  qs('#closeDrawer')?.addEventListener('click', closeDrawer);
  document.addEventListener('keydown', (e)=>{ if (e.key === 'Escape') closeDrawer(); });

  initAnchors();
  initModal();

  // Load products (used for Shop page + cart rendering across all pages)
  const res = await fetch('./data/products.json', {cache:'no-store'});
  const data = await res.json();
  STATE.products = data.products || [];
  STATE.currency = data.currency || 'USD';

  // Only initialize shop UI if this page has the shop elements
  if (qs('#productsGrid') && qs('#filterCategory') && qs('#filterSort') && qs('#filterPrice')){
    initFilters();
  }

  renderCartDrawer();

  // Checkout button
  qs('#checkoutBtn')?.addEventListener('click', ()=>{
    window.location.href = './checkout.html';
  });
}

boot().catch(err => {
  console.error(err);
  const grid = qs('#productsGrid');
  if (grid) grid.innerHTML = '<div class="card">Failed to load products. Please refresh.</div>';
});

