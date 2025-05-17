import { db } from './firebase-config.js';

// DOM Elements
const busForm = document.getElementById('bus-form');
const locationForm = document.getElementById('location-form');
const busList = document.getElementById('bus-list');
const locationList = document.getElementById('location-list');
const tabs = document.querySelectorAll('.admin-tab');
const tabContents = document.querySelectorAll('.tab-content');

// App State
let currentEditBusId = null;

// Initialize Admin Panel
async function initAdmin() {
  await loadLocations();
  setupEventListeners();
  setupRealTimeListeners();
}

// Load locations for dropdowns
async function loadLocations() {
  const snapshot = await db.collection("locations").get();
  const fromSelect = document.getElementById('from-location');
  const toSelect = document.getElementById('to-location');
  
  fromSelect.innerHTML = '<option value="">Select location</option>';
  toSelect.innerHTML = '<option value="">Select location</option>';
  
  snapshot.forEach(doc => {
    const option = `<option value="${doc.id}">${doc.data().name}</option>`;
    fromSelect.innerHTML += option;
    toSelect.innerHTML += option;
  });
}

// Handle bus form submission
async function handleBusSubmit(e) {
  e.preventDefault();
  
  const formData = new FormData(busForm);
  const busData = {
    id: formData.get('bus-id'),
    name: formData.get('bus-name'),
    from: formData.get('from-location'),
    to: formData.get('to-location'),
    type: formData.get('bus-type'),
    operator: formData.get('operator'),
    frequency: formData.get('frequency'),
    departures: Array.from(document.querySelectorAll('.departure-time')).map(el => el.value),
    arrivals: Array.from(document.querySelectorAll('.arrival-time')).map(el => el.value)
  };
  
  try {
    if (currentEditBusId) {
      // Update existing bus
      await db.collection("buses").doc(currentEditBusId).update(busData);
      currentEditBusId = null;
    } else {
      // Add new bus
      await db.collection("buses").doc(busData.id).set(busData);
    }
    
    busForm.reset();
    document.getElementById('edit-bus-id').value = '';
    document.getElementById('cancel-edit').style.display = 'none';
  } catch (error) {
    console.error("Error saving bus:", error);
    alert("Error saving bus. See console for details.");
  }
}

// Handle location form submission
async function handleLocationSubmit(e) {
  e.preventDefault();
  
  const locationName = document.getElementById('location-name').value.trim();
  if (!locationName) return;
  
  try {
    await db.collection("locations").doc().set({
      name: locationName,
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    
    locationForm.reset();
    await loadLocations();
  } catch (error) {
    console.error("Error saving location:", error);
  }
}

// Render buses list
function renderBusList(buses) {
  busList.innerHTML = '';
  
  buses.forEach(doc => {
    const bus = doc.data();
    const item = document.createElement('div');
    item.className = 'list-item';
    item.innerHTML = `
      <div class="item-info">
        <h4>${bus.name} (${bus.id})</h4>
        <p>${bus.from} → ${bus.to} | ${bus.type}</p>
      </div>
      <div class="item-actions">
        <button class="edit-btn" data-id="${doc.id}">
          <i class="fas fa-edit"></i>
        </button>
        <button class="delete-btn" data-id="${doc.id}">
          <i class="fas fa-trash"></i>
        </button>
      </div>
    `;
    
    item.querySelector('.edit-btn').addEventListener('click', () => editBus(doc.id, bus));
    item.querySelector('.delete-btn').addEventListener('click', () => deleteBus(doc.id));
    
    busList.appendChild(item);
  });
}

// Edit bus
function editBus(id, bus) {
  currentEditBusId = id;
  
  // Fill form with bus data
  document.getElementById('edit-bus-id').value = id;
  document.getElementById('bus-id').value = bus.id;
  document.getElementById('bus-name').value = bus.name;
  document.getElementById('from-location').value = bus.from;
  document.getElementById('to-location').value = bus.to;
  document.getElementById('bus-type').value = bus.type;
  document.getElementById('operator').value = bus.operator;
  document.getElementById('frequency').value = bus.frequency || '';
  
  // Clear and add timings
  const timingInputs = document.getElementById('timing-inputs');
  timingInputs.innerHTML = '';
  
  bus.departures.forEach((departure, i) => {
    addTimingInput(departure, bus.arrivals[i]);
  });
  
  document.getElementById('cancel-edit').style.display = 'inline-block';
  document.querySelector('.admin-tab[data-tab="buses"]').click();
}

// Delete bus
async function deleteBus(id) {
  if (confirm("Are you sure you want to delete this bus?")) {
    try {
      await db.collection("buses").doc(id).delete();
    } catch (error) {
      console.error("Error deleting bus:", error);
    }
  }
}

// Add timing input
function addTimingInput(departure = '', arrival = '') {
  const container = document.getElementById('timing-inputs');
  const div = document.createElement('div');
  div.className = 'timing-input';
  div.innerHTML = `
    <input type="time" class="departure-time" value="${departure
