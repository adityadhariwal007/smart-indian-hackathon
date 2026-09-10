import { useState } from 'react';
import { Truck, Phone, MapPin, AlertCircle, CheckCircle2, Search, Filter } from 'lucide-react';
import ambulancesData from '../../data/ambulances';

export default function AdminAmbulances() {
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [fleet, setFleet] = useState(
    ambulancesData.map((amb, idx) => ({
      ...amb,
      status: idx % 4 === 0 ? 'Dispatched' : idx % 7 === 0 ? 'Maintenance' : 'Available',
      driver: `Driver ${['Sanjay', 'Rajesh', 'Vikram', 'Anil', 'Manoj'][idx % 5]} Kumar`,
      phone: `+91-98765-${10000 + idx}`,
      eta: idx % 4 === 0 ? `${(idx % 12) + 4} min` : 'Standby',
    }))
  );

  const toggleDispatch = (id) => {
    setFleet(prev => prev.map(a => {
      if (a.id === id) {
        const nextStatus = a.status === 'Available' ? 'Dispatched' : 'Available';
        return {
          ...a,
          status: nextStatus,
          eta: nextStatus === 'Dispatched' ? '12 min' : 'Standby'
        };
      }
      return a;
    }));
  };

  const filtered = fleet.filter(a => {
    const matchesSearch = (a.code || '').toLowerCase().includes(search.toLowerCase()) ||
      (a.driver || '').toLowerCase().includes(search.toLowerCase()) ||
      (a.type && a.type.toLowerCase().includes(search.toLowerCase()));
    const matchesFilter = filter === 'All' || a.status === filter || a.type === filter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Truck size={26} style={{ color: 'var(--primary)' }} />
            Emergency Ambulance Fleet Command
          </h2>
          <p className="text-secondary text-sm">
            Live telematics, GPS coordinates, vehicle capabilities, and emergency dispatch status
          </p>
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            className="input text-xs py-1.5 w-52"
            placeholder="Search code or driver..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Fleet KPI */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card p-4">
          <span className="text-xs text-secondary font-medium">Total Fleet Size</span>
          <div className="text-2xl font-bold">{fleet.length} Units</div>
        </div>
        <div className="card p-4">
          <span className="text-xs text-secondary font-medium">Available on Standby</span>
          <div className="text-2xl font-bold text-success">
            {fleet.filter(f => f.status === 'Available').length}
          </div>
        </div>
        <div className="card p-4">
          <span className="text-xs text-secondary font-medium">Dispatched / En Route</span>
          <div className="text-2xl font-bold text-warning">
            {fleet.filter(f => f.status === 'Dispatched').length}
          </div>
        </div>
        <div className="card p-4">
          <span className="text-xs text-secondary font-medium">In Maintenance</span>
          <div className="text-2xl font-bold text-secondary">
            {fleet.filter(f => f.status === 'Maintenance').length}
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 border-b pb-2">
        {['All', 'Available', 'Dispatched', 'ALS', 'BLS'].map(tab => (
          <button
            key={tab}
            className={`btn btn-sm ${filter === tab ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setFilter(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Ambulance Cards Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(amb => (
          <div key={amb.id} className="card p-4 space-y-3">
            <div className="flex justify-between items-start">
              <div>
                <span className="font-mono font-bold text-base text-primary">{amb.code}</span>
                <span className="badge badge-neutral text-xs ml-2">{amb.type}</span>
              </div>
              <span
                className={`badge ${
                  amb.status === 'Available'
                    ? 'badge-success'
                    : amb.status === 'Dispatched'
                    ? 'badge-warning'
                    : 'badge-neutral'
                } text-xs`}
              >
                {amb.status}
              </span>
            </div>

            <div className="space-y-1.5 text-xs text-secondary">
              <div className="flex items-center gap-1.5">
                <span className="font-medium text-foreground">Driver:</span> {amb.driver}
              </div>
              <div className="flex items-center gap-1.5">
                <Phone size={12} /> {amb.phone}
              </div>
              <div className="flex items-center gap-1.5">
                <MapPin size={12} /> Station: Base Station #{((amb.id % 5) + 1)}
              </div>
              <div className="font-semibold text-primary">
                ETA Status: {amb.eta}
              </div>
            </div>

            <div className="pt-2 border-t flex justify-end">
              {amb.status !== 'Maintenance' && (
                <button
                  className={`btn btn-xs ${amb.status === 'Available' ? 'btn-primary' : 'btn-ghost text-danger border'}`}
                  onClick={() => toggleDispatch(amb.id)}
                >
                  {amb.status === 'Available' ? '🚨 Rapid Dispatch' : 'Recall to Base'}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
