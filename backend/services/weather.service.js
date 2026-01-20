const axios = require('axios');

/**
 * Weather Service
 * Fetches real-time weather data from OpenWeatherMap API
 * Provides current weather, forecasts, and agricultural advisories
 */

class WeatherService {
  constructor() {
    this.API_KEY = process.env.OPENWEATHER_API_KEY || process.env.WEATHER_API_KEY || 'demo_key';
    this.BASE_URL = 'https://api.openweathermap.org/data/2.5';
    this.ONE_CALL_URL = 'https://api.openweathermap.org/data/3.0/onecall';
    this.GEO_URL = 'http://api.openweathermap.org/geo/1.0';
    this.defaultLocation = { lat: 12.9716, lon: 77.5946, name: 'Bangalore' }; // Bangalore, Karnataka
    
    // Location name mapping for common misspellings/variations
    this.locationMapping = {
      'NANJANGUDU': 'Mysore', // Nanjangud is near Mysore
      'NANJANGUD': 'Mysore',
      'VIJAYAPURA': 'Bijapur',
      'BENGALURU': 'Bangalore',
      'BELAGAVI': 'Belgaum',
      'TUMAKURU': 'Tumkur',
      'SHIVAMOGGA': 'Shimoga',
      'KALABURAGI': 'Gulbarga'
    };
  }

  /**
   * Normalize location name
   * Handles case variations and common misspellings
   */
  normalizeLocation(location) {
    if (!location) return 'Bangalore';
    
    // Convert to uppercase for matching
    const upperLocation = location.toUpperCase().trim();
    
    // Check if it's in the mapping
    if (this.locationMapping[upperLocation]) {
      console.log(`[WEATHER] Location normalized: ${location} → ${this.locationMapping[upperLocation]}`);
      return this.locationMapping[upperLocation];
    }
    
    // Return original with proper capitalization
    return location.trim();
  }

  /**
   * Get coordinates from city/location name
   */
  async getCoordinates(location) {
    try {
      if (this.API_KEY === 'demo_key') {
        return this.defaultLocation;
      }

      // Normalize the location name
      const normalizedLocation = this.normalizeLocation(location);

      const url = `${this.GEO_URL}/direct`;
      const response = await axios.get(url, {
        params: {
          q: `${normalizedLocation},Karnataka,IN`,
          limit: 1,
          appid: this.API_KEY
        },
        timeout: 10000
      });

      if (response.data && response.data.length > 0) {
        const place = response.data[0];
        console.log(`[WEATHER] Coordinates found for ${normalizedLocation}: ${place.lat}, ${place.lon}`);
        return {
          lat: place.lat,
          lon: place.lon,
          name: place.name,
          state: place.state || 'Karnataka',
          country: place.country
        };
      }

      console.warn(`[WEATHER] Location not found: ${normalizedLocation}, using default (Bangalore)`);
      return this.defaultLocation;
    } catch (error) {
      console.error('[WEATHER] Geocoding error:', error.message);
      return this.defaultLocation;
    }
  }

  /**
   * Fetch current weather data
   */
  async getCurrentWeather(lat, lon) {
    try {
      if (this.API_KEY === 'demo_key') {
        return this.getDemoCurrentWeather();
      }

      const url = `${this.BASE_URL}/weather`;
      const response = await axios.get(url, {
        params: {
          lat,
          lon,
          units: 'metric',
          appid: this.API_KEY
        },
        timeout: 10000
      });

      const data = response.data;
      return {
        temperature: Math.round(data.main.temp),
        feelsLike: Math.round(data.main.feels_like),
        description: data.weather[0].description,
        icon: this.getWeatherEmoji(data.weather[0].id),
        weatherCode: data.weather[0].id,
        humidity: data.main.humidity,
        pressure: data.main.pressure,
        windSpeed: Math.round(data.wind.speed * 3.6), // convert m/s to km/h
        windDirection: data.wind.deg,
        cloudiness: data.clouds.all,
        visibility: data.visibility / 1000, // convert to km
        sunrise: new Date(data.sys.sunrise * 1000).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
        sunset: new Date(data.sys.sunset * 1000).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
        timestamp: new Date()
      };
    } catch (error) {
      console.error('Current weather fetch error:', error.message);
      return this.getDemoCurrentWeather();
    }
  }

  /**
   * Fetch 7-day forecast
   */
  async getForecast(lat, lon) {
    try {
      if (this.API_KEY === 'demo_key') {
        return this.getDemoForecast();
      }

      const url = `${this.BASE_URL}/forecast`;
      const response = await axios.get(url, {
        params: {
          lat,
          lon,
          units: 'metric',
          cnt: 40, // 5 days, 3-hour intervals
          appid: this.API_KEY
        },
        timeout: 10000
      });

      return this.processForecastData(response.data.list);
    } catch (error) {
      console.error('Forecast fetch error:', error.message);
      return this.getDemoForecast();
    }
  }

  /**
   * Process forecast data into daily summaries
   */
  processForecastData(forecastList) {
    const dailyForecasts = [];
    const groupedByDay = {};

    forecastList.forEach(item => {
      const date = item.dt_txt.split(' ')[0];
      if (!groupedByDay[date]) {
        groupedByDay[date] = [];
      }
      groupedByDay[date].push(item);
    });

    Object.keys(groupedByDay).slice(0, 7).forEach(date => {
      const dayData = groupedByDay[date];
      const temps = dayData.map(d => d.main.temp);
      const weatherCodes = dayData.map(d => d.weather[0].id);
      const mostCommonWeather = this.getMostFrequent(weatherCodes);

      dailyForecasts.push({
        date,
        day: new Date(date).toLocaleDateString('en-US', { weekday: 'short' }),
        tempMax: Math.round(Math.max(...temps)),
        tempMin: Math.round(Math.min(...temps)),
        description: dayData[0].weather[0].description,
        icon: this.getWeatherEmoji(mostCommonWeather),
        humidity: Math.round(dayData.reduce((sum, d) => sum + d.main.humidity, 0) / dayData.length),
        windSpeed: Math.round(dayData.reduce((sum, d) => sum + d.wind.speed, 0) / dayData.length * 3.6),
        rainfall: this.calculateRainfall(dayData)
      });
    });

    return dailyForecasts;
  }

  /**
   * Get complete weather data for a location
   */
  async getWeatherByLocation(location) {
    try {
      console.log(`[WEATHER] Fetching weather for farmer location: "${location}"`);
      
      const coords = await this.getCoordinates(location);
      console.log(`[WEATHER] Using coordinates: ${coords.lat}, ${coords.lon} (${coords.name})`);
      
      const current = await this.getCurrentWeather(coords.lat, coords.lon);
      console.log(`[WEATHER] Current weather fetched: ${current.temperature}°C, ${current.description}`);
      
      const forecast = await this.getForecast(coords.lat, coords.lon);
      console.log(`[WEATHER] ${forecast.length}-day forecast fetched successfully`);
      
      const alerts = this.generateAgricultureAlerts(current, forecast);
      const advice = this.generateFarmingAdvice(current, forecast);

      console.log(`[WEATHER] ✅ Weather data successfully fetched for ${coords.name}!`);

      return {
        success: true,
        location: {
          name: coords.name,
          state: coords.state || 'Karnataka',
          country: coords.country || 'IN',
          coordinates: { lat: coords.lat, lon: coords.lon }
        },
        current,
        forecast,
        alerts,
        advice,
        hasAlerts: alerts.length > 0,
        lastUpdated: new Date().toISOString()
      };
    } catch (error) {
      console.error('[WEATHER] ❌ Weather service error:', error);
      return this.getDemoWeatherData(location);
    }
  }

  /**
   * Generate agriculture-specific alerts
   */
  generateAgricultureAlerts(current, forecast) {
    const alerts = [];

    // High temperature alert
    if (current.temperature > 35) {
      alerts.push({
        type: 'heat',
        severity: 'warning',
        title: 'High Temperature Alert',
        message: 'Temperature above 35°C. Ensure adequate irrigation for crops.',
        icon: '🌡️'
      });
    }

    // Heavy rain alert
    const nextDayRain = forecast[0]?.rainfall || 0;
    if (nextDayRain > 50) {
      alerts.push({
        type: 'rain',
        severity: 'alert',
        title: 'Heavy Rainfall Expected',
        message: 'Heavy rain predicted. Prepare drainage and protect crops.',
        icon: '🌧️'
      });
    }

    // High wind alert
    if (current.windSpeed > 40) {
      alerts.push({
        type: 'wind',
        severity: 'warning',
        title: 'Strong Wind Advisory',
        message: 'High wind speeds. Secure loose items and check crop support structures.',
        icon: '💨'
      });
    }

    return alerts;
  }

  /**
   * Generate farming advice based on weather
   */
  generateFarmingAdvice(current, forecast) {
    const advice = [];

    // Irrigation advice
    if (current.humidity < 40 && current.temperature > 30) {
      advice.push('💧 Increase irrigation frequency due to high temperature and low humidity');
    }

    // Planting advice
    const avgTemp = forecast.reduce((sum, day) => sum + (day.tempMax + day.tempMin) / 2, 0) / forecast.length;
    if (avgTemp > 25 && avgTemp < 35) {
      advice.push('🌱 Good conditions for planting summer vegetables');
    }

    // Pest control
    if (current.humidity > 70 && current.temperature > 25) {
      advice.push('🦟 Monitor for pest activity - favorable conditions for insects');
    }

    // Fertilizer application
    const rainyDays = forecast.filter(day => day.rainfall > 20).length;
    if (rainyDays < 2) {
      advice.push('💊 Good time for fertilizer application - low chance of rain');
    }

    return advice;
  }

  /**
   * Utility methods
   */
  getWeatherEmoji(code) {
    if (code >= 200 && code < 300) return '⛈️'; // Thunderstorm
    if (code >= 300 && code < 400) return '🌦️'; // Drizzle
    if (code >= 500 && code < 600) return '🌧️'; // Rain
    if (code >= 600 && code < 700) return '❄️'; // Snow
    if (code >= 700 && code < 800) return '🌫️'; // Atmosphere
    if (code === 800) return '☀️'; // Clear
    if (code > 800) return '☁️'; // Clouds
    return '🌤️';
  }

  getMostFrequent(arr) {
    return arr.sort((a,b) =>
      arr.filter(v => v===a).length - arr.filter(v => v===b).length
    ).pop();
  }

  calculateRainfall(dayData) {
    const totalRain = dayData.reduce((sum, d) => {
      return sum + (d.rain ? d.rain['3h'] || 0 : 0);
    }, 0);
    return Math.round(totalRain);
  }

  /**
   * Demo data generators
   */
  getDemoCurrentWeather() {
    return {
      temperature: 28,
      feelsLike: 30,
      description: 'Partly cloudy',
      icon: '🌤️',
      weatherCode: 802,
      humidity: 65,
      pressure: 1013,
      windSpeed: 15,
      windDirection: 180,
      cloudiness: 40,
      visibility: 10,
      uvIndex: 6,
      rainfall: 0,
      sunrise: '06:00 AM',
      sunset: '06:30 PM',
      timestamp: new Date()
    };
  }

  getDemoForecast() {
    const forecast = [];
    const today = new Date();

    for (let i = 1; i <= 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      forecast.push({
        date: date.toISOString().split('T')[0],
        day: date.toLocaleDateString('en-US', { weekday: 'short' }),
        tempMax: 30 + Math.floor(Math.random() * 5),
        tempMin: 20 + Math.floor(Math.random() * 5),
        description: ['Clear sky', 'Partly cloudy', 'Light rain', 'Sunny'][Math.floor(Math.random() * 4)],
        icon: ['☀️', '🌤️', '🌧️', '☁️'][Math.floor(Math.random() * 4)],
        humidity: 60 + Math.floor(Math.random() * 20),
        windSpeed: 10 + Math.floor(Math.random() * 10),
        rainfall: Math.floor(Math.random() * 30)
      });
    }

    return forecast;
  }

  getDemoWeatherData(location) {
    return {
      success: true,
      message: 'Demo mode - using simulated weather data',
      location: {
        name: location,
        state: 'Karnataka',
        country: 'IN',
        coordinates: this.defaultLocation
      },
      current: this.getDemoCurrentWeather(),
      forecast: this.getDemoForecast(),
      alerts: [],
      advice: [
        '💧 Monitor soil moisture levels regularly',
        '🌱 Good conditions for crop growth',
        '💊 Apply fertilizers during cooler hours'
      ],
      hasAlerts: false,
      lastUpdated: new Date().toISOString()
    };
  }
}

module.exports = new WeatherService();
