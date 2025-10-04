/**
 * Weather Service
 * Servicio para obtener datos climáticos que pueden correlacionarse con consumo energético
 * API: OpenWeatherMap (requiere API key)
 */

const WEATHER_API_KEY = import.meta.env.VITE_WEATHER_API_KEY || '';
const WEATHER_API_BASE_URL = 'https://api.openweathermap.org/data/2.5';

class WeatherService {
  constructor() {
    this.cache = new Map();
    this.cacheTimeout = 3600000; // 1 hora en ms
  }

  /**
   * Obtener clima actual por ciudad
   */
  async getCurrentWeather(city, country = 'CO') {
    try {
      const cacheKey = `current_${city}_${country}`;

      // Verificar cache
      if (this.isCacheValid(cacheKey)) {
        return this.cache.get(cacheKey).data;
      }

      const response = await fetch(
        `${WEATHER_API_BASE_URL}/weather?q=${city},${country}&appid=${WEATHER_API_KEY}&units=metric&lang=es`
      );

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      const processedData = this.processCurrentWeather(data);

      // Guardar en cache
      this.setCache(cacheKey, processedData);

      return processedData;
    } catch (error) {
      console.error('Error fetching current weather:', error);
      return this.getFallbackWeather();
    }
  }

  /**
   * Obtener pronóstico de 5 días
   */
  async getForecast(city, country = 'CO') {
    try {
      const cacheKey = `forecast_${city}_${country}`;

      if (this.isCacheValid(cacheKey)) {
        return this.cache.get(cacheKey).data;
      }

      const response = await fetch(
        `${WEATHER_API_BASE_URL}/forecast?q=${city},${country}&appid=${WEATHER_API_KEY}&units=metric&lang=es`
      );

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      const processedData = this.processForecast(data);

      this.setCache(cacheKey, processedData);

      return processedData;
    } catch (error) {
      console.error('Error fetching forecast:', error);
      return this.getFallbackForecast();
    }
  }

  /**
   * Obtener clima por coordenadas
   */
  async getWeatherByCoords(lat, lon) {
    try {
      const response = await fetch(
        `${WEATHER_API_BASE_URL}/weather?lat=${lat}&lon=${lon}&appid=${WEATHER_API_KEY}&units=metric&lang=es`
      );

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return this.processCurrentWeather(data);
    } catch (error) {
      console.error('Error fetching weather by coords:', error);
      return this.getFallbackWeather();
    }
  }

  /**
   * Procesar datos de clima actual
   */
  processCurrentWeather(data) {
    return {
      temperature: Math.round(data.main.temp),
      feelsLike: Math.round(data.main.feels_like),
      humidity: data.main.humidity,
      pressure: data.main.pressure,
      description: data.weather[0].description,
      icon: data.weather[0].icon,
      windSpeed: data.wind.speed,
      cloudiness: data.clouds.all,
      visibility: data.visibility / 1000, // convertir a km
      city: data.name,
      sunrise: new Date(data.sys.sunrise * 1000),
      sunset: new Date(data.sys.sunset * 1000),
      timestamp: new Date(),
    };
  }

  /**
   * Procesar pronóstico
   */
  processForecast(data) {
    const dailyForecasts = {};

    data.list.forEach((item) => {
      const date = new Date(item.dt * 1000).toLocaleDateString('es-CO');

      if (!dailyForecasts[date]) {
        dailyForecasts[date] = {
          date,
          temps: [],
          descriptions: [],
          humidity: [],
          icon: item.weather[0].icon,
        };
      }

      dailyForecasts[date].temps.push(item.main.temp);
      dailyForecasts[date].descriptions.push(item.weather[0].description);
      dailyForecasts[date].humidity.push(item.main.humidity);
    });

    return Object.values(dailyForecasts)
      .map((day) => ({
        date: day.date,
        tempMax: Math.round(Math.max(...day.temps)),
        tempMin: Math.round(Math.min(...day.temps)),
        tempAvg: Math.round(day.temps.reduce((a, b) => a + b) / day.temps.length),
        description: day.descriptions[0],
        icon: day.icon,
        humidity: Math.round(day.humidity.reduce((a, b) => a + b) / day.humidity.length),
      }))
      .slice(0, 5);
  }

  /**
   * Calcular índice de impacto en consumo energético
   * Basado en temperatura y humedad
   */
  calculateEnergyImpactIndex(temperature, humidity) {
    let impact = 0;

    // Temperatura óptima: 20-25°C (sin AC/calefacción)
    if (temperature < 15) {
      impact += (15 - temperature) * 2; // Calefacción
    } else if (temperature > 28) {
      impact += (temperature - 28) * 3; // AC
    }

    // Humedad óptima: 40-60%
    if (humidity < 30 || humidity > 70) {
      impact += 10;
    }

    // Normalizar a escala 0-100
    return Math.min(100, impact);
  }

  /**
   * Gestión de cache
   */
  setCache(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    });
  }

  isCacheValid(key) {
    const cached = this.cache.get(key);
    if (!cached) return false;
    return Date.now() - cached.timestamp < this.cacheTimeout;
  }

  clearCache() {
    this.cache.clear();
  }

  /**
   * Datos de respaldo cuando API falla
   */
  getFallbackWeather() {
    return {
      temperature: 24,
      feelsLike: 26,
      humidity: 65,
      description: 'Datos no disponibles',
      icon: '01d',
      windSpeed: 0,
      cloudiness: 0,
      city: 'Desconocido',
      timestamp: new Date(),
      fallback: true,
    };
  }

  getFallbackForecast() {
    return Array(5)
      .fill(null)
      .map((_, i) => ({
        date: new Date(Date.now() + i * 86400000).toLocaleDateString('es-CO'),
        tempMax: 28,
        tempMin: 18,
        tempAvg: 23,
        description: 'Datos no disponibles',
        icon: '01d',
        humidity: 65,
        fallback: true,
      }));
  }

  /**
   * Obtener icono de clima
   */
  getWeatherIconUrl(icon) {
    return `https://openweathermap.org/img/wn/${icon}@2x.png`;
  }
}

// Exportar instancia única (singleton)
export const weatherService = new WeatherService();
export default weatherService;
