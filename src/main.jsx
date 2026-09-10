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
