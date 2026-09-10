import React from 'react';
import { 
  CheckCircle2, Clock, UserCheck, AlertCircle, 
  CheckCheck, XCircle, FileText, ArrowRight, ShieldCheck 
} from 'lucide-react';
import { COMPLAINT_STATUSES, STATUS_COLORS } from '../../services/complaintService';

const STAGE_ICONS = {
  'Submitted': FileText,
  'Under Review': Clock,
  'Assigned': UserCheck,
  'In Progress': AlertCircle,
  'Resolved': CheckCheck,
  'Closed': CheckCircle2,
};

export default function ComplaintTimeline({ currentStatus = 'Submitted', timeline = [], resolution = null }) {
  const currentIndex = COMPLAINT_STATUSES.indexOf(currentStatus);
  const activeIdx = currentIndex === -1 ? 0 : currentIndex;
  const progressPercent = (activeIdx / (COMPLAINT_STATUSES.length - 1)) * 100;

  return (
    <div className="w-full">
      {/* 6-Stage Progress Bar */}
      <div className="timeline-stages-wrapper">
        <div className="timeline-stages-bar-bg" />
        <div 
          className="timeline-stages-bar-fill" 
          style={{ width: `calc(${progressPercent}% * 0.88)` }}
        />

        {COMPLAINT_STATUSES.map((st, idx) => {
          const Icon = STAGE_ICONS[st] || Clock;
          const isCompleted = idx < activeIdx;
          const isCurrent = idx === activeIdx;

          return (
            <div 
              key={st} 
              className={`timeline-stage-node ${isCompleted ? 'completed' : ''} ${isCurrent ? 'current' : ''}`}
            >
              <div className="timeline-node-circle">
                {isCompleted ? <CheckCircle2 size={16} /> : <Icon size={14} />}
              </div>
              <div className="timeline-node-label">{st}</div>
            </div>
          );
        })}
      </div>

      {/* Resolution Callout (if resolved) */}
      {resolution && (
        <div className="mt-5 p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex gap-3 items-start">
          <ShieldCheck size={20} className="text-emerald-600 shrink-0 mt-0.5" />
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-emerald-800 mb-1">
              Official Resolution Notice
            </div>
            <p className="text-sm text-emerald-950 font-medium leading-relaxed">
              {resolution.message}
            </p>
            <div className="text-[11px] text-emerald-700 mt-2">
              Resolved by: <strong>{resolution.resolvedBy || 'Grievance Committee'}</strong> • {new Date(resolution.resolvedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
        </div>
      )}

      {/* Historical Updates Log */}
      {timeline && timeline.length > 0 && (
        <div className="mt-6">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
            Status Activity Log ({timeline.length} {timeline.length === 1 ? 'event' : 'events'})
          </div>
          <div className="timeline-log-list">
            {timeline.slice().reverse().map((entry, idx) => {
              const statusCfg = STATUS_COLORS[entry.status] || STATUS_COLORS['Submitted'];
              return (
                <div key={idx} className="timeline-log-item">
                  <div 
                    className="timeline-log-dot" 
                    style={{ background: statusCfg.dot }}
                  />
                  <div className="timeline-log-card">
                    <div className="timeline-log-meta">
                      <span 
                        className="complaint-status-pill"
                        style={{ 
                          background: statusCfg.bg, 
                          color: statusCfg.text, 
                          borderColor: statusCfg.border 
                        }}
                      >
                        <span className="complaint-status-dot" style={{ background: statusCfg.dot }} />
                        {entry.status}
                      </span>
                      <span>
                        {new Date(entry.timestamp).toLocaleDateString('en-IN', { 
                          day: 'numeric', month: 'short', year: 'numeric', 
                          hour: '2-digit', minute: '2-digit' 
                        })}
                      </span>
                    </div>
                    <p className="text-xs text-slate-700 font-medium mt-1.5 leading-relaxed">
                      {entry.note}
                    </p>
                    <div className="text-[11px] text-slate-400 mt-1">
                      Logged by: <span className="text-slate-600 font-semibold">{entry.updatedBy}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
