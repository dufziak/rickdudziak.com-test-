import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import LandingPage from '@/components/LandingPage';
import ProjectsPage from '@/components/ProjectsPage';
import WeatherDashboard from '@/components/WeatherDashboard';
import TaskManagementApp from '@/components/TaskManagementApp';
import WorryTreeApp from '@/components/WorryTreeApp';
import { Toaster } from '@/components/ui/toaster'; 
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase'; 

const ProtectedRoute = ({ currentUser, children }) => {
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // This listener runs whenever the user's login state changes
    const unsubscribe = onAuthStateChanged(auth, user => {
      setCurrentUser(user);
      setLoading(false);
    });

    // Cleanup function to detach the listener when the component unmounts
    return unsubscribe;
  }, []);

  const handleLogout = () => {
    // Firebase handles the logout logic
    auth.signOut();
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
        {/* ⭐ CORRECT: Only <Routes> is here, no nested <Router> ⭐ */}
        <Routes>
          <Route path="/login" element={currentUser ? <Navigate to="/" /> : <LandingPage />} />
          <Route 
            path="/" 
            element={
              <ProtectedRoute currentUser={currentUser}>
                <ProjectsPage onLogout={handleLogout} />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/weather" 
            element={
              <ProtectedRoute currentUser={currentUser}>
                <WeatherDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/tasks" 
            element={
              <ProtectedRoute currentUser={currentUser}>
                <TaskManagementApp />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/worry-tree" 
            element={
              <ProtectedRoute currentUser={currentUser}>
                <WorryTreeApp currentUser={currentUser} />
              </ProtectedRoute>
            } 
          />
           <Route path="*" element={<Navigate to={currentUser ? "/" : "/login"} />} />
        </Routes>
      </div>
      {/* The Toaster component is correctly placed outside the routing logic */}
      <Toaster />
    </>
  );
}

export default App;