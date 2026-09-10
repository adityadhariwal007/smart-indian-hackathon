import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getDistance } from '../data/hospitals';

const LocationContext = createContext(null);

export const PATIALA_AREAS = [
  { id: 'modeltown', name: 'Model Town, Patiala', lat: 30.3440, lng: 76.3685 },
  { id: 'thapar', name: 'Thapar University / Bhupindra Road', lat: 30.3556, lng: 76.3697 },
  { id: 'leela', name: 'Leela Bhawan Market, Patiala', lat: 30.3412, lng: 76.3789 },
  { id: 'busstand', name: 'Patiala Bus Stand / Railway Station', lat: 30.3325, lng: 76.4010 },
  { id: 'tripuri', name: 'Tripuri Town, Patiala', lat: 30.3540, lng: 76.3810 },
  { id: 'urbanestate', name: 'Urban Estate Phase 1 & 2, Patiala', lat: 30.3580, lng: 76.4215 },
  { id: 'baradari', name: 'Chhoti Baradari, Patiala', lat: 30.3480, lng: 76.3890 },
  { id: 'mallroad', name: 'Mall Road / Fountain Chowk, Patiala', lat: 30.3340, lng: 76.3880 },
  { id: 'gmc', name: 'GMC Rajindra / Sangrur Road', lat: 30.3255, lng: 76.3768 },
  { id: 'lahori', name: 'Lahori Gate (Walled City), Patiala', lat: 30.3280, lng: 76.4020 },
];

export function LocationProvider({ children }) {
  // Saved location or null initially to ask user upon browsing
  const [userLocation, setUserLocation] = useState(() => {
    if (typeof localStorage !== 'undefined') {
      const saved = localStorage.getItem('healthflow_patient_location');
      if (saved) {
        try { return JSON.parse(saved); } catch (e) {}
      }
    }
    return null; // Not set initially so website asks on browsing
  });

  const [isLocating, setIsLocating] = useState(false);
  const [locationPromptDismissed, setLocationPromptDismissed] = useState(false);
  const [locationError, setLocationError] = useState(null);

  // Request browser GPS location
  const requestGpsLocation = useCallback(() => {
    setIsLocating(true);
    setLocationError(null);

    if (!navigator.geolocation) {
      // Fallback if browser doesn't support geolocation
      const defaultLoc = PATIALA_AREAS[0];
      setUserLocation({ ...defaultLoc, isGps: false });
      localStorage.setItem('healthflow_patient_location', JSON.stringify({ ...defaultLoc, isGps: false }));
      setIsLocating(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const loc = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          name: 'Your GPS Location (Patiala)',
          isGps: true,
        };
        setUserLocation(loc);
        setIsLocating(false);
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem('healthflow_patient_location', JSON.stringify(loc));
        }
      },
      (err) => {
        console.warn('Geolocation access denied or unavailable:', err.message);
        // Set default to Model Town, Patiala on denial so distances work immediately
        const defaultLoc = { ...PATIALA_AREAS[0], isGps: false };
        setUserLocation(defaultLoc);
        setLocationError('GPS access was not granted. Set to Model Town, Patiala.');
        setIsLocating(false);
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem('healthflow_patient_location', JSON.stringify(defaultLoc));
        }
      },
      { timeout: 8000, enableHighAccuracy: true }
    );
  }, []);

  // Choose from Patiala landmark / area list
  const setAreaLocation = useCallback((areaId) => {
    const area = PATIALA_AREAS.find(a => a.id === areaId) || PATIALA_AREAS[0];
    const loc = { ...area, isGps: false };
    setUserLocation(loc);
    setLocationError(null);
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('healthflow_patient_location', JSON.stringify(loc));
    }
  }, []);

  // Calculate distance in km from patient's location to a hospital
  const calculateHospitalDistance = useCallback((hospital) => {
    if (!hospital || !hospital.latitude || !hospital.longitude) return null;
    if (!userLocation || !userLocation.lat || !userLocation.lng) return null;
    return getDistance(userLocation.lat, userLocation.lng, hospital.latitude, hospital.longitude);
  }, [userLocation]);

  return (
    <LocationContext.Provider
      value={{
        userLocation,
        isLocating,
        locationError,
        locationPromptDismissed,
        setLocationPromptDismissed,
        requestGpsLocation,
        setAreaLocation,
        calculateHospitalDistance,
        PATIALA_AREAS,
      }}
    >
      {children}
    </LocationContext.Provider>
  );
}

export function useLocationContext() {
  const context = useContext(LocationContext);
  if (!context) throw new Error('useLocationContext must be used within LocationProvider');
  return context;
}

export default LocationContext;
