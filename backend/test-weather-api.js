// Test OpenWeatherMap API
const https = require('https');
const http = require('http');

const API_KEY = '2dc416bde8a045c05a52551eebc4d477';

console.log('🌤️  Testing OpenWeatherMap API Integration\n');
console.log('=' .repeat(50));

// Test with different location formats
const testLocations = ['NANJANGUDU', 'Nanjangud', 'Bijapur', 'Mysore'];
let currentIndex = 0;

const testNextLocation = () => {
    if (currentIndex >= testLocations.length) {
        console.log('\n' + '='.repeat(50));
        console.log('Testing complete!');
        return;
    }
    
    const location = testLocations[currentIndex];
    currentIndex++;

    // Test 1: Geocoding API
    const geoUrl = `http://api.openweathermap.org/geo/1.0/direct?q=${location}&limit=1&appid=${API_KEY}`;

    console.log(`\n1️⃣  Testing Geocoding API for: ${location}`);
    console.log(`   URL: ${geoUrl}\n`);

    http.get(geoUrl, (res) => {
        let data = '';
        
        res.on('data', (chunk) => {
            data += chunk;
        });
        
        res.on('end', () => {
            try {
                const geoData = JSON.parse(data);
                
                if (res.statusCode !== 200) {
                    console.error(`❌ Geocoding API Error (Status ${res.statusCode}):`);
                    console.error(data);
                    return;
                }
                
                if (!geoData || geoData.length === 0) {
                    console.error('❌ No location found for:', location);
                    return;
                }
                
                const { lat, lon, name, country, state } = geoData[0];
                
                console.log('✅ Geocoding Successful!');
                console.log(`   📍 Location: ${name}, ${state || ''}, ${country}`);
                console.log(`   🗺️  Coordinates: ${lat}, ${lon}\n`);
                
                // Test 2: Weather API
                console.log('2️⃣  Testing Current Weather API\n');
                
                const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`;
                
                https.get(weatherUrl, (weatherRes) => {
                    let weatherData = '';
                    
                    weatherRes.on('data', (chunk) => {
                        weatherData += chunk;
                    });
                    
                    weatherRes.on('end', () => {
                        try {
                            const weather = JSON.parse(weatherData);
                            
                            if (weatherRes.statusCode !== 200) {
                                console.error(`❌ Weather API Error (Status ${weatherRes.statusCode}):`);
                                console.error(weatherData);
                                return;
                            }
                            
                            console.log('✅ Weather API Successful!\n');
                            console.log('=' .repeat(50));
                            console.log(`🌡️  Current Weather for ${name}:`);
                            console.log('=' .repeat(50));
                            console.log(`   Temperature:    ${weather.main.temp}°C`);
                            console.log(`   Feels Like:     ${weather.main.feels_like}°C`);
                            console.log(`   Min/Max:        ${weather.main.temp_min}°C / ${weather.main.temp_max}°C`);
                            console.log(`   Humidity:       ${weather.main.humidity}%`);
                            console.log(`   Pressure:       ${weather.main.pressure} hPa`);
                            console.log(`   Weather:        ${weather.weather[0].main} - ${weather.weather[0].description}`);
                            console.log(`   Wind Speed:     ${weather.wind.speed} m/s`);
                            console.log(`   Wind Direction: ${weather.wind.deg}°`);
                            console.log(`   Cloudiness:     ${weather.clouds.all}%`);
                            
                            if (weather.rain) {
                                console.log(`   Rain (1h):      ${weather.rain['1h'] || 0} mm`);
                            }
                            
                            console.log('=' .repeat(50));
                            console.log('\n✅ API KEY IS VALID AND WORKING!');
                            console.log('✅ Weather data is fetched from actual farmer location!');
                            console.log(`✅ Farmer location "${location}" is geocoded to accurate coordinates!\n`);
                            
                        } catch (error) {
                            console.error('❌ Error parsing weather data:', error.message);
                        }
                    });
                }).on('error', (error) => {
                    console.error('❌ Weather API Request Error:', error.message);
                });
                
            } catch (error) {
                console.error('❌ Error parsing geocoding data:', error.message);
            }
        });
    }).on('error', (error) => {
        console.error('❌ Geocoding API Request Error:', error.message);
        console.error('\n💡 Possible reasons:');
        console.error('   1. Invalid API key');
        console.error('   2. Network connection issue');
        console.error('   3. API rate limit exceeded');
    });
};

// Start testing with the first location
testNextLocation();
