import { useState, useEffect } from 'react'

// Weather condition icons (using emoji for simplicity - no API key needed for icons)
const weatherIcons = {
  'Clear': '☀️',
  'Sunny': '☀️',
  'Partly cloudy': '⛅',
  'Cloudy': '☁️',
  'Overcast': '☁️',
  'Mist': '🌫️',
  'Fog': '🌫️',
  'Rain': '🌧️',
  'Light rain': '🌦️',
  'Heavy rain': '🌧️',
  'Thunderstorm': '⛈️',
  'Snow': '❄️',
  'Sleet': '🌨️',
  'Drizzle': '🌦️',
  'Haze': '🌫️',
  'default': '🌤️'
}

const Weather = () => {
  const [weather, setWeather] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    const fetchWeather = async (latitude, longitude) => {
      try {
        // Using wttr.in - free weather API that doesn't require API key
        const response = await fetch(
          `https://wttr.in/?format=j1&lat=${latitude}&lon=${longitude}`
        )
        
        if (!response.ok) {
          throw new Error('Weather data unavailable')
        }

        const data = await response.json()
        
        const current = data.current_condition[0]
        const location = data.nearest_area[0]
        
        setWeather({
          temp: current.temp_C,
          tempF: current.temp_F,
          condition: current.weatherDesc[0].value,
          humidity: current.humidity,
          windSpeed: current.windspeedKmph,
          feelsLike: current.FeelsLikeC,
          city: location.areaName[0].value,
          country: location.country[0].value,
          localTime: new Date().toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: true 
          })
        })
        setLoading(false)
      } catch (err) {
        setError('Could not load weather')
        setLoading(false)
      }
    }

    const getLocation = () => {
      if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            fetchWeather(position.coords.latitude, position.coords.longitude)
          },
          (err) => {
            // Fallback: Try to get weather based on IP
            fetchWeatherByIP()
          },
          { timeout: 10000 }
        )
      } else {
        fetchWeatherByIP()
      }
    }

    const fetchWeatherByIP = async () => {
      try {
        // Using wttr.in with auto-detect location
        const response = await fetch('https://wttr.in/?format=j1')
        
        if (!response.ok) {
          throw new Error('Weather data unavailable')
        }

        const data = await response.json()
        
        const current = data.current_condition[0]
        const location = data.nearest_area[0]
        
        setWeather({
          temp: current.temp_C,
          tempF: current.temp_F,
          condition: current.weatherDesc[0].value,
          humidity: current.humidity,
          windSpeed: current.windspeedKmph,
          feelsLike: current.FeelsLikeC,
          city: location.areaName[0].value,
          country: location.country[0].value,
          localTime: new Date().toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: true 
          })
        })
        setLoading(false)
      } catch (err) {
        setError('Could not load weather')
        setLoading(false)
      }
    }

    getLocation()
  }, [])

  const getWeatherIcon = (condition) => {
    for (const [key, icon] of Object.entries(weatherIcons)) {
      if (condition?.toLowerCase().includes(key.toLowerCase())) {
        return icon
      }
    }
    return weatherIcons.default
  }

  const getWeatherType = (condition, localTime) => {
    if (!condition) return 'default'
    
    const conditionLower = condition.toLowerCase()
    
    // Parse time to determine if it's night (handles 12-hour format like "10:30 PM")
    let isNight = false
    if (localTime) {
      const timeMatch = localTime.match(/(\d+):(\d+)\s*(AM|PM)/i)
      if (timeMatch) {
        let hour = parseInt(timeMatch[1])
        const period = timeMatch[3].toUpperCase()
        if (period === 'PM' && hour !== 12) hour += 12
        if (period === 'AM' && hour === 12) hour = 0
        isNight = hour >= 20 || hour < 6
      }
    }
    
    if (conditionLower.includes('rain') || conditionLower.includes('drizzle')) {
      return 'rain'
    }
    if (conditionLower.includes('snow') || conditionLower.includes('sleet')) {
      return 'snow'
    }
    if (conditionLower.includes('thunderstorm')) {
      return 'thunderstorm'
    }
    if (conditionLower.includes('fog') || conditionLower.includes('mist') || conditionLower.includes('haze')) {
      return 'fog'
    }
    if (conditionLower.includes('cloud') || conditionLower.includes('overcast')) {
      return 'cloudy'
    }
    if (conditionLower.includes('clear') || conditionLower.includes('sunny')) {
      return isNight ? 'night' : 'sunny'
    }
    return 'default'
  }

  const weatherType = weather ? getWeatherType(weather.condition, weather.localTime) : 'default'

  if (error) {
    return null // Don't show anything if there's an error
  }

  return (
    <section 
      id="weather" 
      className="py-8 md:py-12 bg-white relative overflow-hidden"
    >
      {/* Subtle Background Pattern */}
      <div className="absolute inset-0 opacity-[0.02]">
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, black 1px, transparent 0)',
          backgroundSize: '24px 24px'
        }} />
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div
          className={`transition-all duration-700 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
          {/* Weather Card */}
          <div className={`bg-black rounded-2xl p-4 sm:p-6 md:p-8 shadow-xl relative overflow-hidden ${
            weatherType === 'rain' ? 'weather-rain' :
            weatherType === 'snow' ? 'weather-snow' :
            weatherType === 'thunderstorm' ? 'weather-thunderstorm' :
            weatherType === 'fog' ? 'weather-fog' :
            weatherType === 'cloudy' ? 'weather-cloudy' :
            weatherType === 'night' ? 'weather-night' :
            weatherType === 'sunny' ? 'weather-sunny' :
            'weather-default'
          }`}>
            {/* Weather Effects Overlay */}
            {weatherType === 'rain' && (
              <>
                <div className="rain-container absolute inset-0 pointer-events-none">
                  {[...Array(50)].map((_, i) => (
                    <div
                      key={i}
                      className="rain-drop absolute bg-white/30"
                      style={{
                        left: `${Math.random() * 100}%`,
                        animationDelay: `${Math.random() * 2}s`,
                        animationDuration: `${0.5 + Math.random() * 0.5}s`,
                        width: '2px',
                        height: `${10 + Math.random() * 20}px`,
                      }}
                    />
                  ))}
                </div>
              </>
            )}
            
            {weatherType === 'snow' && (
              <>
                <div className="snow-container absolute inset-0 pointer-events-none">
                  {[...Array(30)].map((_, i) => (
                    <div
                      key={i}
                      className="snowflake absolute text-white"
                      style={{
                        left: `${Math.random() * 100}%`,
                        animationDelay: `${Math.random() * 5}s`,
                        animationDuration: `${3 + Math.random() * 4}s`,
                        fontSize: `${8 + Math.random() * 12}px`,
                      }}
                    >
                      ❄
                    </div>
                  ))}
                </div>
              </>
            )}
            
            {weatherType === 'thunderstorm' && (
              <>
                <div className="rain-container absolute inset-0 pointer-events-none">
                  {[...Array(50)].map((_, i) => (
                    <div
                      key={i}
                      className="rain-drop absolute bg-white/40"
                      style={{
                        left: `${Math.random() * 100}%`,
                        animationDelay: `${Math.random() * 2}s`,
                        animationDuration: `${0.3 + Math.random() * 0.3}s`,
                        width: '2px',
                        height: `${15 + Math.random() * 25}px`,
                      }}
                    />
                  ))}
                </div>
                <div className="lightning absolute inset-0 pointer-events-none bg-white/20" />
              </>
            )}
            
            {weatherType === 'fog' && (
              <div className="fog-container absolute inset-0 pointer-events-none">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className="fog-layer absolute bg-white/10 blur-xl"
                    style={{
                      left: `${i * 20}%`,
                      animationDelay: `${i * 2}s`,
                      width: '30%',
                      height: '100%',
                    }}
                  />
                ))}
              </div>
            )}
            
            {weatherType === 'cloudy' && (
              <div className="cloud-container absolute inset-0 pointer-events-none">
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className="cloud absolute bg-white/5 blur-2xl"
                    style={{
                      left: `${i * 33}%`,
                      top: `${20 + i * 20}%`,
                      animationDelay: `${i * 3}s`,
                      width: '25%',
                      height: '20%',
                      borderRadius: '50%',
                    }}
                  />
                ))}
              </div>
            )}
            
            {weatherType === 'night' && (
              <div className="stars-container absolute inset-0 pointer-events-none">
                {[...Array(30)].map((_, i) => (
                  <div
                    key={i}
                    className="star absolute bg-white rounded-full"
                    style={{
                      left: `${Math.random() * 100}%`,
                      top: `${Math.random() * 100}%`,
                      animationDelay: `${Math.random() * 3}s`,
                      width: `${1 + Math.random() * 2}px`,
                      height: `${1 + Math.random() * 2}px`,
                      opacity: 0.3 + Math.random() * 0.7,
                    }}
                  />
                ))}
              </div>
            )}
            
            {weatherType === 'sunny' && (
              <div className="sun-rays absolute inset-0 pointer-events-none">
                {[...Array(8)].map((_, i) => (
                  <div
                    key={i}
                    className="sun-ray absolute bg-yellow-400/10"
                    style={{
                      left: '50%',
                      top: '50%',
                      transformOrigin: 'center',
                      transform: `rotate(${i * 45}deg) translateY(-100px)`,
                      width: '2px',
                      height: '100px',
                      animation: 'pulse 3s ease-in-out infinite',
                      animationDelay: `${i * 0.2}s`,
                    }}
                  />
                ))}
              </div>
            )}
            
            {/* Content with relative positioning */}
            <div className="relative z-10">
            {loading ? (
              // Loading State
              <div className="flex items-center justify-center gap-3 sm:gap-4">
                <div className="w-5 h-5 sm:w-6 sm:h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span className="text-gray-400 text-xs sm:text-sm">Fetching your local weather...</span>
              </div>
            ) : weather ? (
              // Weather Content
              <div className="flex flex-col md:flex-row items-center justify-between gap-4 md:gap-6">
                {/* Left - Main Weather */}
                <div className="flex items-center gap-3 sm:gap-4 md:gap-6 w-full md:w-auto justify-center md:justify-start">
                  {/* Weather Icon */}
                  <div className="text-4xl sm:text-5xl md:text-6xl">
                    {getWeatherIcon(weather.condition)}
                  </div>
                  
                  {/* Temperature & Condition */}
                  <div>
                    <div className="flex items-start">
                      <span className="text-4xl sm:text-5xl md:text-6xl font-light text-white">
                        {weather.temp}
                      </span>
                      <span className="text-xl sm:text-2xl text-gray-400 mt-0.5 sm:mt-1">°C</span>
                    </div>
                    <p className="text-gray-400 text-xs sm:text-sm mt-0.5 sm:mt-1">{weather.condition}</p>
                  </div>
                </div>

                {/* Divider */}
                <div className="hidden md:block w-px h-20 bg-gray-800" />

                {/* Center - Location */}
                <div className="text-center md:text-left w-full md:w-auto">
                  {/* Mobile: Single line with separators */}
                  <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 justify-center md:hidden">
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span className="text-white font-medium text-sm sm:text-base">{weather.city}</span>
                    </div>
                    <span className="text-gray-500 text-xs">|</span>
                    <span className="text-gray-500 text-xs sm:text-sm">{weather.country}</span>
                    <span className="text-gray-500 text-xs">|</span>
                    <span className="text-gray-600 text-[10px] sm:text-xs">{weather.localTime}</span>
                  </div>
                  
                  {/* Desktop: Separate lines */}
                  <div className="hidden md:block">
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span className="text-white font-medium text-sm sm:text-base">{weather.city}</span>
                    </div>
                    <p className="text-gray-500 text-xs sm:text-sm mt-0.5 sm:mt-1">{weather.country}</p>
                    <p className="text-gray-600 text-[10px] sm:text-xs mt-1 sm:mt-2">{weather.localTime}</p>
                  </div>
                </div>

                {/* Divider */}
                <div className="hidden md:block w-px h-20 bg-gray-800" />

                {/* Right - Details */}
                <div className="flex gap-4 sm:gap-5 md:gap-6 lg:gap-8 w-full md:w-auto justify-center md:justify-start">
                  {/* Feels Like */}
                  <div className="text-center">
                    <p className="text-gray-500 text-[10px] sm:text-xs uppercase tracking-wider mb-0.5 sm:mb-1">Feels Like</p>
                    <p className="text-white text-base sm:text-lg font-medium">{weather.feelsLike}°</p>
                  </div>
                  
                  {/* Humidity */}
                  <div className="text-center">
                    <p className="text-gray-500 text-[10px] sm:text-xs uppercase tracking-wider mb-0.5 sm:mb-1">Humidity</p>
                    <p className="text-white text-base sm:text-lg font-medium">{weather.humidity}%</p>
                  </div>
                  
                  {/* Wind */}
                  <div className="text-center">
                    <p className="text-gray-500 text-[10px] sm:text-xs uppercase tracking-wider mb-0.5 sm:mb-1">Wind</p>
                    <p className="text-white text-base sm:text-lg font-medium">{weather.windSpeed} km/h</p>
                  </div>
                </div>
              </div>
            ) : null}
            </div>
          </div>

          {/* Attribution */}
          <p className="text-center text-gray-400 text-[10px] sm:text-xs mt-3 sm:mt-4">
            📍 Live weather based on your location
          </p>
        </div>
      </div>
      
      {/* Weather Animations CSS */}
      <style>{`
        @keyframes rain {
          0% {
            transform: translateY(-100%);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh);
            opacity: 0;
          }
        }
        
        @keyframes snow {
          0% {
            transform: translateY(-100%) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(360deg);
            opacity: 0;
          }
        }
        
        @keyframes lightning {
          0%, 85%, 100% {
            opacity: 0;
          }
          2%, 4% {
            opacity: 0.4;
          }
          6%, 8% {
            opacity: 0.2;
          }
        }
        
        @keyframes fog {
          0% {
            transform: translateX(-100%);
            opacity: 0.1;
          }
          50% {
            opacity: 0.2;
          }
          100% {
            transform: translateX(100%);
            opacity: 0.1;
          }
        }
        
        @keyframes cloud {
          0%, 100% {
            transform: translateX(0);
            opacity: 0.05;
          }
          50% {
            transform: translateX(20px);
            opacity: 0.1;
          }
        }
        
        @keyframes twinkle {
          0%, 100% {
            opacity: 0.3;
            transform: scale(1);
          }
          50% {
            opacity: 1;
            transform: scale(1.2);
          }
        }
        
        @keyframes pulse {
          0%, 100% {
            opacity: 0.1;
          }
          50% {
            opacity: 0.2;
          }
        }
        
        .rain-drop {
          animation: rain linear infinite;
        }
        
        .snowflake {
          animation: snow linear infinite;
        }
        
        .weather-thunderstorm .lightning {
          animation: lightning 4s infinite;
        }
        
        .fog-layer {
          animation: fog 10s ease-in-out infinite;
        }
        
        .cloud {
          animation: cloud 8s ease-in-out infinite;
        }
        
        .star {
          animation: twinkle 2s ease-in-out infinite;
        }
        
        .weather-rain {
          background: linear-gradient(to bottom, #1a1a2e 0%, #16213e 100%);
        }
        
        .weather-snow {
          background: linear-gradient(to bottom, #2c3e50 0%, #34495e 100%);
        }
        
        .weather-thunderstorm {
          background: linear-gradient(to bottom, #0f0f1e 0%, #1a1a2e 100%);
        }
        
        .weather-fog {
          background: linear-gradient(to bottom, #2c2c2c 0%, #3a3a3a 100%);
        }
        
        .weather-cloudy {
          background: linear-gradient(to bottom, #2c3e50 0%, #34495e 100%);
        }
        
        .weather-night {
          background: linear-gradient(to bottom, #0a0a1a 0%, #1a1a2e 50%, #0f0f1e 100%);
        }
        
        .weather-sunny {
          background: linear-gradient(to bottom, #1e3c72 0%, #2a5298 50%, #7e8ba3 100%);
        }
        
        .weather-default {
          background: #000000;
        }
      `}</style>
    </section>
  )
}

export default Weather

