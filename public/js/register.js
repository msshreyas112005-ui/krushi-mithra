// API Configuration - Uses config.js for environment-aware API URL
// The API_URL is now loaded from config.js which auto-detects development vs production

// DOM Elements - Will be initialized after DOM loads
let form, submitBtn, formMessage, togglePasswordBtn;
let formFields, errorElements;

// Initialize Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    console.log('[REGISTER.JS] 🚀 Initializing registration form');
    
    // Initialize DOM elements
    form = document.getElementById('registrationForm');
    submitBtn = document.getElementById('submitBtn');
    formMessage = document.getElementById('formMessage');
    togglePasswordBtn = document.getElementById('togglePassword');

    // Form Fields
    formFields = {
        fullName: document.getElementById('fullName'),
        email: document.getElementById('email'),
        mobile: document.getElementById('mobile'),
        password: document.getElementById('password'),
        confirmPassword: document.getElementById('confirmPassword'),
        location: document.getElementById('location'),
        cropType: document.getElementById('cropType'),
        language: document.getElementById('language')
    };

    // Error Message Elements
    errorElements = {
        fullName: document.getElementById('fullNameError'),
        email: document.getElementById('emailError'),
        mobile: document.getElementById('mobileError'),
        password: document.getElementById('passwordError'),
        confirmPassword: document.getElementById('confirmPasswordError'),
        location: document.getElementById('locationError'),
        cropType: document.getElementById('cropTypeError'),
        language: document.getElementById('languageError')
    };

    if (!form) {
        console.error('[REGISTER.JS] ❌ Registration form not found!');
        return;
    }

    console.log('[REGISTER.JS] ✓ Form element found');
    console.log('[REGISTER.JS] ✓ All field elements found');
    
    initializeValidation();
    setupPasswordToggle();
    setupFormSubmission();
    
    console.log('[REGISTER.JS] ✅ Registration form initialized successfully');
});

// Validation Rules
const validationRules = {
    fullName: {
        required: true,
        minLength: 3,
        pattern: /^[a-zA-Z\s]+$/,
        message: 'Please enter a valid name (letters only, minimum 3 characters)'
    },
    email: {
        required: true,
        pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        message: 'Please enter a valid email address'
    },
    mobile: {
        required: true,
        pattern: /^[6-9]\d{9}$/,
        message: 'Please enter a valid 10-digit mobile number starting with 6-9'
    },
    password: {
        required: true,
        minLength: 8,
        pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/,
        message: 'Password must be at least 8 characters with uppercase, lowercase, and number'
    },
    confirmPassword: {
        required: true,
        match: 'password',
        message: 'Passwords do not match'
    },
    location: {
        required: true,
        minLength: 3,
        message: 'Please enter your location'
    },
    cropType: {
        required: true,
        message: 'Please select your primary crop type'
    },
    language: {
        required: true,
        message: 'Please select your preferred language'
    }
};

// Initialize Real-time Validation
function initializeValidation() {
    Object.keys(formFields).forEach(fieldName => {
        const field = formFields[fieldName];
        
        if (field.type === 'checkbox') {
            field.addEventListener('change', () => validateField(fieldName));
        } else {
            // Validate on blur
            field.addEventListener('blur', () => validateField(fieldName));
            
            // Clear error on input
            field.addEventListener('input', () => {
                if (field.classList.contains('error')) {
                    clearError(fieldName);
                }
            });
        }
    });

    // Special handling for mobile number - only allow digits
    formFields.mobile.addEventListener('input', (e) => {
        e.target.value = e.target.value.replace(/\D/g, '');
    });
}

// Setup Password Toggle
function setupPasswordToggle() {
    togglePasswordBtn.addEventListener('click', () => {
        const passwordField = formFields.password;
        const type = passwordField.type === 'password' ? 'text' : 'password';
        passwordField.type = type;
        togglePasswordBtn.textContent = type === 'password' ? '👁️' : '🙈';
    });
}

// Validate Individual Field
function validateField(fieldName) {
    const field = formFields[fieldName];
    const rules = validationRules[fieldName];
    const errorElement = errorElements[fieldName];
    
    if (!rules) return true;

    let isValid = true;
    let errorMessage = '';

    // Required validation
    if (rules.required) {
        if (field.type === 'checkbox') {
            if (!field.checked) {
                isValid = false;
                errorMessage = rules.message;
            }
        } else if (!field.value.trim()) {
            isValid = false;
            errorMessage = rules.message;
        }
    }

    // Pattern validation
    if (isValid && rules.pattern && field.value.trim()) {
        if (!rules.pattern.test(field.value.trim())) {
            isValid = false;
            errorMessage = rules.message;
        }
    }

    // Min length validation
    if (isValid && rules.minLength && field.value.trim()) {
        if (field.value.trim().length < rules.minLength) {
            isValid = false;
            errorMessage = rules.message;
        }
    }

    // Match validation (for confirm password)
    if (isValid && rules.match && field.value) {
        const matchField = formFields[rules.match];
        if (field.value !== matchField.value) {
            isValid = false;
            errorMessage = rules.message;
        }
    }

    // Update UI
    if (isValid) {
        field.classList.remove('error');
        field.classList.add('success');
        errorElement.textContent = '';
        errorElement.classList.remove('show');
    } else {
        field.classList.remove('success');
        field.classList.add('error');
        errorElement.textContent = errorMessage;
        errorElement.classList.add('show');
    }

    return isValid;
}

// Clear Error
function clearError(fieldName) {
    const field = formFields[fieldName];
    const errorElement = errorElements[fieldName];
    
    field.classList.remove('error');
    errorElement.textContent = '';
    errorElement.classList.remove('show');
}

// Validate All Fields
function validateForm() {
    let isValid = true;
    
    Object.keys(formFields).forEach(fieldName => {
        if (!validateField(fieldName)) {
            isValid = false;
        }
    });
    
    return isValid;
}

// Setup Form Submission
function setupFormSubmission() {
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Validate form
        if (!validateForm()) {
            showMessage('Please correct the errors in the form', 'error');
            // Scroll to first error
            const firstError = form.querySelector('.error');
            if (firstError) {
                firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
            return;
        }

        // Prepare form data - map to backend field names
        const formData = {
            name: formFields.fullName.value.trim(),
            email: formFields.email.value.trim().toLowerCase(),
            phone: formFields.mobile.value.trim(),
            password: formFields.password.value,
            location: formFields.location.value.trim(),
            cropType: formFields.cropType.value,
            language: formFields.language.value,
            registeredAt: new Date().toISOString()
        };

        // Double-check that all required fields are present and not empty
        const requiredFields = ['name', 'email', 'phone', 'password', 'location'];
        const emptyFields = requiredFields.filter(field => !formData[field] || formData[field].trim() === '');
        
        if (emptyFields.length > 0) {
            console.error('[FRONTEND REGISTRATION] ❌ Empty required fields:', emptyFields);
            showMessage(`Please fill in all required fields: ${emptyFields.join(', ')}`, 'error');
            return;
        }

        console.log('[FRONTEND REGISTRATION] ✓ All required fields validated');

        // Submit to backend
        await submitRegistration(formData);
    });
}

// Submit Registration to Backend
async function submitRegistration(formData) {
    console.log('\n[FRONTEND REGISTRATION] 📝 Starting registration process');
    console.log('[FRONTEND REGISTRATION] ====================================');
    console.log('[FRONTEND REGISTRATION] Form data validation:');
    console.log('   • name:', formData.name ? `"${formData.name}" ✓` : '❌ MISSING');
    console.log('   • email:', formData.email ? `"${formData.email}" ✓` : '❌ MISSING');
    console.log('   • phone:', formData.phone ? `"${formData.phone}" ✓` : '❌ MISSING');
    console.log('   • password:', formData.password ? '***PROVIDED*** ✓' : '❌ MISSING');
    console.log('   • location:', formData.location ? `"${formData.location}" ✓` : '❌ MISSING');
    console.log('   • cropType:', formData.cropType || '(optional)');
    console.log('   • language:', formData.language || '(optional)');
    console.log('[FRONTEND REGISTRATION] ====================================');
    console.log('[FRONTEND REGISTRATION] Full payload:', JSON.stringify({
        ...formData,
        password: '***HIDDEN***'
    }, null, 2));
    console.log('[FRONTEND REGISTRATION] ====================================');

    try {
        // Show loading state
        submitBtn.disabled = true;
        submitBtn.classList.add('loading');
        hideMessage();

        // Note: API_URL already includes '/api', so we just add '/farmers/register'
        // API_URL = 'http://localhost:3000/api' (from config.js)
        // Final URL = 'http://localhost:3000/api/farmers/register'
        const apiUrl = `${API_URL}/farmers/register`;
        console.log('[FRONTEND REGISTRATION] ====================================');
        console.log('[FRONTEND REGISTRATION] API_URL base:', API_URL);
        console.log('[FRONTEND REGISTRATION] Final URL:', apiUrl);
        console.log('[FRONTEND REGISTRATION] ====================================');
        console.log('[FRONTEND REGISTRATION] Sending POST request...');

        // Make API call
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });

        console.log('[FRONTEND REGISTRATION] Response status:', response.status);
        console.log('[FRONTEND REGISTRATION] Response status text:', response.statusText);
        console.log('[FRONTEND REGISTRATION] Response ok:', response.ok);

        const result = await response.json();
        console.log('[FRONTEND REGISTRATION] Response body:', JSON.stringify(result, null, 2));

        if (response.ok && result.success) {
            // Success
            console.log('[FRONTEND REGISTRATION] ✅ Registration successful!');
            showMessage(result.message || 'Registration successful! Redirecting to login...', 'success');
            form.reset();
            
            // Clear all success classes
            Object.values(formFields).forEach(field => {
                field.classList.remove('success', 'error');
            });

            // Redirect after 2 seconds
            console.log('[FRONTEND REGISTRATION] Redirecting to login page in 2 seconds...');
            setTimeout(() => {
                window.location.href = 'farmer-login.html';
            }, 2000);
        } else {
            // Error from server - show actual backend error message
            console.error('[FRONTEND REGISTRATION] ❌ Server returned error:', result);
            showMessage(result.message || result.error || 'Registration failed. Please try again.', 'error');
        }
    } catch (error) {
        console.error('[FRONTEND REGISTRATION] ❌ CRITICAL ERROR:', error);
        console.error('[FRONTEND REGISTRATION] Error name:', error.name);
        console.error('[FRONTEND REGISTRATION] Error message:', error.message);
        console.error('[FRONTEND REGISTRATION] Error stack:', error.stack);
        
        // Show specific error messages
        if (error.message.includes('fetch') || error.message.includes('Failed to fetch')) {
            console.error('[FRONTEND REGISTRATION] Network error - cannot reach backend');
            showMessage('❌ Cannot connect to server. Please check if the backend is running.', 'error');
        } else {
            showMessage('An error occurred: ' + error.message, 'error');
        }
    } finally {
        // Remove loading state
        console.log('[FRONTEND REGISTRATION] Resetting form state\n');
        submitBtn.disabled = false;
        submitBtn.classList.remove('loading');
    }
}

// Show Message
function showMessage(message, type) {
    formMessage.textContent = message;
    formMessage.className = 'form-message show ' + type;
    formMessage.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// Hide Message
function hideMessage() {
    formMessage.className = 'form-message';
    formMessage.textContent = '';
}

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        validateField,
        validateForm
    };
}
