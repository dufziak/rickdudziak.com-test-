import React from 'react';
import { motion } from 'framer-motion';
import { Sun, Cloud, CloudRain, CloudSnow, Wind, Droplets, Thermometer, ArrowLeft, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const weatherIcons = {
  Sunny: <Sun className="h-20 w-20 text-yellow-400" />,
  Cloudy: <Cloud className="h-20 w-20 text-gray-400" />,
  Rainy: <CloudRain className="h-20 w-20 text-blue-400" />,
  Snowy: <CloudSnow className="h-20 w-20 text-white" />,
};

const weatherData = {
  city: 'San Francisco',
  temperature: 18,
  condition: 'Sunny',
  high: 22,
  low: 14,
  wind: 15,
  humidity: 60,
  forecast: [
    { day: 'Mon', temp: 20, condition: 'Sunny' },
    { day: 'Tue', temp: 19, condition: 'Cloudy' },
    { day: 'Wed', temp: 17, condition: 'Rainy' },
    { day: 'Thu', temp: 21, condition: 'Sunny' },
    { day: 'Fri', temp: 22, condition: 'Sunny' },
  ],
};

const StatCard = ({ icon, label, value, unit, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay }}
    className="bg-[#2a2a2a]/50 p-4 rounded-lg flex items-center space-x-3 backdrop-blur-sm"
  >
    <div className="text-[#00ff88]">{icon}</div>
    <div>
      <p className="text-sm text-[#b0b0b0]">{label}</p>
      <p className="text-lg font-bold text-white">{value} {unit}</p>
    </div>
  </motion.div>
);

const ForecastDay = ({ day, icon, temp, delay }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.8 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.5, delay }}
    className="flex flex-col items-center space-y-2 bg-[#2a2a2a]/50 p-4 rounded-lg backdrop-blur-sm"
  >
    <p className="font-bold text-white">{day}</p>
    <div className="text-3xl">{icon}</div>
    <p className="text-lg text-white">{temp}°C</p>
  </motion.div>
);

const WeatherDashboard = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8 bg-gradient-to-br from-[#121212] via-[#1a1a1a] to-[#121212]">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
        <Button onClick={() => navigate('/')} variant="ghost" className="mb-6 text-[#e0e0e0] hover:text-white hover:bg-[#2a2a2a]">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Projects
        </Button>
      </motion.div>

      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-[#1e1e1e]/70 border border-[#2a2a2a] rounded-xl shadow-2xl shadow-black/30 p-6 sm:p-8 mb-8 backdrop-blur-xl"
        >
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
            <div className="flex-1">
              <div className="flex items-center space-x-2 text-[#00ff88] mb-2">
                <MapPin className="h-5 w-5" />
                <h1 className="text-3xl font-bold text-white">{weatherData.city}</h1>
              </div>
              <p className="text-6xl font-extrabold text-white">{weatherData.temperature}°C</p>
              <p className="text-xl text-[#b0b0b0] mt-1">{weatherData.condition}</p>
            </div>
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ duration: 0.7, delay: 0.3, type: 'spring', stiffness: 120 }}>
              {weatherIcons[weatherData.condition]}
            </motion.div>
          </div>
        </motion.div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard icon={<Thermometer className="h-6 w-6" />} label="High / Low" value={`${weatherData.high}° / ${weatherData.low}°`} unit="C" delay={0.3} />
          <StatCard icon={<Wind className="h-6 w-6" />} label="Wind" value={weatherData.wind} unit="km/h" delay={0.4} />
          <StatCard icon={<Droplets className="h-6 w-6" />} label="Humidity" value={weatherData.humidity} unit="%" delay={0.5} />
          <StatCard icon={<Sun className="h-6 w-6" />} label="Condition" value={weatherData.condition} unit="" delay={0.6} />
        </div>

        <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.7 }}
            className="text-2xl font-bold text-white mb-4"
        >
            5-Day Forecast
        </motion.h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {weatherData.forecast.map((day, index) => (
            <ForecastDay 
              key={day.day}
              day={day.day}
              icon={React.cloneElement(weatherIcons[day.condition], { className: 'h-10 w-10' })}
              temp={day.temp}
              delay={0.8 + index * 0.1}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default WeatherDashboard;