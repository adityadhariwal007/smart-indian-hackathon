import { useState } from 'react';
import { Settings, Building2, Bell, Shield, Database, Save, CheckCircle2 } from 'lucide-react';
import hospitals from '../../data/hospitals';

export default function AdminSettings() {
  const currentHospital = hospitals[0];
  const [saved, setSaved] = useState(false);

  const [config, setConfig] = useState({
    hospitalName: currentHospital.name,
    emergencyPhone: currentHospital.emergency_phone || '102 / 011-23344556',
    address: currentHospital.address || 'Ansari Nagar, New Delhi',
    tokenPacingMins: 12,
    maxDailyTokens: 800,
    autoPrioritizeUrgent: true,
    sensorRefreshSeconds: 15,
    publicCrowdFeedEnabled: true,
  });

  const handleSave = (e) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Settings size={26} style={{ color: 'var(--primary)' }} />
            Hospital Administration & Network Settings
          </h2>
          <p className="text-secondary text-sm">
            Configure hospital metadata, queue pacing algorithms, and sensor telemetry
          </p>
        </div>

        <button className="btn btn-primary btn-sm flex items-center gap-2" onClick={handleSave}>
          <Save size={16} /> Save Settings
        </button>
      </div>

      {saved && (
        <div className="p-3 bg-success-light text-success rounded-lg flex items-center gap-2 text-sm border border-success">
          <CheckCircle2 size={18} />
          Hospital parameters updated and synchronized with the regional HealthFlow mesh.
        </div>
      )}

      {/* Settings Sections */}
      <div className="card p-5 space-y-4">
        <h3 className="font-bold text-base border-b pb-2 flex items-center gap-2">
          <Building2 size={18} style={{ color: 'var(--primary)' }} />
          Facility Profile & Emergency Helplines
        </h3>

        <div className="grid md:grid-cols-2 gap-4 text-sm">
          <div>
            <label className="text-xs text-secondary font-medium block mb-1">Facility Name</label>
            <input
              type="text"
              className="input w-full"
              value={config.hospitalName}
              onChange={(e) => setConfig({ ...config, hospitalName: e.target.value })}
            />
          </div>

          <div>
            <label className="text-xs text-secondary font-medium block mb-1">Emergency Dispatch Hotline</label>
            <input
              type="text"
              className="input w-full"
              value={config.emergencyPhone}
              onChange={(e) => setConfig({ ...config, emergencyPhone: e.target.value })}
            />
          </div>

          <div className="md:col-span-2">
            <label className="text-xs text-secondary font-medium block mb-1">Full Campus Address</label>
            <input
              type="text"
              className="input w-full"
              value={config.address}
              onChange={(e) => setConfig({ ...config, address: e.target.value })}
            />
          </div>
        </div>
      </div>

      <div className="card p-5 space-y-4">
        <h3 className="font-bold text-base border-b pb-2 flex items-center gap-2">
          <Shield size={18} style={{ color: 'var(--primary)' }} />
          Queue Simulation & Token Automation
        </h3>

        <div className="grid md:grid-cols-2 gap-4 text-sm">
          <div>
            <label className="text-xs text-secondary font-medium block mb-1">Default Consultation Pacing</label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                className="input w-full"
                value={config.tokenPacingMins}
                onChange={(e) => setConfig({ ...config, tokenPacingMins: Number(e.target.value) })}
              />
              <span className="text-xs text-secondary">minutes / token</span>
            </div>
          </div>

          <div>
            <label className="text-xs text-secondary font-medium block mb-1">Max Daily Token Cap</label>
            <input
              type="number"
              className="input w-full"
              value={config.maxDailyTokens}
              onChange={(e) => setConfig({ ...config, maxDailyTokens: Number(e.target.value) })}
            />
          </div>

          <div className="flex items-center gap-3 pt-2">
            <input
              type="checkbox"
              id="autoUrgent"
              checked={config.autoPrioritizeUrgent}
              onChange={(e) => setConfig({ ...config, autoPrioritizeUrgent: e.target.checked })}
              className="w-4 h-4 accent-primary"
            />
            <label htmlFor="autoUrgent" className="text-xs font-medium cursor-pointer">
              Auto-triage urgent cases to top of queue based on symptom scoring
            </label>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <input
              type="checkbox"
              id="publicFeed"
              checked={config.publicCrowdFeedEnabled}
              onChange={(e) => setConfig({ ...config, publicCrowdFeedEnabled: e.target.checked })}
              className="w-4 h-4 accent-primary"
            />
            <label htmlFor="publicFeed" className="text-xs font-medium cursor-pointer">
              Publish live crowd density index to public patient app & city maps
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
