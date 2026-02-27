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

function discountPct(p){
  const d = Number(p.discountPct);
  if (Number.isFinite(d) && d > 0) return Math.min(90, Math.max(5, d));
  return 50; // demo default
}

function compareAt(price, pct){
  const p = Number(price);
  const d = Number(pct);
  if (!Number.isFinite(p) || !Number.isFinite(d) || d <= 0) return null;
  return Math.round((p / (1 - d/100)) * 100) / 100;
}

function productCardHTML(p){
  const pct = discountPct(p);
  const cmp = compareAt(p.price, pct);
  return `
    <article class="product">
      <div class="product__img" aria-hidden="true">
        <span class="discount">${pct}%<br/>OFF</span>
        <img src="${p.image}" alt="" loading="lazy" decoding="async" />
      </div>
      <div class="product__body">
        <p class="product__name">${escapeHtml(p.name)}</p>
        <div class="product__meta">${escapeHtml(p.category)}</div>
        <div class="price"><b>${money(p.price)}</b>${cmp ? `<s>${money(cmp)}</s>` : ''}</div>
        <div class="save">Save up to ${money((cmp||p.price) - p.price)}</div>

        <div class="rating" aria-label="Rating">
          <span aria-hidden="true">★★★★★</span>
          <b>${Number(p.rating||0).toFixed(1)}</b>
          <span>(${Number(p.reviews||0)})</span>
        </div>

        <div class="product__actions">
          <button class="btn btn--primary btn--pill" data-add="${p.id}">Add to cart</button>
          <button class="btn btn--ghost btn--pill" data-view="${p.id}">Details</button>
        </div>
      </div>
    </article>
  `;
}

function bindProductActions(rootSel){
  qsa(`${rootSel} [data-add]`).forEach(btn => {
    btn.addEventListener('click', () => {
      addToCart(btn.getAttribute('data-add'), 1);
      openDrawer();
    });
  });

  qsa(`${rootSel} [data-view]`).forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-view');
      const p = STATE.products.find(x => x.id === id);
      if (p) openProductModal(p);
    });
  });
}

function renderProducts(list){
  const grid = qs('#productsGrid');
  if (!grid) return;
  grid.innerHTML = list.map(productCardHTML).join('');
  bindProductActions('#productsGrid');
}

function renderDeals(count=6){
  const el = qs('#dealCarousel');
  if (!el) return;
  const deals = [...STATE.products].slice(0, count);
  el.innerHTML = deals.map(productCardHTML).join('');
  bindProductActions('#dealCarousel');
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

function getQueryParams(){
  const params = new URLSearchParams(window.location.search);
  return {
    cat: (params.get('cat') || '').trim(),
    sort: (params.get('sort') || '').trim(),
    price: (params.get('price') || '').trim(),
    q: (params.get('q') || '').trim(),
  };
}

function setBreadcrumb(cat){
  const wrap = qs('#crumbCat');
  const text = qs('#crumbCatText');
  if (!wrap || !text) return;
  if (!cat){
    wrap.style.display = 'none';
    text.textContent = '';
    return;
  }
  wrap.style.display = 'inline';
  text.textContent = cat;
}

function initFilters(){
  const cat = qs('#filterCategory');
  if (cat){
    cat.innerHTML = '<option value="">All categories</option>' +
      uniqueCategories().map(c => `<option value="${escapeHtml(c)}">${escapeHtml(c)}</option>`).join('');
  }

  // Preselect from URL params (useful for category chips on Home)
  const qp = getQueryParams();
  if (qp.cat && qs('#filterCategory')) qs('#filterCategory').value = qp.cat;
  if (qp.sort && qs('#filterSort')) qs('#filterSort').value = qp.sort;
  if (qp.price && qs('#filterPrice')) qs('#filterPrice').value = qp.price;
  if (qp.q && qs('#filterSearch')) qs('#filterSearch').value = qp.q;

  const apply = () => {
    const catVal = (qs('#filterCategory')?.value || '').trim();
    const sortVal = (qs('#filterSort')?.value || 'featured').trim();
    const priceVal = (qs('#filterPrice')?.value || '').trim();
    const qVal = (qs('#filterSearch')?.value || '').trim().toLowerCase();

    let out = [...STATE.products];

    if (catVal) out = out.filter(p => p.category === catVal);
    setBreadcrumb(catVal);

    if (qVal){
      out = out.filter(p =>
        String(p.name||'').toLowerCase().includes(qVal) ||
        String(p.category||'').toLowerCase().includes(qVal)
      );
    }

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
  qs('#filterSearch')?.addEventListener('input', apply);

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

/* Mobile menu */
function openMenu(){
  qs('#menuBackdrop')?.classList.add('is-open');
  qs('#mobileMenu')?.classList.add('is-open');
}
function closeMenu(){
  qs('#menuBackdrop')?.classList.remove('is-open');
  qs('#mobileMenu')?.classList.remove('is-open');
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

/* Home hero slider */
function initHeroSlider(){
  const root = qs('#heroSlider');
  if (!root) return;

  const k = qs('#heroK');
  const t = qs('#heroT');
  const sub = qs('#heroSub');
  const img = qs('#heroImg');
  const cta1 = qs('#heroCta1');
  const cta2 = qs('#heroCta2');
  const dots = qsa('#heroDots .dot');
  const prevBtn = qs('#heroPrev');
  const nextBtn = qs('#heroNext');

  if (!k || !t || !sub || !img || !cta1 || !cta2 || !dots.length) return;

  const slides = [
    {
      k: 'Best deal online on creator essentials',
      t: 'LEVEL UP YOUR BRAND.',
      sub: 'Shop drops-ready pieces + book a session to plan your next move.',
      img: './assets/product-hoodie.svg',
      cta1: { text: 'Book a Session', href: '#consultation' },
      cta2: { text: 'Browse Shop', href: './shop.html' },
    },
    {
      k: 'New drop: everyday merch that ships fast',
      t: 'DROP DAY READY.',
      sub: 'Tees, hats, and stickers to ship with every order.',
      img: './assets/product-tee.svg',
      cta1: { text: 'Shop Tees', href: './shop.html?cat=Tees' },
      cta2: { text: 'Shop Accessories', href: './shop.html?cat=Accessories' },
    },
    {
      k: 'Coaching + consultations',
      t: 'BUILD A REAL PLAN.',
      sub: 'Book a session and leave with a clear 30‑day game plan.',
      img: './assets/product-mug.svg',
      cta1: { text: 'Book a Session', href: '#consultation' },
      cta2: { text: 'Read FAQ', href: './faq.html' },
    },
  ];

  let idx = 0;
  let timer = null;

  const prefersReduced = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);

  function setActiveDot(i){
    dots.forEach((d, n) => {
      const on = n === i;
      d.classList.toggle('is-on', on);
      d.setAttribute('aria-selected', on ? 'true' : 'false');
      d.tabIndex = on ? 0 : -1;
    });
  }

  function render(i){
    const next = ((i % slides.length) + slides.length) % slides.length;
    idx = next;

    root.classList.add('is-fading');
    window.setTimeout(() => root.classList.remove('is-fading'), 160);

    const s = slides[idx];
    k.textContent = s.k;
    t.textContent = s.t;
    sub.textContent = s.sub;
    img.setAttribute('src', s.img);
    cta1.textContent = s.cta1.text;
    cta1.setAttribute('href', s.cta1.href);
    cta2.textContent = s.cta2.text;
    cta2.setAttribute('href', s.cta2.href);

    setActiveDot(idx);
  }

  function next(){ render(idx + 1); }
  function prev(){ render(idx - 1); }

  dots.forEach(d => {
    d.addEventListener('click', () => {
      const n = Number(d.getAttribute('data-slide'));
      if (Number.isFinite(n)) render(n);
      restart();
    });

    d.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') { e.preventDefault(); prev(); restart(); }
      if (e.key === 'ArrowRight') { e.preventDefault(); next(); restart(); }
    });
  });

  prevBtn?.addEventListener('click', () => { prev(); restart(); });
  nextBtn?.addEventListener('click', () => { next(); restart(); });

  // Simple swipe on mobile
  let startX = null;
  root.addEventListener('touchstart', (e) => {
    startX = e.touches?.[0]?.clientX ?? null;
  }, {passive:true});
  root.addEventListener('touchend', (e) => {
    const endX = e.changedTouches?.[0]?.clientX ?? null;
    if (startX == null || endX == null) return;
    const dx = endX - startX;
    if (Math.abs(dx) > 40) (dx < 0 ? next() : prev());
    restart();
    startX = null;
  });

  function stop(){
    if (timer) window.clearInterval(timer);
    timer = null;
  }

  function start(){
    if (prefersReduced) return;
    stop();
    timer = window.setInterval(next, 6500);
  }

  function restart(){
    stop();
    start();
  }

  root.addEventListener('mouseenter', stop);
  root.addEventListener('mouseleave', start);
  root.addEventListener('focusin', stop);
  root.addEventListener('focusout', start);

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stop();
    else start();
  });

  render(0);
  start();
}

async function boot(){
  initHeroSlider();
  loadCart();
  setCartCountUI();

  qs('#openCart')?.addEventListener('click', (e)=>{ e.preventDefault(); openDrawer(); });
  qs('#drawerBackdrop')?.addEventListener('click', closeDrawer);
  qs('#closeDrawer')?.addEventListener('click', closeDrawer);

  qs('#openMenu')?.addEventListener('click', (e)=>{ e.preventDefault(); openMenu(); });
  qs('#menuBackdrop')?.addEventListener('click', closeMenu);
  qs('#closeMenu')?.addEventListener('click', closeMenu);
  qsa('#mobileMenu a').forEach(a => a.addEventListener('click', closeMenu));

  document.addEventListener('keydown', (e)=>{
    if (e.key === 'Escape') { closeDrawer(); closeMenu(); }
  });

  initAnchors();
  initModal();

  // Load products (Supabase Option B if configured, otherwise local JSON)
  let data = null;
  if (window.waliSupabase?.hasSupabaseConfig?.()){
    data = await window.waliSupabase.supabaseFetchProducts();
  }

  if (!data){
    const res = await fetch('./data/products.json', {cache:'no-store'});
    data = await res.json();
  }

  STATE.products = data.products || [];
  STATE.currency = data.currency || 'USD';

  // Keep nav search input in sync with URL query
  const qp = getQueryParams();
  if (qp.q && qs('#navSearch')) qs('#navSearch').value = qp.q;

  // Only initialize shop UI if this page has the shop elements
  if (qs('#productsGrid') && qs('#filterCategory') && qs('#filterSort') && qs('#filterPrice')){
    initFilters();
  }

  // Home page: render deals carousel if present
  renderDeals(6);

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

