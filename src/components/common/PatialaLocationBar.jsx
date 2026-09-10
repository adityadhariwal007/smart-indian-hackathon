import { useState } from 'react';
import { MapPin, Navigation, ChevronDown, Check, Compass, AlertCircle } from 'lucide-react';
import { useLocationContext, PATIALA_AREAS } from '../../context/LocationContext';

export default function PatialaLocationBar({ compact = false }) {
  const {
    userLocation,
    isLocating,
    locationError,
    requestGpsLocation,
    setAreaLocation
  } = useLocationContext();

  const [showDropdown, setShowDropdown] = useState(false);

  return (
    <div className="patiala-location-container" style={{ marginBottom: '16px' }}>
      {/* Banner if location has not been selected/detected yet */}
      {!userLocation ? (
        <div 
          className="card animate-fade-in"
          style={{
            background: 'linear-gradient(135deg, #f0fdf4 0%, #ffffff 100%)',
            border: '1.5px solid #a7f3d0',
            borderRadius: '16px',
            padding: '16px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '14px',
            boxShadow: '0 4px 20px rgba(5, 150, 105, 0.08)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{
              width: '42px', height: '42px', borderRadius: '12px',
              background: '#059669', color: '#fff', display: 'flex',
              alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              boxShadow: '0 4px 12px rgba(5, 150, 105, 0.25)'
            }}>
              <MapPin size={22} />
            </div>
            <div>
              <div style={{ fontSize: '15px', fontWeight: 700, color: '#064e3b', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>Where are you in Patiala?</span>
                <span className="badge badge-success" style={{ fontSize: '10px', padding: '2px 8px' }}>
                  Patiala Only
                </span>
              </div>
              <div style={{ fontSize: '12px', color: '#475569', marginTop: '2px' }}>
                Share your location to calculate exact distance and travel time to each hospital.
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <button
              type="button"
              className="btn btn-primary btn-sm"
              disabled={isLocating}
              onClick={requestGpsLocation}
              style={{
                borderRadius: '9999px', padding: '8px 18px', fontWeight: 700,
                display: 'inline-flex', alignItems: 'center', gap: '6px',
                background: '#059669', color: '#ffffff'
              }}
            >
              <Navigation size={14} className={isLocating ? 'animate-spin' : ''} />
              <span>{isLocating ? 'Detecting GPS...' : 'Detect GPS Location'}</span>
            </button>

            {/* Quick Patiala Area Selector */}
            <div style={{ position: 'relative' }}>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => setShowDropdown(!showDropdown)}
                style={{
                  borderRadius: '9999px', padding: '8px 16px', fontWeight: 600,
                  display: 'inline-flex', alignItems: 'center', gap: '6px',
                  borderColor: '#059669', color: '#059669', background: '#ffffff'
                }}
              >
                <span>Select Patiala Area</span>
                <ChevronDown size={14} />
              </button>

              {showDropdown && (
                <div 
                  className="card"
                  style={{
                    position: 'absolute', top: '100%', right: 0, marginTop: '8px',
                    width: '280px', maxHeight: '280px', overflowY: 'auto',
                    background: '#ffffff', border: '1px solid #e2e8f0',
                    borderRadius: '14px', zIndex: 100, padding: '6px',
                    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)'
                  }}
                >
                  <div style={{ fontSize: '11px', fontWeight: 700, color: '#059669', padding: '6px 10px', textTransform: 'uppercase' }}>
                    Popular Patiala Areas
                  </div>
                  {PATIALA_AREAS.map(area => (
                    <div
                      key={area.id}
                      onClick={() => {
                        setAreaLocation(area.id);
                        setShowDropdown(false);
                      }}
                      style={{
                        padding: '8px 12px', borderRadius: '8px', cursor: 'pointer',
                        fontSize: '13px', color: '#1e293b', display: 'flex',
                        alignItems: 'center', justifyContent: 'space-between',
                        background: 'transparent'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = '#f0fdf4'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                      <span>{area.name}</span>
                      <span style={{ fontSize: '11px', color: '#059669' }}>Patiala</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* Active Location Bar */
        <div
          style={{
            background: '#f0fdf4',
            border: '1px solid #bbf7d0',
            borderRadius: '14px',
            padding: '10px 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '10px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '28px', height: '28px', borderRadius: '8px',
              background: '#059669', color: '#ffffff',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <MapPin size={16} />
            </div>
            <div style={{ fontSize: '13px', color: '#1e293b' }}>
              <span style={{ color: '#64748b' }}>Your Location: </span>
              <strong style={{ color: '#064e3b' }}>{userLocation.name}</strong>
              <span style={{ fontSize: '11px', color: '#059669', marginLeft: '8px', fontWeight: 600 }}>
                ✓ Distances Calculated
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', position: 'relative' }}>
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={() => setShowDropdown(!showDropdown)}
              style={{
                fontSize: '12px', fontWeight: 600, color: '#059669',
                padding: '4px 10px', borderRadius: '9999px',
                display: 'inline-flex', alignItems: 'center', gap: '4px',
                background: '#ffffff', border: '1px solid #a7f3d0'
              }}
            >
              <span>Change Area</span>
              <ChevronDown size={13} />
            </button>

            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={requestGpsLocation}
              title="Refresh GPS location"
              style={{
                fontSize: '12px', color: '#059669',
                padding: '4px 8px', borderRadius: '9999px',
                background: '#ffffff', border: '1px solid #a7f3d0'
              }}
            >
              <Navigation size={13} className={isLocating ? 'animate-spin' : ''} />
            </button>

            {showDropdown && (
              <div 
                className="card"
                style={{
                  position: 'absolute', top: '100%', right: 0, marginTop: '8px',
                  width: '280px', maxHeight: '280px', overflowY: 'auto',
                  background: '#ffffff', border: '1px solid #e2e8f0',
                  borderRadius: '14px', zIndex: 100, padding: '6px',
                  boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)'
                }}
              >
                <div style={{ fontSize: '11px', fontWeight: 700, color: '#059669', padding: '6px 10px', textTransform: 'uppercase' }}>
                  Choose Your Patiala Area
                </div>
                {PATIALA_AREAS.map(area => (
                  <div
                    key={area.id}
                    onClick={() => {
                      setAreaLocation(area.id);
                      setShowDropdown(false);
                    }}
                    style={{
                      padding: '8px 12px', borderRadius: '8px', cursor: 'pointer',
                      fontSize: '13px', color: '#1e293b', display: 'flex',
                      alignItems: 'center', justifyContent: 'space-between',
                      background: userLocation.name.includes(area.name.split(',')[0]) ? '#ecfdf5' : 'transparent'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#f0fdf4'}
                    onMouseLeave={(e) => e.currentTarget.style.background = userLocation.name.includes(area.name.split(',')[0]) ? '#ecfdf5' : 'transparent'}
                  >
                    <span>{area.name}</span>
                    {userLocation.name.includes(area.name.split(',')[0]) && <Check size={14} style={{ color: '#059669' }} />}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {locationError && (
        <div style={{ fontSize: '11px', color: '#f59e0b', marginTop: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
          <AlertCircle size={13} /> {locationError}
        </div>
      )}
    </div>
  );
}
