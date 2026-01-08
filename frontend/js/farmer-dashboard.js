// API Configuration - Uses config.js for environment-aware API URL
// The API_URL is now loaded from config.js which auto-detects development vs production

// DOM Elements
const farmerNameElement = document.getElementById('farmerName');
const farmerLocationElement = document.getElementById('farmerLocation');
const farmerCropElement = document.getElementById('farmerCrop');
const currentDateElement = document.getElementById('currentDate');
const userMenuBtn = document.getElementById('userMenuBtn');
const userDropdown = document.getElementById('userDropdown');
const logoutBtn = document.getElementById('logoutBtn');
const languageSelect = document.getElementById('languageSelect');

// Initialize Dashboard
document.addEventListener('DOMContentLoaded', async () => {
    console.log('🌾 ========================================');
    console.log('🌾 Initializing Farmer Dashboard');
    console.log('🌾 ========================================');
    
    try {
        // Step 1: Check authentication
        checkAuthentication();
        
        // Step 2: Setup event listeners FIRST (before loading data)
        console.log('📌 Step 1: Setting up event listeners...');
        setupEventListeners();
        
        // Step 3: Load all data
        console.log('📌 Step 2: Loading dashboard data...');
        loadFarmerData();
        initializeDate();
        loadWeatherData();
        loadMarketPrices('all');
        loadGovernmentSchemes();
        loadNotifications();
        
        console.log('✅ ========================================');
        console.log('✅ Dashboard initialized successfully!');
        console.log('✅ ========================================');
    } catch (error) {
        console.error('❌ Dashboard initialization error:', error);
    }
});

// Check Authentication
function checkAuthentication() {
    const token = localStorage.getItem('farmerToken') || sessionStorage.getItem('farmerToken');
    
    if (!token) {
        // Not logged in, redirect to login
        window.location.href = 'farmer-login.html';
        return;
    }
}

// Load Farmer Data
async function loadFarmerData() {
    try {
        const token = localStorage.getItem('farmerToken') || sessionStorage.getItem('farmerToken');
        
        if (!token) {
            console.warn('No auth token found');
            return;
        }
        
        // Fetch fresh farmer data from API
        const response = await fetch(`${API_URL}/farmer/profile`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (response.ok) {
            const result = await response.json();
            if (result.success && result.farmer) {
                // Store farmer data
                const farmerData = result.farmer;
                localStorage.setItem('farmerData', JSON.stringify(farmerData));
                
                // Update UI with farmer information
                updateFarmerInfo(farmerData);
            } else {
                console.warn('Failed to load farmer data:', result.message);
                // Try to use cached data
                const cachedData = localStorage.getItem('farmerData');
                if (cachedData) {
                    updateFarmerInfo(JSON.parse(cachedData));
                }
            }
        } else {
            console.error('API error:', response.status);
            // Try to use cached data
            const cachedData = localStorage.getItem('farmerData');
            if (cachedData) {
                updateFarmerInfo(JSON.parse(cachedData));
            }
        }
    } catch (error) {
        console.error('Error loading farmer data:', error);
        // Try to use cached data as last resort
        const cachedData = localStorage.getItem('farmerData');
        if (cachedData) {
            updateFarmerInfo(JSON.parse(cachedData));
        }
    }
}

// Update Farmer Information
function updateFarmerInfo(data) {
    console.log('Updating farmer info:', data);
    
    // Update name
    if (data.name || data.fullName) {
        const name = data.name || data.fullName;
        farmerNameElement.textContent = name;
        document.getElementById('userName').textContent = name.split(' ')[0];
    }
    
    // Update location
    if (data.location) {
        farmerLocationElement.textContent = data.location;
    }
    
    // Update crop information
    if (data.crop_type || data.cropType) {
        const cropType = data.crop_type || data.cropType;
        const cropName = cropType.charAt(0).toUpperCase() + cropType.slice(1);
        farmerCropElement.textContent = cropName;
        
        // Add additional crop details if available
        const cropDetails = [];
        if (data.crop_date) {
            const date = new Date(data.crop_date);
            cropDetails.push(`Planted: ${date.toLocaleDateString()}`);
        }
        if (data.crop_location) {
            cropDetails.push(`Location: ${data.crop_location}`);
        }
        
        if (cropDetails.length > 0) {
            farmerCropElement.title = cropDetails.join(' | ');
        }
        
        console.log('✅ Crop data loaded:', cropName, cropDetails.join(' | '));
    } else {
        farmerCropElement.textContent = 'No crop selected yet';
        console.log('⚠️ No crop data available in database');
    }
    
    // Update language preference
    if (data.language) {
        languageSelect.value = data.language;
    }
}

// Initialize Current Date
function initializeDate() {
    const now = new Date();
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    currentDateElement.textContent = now.toLocaleDateString('en-US', options);
}

// District data by state
const districtsByState = {
    'Karnataka': ['Bengaluru Urban', 'Bengaluru Rural', 'Mysuru', 'Mandya', 'Hassan', 'Chikkamagaluru', 'Tumakuru', 'Kolar', 'Chitradurga', 'Davanagere', 'Shivamogga', 'Belagavi', 'Vijayapura', 'Bagalkot', 'Dharwad', 'Gadag', 'Haveri', 'Uttara Kannada', 'Ballari', 'Bidar', 'Kalaburagi', 'Raichur', 'Koppal', 'Yadgir', 'Chamarajanagar', 'Chikkaballapur', 'Dakshina Kannada', 'Kodagu', 'Ramanagara', 'Udupi', 'Vijayanagara'],
    'Tamil Nadu': ['Chennai', 'Coimbatore', 'Madurai', 'Tiruchirappalli', 'Salem', 'Tirunelveli', 'Tiruppur', 'Ranipet', 'Nagercoil', 'Thanjavur', 'Vellore', 'Kancheepuram', 'Erode', 'Tiruvannamalai', 'Karur', 'Sivaganga', 'Virudhunagar', 'Dindigul', 'Ramanathapuram', 'Theni', 'Namakkal', 'Dharmapuri', 'Krishnagiri', 'Pudukkottai', 'Nilgiris', 'Perambalur', 'Cuddalore', 'Villupuram', 'Nagapattinam', 'Tenkasi'],
    'Andhra Pradesh': ['Visakhapatnam', 'Vijayawada', 'Guntur', 'Nellore', 'Kurnool', 'Kakinada', 'Rajahmundry', 'Tirupati', 'Kadapa', 'Anantapur', 'Vizianagaram', 'Eluru', 'Ongole', 'Nandyal', 'Machilipatnam', 'Adoni', 'Tenali', 'Chittoor', 'Hindupur', 'Proddatur', 'Bhimavaram', 'Madanapalle', 'Guntakal', 'Dharmavaram', 'Gudivada', 'Srikakulam', 'Narasaraopet'],
    'Kerala': ['Thiruvananthapuram', 'Kochi', 'Kozhikode', 'Kollam', 'Thrissur', 'Kannur', 'Alappuzha', 'Kottayam', 'Palakkad', 'Malappuram', 'Kasaragod', 'Pathanamthitta', 'Idukki', 'Wayanad'],
    'Maharashtra': ['Mumbai', 'Pune', 'Nagpur', 'Thane', 'Nashik', 'Aurangabad', 'Solapur', 'Kolhapur', 'Amravati', 'Nanded', 'Sangli', 'Jalgaon', 'Akola', 'Latur', 'Dhule', 'Ahmednagar', 'Chandrapur', 'Parbhani', 'Jalna', 'Bhiwandi', 'Navi Mumbai', 'Panvel', 'Satara', 'Beed', 'Yavatmal', 'Wardha', 'Osmanabad', 'Hingoli', 'Buldhana', 'Washim', 'Raigad', 'Ratnagiri', 'Sindhudurg', 'Gondia', 'Bhandara', 'Gadchiroli'],
    'Telangana': ['Hyderabad', 'Warangal', 'Nizamabad', 'Khammam', 'Karimnagar', 'Ramagundam', 'Mahbubnagar', 'Nalgonda', 'Adilabad', 'Suryapet', 'Siddipet', 'Miryalaguda', 'Jagtial', 'Mancherial', 'Nirmal', 'Kothagudem', 'Bodhan', 'Palwancha', 'Mandapeta', 'Koratla', 'Sircilla', 'Tandur', 'Sangareddy', 'Vikarabad', 'Wanaparthy', 'Medak', 'Nagarkurnool', 'Kamareddy']
};

// Initialize State/District selectors
function initializeWeatherSelectors() {
    const stateSelect = document.getElementById('weatherState');
    const districtSelect = document.getElementById('weatherDistrict');
    const fetchWeatherBtn = document.getElementById('fetchWeatherBtn');
    
    if (!stateSelect || !districtSelect || !fetchWeatherBtn) {
        console.warn('⚠️ Weather selector elements not found');
        return;
    }
    
    // State change handler
    stateSelect.addEventListener('change', (e) => {
        const selectedState = e.target.value;
        districtSelect.innerHTML = '<option value="">Select District</option>';
        
        if (selectedState && districtsByState[selectedState]) {
            districtsByState[selectedState].forEach(district => {
                const option = document.createElement('option');
                option.value = district;
                option.textContent = district;
                districtSelect.appendChild(option);
            });
            districtSelect.disabled = false;
        } else {
            districtSelect.disabled = true;
        }
    });
    
    // Fetch weather button handler
    fetchWeatherBtn.addEventListener('click', async () => {
        const state = stateSelect.value;
        const district = districtSelect.value;
        
        if (!state || !district) {
            alert('Please select both State and District');
            return;
        }
        
        console.log(`🌤️ Fetching weather for ${district}, ${state}`);
        await loadWeatherByLocation(district, state);
    });
    
    console.log('✅ Weather selectors initialized');
}

// Load weather by specific location
async function loadWeatherByLocation(district, state) {
    try {
        const token = localStorage.getItem('farmerToken') || sessionStorage.getItem('farmerToken');
        
        if (!token) {
            console.warn('No token, cannot fetch weather');
            return;
        }
        
        // Show loading state
        const weatherIcon = document.getElementById('weatherIcon');
        const temperature = document.getElementById('temperature');
        const weatherDesc = document.getElementById('weatherDesc');
        
        if (weatherIcon) weatherIcon.textContent = '⏳';
        if (temperature) temperature.textContent = 'Loading...';
        if (weatherDesc) weatherDesc.textContent = 'Fetching weather data';
        
        // Fetch weather with location parameter
        const response = await fetch(`${API_URL}/farmer/weather?location=${encodeURIComponent(district)}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (response.ok) {
            const result = await response.json();
            if (result.success) {
                updateWeatherUI(result);
                console.log(`✅ Weather loaded for ${district}, ${state}`);
            } else {
                throw new Error(result.message || 'Failed to fetch weather');
            }
        } else {
            throw new Error(`API error: ${response.status}`);
        }
    } catch (error) {
        console.error('❌ Error fetching weather:', error);
        
        // Show error in UI
        const weatherIcon = document.getElementById('weatherIcon');
        const temperature = document.getElementById('temperature');
        const weatherDesc = document.getElementById('weatherDesc');
        
        if (weatherIcon) weatherIcon.textContent = '❌';
        if (temperature) temperature.textContent = 'Error';
        if (weatherDesc) weatherDesc.textContent = 'Failed to fetch weather. Please try again.';
    }
}

// Load Weather Data from API
async function loadWeatherData() {
    try {
        const token = localStorage.getItem('farmerToken') || sessionStorage.getItem('farmerToken');
        
        if (!token) {
            console.log('No token, using demo weather data');
            useDemoWeatherData();
            return;
        }

        // Show loading state
        document.getElementById('weatherDesc').textContent = 'Loading weather...';

        const response = await fetch(`${API_URL}/farmer/weather`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            const result = await response.json();
            
            if (result.success) {
                updateWeatherUI(result);
                
                // Display weather alerts if any
                if (result.hasAlerts && result.alerts && result.alerts.length > 0) {
                    displayWeatherAlerts(result.alerts);
                }
                
                // Display agricultural advice
                if (result.advice && result.advice.length > 0) {
                    displayAgriculturalAdvice(result.advice);
                }
                
                console.log('✅ Weather data loaded successfully for:', result.location?.name || 'your location');
            } else {
                console.warn('Weather API returned success=false');
                useDemoWeatherData();
            }
        } else {
            console.warn('Weather API request failed:', response.status);
            useDemoWeatherData();
        }
    } catch (error) {
        console.error('Error loading weather:', error);
        useDemoWeatherData();
    }
}

// Use demo weather data as fallback
function useDemoWeatherData() {
    const weatherData = {
        current: {
            temperature: 28,
            description: 'Partly Cloudy',
            icon: '🌤️',
            humidity: 65,
            windSpeed: 12,
            rainfall: 20,
            uvIndex: 7
        },
        forecast: [
            { day: 'Mon', icon: '☀️', tempMax: 30, tempMin: 22 },
            { day: 'Tue', icon: '🌤️', tempMax: 28, tempMin: 21 },
            { day: 'Wed', icon: '🌧️', tempMax: 26, tempMin: 20 },
            { day: 'Thu', icon: '⛈️', tempMax: 25, tempMin: 19 },
            { day: 'Fri', icon: '🌤️', tempMax: 29, tempMin: 22 },
            { day: 'Sat', icon: '☀️', tempMax: 31, tempMin: 23 },
            { day: 'Sun', icon: '🌤️', tempMax: 29, tempMin: 21 }
        ]
    };
    
    updateWeatherUI(weatherData);
}

// Update Weather UI
function updateWeatherUI(data) {
    const current = data.current || data;
    const forecast = data.forecast || [];
    
    document.getElementById('weatherIcon').textContent = current.icon;
    document.getElementById('temperature').textContent = `${current.temperature}°C`;
    document.getElementById('weatherDesc').textContent = current.description || 'Loading...';
    document.getElementById('humidity').textContent = `${current.humidity}%`;
    document.getElementById('windSpeed').textContent = `${current.windSpeed} km/h`;
    document.getElementById('rainfall').textContent = `${current.rainfall}%`;
    
    // Update forecast with 7-day data
    const forecastList = document.getElementById('forecastList');
    forecastList.innerHTML = forecast.map(day => `
        <div class="forecast-item">
            <div class="forecast-day">${day.day}</div>
            <div class="forecast-icon">${day.icon}</div>
            <div class="forecast-temp">${day.tempMax}°/${day.tempMin}°C</div>
        </div>
    `).join('');
}

// Display Weather Alerts
function displayWeatherAlerts(alerts) {
    const alertsContainer = document.getElementById('weatherAlerts');
    
    if (!alertsContainer) {
        // Create alerts container if it doesn't exist
        const weatherCard = document.querySelector('.weather-card');
        const alertDiv = document.createElement('div');
        alertDiv.id = 'weatherAlerts';
        alertDiv.className = 'weather-alerts';
        weatherCard.appendChild(alertDiv);
    }
    
    const container = document.getElementById('weatherAlerts');
    
    const alertsHTML = alerts.map(alert => {
        const severityClass = alert.severity || 'minor';
        const severityIcon = {
            'severe': '⚠️',
            'moderate': '⚡',
            'minor': 'ℹ️'
        };
        
        return `
            <div class="weather-alert ${severityClass}">
                <div class="alert-header">
                    <span class="alert-icon">${severityIcon[severityClass]}</span>
                    <strong>${alert.event}</strong>
                </div>
                <p class="alert-description">${alert.description}</p>
                <div class="alert-meta">
                    <small>Valid until: ${new Date(alert.end).toLocaleString('en-IN')}</small>
                </div>
            </div>
        `;
    }).join('');
    
    container.innerHTML = `
        <div class="alerts-title">⚠️ Weather Alerts</div>
        ${alertsHTML}
    `;
    container.style.display = 'block';
}

// Display Agricultural Advice
function displayAgriculturalAdvice(adviceList) {
    const notificationsSection = document.getElementById('notificationsList');
    
    if (notificationsSection && adviceList.length > 0) {
        const adviceHTML = adviceList.map(advice => {
            const severityIcon = {
                'high': '🔴',
                'moderate': '🟡',
                'low': '🟢'
            };
            
            return `
                <div class="notification-item advice ${advice.severity}">
                    <div class="notification-icon">${severityIcon[advice.severity] || '💡'}</div>
                    <div class="notification-content">
                        <div class="notification-title">Weather Advisory - ${advice.type}</div>
                        <div class="notification-message">${advice.message}</div>
                        <div class="notification-time">Just now</div>
                    </div>
                </div>
            `;
        }).join('');
        
        // Prepend advice to notifications
        notificationsSection.insertAdjacentHTML('afterbegin', adviceHTML);
    }
}

// Load Market Prices
async function loadMarketPrices(category = 'all') {
    try {
        const token = localStorage.getItem('farmerToken') || sessionStorage.getItem('farmerToken');
        
        if (!token) {
            console.log('No token, using demo market data');
            useDemoMarketData(category);
            return;
        }

        const response = await fetch(`${API_URL}/farmer/market-prices?category=${category}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            const result = await response.json();
            
            if (result.success && result.data) {
                updateMarketPricesUI(result.data);
            } else {
                useDemoMarketData(category);
            }
        } else {
            useDemoMarketData(category);
        }
    } catch (error) {
        console.error('Error loading market prices:', error);
        useDemoMarketData(category);
    }
}

// Use demo market data as fallback
function useDemoMarketData(category) {
    const marketData = {
        vegetables: [
            { commodity: 'Tomato', price: 40, unit: 'kg', change: '+5%', trend: 'up', market: 'Mysore APMC' },
            { commodity: 'Onion', price: 35, unit: 'kg', change: '-3%', trend: 'down', market: 'Mysore APMC' },
            { commodity: 'Potato', price: 25, unit: 'kg', change: '+2%', trend: 'up', market: 'Bangalore APMC' }
        ],
        fruits: [
            { commodity: 'Banana', price: 50, unit: 'dozen', change: '+3%', trend: 'up', market: 'Mysore APMC' },
            { commodity: 'Mango', price: 80, unit: 'kg', change: '+10%', trend: 'up', market: 'Mysore APMC' }
        ],
        grains: [
            { commodity: 'Rice', price: 2500, unit: 'quintal', change: '+4%', trend: 'up', market: 'Mysore APMC' },
            { commodity: 'Wheat', price: 2200, unit: 'quintal', change: '+2%', trend: 'up', market: 'Bangalore APMC' }
        ],
        all: [
            { commodity: 'Rice', price: 2500, unit: 'quintal', change: '+4%', trend: 'up', market: 'Mysore APMC' },
            { commodity: 'Tomato', price: 40, unit: 'kg', change: '+5%', trend: 'up', market: 'Mysore APMC' },
            { commodity: 'Banana', price: 50, unit: 'dozen', change: '+3%', trend: 'up', market: 'Mysore APMC' }
        ]
    };
    
    updateMarketPricesUI(marketData[category] || marketData.all);
}

// Update Market Prices UI
function updateMarketPricesUI(prices) {
    const tableBody = document.getElementById('priceTableBody');
    
    if (!tableBody) {
        console.error('Price table body element not found');
        return;
    }
    
    if (!prices || prices.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="6" style="text-align: center; padding: 20px; color: #999;">
                    No market prices available for this category.
                </td>
            </tr>
        `;
        return;
    }
    
    tableBody.innerHTML = prices.map(item => `
        <tr>
            <td><strong>${item.commodity || item.name}</strong></td>
            <td>₹${item.minPrice || item.min_price || 'N/A'}</td>
            <td>₹${item.maxPrice || item.max_price || 'N/A'}</td>
            <td>₹${item.modalPrice || item.modal_price || item.price || 'N/A'}</td>
            <td>${item.market || 'Karnataka'}</td>
            <td>${item.arrivalDate ? new Date(item.arrivalDate).toLocaleDateString() : new Date().toLocaleDateString()}</td>
        </tr>
    `).join('');
}

// Load Government Schemes
async function loadGovernmentSchemes() {
    try {
        const token = localStorage.getItem('farmerToken') || sessionStorage.getItem('farmerToken');
        
        // Fetch subsidies from API (same endpoint admin uses)
        const response = await fetch('/api/farmer/subsidies', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!response.ok) {
            throw new Error('Failed to fetch subsidies');
        }
        
        const data = await response.json();
        
        if (data.success && data.data) {
            // Convert API subsidies to schemes format with URL support
            const schemes = data.data.slice(0, 6).map(subsidy => ({
                id: subsidy._id,
                title: subsidy.title,
                amount: subsidy.amount || null,
                category: subsidy.category,
                description: subsidy.description || subsidy.eligibility,
                eligibility: subsidy.eligibility || '',
                deadline: subsidy.applicationDeadline ? new Date(subsidy.applicationDeadline).toLocaleDateString('en-IN') : null,
                link: subsidy.url || subsidy.contactInfo?.website || '#',
                state: subsidy.state
            }));
            
            updateSchemesUI(schemes);
        } else {
            // Fallback to demo data
            loadDemoSchemes();
        }
    } catch (error) {
        console.error('Error loading schemes:', error);
        loadDemoSchemes();
    }
}

// Load demo schemes as fallback
function loadDemoSchemes() {
    const schemes = [
        {
            title: 'PM-KISAN (Pradhan Mantri Kisan Samman Nidhi)',
            amount: 6000,
            category: 'income support',
            description: 'Direct income support of ₹6000 per year to all landholding farmers',
            eligibility: 'All landholding farmer families',
            deadline: '31/12/2025',
            link: 'https://pmkisan.gov.in',
            state: 'All India'
        },
        {
            title: 'Pradhan Mantri Fasal Bima Yojana (PMFBY)',
            amount: null,
            category: 'insurance',
            description: 'Comprehensive crop insurance scheme protecting farmers against crop loss due to natural calamities',
            eligibility: 'All farmers growing notified crops',
            deadline: '30/06/2025',
            link: 'https://pmfby.gov.in',
            state: 'All India'
        },
        {
            title: 'Karnataka Seed Subsidy Scheme',
            amount: 5000,
            category: 'seeds',
            description: 'Get 50% subsidy on certified seeds for agricultural crops in Karnataka',
            eligibility: 'Registered farmers with valid land documents',
            deadline: '31/03/2026',
            link: 'https://raitamitra.karnataka.gov.in',
            state: 'Karnataka'
        },
        {
            title: 'Soil Health Card Scheme',
            amount: null,
            category: 'advisory',
            description: 'Free soil testing and customized fertilizer recommendations for farmers',
            eligibility: 'All farmers',
            deadline: null,
            link: 'https://soilhealth.dac.gov.in',
            state: 'All India'
        },
        {
            title: 'PM Kisan Maandhan Yojana (Pension)',
            amount: 36000,
            category: 'pension',
            description: '₹3,000 monthly pension to small and marginal farmers after 60 years of age',
            eligibility: 'Small and marginal farmers aged 18-40 years',
            deadline: '28/02/2026',
            link: 'https://maandhan.in',
            state: 'All India'
        }
    ];
    
    updateSchemesUI(schemes);
}

// Update Schemes UI
function updateSchemesUI(schemes) {
    const schemesList = document.getElementById('schemesList');
    if (!schemesList) {
        console.error('Schemes list element not found');
        return;
    }
    
    const viewSchemeText = window.krushiLang ? window.krushiLang.translate('subsidy.viewScheme') : 'View Official Scheme';
    
    schemesList.innerHTML = schemes.map(scheme => `
        <div class="scheme-item">
            <div class="scheme-header">
                <div class="scheme-title">${scheme.title}</div>
                ${scheme.amount ? `<div class="scheme-amount">₹${scheme.amount.toLocaleString('en-IN')}</div>` : ''}
            </div>
            <div class="scheme-meta">
                ${scheme.category ? `<span class="scheme-badge">${capitalizeFirst(scheme.category)}</span>` : ''}
                ${scheme.state ? `<span class="scheme-location">📍 ${scheme.state}</span>` : ''}
            </div>
            <div class="scheme-desc">${scheme.description}</div>
            ${scheme.eligibility ? `<div class="scheme-eligibility">✓ Eligibility: ${scheme.eligibility}</div>` : ''}
            ${scheme.deadline ? `<div class="scheme-deadline">⏰ Apply by: ${scheme.deadline}</div>` : ''}
            <a href="${scheme.link}" class="scheme-action" target="_blank" rel="noopener noreferrer">
                <span>🌐 ${viewSchemeText}</span>
                <span>→</span>
            </a>
        </div>
    `).join('');
    
    console.log(`✅ Updated ${schemes.length} subsidy schemes`);
}

// Helper function to capitalize first letter
function capitalizeFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

// Load Notifications
async function loadNotifications() {
    console.log('[NOTIFICATIONS] 🔄 Starting fresh load...');
    
    // STEP 1: Clear any old localStorage notifications
    try {
        localStorage.removeItem('farmerNotifications');
        localStorage.removeItem('notifications');
        console.log('[NOTIFICATIONS] ✅ Cleared old localStorage data');
    } catch (e) {
        console.warn('[NOTIFICATIONS] Could not clear localStorage:', e);
    }
    
    const notificationsList = document.getElementById('notificationsList');
    const notificationCount = document.getElementById('notificationCount');
    
    try {
        console.log('[NOTIFICATIONS] Fetching from API...');
        
        // Clear existing notifications FIRST
        if (notificationsList) {
            notificationsList.innerHTML = '<div class="loading">⏳ Loading notifications...</div>';
        }
        
        const token = localStorage.getItem('farmerToken') || sessionStorage.getItem('farmerToken');
        
        if (!token) {
            console.log('[NOTIFICATIONS] ⚠️ No token found');
            if (notificationsList) {
                notificationsList.innerHTML = '<div class="no-notifications">📢 Please login to view notifications</div>';
            }
            if (notificationCount) notificationCount.textContent = '0';
            return;
        }
        
        const response = await fetch(`${API_URL}/farmer/notifications`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        console.log(`[NOTIFICATIONS] API response status: ${response.status}`);
        
        if (!response.ok) {
            if (response.status === 401) {
                throw new Error('Unauthorized - please login again');
            }
            throw new Error(`API returned ${response.status}`);
        }
        
        const data = await response.json();
        console.log('[NOTIFICATIONS] 📦 Received data:', data);
        
        if (data.success && data.notifications && data.notifications.length > 0) {
            const formattedNotifications = data.notifications.map(notif => ({
                id: notif.id || notif._id,
                icon: notif.icon || getIconForType(notif.type),
                title: notif.title,
                text: notif.message,
                time: getTimeAgo(new Date(notif.createdAt)),
                type: notif.type,
                priority: notif.priority,
                unread: true
            }));
            
            console.log(`[NOTIFICATIONS] ✅ Loaded ${formattedNotifications.length} notifications from database`);
            updateNotificationsUI(formattedNotifications);
        } else {
            // No notifications found
            console.log('[NOTIFICATIONS] ℹ️ No notifications in database');
            if (notificationsList) {
                notificationsList.innerHTML = `
                    <div class="no-notifications">
                        <span class="no-notif-icon">🔔</span>
                        <p>No notifications available</p>
                        <small>Check back later for updates</small>
                    </div>
                `;
            }
            if (notificationCount) {
                notificationCount.textContent = '0';
            }
        }
    } catch (error) {
        console.error('[NOTIFICATIONS] ❌ Error loading notifications:', error);
        
        // Show error state with retry button
        if (notificationsList) {
            notificationsList.innerHTML = `
                <div class="no-notifications">
                    <span class="no-notif-icon">⚠️</span>
                    <p>Unable to load notifications</p>
                    <small>${error.message}</small>
                    <button onclick="loadNotifications()" style="margin-top: 10px; padding: 8px 16px; border: none; background: #667eea; color: white; border-radius: 6px; cursor: pointer;">🔄 Retry</button>
                </div>
            `;
        }
        if (notificationCount) {
            notificationCount.textContent = '0';
        }
    }
}

// Get icon for notification type
function getIconForType(type) {
    const icons = {
        'announcement': '📢',
        'alert': '⚠️',
        'warning': '🌧️',
        'info': 'ℹ️',
        'success': '✅',
        'subsidy': '💰',
        'weather': '🌦️',
        'market': '📈'
    };
    return icons[type] || '📢';
}

// Load demo notifications as fallback
function loadDemoNotifications() {
    const notifications = [
        {
            icon: '💰',
            title: 'New Government Subsidy Available',
            text: 'PM-KISAN 14th installment of ₹2,000 is being credited',
            time: '2 hours ago',
            type: 'announcement',
            priority: 'high',
            unread: true
        },
        {
            icon: '🌧️',
            title: 'Heavy Rainfall Alert',
            text: 'IMD predicts heavy rainfall for the next 48 hours',
            time: '5 hours ago',
            type: 'warning',
            priority: 'urgent',
            unread: true
        },
        {
            icon: '📈',
            title: 'Market Price Update',
            text: 'Tomato prices increased by 15% in Bangalore market',
            time: '1 day ago',
            type: 'info',
            priority: 'medium',
            unread: false
        },
        {
            icon: '🎓',
            title: 'Free Training Program',
            text: 'Join organic farming training on December 20th',
            time: '2 days ago',
            type: 'success',
            priority: 'medium',
            unread: false
        },
        {
            icon: '🦗',
            title: 'Pest Control Advisory',
            text: 'Increase in whitefly population detected',
            time: '3 days ago',
            type: 'alert',
            priority: 'high',
            unread: false
        }
    ];
    
    updateNotificationsUI(notifications);
}

// Get time ago string
function getTimeAgo(date) {
    const seconds = Math.floor((new Date() - date) / 1000);
    
    const intervals = {
        year: 31536000,
        month: 2592000,
        week: 604800,
        day: 86400,
        hour: 3600,
        minute: 60
    };
    
    for (const [unit, secondsInUnit] of Object.entries(intervals)) {
        const interval = Math.floor(seconds / secondsInUnit);
        if (interval >= 1) {
            return `${interval} ${unit}${interval > 1 ? 's' : ''} ago`;
        }
    }
    
    return 'Just now';
}

// Update Notifications UI
function updateNotificationsUI(notifications) {
    const notificationsList = document.getElementById('notificationsList');
    const notificationCountBadge = document.getElementById('notificationCount');
    
    if (!notificationsList) {
        console.error('[NOTIFICATIONS] notificationsList element not found');
        return;
    }
    
    // Clear existing content FIRST
    notificationsList.innerHTML = '';
    
    // Check if we have notifications
    if (!notifications || notifications.length === 0) {
        notificationsList.innerHTML = `
            <div class="no-notifications">
                <span class="no-notif-icon">🔔</span>
                <p>No notifications available</p>
            </div>
        `;
        if (notificationCountBadge) {
            notificationCountBadge.textContent = '0';
        }
        return;
    }
    
    const unreadCount = notifications.filter(n => n.unread).length;
    
    if (notificationCountBadge) {
        notificationCountBadge.textContent = unreadCount;
    }
    
    // Render notifications
    notificationsList.innerHTML = notifications.map(notif => {
        const priorityClass = notif.priority === 'urgent' ? 'urgent' : notif.priority === 'high' ? 'high' : '';
        const typeClass = notif.type || 'info';
        
        return `
        <div class="notification-item ${notif.unread ? 'unread' : ''} ${priorityClass}" data-type="${typeClass}">
            <div class="notification-icon">${notif.icon}</div>
            <div class="notification-content">
                <div class="notification-header">
                    <div class="notification-title">${notif.title}</div>
                    ${notif.priority === 'urgent' ? '<span class="urgent-badge">URGENT</span>' : ''}
                </div>
                <div class="notification-text">${notif.text}</div>
                <div class="notification-time">⏱️ ${notif.time}</div>
            </div>
            ${notif.unread ? '<div class="unread-dot"></div>' : ''}
        </div>
    `;
    }).join('');
    
    // Add real-time pulse animation to new notifications
    if (unreadCount > 0 && notificationCountBadge) {
        notificationCountBadge.classList.add('pulse');
        setTimeout(() => notificationCountBadge.classList.remove('pulse'), 2000);
    }
    
    console.log(`[NOTIFICATIONS] ✅ Rendered ${notifications.length} notifications (${unreadCount} unread)`);
}

// Setup Event Listeners
function setupEventListeners() {
    // User menu toggle
    if (userMenuBtn && userDropdown) {
        userMenuBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            console.log('🔎 User menu clicked');
            userDropdown.classList.toggle('show');
            console.log('🔎 Dropdown show:', userDropdown.classList.contains('show'));
        });
        
        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!userMenuBtn.contains(e.target)) {
                userDropdown.classList.remove('show');
            }
        });
    }
    
    // Logout
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            handleLogout();
        });
    }
    
    // Navbar section navigation with show/hide
    console.log('🔗 Setting up navbar navigation...');
    const navLinks = document.querySelectorAll('.nav-link[data-section]');
    console.log(`✅ Found ${navLinks.length} navigation links`);
    
    if (navLinks.length === 0) {
        console.error('❌ No navigation links found! Check HTML structure.');
        return;
    }
    
    navLinks.forEach((link, index) => {
        const sectionId = link.getAttribute('data-section');
        console.log(`   [${index + 1}] Link: ${sectionId}`);
        
        link.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log(`🖱️ Navbar clicked: ${sectionId}`);
            
            const section = document.getElementById(sectionId);
            
            if (!section) {
                console.error(`❌ Section not found: ${sectionId}`);
                return;
            }
            
            console.log(`✅ Switching to section: ${sectionId}`);
            
            // Remove active class from all links
            navLinks.forEach(l => l.classList.remove('active'));
            // Add active class to clicked link
            link.classList.add('active');
            
            // Hide all sections
            const allSections = document.querySelectorAll('.dashboard-section');
            console.log(`   Hiding ${allSections.length} sections`);
            allSections.forEach(s => {
                s.classList.remove('active');
            });
            
            // Show selected section
            section.classList.add('active');
            console.log(`   ✅ Section ${sectionId} is now visible`);
            
            // Scroll to top of dashboard smoothly
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    });
    
    console.log('✅ Navbar navigation setup complete');
    
    // Initialize weather location selectors
    initializeWeatherSelectors();
    
    // Weather refresh button
    const refreshWeatherBtn = document.getElementById('refreshWeather');
    if (refreshWeatherBtn) {
        refreshWeatherBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            console.log('🔄 Refreshing weather data...');
            await loadWeatherData();
        });
    }
    
    // Language change - with proper update
    if (languageSelect) {
        languageSelect.dataset.langListenerAdded = 'true'; // Mark to prevent double listeners
        languageSelect.addEventListener('change', async (e) => {
            const selectedLanguage = e.target.value;
            console.log('🔄 Language changed to:', selectedLanguage);
            
            // Update using new language manager
            if (window.krushiLang && window.krushiLang.isReady) {
                window.krushiLang.changeLanguage(selectedLanguage);
            }
            
            // Save to backend
            await handleLanguageChange(selectedLanguage);
            
            // Reload dynamic content with new language
            setTimeout(() => {
                loadNotifications();
                loadGovernmentSchemes();
            }, 300);
            
            // Show success message
            showToast(`Language changed to ${selectedLanguage}`, 'success');
        });
    }
    
    // Market tabs
    const tabButtons = document.querySelectorAll('.tab-btn');
    tabButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            tabButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            loadMarketPrices(btn.dataset.tab);
        });
    });
    
    // Refresh market prices
    const refreshPricesBtn = document.getElementById('refreshPricesBtn');
    if (refreshPricesBtn) {
        refreshPricesBtn.addEventListener('click', () => {
            showToast('Refreshing market prices...', 'info');
            const activeTab = document.querySelector('.tab-btn.active');
            const category = activeTab ? activeTab.dataset.tab : 'all';
            loadMarketPrices(category);
        });
    }
    
    // Quick Action Buttons
    setupQuickActionButtons();
}

// Handle Logout
function handleLogout() {
    localStorage.removeItem('farmerToken');
    localStorage.removeItem('farmerData');
    sessionStorage.removeItem('farmerToken');
    sessionStorage.removeItem('farmerData');
    
    window.location.href = 'index.html';
}

// Handle Language Change (Fallback for non-language manager usage)
async function handleLanguageChange(language) {
    console.log('Language changed to:', language);
    
    // Store preference in backend
    try {
        const token = localStorage.getItem('farmerToken') || sessionStorage.getItem('farmerToken');
        
        if (token) {
            const response = await fetch(`${API_URL}/farmer/update-language`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ language })
            });
            
            if (response.ok) {
                console.log('Language preference saved to backend');
                // Store locally
                localStorage.setItem('preferredLanguage', language);
                
                // Update farmer data
                const farmerDataStr = localStorage.getItem('farmerData');
                if (farmerDataStr) {
                    const farmerData = JSON.parse(farmerDataStr);
                    farmerData.language = language;
                    localStorage.setItem('farmerData', JSON.stringify(farmerData));
                }
            }
        }
    } catch (error) {
        console.error('Error saving language preference:', error);
    }
}

// Setup Quick Action Buttons
function setupQuickActionButtons() {
    // Upload Crop Photo
    const uploadCropPhotoBtn = document.getElementById('uploadCropPhoto');
    if (uploadCropPhotoBtn) {
        uploadCropPhotoBtn.addEventListener('click', () => {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = 'image/*';
            input.onchange = (e) => {
                const file = e.target.files[0];
                if (file) {
                    showToast(`Uploading ${file.name}...`, 'info');
                    // Simulate upload
                    setTimeout(() => {
                        showToast('Crop photo uploaded successfully!', 'success');
                    }, 1500);
                }
            };
            input.click();
        });
    }
    
    // Ask Expert
    const askExpertBtn = document.getElementById('askExpert');
    if (askExpertBtn) {
        askExpertBtn.addEventListener('click', () => {
            const question = prompt('What would you like to ask our agricultural expert?');
            if (question && question.trim()) {
                showToast('Your question has been sent to our experts. You will receive a response within 24 hours.', 'success');
            }
        });
    }
    
    // View Reports
    const viewReportsBtn = document.getElementById('viewReports');
    if (viewReportsBtn) {
        viewReportsBtn.addEventListener('click', () => {
            showToast('Generating your farming reports...', 'info');
            setTimeout(() => {
                alert('📊 Your Farming Reports:\n\n✓ Crop Growth: 85% on track\n✓ Yield Prediction: 45 quintals\n✓ Revenue Forecast: ₹2,15,000\n✓ Expenses: ₹85,000\n✓ Profit Margin: 60%');
            }, 1000);
        });
    }
    
    // Order Supplies
    const orderSuppliesBtn = document.getElementById('orderSupplies');
    if (orderSuppliesBtn) {
        orderSuppliesBtn.addEventListener('click', () => {
            showToast('Opening supplies marketplace...', 'info');
            setTimeout(() => {
                alert('🛒 Available Supplies:\n\n🌱 Seeds: Rice, Wheat, Vegetables\n💊 Fertilizers: NPK, Urea, Organic\n🦟 Pesticides: Bio & Chemical\n⚙️ Equipment: Tools, Machinery\n\nVisit our marketplace to place orders!');
            }, 800);
        });
    }
}

// Show Toast Notification
function showToast(message, type = 'info') {
    // Create toast element
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#4CAF50' : type === 'error' ? '#f44336' : '#2196F3'};
        color: white;
        padding: 16px 24px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        z-index: 10000;
        animation: slideInRight 0.3s ease-out;
        font-weight: 600;
        max-width: 400px;
    `;
    toast.textContent = message;
    
    document.body.appendChild(toast);
    
    // Remove after 3 seconds
    setTimeout(() => {
        toast.style.animation = 'slideOutRight 0.3s ease-out';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Add CSS animations for toast
if (!document.getElementById('toast-animations')) {
    const style = document.createElement('style');
    style.id = 'toast-animations';
    style.textContent = `
        @keyframes slideInRight {
            from {
                transform: translateX(400px);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        @keyframes slideOutRight {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(400px);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);
}

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        loadFarmerData,
        loadWeatherData,
        loadMarketPrices
    };
}

