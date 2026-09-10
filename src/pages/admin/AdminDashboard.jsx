import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Shield, Users, Activity, Stethoscope, Clock,
  Building2, ChevronRight, CheckCircle2, ArrowRight
} from 'lucide-react';
import hospitals from '../../data/hospitals';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const currentHospital = hospitals[0]; // GMC Rajindra Hospital, Patiala

  const metrics = [
    { label: 'OPD Patients Today', value: '1,428', icon: Users, change: '+12% from yesterday' },
    { label: 'Bed Occupancy', value: '74%', icon: Activity, change: '333 / 450 beds occupied' },
    { label: 'Doctors on Duty', value: '42 / 48', icon: Stethoscope, change: '6 on leave' },
    { label: 'Avg. Wait Time', value: '32 min', icon: Clock, change: 'Optimal flow' },
  ];

  const departmentsSummary = [
    { name: 'General Medicine', activeDoctors: 8, waitTime: '25 min', status: 'Normal', badgeClass: 'badge-success' },
    { name: 'Orthopedics', activeDoctors: 5, waitTime: '45 min', status: 'Moderate', badgeClass: 'badge-warning' },
    { name: 'Cardiology', activeDoctors: 6, waitTime: '30 min', status: 'Normal', badgeClass: 'badge-success' },
    { name: 'Pediatrics', activeDoctors: 4, waitTime: '20 min', status: 'Normal', badgeClass: 'badge-success' },
    { name: 'Emergency & Trauma', activeDoctors: 7, waitTime: '10 min', status: 'Priority', badgeClass: 'badge-primary' },
  ];

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-wrap justify-between items-center gap-4 bg-white p-5 rounded-2xl border border-border shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-text-primary flex items-center gap-2">
              <Shield size={24} className="text-primary" />
              Hospital Administration
            </h1>
            <span className="badge badge-success text-xs font-semibold">Live</span>
          </div>
          <p className="text-secondary text-sm mt-1">
            {currentHospital?.name || 'GMC Rajindra Hospital'} • {currentHospital?.city || 'Patiala'} • Total Beds: {currentHospital?.beds || currentHospital?.total_beds || 1100}
          </p>
        </div>

        <div className="flex gap-2">
          <button
            className="btn btn-primary btn-sm flex items-center gap-1.5"
            onClick={() => navigate('/admin/departments')}
          >
            <Building2 size={16} /> Manage Departments
          </button>
        </div>
      </div>

      {/* 4 Clean Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((m, idx) => (
          <div key={idx} className="card p-5 bg-white border border-border rounded-2xl shadow-xs space-y-2">
            <div className="flex justify-between items-center text-secondary">
              <span className="text-xs font-medium uppercase tracking-wider">{m.label}</span>
              <m.icon size={18} className="text-primary" />
            </div>
            <div className="text-3xl font-extrabold text-text-primary">{m.value}</div>
            <div className="text-xs text-secondary font-medium">{m.change}</div>
          </div>
        ))}
      </div>

      {/* Main Clean Department Overview */}
      <div className="card p-6 bg-white border border-border rounded-2xl shadow-xs space-y-4">
        <div className="flex justify-between items-center pb-2 border-b border-border">
          <div>
            <h2 className="text-lg font-bold text-text-primary flex items-center gap-2">
              <Building2 size={20} className="text-primary" />
              Department Status
            </h2>
            <p className="text-xs text-secondary mt-0.5">Overview of active outpatient counters and wait times</p>
          </div>
          <button
            className="btn btn-ghost btn-sm text-primary flex items-center gap-1 font-medium"
            onClick={() => navigate('/admin/departments')}
          >
            View All <ChevronRight size={16} />
          </button>
        </div>

        <div className="divide-y divide-border">
          {departmentsSummary.map((dept, i) => (
            <div key={i} className="py-3.5 flex flex-wrap justify-between items-center gap-3">
              <div>
                <div className="font-semibold text-text-primary text-sm">{dept.name}</div>
                <div className="text-xs text-secondary">{dept.activeDoctors} doctors on duty</div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="text-xs text-secondary">Wait Time</div>
                  <div className="text-sm font-semibold text-text-primary">{dept.waitTime}</div>
                </div>
                <span className={`badge ${dept.badgeClass} text-xs px-2.5 py-1`}>
                  {dept.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Access Navigation */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div
          onClick={() => navigate('/admin/departments')}
          className="card p-4 bg-white border border-border rounded-xl cursor-pointer hover:border-primary hover:shadow-xs transition flex items-center justify-between"
        >
          <div>
            <div className="font-semibold text-sm text-text-primary">Departments</div>
            <div className="text-xs text-secondary">Adjust counters & capacities</div>
          </div>
          <ArrowRight size={18} className="text-secondary" />
        </div>

        <div
          onClick={() => navigate('/admin/doctors')}
          className="card p-4 bg-white border border-border rounded-xl cursor-pointer hover:border-primary hover:shadow-xs transition flex items-center justify-between"
        >
          <div>
            <div className="font-semibold text-sm text-text-primary">Doctor Roster</div>
            <div className="text-xs text-secondary">Manage on-duty medical staff</div>
          </div>
          <ArrowRight size={18} className="text-secondary" />
        </div>

        <div
          onClick={() => navigate('/admin/analytics')}
          className="card p-4 bg-white border border-border rounded-xl cursor-pointer hover:border-primary hover:shadow-xs transition flex items-center justify-between"
        >
          <div>
            <div className="font-semibold text-sm text-text-primary">Hospital Analytics</div>
            <div className="text-xs text-secondary">Footfall and performance reports</div>
          </div>
          <ArrowRight size={18} className="text-secondary" />
        </div>
      </div>
    </div>
  );
}
