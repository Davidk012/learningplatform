/**
 * Dashboard JavaScript for Vitus Tech Learning Platform
 * Handles logout functionality with enhanced security and user experience
 */

// Logout function with robust error handling and user confirmation
function handleLogout() {
  // Confirm logout intent
  const confirmLogout = confirm('Are you sure you want to log out?');
  if (!confirmLogout) return;

  try {
    // Check for existing user session
    const user = localStorage.getItem('slp_user');
    if (!user) {
      console.warn('Logout attempted with no active session');
      alert('No active session found. You are already logged out.');
      return;
    }

    // Clear user session
    localStorage.removeItem('slp_user');
    
    // Log event and redirect
    console.log('User logged out successfully');
    window.location.href = '/';
    
    // In a production environment, you would also:
    // 1. Send logout request to server to invalidate token
    // 2. Clear any session cookies
    // Example: await fetch('/api/logout', { method: 'POST' });
    
  } catch (error) {
    // Handle errors gracefully
    console.error('Logout failed:', error);
    alert('An error occurred during logout. Please try again or clear browser cookies.');
    
    // Attempt fallback method for logout
    try {
      localStorage.clear();
      window.location.href = '/';
    } catch (fallbackError) {
      console.error('Fallback logout failed:', fallbackError);
      alert('Critical error! Please close your browser to complete logout.');
    }
  }
}

// Initialize dashboard functionality
document.addEventListener('DOMContentLoaded', () => {
  try {
    // Set up logout button
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', handleLogout);
      
      // Add keyboard accessibility
      logoutBtn.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          handleLogout();
        }
      });
    }
    
    // Add ARIA attributes dynamically
    logoutBtn.setAttribute('aria-label', 'Log out of your account');
    
    // Check authentication state
    const user = localStorage.getItem('slp_user');
    if (!user) {
      console.warn('User accessed dashboard without authentication');
      alert('Session expired. Please log in again.');
      window.location.href = '/';
    }
    
    // Initialize other dashboard components here
    // loadCourses();
    // loadCertifications();
    
  } catch (initError) {
    console.error('Dashboard initialization failed:', initError);
    alert('Failed to initialize dashboard. Please refresh the page.');
  }
});

// Example analytics tracking (would integrate with analytics service)
function trackEvent(eventName, eventData) {
  console.log(`Tracking event: ${eventName}`, eventData);
  // In production: analytics.track(eventName, eventData);
}
