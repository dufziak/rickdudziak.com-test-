import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { BrowserRouter } from 'react-router-dom';
// NEW IMPORTS
import { ToastContainer } from 'react-toastify'; 
import 'react-toastify/dist/ReactToastify.css'; // Toastify CSS

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <App />
      {/* ADD THE TOAST CONTAINER HERE */}
      <ToastContainer 
        position="bottom-right"
        autoClose={4000} // Shorter autoClose time
        theme="dark"     // Applies the built-in dark theme
        pauseOnHover
        closeOnClick
      />
    </BrowserRouter>
  </React.StrictMode>
);