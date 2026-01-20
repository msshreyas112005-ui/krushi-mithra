#!/usr/bin/env node

/**
 * Get Local IP Address Helper Script
 * Helps find the correct BASE_URL for mobile testing
 */

const os = require('os');

console.log('\n🌐 ========================================');
console.log('🌐 KRISHI MITHRA - Local IP Finder');
console.log('🌐 ========================================\n');

function getLocalIPs() {
    const interfaces = os.networkInterfaces();
    const ips = [];

    for (const name of Object.keys(interfaces)) {
        for (const iface of interfaces[name]) {
            // Skip internal (localhost) and non-IPv4 addresses
            if (iface.family === 'IPv4' && !iface.internal) {
                ips.push({
                    interface: name,
                    address: iface.address
                });
            }
        }
    }

    return ips;
}

const localIPs = getLocalIPs();

if (localIPs.length === 0) {
    console.log('❌ No network interfaces found!');
    console.log('   Make sure you are connected to a network.\n');
    process.exit(1);
}

console.log('✅ Found the following network interfaces:\n');

localIPs.forEach((ip, index) => {
    console.log(`${index + 1}. ${ip.interface}`);
    console.log(`   IP Address: ${ip.address}`);
    console.log(`   BASE_URL:   http://${ip.address}:3000\n`);
});

console.log('📝 How to use for mobile testing:');
console.log('   1. Choose the IP address for your active WiFi/Ethernet');
console.log('   2. Update your .env file:');
console.log('      BASE_URL=http://YOUR_IP_ADDRESS:3000');
console.log('   3. Restart the server: npm start');
console.log('   4. Test on mobile device connected to SAME WiFi\n');

console.log('💡 Recommended Configuration:');
if (localIPs.length > 0) {
    const recommendedIP = localIPs[0].address;
    console.log(`   BASE_URL=http://${recommendedIP}:3000\n`);
}

console.log('🔗 After server starts, you can access:');
localIPs.forEach(ip => {
    console.log(`   Frontend: http://${ip.address}:3000/frontend/html/index.html`);
    console.log(`   Register: http://${ip.address}:3000/frontend/html/register.html`);
    console.log(`   Dashboard: http://${ip.address}:3000/frontend/html/farmer-dashboard.html\n`);
});

console.log('🌐 ========================================\n');
