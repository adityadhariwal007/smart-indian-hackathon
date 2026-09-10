import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Truck, 
  Play, 
  Square, 
  CheckCircle2, 
  Radio, 
  Compass, 
  Gauge, 
  Navigation, 
  AlertTriangle, 
  Volume2, 
  VolumeX, 
  ExternalLink,
  ShieldCheck,
  RefreshCw,
  Phone,
  ArrowRight
} from 'lucide-react';
import socketService from '../../services/socketService';
import { calculateBearing } from '../../../server/services/routingService'; // Or inline bearing
import './DriverConsole.css';

// Inline bearing calculator for client-side calculation
function calculateClientBearing(lat1, lon1, lat2, lon2) {
  const toRad = (deg) => (deg * Math.PI) / 180;
  const toDeg = (rad) => (rad * 180) / Math.PI;

  const y = Math.sin(toRad(lon2 - lon1)) * Math.cos(toRad(lat2));
  const x =
    Math.cos(toRad(lat1)) * Math.sin(toRad(lat2)) -
    Math.sin(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.cos(toRad(lon2 - lon1));

  let brng = toDeg(Math.atan2(y, x));
  return Math.round((brng + 360) % 360);
}

export default function DriverConsole({ tripId = 'EMS-DEMO-108' }) {
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isStreaming, setIsStreaming] = useState(false);
  const [mode, setMode] = useState('simulated'); // 'simulated' | 'device_gps'
  const [status, setStatus] = useState('dispatched');
  
  // Telemetry metrics
  const [currentCoord, setCurrentCoord] = useState({ lat: 30.3440, lng: 76.3685 });
  const [speed, setSpeed] = useState(0);
  const [heading, setHeading] = useState(0);
  const [accuracy, setAccuracy] = useState(5);
  const [pingsSent, setPingsSent] = useState(0);
  const [lastPingTime, setLastPingTime] = useState(null);
  const [sirenPlaying, setSirenPlaying] = useState(false);
  const [gpsError, setGpsError] = useState(null);

  // References
  const intervalRef = useRef(null);
  const geoWatchIdRef = useRef(null);
  const audioContextRef = useRef(null);
  const sirenOscillatorRef = useRef(null);
  const simIndexRef = useRef(0);
  const waypointsRef = useRef([]);

  // Fetch initial trip data
  useEffect(() => {
    let mounted = true;
    async function fetchTrip() {
      try {
        const res = await fetch(`/api/trips/${tripId}`);
        const data = await res.json();
        if (mounted && data.trip) {
          setTrip(data.trip);
          setStatus(data.trip.status);
          if (data.trip.currentLocation) {
            setCurrentCoord({
              lat: data.trip.currentLocation.lat,
              lng: data.trip.currentLocation.lng,
            });
            setSpeed(data.trip.currentLocation.speed || 0);
            setHeading(data.trip.currentLocation.heading || 0);
          }
          if (data.trip.route && data.trip.route.length > 0) {
            waypointsRef.current = data.trip.route;
          }
        }
      } catch (err) {
        console.warn('Driver fetch fallback:', err);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    fetchTrip();
    return () => { mounted = false; };
  }, [tripId]);

  // Connect socket
  useEffect(() => {
    const cleanup = socketService.joinTrip(tripId, {
      onInitialState: ({ trip: t }) => {
        if (t) {
          setTrip(t);
          setStatus(t.status);
          if (t.route) waypointsRef.current = t.route;
        }
      },
      onStatusChange: ({ status: s }) => {
        setStatus(s);
      },
    });

    return () => {
      cleanup();
      stopStreaming();
      stopSirenAudio();
    };
  }, [tripId]);

  /**
   * Web Audio API Emergency Siren Synthesizer
   * Creates an authentic wailing ambulance siren without needing any external MP3
   */
  const toggleSirenAudio = () => {
    if (sirenPlaying) {
      stopSirenAudio();
    } else {
      startSirenAudio();
    }
  };

  const startSirenAudio = () => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      const ctx = new AudioCtx();
      audioContextRef.current = ctx;

      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(650, ctx.currentTime);

      // Wailing frequency modulation
      const now = ctx.currentTime;
      for (let i = 0; i < 60; i++) {
        const time = now + i * 1.5;
        osc.frequency.linearRampToValueAtTime(950, time + 0.75);
        osc.frequency.linearRampToValueAtTime(650, time + 1.5);
      }

      gainNode.gain.setValueAtTime(0.08, ctx.currentTime); // Comfortable volume
      osc.connect(gainNode);
      gainNode.connect(ctx.destination);

      osc.start();
      sirenOscillatorRef.current = osc;
      setSirenPlaying(true);
    } catch (e) {
      console.warn('Audio siren error:', e);
    }
  };

  const stopSirenAudio = () => {
    try {
      if (sirenOscillatorRef.current) {
        sirenOscillatorRef.current.stop();
        sirenOscillatorRef.current.disconnect();
        sirenOscillatorRef.current = null;
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
        audioContextRef.current = null;
      }
    } catch (e) {}
    setSirenPlaying(false);
  };

  /**
   * Emit GPS Telemetry to Server
   */
  const emitLocationPing = useCallback((lat, lng, spd, hdg, acc, src) => {
    const payload = {
      tripId,
      lat,
      lng,
      speed: spd,
      heading: hdg,
      accuracy: acc,
      source: src,
    };

    socketService.sendLocation(payload);
    setCurrentCoord({ lat, lng });
    setSpeed(spd);
    setHeading(hdg);
    setAccuracy(acc);
    setPingsSent(prev => prev + 1);
    setLastPingTime(new Date().toLocaleTimeString());
  }, [tripId]);

  /**
   * Start Live GPS Streaming
   */
  const startStreaming = () => {
    setIsStreaming(true);
    setStatus('in_transit');
    socketService.updateTripStatus(tripId, 'in_transit');

    if (mode === 'simulated') {
      // Step through road waypoints every 3 seconds
      const waypoints = waypointsRef.current.length > 0
        ? waypointsRef.current
        : [
            [30.3440, 76.3685],
            [30.3425, 76.3695],
            [30.3412, 76.3710],
            [30.3395, 76.3728],
            [30.3380, 76.3745],
            [30.3365, 76.3758],
            [30.3345, 76.3762],
            [30.3325, 76.3765],
            [30.3300, 76.3767],
            [30.3275, 76.3768],
            [30.3255, 76.3768],
          ];

      simIndexRef.current = 0;

      intervalRef.current = setInterval(() => {
        if (simIndexRef.current >= waypoints.length) {
          // Arrived at destination
          handleMarkArrived();
          return;
        }

        const curr = waypoints[simIndexRef.current];
        const next = waypoints[Math.min(simIndexRef.current + 1, waypoints.length - 1)];
        const brng = calculateClientBearing(curr[0], curr[1], next[0], next[1]);
        const curSpeed = Math.round(45 + Math.sin(simIndexRef.current) * 12);

        emitLocationPing(curr[0], curr[1], curSpeed, brng, 6, 'simulator');
        simIndexRef.current++;
      }, 3000);
    } else {
      // Device GPS via browser Geolocation API
      if (!navigator.geolocation) {
        setGpsError('Geolocation is not supported by your browser.');
        setIsStreaming(false);
        return;
      }

      setGpsError(null);
      geoWatchIdRef.current = navigator.geolocation.watchPosition(
        (pos) => {
          const { latitude, longitude, speed: geoSpeed, heading: geoHeading, accuracy: geoAcc } = pos.coords;
          const spdKmh = geoSpeed ? Math.round(geoSpeed * 3.6) : 35;
          const hdgVal = geoHeading || 0;
          emitLocationPing(latitude, longitude, spdKmh, hdgVal, Math.round(geoAcc || 10), 'device_gps');
        },
        (err) => {
          console.warn('Driver GPS error:', err.message);
          setGpsError(`GPS Access Denied/Error: ${err.message}. Switching to Simulated Mode recommended.`);
        },
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 2000 }
      );
    }
  };

  /**
   * Stop Streaming
   */
  const stopStreaming = () => {
    setIsStreaming(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (geoWatchIdRef.current !== null && navigator.geolocation) {
      navigator.geolocation.clearWatch(geoWatchIdRef.current);
      geoWatchIdRef.current = null;
    }
  };

  const handleMarkArrived = () => {
    stopStreaming();
    stopSirenAudio();
    setStatus('arrived');
    socketService.updateTripStatus(tripId, 'arrived');
  };

  const handleCompleteTrip = () => {
    stopStreaming();
    stopSirenAudio();
    setStatus('completed');
    socketService.updateTripStatus(tripId, 'completed');
  };

  if (loading) {
    return (
      <div className="driver-console-card p-8 text-center">
        <RefreshCw className="animate-spin text-primary mx-auto mb-3" size={32} />
        <p className="font-bold">Loading Driver Telematics Cockpit...</p>
      </div>
    );
  }

  return (
    <div className="driver-console-container">
      {/* Cockpit Header */}
      <div className="driver-header-strip">
        <div className="flex items-center gap-3">
          <div className="driver-avatar-badge">
            <Truck size={22} className="text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-black text-slate-900 m-0">Ambulance Telematics Cockpit</h2>
              <span className={`driver-status-chip ${status}`}>{status.replace('_', ' ').toUpperCase()}</span>
            </div>
            <p className="text-xs text-slate-500 m-0">
              Vehicle: <strong>{trip?.vehicleNumber || 'PB-11-EMS-0108'}</strong> • Trip: <strong>{tripId}</strong>
            </p>
          </div>
        </div>

        <a
          href={`/patient/ambulance/track/${tripId}`}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-sm btn-ghost flex items-center gap-1.5 text-xs text-primary font-bold"
        >
          <span>Open Patient Live Map</span>
          <ExternalLink size={14} />
        </a>
      </div>

      {gpsError && (
        <div className="driver-alert-box alert-warning mb-4">
          <AlertTriangle size={18} className="text-amber-600 shrink-0" />
          <span className="text-xs text-amber-800">{gpsError}</span>
        </div>
      )}

      {/* Mode Selector Pill */}
      <div className="driver-mode-selector mb-4">
        <span className="text-xs font-bold text-slate-500 mr-2">GPS Source:</span>
        <button
          type="button"
          disabled={isStreaming}
          className={`driver-mode-btn ${mode === 'simulated' ? 'active' : ''}`}
          onClick={() => setMode('simulated')}
        >
          Virtual Road Simulator
        </button>
        <button
          type="button"
          disabled={isStreaming}
          className={`driver-mode-btn ${mode === 'device_gps' ? 'active' : ''}`}
          onClick={() => setMode('device_gps')}
        >
          Real Phone/Tablet GPS
        </button>
      </div>

      {/* Main Tactical Telemetry Dials */}
      <div className="driver-telemetry-grid mb-6">
        {/* Speedometer Card */}
        <div className="telemetry-gauge-card">
          <div className="gauge-icon-wrap text-blue-500">
            <Gauge size={22} />
          </div>
          <div className="gauge-data">
            <span className="gauge-label">VEHICLE SPEED</span>
            <div className="flex items-baseline gap-1">
              <span className="gauge-numeric">{speed}</span>
              <span className="text-xs font-bold text-slate-400">KM/H</span>
            </div>
          </div>
        </div>

        {/* Heading / Compass */}
        <div className="telemetry-gauge-card">
          <div className="gauge-icon-wrap text-emerald-500">
            <Compass size={22} />
          </div>
          <div className="gauge-data">
            <span className="gauge-label">BEARING HEADING</span>
            <div className="flex items-baseline gap-1">
              <span className="gauge-numeric">{heading}°</span>
              <span className="text-xs font-bold text-slate-400">
                {heading >= 315 || heading < 45 ? 'N' : heading < 135 ? 'E' : heading < 225 ? 'S' : 'W'}
              </span>
            </div>
          </div>
        </div>

        {/* GPS Stream Status */}
        <div className="telemetry-gauge-card">
          <div className="gauge-icon-wrap text-amber-500">
            <Radio size={22} className={isStreaming ? 'animate-pulse text-red-500' : ''} />
          </div>
          <div className="gauge-data">
            <span className="gauge-label">TELEMETRY PINGS</span>
            <div className="flex items-baseline gap-1">
              <span className="gauge-numeric">{pingsSent}</span>
              <span className="text-xs font-bold text-slate-400">SENT</span>
            </div>
          </div>
        </div>
      </div>

      {/* Location Coordinates & Destination Overview */}
      <div className="driver-route-overview mb-6">
        <div className="route-point-row">
          <div className="route-marker pickup"></div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase">Emergency Scene / Patient</span>
            <p className="text-xs font-semibold text-slate-800 m-0">
              {trip?.startLocation?.address || 'Model Town, Patiala'}
            </p>
          </div>
        </div>

        <div className="route-divider-line"></div>

        <div className="route-point-row">
          <div className="route-marker hospital"></div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase">Destination Hospital</span>
            <p className="text-xs font-semibold text-slate-800 m-0">
              {trip?.destination?.address || 'GMC Rajindra Hospital, Patiala'}
            </p>
          </div>
        </div>
      </div>

      {/* Telemetry Actions & Emergency Controls */}
      <div className="driver-action-controls">
        {!isStreaming && status !== 'arrived' && status !== 'completed' && (
          <button
            type="button"
            className="driver-btn-primary btn-start"
            onClick={startStreaming}
          >
            <Play size={20} fill="currentColor" />
            <span>START TRIP & BROADCAST GPS</span>
          </button>
        )}

        {isStreaming && (
          <button
            type="button"
            className="driver-btn-warning btn-pause"
            onClick={stopStreaming}
          >
            <Square size={18} fill="currentColor" />
            <span>PAUSE GPS STREAM</span>
          </button>
        )}

        {status === 'in_transit' && (
          <button
            type="button"
            className="driver-btn-success btn-arrived"
            onClick={handleMarkArrived}
          >
            <CheckCircle2 size={20} />
            <span>MARK ARRIVED AT HOSPITAL</span>
          </button>
        )}

        {status === 'arrived' && (
          <button
            type="button"
            className="driver-btn-secondary btn-complete"
            onClick={handleCompleteTrip}
          >
            <ShieldCheck size={20} />
            <span>FINISH & CLOSE TRIP</span>
          </button>
        )}

        {/* Siren Audio Toggle */}
        <button
          type="button"
          className={`driver-siren-toggle ${sirenPlaying ? 'active' : ''}`}
          onClick={toggleSirenAudio}
          title="Toggle electronic ambulance siren synthesizer"
        >
          {sirenPlaying ? <Volume2 size={18} /> : <VolumeX size={18} />}
          <span>{sirenPlaying ? 'SIREN ACTIVE' : 'TEST SIREN CHIME'}</span>
        </button>
      </div>

      {/* Real-time Status Footer */}
      <div className="driver-footer-telemetry mt-4">
        <span className="text-xs text-slate-500">
          Current GPS: {currentCoord.lat.toFixed(5)}, {currentCoord.lng.toFixed(5)} (±{accuracy}m)
        </span>
        {lastPingTime && (
          <span className="text-xs text-slate-400">
            Last Ping: {lastPingTime}
          </span>
        )}
      </div>
    </div>
  );
}
