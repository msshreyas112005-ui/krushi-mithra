// API Configuration
const API_URL = 'http://localhost:3000/api';

// Initialization flag to prevent duplicate setup
let isInitialized = false;

// DOM Elements (cached for performance)
let userNameElement, userMenuBtn, userDropdown, logoutBtn, refreshBtn, updatePricesBtn, farmersTableBody, notificationForm;

// Global error handler to prevent unhandled promise rejections
window.addEventListener('unhandledrejection', (event) => {
    console.error('❌ Unhandled Promise Rejection:', event.reason);
    event.preventDefault(); // Prevent default browser error handling
});

// Page visibility handler to ensure loading completes
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        console.log('📴 Page hidden - pausing operations');
    } else {
        console.log('👁️ Page visible - resuming operations');
    }
});

// Initialize Dashboard
document.addEventListener('DOMContentLoaded', () => {
    // Prevent duplicate initialization
    if (isInitialized) {
        console.warn('⚠️ Dashboard already initialized');
        return;
    }
    
    console.log('🚀 Starting Admin Dashboard initialization...');
    
    // Cache DOM elements
    userNameElement = document.getElementById('userName');
    userMenuBtn = document.getElementById('userMenuBtn');
    userDropdown = document.getElementById('userDropdown');
    logoutBtn = document.getElementById('logoutBtn');
    refreshBtn = document.getElementById('refreshBtn');
    updatePricesBtn = document.getElementById('updatePricesBtn');
    farmersTableBody = document.getElementById('farmersTableBody');
    notificationForm = document.getElementById('notificationForm');
    
    // Initialize language manager first
    if (window.krushiLang && !window.krushiLang.isReady) {
        window.krushiLang.initialize().then(() => {
            console.log('✅ Language system ready in admin dashboard');
        }).catch(err => {
            console.warn('⚠️ Language system initialization failed:', err);
        });
    }
    
    // Check authentication first
    checkAuthentication();
    loadAdminData();
    
    // Initialize section visibility - show dashboard by default
    initializeSectionVisibility();
    
    // Setup hash routing for deep links (e.g., #market)
    setupHashRouting();
    
    // Setup event listeners immediately (non-blocking)
    setupEventListeners();
    
    // Load all data sections with individual error handling
    loadDashboardStats().catch(err => console.error('Dashboard stats failed:', err));
    loadRegisteredFarmers().catch(err => console.error('Farmers failed:', err));
    loadMarketStats().catch(err => console.error('Market stats failed:', err));
    loadSubsidies().catch(err => console.error('Subsidies failed:', err));
    
    // Safety timeout: force hide ONLY stuck loaders after 6 seconds (increased to allow API time)
    setTimeout(() => {
        forceHideAllLoaders();
    }, 6000);
    
    isInitialized = true;
    console.log('✅ Admin Dashboard initialized successfully');
});

// Initialize section visibility - show dashboard by default
function initializeSectionVisibility() {
    // Hide all sections except stats (dashboard)
    document.querySelectorAll('.farmers-section, .market-section, .subsidy-section, .notification-section').forEach(s => {
        s.style.display = 'none';
    });
    
    // Show stats section by default
    const statsSection = document.querySelector('.stats-section');
    if (statsSection) {
        statsSection.style.display = 'block';
    }
    
    // Set active nav link
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        if (link.getAttribute('data-section') === 'dashboard') {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
    
    console.log('✅ Section visibility initialized');
}

// Setup hash routing for deep links
function setupHashRouting() {
    const handleHash = () => {
        const hash = window.location.hash.substring(1); // Remove the #
        if (!hash) return;
        
        // Find the nav link with matching section
        const navLink = document.querySelector(`.nav-link[data-section="${hash}"]`);
        if (navLink) {
            navLink.click();
            console.log('📍 Hash navigation:', hash);
        }
    };
    
    // Handle hash on load
    if (window.location.hash) {
        handleHash();
    }
    
    // Listen for hash changes
    window.addEventListener('hashchange', handleHash);
}

// Force hide all loading states (safety fallback)
function forceHideAllLoaders() {
    console.log('🔧 Safety: Checking for stuck loaders...');
    
    // Only hide if STILL showing the loading spinner (⏳ emoji)
    const farmersBody = document.getElementById('farmersTableBody');
    if (farmersBody && farmersBody.innerHTML.includes('⏳')) {
        console.log('⚠️ Farmers still loading after 6s, forcing fallback');
        farmersBody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 20px;">No data available. Click Refresh to reload.</td></tr>';
    }
    
    const marketBody = document.getElementById('marketPricesTableBody');
    if (marketBody && marketBody.innerHTML.includes('⏳')) {
        console.log('⚠️ Market prices still loading after 6s, forcing fallback');
        marketBody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 20px;">No data available. Click Update Prices to fetch market data.</td></tr>';
    }
    
    const subsidiesList = document.getElementById('subsidiesList');
    if (subsidiesList && subsidiesList.innerHTML.includes('⏳')) {
        console.log('⚠️ Subsidies still loading after 6s, forcing fallback');
        subsidiesList.innerHTML = '<div class="empty-state">No subsidies found. Click Add Government Subsidy to create one.</div>';
    }
    
    console.log('✅ Safety check complete');
}

// Check Authentication
function checkAuthentication() {
    const token = localStorage.getItem('adminToken') || sessionStorage.getItem('adminToken') || localStorage.getItem('token');
    
    if (!token) {
        console.warn('⚠️ No authentication token found, redirecting to login');
        window.location.href = 'admin-login.html';
        return false;
    }
    return true;
}

// Load Admin Data
function loadAdminData() {
    const adminDataStr = localStorage.getItem('adminData');
    
    if (adminDataStr) {
        const adminData = JSON.parse(adminDataStr);
        userNameElement.textContent = adminData.email || 'Admin';
    }
}

// Load Dashboard Stats
async function loadDashboardStats() {
    try {
        const token = localStorage.getItem('adminToken') || sessionStorage.getItem('adminToken');
        
        // Fetch real-time stats from database with timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
        
        const response = await fetch(`${API_URL}/admin/stats`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (response.ok) {
            const data = await response.json();
            
            if (data.success && data.stats) {
                // Update Total Farmers - only registered and logged in farmers
                document.getElementById('totalFarmers').textContent = data.stats.totalFarmers || 0;
                
                // Market price updates will be loaded from API
                // No localStorage caching
                
                console.log('✅ Dashboard stats loaded:', data.stats);
                return;
            }
        }
        
        // Fallback: Show zeros on error
        console.warn('⚠️ Stats API failed, using default values');
        loadFallbackStats();
        
    } catch (error) {
        if (error.name === 'AbortError') {
            console.warn('⚠️ Stats API timeout, using fallback');
        } else {
            console.error('❌ Error loading stats:', error);
        }
        loadFallbackStats();
    } finally {
        // Always ensure stats are displayed
        const totalFarmersEl = document.getElementById('totalFarmers');
        const marketUpdatesEl = document.getElementById('marketPriceUpdates');
        if (!totalFarmersEl.textContent) totalFarmersEl.textContent = '0';
        if (!marketUpdatesEl.textContent) marketUpdatesEl.textContent = '0';
    }
}

// Load fallback stats from localStorage or defaults
function loadFallbackStats() {
    // Set default values - data will be loaded from API
    document.getElementById('totalFarmers').textContent = '0';
    
    // Get market price update count
    const updateCount = localStorage.getItem('marketPriceUpdateCount') || 0;
    document.getElementById('marketPriceUpdates').textContent = updateCount;
}

// Load Registered Farmers - Show all farmers who have successfully registered
async function loadRegisteredFarmers() {
    try {
        const token = localStorage.getItem('adminToken') || sessionStorage.getItem('adminToken') || localStorage.getItem('token');
        
        if (!token) {
            console.warn('⚠️ No authentication token found');
            if (farmersTableBody) {
                farmersTableBody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 20px; color: #e74c3c;">Authentication required. Please log in.</td></tr>';
            }
            return;
        }

        // Show loading state
        if (farmersTableBody) {
            farmersTableBody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 20px;"><div class="loading">⏳ Loading farmers from Neon DB...</div></td></tr>';
        }
        
        // Fetch ALL approved farmers from Neon PostgreSQL with cache-busting
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000);
        
        console.log('📡 Fetching farmers from:', `${API_URL}/admin/farmers`);
        
        const response = await fetch(`${API_URL}/admin/farmers?_=${Date.now()}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                'Pragma': 'no-cache'
            },
            cache: 'no-store',
            signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        
        console.log('📊 Farmers API Response:', {
            success: data.success,
            count: data.farmers ? data.farmers.length : 0,
            hasData: Array.isArray(data.farmers),
            sample: data.farmers && data.farmers[0] ? data.farmers[0] : null
        });
        
        if (data.success && Array.isArray(data.farmers)) {
            console.log('✅ Displaying', data.farmers.length, 'farmers from Neon DB');
            displayRegisteredFarmers(data.farmers);
            
            // Update total farmers count directly from database
            const totalFarmersEl = document.getElementById('totalFarmers');
            if (totalFarmersEl) {
                totalFarmersEl.textContent = data.farmers.length;
            }
        } else {
            console.log('⚠️ No farmers data in response or empty array');
            if (farmersTableBody) {
                farmersTableBody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 20px; color: #95a5a6;">No registered farmers found in database.</td></tr>';
            }
            const totalFarmersEl = document.getElementById('totalFarmers');
            if (totalFarmersEl) {
                totalFarmersEl.textContent = '0';
            }
        }
        
    } catch (error) {
        if (error.name === 'AbortError') {
            console.warn('⚠️ Farmers API timeout');
        } else {
            console.error('❌ Error loading farmers:', error);
        }
        // Show error message - NO fallback data
        if (farmersTableBody) {
            farmersTableBody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 20px; color: #e74c3c;">Unable to load farmers data from database. Please try refreshing.</td></tr>';
        }
        const totalFarmersEl = document.getElementById('totalFarmers');
        if (totalFarmersEl) {
            totalFarmersEl.textContent = '0';
        }
    }
}

// Display Registered Farmers in Table
function displayRegisteredFarmers(farmers) {
    console.log('🎨 displayRegisteredFarmers called with', farmers ? farmers.length : 0, 'farmers');
    
    const tableBody = document.getElementById('farmersTableBody');
    if (!tableBody) {
        console.error('❌ farmersTableBody element not found!');
        return;
    }
    
    // Clear existing data first to prevent stale data display
    tableBody.innerHTML = '';
    
    if (!farmers || farmers.length === 0) {
        console.log('📋 No farmers to display');
        tableBody.innerHTML = `
            <tr>
                <td colspan="6" style="text-align: center; padding: 30px; color: #666;">
                    <div style="font-size: 3rem; margin-bottom: 1rem;">📋</div>
                    <p style="font-size: 1.2rem; font-weight: 600;">No registered farmers yet</p>
                </td>
            </tr>
        `;
        return;
    }
    
    try {
        console.log('✅ Rendering', farmers.length, 'farmers to table');
        tableBody.innerHTML = farmers.map(farmer => `
            <tr>
                <td><strong>${farmer.fullName || farmer.name || 'N/A'}</strong></td>
                <td>${farmer.email || 'N/A'}</td>
                <td>${farmer.mobile || farmer.phone || 'N/A'}</td>
                <td>${farmer.location || 'N/A'}</td>
                <td>${new Date(farmer.registeredAt || farmer.createdAt).toLocaleDateString('en-IN')}</td>
                <td><span class="status-badge ${farmer.status || 'active'}">${farmer.status === 'approved' ? 'Approved' : 'Active'}</span></td>
            </tr>
        `).join('');
        console.log('✅ Successfully rendered farmers table');
    } catch (error) {
        console.error('❌ Error rendering farmers:', error);
        tableBody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 20px; color: #e74c3c;">Error displaying farmers data.</td></tr>';
    }
}

// displayDemoFarmers function removed - using only database data

// Load Market Stats
async function loadMarketStats() {
    let tableBody = null;
    try {
        const token = localStorage.getItem('adminToken') || sessionStorage.getItem('adminToken');
        tableBody = document.getElementById('marketPricesTableBody');
        
        // Show loading state
        if (tableBody) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="6" style="text-align: center; padding: 20px;">
                        <div class="loading">⏳ Loading market prices...</div>
                    </td>
                </tr>
            `;
        }
        
        // Fetch market prices from farmer API with timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);
        
        const response = await fetch(`${API_URL}/farmer/market-prices`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (response.ok) {
            const result = await response.json();
            
            console.log('📊 Market Prices API Response:', {
                success: result.success,
                count: result.data ? result.data.length : 0,
                hasData: Array.isArray(result.data)
            });
            
            if (result.success && result.data && result.data.length > 0) {
                console.log('✅ Rendering', result.data.length, 'market prices');
                if (tableBody) {
                    tableBody.innerHTML = result.data.map(price => `
                        <tr>
                            <td><strong>${price.commodity}</strong></td>
                            <td>₹${price.minPrice}</td>
                            <td>₹${price.maxPrice}</td>
                            <td>₹${price.modalPrice}</td>
                            <td>${price.market}</td>
                            <td>${new Date(price.arrivalDate).toLocaleDateString()}</td>
                        </tr>
                    `).join('');
                }
                
                console.log('✅ Market prices loaded:', result.data.length, 'items');
                return;
            } else {
                console.log('⚠️ No market price data in response');
            }
        }
        
        // Fallback message
        if (tableBody) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="6" style="text-align: center; padding: 20px; color: #999;">
                        No market prices available. Click "Refresh Market Data" to fetch latest prices.
                    </td>
                </tr>
            `;
        }
        
    } catch (error) {
        if (error.name === 'AbortError') {
            console.warn('⚠️ Market prices API timeout');
        } else {
            console.error('❌ Error loading market prices:', error);
        }
        
        if (tableBody) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="6" style="text-align: center; padding: 20px; color: #e74c3c;">
                        Error loading market prices. Please try again.
                    </td>
                </tr>
            `;
        }
    } finally {
        // Only clear if STILL showing loading spinner (⏳)
        const marketBody = document.getElementById('marketPricesTableBody');
        if (marketBody && marketBody.innerHTML.includes('⏳')) {
            console.log('⚠️ Market prices never rendered, showing fallback');
            marketBody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 20px;">Unable to load market prices.</td></tr>';
        }
        console.log('✅ Market stats loading complete');
    }
}

// Update Market Prices
async function updateMarketPrices() {
    if (!confirm('This will fetch and update all Karnataka market prices. Continue?')) {
        return;
    }
    
    if (!updatePricesBtn) return;
    
    updatePricesBtn.disabled = true;
    updatePricesBtn.textContent = 'Updating...';
    
    try {
        const token = localStorage.getItem('adminToken') || sessionStorage.getItem('adminToken');
        
        // Add timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 seconds for market update
        
        const response = await fetch(`${API_URL}/admin/market/update`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        const data = await response.json();
        
        if (data.success) {
            // Market prices updated successfully
            // Count will be displayed from API response
            
            // Show success message
            alert(`✅ Market prices updated successfully!\n\nFetched: ${data.data?.totalFetched || 0} prices\nSaved: ${data.data?.totalSaved || 0} prices`);
            
            // Reload stats and market data
            loadMarketStats();
            loadDashboardStats();
        } else {
            // Still increment count even if partial success
            const currentCount = parseInt(localStorage.getItem('marketPriceUpdateCount') || '0');
            const newCount = currentCount + 1;
            localStorage.setItem('marketPriceUpdateCount', newCount);
            document.getElementById('marketPriceUpdates').textContent = newCount;
            
            alert('⚠️ Market price update completed with warnings.\nCheck console for details.');
        }
        
    } catch (error) {
        if (error.name === 'AbortError') {
            console.error('❌ Market update timeout');
            alert('❌ Market price update timed out. Please try again.');
        } else {
            console.error('❌ Error updating prices:', error);
            alert('❌ Error updating market prices. Please try again.');
        }
    } finally {
        if (updatePricesBtn) {
            updatePricesBtn.disabled = false;
            updatePricesBtn.textContent = 'Update Prices';
        }
    }
}

// Send Notification with Email Support
async function sendNotification(e) {
    e.preventDefault();
    
    // Get form elements
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalBtnText = submitBtn.textContent;
    
    // Validate inputs
    const title = document.getElementById('notificationTitle').value.trim();
    const message = document.getElementById('notificationMessage').value.trim();
    
    if (!title || !message) {
        alert('❌ Please fill in both Title and Message fields');
        return;
    }
    
    const type = document.getElementById('notificationType').value;
    const priority = document.getElementById('notificationPriority').value;
    const targetAudience = document.getElementById('targetAudience').value;
    const icon = document.getElementById('notificationIcon').value || getDefaultIcon(type);
    const expiryDate = document.getElementById('notificationExpiry').value;
    
    const notificationData = {
        title,
        message,
        type,
        priority,
        targetAudience,
        icon,
        sendEmail: document.getElementById('sendEmailNotification')?.checked !== false, // Check if checkbox exists and is checked
        createdAt: new Date().toISOString()
    };
    
    // Add audience-specific data
    if (targetAudience === 'location') {
        const location = document.getElementById('targetLocation').value;
        if (!location) {
            alert('❌ Please specify target location');
            return;
        }
        notificationData.targetLocations = [location];
    } else if (targetAudience === 'crop') {
        const crop = document.getElementById('targetCrop').value;
        if (!crop) {
            alert('❌ Please specify target crop');
            return;
        }
        notificationData.targetCrops = [crop];
    }
    
    if (expiryDate) {
        notificationData.expiryDate = expiryDate;
    }
    
    // Disable button and show loading state
    submitBtn.disabled = true;
    submitBtn.textContent = '📤 Sending...';
    submitBtn.style.opacity = '0.6';
    
    try {
        const token = localStorage.getItem('adminToken') || sessionStorage.getItem('adminToken');
        const response = await fetch(`${API_URL}/admin/notifications`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(notificationData)
        });
        
        const data = await response.json();
        
        if (response.ok && data.success) {
            alert(`✅ Notification sent successfully!\n\n📧 Emails sent to ${data.emailsSent || 0} farmers\n💾 Notification saved to database`);
            notificationForm.reset();
            document.getElementById('locationGroup').style.display = 'none';
            document.getElementById('cropGroup').style.display = 'none';
        } else {
            alert(`⚠️ ${data.message || 'Failed to send notification'}\n\nPlease try again.`);
        }
        
    } catch (error) {
        console.error('Error sending notification:', error);
        alert(`❌ Error sending notification: ${error.message}\n\nPlease check your connection and try again.`);
    } finally {
        // Re-enable button
        submitBtn.disabled = false;
        submitBtn.textContent = originalBtnText;
        submitBtn.style.opacity = '1';
    }
}

// Get default icon based on type
function getDefaultIcon(type) {
    const icons = {
        'info': '📘',
        'warning': '⚠️',
        'success': '✅',
        'alert': '🚨',
        'announcement': '📢'
    };
    return icons[type] || '📢';
}

// Setup Event Listeners
function setupEventListeners() {
    // Navigation menu
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Remove active class from all links
            navLinks.forEach(l => l.classList.remove('active'));
            
            // Add active class to clicked link
            link.classList.add('active');
            
            // Get section to show
            const section = link.getAttribute('data-section');
            
            // Hide all sections
            document.querySelectorAll('.stats-section, .farmers-section, .market-section, .subsidy-section, .notification-section').forEach(s => {
                s.style.display = 'none';
            });
            
            // Show selected section
            if (section === 'dashboard') {
                document.querySelector('.stats-section').style.display = 'block';
            } else if (section === 'farmers') {
                document.querySelector('.farmers-section').style.display = 'block';
            } else if (section === 'market') {
                document.querySelector('.market-section').style.display = 'block';
            } else if (section === 'subsidies') {
                document.querySelector('.subsidy-section').style.display = 'block';
            } else if (section === 'notifications') {
                document.querySelector('.notification-section').style.display = 'block';
            }
            
            console.log('📍 Navigated to:', section);
        });
    });
    
    // User menu
    if (userMenuBtn && userDropdown) {
        userMenuBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            console.log('🔎 User menu clicked');
            userDropdown.classList.toggle('active');
            console.log('🔎 Dropdown active:', userDropdown.classList.contains('active'));
        });
        
        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!userMenuBtn.contains(e.target) && !userDropdown.contains(e.target)) {
                userDropdown.classList.remove('active');
            }
        });
    }
    
    // Logout
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (confirm('Are you sure you want to logout?')) {
                // Clear all stored tokens and data
                localStorage.removeItem('adminToken');
                localStorage.removeItem('token');
                localStorage.removeItem('adminData');
                sessionStorage.removeItem('adminToken');
                sessionStorage.removeItem('adminData');
                
                console.log('✅ Admin logged out');
                
                // Redirect to admin login
                window.location.href = 'admin-login.html';
            }
        });
    }
    
    // Refresh
    if (refreshBtn) {
        refreshBtn.addEventListener('click', loadRegisteredFarmers);
    }
    
    // Update prices
    if (updatePricesBtn) {
        updatePricesBtn.addEventListener('click', updateMarketPrices);
    }
    
    // Notification form
    if (notificationForm) {
        notificationForm.addEventListener('submit', sendNotification);
    }
    
    // Target audience change
    const targetAudienceSelect = document.getElementById('targetAudience');
    if (targetAudienceSelect) {
        targetAudienceSelect.addEventListener('change', (e) => {
            const locationGroup = document.getElementById('locationGroup');
            const cropGroup = document.getElementById('cropGroup');
            
            locationGroup.style.display = e.target.value === 'location' ? 'block' : 'none';
            cropGroup.style.display = e.target.value === 'crop' ? 'block' : 'none';
            
            // Clear values when hiding
            if (e.target.value !== 'location') {
                document.getElementById('targetLocation').value = '';
            }
            if (e.target.value !== 'crop') {
                document.getElementById('targetCrop').value = '';
            }
        });
    }
    
    // Subsidy management
    const addSubsidyBtn = document.getElementById('addSubsidyBtn');
    const closeSubsidyModal = document.getElementById('closeSubsidyModal');
    const cancelSubsidyBtn = document.getElementById('cancelSubsidyBtn');
    const subsidyForm = document.getElementById('subsidyForm');
    const subsidyCategoryFilter = document.getElementById('subsidyCategoryFilter');
    const subsidyStateFilter = document.getElementById('subsidyStateFilter');
    
    if (addSubsidyBtn) addSubsidyBtn.addEventListener('click', openSubsidyModal);
    if (closeSubsidyModal) closeSubsidyModal.addEventListener('click', closeSubsidyModalHandler);
    if (cancelSubsidyBtn) cancelSubsidyBtn.addEventListener('click', closeSubsidyModalHandler);
    if (subsidyForm) subsidyForm.addEventListener('submit', saveSubsidy);
    if (subsidyCategoryFilter) subsidyCategoryFilter.addEventListener('change', loadSubsidies);
    if (subsidyStateFilter) subsidyStateFilter.addEventListener('change', loadSubsidies);
}

// ==================== SUBSIDY MANAGEMENT ====================

// Load Subsidies List
async function loadSubsidies() {
    const subsidiesList = document.getElementById('subsidiesList');
    
    // Show loading state
    if (subsidiesList) {
        subsidiesList.innerHTML = '<div class="loading">⏳ Loading subsidies...</div>';
    }
    
    try {
        const token = localStorage.getItem('adminToken') || sessionStorage.getItem('adminToken');
        const category = document.getElementById('subsidyCategoryFilter')?.value || '';
        const state = document.getElementById('subsidyStateFilter')?.value || '';
        
        let url = `${API_URL}/admin/subsidies?`;
        if (category) url += `category=${category}&`;
        if (state) url += `state=${state}&`;
        
        // Add timeout to prevent hanging
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // Increased to 10 seconds
        
        const response = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${token}`
            },
            signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (response.ok) {
            const data = await response.json();
            if (data.success) {
                // Display subsidies even if empty array
                displaySubsidies(data.subsidies || []);
                return;
            }
        }
        
        // Show error message if API failed
        if (subsidiesList) {
            subsidiesList.innerHTML = '<div class="empty-state">⚠️ Unable to load subsidies. Please try again.</div>';
        }
    } catch (error) {
        console.error('❌ Error loading subsidies:', error);
        if (error.name === 'AbortError') {
            console.error('❌ Request timed out');
        }
        // Show user-friendly error
        if (subsidiesList) {
            subsidiesList.innerHTML = '<div class="empty-state">⚠️ Unable to load subsidies. Please refresh the page.</div>';
        }
    }
}

// Display Subsidies
function displaySubsidies(subsidies) {
    const subsidiesList = document.getElementById('subsidiesList');
    
    if (!subsidies || subsidies.length === 0) {
        subsidiesList.innerHTML = '<div class="empty-state">No subsidies found. Add a new subsidy to get started.</div>';
        return;
    }
    
    subsidiesList.innerHTML = subsidies.map(subsidy => {
        const categoryBadge = subsidy.category ? `<span class="subsidy-badge">${subsidy.category}</span>` : '';
        const locationBadge = subsidy.state ? `<span class="subsidy-location">📍 ${subsidy.state}</span>` : '';
        
        return `
            <div class="subsidy-card" data-subsidy-id="${subsidy._id || subsidy.id}">
                <div class="subsidy-header">
                    <div>
                        <h3 class="subsidy-title">${subsidy.title}</h3>
                        <div class="subsidy-meta">
                            ${categoryBadge}
                            ${locationBadge}
                            <span class="badge badge-success">Active</span>
                        </div>
                    </div>
                </div>
                <div class="subsidy-body">
                    <p class="subsidy-description">${subsidy.description}</p>
                    ${subsidy.eligibility ? `<div class="subsidy-info"><div><strong>Eligibility:</strong> ${subsidy.eligibility}</div></div>` : ''}
                    ${subsidy.url || subsidy.contactInfo?.website ? `
                        <div class="subsidy-url">
                            <strong>🌐 Official Website:</strong> 
                            <a href="${subsidy.url || subsidy.contactInfo?.website}" target="_blank" rel="noopener noreferrer">
                                ${subsidy.url || subsidy.contactInfo?.website}
                            </a>
                        </div>
                    ` : ''}
                </div>
                <div class="subsidy-actions">
                    <button class="btn-secondary edit-subsidy-btn" data-id="${subsidy._id || subsidy.id}">✏️ Edit</button>
                    <button class="btn-danger delete-subsidy-btn" data-id="${subsidy._id || subsidy.id}">🗑️ Delete</button>
                </div>
            </div>
        `;
    }).join('');
    
    // Set up event delegation for edit and delete buttons
    setupSubsidyButtonListeners();
}

// Setup event delegation for subsidy buttons (prevents duplicate listeners)
function setupSubsidyButtonListeners() {
    const subsidiesList = document.getElementById('subsidiesList');
    
    // Remove existing listeners by cloning and replacing the element
    const newSubsidiesList = subsidiesList.cloneNode(true);
    subsidiesList.parentNode.replaceChild(newSubsidiesList, subsidiesList);
    
    // Add event delegation for edit buttons
    newSubsidiesList.addEventListener('click', (e) => {
        const editBtn = e.target.closest('.edit-subsidy-btn');
        if (editBtn) {
            e.preventDefault();
            const subsidyId = editBtn.getAttribute('data-id');
            editSubsidy(subsidyId);
        }
        
        const deleteBtn = e.target.closest('.delete-subsidy-btn');
        if (deleteBtn) {
            e.preventDefault();
            const subsidyId = deleteBtn.getAttribute('data-id');
            deleteSubsidy(subsidyId);
        }
    });
}

// Open Subsidy Modal
function openSubsidyModal() {
    const modal = document.getElementById('subsidyModal');
    document.getElementById('subsidyModalTitle').textContent = 'Add Government Subsidy';
    document.getElementById('subsidyForm').reset();
    document.getElementById('subsidyId').value = '';
    modal.style.display = 'flex';
}

// Close Subsidy Modal
function closeSubsidyModalHandler() {
    document.getElementById('subsidyModal').style.display = 'none';
}

// Validate URL format
function isValidUrl(string) {
    try {
        const url = new URL(string);
        return url.protocol === 'http:' || url.protocol === 'https:';
    } catch (_) {
        return false;
    }
}

// Save Subsidy (URL-based)
async function saveSubsidy(e) {
    e.preventDefault();
    
    const subsidyId = document.getElementById('subsidyId').value;
    const subsidyUrl = document.getElementById('subsidyUrl').value;
    
    // Validate URL format
    if (!isValidUrl(subsidyUrl)) {
        alert('❌ Please enter a valid government subsidy URL (must start with http:// or https://)');
        return;
    }
    
    const subsidyData = {
        _id: subsidyId || `subsidy-${Date.now()}`,
        id: subsidyId || `subsidy-${Date.now()}`,
        title: document.getElementById('subsidyTitle').value,
        url: subsidyUrl,
        description: document.getElementById('subsidyDescription').value,
        eligibility: document.getElementById('subsidyEligibility').value || '',
        category: document.getElementById('subsidyCategory').value || 'other',
        state: document.getElementById('subsidyState').value || 'All India',
        isActive: true
    };
    
    try {
        const token = localStorage.getItem('adminToken') || sessionStorage.getItem('adminToken');
        const url = subsidyId ? 
            `${API_URL}/admin/subsidies/${subsidyId}` : 
            `${API_URL}/admin/subsidies`;
        const method = subsidyId ? 'PUT' : 'POST';
        
        const response = await fetch(url, {
            method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(subsidyData)
        });
        
        const data = await response.json();
        
        if (response.ok && data.success) {
            alert(subsidyId ? '✅ Subsidy updated successfully!' : '✅ Subsidy created successfully!');
            closeSubsidyModalHandler();
            loadSubsidies();
        } else {
            alert('❌ Error saving subsidy: ' + (data.message || 'Unknown error'));
        }
    } catch (error) {
        console.error('Error saving subsidy:', error);
        alert('❌ Error saving subsidy. Please check database connection.');
    }
}

// Edit Subsidy - Load subsidy data and open modal
async function editSubsidy(subsidyId) {
    try {
        const token = localStorage.getItem('adminToken') || sessionStorage.getItem('adminToken');
        
        const response = await fetch(`${API_URL}/admin/subsidies/${subsidyId}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            if (data.success && data.subsidy) {
                fillEditForm(data.subsidy);
                return;
            }
        }
        
        alert('❌ Subsidy not found or unable to load.');
    } catch (error) {
        console.error('Error loading subsidy:', error);
        alert('❌ Cannot load subsidy data. Please check database connection.');
    }
}

// Fill edit form with subsidy data
function fillEditForm(subsidy) {
    // Fill form with URL-based fields
    document.getElementById('subsidyId').value = subsidy._id || subsidy.id;
    document.getElementById('subsidyTitle').value = subsidy.title;
    document.getElementById('subsidyUrl').value = subsidy.url || subsidy.contactInfo?.website || '';
    document.getElementById('subsidyDescription').value = subsidy.description;
    document.getElementById('subsidyEligibility').value = subsidy.eligibility || '';
    document.getElementById('subsidyCategory').value = subsidy.category || '';
    document.getElementById('subsidyState').value = subsidy.state || '';
    
    // Open modal
    document.getElementById('subsidyModalTitle').textContent = 'Edit Subsidy';
    document.getElementById('subsidyModal').style.display = 'flex';
}

// Delete Subsidy
async function deleteSubsidy(subsidyId) {
    if (!confirm('Are you sure you want to delete this subsidy? This will remove it from all farmers\' dashboards.')) {
        return;
    }
    
    try {
        const token = localStorage.getItem('adminToken') || sessionStorage.getItem('adminToken');
        const response = await fetch(`${API_URL}/admin/subsidies/${subsidyId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        const data = await response.json();
        
        if (response.ok && data.success) {
            alert('✅ Subsidy deleted successfully!');
            loadSubsidies();
        } else {
            alert('❌ Error deleting subsidy: ' + (data.message || 'Unknown error'));
        }
    } catch (error) {
        console.error('Error deleting subsidy:', error);
        alert('❌ Error deleting subsidy. Please check database connection.');
    }
}


