

    // Product Display
    const productsGrid = document.querySelector('.products-grid');
    
    // Load products from products.js
    function loadProducts() {
        productsGrid.innerHTML = '';
        
        products.forEach(product => {
            const productCard = document.createElement('div');
            productCard.classList.add('product-card');
            
            // Add badge if exists
            if (product.badge) {
                productCard.innerHTML += `<span class="product-badge">${product.badge}</span>`;
            }
            
            productCard.innerHTML += `
                <div class="product-img">
                    <img src="${product.image}" alt="${product.name}">
                </div>
                <div class="product-info">
                    <span class="product-category">${product.category}</span>
                    <h3 class="product-title">${product.name}</h3>
                    <div class="product-price">
                        <span class="current-price">₹${product.price.toFixed(2)}</span>
                    </div>
                    <div class="product-actions">
                        <button class="add-to-cart" 
                            data-id="${product.id}" 
                            data-name="${product.name}" 
                            data-price="${product.price}" 
                            data-image="${product.image}">
                            Add to Cart
                        </button>
                        <div class="wishlist">
                            <i class="far fa-heart"></i>
                        </div>
                    </div>
                </div>
            `;
            
            productsGrid.appendChild(productCard);
        });
        
        // Reattach event listeners to new cart buttons
        document.querySelectorAll('.add-to-cart').forEach(btn => {
            btn.addEventListener('click', addToCartHandler);
        });
    }
    
    // Mobile Menu Toggle
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');
    
    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navLinks.classList.toggle('active');
    });

    // Cart Functionality
    const cartToggle = document.getElementById('cart-toggle');
    const cartOverlay = document.querySelector('.cart-overlay');
    const cartSidebar = document.querySelector('.cart-sidebar');
    const closeCart = document.querySelector('.close-cart');
    const addToCartBtns = document.querySelectorAll('.add-to-cart');
    const cartCount = document.querySelector('.cart-count');
    const cartItemsContainer = document.querySelector('.cart-items');
    const cartTotal = document.getElementById('cart-total');
    const checkoutBtn = document.querySelector('.checkout-btn');

    let cart = JSON.parse(localStorage.getItem('cart')) || [];

    // Toggle Cart
    cartToggle.addEventListener('click', (e) => {
        e.preventDefault();
        cartOverlay.classList.add('active');
        cartSidebar.classList.add('active');
    });

    closeCart.addEventListener('click', () => {
        cartOverlay.classList.remove('active');
        cartSidebar.classList.remove('active');
    });

    cartOverlay.addEventListener('click', () => {
        cartOverlay.classList.remove('active');
        cartSidebar.classList.remove('active');
    });

    // Add to Cart Handler
    function addToCartHandler() {
        const id = this.getAttribute('data-id');
        const name = this.getAttribute('data-name');
        const price = parseFloat(this.getAttribute('data-price'));
        const image = this.getAttribute('data-image');

        const existingItem = cart.find(item => item.id === id);

        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push({
                id,
                name,
                price,
                image,
                quantity: 1
            });
        }

        updateCart();
        animateAddToCart(this);
    }

    // Add to Cart
    document.querySelectorAll('.add-to-cart').forEach(btn => {
        btn.addEventListener('click', addToCartHandler);
    });

    // Update Cart
    function updateCart() {
        renderCartItems();
        updateCartCount();
        updateCartTotal();
        saveCartToLocalStorage();
    }

    function renderCartItems() {
        cartItemsContainer.innerHTML = '';

        if (cart.length === 0) {
            cartItemsContainer.innerHTML = '<p class="empty-cart">Your cart is empty</p>';
            return;
        }

        cart.forEach((item, index) => {
            const cartItem = document.createElement('div');
            cartItem.classList.add('cart-item');
            cartItem.innerHTML = `
                <img src="${item.image}" alt="${item.name}" class="cart-item-img">
                <div class="cart-item-details">
                    <h4 class="cart-item-title">${item.name}</h4>
                    <p class="cart-item-price">$${(item.price * item.quantity).toFixed(2)}</p>
                    <div class="cart-item-quantity">
                        <button class="quantity-btn decrease" data-index="${index}">-</button>
                        <span>${item.quantity}</span>
                        <button class="quantity-btn increase" data-index="${index}">+</button>
                    </div>
                    <button class="cart-item-remove" data-index="${index}">
                        <i class="fas fa-trash"></i> Remove
                    </button>
                </div>
            `;
            cartItemsContainer.appendChild(cartItem);
        });

        // Add event listeners to quantity buttons
        document.querySelectorAll('.quantity-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = btn.getAttribute('data-index');
                if (btn.classList.contains('increase')) {
                    cart[index].quantity += 1;
                } else if (btn.classList.contains('decrease')) {
                    if (cart[index].quantity > 1) {
                        cart[index].quantity -= 1;
                    } else {
                        cart.splice(index, 1);
                    }
                }
                updateCart();
            });
        });

        // Add event listeners to remove buttons
        document.querySelectorAll('.cart-item-remove').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = btn.getAttribute('data-index');
                cart.splice(index, 1);
                updateCart();
            });
        });
    }

    function updateCartCount() {
        const count = cart.reduce((total, item) => total + item.quantity, 0);
        cartCount.textContent = count;
    }

    function updateCartTotal() {
        const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        cartTotal.textContent = total.toFixed(2);
    }

    function saveCartToLocalStorage() {
        localStorage.setItem('cart', JSON.stringify(cart));
    }

    // Checkout Flow
    const cartSteps = document.querySelectorAll('.cart-step');
    const stepButtons = document.querySelectorAll('.step');
    const backToCartBtn = document.querySelector('.back-to-cart');
    const proceedToPaymentBtn = document.querySelector('.proceed-to-payment');
    const backToDeliveryBtn = document.querySelector('.back-to-delivery');
    const placeOrderBtn = document.querySelector('.place-order');
    const deliveryForm = document.querySelector('.delivery-form');
    const orderSummaryItems = document.querySelector('.summary-items');
    const orderTotal = document.querySelector('.order-total');

    // Move to delivery step
    checkoutBtn.addEventListener('click', () => {
        if (cart.length === 0) {
            alert('Your cart is empty!');
            return;
        }
        showStep(2);
    });

    // Back to cart
    backToCartBtn.addEventListener('click', () => {
        showStep(1);
    });

    // Proceed to payment
    proceedToPaymentBtn.addEventListener('click', () => {
        if (deliveryForm.checkValidity()) {
            updateOrderSummary();
            showStep(3);
        } else {
            alert('Please fill all required delivery information');
        }
    });

    // Back to delivery
    backToDeliveryBtn.addEventListener('click', () => {
        showStep(2);
    });

    // Place order
    placeOrderBtn.addEventListener('click', () => {
        const paymentMethod = document.querySelector('input[name="payment"]:checked').value;
        const formData = new FormData(deliveryForm);
        const orderData = {
            items: [...cart],
            delivery: Object.fromEntries(formData),
            payment: paymentMethod,
            total: parseFloat(cartTotal.textContent)
        };

        // In a real app, you would send this to your backend
        console.log('Order placed:', orderData);
        
        // Clear cart and show confirmation
        cart = [];
        updateCart();
        showStep(1);
        alert('Order placed successfully! Thank you for your purchase.');
        cartOverlay.classList.remove('active');
        cartSidebar.classList.remove('active');
    });

    function showStep(stepNumber) {
        // Update step indicators
        stepButtons.forEach(step => {
            step.classList.toggle('active', parseInt(step.dataset.step) === stepNumber);
        });

        // Show correct step content
        cartSteps.forEach(step => {
            step.style.display = step.dataset.stepContent == stepNumber ? 'block' : 'none';
        });
    }

    function updateOrderSummary() {
        orderSummaryItems.innerHTML = '';
        cart.forEach(item => {
            const itemEl = document.createElement('div');
            itemEl.classList.add('summary-item');
            itemEl.innerHTML = `
                <span>${item.name} x ${item.quantity}</span>
                <span>₹${(item.price * item.quantity).toFixed(2)}</span>
            `;
            orderSummaryItems.appendChild(itemEl);
        });
        orderTotal.textContent = `₹${cartTotal.textContent}`;
    }

    // Add to Cart Animation
    function animateAddToCart(button) {
        const buttonRect = button.getBoundingClientRect();
        const cartIconRect = cartToggle.getBoundingClientRect();

        const animation = document.createElement('div');
        animation.classList.add('cart-animation');
        animation.style.left = `${buttonRect.left}px`;
        animation.style.top = `${buttonRect.top}px`;
        document.body.appendChild(animation);

        setTimeout(() => {
            animation.style.left = `${cartIconRect.left}px`;
            animation.style.top = `${cartIconRect.top}px`;
            animation.style.opacity = '0';
            animation.style.transform = 'scale(0.5)';
        }, 10);

        setTimeout(() => {
            animation.remove();
        }, 1000);
    }

    // Testimonial Slider
    const testimonialsTrack = document.getElementById('testimonials-track');
    const sliderDots = document.querySelectorAll('.slider-dot');
    let currentSlide = 0;

    function showSlide(index) {
        testimonialsTrack.style.transform = `translateX(-${index * 100}%)`;
        
        sliderDots.forEach((dot, i) => {
            dot.classList.toggle('active', i === index);
        });
        
        currentSlide = index;
    }

    sliderDots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            showSlide(index);
        });
    });

    // Auto slide change
    setInterval(() => {
        currentSlide = (currentSlide + 1) % sliderDots.length;
        showSlide(currentSlide);
    }, 5000);

    // Initialize
    loadProducts();
    updateCart();
