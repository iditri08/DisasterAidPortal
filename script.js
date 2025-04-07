if (window.location.pathname.includes('alerts.html')) {
    document.addEventListener('DOMContentLoaded', async function() {
        // Fetch alerts from GDACS API
        const alerts = await fetchGDACSAlerts();
        displayAlerts(alerts);
        
        // Setup filters
        document.getElementById('alert-type-filter').addEventListener('change', filterAlerts);
        document.getElementById('alert-severity-filter').addEventListener('change', filterAlerts);
    });

    async function fetchGDACSAlerts() {
        try {
            const response = await fetch('https://www.gdacs.org/gdacsapi/api/alerts/geteventlist/SEARCH');
            const data = await response.json();
            return data.features.map(feature => ({
                type: feature.properties.hazard.toLowerCase(),
                location: feature.properties.country,
                severity: feature.properties.alertlevel,
                description: feature.properties.eventname,
                date: new Date(feature.properties.fromdate).toLocaleDateString(),
                url: feature.properties.url,
                coordinates: feature.geometry.coordinates
            }));
        } catch (error) {
            console.error('Error fetching alerts:', error);
            return [];
        }
    }

    function displayAlerts(alerts) {
        const container = document.getElementById('alerts-container');
        container.innerHTML = '';
        
        if (alerts.length === 0) {
            container.innerHTML = '<div class="no-alerts">No current alerts found</div>';
            return;
        }
        
        alerts.forEach(alert => {
            const alertElement = document.createElement('div');
            alertElement.className = `alert-item ${alert.severity}`;
            alertElement.innerHTML = `
                <h4>${alert.type.charAt(0).toUpperCase() + alert.type.slice(1)} in ${alert.location}</h4>
                <p>${alert.description}</p>
                <div class="alert-meta">
                    <span class="severity-badge ${alert.severity}">${alert.severity.toUpperCase()}</span>
                    <span>${alert.date}</span>
                </div>
                <a href="${alert.url}" target="_blank" class="alert-link">More details →</a>
            `;
            container.appendChild(alertElement);
        });
    }

    function filterAlerts() {
        const typeFilter = document.getElementById('alert-type-filter').value;
        const severityFilter = document.getElementById('alert-severity-filter').value;
        
        // In a real implementation, you would re-fetch or filter existing alerts
        console.log(`Filtering by type: ${typeFilter}, severity: ${severityFilter}`);
    }
}

// For about.html - state resources
if (window.location.pathname.includes('about.html')) {
    document.addEventListener('DOMContentLoaded', function() {
        document.getElementById('state-selector').addEventListener('change', function() {
            const state = this.value;
            const stateResources = document.getElementById('state-resources');
            
            // Hide all state resources
            document.querySelectorAll('.state-resource').forEach(el => {
                el.style.display = 'none';
            });
            
            // Show default message if no state selected
            if (!state) {
                document.querySelector('.state-default').style.display = 'block';
                return;
            }
            
            // Hide default message
            document.querySelector('.state-default').style.display = 'none';
            
            // Show selected state's resources
            if (state) {
                document.querySelector(`.state-resource.${state}`).style.display = 'block';
            }
        });
        
        // Initialize state resources data
        const stateResources = {
            'maharashtra': {
                contacts: ['Mumbai Disaster Cell: 022-22694725', 'Pune Emergency: 020-26127343'],
                websites: ['https://msdma.gov.in']
            },
            'kerala': {
                contacts: ['Kerala Disaster Management: 0471-2364424', 'Flood Helpline: 1077'],
                websites: ['https://keralarescue.in']
            },
            'odisha': {
                contacts: ['Odisha Disaster Management Helpline: 0674-2395398 / 2395531'],
                websites: ['https://www.osdma.org/contact-us/#gsc.tab=0']
            },
            'tamilnadu': {
                contacts: [
                    'Commissionerate of Revenue Administration and Disaster Management:',
                    '044-28410540',
                    '044-28410541',
                    '044-28410544',
                    '044-28410545',
                    '044-28410549'
                ],
                websites: ['https://tiruvannamalai.nic.in/disaster-management/']
            },
            'westbengal': {
                contacts: ['WB Disaster Management Helpline: 033 2214 5664'],
                websites: ['http://wbdmd.gov.in/']
            }
        };
        
        // Create HTML for each state's resources
        Object.keys(stateResources).forEach(state => {
            const resourceDiv = document.createElement('div');
            resourceDiv.className = `state-resource ${state}`;
            resourceDiv.style.display = 'none';
            
            let html = `<h4>${state.charAt(0).toUpperCase() + state.slice(1).replace(/([a-z])([A-Z])/g, '$1 $2')} Resources</h4>`;
            html += '<ul class="state-contacts">';
            stateResources[state].contacts.forEach(contact => {
                html += `<li>${contact}</li>`;
            });
            html += '</ul><h4>Websites</h4><ul class="state-websites">';
            stateResources[state].websites.forEach(site => {
                html += `<li><a href="${site}" target="_blank">${site}</a></li>`;
            });
            html += '</ul>';
            
            resourceDiv.innerHTML = html;
            document.getElementById('state-resources').appendChild(resourceDiv);
        });
        
        // Add default message
        const defaultDiv = document.createElement('div');
        defaultDiv.className = 'state-default';
        defaultDiv.innerHTML = '<p>Please select a state to view disaster management resources</p>';
        document.getElementById('state-resources').prepend(defaultDiv);
    });
}

// For index.html - main map functionality
if (window.location.pathname.endsWith('template.html') || window.location.pathname === '/') {
    // Initialize the map
    const map = L.map('map').setView([20, 0], 2);

    // Add base tile layer (OpenStreetMap)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    // Define icons for different disaster types
    const disasterIcons = {
        earthquake: L.divIcon({
            className: 'earthquake-icon',
            html: '<i class="fas fa-mountain" style="color: #e74c3c; font-size: 24px;"></i>',
            iconSize: [24, 24],
            iconAnchor: [12, 12]
        }),
        flood: L.divIcon({
            className: 'flood-icon',
            html: '<i class="fas fa-water" style="color: #3498db; font-size: 24px;"></i>',
            iconSize: [24, 24],
            iconAnchor: [12, 12]
        }),
        wildfire: L.divIcon({
            className: 'wildfire-icon',
            html: '<i class="fas fa-fire" style="color: #f39c12; font-size: 24px;"></i>',
            iconSize: [24, 24],
            iconAnchor: [12, 12]
        }),
        hurricane: L.divIcon({
            className: 'hurricane-icon',
            html: '<i class="fas fa-wind" style="color: #9b59b6; font-size: 24px;"></i>',
            iconSize: [24, 24],
            iconAnchor: [12, 12]
        })
    };

    // Global variables to store markers and layers
    let disasterMarkers = [];
    let disasterAreas = [];
    let alertCheckInterval;

    // Function to fetch real-time disaster alerts from API
    async function fetchRealTimeAlerts() {
        try {
            const response = await fetch('https://www.gdacs.org/gdacsapi/api/alerts/geteventlist/SEARCH');
            const data = await response.json();
            
            return data.features.map(feature => {
                return {
                    type: feature.properties.hazard.toLowerCase(),
                    location: [feature.geometry.coordinates[1], feature.geometry.coordinates[0]],
                    severity: feature.properties.alertlevel,
                    description: feature.properties.eventname,
                    date: new Date(feature.properties.fromdate).toLocaleDateString(),
                    url: feature.properties.url
                };
            });
        } catch (error) {
            console.error('Error fetching real-time alerts:', error);
            return [];
        }
    }

    // Function to fetch disaster-prone areas from API
    async function fetchDisasterProneAreas() {
        try {
            const response = await fetch('https://api.reliefweb.int/v1/disasters?appname=disaster-management&profile=list&preset=latest&slim=1');
            const data = await response.json();
            
            return data.data.map(item => {
                const fields = item.fields;
                return {
                    type: fields.primary_type.toLowerCase(),
                    location: [fields.country[0].location.lat, fields.country[0].location.lon],
                    name: fields.name,
                    date: new Date(fields.date.created).toLocaleDateString(),
                    description: fields.description || 'No description available',
                    status: fields.status
                };
            });
        } catch (error) {
            console.error('Error fetching disaster-prone areas:', error);
            return [];
        }
    }

    // Function to update the map with disaster data
    function updateMapWithDisasters(disasters) {
        disasterMarkers.forEach(marker => map.removeLayer(marker));
        disasterMarkers = [];
        
        disasters.forEach(disaster => {
            const marker = L.marker(disaster.location, {
                icon: disasterIcons[disaster.type] || disasterIcons.earthquake
            }).addTo(map);
            
            let popupContent = `<h3>${disaster.type.charAt(0).toUpperCase() + disaster.type.slice(1)}</h3>`;
            popupContent += `<p><strong>Date:</strong> ${disaster.date}</p>`;
            popupContent += `<p>${disaster.description}</p>`;
            
            if (disaster.magnitude) {
                popupContent += `<p><strong>Magnitude:</strong> ${disaster.magnitude}</p>`;
            }
            if (disaster.severity) {
                popupContent += `<p><strong>Severity:</strong> ${disaster.severity}</p>`;
            }
            if (disaster.category) {
                popupContent += `<p><strong>Category:</strong> ${disaster.category}</p>`;
            }
            if (disaster.url) {
                popupContent += `<p><a href="${disaster.url}" target="_blank">More info</a></p>`;
            }
            
            marker.bindPopup(popupContent);
            disasterMarkers.push(marker);
        });
    }

    // Function to update the alerts panel
    function updateAlertsPanel(alerts) {
        const alertsList = document.querySelector('.alerts-list');
        alertsList.innerHTML = '';
        
        alerts.slice(0, 5).forEach(alert => {
            const alertItem = document.createElement('div');
            alertItem.className = 'alert-item';
            
            let borderColor = '#e74c3c';
            if (alert.severity === 'Green') borderColor = '#2ecc71';
            else if (alert.severity === 'Orange') borderColor = '#f39c12';
            
            alertItem.style.borderLeft = `4px solid ${borderColor}`;
            alertItem.innerHTML = `
                <h4>${alert.type.charAt(0).toUpperCase() + alert.type.slice(1)} Alert</h4>
                <p>${alert.description}</p>
                <small>${alert.date} • Severity: ${alert.severity || 'Unknown'}</small>
            `;
            alertsList.appendChild(alertItem);
        });
    }

    // Function to check for new alerts periodically
    function startAlertCheck() {
        alertCheckInterval = setInterval(async () => {
            const alerts = await fetchRealTimeAlerts();
            updateMapWithDisasters(alerts);
            updateAlertsPanel(alerts);
            
            if (alerts.length > 0) {
                showNotification(`New disaster alerts: ${alerts.length} new events`);
            }
        }, 300000);
        
        fetchRealTimeAlerts().then(alerts => {
            updateMapWithDisasters(alerts);
            updateAlertsPanel(alerts);
        });
    }

    // Function to show desktop notification
    function showNotification(message) {
        if (!("Notification" in window)) {
            console.log("This browser does not support desktop notification");
            return;
        }
        
        if (Notification.permission === "granted") {
            new Notification("Disaster Alert", { body: message });
        }
        else if (Notification.permission !== "denied") {
            Notification.requestPermission().then(permission => {
                if (permission === "granted") {
                    new Notification("Disaster Alert", { body: message });
                }
            });
        }
    }

    // Function to load disaster-prone areas as polygons
    async function loadDisasterProneAreas() {
        const areas = await fetchDisasterProneAreas();
        
        disasterAreas.forEach(area => map.removeLayer(area));
        disasterAreas = [];
        
        areas.forEach(area => {
            const circle = L.circle(area.location, {
                color: getColorForDisasterType(area.type),
                fillColor: getColorForDisasterType(area.type),
                fillOpacity: 0.3,
                radius: 50000
            }).addTo(map);
            
            circle.bindPopup(`
                <h3>${area.name}</h3>
                <p><strong>Type:</strong> ${area.type}</p>
                <p><strong>Status:</strong> ${area.status}</p>
                <p>${area.description}</p>
            `);
            
            disasterAreas.push(circle);
        });
    }

    // Helper function to get color based on disaster type
    function getColorForDisasterType(type) {
        switch(type) {
            case 'earthquake': return '#e74c3c';
            case 'flood': return '#3498db';
            case 'wildfire': return '#f39c12';
            case 'hurricane': return '#9b59b6';
            default: return '#7f8c8d';
        }
    }

    // Handle disaster type filtering
    document.querySelectorAll('.disaster-option').forEach(option => {
        option.addEventListener('click', function() {
            const type = this.getAttribute('data-type');
            
            document.querySelectorAll('.disaster-option').forEach(opt => {
                opt.classList.remove('active');
            });
            this.classList.add('active');
            
            disasterMarkers.forEach(marker => {
                const markerType = marker.options.icon.options.className.replace('-icon', '');
                if (type === 'all' || markerType === type) {
                    map.addLayer(marker);
                } else {
                    map.removeLayer(marker);
                }
            });
            
            disasterAreas.forEach(area => {
                const areaType = area.options.color === getColorForDisasterType(type);
                if (type === 'all' || areaType) {
                    map.addLayer(area);
                } else {
                    map.removeLayer(area);
                }
            });
        });
    });

    // Handle locate me button
    document.getElementById('locate-me').addEventListener('click', function() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(position => {
                map.setView([position.coords.latitude, position.coords.longitude], 12);
                L.marker([position.coords.latitude, position.coords.longitude], {
                    icon: L.divIcon({
                        className: 'user-location-icon',
                        html: '<i class="fas fa-user" style="color: #2ecc71; font-size: 24px;"></i>',
                        iconSize: [24, 24],
                        iconAnchor: [12, 12]
                    })
                }).addTo(map).bindPopup('Your current location').openPopup();
            });
        } else {
            alert('Geolocation is not supported by your browser');
        }
    });

    // Handle zoom buttons
    document.getElementById('zoom-in').addEventListener('click', function() {
        map.zoomIn();
    });

    document.getElementById('zoom-out').addEventListener('click', function() {
        map.zoomOut();
    });

    // Handle incident report form
    document.getElementById('incident-form').addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const type = document.getElementById('incident-type').value;
        const location = document.getElementById('incident-location').value;
        const description = document.getElementById('incident-description').value;
        
        try {
            const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(location)}`);
            const data = await response.json();
            
            if (data.length === 0) {
                throw new Error('Location not found');
            }
            
            const coordinates = [parseFloat(data[0].lat), parseFloat(data[0].lon)];
            
            const apiResponse = await fetch('/api/disasters', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    type: type,
                    location: coordinates,
                    description: description,
                    severity: 'medium',
                    date: new Date().toISOString()
                })
            });
            
            if (apiResponse.ok) {
                showNotification('Incident reported successfully!');
                
                const alerts = await fetchRealTimeAlerts();
                updateMapWithDisasters(alerts);
                updateAlertsPanel(alerts);
                
                this.reset();
            } else {
                const error = await apiResponse.json();
                throw new Error(error.error || 'Failed to report incident');
            }
        } catch (error) {
            console.error('Error reporting incident:', error);
            alert(`Error: ${error.message}`);
        }
    });

    // Initialize the application
    async function initializeApp() {
        if ("Notification" in window) {
            Notification.requestPermission();
        }
        
        const [alerts, proneAreas] = await Promise.all([
            fetchRealTimeAlerts(),
            fetchDisasterProneAreas()
        ]);
        
        updateMapWithDisasters(alerts);
        updateAlertsPanel(alerts);
        loadDisasterProneAreas();
        
        startAlertCheck();
    }

    // Start the app when DOM is loaded
    document.addEventListener('DOMContentLoaded', initializeApp);
}