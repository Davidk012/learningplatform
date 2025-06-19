// dashboard.js
const backendUrl = window.env?.BACKEND_URL || 'http://localhost:3000';
let coursesData = [];
let certificationsData = [];
let selectedItems = [];

// DOM Elements
const coursesList = document.getElementById('coursesList');
const certificationsList = document.getElementById('certificationsList');
const recommendedCourses = document.getElementById('recommendedCourses');
const recommendedCertifications = document.getElementById('recommendedCertifications');
const clearSelectionBtn = document.getElementById('clearSelectionBtn');
const errorModal = document.getElementById('errorModal');
const errorMessage = document.getElementById('errorMessage');

// Load courses and certifications
async function loadCourses() {
  try {
    const response = await fetch(`${backendUrl}/api/courses`);
    if (!response.ok) throw new Error('Failed to load courses');
    coursesData = await response.json();
    renderItems(coursesData, coursesList, 'course');
  } catch (error) {
    showErrorModal(error.message || 'Failed to load courses');
  }
}

async function loadCertifications() {
  try {
    const response = await fetch(`${backendUrl}/api/certifications`);
    if (!response.ok) throw new Error('Failed to load certifications');
    certificationsData = await response.json();
    renderItems(certificationsData, certificationsList, 'certification');
  } catch (error) {
    showErrorModal(error.message || 'Failed to load certifications');
  }
}

// Render items to the DOM
function renderItems(items, container, type) {
  container.innerHTML = '';
  
  items.forEach(item => {
    const card = document.createElement('div');
    card.className = `card ${selectedItems.includes(item.id) ? 'selected' : ''}`;
    card.dataset.id = item.id;
    card.dataset.type = type;
    
    card.innerHTML = `
      <h3 class="course-title">${item.title}</h3>
      <p class="course-description">${item.description}</p>
      <div class="tags">
        ${item.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
      </div>
      ${type === 'course' ? `<div class="meta">${item.duration} • ${item.level}</div>` : ''}
    `;
    
    card.addEventListener('click', () => toggleSelection(item.id));
    container.appendChild(card);
  });
}

// Toggle item selection
function toggleSelection(id) {
  if (selectedItems.includes(id)) {
    selectedItems = selectedItems.filter(itemId => itemId !== id);
  } else {
    selectedItems.push(id);
  }
  updateRecommendations();
  renderItems(coursesData, coursesList, 'course');
  renderItems(certificationsData, certificationsList, 'certification');
}

// Generate recommendations based on user interests
function updateRecommendations() {
  const user = JSON.parse(localStorage.getItem('slp_user'));
  const userInterests = user?.interests || [];
  
  // Get tags from selected items
  const selectedTags = [
    ...selectedItems.flatMap(id => {
      const item = [...coursesData, ...certificationsData].find(i => i.id === id);
      return item ? item.tags : [];
    }),
    ...userInterests
  ];
  
  // Remove duplicates
  const uniqueTags = [...new Set(selectedTags)];
  
  // Filter recommendations
  const recommendedC = coursesData
    .filter(course => 
      !selectedItems.includes(course.id) && 
      course.tags.some(tag => uniqueTags.includes(tag))
    .slice(0, 3));
  
  const recommendedCert = certificationsData
    .filter(cert => 
      !selectedItems.includes(cert.id) && 
      cert.tags.some(tag => uniqueTags.includes(tag))
    .slice(0, 2));
  
  // Render recommendations
  if (recommendedC.length > 0) {
    renderItems(recommendedC, recommendedCourses, 'course');
  } else {
    recommendedCourses.innerHTML = '<p>No recommended courses based on your interests</p>';
  }
  
  if (recommendedCert.length > 0) {
    renderItems(recommendedCert, recommendedCertifications, 'certification');
  } else {
    recommendedCertifications.innerHTML = '<p>No recommended certifications based on your interests</p>';
  }
}

// Show error modal
function showErrorModal(message) {
  errorMessage.textContent = message;
  errorModal.classList.remove('hidden');
}

// Initialize dashboard
document.addEventListener('DOMContentLoaded', () => {
  // ... existing authentication/logout code ...
  
  // Add new functionality
  document.getElementById('closeErrorModal').addEventListener('click', () => {
    errorModal.classList.add('hidden');
  });
  
  clearSelectionBtn.addEventListener('click', () => {
    selectedItems = [];
    updateRecommendations();
    renderItems(coursesData, coursesList, 'course');
    renderItems(certificationsData, certificationsList, 'certification');
  });
  
  // Load content
  loadCourses();
  loadCertifications();
  
  // Initialize recommendations
  updateRecommendations();
});
