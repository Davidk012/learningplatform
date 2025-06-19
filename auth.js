const backendUrl = 'http://localhost:3000';

// Login form submit
document.getElementById('loginForm')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const errorDiv = document.getElementById('loginError');
  
  const email = document.getElementById('loginEmail').value.trim().toLowerCase();
  const password = document.getElementById('loginPassword').value;

  try {
    const response = await fetch(backendUrl + '/api/login', {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({ email, password })
    });
    const data = await response.json();
    if(response.ok) {
      localStorage.setItem('slp_user', JSON.stringify(data.user));
      window.location.href = '/dashboard.html';
    } else {
      showError(errorDiv, data.message || 'Login failed.');
    }
  } catch(err) {
    showError(errorDiv, 'Network error, please try again.');
  }
});

// Register form submit
document.getElementById('registerForm')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const errorDiv = document.getElementById('registerError');
  const successDiv = document.getElementById('registerSuccess');

  const name = document.getElementById('regName').value.trim();
  const email = document.getElementById('regEmail').value.trim().toLowerCase();
  const password = document.getElementById('regPassword').value;
  const confirmPassword = document.getElementById('regPasswordConfirm').value;
  const interests = Array.from(document.querySelectorAll('input[name="interests"]:checked')).map(el => el.value);

  if (password !== confirmPassword) {
    showError(errorDiv, 'Passwords do not match.');
    return;
  }
  if(interests.length === 0) {
    showError(errorDiv, 'Please select at least one interest.');
    return;
  }

  try {
    const response = await fetch(backendUrl + '/api/register', {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({ name, email, password, interests })
    });
    const data = await response.json();
    if(response.ok) {
      showSuccess(successDiv, 'Registration successful! Redirecting to login...');
      setTimeout(() => window.location.href = '/', 2000);
    } else {
      showError(errorDiv, data.message || 'Registration failed.');
    }
  } catch(err) {
    showError(errorDiv, 'Network error, please try again.');
  }
});

function showError(element, message) {
  element.textContent = message;
  element.style.display = '';
}

function showSuccess(element, message) {
  element.textContent = message;
  element.style.display = '';
}