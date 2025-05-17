
// Wait for Firebase to be available
document.addEventListener('DOMContentLoaded', async function() {
    // Get Firestore references
    const { collection, doc, setDoc, getDocs, deleteDoc, onSnapshot } = window.firebaseMethods;
    const db = window.firebaseDb;
    
    // Collections
    const busesCol = collection(db, "buses");
    const locationsCol = collection(db, "locations");
    
    // DOM elements
    const busForm = document.getElementById('bus-form');
    const locationForm = document.getElementById('location-form');
    const busList = document.getElementById('bus-list');
    const locationList = document.getElementById('location-list');
    
    // Initialize UI
    await loadLocations();
    setupEventListeners();
    
    // Real-time listeners
    onSnapshot(busesCol, (snapshot) => {
        renderBusList(snapshot.docs);
    });
    
    onSnapshot(locationsCol, (snapshot) => {
        renderLocationList(snapshot.docs);
    });
    
    // Load locations for dropdowns
    async function loadLocations() {
        const snapshot = await getDocs(locationsCol);
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
    
    // [Include all your CRUD functions here]
    // - handleBusSubmit()
    // - handleLocationSubmit()
    // - renderBusList()
    // - renderLocationList()
    // - editBus()
    // - deleteBus()
    // - etc.
});
