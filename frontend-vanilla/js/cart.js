// Cart functionality
const Cart = {
    // Add item to cart
    addItem: async (productId, quantity = 1) => {
        if (!Auth.requireAuth()) return;
        
        try {
            await handleApiCall(async () => {
                const response = await ApiService.cart.add(productId, quantity);
                Toast.success('Item added to cart!');
                return response;
            });
        } catch (error) {
            // Error is already handled in handleApiCall
        }
    },
    
    // Update item quantity
    updateQuantity: async (productId, quantity) => {
        if (!Auth.requireAuth()) return;
        
        try {
            await handleApiCall(async () => {
                const response = await ApiService.cart.update(productId, quantity);
                Cart.renderCart();
                return response;
            });
        } catch (error) {
            // Error is already handled in handleApiCall
        }
    },
    
    // Remove item from cart
    removeItem: async (productId) => {
        if (!Auth.requireAuth()) return;
        
        if (!confirm('Are you sure you want to remove this item from your cart?')) {
            return;
        }
        
        try {
            await handleApiCall(async () => {
                const response = await ApiService.cart.remove(productId);
                Toast.success('Item removed from cart');
                Cart.renderCart();
                return response;
            });
        } catch (error) {
            // Error is already handled in handleApiCall
        }
    },
    
    // Clear entire cart
    clearCart: async () => {
        if (!Auth.requireAuth()) return;
        
        if (!confirm('Are you sure you want to clear your entire cart?')) {
            return;
        }
        
        try {
            await handleApiCall(async () => {
                const response = await ApiService.cart.clear();
                Toast.success('Cart cleared');
                Cart.renderCart();
                return response;
            });
        } catch (error) {
            // Error is already handled in handleApiCall
        }
    },
    
    // Render cart items
    renderCart: () => {
        const cartContent = document.getElementById('cart-content');
        if (!cartContent) return;
        
        const cart = AppState.cart;
        
        if (!cart.items || cart.items.length === 0) {
            cartContent.innerHTML = `
                <div class="empty-cart">
                    <i class="fas fa-shopping-cart"></i>
                    <h3>Your cart is empty</h3>
                    <p>Add some products to get started!</p>
                    <button class="cta-button" onclick="showPage('products')">Shop Now</button>
                </div>
            `;
            return;
        }
        
        cartContent.innerHTML = `
            <div class="cart-items">
                <div class="cart-header">
                    <h3>Cart Items (${cart.totalItems})</h3>
                    <button class="clear-cart-btn" onclick="Cart.clearCart()">
                        <i class="fas fa-trash"></i> Clear Cart
                    </button>
                </div>
                ${cart.items.map(item => Cart.renderCartItem(item)).join('')}
            </div>
            <div class="cart-summary">
                <h3>Order Summary</h3>
                <div class="summary-row">
                    <span>Subtotal (${cart.totalItems} items):</span>
                    <span>${Utils.formatCurrency(cart.totalAmount)}</span>
                </div>
                <div class="summary-row">
                    <span>Shipping:</span>
                    <span>${cart.totalAmount > 100 ? 'FREE' : Utils.formatCurrency(10)}</span>
                </div>
                <div class="summary-row">
                    <span>Tax (8%):</span>
                    <span>${Utils.formatCurrency(cart.totalAmount * 0.08)}</span>
                </div>
                <div class="summary-row total">
                    <span>Total:</span>
                    <span>${Utils.formatCurrency(cart.totalAmount + (cart.totalAmount > 100 ? 0 : 10) + (cart.totalAmount * 0.08))}</span>
                </div>
                <button class="checkout-btn" onclick="showPage('checkout')">
                    Proceed to Checkout
                </button>
            </div>
        `;
        
        // Add CSS for cart header
        if (!document.querySelector('#cart-header-styles')) {
            const style = document.createElement('style');
            style.id = 'cart-header-styles';
            style.textContent = `
                .cart-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: var(--spacing-6);
                    padding-bottom: var(--spacing-4);
                    border-bottom: 1px solid var(--gray-200);
                }
                
                .clear-cart-btn {
                    background: var(--error-color);
                    color: var(--white);
                    border: none;
                    padding: var(--spacing-2) var(--spacing-4);
                    border-radius: var(--radius-md);
                    font-size: var(--font-size-sm);
                    cursor: pointer;
                    transition: background-color var(--transition-fast);
                    display: flex;
                    align-items: center;
                    gap: var(--spacing-2);
                }
                
                .clear-cart-btn:hover {
                    background: #dc2626;
                }
            `;
            document.head.appendChild(style);
        }
    },
    
    // Render individual cart item
    renderCartItem: (item) => {
        return `
            <div class="cart-item" data-product-id="${item.product._id}">
                <img src="${item.product.image}" alt="${item.product.name}" class="cart-item-image"
                     onerror="this.src='https://via.placeholder.com/80x80?text=No+Image'">
                <div class="cart-item-info">
                    <h4>${Utils.sanitizeHtml(item.product.name)}</h4>
                    <p class="cart-item-price">Unit: ${Utils.formatCurrency(item.price)}</p>
                </div>
                <div class="cart-item-quantity">
                    <button class="quantity-btn" onclick="Cart.updateQuantity('${item.product._id}', ${item.quantity - 1})" ${item.quantity <= 1 ? 'disabled' : ''}>
                        <i class="fas fa-minus"></i>
                    </button>
                    <span class="quantity-display">${item.quantity}</span>
                    <button class="quantity-btn" onclick="Cart.updateQuantity('${item.product._id}', ${item.quantity + 1})">
                        <i class="fas fa-plus"></i>
                    </button>
                </div>
                <div class="cart-item-total">
                    <strong>${Utils.formatCurrency(item.price * item.quantity)}</strong>
                </div>
                <button class="remove-item-btn" onclick="Cart.removeItem('${item.product._id}')" title="Remove item">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
    },
    
    // Get cart total for checkout
    getCartTotal: () => {
        const cart = AppState.cart;
        const subtotal = cart.totalAmount;
        const shipping = subtotal > 100 ? 0 : 10;
        const tax = subtotal * 0.08;
        const total = subtotal + shipping + tax;
        
        return {
            subtotal,
            shipping,
            tax,
            total,
            itemCount: cart.totalItems
        };
    },
    
    // Validate cart before checkout
    validateCart: () => {
        const cart = AppState.cart;
        
        if (!cart.items || cart.items.length === 0) {
            Toast.warning('Your cart is empty');
            return false;
        }
        
        // Check if all items are still in stock
        for (const item of cart.items) {
            if (item.product.countInStock < item.quantity) {
                Toast.error(`${item.product.name} is out of stock or has insufficient quantity`);
                return false;
            }
        }
        
        return true;
    }
};

// Load cart when cart page is shown
const loadCart = async () => {
    if (!Auth.isAuthenticated()) {
        const cartContent = document.getElementById('cart-content');
        if (cartContent) {
            cartContent.innerHTML = `
                <div class="empty-cart">
                    <i class="fas fa-shopping-cart"></i>
                    <h3>Please login to view your cart</h3>
                    <p>Sign in to see your saved items and continue shopping</p>
                    <button class="cta-button" onclick="showPage('login')">Login</button>
                </div>
            `;
        }
        return;
    }
    
    try {
        await handleApiCall(async () => {
            await ApiService.cart.get();
            Cart.renderCart();
        });
    } catch (error) {
        // Error is already handled in handleApiCall
    }
};

// Add to cart with quantity selector
const showAddToCartModal = (product) => {
    // Create modal HTML
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>Add to Cart</h3>
                <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="modal-body">
                <div class="product-info">
                    <img src="${product.image}" alt="${product.name}" class="modal-product-image">
                    <div>
                        <h4>${Utils.sanitizeHtml(product.name)}</h4>
                        <p class="modal-product-price">${Utils.formatCurrency(product.price)}</p>
                        <p class="modal-product-stock">In Stock: ${product.countInStock}</p>
                    </div>
                </div>
                <div class="quantity-selector">
                    <label for="modal-quantity">Quantity:</label>
                    <input type="number" id="modal-quantity" min="1" max="${product.countInStock}" value="1">
                </div>
            </div>
            <div class="modal-footer">
                <button class="modal-btn secondary" onclick="this.closest('.modal-overlay').remove()">Cancel</button>
                <button class="modal-btn primary" onclick="Cart.addFromModal('${product._id}')">Add to Cart</button>
            </div>
        </div>
    `;
    
    // Add modal styles
    if (!document.querySelector('#modal-styles')) {
        const style = document.createElement('style');
        style.id = 'modal-styles';
        style.textContent = `
            .modal-overlay {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.5);
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 1000;
            }
            
            .modal-content {
                background: var(--white);
                border-radius: var(--radius-lg);
                max-width: 500px;
                width: 90%;
                max-height: 90vh;
                overflow-y: auto;
            }
            
            .modal-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: var(--spacing-6);
                border-bottom: 1px solid var(--gray-200);
            }
            
            .modal-close {
                background: none;
                border: none;
                font-size: var(--font-size-lg);
                cursor: pointer;
                color: var(--gray-500);
            }
            
            .modal-body {
                padding: var(--spacing-6);
            }
            
            .modal-product-image {
                width: 80px;
                height: 80px;
                object-fit: cover;
                border-radius: var(--radius-md);
                margin-right: var(--spacing-4);
            }
            
            .product-info {
                display: flex;
                align-items: center;
                margin-bottom: var(--spacing-6);
            }
            
            .modal-footer {
                display: flex;
                gap: var(--spacing-3);
                padding: var(--spacing-6);
                border-top: 1px solid var(--gray-200);
            }
            
            .modal-btn {
                flex: 1;
                padding: var(--spacing-3);
                border: none;
                border-radius: var(--radius-md);
                font-weight: 500;
                cursor: pointer;
                transition: all var(--transition-fast);
            }
            
            .modal-btn.secondary {
                background: var(--gray-200);
                color: var(--gray-700);
            }
            
            .modal-btn.primary {
                background: var(--primary-color);
                color: var(--white);
            }
            
            .modal-btn:hover {
                transform: translateY(-1px);
            }
        `;
        document.head.appendChild(style);
    }
    
    document.body.appendChild(modal);
    
    // Focus on quantity input
    document.getElementById('modal-quantity').focus();
};

// Add to cart from modal
Cart.addFromModal = async (productId) => {
    const quantity = parseInt(document.getElementById('modal-quantity').value);
    
    if (quantity < 1) {
        Toast.error('Quantity must be at least 1');
        return;
    }
    
    await Cart.addItem(productId, quantity);
    
    // Close modal
    document.querySelector('.modal-overlay').remove();
};
