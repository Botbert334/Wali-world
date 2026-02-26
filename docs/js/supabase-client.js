// Minimal Supabase client wrapper (CDN + window globals)

function hasSupabaseConfig(){
  return !!(window.SUPABASE_URL && window.SUPABASE_ANON_KEY);
}

function getSupabase(){
  if (!hasSupabaseConfig()) return null;
  if (!window.supabase || !window.supabase.createClient){
    console.warn('Supabase CDN not loaded');
    return null;
  }
  return window.supabase.createClient(window.SUPABASE_URL, window.SUPABASE_ANON_KEY);
}

async function supabaseFetchProducts(){
  const client = getSupabase();
  if (!client) return null;

  // Expect table: public.products with at least: id, name, category, price, rating, reviews, image, description, discount_pct
  const { data, error } = await client
    .from('products')
    .select('id,name,category,price,rating,reviews,badge,image,description,discount_pct')
    .order('name', { ascending: true });

  if (error){
    console.warn('Supabase products error:', error);
    return null;
  }

  return {
    currency: 'USD',
    products: (data || []).map((p) => ({
      id: p.id,
      name: p.name,
      category: p.category,
      price: Number(p.price),
      rating: Number(p.rating || 0),
      reviews: Number(p.reviews || 0),
      badge: p.badge || "",
      image: p.image || "./assets/product-tee.svg",
      description: p.description || "",
      discountPct: Number(p.discount_pct || 50),
    })),
  };
}

async function supabaseInsertConsultation(payload){
  const client = getSupabase();
  if (!client) return { ok: false, error: 'Supabase not configured' };

  const { error } = await client
    .from('consult_requests')
    .insert([payload]);

  if (error){
    return { ok: false, error: error.message || String(error) };
  }
  return { ok: true };
}

window.waliSupabase = {
  hasSupabaseConfig,
  supabaseFetchProducts,
  supabaseInsertConsultation,
};
