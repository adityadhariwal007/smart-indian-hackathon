import React, { useState, useEffect } from 'react';
import { 
  Search, Eye, Clock, CheckCircle2, AlertCircle, 
  Building2, Calendar, FileText, Filter, LayoutGrid, List 
} from 'lucide-react';
import { 
  queryComplaints, 
  COMPLAINT_STATUSES, 
  STATUS_COLORS 
} from '../../services/complaintService';
import ComplaintDetailModal from './ComplaintDetailModal';

export default function MyComplaintsList({ user, onFileNewComplaint }) {
  const [complaints, setComplaints] = useState([]);
  const [statusFilter, setStatusFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'grid'
  const [selectedComplaint, setSelectedComplaint] = useState(null);

  const loadData = () => {
    const list = queryComplaints({
      user,
      status: statusFilter,
      search: searchQuery,
    });
    setComplaints(list);
  };

  useEffect(() => {
    loadData();

    // Listen for storage / custom events
    const handleSync = () => loadData();
    window.addEventListener('healthflow:complaints_updated', handleSync);
    window.addEventListener('storage', handleSync);
    return () => {
      window.removeEventListener('healthflow:complaints_updated', handleSync);
      window.removeEventListener('storage', handleSync);
    };
  }, [user, statusFilter, searchQuery]);

  // Summary Metrics
  const allUserComplaints = queryComplaints({ user });
  const totalCount = allUserComplaints.length;
  const inProgressCount = allUserComplaints.filter(c => c.status === 'In Progress' || c.status === 'Assigned' || c.status === 'Under Review').length;
  const resolvedCount = allUserComplaints.filter(c => c.status === 'Resolved' || c.status === 'Closed').length;

  return (
    <div className="w-full">
      {/* Stat Counter Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Filed</span>
            <div className="text-2xl font-black text-slate-900 mt-0.5">{totalCount}</div>
          </div>
          <div className="p-3 bg-slate-100 text-slate-700 rounded-xl">
            <FileText size={20} />
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-amber-600 uppercase tracking-wider">Active In-Review</span>
            <div className="text-2xl font-black text-amber-700 mt-0.5">{inProgressCount}</div>
          </div>
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
            <Clock size={20} />
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">Resolved / Closed</span>
            <div className="text-2xl font-black text-emerald-700 mt-0.5">{resolvedCount}</div>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <CheckCircle2 size={20} />
          </div>
        </div>
      </div>

      {/* Toolbar: Search, Status Filter Pills & View Mode */}
      <div className="complaint-card-box p-4 mb-6">
        <div className="complaints-filter-bar">
          <div className="complaints-search-input">
            <Search size={16} className="complaints-search-icon" />
            <input
              type="text"
              placeholder="Search by Complaint ID or Subject..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-2">
            <div className="flex gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200">
              <button
                type="button"
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-md text-xs font-semibold ${viewMode === 'table' ? 'bg-white shadow text-slate-900' : 'text-slate-500'}`}
                title="Table View"
              >
                <List size={16} />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-md text-xs font-semibold ${viewMode === 'grid' ? 'bg-white shadow text-slate-900' : 'text-slate-500'}`}
                title="Grid Cards View"
              >
                <LayoutGrid size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Status Filter Badges */}
        <div className="flex gap-1.5 overflow-x-auto pb-1">
          {['All', ...COMPLAINT_STATUSES].map(st => (
            <button
              key={st}
              type="button"
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition whitespace-nowrap ${
                statusFilter === st
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* COMPLAINTS LISTING */}
      {complaints.length === 0 ? (
        <div className="complaint-card-box text-center py-12">
          <div className="w-14 h-14 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
            <FileText size={26} />
          </div>
          <h4 className="text-base font-bold text-slate-800 mb-1">
            No complaints found
          </h4>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mb-5 leading-relaxed">
            {searchQuery || statusFilter !== 'All' 
              ? 'Try adjusting your search query or status filter criteria.'
              : 'You have not submitted any complaints yet.'}
          </p>
          {onFileNewComplaint && (
            <button
              type="button"
              onClick={onFileNewComplaint}
              className="complaint-submit-btn text-xs py-2 px-4"
            >
              File a Complaint
            </button>
          )}
        </div>
      ) : viewMode === 'table' ? (
        /* TABLE VIEW */
        <div className="complaints-table-container bg-white">
          <table className="complaints-table">
            <thead>
              <tr>
                <th>Complaint ID</th>
                <th>Subject & Category</th>
                <th>Hospital Facility</th>
                <th>Submitted Date</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {complaints.map(c => {
                const sCfg = STATUS_COLORS[c.status] || STATUS_COLORS['Submitted'];
                return (
                  <tr key={c.id}>
                    <td className="font-mono font-bold text-slate-900 text-xs">
                      {c.publicId}
                    </td>
                    <td>
                      <div className="font-bold text-slate-800 max-w-xs truncate text-xs">
                        {c.subject}
                      </div>
                      <span className="text-[11px] text-slate-400 font-medium">
                        {c.category} • {c.department}
                      </span>
                    </td>
                    <td className="text-xs text-slate-700 font-medium">
                      {c.hospitalName}
                    </td>
                    <td className="text-xs text-slate-500">
                      {new Date(c.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric', month: 'short', year: 'numeric'
                      })}
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
                    <td>
                      <button
                        type="button"
                        onClick={() => setSelectedComplaint(c)}
                        className="p-1.5 rounded-lg border border-slate-200 hover:border-emerald-500 hover:text-emerald-700 text-slate-600 transition flex items-center gap-1 text-xs font-semibold"
                        title="View Full Details"
                      >
                        <Eye size={13} />
                        <span>View</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        /* GRID CARDS VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {complaints.map(c => {
            const sCfg = STATUS_COLORS[c.status] || STATUS_COLORS['Submitted'];
            return (
              <div 
                key={c.id} 
                className="complaint-card-box p-5 flex flex-col justify-between hover:border-slate-300 transition"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="font-mono text-xs font-extrabold text-slate-900">
                      {c.publicId}
                    </span>
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
                  </div>

                  <h4 className="text-sm font-bold text-slate-800 line-clamp-1 mb-1">
                    {c.subject}
                  </h4>
                  <p className="text-xs text-slate-500 line-clamp-2 mb-3 leading-relaxed">
                    {c.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-medium truncate max-w-[200px]">
                    {c.hospitalName}
                  </span>
                  <button
                    type="button"
                    onClick={() => setSelectedComplaint(c)}
                    className="text-emerald-600 hover:text-emerald-700 font-bold flex items-center gap-1 text-xs"
                  >
                    Details →
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* DETAIL MODAL */}
      {selectedComplaint && (
        <ComplaintDetailModal
          complaint={selectedComplaint}
          currentUser={user}
          onClose={() => setSelectedComplaint(null)}
          onComplaintUpdated={(updated) => {
            setSelectedComplaint(updated);
            loadData();
          }}
        />
      )}
    </div>
  );
}
