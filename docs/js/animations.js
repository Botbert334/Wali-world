// Advanced Animation System using GSAP, Three.js, and other libraries

// Initialize GSAP with ScrollTrigger
gsap.registerPlugin(ScrollTrigger);

// Page Load Animation
window.addEventListener('load', () => {
    // Hide loader with fade animation
    setTimeout(() => {
        const loader = document.getElementById('loader');
        if (loader) {
            loader.classList.add('hidden');
        }
    }, 1500);
    
    // Initialize all animations
    initParticles();
    initHero3D();
    initScrollAnimations();
    initMicroInteractions();
    initFlyToCart();
});

// Particle.js Background Configuration
function initParticles() {
    if (typeof particlesJS !== 'undefined') {
        particlesJS('particles-js', {
            particles: {
                number: {
                    value: 80,
                    density: {
                        enable: true,
                        value_area: 800
                    }
                },
                color: {
                    value: '#ffffff'
                },
                shape: {
                    type: 'circle'
                },
                opacity: {
                    value: 0.5,
                    random: false
                },
                size: {
                    value: 3,
                    random: true
                },
                line_linked: {
                    enable: true,
                    distance: 150,
                    color: '#ffffff',
                    opacity: 0.4,
                    width: 1
                },
                move: {
                    enable: true,
                    speed: 2,
                    direction: 'none',
                    random: false,
                    straight: false,
                    out_mode: 'out',
                    bounce: false
                }
            },
            interactivity: {
                detect_on: 'canvas',
                events: {
                    onhover: {
                        enable: true,
                        mode: 'repulse'
                    },
                    onclick: {
                        enable: true,
                        mode: 'push'
                    },
                    resize: true
                },
                modes: {
                    repulse: {
                        distance: 100,
                        duration: 0.4
                    },
                    push: {
                        particles_nb: 4
                    }
                }
            },
            retina_detect: true
        });
    }
}

// Three.js 3D Product Showcase
function initHero3D() {
    const container = document.getElementById('hero3D');
    if (!container || typeof THREE === 'undefined') return;
    
    // Scene setup
    const scene = new THREE.Scene();
    scene.background = null; // Transparent background
    
    // Camera setup
    const camera = new THREE.PerspectiveCamera(
        75,
        container.clientWidth / container.clientHeight,
        0.1,
        1000
    );
    camera.position.z = 5;
    
    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(renderer.domElement);
    
    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 10, 5);
    scene.add(directionalLight);
    
    // Create a rotating product box (placeholder for actual 3D model)
    const geometry = new THREE.BoxGeometry(2, 2, 2);
    const material = new THREE.MeshPhongMaterial({
        color: 0x6366f1,
        specular: 0x222222,
        shininess: 100,
        wireframe: false
    });
    const cube = new THREE.Mesh(geometry, material);
    scene.add(cube);
    
    // Add some floating spheres around the main object
    const spheres = [];
    for (let i = 0; i < 5; i++) {
        const sphereGeometry = new THREE.SphereGeometry(0.2, 32, 32);
        const sphereMaterial = new THREE.MeshPhongMaterial({
            color: 0xec4899,
            emissive: 0xec4899,
            emissiveIntensity: 0.2
        });
        const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
        sphere.position.x = Math.cos(i * Math.PI * 2 / 5) * 3;
        sphere.position.z = Math.sin(i * Math.PI * 2 / 5) * 3;
        scene.add(sphere);
        spheres.push(sphere);
    }
    
    // Mouse interaction
    let mouseX = 0;
    let mouseY = 0;
    
    container.addEventListener('mousemove', (event) => {
        const rect = container.getBoundingClientRect();
        mouseX = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        mouseY = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    });
    
    // Animation loop
    function animate() {
        requestAnimationFrame(animate);
        
        // Rotate main cube
        cube.rotation.x += 0.005;
        cube.rotation.y += 0.01;
        
        // Orbit spheres
        spheres.forEach((sphere, index) => {
            const angle = Date.now() * 0.001 + index * Math.PI * 2 / 5;
            sphere.position.x = Math.cos(angle) * 3;
            sphere.position.z = Math.sin(angle) * 3;
            sphere.position.y = Math.sin(angle * 2) * 0.5;
        });
        
        // Mouse follow effect
        camera.position.x = mouseX * 2;
        camera.position.y = mouseY * 2;
        camera.lookAt(scene.position);
        
        renderer.render(scene, camera);
    }
    
    animate();
    
    // Handle resize
    window.addEventListener('resize', () => {
        camera.aspect = container.clientWidth / container.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(container.clientWidth, container.clientHeight);
    });
}

// GSAP Scroll Animations
function initScrollAnimations() {
    // Hero content animation
    gsap.timeline()
        .from('.hero-content', {
            opacity: 0,
            y: 100,
            duration: 1.5,
            ease: 'power3.out'
        })
        .from('.hero-3d-container', {
            opacity: 0,
            scale: 0.5,
            duration: 1.5,
            ease: 'power3.out'
        }, '-=1');
    
    // Section title animations
    gsap.utils.toArray('.section-title').forEach(title => {
        gsap.from(title, {
            scrollTrigger: {
                trigger: title,
                start: 'top 80%',
                end: 'bottom 20%',
                toggleActions: 'play none none reverse'
            },
            y: 50,
            opacity: 0,
            duration: 1,
            ease: 'power3.out'
        });
    });
    
    // Product cards stagger animation
    ScrollTrigger.batch('.product-card', {
        onEnter: batch => gsap.from(batch, {
            opacity: 0,
            y: 100,
            stagger: 0.15,
            duration: 1,
            ease: 'power3.out'
        }),
        once: true,
        start: 'top bottom-=100'
    });
    
    // Category cards animation
    ScrollTrigger.batch('.category-card', {
        onEnter: batch => gsap.from(batch, {
            opacity: 0,
            scale: 0.8,
            rotation: -10,
            stagger: 0.1,
            duration: 0.8,
            ease: 'back.out(1.7)'
        }),
        once: true,
        start: 'top bottom-=50'
    });
    
    // Parallax effect for hero
    gsap.to('.hero-section', {
        scrollTrigger: {
            trigger: '.hero-section',
            start: 'top top',
            end: 'bottom top',
            scrub: true
        },
        backgroundPosition: '50% 100%',
        ease: 'none'
    });
    
    // Navbar color change on scroll
    ScrollTrigger.create({
        trigger: '.hero-section',
        start: 'bottom top+=100',
        onEnter: () => document.querySelector('.navbar').classList.add('scrolled'),
        onLeaveBack: () => document.querySelector('.navbar').classList.remove('scrolled')
    });
}

// ScrollReveal.js Integration
function initScrollReveal() {
    if (typeof ScrollReveal !== 'undefined') {
        ScrollReveal().reveal('[data-reveal]', {
            distance: '50px',
            duration: 1000,
            easing: 'cubic-bezier(0.5, 0, 0, 1)',
            interval: 100,
            origin: 'bottom',
            reset: false,
            afterReveal: (el) => {
                el.classList.add('revealed');
            }
        });
    }
}

// Micro-interactions with Anime.js
function initMicroInteractions() {
    // Button hover effects
    document.querySelectorAll('.cta-button, .promo-button, .newsletter-button').forEach(button => {
        button.addEventListener('mouseenter', function() {
            anime({
                targets: this,
                scale: 1.05,
                duration: 300,
                easing: 'easeOutElastic(1, .5)'
            });
        });
        
        button.addEventListener('mouseleave', function() {
            anime({
                targets: this,
                scale: 1,
                duration: 300,
                easing: 'easeOutElastic(1, .5)'
            });
        });
        
        button.addEventListener('click', function(e) {
            // Ripple effect
            const ripple = document.createElement('span');
            ripple.classList.add('ripple');
            this.appendChild(ripple);
            
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            ripple.style.width = ripple.style.height = size + 'px';
            ripple.style.left = (e.clientX - rect.left - size / 2) + 'px';
            ripple.style.top = (e.clientY - rect.top - size / 2) + 'px';
            
            anime({
                targets: ripple,
                scale: [0, 2],
                opacity: [1, 0],
                duration: 600,
                easing: 'easeOutExpo',
                complete: () => ripple.remove()
            });
        });
    });
    
    // Navigation link hover
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('mouseenter', function() {
            anime({
                targets: this,
                color: '#6366f1',
                duration: 300
            });
        });
        
        link.addEventListener('mouseleave', function() {
            if (!this.classList.contains('active')) {
                anime({
                    targets: this,
                    color: '#1e293b',
                    duration: 300
                });
            }
        });
    });
    
    // Cart icon animation on add
    window.animateCartIcon = function() {
        const cartIcon = document.querySelector('.cart-icon');
        anime({
            targets: cartIcon,
            scale: [1, 1.3, 1],
            rotate: [0, 10, -10, 0],
            duration: 600,
            easing: 'easeInOutQuad'
        });
    };
}

// Fly to Cart Animation
function initFlyToCart() {
    window.flyToCart = function(productElement, imageUrl) {
        const cart = document.querySelector('.cart-icon');
        const cartRect = cart.getBoundingClientRect();
        const productRect = productElement.getBoundingClientRect();
        
        // Create flying element
        const flyingImg = document.createElement('div');
        flyingImg.className = 'fly-to-cart';
        flyingImg.innerHTML = `<img src="${imageUrl}" alt="Product">`;
        flyingImg.style.left = productRect.left + 'px';
        flyingImg.style.top = productRect.top + 'px';
        document.body.appendChild(flyingImg);
        
        // Animate with GSAP
        gsap.to(flyingImg, {
            x: cartRect.left - productRect.left + cartRect.width / 2,
            y: cartRect.top - productRect.top,
            scale: 0.3,
            opacity: 0.7,
            duration: 0.8,
            ease: 'power2.inOut',
            onComplete: () => {
                flyingImg.remove();
                animateCartIcon();
                updateCartCount();
            }
        });
    };
}

// Update cart count with animation
function updateCartCount() {
    const cartCount = document.getElementById('cartCount');
    const currentCount = parseInt(cartCount.textContent);
    const newCount = currentCount + 1;
    
    anime({
        targets: cartCount,
        innerHTML: [currentCount, newCount],
        round: 1,
        duration: 500,
        easing: 'easeInOutQuad',
        complete: () => {
            cartCount.textContent = newCount;
        }
    });
    
    // Pulse animation
    anime({
        targets: cartCount,
        scale: [1, 1.5, 1],
        duration: 300,
        easing: 'easeInOutQuad'
    });
}

// Initialize ScrollReveal
document.addEventListener('DOMContentLoaded', () => {
    initScrollReveal();
});