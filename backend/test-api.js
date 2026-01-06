// Quick test for OpenWeatherMap API
const http = require('http');

const API_KEY = '2dc416bde8a045c05a52551eebc4d477';

// Test 1: Bijapur (should work)
console.log('Testing location: Bijapur');
const url = `http://api.openweathermap.org/geo/1.0/direct?q=Bijapur,IN&limit=1&appid=${API_KEY}`;

http.get(url, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
        const result = JSON.parse(data);
        if (result.length > 0) {
            console.log('✅ Found:', result[0].name, result[0].country);
            console.log('Coordinates:', result[0].lat, result[0].lon);
        } else {
            console.log('❌ Not found');
        }
        
        // Test 2: NANJANGUDU
        console.log('\nTesting location: NANJANGUDU');
        const url2 = `http://api.openweathermap.org/geo/1.0/direct?q=NANJANGUDU,IN&limit=1&appid=${API_KEY}`;
        
        http.get(url2, (res2) => {
            let data2 = '';
            res2.on('data', chunk => data2 += chunk);
            res2.on('end', () => {
                const result2 = JSON.parse(data2);
                if (result2.length > 0) {
                    console.log('✅ Found:', result2[0].name, result2[0].country);
                    console.log('Coordinates:', result2[0].lat, result2[0].lon);
                } else {
                    console.log('❌ Not found - trying alternative: Nanjangud');
                    
                    // Test 3: Nanjangud (correct spelling)
                    const url3 = `http://api.openweathermap.org/geo/1.0/direct?q=Nanjangud,IN&limit=1&appid=${API_KEY}`;
                    
                    http.get(url3, (res3) => {
                        let data3 = '';
                        res3.on('data', chunk => data3 += chunk);
                        res3.on('end', () => {
                            const result3 = JSON.parse(data3);
                            if (result3.length > 0) {
                                console.log('✅ Found:', result3[0].name, result3[0].country);
                                console.log('Coordinates:', result3[0].lat, result3[0].lon);
                                console.log('\n💡 Solution: Need to normalize location names!');
                            } else {
                                console.log('❌ Still not found');
                            }
                        });
                    });
                }
            });
        });
    });
});
