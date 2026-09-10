import { useState, useEffect } from 'react';
import { Activity, Users, AlertTriangle, RefreshCw, Filter, ShieldAlert, ArrowRight } from 'lucide-react';
import departments from '../../data/departments';

const initialZones = [
  { id: 'z1', name: 'Ground Floor Main OPD Reception', type: 'Reception', capacity: 150, current: 128, trend: '+8/10m', alert: true },
  { id: 'z2', name: 'Zone B: Orthopedics & Trauma Waiting', type: 'OPD Hall', capacity: 80, current: 78, trend: '+14/10m', alert: true },
  { id: 'z3', name: 'Emergency & Trauma Triage Bay', type: 'Emergency', capacity: 40, current: 28, trend: '+2/10m', alert: false },
  { id: 'z4', name: 'Zone A: Cardiology & Pulmonology Waiting', type: 'OPD Hall', capacity: 70, current: 48, trend: '-3/10m', alert: false },
  { id: 'z5', name: 'Central Diagnostic Imaging & Radiology', type: 'Diagnostics', capacity: 60, current: 42, trend: '+1/10m', alert: false },
  { id: 'z6', name: 'Main OPD Pharmacy & Medicine Dispensation', type: 'Pharmacy', capacity: 90, current: 82, trend: '+9/10m', alert: true },
  { id: 'z7', name: 'Pediatrics & Neonatal Care Hall', type: 'OPD Hall', capacity: 65, current: 36, trend: '-4/10m', alert: false },
  { id: 'z8', name: 'Inpatient Admissions & Billing Counter', type: 'Billing', capacity: 50, current: 22, trend: '-1/10m', alert: false },
];

export default function LiveCrowd() {
  const [zones, setZones] = useState(initialZones);
  const [filter, setFilter] = useState('all');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const simulateUpdate = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setZones(prev => prev.map(z => {
        const delta = Math.floor(Math.random() * 7) - 3;
        const newCount = Math.max(10, Math.min(z.capacity, z.current + delta));
        return {
          ...z,
          current: newCount,
          alert: (newCount / z.capacity) > 0.85
        };
      }));
      setIsRefreshing(false);
    }, 600);
  };

  const filtered = zones.filter(z => {
    if (filter === 'alert') return z.alert;
    if (filter === 'opd') return z.type === 'OPD Hall';
    return true;
  });

  const getCrowdBadge = (current, capacity) => {
    const ratio = current / capacity;
    if (ratio >= 0.9) return <span className="badge badge-danger">Critical ({(ratio * 100).toFixed(0)}%)</span>;
    if (ratio >= 0.75) return <span className="badge badge-warning">High ({(ratio * 100).toFixed(0)}%)</span>;
    if (ratio >= 0.5) return <span className="badge badge-info">Moderate ({(ratio * 100).toFixed(0)}%)</span>;
    return <span className="badge badge-success">Low ({(ratio * 100).toFixed(0)}%)</span>;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Activity size={26} style={{ color: 'var(--primary)' }} />
            Live Hospital Zone Crowd Density Monitor
          </h2>
          <p className="text-secondary text-sm">
            Simulated optical sensor & token check-in density across hospital physical sectors
          </p>
        </div>

        <div className="flex gap-2">
          <button
            className={`btn btn-secondary btn-sm flex items-center gap-1.5 ${isRefreshing ? 'opacity-50' : ''}`}
            onClick={simulateUpdate}
          >
            <RefreshCw size={14} className={isRefreshing ? 'animate-spin' : ''} />
            Refresh Density Sensors
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2">
        {['all', 'alert', 'opd'].map(f => (
          <button
            key={f}
            className={`btn btn-sm ${filter === f ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setFilter(f)}
          >
            {f === 'all' ? 'All Zones' : f === 'alert' ? '🚨 Congested Zones' : 'OPD Waiting Halls'}
          </button>
        ))}
      </div>

      {/* Zones Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        {filtered.map(zone => {
          const pct = Math.round((zone.current / zone.capacity) * 100);
          const isCritical = pct >= 90;
          const isHigh = pct >= 75 && pct < 90;

          return (
            <div
              key={zone.id}
              className={`card p-4 space-y-3 transition border-2 ${
                isCritical
                  ? 'border-rose-500 bg-rose-50/20'
                  : isHigh
                  ? 'border-amber-400 bg-amber-50/20'
                  : 'border-border'
              }`}
            >
              <div className="flex justify-between items-start">
                <span className="badge badge-neutral text-[11px]">{zone.type}</span>
                {getCrowdBadge(zone.current, zone.capacity)}
              </div>

              <div>
                <h4 className="font-bold text-sm leading-snug">{zone.name}</h4>
                <div className="text-xs text-secondary mt-1">Throughput: {zone.trend}</div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-xs font-semibold">
                  <span>Occupancy</span>
                  <span>{zone.current} / {zone.capacity} Persons</span>
                </div>
                <div className="w-full bg-bg-secondary rounded-full h-2 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${pct}%`,
                      backgroundColor: isCritical ? '#EF4444' : isHigh ? '#F59E0B' : '#10B981'
                    }}
                  ></div>
                </div>
              </div>

              {zone.alert && (
                <div className="p-2 rounded bg-rose-100 dark:bg-rose-950/40 text-danger text-xs font-medium flex items-center gap-1.5">
                  <AlertTriangle size={13} />
                  <span>Crowd threshold exceeded. Consider queue diversion.</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
