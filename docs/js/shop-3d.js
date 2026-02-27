// Advanced 3D Shop Features with Babylon.js

// Initialize Babylon.js Scene for Hero
let heroEngine, heroScene, heroCamera;

document.addEventListener('DOMContentLoaded', () => {
    initBabylon3DShowcase();
    initProductCards3D();
    initCartSidebar();
    initFiltersAndSort();
    initInfiniteScroll();
});

// Babylon.js 3D Product Showcase
function initBabylon3DShowcase() {
    const canvas = document.getElementById('babylonCanvas');
    if (!canvas || typeof BABYLON === 'undefined') return;
    
    // Create engine and scene
    heroEngine = new BABYLON.Engine(canvas, true, { preserveDrawingBuffer: true, stencil: true });
    heroScene = new BABYLON.Scene(heroEngine);
    heroScene.clearColor = new BABYLON.Color4(0, 0, 0, 0); // Transparent background
    
    // Create camera
    heroCamera = new BABYLON.ArcRotateCamera(
        'heroCamera',
        Math.PI / 2,
        Math.PI / 3,
        15,
        new BABYLON.Vector3(0, 0, 0),
        heroScene
    );
    heroCamera.attachControl(canvas, true);
    heroCamera.lowerRadiusLimit = 5;
    heroCamera.upperRadiusLimit = 30;
    
    // Lighting
    const light1 = new BABYLON.HemisphericLight('light1', new BABYLON.Vector3(1, 1, 0), heroScene);
    light1.intensity = 0.7;
    
    const light2 = new BABYLON.DirectionalLight('light2', new BABYLON.Vector3(-1, -2, -1), heroScene);
    light2.position = new BABYLON.Vector3(20, 40, 20);
    light2.intensity = 0.5;
    
    // Create showcase products
    createShowcaseProducts();
    
    // Animation
    heroScene.registerBeforeRender(() => {
        // Auto-rotate camera
        heroCamera.alpha += 0.003;
    });
    
    // Render loop
    heroEngine.runRenderLoop(() => {
        heroScene.render();
    });
    
    // Handle resize
    window.addEventListener('resize', () => {
        heroEngine.resize();
    });
}

// Create 3D Showcase Products
function createShowcaseProducts() {
    // Create floating product boxes
    const products = [
        { position: new BABYLON.Vector3(-3, 0, 0), color: new BABYLON.Color3(0.39, 0.4, 0.95) },
        { position: new BABYLON.Vector3(3, 0, 0), color: new BABYLON.Color3(0.93, 0.29, 0.6) },
        { position: new BABYLON.Vector3(0, 0, -3), color: new BABYLON.Color3(0.06, 0.73, 0.51) },
        { position: new BABYLON.Vector3(0, 0, 3), color: new BABYLON.Color3(0.96, 0.64, 0.15) }
    ];
    
    products.forEach((productData, index) => {
        // Create product box
        const box = BABYLON.MeshBuilder.CreateBox(`product${index}`, { size: 2 }, heroScene);
        box.position = productData.position;
        
        // Create material
        const material = new BABYLON.PBRMaterial(`material${index}`, heroScene);
        material.albedoColor = productData.color;
        material.metallic = 0.3;
        material.roughness = 0.4;
        material.emissiveColor = productData.color.scale(0.2);
        box.material = material;
        
        // Add floating animation
        BABYLON.Animation.CreateAndStartAnimation(
            `float${index}`,
            box,
            'position.y',
            30,
            30,
            0,
            2,
            BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE,
            new BABYLON.SineEase()
        );
        
        // Add rotation animation
        BABYLON.Animation.CreateAndStartAnimation(
            `rotate${index}`,
            box,
            'rotation.y',
            30,
            60,
            0,
            Math.PI * 2,
            BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE
        );
    });
    
    // Add particle system for ambiance
    createParticleSystem();
}

// Particle System for Visual Effects
function createParticleSystem() {
    const particleSystem = new BABYLON.ParticleSystem('particles', 2000, heroScene);
    particleSystem.particleTexture = new BABYLON.Texture('https://raw.githubusercontent.com/BabylonJS/Babylon.js/master/assets/textures/flare.png', heroScene);
    
    particleSystem.emitter = new BABYLON.Vector3(0, 0, 0);
    particleSystem.minEmitBox = new BABYLON.Vector3(-10, -10, -10);
    particleSystem.maxEmitBox = new BABYLON.Vector3(10, 10, 10);
    
    particleSystem.color1 = new BABYLON.Color4(0.7, 0.8, 1.0, 1.0);
    particleSystem.color2 = new BABYLON.Color4(0.2, 0.5, 1.0, 1.0);
    
    particleSystem.minSize = 0.1;
    particleSystem.maxSize = 0.5;
    
    particleSystem.minLifeTime = 0.3;
    particleSystem.maxLifeTime = 1.5;
    
    particleSystem.emitRate = 100;
    
    particleSystem.blendMode = BABYLON.ParticleSystem.BLENDMODE_ONEONE;
    
    particleSystem.gravity = new BABYLON.Vector3(0, -0.981, 0);
    
    particleSystem.direction1 = new BABYLON.Vector3(-7, 8, 3);
    particleSystem.direction2 = new BABYLON.Vector3(7, 8, -3);
    
    particleSystem.minAngularSpeed = 0;
    particleSystem.maxAngularSpeed = Math.PI;
    
    particleSystem.minEmitPower = 1;
    particleSystem.maxEmitPower = 3;
    particleSystem.updateSpeed = 0.005;
    
    particleSystem.start();
}

// Initialize 3D Product Cards
function initProductCards3D() {
    loadProducts();
    
    // Add 3D view button handler
    document.addEventListener('click', (e) => {
        if (e.target.closest('.view-3d-btn')) {
            const productId = e.target.closest('.view-3d-btn').dataset.productId;
            open3DViewer(productId);
        }
    });
}

// Load Products with Animations
function loadProducts(category = 'all', sortBy = 'featured', maxPrice = 1000) {
    const container = document.getElementById('productsContainer');
    if (!container) return;
    
    // Sample expanded product data
    const allProducts = [
        {
            id: 1,
            name: "Smart Watch Ultra",
            price: 599.99,
            image: "https://source.unsplash.com/400x400/?smartwatch,tech",
            category: "electronics",
            rating: 4.8,
            badge: "New"
        },
        {
            id: 2,
            name: "Designer Jacket",
            price: 299.99,
            image: "https://source.unsplash.com/400x400/?jacket,fashion",
            category: "fashion",
            rating: 4.5,
            badge: "Hot"
        },
        {
            id: 3,
            name: "Coffee Machine Pro",
            price: 249.99,
            image: "https://source.unsplash.com/400x400/?coffee,machine",
            category: "home",
            rating: 4.6,
            badge: null
        },
        {
            id: 4,
            name: "Running Shoes Elite",
            price: 189.99,
            image: "https://source.unsplash.com/400x400/?shoes,running",
            category: "sports",
            rating: 4.7,
            badge: "Sale"
        },
        {
            id: 5,
            name: "Wireless Earbuds Pro",
            price: 249.99,
            image: "https://source.unsplash.com/400x400/?earbuds,wireless",
            category: "electronics",
            rating: 4.9,
            badge: "Premium"
        },
        {
            id: 6,
            name: "Leather Handbag",
            price: 399.99,
            image: "https://source.unsplash.com/400x400/?handbag,leather",
            category: "fashion",
            rating: 4.4,
            badge: null
        },
        {
            id: 7,
            name: "Smart Home Hub",
            price: 149.99,
            image: "https://source.unsplash.com/400x400/?smarthome",
            category: "home",
            rating: 4.3,
            badge: "Smart"
        },
        {
            id: 8,
            name: "Yoga Set Premium",
            price: 99.99,
            image: "https://source.unsplash.com/400x400/?yoga,fitness",
            category: "sports",
            rating: 4.6,
            badge: "Eco"
        }
    ];
    
    // Filter products
    let filteredProducts = category === 'all' 
        ? allProducts 
        : allProducts.filter(p => p.category === category);
    
    filteredProducts = filteredProducts.filter(p => p.price <= maxPrice);
    
    // Sort products
    switch(sortBy) {
        case 'price-low':
            filteredProducts.sort((a, b) => a.price - b.price);
            break;
        case 'price-high':
            filteredProducts.sort((a, b) => b.price - a.price);
            break;
        case 'rating':
            filteredProducts.sort((a, b) => b.rating - a.rating);
            break;
    }
    
    // Clear container with animation
    const existingCards = container.querySelectorAll('.product-card');
    if (existingCards.length > 0) {
        anime({
            targets: existingCards,
            opacity: 0,
            scale: 0.8,
            duration: 300,
            easing: 'easeInQuad',
            complete: () => {
                container.innerHTML = '';
                displayProducts(filteredProducts);
            }
        });
    } else {
        displayProducts(filteredProducts);
    }
}

// Display Products with Stagger Animation
function displayProducts(products) {
    const container = document.getElementById('productsContainer');
    
    products.forEach((product, index) => {
        const card = document.createElement('div');
        card.className = 'product-card';
        card.innerHTML = `
            <div class="product-image-container">
                ${product.badge ? `<span class="product-badge">${product.badge}</span>` : ''}
                <img src="${product.image}" alt="${product.name}" class="product-image">
                <div class="product-overlay">
                    <button class="view-3d-btn" data-product-id="${product.id}">
                        <i class="fas fa-cube"></i> View in 3D
                    </button>
                </div>
            </div>
            <div class="product-info">
                <h3 class="product-title">${product.name}</h3>
                <div class="product-rating">${getStars(product.rating)}</div>
                <div class="product-price">$${product.price.toFixed(2)}</div>
                <button class="add-to-cart-btn" data-product='${JSON.stringify(product)}'>
                    <i class="fas fa-cart-plus"></i> Add to Cart
                </button>
            </div>
        `;
        
        container.appendChild(card);
        
        // Animate card entrance
        anime({
            targets: card,
            opacity: [0, 1],
            translateY: [30, 0],
            scale: [0.9, 1],
            duration: 600,
            delay: index * 50,
            easing: 'easeOutQuad'
        });
    });
    
    // Reinitialize product interactions
    initProductHoverEffects();
}

// Get Star Rating HTML
function getStars(rating) {
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 >= 0.5;
    let stars = '';
    
    for (let i = 0; i < fullStars; i++) {
        stars += '<i class="fas fa-star" style="color: #fbbf24;"></i>';
    }
    if (halfStar) {
        stars += '<i class="fas fa-star-half-alt" style="color: #fbbf24;"></i>';
    }
    
    return stars + ` <span style="color: #666; font-size: 0.875rem;">(${rating})</span>`;
}

// Product Hover Effects
function initProductHoverEffects() {
    document.querySelectorAll('.product-card').forEach(card => {
        card.addEventListener('mouseenter', function() {
            anime({
                targets: this.querySelector('.product-image'),
                scale: 1.1,
                duration: 300,
                easing: 'easeOutQuad'
            });
        });
        
        card.addEventListener('mouseleave', function() {
            anime({
                targets: this.querySelector('.product-image'),
                scale: 1,
                duration: 300,
                easing: 'easeOutQuad'
            });
        });
    });
}

// Open 3D Viewer Modal
function open3DViewer(productId) {
    const modal = document.getElementById('viewer3DModal');
    const canvas = document.getElementById('productCanvas3D');
    
    modal.style.display = 'flex';
    
    // Animate modal appearance
    anime({
        targets: modal,
        opacity: [0, 1],
        duration: 300,
        easing: 'easeOutQuad'
    });
    
    // Initialize 3D product view with Babylon.js
    const engine = new BABYLON.Engine(canvas, true);
    const scene = new BABYLON.Scene(engine);
    
    // Camera
    const camera = new BABYLON.ArcRotateCamera(
        'productCamera',
        Math.PI / 2,
        Math.PI / 3,
        10,
        new BABYLON.Vector3(0, 0, 0),
        scene
    );
    camera.attachControl(canvas, true);
    
    // Lighting
    const light = new BABYLON.HemisphericLight('light', new BABYLON.Vector3(0, 1, 0), scene);
    light.intensity = 0.7;
    
    // Create product mesh (placeholder - would load actual 3D model)
    const product = BABYLON.MeshBuilder.CreateBox('product', { size: 3 }, scene);
    const material = new BABYLON.PBRMaterial('productMat', scene);
    material.albedoColor = new BABYLON.Color3(0.5, 0.5, 0.8);
    material.metallic = 0.4;
    material.roughness = 0.3;
    product.material = material;
    
    // Auto-rotate
    scene.registerBeforeRender(() => {
        product.rotation.y += 0.01;
    });
    
    // Render loop
    engine.runRenderLoop(() => {
        scene.render();
    });
    
    // Close modal
    document.getElementById('viewerClose').onclick = () => {
        modal.style.display = 'none';
        engine.dispose();
    };
    
    // Controls
    document.getElementById('rotateLeft').onclick = () => {
        camera.alpha -= 0.1;
    };
    
    document.getElementById('rotateRight').onclick = () => {
        camera.alpha += 0.1;
    };
    
    document.getElementById('zoomIn').onclick = () => {
        camera.radius -= 1;
    };
    
    document.getElementById('zoomOut').onclick = () => {
        camera.radius += 1;
    };
    
    document.getElementById('resetView').onclick = () => {
        camera.alpha = Math.PI / 2;
        camera.beta = Math.PI / 3;
        camera.radius = 10;
    };
}

// Cart Sidebar Functionality
function initCartSidebar() {
    const cartIcon = document.getElementById('cartIcon');
    const cartSidebar = document.getElementById('cartSidebar');
    const cartClose = document.getElementById('cartClose');
    
    cartIcon.addEventListener('click', () => {
        cartSidebar.classList.add('open');
    });
    
    cartClose.addEventListener('click', () => {
        cartSidebar.classList.remove('open');
    });
    
    // Add to cart functionality
    document.addEventListener('click', (e) => {
        if (e.target.closest('.add-to-cart-btn')) {
            const btn = e.target.closest('.add-to-cart-btn');
            const product = JSON.parse(btn.dataset.product);
            addToCartWithAnimation(product, btn);
        }
    });
}

// Add to Cart with Fly Animation
function addToCartWithAnimation(product, button) {
    // Create flying element
    const productCard = button.closest('.product-card');
    const productImage = productCard.querySelector('.product-image');
    const cartIcon = document.getElementById('cartIcon');
    
    const flyingImg = document.createElement('img');
    flyingImg.src = productImage.src;
    flyingImg.style.position = 'fixed';
    flyingImg.style.width = '100px';
    flyingImg.style.height = '100px';
    flyingImg.style.objectFit = 'cover';
    flyingImg.style.borderRadius = '10px';
    flyingImg.style.zIndex = '10000';
    flyingImg.style.pointerEvents = 'none';
    
    const startRect = productImage.getBoundingClientRect();
    const endRect = cartIcon.getBoundingClientRect();
    
    flyingImg.style.left = startRect.left + 'px';
    flyingImg.style.top = startRect.top + 'px';
    
    document.body.appendChild(flyingImg);
    
    // Animate to cart
    anime({
        targets: flyingImg,
        left: endRect.left + endRect.width / 2 - 50,
        top: endRect.top + endRect.height / 2 - 50,
        width: 30,
        height: 30,
        opacity: [1, 0],
        duration: 800,
        easing: 'easeInOutQuad',
        complete: () => {
            flyingImg.remove();
            updateCart(product);
            
            // Animate cart icon
            anime({
                targets: cartIcon,
                scale: [1, 1.2, 1],
                duration: 300,
                easing: 'easeInOutQuad'
            });
        }
    });
    
    // Button feedback
    button.innerHTML = '<i class="fas fa-check"></i> Added!';
    button.style.background = 'linear-gradient(135deg, #10b981, #34d399)';
    
    setTimeout(() => {
        button.innerHTML = '<i class="fas fa-cart-plus"></i> Add to Cart';
        button.style.background = '';
    }, 2000);
}

// Update Cart
function updateCart(product) {
    let cart = JSON.parse(localStorage.getItem('shopCart')) || [];
    const existingItem = cart.find(item => item.id === product.id);
    
    if (existingItem) {
        existingItem.quantity++;
    } else {
        cart.push({ ...product, quantity: 1 });
    }
    
    localStorage.setItem('shopCart', JSON.stringify(cart));
    updateCartDisplay();
}

// Update Cart Display
function updateCartDisplay() {
    const cart = JSON.parse(localStorage.getItem('shopCart')) || [];
    const cartItems = document.getElementById('cartItems');
    const cartCount = document.getElementById('cartCount');
    const cartTotal = document.getElementById('cartTotal');
    
    // Update count
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.textContent = totalItems;
    
    // Update items display
    cartItems.innerHTML = '';
    let total = 0;
    
    cart.forEach(item => {
        total += item.price * item.quantity;
        
        const itemElement = document.createElement('div');
        itemElement.className = 'cart-item';
        itemElement.innerHTML = `
            <img src="${item.image}" alt="${item.name}" style="width: 60px; height: 60px; object-fit: cover; border-radius: 8px;">
            <div style="flex: 1; margin-left: 1rem;">
                <h4>${item.name}</h4>
                <p>$${item.price.toFixed(2)} x ${item.quantity}</p>
            </div>
            <button onclick="removeFromCart(${item.id})" style="background: none; border: none; color: #ef4444; cursor: pointer;">
                <i class="fas fa-trash"></i>
            </button>
        `;
        cartItems.appendChild(itemElement);
    });
    
    // Update total
    cartTotal.textContent = `$${total.toFixed(2)}`;
}

// Remove from Cart
window.removeFromCart = function(productId) {
    let cart = JSON.parse(localStorage.getItem('shopCart')) || [];
    cart = cart.filter(item => item.id !== productId);
    localStorage.setItem('shopCart', JSON.stringify(cart));
    updateCartDisplay();
};

// Filters and Sort
function initFiltersAndSort() {
    // Category filters
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            const category = btn.dataset.category;
            const maxPrice = document.getElementById('priceRange').value;
            const sortBy = document.getElementById('sortSelect').value;
            
            loadProducts(category, sortBy, maxPrice);
        });
    });
    
    // Price range
    const priceRange = document.getElementById('priceRange');
    const priceValue = document.getElementById('priceValue');
    
    priceRange.addEventListener('input', (e) => {
        priceValue.textContent = `$${e.target.value}`;
        
        const category = document.querySelector('.filter-btn.active').dataset.category;
        const sortBy = document.getElementById('sortSelect').value;
        
        loadProducts(category, sortBy, e.target.value);
    });
    
    // Sort
    document.getElementById('sortSelect').addEventListener('change', (e) => {
        const category = document.querySelector('.filter-btn.active').dataset.category;
        const maxPrice = document.getElementById('priceRange').value;
        
        loadProducts(category, e.target.value, maxPrice);
    });
}

// Infinite Scroll
function initInfiniteScroll() {
    let loading = false;
    
    window.addEventListener('scroll', () => {
        if (loading) return;
        
        const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
        
        if (scrollTop + clientHeight >= scrollHeight - 500) {
            loading = true;
            loadMoreProducts();
        }
    });
    
    function loadMoreProducts() {
        const loadBtn = document.getElementById('loadMoreBtn');
        const spinner = loadBtn.querySelector('lottie-player');
        const text = loadBtn.querySelector('span');
        
        text.style.display = 'none';
        spinner.style.display = 'inline-block';
        
        // Simulate loading
        setTimeout(() => {
            // Would load more products from API
            text.style.display = 'inline';
            spinner.style.display = 'none';
            loading = false;
        }, 2000);
    }
}

// Initialize cart display on load
document.addEventListener('DOMContentLoaded', updateCartDisplay);