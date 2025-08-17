// Products functionality
const Products = {
    currentPage: 1,
    currentSearch: '',
    currentSort: '',
    
    // Load and display products
    loadProducts: async (page = 1) => {
        const productsGrid = document.getElementById('products-grid');
        const loadingElement = document.getElementById('loading');
        const productsPage = document.getElementById('products-page');

        if (!productsGrid) return;

        Products.currentPage = page;

        // Show loading state
        if (productsPage) {
            productsPage.classList.add('loading');
        }

        try {
            await handleApiCall(async () => {
                const params = {
                    page,
                    limit: 50 // Load more products to enable client-side filtering
                };

                const response = await ApiService.products.getAll(params);
                AppState.products = response.products || response; // Handle both paginated and simple responses

                // Small delay to prevent flashing
                await new Promise(resolve => setTimeout(resolve, 100));

                // Apply current filters
                Products.filterAndDisplayProducts();

                // Render pagination if available
                if (response.pagination) {
                    Products.renderPagination(response.pagination);
                }

                return response;
            }, loadingElement);
        } catch (error) {
            productsGrid.innerHTML = `
                <div class="error-message">
                    <i class="fas fa-exclamation-triangle"></i>
                    <h3>Failed to load products</h3>
                    <p>Please try again later</p>
                    <button class="cta-button" onclick="Products.loadProducts()">Retry</button>
                </div>
            `;
        } finally {
            // Remove loading state
            if (productsPage) {
                productsPage.classList.remove('loading');
            }
        }
    },
    
    // Render products grid
    renderProducts: (products) => {
        const productsGrid = document.getElementById('products-grid');
        if (!productsGrid) return;

        if (!products || products.length === 0) {
            productsGrid.innerHTML = `
                <div class="no-products">
                    <i class="fas fa-search"></i>
                    <h3>No products found</h3>
                    <p>Try adjusting your search or filters</p>
                </div>
            `;
            return;
        }

        // Exclude Accessories category entirely
        const visibleProducts = products.filter(p => String(p.category).trim().toLowerCase() !== 'accessories');
        // Group products by category
        const productsByCategory = visibleProducts.reduce((acc, product) => {
            const category = product.category || 'Uncategorized';
            if (!acc[category]) {
                acc[category] = [];
            }
            acc[category].push(product);
            return acc;
        }, {});

        // Render products by category
        const categoryOrder = ['Smartphones', 'Laptops', 'Tablets', 'Audio', 'Wearables', 'Gaming'];
        let html = '';

        categoryOrder.forEach(category => {
            if (productsByCategory[category] && productsByCategory[category].length > 0) {
                html += Products.renderCategorySection(category, productsByCategory[category]);
            }
        });

        // Add any remaining categories not in the order
        Object.keys(productsByCategory).forEach(category => {
            if (!categoryOrder.includes(category) && String(category).trim().toLowerCase() !== 'accessories') {
                html += Products.renderCategorySection(category, productsByCategory[category]);
            }
        });

        productsGrid.innerHTML = html;
    },

    // Render category section
    renderCategorySection: (category, products) => {
        const categoryIcons = {
            'Smartphones': 'fas fa-mobile-alt',
            'Laptops': 'fas fa-laptop',
            'Tablets': 'fas fa-tablet-alt',
            'Audio': 'fas fa-headphones',
            'Wearables': 'fas fa-watch',
            'Gaming': 'fas fa-gamepad',
            'Accessories': 'fas fa-plug'
        };

        const icon = categoryIcons[category] || 'fas fa-box';

        const isAccessories = String(category).trim().toLowerCase() === 'accessories';
        return `
            <div class="category-section">
                <div class="category-header">
                    <div class="category-title">
                        <div class="category-icon">
                            <i class="${icon}"></i>
                        </div>
                        <h2>${category}</h2>
                    </div>
                    <div class="category-count">${products.length} items</div>
                </div>
                <div class="products-grid ${isAccessories ? 'horizontal-scroll' : ''}">
                    ${products.map(product => Products.renderProductCard(product)).join('')}
                </div>
            </div>
        `;
    },
    
    // Render individual product card
    renderProductCard: (product) => {
        try {
            const isOutOfStock = product.countInStock === 0;
            const category = product.category || 'Uncategorized';
            const productName = Utils.sanitizeHtml(product.name || 'Unknown Product');
            const productDescription = Utils.sanitizeHtml(product.description || 'No description available');
            const productPrice = product.price ? Utils.formatCurrency(product.price) : 'Price not available';
            const productImage = product.image || 'https://via.placeholder.com/320x240?text=No+Image';

            return `
                <div class="product-card" onclick="Products.showProductDetail('${product._id}')">
                    <div class="product-image-container">
                        <img src="${productImage}" alt="${productName}" class="product-image"
                             onerror="this.src='https://via.placeholder.com/320x240?text=No+Image&color=666&bg=f0f0f0'">
                        <div class="product-category-badge">${category}</div>
                        ${isOutOfStock ? '<div class="out-of-stock-overlay">Out of Stock</div>' : ''}
                    </div>
                    <div class="product-info">
                        <h3 class="product-name">${productName}</h3>
                        <p class="product-description">${productDescription}</p>
                        <div class="product-footer">
                            <div class="product-pricing">
                                <div class="product-price">${productPrice}</div>
                                <div class="product-stock ${isOutOfStock ? 'out-of-stock' : 'in-stock'}">
                                    ${isOutOfStock ? 'Out of Stock' : `${product.countInStock || 0} available`}
                                </div>
                            </div>
                            <button class="add-to-cart-btn"
                                    onclick="event.stopPropagation(); Products.quickAddToCart('${product._id}')"
                                    ${isOutOfStock ? 'disabled' : ''}
                                    title="${isOutOfStock ? 'Out of Stock' : 'Add to Cart'}">
                                <i class="fas fa-cart-plus"></i>
                                <span>Add to Cart</span>
                            </button>
                        </div>
                    </div>
                </div>
            `;
        } catch (error) {
            console.error('Error rendering product card:', error);
            return `
                <div class="product-card error-card">
                    <div class="product-info">
                        <h3>Error loading product</h3>
                        <p>Unable to display this product</p>
                    </div>
                </div>
            `;
        }
    },
    
    // Quick add to cart (single item)
    quickAddToCart: async (productId) => {
        if (!Auth.requireAuth()) return;
        
        await Cart.addItem(productId, 1);
    },
    
    // Show product detail page
    showProductDetail: async (productId) => {
        try {
            await handleApiCall(async () => {
                const product = await ApiService.products.getById(productId);
                AppState.currentProduct = product;
                Products.renderProductDetail(product);
                showPage('product-detail');
                return product;
            });
        } catch (error) {
            Toast.error('Failed to load product details');
        }
    },
    
    // Render product detail page
    renderProductDetail: (product) => {
        const productDetail = document.getElementById('product-detail');
        if (!productDetail) return;
        
        const isOutOfStock = product.countInStock === 0;
        
        productDetail.innerHTML = `
            <img src="${product.image}" alt="${product.name}" class="product-detail-image"
                 onerror="this.src='https://via.placeholder.com/400x400?text=No+Image'">
            <div class="product-detail-info">
                <h1>${Utils.sanitizeHtml(product.name)}</h1>
                <div class="product-detail-price">${Utils.formatCurrency(product.price)}</div>
                <div class="product-detail-stock ${isOutOfStock ? 'out-of-stock' : 'in-stock'}">
                    ${isOutOfStock ? 'Out of Stock' : `${product.countInStock} items available`}
                </div>
                <div class="product-detail-description">
                    <p>${Utils.sanitizeHtml(product.description || 'No description available.')}</p>
                </div>
                <div class="quantity-selector">
                    <label for="detail-quantity">Quantity:</label>
                    <input type="number" id="detail-quantity" min="1" max="${product.countInStock}" value="1" ${isOutOfStock ? 'disabled' : ''}>
                </div>
                <button class="add-to-cart-detail" 
                        onclick="Products.addToCartFromDetail('${product._id}')"
                        ${isOutOfStock ? 'disabled' : ''}>
                    ${isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
                </button>
            </div>
        `;
    },
    
    // Add to cart from product detail page
    addToCartFromDetail: async (productId) => {
        if (!Auth.requireAuth()) return;
        
        const quantityInput = document.getElementById('detail-quantity');
        const quantity = parseInt(quantityInput.value);
        
        if (quantity < 1) {
            Toast.error('Quantity must be at least 1');
            return;
        }
        
        if (quantity > AppState.currentProduct.countInStock) {
            Toast.error(`Only ${AppState.currentProduct.countInStock} items available`);
            return;
        }
        
        await Cart.addItem(productId, quantity);
    },
    
    // Render pagination
    renderPagination: (pagination) => {
        const productsGrid = document.getElementById('products-grid');
        if (!productsGrid || !pagination || pagination.pages <= 1) return;
        
        const paginationHtml = `
            <div class="pagination">
                <button class="pagination-btn" 
                        onclick="Products.loadProducts(${pagination.page - 1}, '${Products.currentSearch}', '${Products.currentSort}')"
                        ${pagination.page <= 1 ? 'disabled' : ''}>
                    <i class="fas fa-chevron-left"></i> Previous
                </button>
                <span class="pagination-info">
                    Page ${pagination.page} of ${pagination.pages} (${pagination.total} products)
                </span>
                <button class="pagination-btn" 
                        onclick="Products.loadProducts(${pagination.page + 1}, '${Products.currentSearch}', '${Products.currentSort}')"
                        ${pagination.page >= pagination.pages ? 'disabled' : ''}>
                    Next <i class="fas fa-chevron-right"></i>
                </button>
            </div>
        `;
        
        productsGrid.insertAdjacentHTML('afterend', paginationHtml);
        
        // Add pagination styles
        if (!document.querySelector('#pagination-styles')) {
            const style = document.createElement('style');
            style.id = 'pagination-styles';
            style.textContent = `
                .pagination {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-top: var(--spacing-8);
                    padding: var(--spacing-4);
                    background: var(--white);
                    border-radius: var(--radius-lg);
                    box-shadow: var(--shadow-sm);
                }
                
                .pagination-btn {
                    background: var(--primary-color);
                    color: var(--white);
                    border: none;
                    padding: var(--spacing-3) var(--spacing-4);
                    border-radius: var(--radius-md);
                    cursor: pointer;
                    transition: all var(--transition-fast);
                    display: flex;
                    align-items: center;
                    gap: var(--spacing-2);
                }
                
                .pagination-btn:hover:not(:disabled) {
                    background: var(--primary-dark);
                }
                
                .pagination-btn:disabled {
                    background: var(--gray-400);
                    cursor: not-allowed;
                }
                
                .pagination-info {
                    color: var(--gray-600);
                    font-weight: 500;
                }
                
                @media (max-width: 768px) {
                    .pagination {
                        flex-direction: column;
                        gap: var(--spacing-3);
                    }
                }
            `;
            document.head.appendChild(style);
        }
    },
    
    // Setup search and filter functionality
    setupSearchAndFilter: () => {
        const searchInput = document.getElementById('search-input');
        const sortSelect = document.getElementById('sort-select');
        const categoryFilter = document.getElementById('category-filter');

        if (searchInput) {
            const debouncedSearch = Utils.debounce(() => {
                Products.filterAndDisplayProducts();
            }, CONFIG.DEBOUNCE_DELAY);

            searchInput.addEventListener('input', debouncedSearch);
        }

        if (sortSelect) {
            sortSelect.addEventListener('change', () => {
                Products.filterAndDisplayProducts();
            });
        }

        if (categoryFilter) {
            categoryFilter.addEventListener('change', () => {
                Products.filterAndDisplayProducts();
            });
        }
    },

    // Filter and display products based on current filters
    filterAndDisplayProducts: () => {
        const searchInput = document.getElementById('search-input');
        const sortSelect = document.getElementById('sort-select');
        const categoryFilter = document.getElementById('category-filter');

        const searchQuery = searchInput ? searchInput.value.trim().toLowerCase() : '';
        const sortValue = sortSelect ? sortSelect.value : '';
        const categoryValue = categoryFilter ? categoryFilter.value : '';

        let filteredProducts = [...AppState.products];

        // Apply search filter
        if (searchQuery) {
            filteredProducts = filteredProducts.filter(product =>
                product.name.toLowerCase().includes(searchQuery) ||
                product.description.toLowerCase().includes(searchQuery) ||
                product.category.toLowerCase().includes(searchQuery)
            );
        }

        // Apply category filter
        if (categoryValue) {
            filteredProducts = filteredProducts.filter(product =>
                product.category === categoryValue
            );
        }

        // Apply sorting
        if (sortValue) {
            switch (sortValue) {
                case 'price-low':
                    filteredProducts.sort((a, b) => a.price - b.price);
                    break;
                case 'price-high':
                    filteredProducts.sort((a, b) => b.price - a.price);
                    break;
                case 'name':
                    filteredProducts.sort((a, b) => a.name.localeCompare(b.name));
                    break;
            }
        }

        Products.renderProducts(filteredProducts);
    }
};

// Load products when products page is shown
const loadProducts = async () => {
    // Remove any existing pagination
    const existingPagination = document.querySelector('.pagination');
    if (existingPagination) {
        existingPagination.remove();
    }
    
    await Products.loadProducts();
    Products.setupSearchAndFilter();
};

// Load featured products for home page
const loadFeaturedProducts = async () => {
    const featuredGrid = document.getElementById('featured-products-grid');
    if (!featuredGrid) return;
    
    try {
        await handleApiCall(async () => {
            const response = await ApiService.products.getAll({ limit: 6 });
            const products = response.products || response;
            
            if (products && products.length > 0) {
                featuredGrid.innerHTML = products.slice(0, 6).map(product => Products.renderProductCard(product)).join('');
            } else {
                featuredGrid.innerHTML = '<p>No featured products available</p>';
            }
            
            return response;
        });
    } catch (error) {
        featuredGrid.innerHTML = '<p>Failed to load featured products</p>';
    }
};

// Initialize products functionality
document.addEventListener('DOMContentLoaded', () => {
    Products.setupSearchAndFilter();
});
