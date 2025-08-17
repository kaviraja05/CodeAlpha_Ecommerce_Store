// API Service
const ApiService = {
    // Get auth headers
    getAuthHeaders: () => {
        const token = Utils.storage.get(CONFIG.STORAGE_KEYS.AUTH_TOKEN);
        const headers = {
            'Content-Type': 'application/json'
        };
        
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        
        return headers;
    },
    
    // Generic API request method
    request: async (endpoint, options = {}) => {
        const url = `${CONFIG.API_BASE_URL}${endpoint}`;
        const config = {
            headers: ApiService.getAuthHeaders(),
            ...options
        };
        
        try {
            const response = await fetch(url, config);
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || `HTTP error! status: ${response.status}`);
            }
            
            return data;
        } catch (error) {
            console.error('API request failed:', error);
            throw error;
        }
    },
    
    // GET request
    get: (endpoint) => {
        return ApiService.request(endpoint, { method: 'GET' });
    },
    
    // POST request
    post: (endpoint, data) => {
        return ApiService.request(endpoint, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    },
    
    // PUT request
    put: (endpoint, data) => {
        return ApiService.request(endpoint, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    },
    
    // DELETE request
    delete: (endpoint) => {
        return ApiService.request(endpoint, { method: 'DELETE' });
    },
    
    // Authentication APIs
    auth: {
        login: async (email, password) => {
            try {
                const response = await ApiService.post(API_ENDPOINTS.LOGIN, { email, password });

                if (response.token) {
                    Utils.storage.set(CONFIG.STORAGE_KEYS.AUTH_TOKEN, response.token);
                    AppState.setUser(response.user);
                }

                return response;
            } catch (error) {
                // Re-throw with more specific error message
                if (error.message.includes('401') || error.message.includes('Invalid')) {
                    throw new Error('Invalid email or password. Please try again.');
                }
                throw error;
            }
        },
        
        register: async (name, email, password) => {
            try {
                const response = await ApiService.post(API_ENDPOINTS.REGISTER, { name, email, password });

                if (response.token) {
                    Utils.storage.set(CONFIG.STORAGE_KEYS.AUTH_TOKEN, response.token);
                    AppState.setUser(response.user);
                }

                return response;
            } catch (error) {
                // Re-throw with more specific error message
                if (error.message.includes('E11000')) {
                    throw new Error('Email already exists. Please use a different email.');
                }
                throw error;
            }
        },
        
        getProfile: async () => {
            return await ApiService.get(API_ENDPOINTS.PROFILE);
        },
        
        updateProfile: async (profileData) => {
            return await ApiService.put(API_ENDPOINTS.PROFILE, profileData);
        }
    },
    
    // Product APIs
    products: {
        getAll: async (params = {}) => {
            const queryString = new URLSearchParams(params).toString();
            const endpoint = queryString ? `${API_ENDPOINTS.PRODUCTS}?${queryString}` : API_ENDPOINTS.PRODUCTS;
            return await ApiService.get(endpoint);
        },
        
        getById: async (id) => {
            return await ApiService.get(API_ENDPOINTS.PRODUCT_DETAIL(id));
        },
        
        search: async (query, filters = {}) => {
            const params = { search: query, ...filters };
            return await ApiService.products.getAll(params);
        }
    },
    
    // Cart APIs
    cart: {
        get: async () => {
            try {
                const response = await ApiService.get(API_ENDPOINTS.CART);
                AppState.setCart(response);
                return response;
            } catch (error) {
                // If user is not authenticated, return empty cart
                if (error.message.includes('Not authorized')) {
                    const emptyCart = { items: [], totalAmount: 0, totalItems: 0 };
                    AppState.setCart(emptyCart);
                    return emptyCart;
                }
                throw error;
            }
        },
        
        add: async (productId, quantity = 1) => {
            const response = await ApiService.post(API_ENDPOINTS.CART_ADD, { productId, quantity });
            AppState.setCart(response.cart);
            return response;
        },
        
        update: async (productId, quantity) => {
            const response = await ApiService.put(API_ENDPOINTS.CART_UPDATE, { productId, quantity });
            AppState.setCart(response.cart);
            return response;
        },
        
        remove: async (productId) => {
            const response = await ApiService.delete(API_ENDPOINTS.CART_REMOVE(productId));
            AppState.setCart(response.cart);
            return response;
        },
        
        clear: async () => {
            const response = await ApiService.delete(API_ENDPOINTS.CART_CLEAR);
            AppState.setCart(response.cart);
            return response;
        }
    },
    
    // Order APIs
    orders: {
        create: async (orderData) => {
            return await ApiService.post(API_ENDPOINTS.ORDERS, orderData);
        },
        
        getMyOrders: async (params = {}) => {
            const queryString = new URLSearchParams(params).toString();
            const endpoint = queryString ? `${API_ENDPOINTS.MY_ORDERS}?${queryString}` : API_ENDPOINTS.MY_ORDERS;
            return await ApiService.get(endpoint);
        },
        
        getById: async (id) => {
            return await ApiService.get(API_ENDPOINTS.ORDER_DETAIL(id));
        },
        
        cancel: async (id) => {
            return await ApiService.put(API_ENDPOINTS.CANCEL_ORDER(id));
        }
    }
};

// Error handling wrapper for API calls
const handleApiCall = async (apiCall, loadingElement = null) => {
    try {
        if (loadingElement) {
            loadingElement.style.display = 'block';
        } else {
            Utils.showLoading();
        }
        
        const result = await apiCall();
        return result;
    } catch (error) {
        console.error('API call failed:', error);
        
        // Handle specific error cases
        if (error.message.includes('Not authorized')) {
            Toast.error('Please login to continue');
            AppState.clear();
            showPage('login');
        } else if (error.message.includes('Network')) {
            Toast.error('Network error. Please check your connection.');
        } else {
            Toast.error(error.message || 'An unexpected error occurred');
        }
        
        throw error;
    } finally {
        if (loadingElement) {
            loadingElement.style.display = 'none';
        } else {
            Utils.hideLoading();
        }
    }
};

// Retry mechanism for failed requests
const retryApiCall = async (apiCall, maxRetries = 3, delay = 1000) => {
    for (let i = 0; i < maxRetries; i++) {
        try {
            return await apiCall();
        } catch (error) {
            if (i === maxRetries - 1) {
                throw error;
            }
            
            // Wait before retrying
            await new Promise(resolve => setTimeout(resolve, delay * (i + 1)));
        }
    }
};

// Network status monitoring
let isOnline = navigator.onLine;

window.addEventListener('online', () => {
    isOnline = true;
    Toast.success('Connection restored');
});

window.addEventListener('offline', () => {
    isOnline = false;
    Toast.warning('You are offline. Some features may not work.');
});

// Check if online before making API calls
const checkOnlineStatus = () => {
    if (!isOnline) {
        Toast.warning('You are offline. Please check your internet connection.');
        return false;
    }
    return true;
};
