const API_BASE_URL = "https://techsphere-site.onrender.com"; // temporary
export default API_BASE_URL;
// Configuration
const CONFIG = {
    API_BASE_URL: 'http://localhost:5001/api',
    STORAGE_KEYS: {
        AUTH_TOKEN: 'ecommerce_auth_token',
        USER_DATA: 'ecommerce_user_data',
        CART_DATA: 'ecommerce_cart_data'
    },
    TOAST_DURATION: 3000,
    DEBOUNCE_DELAY: 300
};

// API Endpoints
const API_ENDPOINTS = {
    // Auth endpoints
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    PROFILE: '/auth/profile',
    
    // Product endpoints
    PRODUCTS: '/products',
    PRODUCT_DETAIL: (id) => `/products/${id}`,
    
    // Cart endpoints
    CART: '/cart',
    CART_ADD: '/cart/add',
    CART_UPDATE: '/cart/update',
    CART_REMOVE: (productId) => `/cart/remove/${productId}`,
    CART_CLEAR: '/cart/clear',
    
    // Order endpoints
    ORDERS: '/orders',
    ORDER_DETAIL: (id) => `/orders/${id}`,
    MY_ORDERS: '/orders/myorders',
    CANCEL_ORDER: (id) => `/orders/${id}/cancel`
};

// Utility Functions
const Utils = {
    // Format currency
    formatCurrency: (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    },
    
    // Format date
    formatDate: (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    },
    
    // Debounce function
    debounce: (func, wait) => {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },
    
    // Generate unique ID
    generateId: () => {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    },
    
    // Validate email
    isValidEmail: (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    },
    
    // Sanitize HTML
    sanitizeHtml: (str) => {
        const temp = document.createElement('div');
        temp.textContent = str;
        return temp.innerHTML;
    },
    
    // Show/hide loading overlay
    showLoading: () => {
        document.getElementById('loading-overlay').style.display = 'flex';
    },
    
    hideLoading: () => {
        document.getElementById('loading-overlay').style.display = 'none';
    },
    
    // Local storage helpers
    storage: {
        set: (key, value) => {
            try {
                localStorage.setItem(key, JSON.stringify(value));
            } catch (error) {
                console.error('Error saving to localStorage:', error);
            }
        },
        
        get: (key) => {
            try {
                const item = localStorage.getItem(key);
                return item ? JSON.parse(item) : null;
            } catch (error) {
                console.error('Error reading from localStorage:', error);
                return null;
            }
        },
        
        remove: (key) => {
            try {
                localStorage.removeItem(key);
            } catch (error) {
                console.error('Error removing from localStorage:', error);
            }
        },
        
        clear: () => {
            try {
                localStorage.clear();
            } catch (error) {
                console.error('Error clearing localStorage:', error);
            }
        }
    }
};

// Global state management
const AppState = {
    user: null,
    cart: { items: [], totalAmount: 0, totalItems: 0 },
    products: [],
    currentProduct: null,
    isAuthenticated: false,
    
    // Initialize state from localStorage
    init: () => {
        const token = Utils.storage.get(CONFIG.STORAGE_KEYS.AUTH_TOKEN);
        const userData = Utils.storage.get(CONFIG.STORAGE_KEYS.USER_DATA);
        const cartData = Utils.storage.get(CONFIG.STORAGE_KEYS.CART_DATA);
        
        if (token && userData) {
            AppState.user = userData;
            AppState.isAuthenticated = true;
        }
        
        if (cartData) {
            AppState.cart = cartData;
        }
    },
    
    // Update user state
    setUser: (user) => {
        AppState.user = user;
        AppState.isAuthenticated = !!user;
        
        if (user) {
            Utils.storage.set(CONFIG.STORAGE_KEYS.USER_DATA, user);
        } else {
            Utils.storage.remove(CONFIG.STORAGE_KEYS.USER_DATA);
            Utils.storage.remove(CONFIG.STORAGE_KEYS.AUTH_TOKEN);
        }
        
        updateAuthUI();
    },
    
    // Update cart state
    setCart: (cart) => {
        AppState.cart = cart;
        Utils.storage.set(CONFIG.STORAGE_KEYS.CART_DATA, cart);
        updateCartUI();
    },
    
    // Clear all state
    clear: () => {
        AppState.user = null;
        AppState.cart = { items: [], totalAmount: 0, totalItems: 0 };
        AppState.isAuthenticated = false;
        Utils.storage.clear();
        updateAuthUI();
        updateCartUI();
    }
};

// Toast notification system
const Toast = {
    show: (message, type = 'success', title = '') => {
        const container = document.getElementById('toast-container');
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `
            <div class="toast-header">
                <span class="toast-title">${title || (type === 'error' ? 'Error' : type === 'warning' ? 'Warning' : 'Success')}</span>
                <button class="toast-close" onclick="this.parentElement.parentElement.remove()">&times;</button>
            </div>
            <div class="toast-message">${Utils.sanitizeHtml(message)}</div>
        `;
        
        container.appendChild(toast);
        
        // Auto remove after duration
        setTimeout(() => {
            if (toast.parentElement) {
                toast.remove();
            }
        }, CONFIG.TOAST_DURATION);
    },
    
    success: (message, title = 'Success') => Toast.show(message, 'success', title),
    error: (message, title = 'Error') => Toast.show(message, 'error', title),
    warning: (message, title = 'Warning') => Toast.show(message, 'warning', title)
};

// Page navigation with smooth transitions
function showPage(pageId) {
    // Prevent multiple rapid page changes
    if (window.pageTransitioning) return;
    window.pageTransitioning = true;

    // Hide all pages with fade out
    document.querySelectorAll('.page').forEach(page => {
        if (page.classList.contains('active')) {
            page.style.opacity = '0';
            setTimeout(() => {
                page.classList.remove('active');
            }, 150);
        }
    });

    // Show target page with fade in
    setTimeout(() => {
        const targetPage = document.getElementById(`${pageId}-page`);
        if (targetPage) {
            targetPage.classList.add('active');
            setTimeout(() => {
                targetPage.style.opacity = '1';
                window.pageTransitioning = false;
            }, 50);
        } else {
            window.pageTransitioning = false;
        }
    }, 150);

    // Update navigation active state
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
    });

    const activeLink = document.querySelector(`[data-page="${pageId}"]`);
    if (activeLink) {
        activeLink.classList.add('active');
    }

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Handle page-specific logic
    setTimeout(() => {
        switch (pageId) {
            case 'home':
                loadFeaturedProducts();
                break;
            case 'products':
                loadProducts();
                break;
            case 'cart':
                loadCart();
                break;
            case 'login':
            case 'register':
                if (AppState.isAuthenticated) {
                    showPage('home');
                    return;
                }
                break;
            case 'checkout':
                if (!AppState.isAuthenticated) {
                    Toast.warning('Please login to proceed with checkout');
                    showPage('login');
                    return;
                }
                if (AppState.cart.items.length === 0) {
                    Toast.warning('Your cart is empty');
                    showPage('cart');
                    return;
                }
                loadCheckout();
                break;
        }
    }, 200);
}

// Update authentication UI
function updateAuthUI() {
    const authLinks = document.querySelectorAll('.auth-link');
    const userMenu = document.querySelector('.user-menu');
    const userName = document.querySelector('.user-name');
    
    if (AppState.isAuthenticated && AppState.user) {
        authLinks.forEach(link => link.style.display = 'none');
        userMenu.style.display = 'flex';
        userName.textContent = AppState.user.name;
    } else {
        authLinks.forEach(link => link.style.display = 'block');
        userMenu.style.display = 'none';
    }
}

// Update cart UI
function updateCartUI() {
    const cartCount = document.querySelector('.cart-count');
    if (cartCount) {
        cartCount.textContent = AppState.cart.totalItems || 0;
    }
}

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    AppState.init();
    updateAuthUI();
    updateCartUI();
    
    // Set up navigation event listeners
    document.querySelectorAll('[data-page]').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const pageId = link.getAttribute('data-page');
            showPage(pageId);
        });
    });
    
    // Set up logout button
    document.querySelector('.logout-btn')?.addEventListener('click', () => {
        logout();
    });
    
    // Show home page by default
    showPage('home');
});
