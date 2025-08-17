// Checkout functionality
const Checkout = {
    // Initialize checkout form
    init: () => {
        Checkout.setupForm();
        Checkout.loadUserData();
    },
    
    // Setup checkout form submission
    setupForm: () => {
        const checkoutForm = document.getElementById('checkout-form');
        if (!checkoutForm) return;
        
        checkoutForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            await Checkout.processOrder();
        });
    },
    
    // Load user data into form
    loadUserData: () => {
        if (!Auth.isAuthenticated()) return;
        
        const user = Auth.getCurrentUser();
        if (!user) return;
        
        // Pre-fill form with user data
        const nameInput = document.getElementById('checkout-name');
        const phoneInput = document.getElementById('checkout-phone');
        
        if (nameInput && user.name) {
            nameInput.value = user.name;
        }
        
        if (phoneInput && user.phone) {
            phoneInput.value = user.phone;
        }
        
        // Pre-fill address if available
        if (user.address) {
            const addressInput = document.getElementById('checkout-address');
            const cityInput = document.getElementById('checkout-city');
            const stateInput = document.getElementById('checkout-state');
            const zipInput = document.getElementById('checkout-zip');
            
            if (addressInput && user.address.street) {
                addressInput.value = user.address.street;
            }
            if (cityInput && user.address.city) {
                cityInput.value = user.address.city;
            }
            if (stateInput && user.address.state) {
                stateInput.value = user.address.state;
            }
            if (zipInput && user.address.zipCode) {
                zipInput.value = user.address.zipCode;
            }
        }
    },
    
    // Validate checkout form
    validateForm: () => {
        const requiredFields = [
            'checkout-name',
            'checkout-address',
            'checkout-city',
            'checkout-state',
            'checkout-zip',
            'payment-method'
        ];
        
        for (const fieldId of requiredFields) {
            const field = document.getElementById(fieldId);
            if (!field || !field.value.trim()) {
                const label = field?.previousElementSibling?.textContent || fieldId;
                Toast.error(`${label} is required`);
                field?.focus();
                return false;
            }
        }
        
        // Validate zip/postal code
        // Accept common formats: 5-digit US, 5+4 US, and 6-digit PINs (e.g., India)
        const zipCode = document.getElementById('checkout-zip').value.trim();
        const zipRegex = /^(\d{5}(-\d{4})?|\d{6})$/;
        if (!zipRegex.test(zipCode)) {
            Toast.error('Please enter a valid zip/postal code');
            document.getElementById('checkout-zip').focus();
            return false;
        }
        
        // Validate phone number if provided
        const phone = document.getElementById('checkout-phone').value.trim();
        if (phone) {
            const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
            if (!phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''))) {
                Toast.error('Please enter a valid phone number');
                document.getElementById('checkout-phone').focus();
                return false;
            }
        }
        
        return true;
    },
    
    // Process order
    processOrder: async () => {
        // Validate cart
        if (!Cart.validateCart()) {
            showPage('cart');
            return;
        }
        
        // Validate form
        if (!Checkout.validateForm()) {
            return;
        }
        
        // Collect form data
        const orderData = {
            shippingAddress: {
                fullName: document.getElementById('checkout-name').value.trim(),
                address: document.getElementById('checkout-address').value.trim(),
                city: document.getElementById('checkout-city').value.trim(),
                state: document.getElementById('checkout-state').value.trim(),
                zipCode: document.getElementById('checkout-zip').value.trim(),
                phone: document.getElementById('checkout-phone').value.trim()
            },
            paymentMethod: document.getElementById('payment-method').value
        };
        
        try {
            await handleApiCall(async () => {
                const response = await ApiService.orders.create(orderData);
                
                // Clear cart after successful order
                AppState.setCart({ items: [], totalAmount: 0, totalItems: 0 });
                
                // Show success message
                Checkout.showOrderSuccess(response.order);
                
                return response;
            });
        } catch (error) {
            // Error is already handled in handleApiCall
        }
    },
    
    // Show order success page
    showOrderSuccess: (order) => {
        const checkoutPage = document.getElementById('checkout-page');
        if (!checkoutPage) return;
        
        checkoutPage.innerHTML = `
            <div class="container">
                <div class="order-success">
                    <div class="success-icon">
                        <i class="fas fa-check-circle"></i>
                    </div>
                    <h1>Order Placed Successfully!</h1>
                    <p>Thank you for your order. We'll send you a confirmation email shortly.</p>
                    
                    <div class="order-details">
                        <h3>Order Details</h3>
                        <div class="order-info">
                            <div class="info-row">
                                <span>Order ID:</span>
                                <span class="order-id">${order._id}</span>
                            </div>
                            <div class="info-row">
                                <span>Total Amount:</span>
                                <span class="order-total">${Utils.formatCurrency(order.totalPrice)}</span>
                            </div>
                            <div class="info-row">
                                <span>Payment Method:</span>
                                <span>${order.paymentMethod}</span>
                            </div>
                            <div class="info-row">
                                <span>Status:</span>
                                <span class="order-status">${order.status}</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="order-actions">
                        <button class="cta-button" onclick="showPage('home')">Continue Shopping</button>
                        <button class="secondary-button" onclick="Checkout.viewOrderDetails('${order._id}')">View Order Details</button>
                    </div>
                </div>
            </div>
        `;
        
        // Add success page styles
        if (!document.querySelector('#order-success-styles')) {
            const style = document.createElement('style');
            style.id = 'order-success-styles';
            style.textContent = `
                .order-success {
                    text-align: center;
                    max-width: 600px;
                    margin: 0 auto;
                    padding: var(--spacing-8);
                }
                
                .success-icon {
                    font-size: 4rem;
                    color: var(--success-color);
                    margin-bottom: var(--spacing-6);
                }
                
                .order-success h1 {
                    color: var(--gray-800);
                    margin-bottom: var(--spacing-4);
                }
                
                .order-success p {
                    color: var(--gray-600);
                    margin-bottom: var(--spacing-8);
                    font-size: var(--font-size-lg);
                }
                
                .order-details {
                    background: var(--white);
                    border-radius: var(--radius-lg);
                    padding: var(--spacing-6);
                    margin-bottom: var(--spacing-8);
                    box-shadow: var(--shadow-md);
                    text-align: left;
                }
                
                .order-details h3 {
                    margin-bottom: var(--spacing-4);
                    color: var(--gray-800);
                    text-align: center;
                }
                
                .info-row {
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: var(--spacing-3);
                    padding-bottom: var(--spacing-3);
                    border-bottom: 1px solid var(--gray-200);
                }
                
                .info-row:last-child {
                    border-bottom: none;
                    margin-bottom: 0;
                    padding-bottom: 0;
                }
                
                .order-id {
                    font-family: monospace;
                    background: var(--gray-100);
                    padding: var(--spacing-1) var(--spacing-2);
                    border-radius: var(--radius-sm);
                }
                
                .order-total {
                    font-weight: 700;
                    color: var(--primary-color);
                }
                
                .order-status {
                    text-transform: capitalize;
                    font-weight: 500;
                    color: var(--success-color);
                }
                
                .order-actions {
                    display: flex;
                    gap: var(--spacing-4);
                    justify-content: center;
                    flex-wrap: wrap;
                }
                
                .secondary-button {
                    background: var(--gray-200);
                    color: var(--gray-700);
                    border: none;
                    padding: var(--spacing-4) var(--spacing-8);
                    font-size: var(--font-size-lg);
                    font-weight: 600;
                    border-radius: var(--radius-lg);
                    cursor: pointer;
                    transition: all var(--transition-fast);
                }
                
                .secondary-button:hover {
                    background: var(--gray-300);
                }
                
                @media (max-width: 768px) {
                    .order-actions {
                        flex-direction: column;
                    }
                    
                    .order-actions button {
                        width: 100%;
                    }
                }
            `;
            document.head.appendChild(style);
        }
    },
    
    // View order details (placeholder for future implementation)
    viewOrderDetails: (orderId) => {
        Toast.success(`Order details for ${orderId} - Feature coming soon!`);
    },
    
    // Render checkout summary
    renderCheckoutSummary: () => {
        const checkoutSummary = document.getElementById('checkout-summary');
        if (!checkoutSummary) return;
        
        const cart = AppState.cart;
        const totals = Cart.getCartTotal();
        
        checkoutSummary.innerHTML = `
            <div class="checkout-items">
                <h4>Items (${totals.itemCount})</h4>
                ${cart.items.map(item => `
                    <div class="checkout-item">
                        <img src="${item.product.image}" alt="${item.product.name}" class="checkout-item-image">
                        <div class="checkout-item-info">
                            <div class="checkout-item-name">${Utils.sanitizeHtml(item.product.name)}</div>
                            <div class="checkout-item-details">
                                ${item.quantity} × ${Utils.formatCurrency(item.price)}
                            </div>
                        </div>
                        <div class="checkout-item-total">
                            ${Utils.formatCurrency(item.price * item.quantity)}
                        </div>
                    </div>
                `).join('')}
            </div>
            
            <div class="checkout-totals">
                <div class="total-row">
                    <span>Subtotal:</span>
                    <span>${Utils.formatCurrency(totals.subtotal)}</span>
                </div>
                <div class="total-row">
                    <span>Shipping:</span>
                    <span>${totals.shipping === 0 ? 'FREE' : Utils.formatCurrency(totals.shipping)}</span>
                </div>
                <div class="total-row">
                    <span>Tax:</span>
                    <span>${Utils.formatCurrency(totals.tax)}</span>
                </div>
                <div class="total-row final-total">
                    <span>Total:</span>
                    <span>${Utils.formatCurrency(totals.total)}</span>
                </div>
            </div>
        `;
        
        // Add checkout summary styles
        if (!document.querySelector('#checkout-summary-styles')) {
            const style = document.createElement('style');
            style.id = 'checkout-summary-styles';
            style.textContent = `
                .checkout-items {
                    margin-bottom: var(--spacing-6);
                }
                
                .checkout-items h4 {
                    margin-bottom: var(--spacing-4);
                    color: var(--gray-800);
                }
                
                .checkout-item {
                    display: flex;
                    align-items: center;
                    gap: var(--spacing-3);
                    margin-bottom: var(--spacing-4);
                    padding-bottom: var(--spacing-4);
                    border-bottom: 1px solid var(--gray-200);
                }
                
                .checkout-item:last-child {
                    border-bottom: none;
                    margin-bottom: 0;
                    padding-bottom: 0;
                }
                
                .checkout-item-image {
                    width: 50px;
                    height: 50px;
                    object-fit: cover;
                    border-radius: var(--radius-md);
                }
                
                .checkout-item-info {
                    flex: 1;
                }
                
                .checkout-item-name {
                    font-weight: 500;
                    color: var(--gray-800);
                    margin-bottom: var(--spacing-1);
                }
                
                .checkout-item-details {
                    font-size: var(--font-size-sm);
                    color: var(--gray-600);
                }
                
                .checkout-item-total {
                    font-weight: 600;
                    color: var(--primary-color);
                }
                
                .checkout-totals {
                    border-top: 1px solid var(--gray-200);
                    padding-top: var(--spacing-4);
                }
                
                .total-row {
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: var(--spacing-3);
                }
                
                .total-row.final-total {
                    font-weight: 700;
                    font-size: var(--font-size-lg);
                    border-top: 1px solid var(--gray-200);
                    padding-top: var(--spacing-3);
                    margin-top: var(--spacing-3);
                }
            `;
            document.head.appendChild(style);
        }
    }
};

// Load checkout page
const loadCheckout = () => {
    if (!Auth.requireAuth()) return;
    
    if (!Cart.validateCart()) {
        showPage('cart');
        return;
    }
    
    Checkout.init();
    Checkout.renderCheckoutSummary();
};

// Initialize checkout functionality
document.addEventListener('DOMContentLoaded', () => {
    // Auto-fill form when user data changes
    document.addEventListener('userDataChanged', () => {
        Checkout.loadUserData();
    });
});
