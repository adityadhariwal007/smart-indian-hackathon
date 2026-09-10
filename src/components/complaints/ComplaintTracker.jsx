import React, { useState, useEffect } from 'react';
import { 
  Search, ShieldCheck, Clock, Building2, MapPin, 
  Calendar, AlertCircle, CheckCircle2, User, ArrowRight 
} from 'lucide-react';
import { getComplaintByPublicId, STATUS_COLORS } from '../../services/complaintService';
import ComplaintTimeline from './ComplaintTimeline';

export default function ComplaintTracker({ initialId = '', onOpenSubmit }) {
  const [searchId, setSearchId] = useState(initialId || '');
  const [complaint, setComplaint] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [searchError, setSearchError] = useState('');

  // Auto-search if initialId provided
  useEffect(() => {
    if (initialId) {
      setSearchId(initialId);
      doSearch(initialId);
    }
  }, [initialId]);

  const doSearch = (idToSearch) => {
    const clean = (idToSearch || searchId).trim().toUpperCase();
    if (!clean) {
      setSearchError('Please enter your Complaint ID.');
      return;
    }
    setSearchError('');
    setHasSearched(true);
    const result = getComplaintByPublicId(clean);
    setComplaint(result);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    doSearch();
  };

  const statusCfg = complaint ? (STATUS_COLORS[complaint.status] || STATUS_COLORS['Submitted']) : null;

  return (
    <div className="w-full">
      {/* Tracker Search Bar Box */}
      <div className="complaint-card-box mb-6">
        <h3 className="text-lg font-bold text-slate-900 mb-1">
          Track Grievance Status
        </h3>
        <p className="text-xs text-slate-500 mb-4">
          Enter your reference ID (e.g. <strong>HC-2026-XXXXXX</strong>) to check the current investigation progress, assigned cell, and official resolution updates.
        </p>

        <form onSubmit={handleSearchSubmit} className="flex flex-wrap sm:flex-nowrap gap-3">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="e.g. HC-2026-782419"
              value={searchId}
              onChange={(e) => {
                setSearchId(e.target.value);
                setSearchError('');
              }}
              className="complaint-input"
              style={{ paddingLeft: '40px', textTransform: 'uppercase' }}
            />
          </div>

          <button type="submit" className="complaint-submit-btn shrink-0">
            <Search size={16} />
            <span>Track Status</span>
          </button>
        </form>

        {searchError && (
          <p className="text-xs text-red-600 font-medium mt-2 flex items-center gap-1">
            <AlertCircle size={12} /> {searchError}
          </p>
        )}

        {/* Quick Demo ID pills for instant test */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2 text-xs text-slate-500 flex-wrap">
          <span className="font-semibold text-slate-400">Sample Live IDs to Test:</span>
          {['HC-2026-782419', 'HC-2026-419852', 'HC-2026-308164'].map(sampleId => (
            <button
              key={sampleId}
              type="button"
              onClick={() => {
                setSearchId(sampleId);
                doSearch(sampleId);
              }}
              className="px-2.5 py-1 rounded-md bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-700 font-mono font-bold transition text-[11px] border border-slate-200"
            >
              {sampleId}
            </button>
          ))}
        </div>
      </div>

      {/* SEARCH RESULTS */}
      {hasSearched && (
        <>
          {complaint ? (
            <div className="complaint-card-box animate-in">
              {/* Header Strip */}
              <div className="flex flex-wrap items-start justify-between gap-4 pb-5 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2.5 mb-1.5">
                    <span className="font-mono text-lg font-black text-slate-900">
                      {complaint.publicId}
                    </span>
                    <span 
                      className="complaint-status-pill"
                      style={{ 
                        background: statusCfg.bg, 
                        color: statusCfg.text, 
                        borderColor: statusCfg.border 
                      }}
                    >
                      <span className="complaint-status-dot" style={{ background: statusCfg.dot }} />
                      {complaint.status}
                    </span>
                  </div>
                  <h4 className="text-base font-bold text-slate-800 leading-snug">
                    {complaint.subject}
                  </h4>
                </div>

                <div className="text-right text-xs text-slate-500">
                  <div>Submitted on: <strong>{new Date(complaint.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</strong></div>
                  <div>Last Updated: <strong>{new Date(complaint.updatedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</strong></div>
                </div>
              </div>

              {/* Metadata Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-4 border-b border-slate-100 text-xs">
                <div>
                  <span className="text-slate-400 block font-medium">Hospital Facility</span>
                  <span className="font-bold text-slate-800">{complaint.hospitalName}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Category</span>
                  <span className="font-bold text-slate-800">{complaint.category}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Department / Location</span>
                  <span className="font-bold text-slate-800">{complaint.department}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Assigned Team</span>
                  <span className="font-bold text-emerald-700">{complaint.assignedDepartment}</span>
                </div>
              </div>

              {/* 6-Stage Timeline with History */}
              <div className="pt-4">
                <ComplaintTimeline 
                  currentStatus={complaint.status}
                  timeline={complaint.timeline}
                  resolution={complaint.resolution}
                />
              </div>

              {/* Privacy Notice Strip */}
              <div className="mt-8 pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck size={14} className="text-emerald-600" />
                  Privacy Protected • Citizen identity masked ({complaint.maskedName})
                </span>
                <span>Government of Punjab Health Grievance Standards</span>
              </div>
            </div>
          ) : (
            <div className="complaint-card-box text-center py-12">
              <div className="w-14 h-14 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
                <AlertCircle size={28} />
              </div>
              <h4 className="text-base font-bold text-slate-800 mb-1">
                No Record Found for "{searchId.toUpperCase()}"
              </h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mb-5 leading-relaxed">
                Please verify the ID format (e.g. HC-2026-XXXXXX). If you submitted your complaint recently, it may take a few seconds to appear.
              </p>
              {onOpenSubmit && (
                <button
                  type="button"
                  onClick={onOpenSubmit}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-emerald-50 text-emerald-700 font-semibold text-xs transition"
                >
                  File a New Complaint Instead →
                </button>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
