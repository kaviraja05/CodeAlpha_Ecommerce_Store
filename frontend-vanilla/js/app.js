// Main application initialization and global functionality
class EcommerceApp {
    constructor() {
        this.isInitialized = false;
        this.init();
    }
    
    // Initialize the application
    async init() {
        if (this.isInitialized) return;
        
        try {
            // Wait for DOM to be ready
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', () => this.init());
                return;
            }
            
            // Initialize app state
            AppState.init();
            
            // Setup global event listeners
            this.setupGlobalEventListeners();
            
            // Setup error handling
            this.setupErrorHandling();
            
            // Initialize components
            await this.initializeComponents();
            
            // Setup keyboard shortcuts
            this.setupKeyboardShortcuts();
            
            // Setup service worker (for future PWA features)
            this.setupServiceWorker();
            
            this.isInitialized = true;
            console.log('🚀 Ecommerce App initialized successfully');
            
        } catch (error) {
            console.error('❌ Failed to initialize app:', error);
            Toast.error('Failed to initialize application');
        }
    }
    
    // Setup global event listeners
    setupGlobalEventListeners() {
        // Handle navigation
        document.addEventListener('click', (e) => {
            const link = e.target.closest('[data-page]');
            if (link) {
                e.preventDefault();
                const pageId = link.getAttribute('data-page');
                showPage(pageId);
            }
        });
        
        // Handle form submissions
        document.addEventListener('submit', (e) => {
            const form = e.target;
            if (form.classList.contains('prevent-default')) {
                e.preventDefault();
            }
        });
        
        // Handle escape key to close modals
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                const modal = document.querySelector('.modal-overlay');
                if (modal) {
                    modal.remove();
                }
            }
        });
        
        // Handle click outside modal to close
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal-overlay')) {
                e.target.remove();
            }
        });
        
        // Handle online/offline status
        window.addEventListener('online', () => {
            document.body.classList.remove('offline');
            Toast.success('Connection restored');
        });
        
        window.addEventListener('offline', () => {
            document.body.classList.add('offline');
            Toast.warning('You are offline');
        });
        
        // Handle visibility change (tab switching)
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden && AppState.isAuthenticated) {
                // Refresh cart when user returns to tab
                this.refreshUserData();
            }
        });
    }
    
    // Setup error handling
    setupErrorHandling() {
        // Global error handler
        window.addEventListener('error', (e) => {
            console.error('Global error:', e.error);
            Toast.error('An unexpected error occurred');
        });
        
        // Unhandled promise rejection handler
        window.addEventListener('unhandledrejection', (e) => {
            console.error('Unhandled promise rejection:', e.reason);
            Toast.error('An unexpected error occurred');
            e.preventDefault();
        });
    }
    
    // Initialize components
    async initializeComponents() {
        // Initialize authentication
        Auth.init();
        
        // Validate existing authentication
        const token = Utils.storage.get(CONFIG.STORAGE_KEYS.AUTH_TOKEN);
        if (token) {
            try {
                await Auth.validateAuth();
                if (AppState.isAuthenticated) {
                    await ApiService.cart.get();
                }
            } catch (error) {
                console.error('Auth validation failed:', error);
            }
        }
        
        // Update UI
        updateAuthUI();
        updateCartUI();
        
        // Setup search functionality
        Products.setupSearchAndFilter();
        
        // Show initial page
        const hash = window.location.hash.slice(1);
        const initialPage = hash || 'home';
        showPage(initialPage);
    }
    
    // Setup keyboard shortcuts
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Only handle shortcuts when not typing in inputs
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
                return;
            }
            
            // Ctrl/Cmd + shortcuts
            if (e.ctrlKey || e.metaKey) {
                switch (e.key) {
                    case 'h':
                        e.preventDefault();
                        showPage('home');
                        break;
                    case 'p':
                        e.preventDefault();
                        showPage('products');
                        break;
                    case 'c':
                        e.preventDefault();
                        showPage('cart');
                        break;
                    case 'l':
                        e.preventDefault();
                        if (AppState.isAuthenticated) {
                            logout();
                        } else {
                            showPage('login');
                        }
                        break;
                }
            }
            
            // Search shortcut
            if (e.key === '/' && !e.ctrlKey && !e.metaKey) {
                e.preventDefault();
                const searchInput = document.getElementById('search-input');
                if (searchInput) {
                    showPage('products');
                    setTimeout(() => searchInput.focus(), 100);
                }
            }
        });
    }
    
    // Setup service worker for PWA features
    setupServiceWorker() {
        if ('serviceWorker' in navigator) {
            // Register service worker when available
            // navigator.serviceWorker.register('/sw.js')
            //     .then(registration => console.log('SW registered:', registration))
            //     .catch(error => console.log('SW registration failed:', error));
        }
    }
    
    // Refresh user data
    async refreshUserData() {
        if (!AppState.isAuthenticated) return;
        
        try {
            await ApiService.cart.get();
        } catch (error) {
            console.error('Failed to refresh user data:', error);
        }
    }
    
    // Handle app updates
    handleAppUpdate() {
        // Check for app updates and notify user
        Toast.success('App updated! Refresh to get the latest version.', 'Update Available');
    }
}

// Utility functions for common UI operations
const UIUtils = {
    // Show confirmation dialog
    confirm: (message, title = 'Confirm') => {
        return new Promise((resolve) => {
            const modal = document.createElement('div');
            modal.className = 'modal-overlay';
            modal.innerHTML = `
                <div class="modal-content confirm-modal">
                    <div class="modal-header">
                        <h3>${Utils.sanitizeHtml(title)}</h3>
                    </div>
                    <div class="modal-body">
                        <p>${Utils.sanitizeHtml(message)}</p>
                    </div>
                    <div class="modal-footer">
                        <button class="modal-btn secondary" onclick="UIUtils.resolveConfirm(false)">Cancel</button>
                        <button class="modal-btn primary" onclick="UIUtils.resolveConfirm(true)">Confirm</button>
                    </div>
                </div>
            `;
            
            document.body.appendChild(modal);
            
            // Store resolve function for button handlers
            UIUtils._confirmResolve = resolve;
        });
    },
    
    // Resolve confirmation dialog
    resolveConfirm: (result) => {
        if (UIUtils._confirmResolve) {
            UIUtils._confirmResolve(result);
            UIUtils._confirmResolve = null;
        }
        
        const modal = document.querySelector('.confirm-modal').closest('.modal-overlay');
        if (modal) {
            modal.remove();
        }
    },
    
    // Show loading state for an element
    showElementLoading: (element, text = 'Loading...') => {
        if (!element) return;
        
        element.dataset.originalContent = element.innerHTML;
        element.innerHTML = `
            <div class="element-loading">
                <div class="spinner-small"></div>
                <span>${text}</span>
            </div>
        `;
        element.disabled = true;
    },
    
    // Hide loading state for an element
    hideElementLoading: (element) => {
        if (!element || !element.dataset.originalContent) return;
        
        element.innerHTML = element.dataset.originalContent;
        element.disabled = false;
        delete element.dataset.originalContent;
    },
    
    // Smooth scroll to element
    scrollToElement: (element, offset = 0) => {
        if (!element) return;
        
        const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
        const offsetPosition = elementPosition - offset;
        
        window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
        });
    }
};

// Add small spinner styles
const addSpinnerStyles = () => {
    if (document.querySelector('#spinner-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'spinner-styles';
    style.textContent = `
        .element-loading {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: var(--spacing-2);
        }
        
        .spinner-small {
            width: 16px;
            height: 16px;
            border: 2px solid var(--gray-300);
            border-top: 2px solid var(--primary-color);
            border-radius: 50%;
            animation: spin 1s linear infinite;
        }
        
        .confirm-modal {
            max-width: 400px;
        }
        
        .confirm-modal .modal-body {
            text-align: center;
        }
        
        .offline {
            filter: grayscale(0.5);
        }
        
        .offline::before {
            content: 'You are offline';
            position: fixed;
            top: 70px;
            left: 50%;
            transform: translateX(-50%);
            background: var(--warning-color);
            color: var(--white);
            padding: var(--spacing-2) var(--spacing-4);
            border-radius: var(--radius-md);
            z-index: 1000;
            font-size: var(--font-size-sm);
        }
    `;
    document.head.appendChild(style);
};

// Hide preloader and initialize the application
document.addEventListener('DOMContentLoaded', () => {
    // Minimum loading time for better UX
    setTimeout(() => {
        const preloader = document.getElementById('app-preloader');
        if (preloader) {
            preloader.classList.add('hidden');
            setTimeout(() => {
                preloader.remove();
            }, 500);
        }
    }, 1500);
});

// Initialize the application
const app = new EcommerceApp();

// Add spinner styles
addSpinnerStyles();

// Export for global access
window.EcommerceApp = EcommerceApp;
window.UIUtils = UIUtils;

// Handle page hash changes
window.addEventListener('hashchange', () => {
    const page = window.location.hash.slice(1) || 'home';
    showPage(page);
});

// Performance monitoring
const performanceObserver = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
        if (entry.entryType === 'navigation') {
            console.log(`Page load time: ${entry.loadEventEnd - entry.loadEventStart}ms`);
        }
    }
});

if ('PerformanceObserver' in window) {
    performanceObserver.observe({ entryTypes: ['navigation'] });
}

console.log('🌐 TechSphere - Your Premium Tech Marketplace is Ready!');
