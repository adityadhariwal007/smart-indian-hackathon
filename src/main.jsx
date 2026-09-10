import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { LocationProvider } from './context/LocationContext';
import { LanguageProvider } from './context/LanguageContext';
import App from './App';
import './index.css';
import 'leaflet/dist/leaflet.css';
import SmoothScroll from './components/common/SmoothScroll';

// Force HTTPS across entire site in production environments
if (
  typeof window !== 'undefined' &&
  window.location.protocol === 'http:' &&
  !window.location.hostname.includes('localhost') &&
  !window.location.hostname.includes('127.0.0.1')
) {
  window.location.replace(window.location.href.replace(/^http:/, 'https:'));
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <SmoothScroll>
        <AuthProvider>
          <NotificationProvider>
            <LocationProvider>
              <LanguageProvider>
                <App />
              </LanguageProvider>
            </LocationProvider>
          </NotificationProvider>
        </AuthProvider>
      </SmoothScroll>
    </BrowserRouter>
  </React.StrictMode>
);
