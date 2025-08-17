// Authentication functionality
const Auth = {
    // Initialize auth forms
    init: () => {
        Auth.setupLoginForm();
        Auth.setupRegisterForm();
    },
    
    // Setup login form
    setupLoginForm: () => {
        const loginForm = document.getElementById('login-form');
        if (!loginForm) return;
        
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const email = document.getElementById('login-email').value.trim();
            const password = document.getElementById('login-password').value;
            const submitBtn = loginForm.querySelector('.auth-button');

            // Validation
            if (!email || !password) {
                Toast.error('Please fill in all fields');
                return;
            }

            if (!Utils.isValidEmail(email)) {
                Toast.error('Please enter a valid email address');
                return;
            }

            // Show loading state
            const originalText = submitBtn.textContent;
            submitBtn.textContent = 'Logging in...';
            submitBtn.disabled = true;

            try {
                const response = await ApiService.auth.login(email, password);
                Toast.success('Login successful!');

                // Redirect to home page
                showPage('home');

                // Load user's cart
                await ApiService.cart.get();

                // Clear form
                loginForm.reset();

            } catch (error) {
                console.error('Login error:', error);
                if (error.message.includes('Invalid credentials') || error.message.includes('401')) {
                    Toast.error('Invalid email or password. Please try again.');
                } else if (error.message.includes('User not found')) {
                    Toast.error('No account found with this email. Please register first.');
                } else {
                    Toast.error(error.message || 'Login failed. Please try again.');
                }
            } finally {
                // Reset button state
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
            }
        });
    },
    
    // Setup register form
    setupRegisterForm: () => {
        const registerForm = document.getElementById('register-form');
        if (!registerForm) return;
        
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const name = document.getElementById('register-name').value.trim();
            const email = document.getElementById('register-email').value.trim();
            const password = document.getElementById('register-password').value;
            const submitBtn = registerForm.querySelector('.auth-button');

            // Validation
            if (!name || !email || !password) {
                Toast.error('Please fill in all fields');
                return;
            }

            if (name.length < 2) {
                Toast.error('Name must be at least 2 characters long');
                return;
            }

            if (!Utils.isValidEmail(email)) {
                Toast.error('Please enter a valid email address');
                return;
            }

            if (password.length < 6) {
                Toast.error('Password must be at least 6 characters long');
                return;
            }

            // Show loading state
            const originalText = submitBtn.textContent;
            submitBtn.textContent = 'Creating Account...';
            submitBtn.disabled = true;

            try {
                const response = await ApiService.auth.register(name, email, password);
                Toast.success('Registration successful! Welcome to TechSphere!');

                // Redirect to home page
                showPage('home');

                // Clear form
                registerForm.reset();

            } catch (error) {
                console.error('Registration error:', error);
                if (error.message.includes('E11000') || error.message.includes('duplicate') || error.message.includes('already exists')) {
                    Toast.error('Email already exists. Please use a different email or try logging in.');
                } else if (error.message.includes('validation')) {
                    Toast.error('Please check your input and try again.');
                } else {
                    Toast.error(error.message || 'Registration failed. Please try again.');
                }
            } finally {
                // Reset button state
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
            }
        });
    },
    
    // Validate authentication status
    validateAuth: async () => {
        const token = Utils.storage.get(CONFIG.STORAGE_KEYS.AUTH_TOKEN);
        
        if (!token) {
            AppState.clear();
            return false;
        }
        
        try {
            const response = await ApiService.auth.getProfile();
            AppState.setUser(response.user);
            return true;
        } catch (error) {
            console.error('Auth validation failed:', error);
            AppState.clear();
            return false;
        }
    },
    
    // Check if user is authenticated
    isAuthenticated: () => {
        return AppState.isAuthenticated && AppState.user;
    },
    
    // Get current user
    getCurrentUser: () => {
        return AppState.user;
    },
    
    // Require authentication for protected actions
    requireAuth: (callback, errorMessage = 'Please login to continue') => {
        if (!Auth.isAuthenticated()) {
            Toast.warning(errorMessage);
            showPage('login');
            return false;
        }
        
        if (typeof callback === 'function') {
            callback();
        }
        
        return true;
    }
};

// Logout functionality
const logout = async () => {
    try {
        // Clear local state
        AppState.clear();
        
        // Show success message
        Toast.success('Logged out successfully');
        
        // Redirect to home page
        showPage('home');
        
    } catch (error) {
        console.error('Logout error:', error);
        Toast.error('Error during logout');
    }
};

// Auto-login on page load if token exists
document.addEventListener('DOMContentLoaded', async () => {
    const token = Utils.storage.get(CONFIG.STORAGE_KEYS.AUTH_TOKEN);
    
    if (token) {
        try {
            await Auth.validateAuth();
            
            // Load user's cart if authenticated
            if (AppState.isAuthenticated) {
                await ApiService.cart.get();
            }
        } catch (error) {
            console.error('Auto-login failed:', error);
        }
    }
    
    // Initialize auth forms
    Auth.init();
});

// Password strength checker
const checkPasswordStrength = (password) => {
    const strength = {
        score: 0,
        feedback: []
    };
    
    if (password.length >= 8) {
        strength.score += 1;
    } else {
        strength.feedback.push('Use at least 8 characters');
    }
    
    if (/[a-z]/.test(password)) {
        strength.score += 1;
    } else {
        strength.feedback.push('Include lowercase letters');
    }
    
    if (/[A-Z]/.test(password)) {
        strength.score += 1;
    } else {
        strength.feedback.push('Include uppercase letters');
    }
    
    if (/\d/.test(password)) {
        strength.score += 1;
    } else {
        strength.feedback.push('Include numbers');
    }
    
    if (/[^a-zA-Z\d]/.test(password)) {
        strength.score += 1;
    } else {
        strength.feedback.push('Include special characters');
    }
    
    return strength;
};

// Add password strength indicator to register form
document.addEventListener('DOMContentLoaded', () => {
    const passwordInput = document.getElementById('register-password');
    
    if (passwordInput) {
        // Create password strength indicator
        const strengthIndicator = document.createElement('div');
        strengthIndicator.className = 'password-strength';
        strengthIndicator.innerHTML = `
            <div class="strength-bar">
                <div class="strength-fill"></div>
            </div>
            <div class="strength-text"></div>
        `;
        
        // Add CSS for password strength indicator
        const style = document.createElement('style');
        style.textContent = `
            .password-strength {
                margin-top: 8px;
            }
            
            .strength-bar {
                height: 4px;
                background: var(--gray-200);
                border-radius: 2px;
                overflow: hidden;
                margin-bottom: 4px;
            }
            
            .strength-fill {
                height: 100%;
                transition: all 0.3s ease;
                border-radius: 2px;
            }
            
            .strength-text {
                font-size: 12px;
                color: var(--gray-600);
            }
            
            .strength-weak .strength-fill { width: 20%; background: var(--error-color); }
            .strength-fair .strength-fill { width: 40%; background: var(--warning-color); }
            .strength-good .strength-fill { width: 60%; background: #3b82f6; }
            .strength-strong .strength-fill { width: 80%; background: var(--success-color); }
            .strength-very-strong .strength-fill { width: 100%; background: var(--success-color); }
        `;
        document.head.appendChild(style);
        
        passwordInput.parentNode.appendChild(strengthIndicator);
        
        passwordInput.addEventListener('input', (e) => {
            const password = e.target.value;
            const strength = checkPasswordStrength(password);
            
            const strengthClasses = ['strength-weak', 'strength-fair', 'strength-good', 'strength-strong', 'strength-very-strong'];
            const strengthTexts = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'];
            
            // Remove all strength classes
            strengthClasses.forEach(cls => strengthIndicator.classList.remove(cls));
            
            if (password.length > 0) {
                const strengthClass = strengthClasses[Math.min(strength.score, 4)];
                const strengthText = strengthTexts[Math.min(strength.score, 4)];
                
                strengthIndicator.classList.add(strengthClass);
                strengthIndicator.querySelector('.strength-text').textContent = `Password strength: ${strengthText}`;
                
                if (strength.feedback.length > 0) {
                    strengthIndicator.querySelector('.strength-text').textContent += ` (${strength.feedback.join(', ')})`;
                }
            } else {
                strengthIndicator.querySelector('.strength-text').textContent = '';
            }
        });
    }
});
