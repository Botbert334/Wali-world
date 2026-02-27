// E-commerce Functionality with Advanced Features

// Sample product data (can be replaced with API calls)
const products = [
    {
        id: 1,
        name: "Premium Wireless Headphones",
        description: "Immersive sound experience with active noise cancellation",
        price: 299.99,
        image: "https://source.unsplash.com/400x400/?headphones",
        category: "electronics",
        badge: "New",
        rating: 4.5,
        model3D: null
    },
    {
        id: 2,
        name: "Smart Watch Pro",
        description: "Track your fitness and stay connected",
        price: 449.99,
        image: "https://source.unsplash.com/400x400/?smartwatch",
        category: "electronics",
        badge: "Hot",
        rating: 4.8,
        model3D: null
    },
    {
        id: 3,
        name: "Designer Backpack",
        description: "Stylish and functional for modern professionals",
        price: 149.99,
        image: "https://source.unsplash.com/400x400/?backpack",
        category: "fashion",
        badge: "Sale",
        rating: 4.3,
        model3D: null
    },
    {
        id: 4,
        name: "Organic Coffee Maker",
        description: "Brew the perfect cup every morning",
        price: 189.99,
        image: "https://source.unsplash.com/400x400/?coffee-maker",
        category: "home",
        badge: null,
        rating: 4.6,
        model3D: null
    },
    {
        id: 5,
        name: "Yoga Mat Premium",
        description: "Non-slip surface for perfect balance",
        price: 79.99,
        image: "https://source.unsplash.com/400x400/?yoga-mat",
        category: "sports",
        badge: "Eco",
        rating: 4.7,
        model3D: null
    },
    {
        id: 6,
        name: "Wireless Charging Pad",
        description: "Fast charging for all your devices",
        price: 59.99,
        image: "https://source.unsplash.com/400x400/?charger",
        category: "electronics",
        badge: null,
        rating: 4.4,
        model3D: null
    }
];

// Shopping Cart
let cart = JSON.parse(localStorage.getItem('waliCart')) || [];

// Initialize E-commerce Features
document.addEventListener('DOMContentLoaded', () => {
    loadFeaturedProducts();
    initProductInteractions();
    initCategoryFilters();
    initSearchFunctionality();
    initCheckout();
    updateCartUI();
});

// Load Featured Products
function loadFeaturedProducts() {
    const container = document.getElementById('featuredProducts');
    if (!container) return;
    
    const featuredProducts = products.slice(0, 6);
    
    featuredProducts.forEach((product, index) => {
        const productCard = createProductCard(product, index);
        container.appendChild(productCard);
    });
}

// Create Product Card
function createProductCard(product, index) {
    const card = document.createElement('div');
    card.className = 'product-card';
    card.setAttribute('data-product-id', product.id);
    card.style.opacity = '0';
    
    const badge = product.badge ? `<span class="product-badge">${product.badge}</span>` : '';
    const stars = createStarRating(product.rating);
    
    card.innerHTML = `
        <div class="product-image-container">
            ${badge}
            <img src="${product.image}" alt="${product.name}" class="product-image" loading="lazy">
            <div class="product-overlay">
                <button class="quick-view-btn" data-product-id="${product.id}">
                    <i class="fas fa-eye"></i> Quick View
                </button>
            </div>
        </div>
        <div class="product-info">
            <h3 class="product-title">${product.name}</h3>
            <div class="product-rating">${stars}</div>
            <p class="product-description">${product.description}</p>
            <div class="product-price">$${product.price.toFixed(2)}</div>
            <button class="add-to-cart-btn" data-product-id="${product.id}">
                <i class="fas fa-shopping-cart"></i> Add to Cart
            </button>
        </div>
    `;
    
    // Animate card appearance
    setTimeout(() => {
        anime({
            targets: card,
            opacity: [0, 1],
            translateY: [50, 0],
            duration: 800,
            delay: index * 100,
            easing: 'easeOutQuad'
        });
    }, 100);
    
    return card;
}

// Create Star Rating
function createStarRating(rating) {
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 >= 0.5 ? 1 : 0;
    const emptyStars = 5 - fullStars - halfStar;
    
    let stars = '';
    for (let i = 0; i < fullStars; i++) {
        stars += '<i class="fas fa-star" style="color: #fbbf24;"></i>';
    }
    if (halfStar) {
        stars += '<i class="fas fa-star-half-alt" style="color: #fbbf24;"></i>';
    }
    for (let i = 0; i < emptyStars; i++) {
        stars += '<i class="far fa-star" style="color: #fbbf24;"></i>';
    }
    
    return `<span class="stars">${stars}</span> <span class="rating-value">(${rating})</span>`;
}

// Product Interactions
function initProductInteractions() {
    // Add to Cart with Fly Animation
    document.addEventListener('click', (e) => {
        if (e.target.closest('.add-to-cart-btn')) {
            const btn = e.target.closest('.add-to-cart-btn');
            const productId = parseInt(btn.getAttribute('data-product-id'));
            const product = products.find(p => p.id === productId);
            const productCard = btn.closest('.product-card');
            
            if (product) {
                addToCart(product);
                
                // Trigger fly to cart animation
                const productImage = productCard.querySelector('.product-image');
                if (productImage && window.flyToCart) {
                    window.flyToCart(productCard, productImage.src);
                }
                
                // Button feedback animation
                anime({
                    targets: btn,
                    scale: [1, 0.9, 1.1, 1],
                    duration: 600,
                    easing: 'easeInOutQuad'
                });
                
                // Change button text temporarily
                const originalText = btn.innerHTML;
                btn.innerHTML = '<i class="fas fa-check"></i> Added!';
                btn.style.background = 'linear-gradient(135deg, #10b981, #34d399)';
                
                setTimeout(() => {
                    btn.innerHTML = originalText;
                    btn.style.background = '';
                }, 2000);
            }
        }
        
        // Quick View Modal
        if (e.target.closest('.quick-view-btn')) {
            const btn = e.target.closest('.quick-view-btn');
            const productId = parseInt(btn.getAttribute('data-product-id'));
            const product = products.find(p => p.id === productId);
            
            if (product) {
                showQuickViewModal(product);
            }
        }
    });
    
    // Product Card Hover 3D Tilt Effect
    document.addEventListener('mousemove', (e) => {
        const card = e.target.closest('.product-card');
        if (card) {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            const rotateX = (y - centerY) / 10;
            const rotateY = (centerX - x) / 10;
            
            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(10px)`;
        }
    });
    
    document.addEventListener('mouseleave', (e) => {
        const card = e.target.closest('.product-card');
        if (card) {
            card.style.transform = '';
        }
    });
}

// Category Filter
function initCategoryFilters() {
    document.querySelectorAll('.category-card').forEach(card => {
        card.addEventListener('click', () => {
            const category = card.getAttribute('data-category');
            filterProductsByCategory(category);
            
            // Animate category selection
            anime({
                targets: card,
                scale: [1, 0.95, 1],
                duration: 300,
                easing: 'easeInOutQuad'
            });
        });
    });
}

// Filter Products by Category
function filterProductsByCategory(category) {
    const filteredProducts = products.filter(p => p.category === category);
    const container = document.getElementById('featuredProducts');
    
    if (container) {
        // Fade out current products
        anime({
            targets: '.product-card',
            opacity: 0,
            scale: 0.8,
            duration: 300,
            easing: 'easeInQuad',
            complete: () => {
                container.innerHTML = '';
                
                // Add filtered products
                filteredProducts.forEach((product, index) => {
                    const card = createProductCard(product, index);
                    container.appendChild(card);
                });
                
                // If no products found
                if (filteredProducts.length === 0) {
                    container.innerHTML = `
                        <div class="no-products">
                            <i class="fas fa-search" style="font-size: 4rem; color: #cbd5e1; margin-bottom: 1rem;"></i>
                            <h3>No products found in this category</h3>
                            <p>Try browsing other categories or check back later!</p>
                        </div>
                    `;
                }
            }
        });
    }
    
    // Smooth scroll to products section
    const productsSection = document.querySelector('.featured-section');
    if (productsSection) {
        productsSection.scrollIntoView({ behavior: 'smooth' });
    }
}

// Quick View Modal
function showQuickViewModal(product) {
    // Create modal
    const modal = document.createElement('div');
    modal.className = 'quick-view-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <button class="modal-close">&times;</button>
            <div class="modal-body">
                <div class="modal-image">
                    <img src="${product.image}" alt="${product.name}">
                </div>
                <div class="modal-info">
                    <h2>${product.name}</h2>
                    ${createStarRating(product.rating)}
                    <p class="modal-description">${product.description}</p>
                    <div class="modal-price">$${product.price.toFixed(2)}</div>
                    <div class="modal-actions">
                        <button class="modal-add-to-cart" data-product-id="${product.id}">
                            <i class="fas fa-shopping-cart"></i> Add to Cart
                        </button>
                        <button class="modal-view-3d" data-product-id="${product.id}">
                            <i class="fas fa-cube"></i> View in 3D
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Animate modal appearance
    anime({
        targets: '.quick-view-modal',
        opacity: [0, 1],
        duration: 300,
        easing: 'easeOutQuad'
    });
    
    anime({
        targets: '.modal-content',
        scale: [0.8, 1],
        duration: 400,
        easing: 'easeOutBack'
    });
    
    // Close modal
    modal.querySelector('.modal-close').addEventListener('click', () => {
        anime({
            targets: '.quick-view-modal',
            opacity: 0,
            duration: 300,
            easing: 'easeInQuad',
            complete: () => modal.remove()
        });
    });
    
    // Add to cart from modal
    modal.querySelector('.modal-add-to-cart').addEventListener('click', (e) => {
        const productId = parseInt(e.target.getAttribute('data-product-id'));
        const product = products.find(p => p.id === productId);
        if (product) {
            addToCart(product);
            e.target.innerHTML = '<i class="fas fa-check"></i> Added!';
        }
    });
    
    // View in 3D
    modal.querySelector('.modal-view-3d').addEventListener('click', () => {
        init3DProductViewer(product);
    });
}

// 3D Product Viewer (using Three.js)
function init3DProductViewer(product) {
    console.log('Initializing 3D viewer for:', product.name);
    // This would launch a full 3D viewer with the product model
    // For now, we'll create a placeholder animation
    
    const viewer = document.createElement('div');
    viewer.className = '3d-viewer-modal';
    viewer.innerHTML = `
        <div class="viewer-content">
            <button class="viewer-close">&times;</button>
            <h3>3D View: ${product.name}</h3>
            <div id="3d-canvas"></div>
            <p>Drag to rotate • Scroll to zoom</p>
        </div>
    `;
    
    document.body.appendChild(viewer);
    
    // Initialize Three.js scene here
    // ... (Would load actual 3D model)
    
    viewer.querySelector('.viewer-close').addEventListener('click', () => {
        viewer.remove();
    });
}

// Shopping Cart Functions
function addToCart(product) {
    const existingItem = cart.find(item => item.id === product.id);
    
    if (existingItem) {
        existingItem.quantity++;
    } else {
        cart.push({
            ...product,
            quantity: 1
        });
    }
    
    localStorage.setItem('waliCart', JSON.stringify(cart));
    updateCartUI();
}

function updateCartUI() {
    const cartCount = document.getElementById('cartCount');
    if (cartCount) {
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartCount.textContent = totalItems;
    }
}

// Search Functionality
function initSearchFunctionality() {
    // Create search bar
    const searchContainer = document.createElement('div');
    searchContainer.className = 'search-container';
    searchContainer.innerHTML = `
        <input type="text" placeholder="Search products..." class="search-input" id="searchInput">
        <button class="search-btn"><i class="fas fa-search"></i></button>
    `;
    
    const navbar = document.querySelector('.nav-container');
    if (navbar) {
        navbar.insertBefore(searchContainer, navbar.querySelector('.cart-container'));
    }
    
    // Search functionality
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase();
            if (query.length > 2) {
                const results = products.filter(p => 
                    p.name.toLowerCase().includes(query) ||
                    p.description.toLowerCase().includes(query)
                );
                displaySearchResults(results);
            }
        });
    }
}

// Display Search Results
function displaySearchResults(results) {
    const container = document.getElementById('featuredProducts');
    if (container) {
        container.innerHTML = '';
        results.forEach((product, index) => {
            const card = createProductCard(product, index);
            container.appendChild(card);
        });
    }
}

// Checkout Process
function initCheckout() {
    // Would integrate with payment gateway
    console.log('Checkout system initialized');
}

// Add Modal and 3D Viewer styles
const modalStyles = `
<style>
.quick-view-modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100vh;
    background: rgba(0, 0, 0, 0.8);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 10000;
}

.modal-content {
    background: white;
    border-radius: 20px;
    padding: 2rem;
    max-width: 900px;
    width: 90%;
    max-height: 90vh;
    overflow-y: auto;
}

.modal-close {
    float: right;
    font-size: 2rem;
    background: none;
    border: none;
    cursor: pointer;
    color: #666;
}

.modal-body {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 2rem;
    margin-top: 1rem;
}

.modal-image img {
    width: 100%;
    border-radius: 10px;
}

.modal-info h2 {
    font-size: 2rem;
    margin-bottom: 1rem;
}

.modal-description {
    margin: 1rem 0;
    line-height: 1.6;
    color: #666;
}

.modal-price {
    font-size: 2rem;
    color: #6366f1;
    font-weight: bold;
    margin: 1rem 0;
}

.modal-actions {
    display: flex;
    gap: 1rem;
}

.modal-add-to-cart, .modal-view-3d {
    flex: 1;
    padding: 1rem;
    border: none;
    border-radius: 10px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s;
}

.modal-add-to-cart {
    background: linear-gradient(135deg, #6366f1, #ec4899);
    color: white;
}

.modal-view-3d {
    background: #f3f4f6;
    color: #333;
}

.product-overlay {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    background: rgba(0, 0, 0, 0.8);
    transform: translateY(100%);
    transition: transform 0.3s;
    padding: 1rem;
    display: flex;
    justify-content: center;
}

.product-card:hover .product-overlay {
    transform: translateY(0);
}

.quick-view-btn {
    background: white;
    color: #333;
    border: none;
    padding: 0.75rem 1.5rem;
    border-radius: 999px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s;
}

.quick-view-btn:hover {
    transform: scale(1.05);
}

.search-container {
    display: flex;
    align-items: center;
    background: rgba(255, 255, 255, 0.2);
    border-radius: 999px;
    padding: 0.5rem 1rem;
    backdrop-filter: blur(10px);
}

.search-input {
    background: none;
    border: none;
    color: var(--text-primary);
    outline: none;
    width: 200px;
    transition: width 0.3s;
}

.search-input:focus {
    width: 300px;
}

.search-btn {
    background: none;
    border: none;
    color: var(--primary-color);
    cursor: pointer;
    font-size: 1.2rem;
}

.ripple {
    position: absolute;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.5);
    transform: scale(0);
    pointer-events: none;
}

.no-products {
    text-align: center;
    padding: 4rem;
    grid-column: 1 / -1;
}

.product-rating {
    margin: 0.5rem 0;
}

.rating-value {
    color: #666;
    font-size: 0.9rem;
    margin-left: 0.5rem;
}

.\\33d-viewer-modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100vh;
    background: rgba(0, 0, 0, 0.9);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 10001;
}

.viewer-content {
    background: white;
    border-radius: 20px;
    padding: 2rem;
    width: 80%;
    height: 80vh;
    position: relative;
}

.viewer-close {
    position: absolute;
    right: 1rem;
    top: 1rem;
    font-size: 2rem;
    background: none;
    border: none;
    cursor: pointer;
    z-index: 10;
}

#\\33d-canvas {
    width: 100%;
    height: calc(100% - 100px);
    background: #f0f0f0;
    border-radius: 10px;
    display: flex;
    justify-content: center;
    align-items: center;
}
</style>
`;

// Inject modal styles
document.head.insertAdjacentHTML('beforeend', modalStyles);