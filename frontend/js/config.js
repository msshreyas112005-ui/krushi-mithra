/**
 * API Configuration for KRUSHI MITHRA
 * 
 * This file automatically detects the environment and sets the correct API URL.
 * 
 * For Development:
 * - Uses localhost:3000
 * 
 * For Production:
 * - Automatically uses the deployed backend URL
 * - Update PRODUCTION_API_URL with your actual backend URL after deployment
 */

// Configuration object
const CONFIG = {
    // Update this with your actual production backend URL after deployment
    // Examples:
    // - Render: https://krushi-mithra-api.onrender.com
    // - Railway: https://krushi-mithra-production.up.railway.app
    // - Fly.io: https://krushi-mithra.fly.dev
    PRODUCTION_API_URL: 'https://krushi-mithra-backend.onrender.com',
    
    // Development URL (localhost)
    DEVELOPMENT_API_URL: 'http://localhost:3000',
    
    // Detect if we're in production
    isProduction: function() {
        // We're in production if:
        // 1. Not on localhost
        // 2. Not on 127.0.0.1
        // 3. Not on a local IP (192.168.x.x, 10.x.x.x)
        const hostname = window.location.hostname;
        return hostname !== 'localhost' && 
               hostname !== '127.0.0.1' && 
               !hostname.startsWith('192.168.') &&
               !hostname.startsWith('10.') &&
               !hostname.startsWith('172.');
    },
    
    // Get the correct API URL based on environment
    getApiUrl: function() {
        return this.isProduction() ? this.PRODUCTION_API_URL : this.DEVELOPMENT_API_URL;
    }
};

// Export the API URL
const API_URL = CONFIG.getApiUrl() + '/api';

// Log environment and API configuration
console.log('🔧 [CONFIG.JS] API Configuration:');
console.log('   Environment:', CONFIG.isProduction() ? 'PRODUCTION' : 'DEVELOPMENT');
console.log('   Base URL:', CONFIG.getApiUrl());
console.log('   API_URL:', API_URL);
console.log('   Sample endpoint: POST', API_URL + '/farmers/register');

// Log environment info (only in development)
if (!CONFIG.isProduction()) {
    console.log('🔧 Development Mode');
    console.log('📡 API URL:', API_URL);
}

// Make it available globally
window.API_CONFIG = CONFIG;
window.API_URL = API_URL;
