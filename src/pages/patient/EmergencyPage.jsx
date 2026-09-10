import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Ambulance, 
  MapPin, 
  Building2, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  Navigation, 
  Clock, 
  Bed, 
  Radio,
  Phone
} from 'lucide-react';
import hospitals from '../../data/hospitals';
import { useLocationContext } from '../../context/LocationContext';
import { analytics } from '../../services/analytics';

export default function EmergencyPage() {
  const navigate = useNavigate();
  const { 
    userLocation, 
    requestGpsLocation, 
    isLocating, 
    locationError,
    setAreaLocation,
    calculateHospitalDistance, 
    PATIALA_AREAS 
  } = useLocationContext();

  // Filter 24/7 Patiala emergency hospitals
  const emergencyHospitals = hospitals
    .filter(h => h.emergency_available)
    .map(h => {
      const dist = calculateHospitalDistance(h);
      const distNum = dist ? parseFloat(dist) : 2.5;
      return {
        ...h,
        distanceNum: distNum,
        distanceStr: dist ? `${dist} km` : '2.5 km',
        estDriveMin: Math.max(3, Math.round(distNum * 2.1)),
      };
    })
    .sort((a, b) => a.distanceNum - b.distanceNum);

  // Selected hospital state - default to first emergency hospital (GMC Rajindra / nearest)
  const [selectedHospitalId, setSelectedHospitalId] = useState(() => {
    return emergencyHospitals[0]?.id || 1;
  });

  const [isDispatching, setIsDispatching] = useState(false);
  const [dispatchStage, setDispatchStage] = useState('');

  // Automatically request GPS location on mount if not already acquired
  useEffect(() => {
    if (!userLocation && !isLocating) {
      requestGpsLocation();
    }
  }, [userLocation, isLocating, requestGpsLocation]);

  // Selected hospital object
  const selectedHospital = emergencyHospitals.find(h => h.id === selectedHospitalId) || emergencyHospitals[0];

  // Handle Request Ambulance & Transfer to Live Tracking
  const handleRequestAmbulance = () => {
    // If location is not yet set, trigger GPS or use fallback
    if (!userLocation) {
      requestGpsLocation();
    }

    setIsDispatching(true);
    setDispatchStage('Assigning Nearest 108 ALS Ambulance...');

    const tripId = `EMS-108-${Date.now().toString().slice(-4)}`;
    
    // Patient pickup coordinates
    const patientLat = userLocation?.lat || 30.3340;
    const patientLng = userLocation?.lng || 76.3830;
    const patientAddress = userLocation?.name || 'Model Town, Patiala, Punjab';

    // Destination hospital
    const destName = selectedHospital?.name || 'Government Medical College & Rajindra Hospital, Patiala';
    const destLat = selectedHospital?.latitude || 30.3255;
    const destLng = selectedHospital?.longitude || 76.3768;
    const destAddress = selectedHospital?.address || 'Sangrur Road, New Lal Bagh, Patiala, Punjab';
    const etaMinutes = selectedHospital?.estDriveMin || 6;

    const emergencyTrip = {
      id: tripId,
      status: 'in_transit',
      ambulanceType: 'Advanced Cardiac Life Support (Punjab 108 ACLS)',
      vehicleNumber: 'PB-11-EM-4821',
      driverName: 'Paramedic Gurpreet Singh',
      driverPhone: '+91 98765 43210',
      currentLocation: { lat: 30.3420, lng: 76.3910 }, // near Fountain Chowk / Leela Bhawan
      pickupLocation: {
        name: patientAddress,
        lat: patientLat,
        lng: patientLng,
        address: patientAddress
      },
      destination: {
        id: selectedHospital?.id || 1,
        name: destName,
        lat: destLat,
        lng: destLng,
        address: destAddress,
        phone: selectedHospital?.phone || '+91-175-2212018'
      },
      etaMinutes: etaMinutes,
      speedKmH: 52,
      createdAt: new Date().toISOString()
    };

    // Store in sessionStorage & localStorage for persistence across pages
    try {
      sessionStorage.setItem('healthflow_active_trip', JSON.stringify(emergencyTrip));
      localStorage.setItem('healthflow_active_trip', JSON.stringify(emergencyTrip));
    } catch (e) {
      console.warn('Storage failed:', e);
    }

    // Analytics tracking
    if (analytics?.trackEmergencyTrigger) {
      analytics.trackEmergencyTrigger({
        source: 'emergency_landing_flow',
        hasLocation: Boolean(userLocation),
        hospital: destName
      });
    }

    // Smooth emergency dispatch sequence then direct transfer
    setTimeout(() => {
      setDispatchStage('Unit PB-11-EM-4821 En Route • Opening Live Satellite Telemetry...');
      setTimeout(() => {
        navigate(`/patient/ambulance/track/${tripId}`, {
          state: { trip: emergencyTrip }
        });
      }, 700);
    }, 900);
  };

  return (
    <div className="max-w-3xl mx-auto py-4 px-4 sm:px-6 space-y-6 animate-fade-in">
      {/* Top Urgent Emergency Header Banner */}
      <div 
        className="p-5 rounded-2xl border text-white shadow-lg relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #b91c1c 0%, #dc2626 50%, #991b1b 100%)',
          borderColor: '#ef4444'
        }}
      >
        <div className="flex items-center justify-between gap-3 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-white/15 flex items-center justify-center text-2xl backdrop-blur-sm border border-white/20">
              🚨
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/20 border border-white/30 text-white">
                  Punjab 108 Emergency
                </span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white mt-0.5">
                Emergency Ambulance Dispatch
              </h1>
            </div>
          </div>
          <a
            href="tel:108"
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white text-red-700 font-extrabold text-xs shadow hover:bg-red-50 transition"
          >
            <Phone size={14} />
            <span>Direct Call 108</span>
          </a>
        </div>
        <p className="text-xs sm:text-sm text-red-100 mt-2 relative z-10 m-0">
          Verify your pickup location and choose your destination hospital to dispatch the nearest emergency unit.
        </p>
      </div>

      {/* STEP 1: Patient Location Access */}
      <div className="card p-5 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-red-600 text-white text-xs font-bold flex items-center justify-center">
              1
            </span>
            <h2 className="text-sm sm:text-base font-bold text-slate-900 m-0">
              Pickup Location Access
            </h2>
          </div>
          {userLocation ? (
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
              <CheckCircle2 size={13} className="text-emerald-600" />
              Location Acquired
            </span>
          ) : isLocating ? (
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full">
              <Radio size={13} className="animate-spin text-amber-600" />
              Locating...
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-full">
              <AlertCircle size={13} />
              GPS Required
            </span>
          )}
        </div>

        {/* Current Location Display / Request GPS Prompt */}
        <div className="p-3.5 rounded-xl border bg-slate-50 border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-red-100 text-red-600 flex items-center justify-center shrink-0 mt-0.5">
              <MapPin size={18} />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                Patient Coordinates / Area
              </div>
              <div className="text-sm font-extrabold text-slate-900 mt-0.5">
                {userLocation?.name || 'Patiala, Punjab'}
              </div>
              {userLocation?.lat && userLocation?.lng && (
                <div className="text-[11px] font-mono text-slate-500 mt-0.5">
                  GPS: {userLocation.lat.toFixed(4)}° N, {userLocation.lng.toFixed(4)}° E
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              type="button"
              onClick={requestGpsLocation}
              disabled={isLocating}
              className="btn btn-sm bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 font-bold text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition shadow-xs cursor-pointer"
            >
              <Navigation size={13} className={isLocating ? 'animate-spin text-red-600' : 'text-red-600'} />
              <span>{isLocating ? 'Acquiring GPS...' : userLocation ? 'Re-Detect GPS' : 'Allow GPS Access'}</span>
            </button>
          </div>
        </div>

        {/* Optional Manual Landmark Selector if GPS is denied or imprecise */}
        <div className="flex items-center gap-2 pt-1">
          <span className="text-xs text-slate-500 shrink-0 font-medium">Or select landmark:</span>
          <select
            className="select select-sm text-xs font-medium border border-slate-200 rounded-lg bg-white text-slate-800 py-1 px-2.5 w-full max-w-xs cursor-pointer"
            value={PATIALA_AREAS.find(a => a.name === userLocation?.name)?.id || 'modeltown'}
            onChange={(e) => setAreaLocation(e.target.value)}
          >
            {PATIALA_AREAS.map(area => (
              <option key={area.id} value={area.id}>
                {area.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* STEP 2: Which hospital do you want to go to? */}
      <div className="card p-5 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-red-600 text-white text-xs font-bold flex items-center justify-center">
              2
            </span>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-slate-900 m-0">
                Which hospital do you want to go to?
              </h2>
              <p className="text-xs text-slate-500 m-0">
                Showing nearest Patiala hospitals with 24/7 active emergency trauma bays.
              </p>
            </div>
          </div>
        </div>

        {/* Hospital Options */}
        <div className="space-y-2.5 pt-1">
          {emergencyHospitals.slice(0, 6).map((hosp) => {
            const isSelected = selectedHospitalId === hosp.id;
            return (
              <div
                key={hosp.id}
                onClick={() => setSelectedHospitalId(hosp.id)}
                className={`p-3.5 rounded-xl border transition cursor-pointer flex items-center justify-between gap-3 ${
                  isSelected
                    ? 'border-red-500 bg-red-50/40 shadow-xs ring-2 ring-red-500/20'
                    : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50/50'
                }`}
              >
                <div className="flex items-start gap-3 min-w-0">
                  <div className="pt-0.5">
                    <input
                      type="radio"
                      name="destinationHospital"
                      checked={isSelected}
                      onChange={() => setSelectedHospitalId(hosp.id)}
                      className="w-4 h-4 text-red-600 focus:ring-red-500 cursor-pointer accent-red-600"
                    />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-extrabold text-sm text-slate-900 leading-tight">
                        {hosp.name}
                      </h3>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        hosp.type === 'Government'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          : 'bg-blue-100 text-blue-800 border border-blue-200'
                      }`}>
                        {hosp.type === 'Government' ? 'Govt • Level-1 Trauma' : 'Private Multispecialty'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 truncate mt-0.5 m-0">
                      {hosp.address}
                    </p>
                    <div className="flex items-center gap-3 mt-1.5 text-xs">
                      <span className="font-bold text-red-700 flex items-center gap-1">
                        <MapPin size={12} /> {hosp.distanceStr}
                      </span>
                      <span className="text-slate-400">•</span>
                      <span className="text-slate-600 flex items-center gap-1 font-medium">
                        <Clock size={12} /> ~{hosp.estDriveMin} min transit
                      </span>
                      <span className="text-slate-400 hidden sm:inline">•</span>
                      <span className="text-emerald-700 hidden sm:flex items-center gap-1 font-bold">
                        <Bed size={12} /> ER Beds Ready
                      </span>
                    </div>
                  </div>
                </div>

                <div className="shrink-0 text-right">
                  {isSelected ? (
                    <span className="text-xs font-bold text-red-600 bg-red-100/70 px-2.5 py-1 rounded-lg border border-red-200 inline-flex items-center gap-1">
                      <CheckCircle2 size={13} /> Selected
                    </span>
                  ) : (
                    <span className="text-xs font-medium text-slate-400 hover:text-slate-700">
                      Select
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* STEP 3: Request Ambulance Action & Instant Transfer */}
      <div className="card p-5 bg-white rounded-2xl border border-slate-200 shadow-md space-y-3">
        <div className="flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-red-600 text-white text-xs font-bold flex items-center justify-center">
            3
          </span>
          <h2 className="text-sm sm:text-base font-bold text-slate-900 m-0">
            Confirm & Track Live
          </h2>
        </div>

        {isDispatching ? (
          <div className="p-6 rounded-2xl bg-red-50 border-2 border-red-500 text-center space-y-3 animate-pulse">
            <div className="flex items-center justify-center gap-2 text-red-700 font-extrabold text-base sm:text-lg">
              <Radio size={20} className="animate-spin text-red-600" />
              <span>{dispatchStage}</span>
            </div>
            <p className="text-xs text-red-600 m-0 font-medium">
              Connecting satellite GPS link to receiving emergency desk at {selectedHospital?.name}...
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-500">Destination:</span>
                <span className="font-bold text-slate-900">{selectedHospital?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Pickup Scene:</span>
                <span className="font-semibold text-slate-800">{userLocation?.name || 'Patiala, Punjab'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Fleet:</span>
                <span className="font-bold text-emerald-700">108 State Emergency Ambulance (Free 24/7)</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleRequestAmbulance}
              className="w-full py-4 px-6 rounded-xl bg-red-600 hover:bg-red-700 active:scale-[0.99] text-white font-extrabold text-base sm:text-lg transition shadow-lg flex items-center justify-center gap-3 cursor-pointer"
              style={{
                boxShadow: '0 8px 24px rgba(220, 38, 38, 0.35)'
              }}
            >
              <Ambulance size={22} className="animate-bounce" />
              <span>REQUEST AMBULANCE NOW</span>
              <ArrowRight size={20} />
            </button>
            <p className="text-[11px] text-center text-slate-400 m-0">
              Immediately triggers vehicle telemetry and opens the interactive live GPS tracking map.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
