import { useState } from 'react';
import { Building2, Search, Plus, Minus } from 'lucide-react';
import departments from '../../data/departments';

export default function AdminDepartments() {
  const [search, setSearch] = useState('');

  const [deptList, setDeptList] = useState(
    departments.map((d, i) => {
      const doctors = (i % 4) + 3;
      const counters = Math.min(doctors, (i % 3) + 2);
      const queue = (i * 5 + 8) % 35 + 4;
      const wait = (queue * 2.5).toFixed(0);
      return {
        ...d,
        doctors,
        counters,
        queue,
        wait,
        status: queue > 25 ? 'High Demand' : queue > 15 ? 'Moderate' : 'Normal'
      };
    })
  );

  const adjustCounter = (id, delta) => {
    setDeptList(prev => prev.map(d => {
      if (d.id === id) {
        return { ...d, counters: Math.max(1, Math.min(10, d.counters + delta)) };
      }
      return d;
    }));
  };

  const filtered = deptList.filter(d =>
    d.name.toLowerCase().includes(search.toLowerCase()) ||
    (d.description && d.description.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-wrap justify-between items-center gap-4 bg-white p-5 rounded-2xl border border-border shadow-xs">
        <div>
          <h1 className="text-2xl font-bold text-text-primary flex items-center gap-2">
            <Building2 size={24} className="text-primary" />
            Hospital Departments
          </h1>
          <p className="text-secondary text-sm mt-0.5">
            Manage active consultation counters and patient flow
          </p>
        </div>

        <div className="w-64">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-3 text-secondary" />
            <input
              type="text"
              className="input w-full pl-9 text-sm"
              placeholder="Search department..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Clean Department Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(dept => (
          <div
            key={dept.id}
            className="card p-5 bg-white border border-border rounded-2xl shadow-xs space-y-4 hover:border-primary/40 transition"
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-bold text-base text-text-primary">{dept.name}</h3>
                <p className="text-xs text-secondary mt-0.5 line-clamp-1">{dept.description || 'Outpatient specialty'}</p>
              </div>
              <span className={`badge text-xs px-2 py-0.5 ${
                dept.status === 'High Demand'
                  ? 'badge-warning'
                  : 'badge-success'
              }`}>
                {dept.status}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 py-2 px-3 bg-bg-secondary rounded-xl text-center text-xs">
              <div>
                <span className="text-secondary block">Doctors</span>
                <span className="font-bold text-text-primary text-sm">{dept.doctors}</span>
              </div>
              <div>
                <span className="text-secondary block">Queue</span>
                <span className="font-bold text-text-primary text-sm">{dept.queue}</span>
              </div>
              <div>
                <span className="text-secondary block">Wait</span>
                <span className="font-bold text-text-primary text-sm">{dept.wait}m</span>
              </div>
            </div>

            <div className="flex justify-between items-center pt-2 border-t border-border">
              <span className="text-xs text-secondary font-medium">
                Active Counters: <strong className="text-primary text-sm">{dept.counters}</strong>
              </span>

              <div className="flex items-center gap-1">
                <button
                  className="w-7 h-7 rounded-lg border border-border flex items-center justify-center hover:bg-bg-secondary text-secondary"
                  onClick={() => adjustCounter(dept.id, -1)}
                  disabled={dept.counters <= 1}
                >
                  <Minus size={14} />
                </button>
                <button
                  className="w-7 h-7 rounded-lg bg-emerald-50 border border-emerald-200 text-primary flex items-center justify-center hover:bg-emerald-100"
                  onClick={() => adjustCounter(dept.id, 1)}
                >
                  <Plus size={14} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
