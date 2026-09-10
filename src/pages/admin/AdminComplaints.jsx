import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, Search, Filter, ArrowUpDown, Eye, 
  CheckCircle2, Clock, AlertTriangle, Building2, User, 
  RefreshCw, Check, ArrowRight, FileText 
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { 
  queryComplaints, 
  COMPLAINT_CATEGORIES, 
  COMPLAINT_STATUSES, 
  STATUS_COLORS 
} from '../../services/complaintService';
import hospitals from '../../data/hospitals';
import AdminComplaintDrawer from '../../components/complaints/AdminComplaintDrawer';
import '../../components/complaints/Complaints.css';

export default function AdminComplaints() {
  const { user } = useAuth();

  const [complaints, setComplaints] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [hospitalFilter, setHospitalFilter] = useState('All');
  const [sortBy, setSortBy] = useState('newest');
  const [selectedComplaint, setSelectedComplaint] = useState(null);

  const loadData = () => {
    const list = queryComplaints({
      user: null, // Admin sees all complaints across all hospitals
      status: statusFilter,
      category: categoryFilter,
      hospitalName: hospitalFilter,
      search: searchQuery,
      sortBy,
    });
    setComplaints(list);
  };

  useEffect(() => {
    loadData();
    const handleSync = () => loadData();
    window.addEventListener('healthflow:complaints_updated', handleSync);
    window.addEventListener('storage', handleSync);
    return () => {
      window.removeEventListener('healthflow:complaints_updated', handleSync);
      window.removeEventListener('storage', handleSync);
    };
  }, [statusFilter, categoryFilter, hospitalFilter, searchQuery, sortBy]);

  // High-level Operations Metrics
  const allList = queryComplaints({ user: null });
  const totalFiled = allList.length;
  const pendingReview = allList.filter(c => c.status === 'Submitted' || c.status === 'Under Review').length;
  const inProgress = allList.filter(c => c.status === 'Assigned' || c.status === 'In Progress').length;
  const resolved = allList.filter(c => c.status === 'Resolved' || c.status === 'Closed').length;
  const resolutionRate = totalFiled > 0 ? Math.round((resolved / totalFiled) * 100) : 100;

  return (
    <div className="complaints-container">
      {/* Header */}
      <div className="complaints-header flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="complaints-header-badge" style={{ background: '#fef3c7', color: '#92400e', borderColor: '#fde68a' }}>
            <ShieldAlert size={13} />
            <span>Administrative Operations Command</span>
          </div>
          <h1 className="complaints-title">
            Grievance & Clinical Complaint Management
          </h1>
          <p className="complaints-subtitle">
            Centralized grievance redressal command center across 20 Patiala hospitals. Assign clinical investigations, audit waiting times, log internal administrative notes, and publish official citizen resolutions.
          </p>
        </div>

        <button
          type="button"
          onClick={loadData}
          className="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition flex items-center gap-2 text-xs font-bold"
          title="Refresh Data"
        >
          <RefreshCw size={14} />
          <span>Refresh Feed</span>
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
            Total Filed
          </span>
          <div className="text-2xl font-black text-slate-900">{totalFiled}</div>
          <span className="text-[11px] text-slate-500 mt-1 block">All Patiala facilities</span>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm">
          <span className="text-[11px] font-bold text-amber-600 uppercase tracking-wider block mb-1">
            Pending Review
          </span>
          <div className="text-2xl font-black text-amber-700">{pendingReview}</div>
          <span className="text-[11px] text-amber-600 mt-1 block">Requires staff triage</span>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm">
          <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wider block mb-1">
            Under Active Investigation
          </span>
          <div className="text-2xl font-black text-blue-700">{inProgress}</div>
          <span className="text-[11px] text-blue-600 mt-1 block">Assigned to floor heads</span>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm">
          <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider block mb-1">
            Resolution Rate
          </span>
          <div className="text-2xl font-black text-emerald-700">{resolutionRate}%</div>
          <span className="text-[11px] text-emerald-600 mt-1 block">{resolved} of {totalFiled} resolved</span>
        </div>
      </div>

      {/* Filters & Search Bar */}
      <div className="complaint-card-box p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-3">
          {/* Search */}
          <div className="complaints-search-input md:col-span-1">
            <Search size={15} className="complaints-search-icon" />
            <input
              type="text"
              placeholder="Search ID, citizen name, subject..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Hospital Filter */}
          <div>
            <select
              className="complaint-select text-xs py-2"
              value={hospitalFilter}
              onChange={(e) => setHospitalFilter(e.target.value)}
            >
              <option value="All">All Hospitals (20 Centers)</option>
              {hospitals.map(h => (
                <option key={h.id} value={h.name}>{h.name}</option>
              ))}
            </select>
          </div>

          {/* Category Filter */}
          <div>
            <select
              className="complaint-select text-xs py-2"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="All">All Categories (12 Types)</option>
              {COMPLAINT_CATEGORIES.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Sort By */}
          <div className="flex items-center gap-2">
            <select
              className="complaint-select text-xs py-2 flex-1"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="newest">Sort: Newest First</option>
              <option value="oldest">Sort: Oldest First</option>
            </select>
          </div>
        </div>

        {/* Status Pills Filter */}
        <div className="flex gap-1.5 overflow-x-auto pt-2 border-t border-slate-100">
          {['All', ...COMPLAINT_STATUSES].map(st => (
            <button
              key={st}
              type="button"
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition whitespace-nowrap ${
                statusFilter === st
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Complaints Management Table */}
      {complaints.length === 0 ? (
        <div className="complaint-card-box text-center py-12">
          <h4 className="text-base font-bold text-slate-800 mb-1">
            No complaints match the filter criteria
          </h4>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Try resetting your status, hospital, or search criteria to view more records.
          </p>
        </div>
      ) : (
        <div className="complaints-table-container bg-white">
          <table className="complaints-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Citizen</th>
                <th>Subject & Category</th>
                <th>Hospital Facility</th>
                <th>Assigned Cell</th>
                <th>Status</th>
                <th>Submitted</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {complaints.map(c => {
                const sCfg = STATUS_COLORS[c.status] || STATUS_COLORS['Submitted'];
                return (
                  <tr key={c.id}>
                    <td className="font-mono font-extrabold text-slate-900 text-xs">
                      {c.publicId}
                    </td>
                    <td>
                      <div className="font-bold text-slate-800 text-xs">{c.fullName}</div>
                      <div className="text-[11px] text-slate-400">{c.phone}</div>
                    </td>
                    <td>
                      <div className="font-bold text-slate-800 max-w-xs truncate text-xs">
                        {c.subject}
                      </div>
                      <span className="text-[11px] text-slate-400 font-medium">
                        {c.category} • {c.department}
                      </span>
                    </td>
                    <td className="text-xs text-slate-700 font-medium max-w-[180px] truncate">
                      {c.hospitalName}
                    </td>
                    <td className="text-xs text-emerald-800 font-semibold max-w-[150px] truncate">
                      {c.assignedDepartment || 'Unassigned'}
                    </td>
                    <td>
                      <span
                        className="complaint-status-pill"
                        style={{
                          background: sCfg.bg,
                          color: sCfg.text,
                          borderColor: sCfg.border
                        }}
                      >
                        <span className="complaint-status-dot" style={{ background: sCfg.dot }} />
                        {c.status}
                      </span>
                    </td>
                    <td className="text-xs text-slate-500 whitespace-nowrap">
                      {new Date(c.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric', month: 'short'
                      })}
                    </td>
                    <td>
                      <button
                        type="button"
                        onClick={() => setSelectedComplaint(c)}
                        className="px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 transition text-xs font-bold flex items-center gap-1.5"
                      >
                        <Eye size={13} />
                        <span>Manage</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Admin Action Drawer */}
      {selectedComplaint && (
        <AdminComplaintDrawer
          complaint={selectedComplaint}
          adminUser={user}
          onClose={() => setSelectedComplaint(null)}
          onUpdated={(updated) => {
            setSelectedComplaint(updated);
            loadData();
          }}
        />
      )}
    </div>
  );
}
