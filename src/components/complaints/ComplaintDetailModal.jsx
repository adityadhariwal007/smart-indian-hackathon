import React, { useState } from 'react';
import { 
  X, ShieldCheck, Clock, Building2, User, Phone, 
  Mail, Paperclip, Send, AlertCircle, FileText, CheckCircle2 
} from 'lucide-react';
import { 
  STATUS_COLORS, 
  addComplaintMessage 
} from '../../services/complaintService';
import ComplaintTimeline from './ComplaintTimeline';
import { useNotifications } from '../../context/NotificationContext';

export default function ComplaintDetailModal({ complaint, onClose, onComplaintUpdated, currentUser }) {
  const { addToast } = useNotifications();
  const [replyText, setReplyText] = useState('');
  const [isSending, setIsSending] = useState(false);

  if (!complaint) return null;

  const statusCfg = STATUS_COLORS[complaint.status] || STATUS_COLORS['Submitted'];
  const isActive = complaint.status !== 'Resolved' && complaint.status !== 'Closed';

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!replyText.trim() || isSending) return;

    setIsSending(true);
    try {
      const updated = await addComplaintMessage(complaint.id, {
        text: replyText.trim(),
        authorName: currentUser?.name || complaint.fullName,
        authorRole: currentUser?.role || 'patient',
      });
      setReplyText('');
      addToast('Additional information submitted to the grievance team.', 'success');
      if (onComplaintUpdated) onComplaintUpdated(updated);
    } catch (err) {
      console.error(err);
      addToast('Failed to send update. Please try again.', 'error');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="complaint-modal-backdrop animate-in" onClick={onClose}>
      <div className="complaint-modal-box" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="font-mono font-extrabold text-lg text-slate-900">
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
            <h3 className="text-base font-bold text-slate-800 leading-snug">
              {complaint.subject}
            </h3>
          </div>

          <button 
            type="button" 
            onClick={onClose} 
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* Complaint Details Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-4 border-b border-slate-100 text-xs">
          <div>
            <span className="text-slate-400 block font-medium">Hospital</span>
            <span className="font-bold text-slate-800">{complaint.hospitalName}</span>
          </div>
          <div>
            <span className="text-slate-400 block font-medium">Category</span>
            <span className="font-bold text-slate-800">{complaint.category}</span>
          </div>
          <div>
            <span className="text-slate-400 block font-medium">Department</span>
            <span className="font-bold text-slate-800">{complaint.department}</span>
          </div>
          <div>
            <span className="text-slate-400 block font-medium">Incident Date</span>
            <span className="font-bold text-slate-800">{complaint.incidentDate}</span>
          </div>
        </div>

        {/* Description Section */}
        <div className="py-4 border-b border-slate-100">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
            Detailed Statement of Complaint
          </div>
          <p className="text-sm text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100 whitespace-pre-line">
            {complaint.description}
          </p>
        </div>

        {/* Supporting Attachments */}
        {complaint.attachments && complaint.attachments.length > 0 && (
          <div className="py-4 border-b border-slate-100">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Attached Evidence ({complaint.attachments.length})
            </div>
            <div className="flex flex-wrap gap-2">
              {complaint.attachments.map((file, idx) => (
                <div 
                  key={idx} 
                  className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-100 border border-slate-200 text-xs font-medium text-slate-700"
                >
                  <FileText size={14} className="text-emerald-600" />
                  <span className="truncate max-w-[200px]">{file.name}</span>
                  <span className="text-[11px] text-slate-400">({(file.size / 1024).toFixed(0)} KB)</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Progressive Timeline */}
        <div className="py-5 border-b border-slate-100">
          <ComplaintTimeline 
            currentStatus={complaint.status}
            timeline={complaint.timeline}
            resolution={complaint.resolution}
          />
        </div>

        {/* Message Thread (User / Admin updates) */}
        <div className="py-5">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
            Communication Thread ({complaint.messages?.length || 0})
          </div>

          {(!complaint.messages || complaint.messages.length === 0) ? (
            <p className="text-xs text-slate-400 italic mb-4">
              No additional messages logged yet.
            </p>
          ) : (
            <div className="flex flex-col gap-3 mb-5">
              {complaint.messages.map((m) => {
                const isAdmin = m.role === 'admin';
                return (
                  <div 
                    key={m.id} 
                    className={`p-3 rounded-xl border text-xs leading-relaxed max-w-[85%] ${
                      isAdmin 
                        ? 'bg-blue-50 border-blue-200 text-blue-950 mr-auto' 
                        : 'bg-emerald-50 border-emerald-200 text-emerald-950 ml-auto'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-4 font-bold text-[11px] mb-1 opacity-75">
                      <span>{m.sender} ({isAdmin ? 'Hospital Staff' : 'You'})</span>
                      <span>{new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <div>{m.text}</div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Add Information Form if active */}
          {isActive ? (
            <form onSubmit={handleSendMessage} className="flex gap-2">
              <input
                type="text"
                placeholder="Provide additional details or respond to grievance team..."
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                className="complaint-input text-xs"
              />
              <button 
                type="submit" 
                disabled={isSending || !replyText.trim()}
                className="complaint-submit-btn text-xs py-2 px-4 shrink-0"
              >
                <Send size={14} />
                <span>Send Note</span>
              </button>
            </form>
          ) : (
            <div className="text-xs text-slate-500 bg-slate-100 p-2.5 rounded-lg text-center font-medium">
              This complaint is marked as {complaint.status}. Further updates are closed.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
