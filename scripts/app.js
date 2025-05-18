document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const fromLocationSelect = document.getElementById('fromLocation');
    const toLocationSelect = document.getElementById('toLocation');
    const searchBtn = document.getElementById('searchBtn');
    const busFilterInput = document.getElementById('busFilter');
    const busResultsContainer = document.getElementById('busResults');
    const recentSearchesList = document.getElementById('recentSearchesList');
    const sortButtons = document.querySelectorAll('.sort-btn');
    
    // Bus data will be loaded from data.json
    let busData = {
        routes: [],
        locations: []
    };
    
    // Initialize the app
    async function initApp() {
        await loadBusData();
        populateLocationDropdowns();
        loadRecentSearches();
        setupEventListeners();
    }
    
    // Load bus data from JSON file
    async function loadBusData() {
        try {
            const response = await fetch('scripts/data.json');
            busData = await response.json();
        } catch (error) {
            console.error('Error loading bus data:', error);
        }
    }
    
    // Populate location dropdowns
    function populateLocationDropdowns() {
        const locations = busData.locations;
        
        locations.forEach(location => {
            const fromOption = document.createElement('option');
            fromOption.value = location;
            fromOption.textContent = location;
            fromLocationSelect.appendChild(fromOption);
            
            const toOption = document.createElement('option');
            toOption.value = location;
            toOption.textContent = location;
            toLocationSelect.appendChild(toOption);
        });
    }
    
    // Set up event listeners
    function setupEventListeners() {
        searchBtn.addEventListener('click', handleSearch);
        busFilterInput.addEventListener('input', filterBuses);
        
        sortButtons.forEach(button => {
            button.addEventListener('click', () => {
                sortButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                const sortBy = button.dataset.sort;
                sortBuses(sortBy);
            });
        });
    }
    
    // Handle search
    function handleSearch() {
        const fromLocation = fromLocationSelect.value;
        const toLocation = toLocationSelect.value;
        
        if (!fromLocation || !toLocation) {
            alert('Please select both "From" and "To" locations');
            return;
        }
        
        const matchingBuses = findMatchingBuses(fromLocation, toLocation);
        displayBusResults(matchingBuses);
        saveRecentSearch(fromLocation, toLocation);
    }
    
    // Find buses matching the route
    function findMatchingBuses(from, to) {
        return busData.routes.filter(route => 
            route.from === from && route.to === to
        );
    }
    
    // Display bus results
    function displayBusResults(buses) {
        busResultsContainer.innerHTML = '';
        
        if (buses.length === 0) {
            busResultsContainer.innerHTML = '<p class="no-results">No buses found for this route. Please try different locations.</p>';
            return;
        }
        
        buses.forEach(bus => {
            const busCard = createBusCard(bus);
            busResultsContainer.appendChild(busCard);
        });
    }
    
    // Create a bus card element
    function createBusCard(bus) {
        const card = document.createElement('div');
        card.className = 'bus-card';
        
        // Calculate duration
        const duration = calculateDuration(bus.departures[0], bus.arrivals[0]);
        
        // Create favorite button with localStorage check
        const isFavorite = localStorage.getItem(`fav_${bus.id}`) === 'true';
        const favoriteBtn = document.createElement('button');
        favoriteBtn.className = `favorite-btn ${isFavorite ? 'active' : ''}`;
        favoriteBtn.innerHTML = '<i class="fas fa-heart"></i>';
        favoriteBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            favoriteBtn.classList.toggle('active');
            localStorage.setItem(`fav_${bus.id}`, favoriteBtn.classList.contains('active'));
        });
        
        card.innerHTML = `
            <div class="bus-name">${bus.name}</div>
            <div class="bus-meta">
                <span class="bus-operator">${bus.operator}</span>
                <span class="bus-type">${bus.type}</span>
            </div>
            <div class="bus-timings">
                <div class="timing">
                    <div class="timing-label">Departure</div>
                    <div class="timing-value">${bus.departures[0]}</div>
                </div>
                <div class="timing">
                    <div class="timing-label">Arrival</div>
                    <div class="timing-value">${bus.arrivals[0]}</div>
                </div>
                <div class="timing">
                    <div class="timing-label">Duration</div>
                    <div class="timing-value duration-badge">${duration}</div>
                </div>
            </div>
            <div class="bus-actions">
                <button class="secondary-btn">View All Timings</button>
            </div>
        `;
        
        card.querySelector('.bus-actions').prepend(favoriteBtn);
        
        // Add click handler for "View All Timings"
        const viewTimingsBtn = card.querySelector('.secondary-btn');
        viewTimingsBtn.addEventListener('click', () => {
            showAllTimings(bus);
        });
        
        return card;
    }
    
    // Show all timings in a modal
    function showAllTimings(bus) {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        
        let timingsHTML = '';
        for (let i = 0; i < bus.departures.length; i++) {
            const duration = calculateDuration(bus.departures[i], bus.arrivals[i]);
            timingsHTML += `
                <div class="timing-row">
                    <span>${bus.departures[i]}</span>
                    <span>→</span>
                    <span>${bus.arrivals[i]}</span>
                    <span class="duration-badge">${duration}</span>
                </div>
            `;
        }
        
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>${bus.name}</h3>
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
        
        // Close modal handlers
        const closeBtn = modal.querySelector('.close-modal');
        closeBtn.addEventListener('click', () => {
            document.body.removeChild(modal);
        });
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                document.body.removeChild(modal);
            }
        });
    }
    
    // Calculate duration between two times
    function calculateDuration(departure, arrival) {
        const [depHour, depMin] = departure.split(':').map(Number);
        const [arrHour, arrMin] = arrival.split(':').map(Number);
        
        let totalMinutes = (arrHour * 60 + arrMin) - (depHour * 60 + depMin);
        
        if (totalMinutes < 0) {
            totalMinutes += 24 * 60; // Handle overnight trips
        }
        
        const hours = Math.floor(totalMinutes / 60);
        const minutes = totalMinutes % 60;
        
        return `${hours}h ${minutes}m`;
    }
    
    // Filter buses based on search input
    function filterBuses() {
        const searchTerm = busFilterInput.value.toLowerCase();
        const busCards = document.querySelectorAll('.bus-card');
        
        busCards.forEach(card => {
            const busName = card.querySelector('.bus-name').textContent.toLowerCase();
            if (busName.includes(searchTerm)) {
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
            }
        });
    }
    
    // Sort buses
    function sortBuses(sortBy) {
        const busCards = Array.from(document.querySelectorAll('.bus-card'));
        
        busCards.sort((a, b) => {
            switch (sortBy) {
                case 'time':
                    const timeA = a.querySelector('.timing-value').textContent;
                    const timeB = b.querySelector('.timing-value').textContent;
                    return timeA.localeCompare(timeB);
                
                case 'duration':
                    const durA = a.querySelector('.duration-badge').textContent;
                    const durB = b.querySelector('.duration-badge').textContent;
                    return parseDuration(durA) - parseDuration(durB);
                
                case 'type':
                    const typeA = a.querySelector('.bus-type').textContent;
                    const typeB = b.querySelector('.bus-type').textContent;
                    return typeA.localeCompare(typeB);
                
                default:
                    return 0;
            }
        });
        
        busCards.forEach(card => busResultsContainer.appendChild(card));
    }
    
    // Helper to parse duration string
    function parseDuration(duration) {
        const [hours, minutes] = duration.split(' ').map(part => parseInt(part));
        return hours * 60 + minutes;
    }
    
    // Save recent search
    function saveRecentSearch(from, to) {
        let recentSearches = JSON.parse(localStorage.getItem('recentSearches')) || [];
        
        // Remove if already exists
        recentSearches = recentSearches.filter(search => 
            !(search.from === from && search.to === to)
        );
        
        // Add to beginning
        recentSearches.unshift({ from, to });
        
        // Keep only last 5 searches
        if (recentSearches.length > 5) {
            recentSearches = recentSearches.slice(0, 5);
        }
        
        localStorage.setItem('recentSearches', JSON.stringify(recentSearches));
        loadRecentSearches();
    }
    
    // Load recent searches
    function loadRecentSearches() {
        const recentSearches = JSON.parse(localStorage.getItem('recentSearches')) || [];
        recentSearchesList.innerHTML = '';
        
        recentSearches.forEach(search => {
            const searchItem = document.createElement('div');
            searchItem.className = 'recent-search-item';
            searchItem.textContent = `${search.from} → ${search.to}`;
            searchItem.addEventListener('click', () => {
                fromLocationSelect.value = search.from;
                toLocationSelect.value = search.to;
                handleSearch();
            });
            recentSearchesList.appendChild(searchItem);
        });
    }
    
    // Initialize the app
    initApp();
});

// Add modal styles to the head
document.head.insertAdjacentHTML('beforeend', `
    <style>
        .modal-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-color: rgba(0, 0, 0, 0.5);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 1000;
        }
        
        .modal-content {
            background-color: white;
            border-radius: 10px;
            width: 90%;
            max-width: 500px;
            max-height: 80vh;
            overflow-y: auto;
            padding: 20px;
            box-shadow: 0 5px 20px rgba(0, 0, 0, 0.2);
        }
        
        .modal-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
        }
        
        .modal-header h3 {
            color: var(--primary-color);
        }
        
        .close-modal {
            background: none;
            border: none;
            font-size: 1.5rem;
            cursor: pointer;
            color: #777;
        }
        
        .timing-header {
            display: grid;
            grid-template-columns: 1fr auto 1fr auto;
            gap: 10px;
            margin-bottom: 15px;
            font-weight: 500;
            padding-bottom: 5px;
            border-bottom: 1px solid #eee;
        }
        
        .timing-row {
            display: grid;
            grid-template-columns: 1fr auto 1fr auto;
            gap: 10px;
            padding: 8px 0;
            align-items: center;
        }
        
        .timing-row:not(:last-child) {
            border-bottom: 1px solid #f5f5f5;
        }
    </style>
`);
