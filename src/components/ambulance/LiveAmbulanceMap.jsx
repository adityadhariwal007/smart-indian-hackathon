import React, { useEffect, useState, useRef, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { 
  Navigation, 
  MapPin, 
  Building2, 
  Compass, 
  Maximize2, 
  Activity, 
  Clock, 
  Gauge, 
  Volume2, 
  VolumeX,
  Radio,
  Sparkles
} from 'lucide-react';
import socketService from '../../services/socketService';
import './LiveAmbulanceMap.css';

// Fix standard Leaflet asset bundling issues
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

/**
 * Custom Ambulance Vehicle Marker Icon
 * Includes emergency dual-color strobe lights and directional bearing rotation
 */
const createAmbulanceIcon = (heading = 0) => {
  return L.divIcon({
    className: 'ambulance-vehicle-leaflet-icon',
    html: `
      <div class="ambulance-marker-container" style="transform: rotate(${heading}deg);">
        <div class="siren-beacon-pulse red-siren"></div>
        <div class="siren-beacon-pulse blue-siren"></div>
        <div class="ambulance-marker-body">
          <svg viewBox="0 0 36 36" class="ambulance-svg-icon" fill="none" xmlns="http://www.w3.org/2000/svg">
            <!-- Vehicle Chassis -->
            <rect x="7" y="3" width="22" height="30" rx="6" fill="#FFFFFF" stroke="#0F172A" stroke-width="1.8" />
            <!-- Windshield -->
            <rect x="10" y="7" width="16" height="6" rx="2" fill="#0284C7" opacity="0.85" />
            <!-- Emergency Cross Roof -->
            <rect x="16.5" y="16" width="3" height="9" rx="1" fill="#EF4444" />
            <rect x="13.5" y="19" width="9" height="3" rx="1" fill="#EF4444" />
            <!-- Red/Blue Lightbar -->
            <rect x="11" y="4" width="6" height="2" rx="1" fill="#EF4444" />
            <rect x="19" y="4" width="6" height="2" rx="1" fill="#3B82F6" />
            <!-- Rear Tail Lights -->
            <rect x="9" y="31" width="4" height="1.5" rx="0.75" fill="#EF4444" />
            <rect x="23" y="31" width="4" height="1.5" rx="0.75" fill="#EF4444" />
          </svg>
          <div class="ambulance-bearing-arrow">▲</div>
        </div>
      </div>
    `,
    iconSize: [44, 44],
    iconAnchor: [22, 22],
    popupAnchor: [0, -22],
  });
};

/**
 * Custom Destination Hospital Icon
 */
const createHospitalIcon = () => {
  return L.divIcon({
    className: 'hospital-leaflet-icon',
    html: `
      <div class="hospital-marker-wrapper">
        <div class="hospital-pulse-ring"></div>
        <div class="hospital-marker-core">
          <span class="hospital-emoji">🏥</span>
        </div>
      </div>
    `,
    iconSize: [42, 42],
    iconAnchor: [21, 21],
    popupAnchor: [0, -20],
  });
};

/**
 * Custom Patient / Pickup Location Icon
 */
const createPatientPickupIcon = () => {
  return L.divIcon({
    className: 'pickup-leaflet-icon',
    html: `
      <div class="pickup-marker-wrapper">
        <div class="pickup-marker-core">
          <span class="pickup-emoji">📍</span>
        </div>
      </div>
    `,
    iconSize: [38, 38],
    iconAnchor: [19, 19],
    popupAnchor: [0, -18],
  });
};

/**
 * Map View Controller Subcomponent (Handles auto-follow and bounding fit)
 */
function MapViewController({ center, autoFollow, boundsToFit }) {
  const map = useMap();
  const prevCenterRef = useRef(null);

  useEffect(() => {
    if (boundsToFit && boundsToFit.length >= 2) {
      try {
        const latLngBounds = L.latLngBounds(boundsToFit);
        map.fitBounds(latLngBounds, { padding: [50, 50], maxZoom: 16 });
      } catch (e) {
        console.warn('Invalid bounds', e);
      }
    }
  }, [boundsToFit, map]);

  useEffect(() => {
    if (autoFollow && center && center[0] && center[1]) {
      // Pan smoothly to follow the ambulance
      map.panTo(center, { animate: true, duration: 1.2, easeLinearity: 0.25 });
      prevCenterRef.current = center;
    }
  }, [center, autoFollow, map]);

  return null;
}

/**
 * Reusable & Embeddable Live Ambulance Map
 */
export default function LiveAmbulanceMap({
  tripId = 'EMS-DEMO-108',
  initialTripData = null,
  height = '520px',
  showTelemetryHud = true,
  interactive = true,
  onTripCompleted = null,
  className = '',
}) {
  const [trip, setTrip] = useState(initialTripData);
  const [loading, setLoading] = useState(!initialTripData);
  const [error, setError] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [autoFollow, setAutoFollow] = useState(true);
  const [fitTrigger, setFitTrigger] = useState(null);

  // Animated vehicle position & heading state for 60fps smooth glides
  const [animatedPos, setAnimatedPos] = useState(null);
  const [animatedHeading, setAnimatedHeading] = useState(0);
  const [liveSpeed, setLiveSpeed] = useState(45);
  const [liveEta, setLiveEta] = useState(null);
  const [liveDistance, setLiveDistance] = useState(null);

  // Animation frame references
  const animFrameRef = useRef(null);
  const animStartRef = useRef(null);
  const startPosRef = useRef(null);
  const targetPosRef = useRef(null);
  const durationRef = useRef(2500); // 2.5s interpolation duration

  // Fetch initial REST data if not provided
  useEffect(() => {
    let isMounted = true;

    async function loadTripREST() {
      try {
        const res = await fetch(`/api/trips/${tripId}`);
        if (!res.ok) throw new Error(`Trip ${tripId} not found`);
        const data = await res.json();
        if (isMounted && data.trip) {
          setTrip(data.trip);
          const curr = data.trip.currentLocation || data.trip.startLocation;
          setAnimatedPos([curr.lat, curr.lng]);
          setAnimatedHeading(curr.heading || 0);
          setLiveSpeed(curr.speed || 40);
          setLiveEta(data.trip.etaMinutes || 5);
          setLiveDistance(data.trip.distanceKm || 3.5);
          setLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          console.warn('[LiveAmbulanceMap] REST fetch fallback:', err.message);
          // Auto-seed demo if needed
          fetch('/api/trips/seed-demo', { method: 'POST' })
            .then(r => r.json())
            .then(d => {
              if (isMounted && d.trip) {
                setTrip(d.trip);
                const curr = d.trip.currentLocation || d.trip.startLocation;
                setAnimatedPos([curr.lat, curr.lng]);
                setAnimatedHeading(curr.heading || 0);
                setLiveSpeed(curr.speed || 45);
                setLiveEta(d.trip.etaMinutes || 6);
                setLiveDistance(d.trip.distanceKm || 4.2);
                setLoading(false);
              }
            })
            .catch(() => {
              if (isMounted) {
                setError('Failed to connect to telematics service. Please ensure server is running.');
                setLoading(false);
              }
            });
        }
      }
    }

    loadTripREST();

    return () => {
      isMounted = false;
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [tripId]);

  /**
   * Smooth 60fps Gliding Animation
   * Prevents marker teleportation / jumps by interpolating between consecutive coordinates
   */
  const startGlidingAnimation = useCallback((newLat, newLng, heading, speed) => {
    if (!animatedPos) {
      setAnimatedPos([newLat, newLng]);
      setAnimatedHeading(heading || 0);
      return;
    }

    // Cancel any active animation frame
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
    }

    startPosRef.current = [animatedPos[0], animatedPos[1]];
    targetPosRef.current = [newLat, newLng];
    animStartRef.current = performance.now();
    durationRef.current = 2400; // Match simulator / GPS ping interval

    // Turn vehicle smoothly towards new heading
    setAnimatedHeading(heading || 0);
    setLiveSpeed(speed || 40);

    const step = (currentTime) => {
      const elapsed = currentTime - animStartRef.current;
      const progress = Math.min(elapsed / durationRef.current, 1);

      // Linear interpolation between waypoints
      const curLat = startPosRef.current[0] + (targetPosRef.current[0] - startPosRef.current[0]) * progress;
      const curLng = startPosRef.current[1] + (targetPosRef.current[1] - startPosRef.current[1]) * progress;

      setAnimatedPos([curLat, curLng]);

      if (progress < 1) {
        animFrameRef.current = requestAnimationFrame(step);
      }
    };

    animFrameRef.current = requestAnimationFrame(step);
  }, [animatedPos]);

  /**
   * WebSocket Real-time Telemetry Subscription
   */
  useEffect(() => {
    if (!tripId) return;

    const cleanup = socketService.joinTrip(tripId, {
      onInitialState: ({ trip: initialTrip }) => {
        setTrip(initialTrip);
        if (initialTrip.currentLocation) {
          setAnimatedPos([initialTrip.currentLocation.lat, initialTrip.currentLocation.lng]);
          setAnimatedHeading(initialTrip.currentLocation.heading || 0);
          setLiveSpeed(initialTrip.currentLocation.speed || 40);
        }
        if (initialTrip.etaMinutes !== undefined) setLiveEta(initialTrip.etaMinutes);
        if (initialTrip.distanceKm !== undefined) setLiveDistance(initialTrip.distanceKm);
        setLoading(false);
      },
      onLocationUpdate: (update) => {
        startGlidingAnimation(update.lat, update.lng, update.heading, update.speed);
        if (update.etaMinutes !== undefined) setLiveEta(update.etaMinutes);
        if (update.distanceRemainingKm !== undefined) setLiveDistance(update.distanceRemainingKm);

        if (update.status === 'arrived' && onTripCompleted) {
          onTripCompleted(update);
        }
      },
      onStatusChange: ({ status }) => {
        setTrip(prev => prev ? { ...prev, status } : null);
        if (status === 'arrived' && onTripCompleted) {
          onTripCompleted({ status: 'arrived' });
        }
      },
      onError: (err) => {
        console.warn('[LiveAmbulanceMap] Socket error:', err.message);
      },
      onConnectionChange: (connected) => {
        setIsConnected(connected);
      },
    });

    return () => {
      cleanup();
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [tripId, startGlidingAnimation, onTripCompleted]);

  // Handle fit bounds click
  const handleFitRoute = () => {
    if (trip?.route && trip.route.length > 0) {
      setFitTrigger([...trip.route]);
    } else if (trip?.startLocation && trip?.destination) {
      setFitTrigger([
        [trip.startLocation.lat, trip.startLocation.lng],
        [trip.destination.lat, trip.destination.lng],
      ]);
    }
  };

  if (loading) {
    return (
      <div className={`live-map-loading-container ${className}`} style={{ height }}>
        <div className="live-map-spinner-wrap">
          <div className="pulse-beacon"></div>
          <span className="live-spinner-icon">🚑</span>
          <p className="font-semibold mt-3 text-slate-800">Connecting to Ambulance Telematics...</p>
          <span className="text-xs text-slate-500">Subscribing to live telemetry channel for {tripId}</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`live-map-error-container ${className}`} style={{ height }}>
        <div className="p-6 text-center max-w-md">
          <p className="text-red-500 font-bold mb-2">⚠️ Telematics Channel Offline</p>
          <p className="text-sm text-slate-600 mb-4">{error}</p>
          <button 
            className="btn btn-sm btn-primary"
            onClick={() => window.location.reload()}
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  const mapCenter = animatedPos || [
    trip?.currentLocation?.lat || trip?.startLocation?.lat || 30.3440,
    trip?.currentLocation?.lng || trip?.startLocation?.lng || 76.3685,
  ];

  const destinationCoord = trip?.destination
    ? [trip.destination.lat, trip.destination.lng]
    : null;

  const startCoord = trip?.startLocation
    ? [trip.startLocation.lat, trip.startLocation.lng]
    : null;

  const routePolyline = trip?.route || [];

  return (
    <div className={`live-ambulance-map-wrapper ${className}`} style={{ height }}>
      {/* Dynamic Telematics HUD Overlay */}
      {showTelemetryHud && (
        <div className="live-telemetry-hud glass-card">
          <div className="hud-header">
            <div className="flex items-center gap-2">
              <span className={`hud-status-indicator ${isConnected ? 'online' : 'offline'}`}></span>
              <span className="hud-title font-bold text-xs uppercase tracking-wider">
                {isConnected ? 'LIVE TELEMATICS' : 'RECONNECTING'}
              </span>
            </div>
            <span className="hud-badge-code">{trip?.vehicleNumber || 'EMS-108'}</span>
          </div>

          <div className="hud-stats-grid">
            <div className="hud-stat-item">
              <Clock size={15} className="hud-icon text-amber-500" />
              <div>
                <span className="hud-label">ESTIMATED ETA</span>
                <p className="hud-value font-extrabold text-slate-900">
                  {liveEta !== null ? `${liveEta} min` : '~'}
                </p>
              </div>
            </div>

            <div className="hud-stat-item">
              <Compass size={15} className="hud-icon text-emerald-600" />
              <div>
                <span className="hud-label">DISTANCE REMAINING</span>
                <p className="hud-value font-extrabold text-slate-900">
                  {liveDistance !== null ? `${liveDistance} km` : '~'}
                </p>
              </div>
            </div>

            <div className="hud-stat-item">
              <Gauge size={15} className="hud-icon text-blue-600" />
              <div>
                <span className="hud-label">SPEED</span>
                <p className="hud-value font-extrabold text-slate-900">
                  {liveSpeed} km/h
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Floating Map Controls */}
      <div className="live-map-controls-float">
        <button
          type="button"
          className={`map-ctrl-btn ${autoFollow ? 'active' : ''}`}
          onClick={() => setAutoFollow(!autoFollow)}
          title={autoFollow ? 'Auto-follow enabled' : 'Auto-follow disabled'}
        >
          <Navigation size={18} className={autoFollow ? 'text-primary' : 'text-slate-500'} />
          <span className="text-xs font-semibold">{autoFollow ? 'Tracking' : 'Free Pan'}</span>
        </button>

        <button
          type="button"
          className="map-ctrl-btn"
          onClick={handleFitRoute}
          title="Fit full route in screen"
        >
          <Maximize2 size={18} className="text-slate-600" />
          <span className="text-xs font-semibold">Fit Route</span>
        </button>
      </div>

      {/* Primary Leaflet Map Container */}
      <MapContainer
        center={mapCenter}
        zoom={15}
        scrollWheelZoom={interactive}
        dragging={interactive}
        zoomControl={interactive}
        className="live-leaflet-viewport"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={19}
        />

        <MapViewController
          center={animatedPos}
          autoFollow={autoFollow}
          boundsToFit={fitTrigger}
        />

        {/* Real road polyline */}
        {routePolyline.length > 1 && (
          <>
            {/* Outer road glow casing */}
            <Polyline
              positions={routePolyline}
              pathOptions={{
                color: '#059669',
                weight: 8,
                opacity: 0.35,
                lineCap: 'round',
                lineJoin: 'round',
              }}
            />
            {/* Inner high-visibility route line */}
            <Polyline
              positions={routePolyline}
              pathOptions={{
                color: '#059669',
                weight: 4.5,
                opacity: 0.95,
                lineCap: 'round',
                lineJoin: 'round',
                dashArray: '1, 10',
              }}
            />
          </>
        )}

        {/* Start / Patient Pickup Point Marker */}
        {startCoord && (
          <Marker position={startCoord} icon={createPatientPickupIcon()}>
            <Popup className="custom-leaflet-popup">
              <div className="p-1">
                <span className="badge badge-sm badge-info mb-1">Pickup Location</span>
                <p className="font-bold text-sm text-slate-900">{trip?.patientName || 'Emergency Scene'}</p>
                <p className="text-xs text-slate-500">{trip?.startLocation?.address}</p>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Destination Hospital Marker */}
        {destinationCoord && (
          <Marker position={destinationCoord} icon={createHospitalIcon()}>
            <Popup className="custom-leaflet-popup">
              <div className="p-1">
                <span className="badge badge-sm badge-success mb-1">Destination Hospital</span>
                <p className="font-bold text-sm text-slate-900">{trip?.destination?.address || 'Rajindra Hospital'}</p>
                <p className="text-xs text-emerald-600 font-semibold">Trauma & Emergency Care Ready</p>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Smooth Animated Ambulance Marker with Directional Heading */}
        {animatedPos && (
          <Marker
            position={animatedPos}
            icon={createAmbulanceIcon(animatedHeading)}
          >
            <Popup className="custom-leaflet-popup">
              <div className="p-1">
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
                  <span className="font-bold text-xs text-red-600 uppercase">Emergency In Transit</span>
                </div>
                <p className="font-bold text-sm text-slate-900">{trip?.vehicleNumber || 'EMS-108'}</p>
                <p className="text-xs text-slate-600">{trip?.ambulanceType || 'Advanced Life Support'}</p>
                <div className="mt-2 text-xs border-t pt-1 flex justify-between">
                  <span>Speed: <strong>{liveSpeed} km/h</strong></span>
                  <span>ETA: <strong>{liveEta} min</strong></span>
                </div>
              </div>
            </Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  );
}
