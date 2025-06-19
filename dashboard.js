document.getElementById('logoutBtn').addEventListener('click', () => {
    localStorage.removeItem('slp_user');
    window.location.href = '/';
  });