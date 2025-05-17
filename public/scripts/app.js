
import { db } from './firebase-config.js';

// DOM Elements
const fromLocationSelect = document.getElementById('fromLocation');
const toLocationSelect = document.getElementById('toLocation');
const searchBtn = document.getElementById('searchBtn');
const busFilterInput = document.getElementById('busFilter');
const busResultsContainer = document.getElementById('busResults');
const recentSearchesList = document.getElementById('recentSearchesList');

// App State
let busData = {
  routes: [],
  locations: []
};

// Initialize App
async function initApp() {
  await loadBusData();
  populateLocationDropdowns();
  loadRecentSearches();
  setupEventListeners();
}

// Load bus data from Firestore
async function loadBusData() {
  try {
    const doc = await db.collection("appData").doc("timings").get();
    if (doc.exists) {
      busData = doc.data();
    } else {
      // Fallback to local data
      const response = await fetch('/data/default-routes.json');
      busData = await response.json();
      await saveBusData();
    }
  } catch (error) {
    console.error("Error loading bus data:", error);
  }
}

// Save data to Firestore
async function saveBusData() {
  try {
    await db.collection("appData").doc("timings").set(busData);
  } catch (error) {
    console.error("Error saving bus data:", error);
  }
}

// Populate location dropdowns
function populateLocationDropdowns() {
  fromLocationSelect.innerHTML = '<option value="">Select departure</option>';
  toLocationSelect.innerHTML = '<option value="">Select destination</option>';

  busData.locations.forEach(location => {
    const option = document.createElement('option');
    option.value = location;
    option.textContent = location;
    fromLocationSelect.appendChild(option);
    toLocationSelect.appendChild(option.cloneNode(true));
  });
}

// Find matching buses for route
function findMatchingBuses(from, to) {
  return busData.routes.filter(route => 
    route.from === from && route.to === to
  );
}

// Display bus results
function displayBusResults(buses) {
  busResultsContainer.innerHTML = '';

  if (buses.length === 0) {
    busResultsContainer.innerHTML = `
      <div class="no-results">
        <i class="fas fa-bus-slash"></i>
        <p>No buses found for this route</p>
      </div>
    `;
    return;
  }

  buses.forEach(bus => {
    busResultsContainer.appendChild(createBusCard(bus));
  });
}

// Create bus card element
function createBusCard(bus) {
  const card = document.createElement('div');
  card.className = 'bus-card';
  
  const duration = calculateDuration(bus.departures[0], bus.arrivals[0]);
  const isFavorite = localStorage.getItem(`fav_${bus.id}`) === 'true';

  card.innerHTML = `
    <div class="bus-header">
      <h3 class="bus-name">${bus.name}</h3>
      <button class="favorite-btn ${isFavorite ? 'active' : ''}">
        <i class="fas fa-heart"></i>
      </button>
    </div>
    <div class="bus-meta">
      <span class="bus-operator">${bus.operator}</span>
      <span class="bus-type">${bus.type}</span>
      ${bus.frequency ? `<span class="frequency">${bus.frequency}</span>` : ''}
    </div>
    <div class="bus-timings">
      <div class="timing">
        <span class="timing-label">Departure</span>
        <span class="timing-value">${bus.departures[0]}</span>
      </div>
      <div class="timing">
        <span class="timing-label">Arrival</span>
        <span class="timing-value">${bus.arrivals[0]}</span>
      </div>
      <div class="timing">
        <span class="timing-label">Duration</span>
        <span class="timing-value">${duration}</span>
      </div>
    </div>
    <button class="view-all-btn">
      <i class="fas fa-clock"></i> View All Timings
    </button>
  `;

  // Add event listeners
  card.querySelector('.favorite-btn').addEventListener('click', (e) => {
    e.target.classList.toggle('active');
    localStorage.setItem(`fav_${bus.id}`, e.target.classList.contains('active'));
  });

  card.querySelector('.view-all-btn').addEventListener('click', () => {
    showAllTimings(bus);
  });

  return card;
}

// Show modal with all timings
function showAllTimings(bus) {
  const modal = document.createElement('div');
  modal.className = 'modal-overlay';
  
  let timingsHTML = bus.departures.map((departure, i) => `
    <div class="timing-row">
      <span>${departure}</span>
      <span>→</span>
      <span>${bus.arrivals[i]}</span>
      <span>${calculateDuration(departure, bus.arrivals[i])}</span>
    </div>
  `).join('');

  modal.innerHTML = `
    <div class="modal-content">
      <div class="modal-header">
        <h3>${bus.name} Timings</h3>
        <button class="close-modal">&times;</button>
      </div>
      <div class="modal-body">
        <div class="timing-header">
          <span>Departure</span>
          <span></span>
          <span>Arrival</span>
          <span>Duration</span>
        </div>
        ${timingsHTML}
      </div>
    </div>
  `;

  document.body.appendChild(modal);
  
  modal.querySelector('.close-modal').addEventListener('click', () => {
    document.body.removeChild(modal);
  });
}

// Calculate duration between times
function calculateDuration(departure, arrival) {
  const [depHours, depMins] = departure.split(':').map(Number);
  const [arrHours, arrMins] = arrival.split(':').map(Number);
  
  let totalMinutes = (arrHours * 60 + arrMins) - (depHours * 60 + depMins);
  if (totalMinutes < 0) totalMinutes += 24 * 60;
  
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours}h ${minutes}m`;
}

// Filter buses by search input
function filterBuses() {
  const searchTerm = busFilterInput.value.toLowerCase();
  const cards = document.querySelectorAll('.bus-card');
  
  cards.forEach(card => {
    const busName = card.querySelector('.bus-name').textContent.toLowerCase();
    card.style.display = busName.includes(searchTerm) ? 'block' : 'none';
  });
}

// Save recent search
function saveRecentSearch(from, to) {
  let recentSearches =
