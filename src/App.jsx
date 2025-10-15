import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import LandingPage from '@/components/LandingPage';
import ProjectsPage from '@/components/ProjectsPage';
import WeatherDashboard from '@/components/WeatherDashboard';
import TaskManagementApp from '@/components/TaskManagementApp';
import WorryTreeApp from '@/components/WorryTreeApp';
import { Toaster } from '@/components/ui/toaster';

const ProtectedRoute = ({ isLoggedIn, children }) => {
  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  const setupUser = () => {
    const dummyUser = {
      username: 'admin',
      password: 'password',
    };
    localStorage.setItem('user', JSON.stringify(dummyUser));
  };

  useEffect(() => {
    setupUser();
    const loggedInStatus = localStorage.getItem('isLoggedIn');
    if (loggedInStatus === 'true') {
      setIsLoggedIn(true);
    }
    setLoading(false);
  }, []);

  const handleLogin = (username, password) => {
    const storedUser = JSON.parse(localStorage.getItem('user'));
    if (storedUser && username === storedUser.username && password === storedUser.password) {
      localStorage.setItem('isLoggedIn', 'true');
      setIsLoggedIn(true);
      return true;
    }
    return false;
  };

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    setIsLoggedIn(false);
  };
  
  if (loading) {
    return (
        <div className="min-h-screen bg-[#121212] flex items-center justify-center">
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[#00ff88] to-[#00cc6a] animate-spin"></div>
        </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Rick Dudziak - Developer & Designer Portfolio</title>
        <meta name="description" content="Welcome to Rick Dudziak's portfolio. Explore innovative projects and creative design work." />
      </Helmet>
      
      <div className="min-h-screen bg-[#121212]">
        <Routes>
          <Route path="/login" element={isLoggedIn ? <Navigate to="/" /> : <LandingPage onLogin={handleLogin} />} />
          <Route 
            path="/" 
            element={
              <ProtectedRoute isLoggedIn={isLoggedIn}>
                <ProjectsPage onLogout={handleLogout} />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/weather" 
            element={
              <ProtectedRoute isLoggedIn={isLoggedIn}>
                <WeatherDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/tasks" 
            element={
              <ProtectedRoute isLoggedIn={isLoggedIn}>
                <TaskManagementApp />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/worry-tree" 
            element={
              <ProtectedRoute isLoggedIn={isLoggedIn}>
                <WorryTreeApp />
              </ProtectedRoute>
            } 
          />
           <Route path="*" element={<Navigate to={isLoggedIn ? "/" : "/login"} />} />
        </Routes>
      </div>
      
      <Toaster />
    </>
  );
}

export default App;