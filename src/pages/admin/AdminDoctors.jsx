import { useState } from 'react';
import { Stethoscope, Search, CheckCircle2, UserX } from 'lucide-react';
import doctorsData from '../../data/doctors';

export default function AdminDoctors() {
  const [search, setSearch] = useState('');
  const [selectedDept, setSelectedDept] = useState('All');

  const [doctorsList, setDoctorsList] = useState(
    doctorsData.map((doc, idx) => ({
      ...doc,
      onDuty: idx % 6 !== 0,
      chamber: `Room ${100 + (idx % 20) + 1}`,
      dutyStatus: idx % 6 === 0 ? 'Off Duty' : 'On Duty'
    }))
  );

  const toggleDuty = (id) => {
    setDoctorsList(prev => prev.map(d => {
      if (d.id === id) {
        const nextOnDuty = !d.onDuty;
        return {
          ...d,
          onDuty: nextOnDuty,
          dutyStatus: nextOnDuty ? 'On Duty' : 'Off Duty'
        };
      }
      return d;
    }));
  };

  const departments = ['All', ...new Set(doctorsData.map(d => d.specialization || d.department).filter(Boolean))];

  const filtered = doctorsList.filter(d => {
    const matchesSearch = d.name.toLowerCase().includes(search.toLowerCase()) ||
      (d.specialization && d.specialization.toLowerCase().includes(search.toLowerCase()));
    const matchesDept = selectedDept === 'All' || d.specialization === selectedDept || d.department === selectedDept;
    return matchesSearch && matchesDept;
  });

  const onDutyCount = doctorsList.filter(d => d.onDuty).length;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-wrap justify-between items-center gap-4 bg-white p-5 rounded-2xl border border-border shadow-xs">
        <div>
          <h1 className="text-2xl font-bold text-text-primary flex items-center gap-2">
            <Stethoscope size={24} className="text-primary" />
            Doctor Staff Roster
          </h1>
          <p className="text-secondary text-sm mt-0.5">
            Manage physician duty status and room assignments
          </p>
        </div>

        <div className="flex gap-2 flex-wrap">
          <select
            className="input text-xs py-2 bg-white"
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
          >
            {departments.slice(0, 8).map(d => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>

          <div className="relative">
            <Search size={16} className="absolute left-3 top-3 text-secondary" />
            <input
              type="text"
              className="input text-xs py-2 pl-9 w-52"
              placeholder="Search doctor..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* 3 Clean Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card p-4 bg-white border border-border rounded-xl shadow-xs">
          <span className="text-xs text-secondary font-medium">Total Physicians</span>
          <div className="text-2xl font-bold text-text-primary mt-1">{doctorsList.length}</div>
        </div>
        <div className="card p-4 bg-white border border-border rounded-xl shadow-xs">
          <span className="text-xs text-secondary font-medium">On Duty Now</span>
          <div className="text-2xl font-bold text-primary mt-1">{onDutyCount}</div>
        </div>
        <div className="card p-4 bg-white border border-border rounded-xl shadow-xs">
          <span className="text-xs text-secondary font-medium">Off Duty / Leave</span>
          <div className="text-2xl font-bold text-secondary mt-1">{doctorsList.length - onDutyCount}</div>
        </div>
      </div>

      {/* Simplified Doctor Roster Table */}
      <div className="card p-5 bg-white border border-border rounded-2xl shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border text-secondary text-xs uppercase tracking-wider">
                <th className="pb-3 font-semibold">Doctor Name</th>
                <th className="pb-3 font-semibold">Specialization</th>
                <th className="pb-3 font-semibold">Chamber</th>
                <th className="pb-3 font-semibold">Status</th>
                <th className="pb-3 font-semibold text-right">Duty Toggle</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.slice(0, 20).map(doctor => (
                <tr key={doctor.id} className="hover:bg-bg-secondary/40 transition">
                  <td className="py-3 font-medium text-text-primary">{doctor.name}</td>
                  <td className="py-3 text-secondary text-xs">{doctor.specialization}</td>
                  <td className="py-3 text-xs text-secondary font-mono">{doctor.chamber}</td>
                  <td className="py-3">
                    <span
                      className={`badge text-xs px-2.5 py-0.5 ${
                        doctor.onDuty ? 'badge-success' : 'badge-neutral'
                      }`}
                    >
                      {doctor.dutyStatus}
                    </span>
                  </td>
                  <td className="py-3 text-right">
                    <button
                      className={`btn btn-xs ${doctor.onDuty ? 'btn-ghost text-secondary border border-border' : 'btn-primary'}`}
                      onClick={() => toggleDuty(doctor.id)}
                    >
                      {doctor.onDuty ? 'Set Off Duty' : 'Set On Duty'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
