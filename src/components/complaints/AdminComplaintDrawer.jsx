import React, { useState } from 'react';
import { 
  X, CheckCircle2, AlertCircle, Clock, ShieldCheck, 
  Send, UserCheck, Lock, Building2, User, Phone, Mail 
} from 'lucide-react';
import { 
  COMPLAINT_STATUSES, 
  STATUS_COLORS, 
  updateComplaintStatus, 
  addInternalNote, 
  addComplaintMessage 
} from '../../services/complaintService';
import { useNotifications } from '../../context/NotificationContext';
import ComplaintTimeline from './ComplaintTimeline';

const ADMIN_DEPARTMENTS = [
  'Patient Grievance Cell',
  'Medical Superintendent Office',
  'OPD Administration & Relations',
  'Emergency Medical Services (EMS) Command',
  'Accounts & Billing Audit Cell',
  'Facility & Housekeeping Services',
  'Central Drug Store & Procurement',
  'Quality & Infection Control Committee',
  'Chief Medical Officer (CMO) Cell',
];

export default function AdminComplaintDrawer({ complaint, adminUser, onClose, onUpdated }) {
  const { addToast } = useNotifications();

  // Status transition form state
  const [selectedStatus, setSelectedStatus] = useState(complaint.status);
  const [assignedDept, setAssignedDept] = useState(complaint.assignedDepartment || ADMIN_DEPARTMENTS[0]);
  const [statusNote, setStatusNote] = useState('');
  const [resolutionText, setResolutionText] = useState(complaint.resolution?.message || '');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  // Internal Note form state
  const [newInternalNote, setNewInternalNote] = useState('');
  const [isAddingNote, setIsAddingNote] = useState(false);

  // Message to user state
  const [patientMessage, setPatientMessage] = useState('');
  const [isSendingMessage, setIsSendingMessage] = useState(false);

  if (!complaint) return null;

  const currentStatusCfg = STATUS_COLORS[complaint.status] || STATUS_COLORS['Submitted'];

  // Handle Status Update
  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    if (isUpdatingStatus) return;

    if (selectedStatus === 'Resolved' && !resolutionText.trim()) {
      addToast('Please provide a resolution explanation message when marking as Resolved.', 'error');
      return;
    }

    setIsUpdatingStatus(true);
    try {
      const updated = await updateComplaintStatus(complaint.id, {
        status: selectedStatus,
        assignedDepartment: assignedDept,
        note: statusNote.trim() || `Status set to ${selectedStatus} by ${adminUser?.name || 'Administrator'}.`,
        adminUser,
        resolutionMessage: selectedStatus === 'Resolved' ? resolutionText.trim() : null,
      });

      addToast(`Status updated to ${selectedStatus}`, 'success');
      setStatusNote('');
      if (onUpdated) onUpdated(updated);
    } catch (err) {
      console.error(err);
      addToast('Failed to update complaint status.', 'error');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // Handle Add Internal Note
  const handleAddInternalNote = async (e) => {
    e.preventDefault();
    if (!newInternalNote.trim() || isAddingNote) return;

    setIsAddingNote(true);
    try {
      const updated = await addInternalNote(complaint.id, {
        text: newInternalNote.trim(),
        adminUser,
      });
      setNewInternalNote('');
      addToast('Internal administrative note saved.', 'success');
      if (onUpdated) onUpdated(updated);
    } catch (err) {
      console.error(err);
      addToast('Failed to save internal note.', 'error');
    } finally {
      setIsAddingNote(false);
    }
  };

  // Handle Send Message to Patient
  const handleSendMessageToPatient = async (e) => {
    e.preventDefault();
    if (!patientMessage.trim() || isSendingMessage) return;

    setIsSendingMessage(true);
    try {
      const updated = await addComplaintMessage(complaint.id, {
        text: patientMessage.trim(),
        authorName: adminUser?.name || 'Hospital Administration',
        authorRole: 'admin',
      });
      setPatientMessage('');
      addToast('Official response sent to patient.', 'success');
      if (onUpdated) onUpdated(updated);
    } catch (err) {
      console.error(err);
      addToast('Failed to dispatch response.', 'error');
    } finally {
      setIsSendingMessage(false);
    }
  };

  return (
    <div className="complaint-modal-backdrop" onClick={onClose}>
      <div className="complaint-admin-drawer animate-in" onClick={(e) => e.stopPropagation()}>
        {/* Drawer Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-mono text-sm font-extrabold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                {complaint.publicId}
              </span>
              <span
                className="complaint-status-pill"
                style={{
                  background: currentStatusCfg.bg,
                  color: currentStatusCfg.text,
                  borderColor: currentStatusCfg.border
                }}
              >
                <span className="complaint-status-dot" style={{ background: currentStatusCfg.dot }} />
                {complaint.status}
              </span>
            </div>
            <h3 className="text-base font-bold text-slate-900 leading-snug">
              {complaint.subject}
            </h3>
          </div>

          <button 
            type="button" 
            onClick={onClose} 
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* Citizen Contact Profile Card */}
        <div className="my-4 p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1.5">
          <div className="flex items-center justify-between font-bold text-slate-800">
            <span>{complaint.fullName}</span>
            <span className="text-emerald-700 font-semibold">{complaint.preferredContact} contact</span>
          </div>
          <div className="text-slate-500 flex items-center gap-3">
            <span>{complaint.email}</span>
            <span>•</span>
            <span>{complaint.phone}</span>
          </div>
          <div className="text-slate-400 text-[11px]">
            Incident: <strong>{complaint.incidentDate}</strong> • Dept: <strong>{complaint.department}</strong>
          </div>
        </div>

        {/* Full Complaint Statement */}
        <div className="mb-5">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
            Citizen Statement
          </div>
          <div className="p-3 bg-white border border-slate-200 rounded-xl text-xs text-slate-700 leading-relaxed max-h-36 overflow-y-auto">
            {complaint.description}
          </div>
        </div>

        {/* ACTION 1: Change Status & Assign Department */}
        <form onSubmit={handleUpdateStatus} className="mb-6 p-4 bg-slate-50 border border-slate-200 rounded-xl">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3 flex items-center gap-1.5">
            <UserCheck size={14} className="text-emerald-600" />
            <span>Update Status & Assignment</span>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">Target Status</label>
              <select
                className="complaint-select text-xs"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
              >
                {COMPLAINT_STATUSES.map(st => (
                  <option key={st} value={st}>{st}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">Assign to Clinical / Admin Cell</label>
              <select
                className="complaint-select text-xs"
                value={assignedDept}
                onChange={(e) => setAssignedDept(e.target.value)}
              >
                {ADMIN_DEPARTMENTS.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">Timeline Activity Note</label>
              <input
                type="text"
                placeholder="e.g. Audit scheduled with duty doctor..."
                value={statusNote}
                onChange={(e) => setStatusNote(e.target.value)}
                className="complaint-input text-xs"
              />
            </div>

            {selectedStatus === 'Resolved' && (
              <div>
                <label className="text-xs font-bold text-emerald-800 block mb-1">
                  Resolution Explanation (Visible to Citizen) <span className="text-red-500">*</span>
                </label>
                <textarea
                  placeholder="Detail the corrective actions taken, refunds processed, or policy changes made..."
                  value={resolutionText}
                  onChange={(e) => setResolutionText(e.target.value)}
                  className="complaint-textarea text-xs"
                  style={{ minHeight: '80px' }}
                />
              </div>
            )}

            <button
              type="submit"
              disabled={isUpdatingStatus}
              className="complaint-submit-btn text-xs py-2 w-full justify-center"
            >
              {isUpdatingStatus ? 'Saving Status...' : 'Apply Status Update'}
            </button>
          </div>
        </form>

        {/* ACTION 2: Private Internal Notes (Admin-Only) */}
        <div className="mb-6 p-4 bg-amber-50/50 border border-amber-200/80 rounded-xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-900 flex items-center gap-1.5">
              <Lock size={13} className="text-amber-700" />
              <span>Internal Admin Notes (Private)</span>
            </span>
            <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-1.5 py-0.5 rounded">
              Hidden from User
            </span>
          </div>

          {complaint.internalNotes && complaint.internalNotes.length > 0 && (
            <div className="space-y-2 mb-3 max-h-32 overflow-y-auto pr-1">
              {complaint.internalNotes.map(n => (
                <div key={n.id} className="p-2 bg-white rounded-lg border border-amber-200 text-xs text-slate-700">
                  <div className="flex justify-between text-[10px] text-slate-400 font-semibold mb-0.5">
                    <span>{n.author}</span>
                    <span>{new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <div>{n.text}</div>
                </div>
              ))}
            </div>
          )}

          <form onSubmit={handleAddInternalNote} className="flex gap-2">
            <input
              type="text"
              placeholder="Add private note for grievance staff..."
              value={newInternalNote}
              onChange={(e) => setNewInternalNote(e.target.value)}
              className="complaint-input text-xs"
            />
            <button
              type="submit"
              disabled={isAddingNote || !newInternalNote.trim()}
              className="px-3 py-1.5 bg-amber-700 hover:bg-amber-800 text-white rounded-lg text-xs font-bold shrink-0 transition"
            >
              Add Note
            </button>
          </form>
        </div>

        {/* ACTION 3: Send Response to Patient */}
        <div className="mb-6 p-4 bg-blue-50/50 border border-blue-200/80 rounded-xl">
          <div className="text-xs font-bold uppercase tracking-wider text-blue-900 mb-2 flex items-center gap-1.5">
            <Send size={13} className="text-blue-700" />
            <span>Send Official Update to Citizen</span>
          </div>

          <form onSubmit={handleSendMessageToPatient} className="flex gap-2">
            <input
              type="text"
              placeholder="Type message to citizen..."
              value={patientMessage}
              onChange={(e) => setPatientMessage(e.target.value)}
              className="complaint-input text-xs"
            />
            <button
              type="submit"
              disabled={isSendingMessage || !patientMessage.trim()}
              className="px-3 py-1.5 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-xs font-bold shrink-0 transition"
            >
              Send
            </button>
          </form>
        </div>

        {/* Progress History View */}
        <div className="pt-2 border-t border-slate-200">
          <ComplaintTimeline 
            currentStatus={complaint.status}
            timeline={complaint.timeline}
            resolution={complaint.resolution}
          />
        </div>
      </div>
    </div>
  );
}
