import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { useNavigate } from 'react-router-dom';
import { Clock, Users, ArrowRight } from 'lucide-react';
import hospitals, { getCrowdLabel, getCrowdColor } from '../../data/hospitals';
import { getDoctorsByHospital } from '../../data/doctors';
import 'leaflet/dist/leaflet.css';

export default function MapView() {
  const navigate = useNavigate();
  const center = [28.6139, 77.2090];

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <h1>Hospital Map</h1>
        <p>View nearby hospitals, crowd levels, and ambulance locations.</p>
      </div>
      <div style={{ borderRadius: 'var(--radius-lg)', overflow: 'hidden', height: '600px', border: '1px solid var(--border)' }}>
        <MapContainer center={center} zoom={11} style={{ height: '100%', width: '100%' }} scrollWheelZoom={true}>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; OpenStreetMap' />
          <Marker position={center}>
            <Popup><strong>📍 Your Location</strong></Popup>
          </Marker>
          {hospitals.map(h => {
            const docs = getDoctorsByHospital(h.id).filter(d => d.available_today).length;
            return (
              <Marker key={h.id} position={[h.latitude, h.longitude]}>
                <Popup>
                  <div style={{ minWidth: '200px' }}>
                    <strong>{h.name}</strong>
                    <div style={{ fontSize: '12px', color: '#666', margin: '4px 0' }}>{h.type}</div>
                    <div style={{ display: 'flex', gap: '8px', fontSize: '12px', margin: '8px 0' }}>
                      <span>{getCrowdLabel(h.crowdLevel)} ({h.crowdLevel}%)</span>
                      <span>~{h.waitTime} min</span>
                    </div>
                    <div style={{ fontSize: '12px', marginBottom: '8px' }}>{docs} doctors available</div>
                    <button
                      style={{ background: '#0891B2', color: 'white', border: 'none', padding: '4px 12px', borderRadius: '6px', fontSize: '12px', cursor: 'pointer' }}
                      onClick={() => navigate(`/patient/hospitals/${h.id}`)}
                    >
                      View Hospital →
                    </button>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      </div>
      <div className="disclaimer mt-4">
        <span>ⓘ</span>
        Map shows fictional hospital locations for demonstration purposes. Actual locations may differ.
      </div>
    </div>
  );
}
