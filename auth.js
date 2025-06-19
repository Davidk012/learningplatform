// Configuration and Constants
const backendUrl = window.env?.BACKEND_URL || 'http://localhost:3000';
const API_ENDPOINTS = {
  LOGIN: '/api/login',
  REGISTER: '/api/register'
};
const ERROR_MESSAGES = {
  NETWORK: 'Network error, please try again.',
  LOGIN_FAIL: 'Login failed. Please check your credentials.',
  REGISTER_FAIL: 'Registration failed. Please try again.',
  PASS_MISMATCH: 'Passwords do not match.',
  INTERESTS: 'Please select at least one interest.',
  EMAIL_INVALID: 'Please enter a valid email address.',
  PASSWORD_WEAK: 'Password must be at least 8 characters with letters and numbers'
};

// DOM Elements
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const loginError = document.getElementById('loginError');
const registerError = document.getElementById('registerError');
const registerSuccess = document.getElementById('registerSuccess');

// Utility Functions
const isValidEmail = email => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const isStrongPassword = password => /^(?=.*[A-Za-z])(?=.*\d).{8,}$/.test(password);

const handleApiResponse = async (response, errorElement) => {
  try {
    const data = await response.json();
    return response.ok 
      ? data 
      : Promise.reject(data.message || ERROR_MESSAGES[response.ok ? '' : 'LOGIN_FAIL']);
  } catch (error) {
    showError(errorElement, ERROR_MESSAGES.NETWORK);
    throw error;
  }
};

const resetFeedback = (form, ...elements) => {
  form.reset();
  elements.forEach(el => el && (el.style.display = 'none'));
};

const showFeedback = (element, message, isError = true) => {
  if (!element) return;
  
  element.textContent = message;
  element.style.display = '';
  element.setAttribute('aria-live', 'assertive');
  element.setAttribute('role', isError ? 'alert' : 'status');
  
  // Auto-hide success messages
  if (!isError) {
    setTimeout(() => element.style.display = 'none', 5000);
  }
};

// Event Handlers
const handleLogin = async e => {
  e.preventDefault();
  resetFeedback(loginForm, loginError);
  
  const email = document.getElementById('loginEmail')?.value?.trim()?.toLowerCase() ?? '';
  const password = document.getElementById('loginPassword')?.value ?? '';
  
  if (!isValidEmail(email)) {
    showFeedback(loginError, ERROR_MESSAGES.EMAIL_INVALID);
    return;
  }
  
  try {
    const response = await fetch(`${backendUrl}${API_ENDPOINTS.LOGIN}`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({ email, password })
    });
    
    const data = await handleApiResponse(response, loginError);
    localStorage.setItem('slp_user', JSON.stringify(data.user));
    window.location.href = '/dashboard.html';
    
  } catch (error) {
    showFeedback(loginError, error.message || ERROR_MESSAGES.LOGIN_FAIL);
    console.error('Login Error:', error);
  }
};

const handleRegister = async e => {
  e.preventDefault();
  resetFeedback(registerForm, registerError, registerSuccess);
  
  const getValue = id => document.getElementById(id)?.value?.trim() ?? '';
  const email = getValue('regEmail').toLowerCase();
  const password = getValue('regPassword');
  const interests = Array.from(
    document.querySelectorAll('input[name="interests"]:checked')
  ).map(el => el.value);

  // Client-side validation
  if (!isValidEmail(email)) {
    showFeedback(registerError, ERROR_MESSAGES.EMAIL_INVALID);
    return;
  }
  
  if (password !== getValue('regPasswordConfirm')) {
    showFeedback(registerError, ERROR_MESSAGES.PASS_MISMATCH);
    return;
  }
  
  if (!isStrongPassword(password)) {
    showFeedback(registerError, ERROR_MESSAGES.PASSWORD_WEAK);
    return;
  }
  
  if (interests.length === 0) {
    showFeedback(registerError, ERROR_MESSAGES.INTERESTS);
    return;
  }

  try {
    const response = await fetch(`${backendUrl}${API_ENDPOINTS.REGISTER}`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({ 
        name: getValue('regName'), 
        email, 
        password, 
        interests 
      })
    });
    
    await handleApiResponse(response, registerError);
    showFeedback(registerSuccess, 'Registration successful! Redirecting to login...', false);
    setTimeout(() => window.location.href = '/', 2000);
    
  } catch (error) {
    showFeedback(registerError, error.message || ERROR_MESSAGES.REGISTER_FAIL);
    console.error('Registration Error:', error);
  }
};

// Initialize event listeners
loginForm?.addEventListener('submit', handleLogin);
registerForm?.addEventListener('submit', handleRegister);
