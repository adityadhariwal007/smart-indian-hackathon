import { useState } from 'react';
import {
  ListOrdered, Play, CheckCircle2, UserX, AlertTriangle, Clock,
  ArrowUpCircle, BellRing, RefreshCw, UserCheck
} from 'lucide-react';

export default function DoctorQueue() {
  const [queue, setQueue] = useState([
    { id: 1, token: 'C-014', name: 'Ramesh Verma', type: 'Appointment', status: 'In Consultation', waitMin: 0, priority: 'Normal' },
    { id: 2, token: 'C-015', name: 'Sunita Rao', type: 'Appointment', status: 'Waiting', waitMin: 15, priority: 'Normal' },
    { id: 3, token: 'C-016', name: 'Kavita Singh', type: 'Walk-in', status: 'Waiting', waitMin: 28, priority: 'Normal' },
    { id: 4, token: 'C-017', name: 'Alok Gupta', type: 'Emergency Referral', status: 'Waiting', waitMin: 5, priority: 'Urgent' },
    { id: 5, token: 'C-018', name: 'Pooja Nair', type: 'Appointment', status: 'Waiting', waitMin: 45, priority: 'Normal' },
    { id: 6, token: 'C-019', name: 'Deepak Saxena', type: 'Follow-up', status: 'Waiting', waitMin: 55, priority: 'Normal' },
  ]);

  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [showBroadcastSuccess, setShowBroadcastSuccess] = useState(false);

  const setStatus = (id, newStatus) => {
    setQueue(prev => prev.map(p => p.id === id ? { ...p, status: newStatus } : p));
  };

  const prioritizePatient = (id) => {
    setQueue(prev => {
      const idx = prev.findIndex(p => p.id === id);
      if (idx <= 1) return prev;
      const updated = [...prev];
      const [item] = updated.splice(idx, 1);
      item.priority = 'Urgent';
      // Place right after the one currently in consultation
      updated.splice(1, 0, item);
      return updated;
    });
  };

  const handleBroadcastDelay = () => {
    setShowBroadcastSuccess(true);
    setTimeout(() => setShowBroadcastSuccess(false), 4000);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <ListOrdered size={26} style={{ color: 'var(--primary)' }} />
            OPD Chamber Queue Manager
          </h2>
          <p className="text-secondary text-sm">
            Control patient flow, triage emergency walk-ins, and broadcast delays
          </p>
        </div>

        <button
          className="btn btn-warning btn-sm flex items-center gap-2"
          onClick={handleBroadcastDelay}
        >
          <BellRing size={16} /> Broadcast +15m OPD Delay Notice
        </button>
      </div>

      {showBroadcastSuccess && (
        <div className="p-3 bg-warning-light text-warning rounded-lg flex items-center gap-2 text-sm border border-warning">
          <AlertTriangle size={18} />
          Broadcast alert sent: "Chamber 204 running 15 mins behind schedule due to emergency review."
        </div>
      )}

      {/* Queue Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card p-4">
          <span className="text-xs text-secondary font-medium">Currently In Queue</span>
          <div className="text-2xl font-bold text-primary">{queue.filter(q => q.status === 'Waiting').length}</div>
        </div>
        <div className="card p-4">
          <span className="text-xs text-secondary font-medium">Avg Consultation Time</span>
          <div className="text-2xl font-bold">11.4 min</div>
        </div>
        <div className="card p-4">
          <span className="text-xs text-secondary font-medium">Next Patient Est. Wait</span>
          <div className="text-2xl font-bold text-success">8 min</div>
        </div>
        <div className="card p-4">
          <span className="text-xs text-secondary font-medium">High Priority / Urgent</span>
          <div className="text-2xl font-bold text-danger">
            {queue.filter(q => q.priority === 'Urgent').length}
          </div>
        </div>
      </div>

      {/* Queue Table */}
      <div className="card p-5">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b text-secondary text-xs uppercase">
                <th className="pb-3">Pos</th>
                <th className="pb-3">Token</th>
                <th className="pb-3">Patient</th>
                <th className="pb-3">Queue Type</th>
                <th className="pb-3">Wait Time</th>
                <th className="pb-3">Status</th>
                <th className="pb-3 text-right">Queue Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {queue.map((pt, index) => (
                <tr
                  key={pt.id}
                  className={`${pt.status === 'In Consultation' ? 'bg-primary-bg font-medium' : ''} ${
                    pt.priority === 'Urgent' ? 'bg-rose-50 dark:bg-rose-950/20' : ''
                  }`}
                >
                  <td className="py-3.5 font-bold text-secondary">{index + 1}</td>
                  <td className="py-3.5 font-mono font-bold text-primary">{pt.token}</td>
                  <td className="py-3.5">
                    <div className="font-semibold">{pt.name}</div>
                    {pt.priority === 'Urgent' && (
                      <span className="badge badge-danger text-[10px] mt-0.5">Urgent Case</span>
                    )}
                  </td>
                  <td className="py-3.5 text-secondary text-xs">{pt.type}</td>
                  <td className="py-3.5 text-secondary text-xs flex items-center gap-1 pt-4">
                    <Clock size={12} /> {pt.waitMin} mins
                  </td>
                  <td className="py-3.5">
                    <span
                      className={`badge ${
                        pt.status === 'In Consultation'
                          ? 'badge-primary'
                          : pt.status === 'Completed'
                          ? 'badge-success'
                          : pt.status === 'No Show'
                          ? 'badge-danger'
                          : 'badge-neutral'
                      }`}
                    >
                      {pt.status}
                    </span>
                  </td>
                  <td className="py-3.5 text-right">
                    <div className="flex justify-end gap-1.5 flex-wrap">
                      {pt.status === 'Waiting' && (
                        <>
                          <button
                            className="btn btn-primary btn-xs"
                            onClick={() => setStatus(pt.id, 'In Consultation')}
                            title="Call inside"
                          >
                            <Play size={12} /> Admit
                          </button>
                          {index > 1 && (
                            <button
                              className="btn btn-warning btn-xs"
                              onClick={() => prioritizePatient(pt.id)}
                              title="Prioritize next"
                            >
                              <ArrowUpCircle size={12} /> Prioritize
                            </button>
                          )}
                          <button
                            className="btn btn-ghost btn-xs text-danger"
                            onClick={() => setStatus(pt.id, 'No Show')}
                            title="Mark absent"
                          >
                            <UserX size={12} /> Absent
                          </button>
                        </>
                      )}

                      {pt.status === 'In Consultation' && (
                        <button
                          className="btn btn-success btn-xs"
                          onClick={() => setStatus(pt.id, 'Completed')}
                        >
                          <CheckCircle2 size={12} /> Complete
                        </button>
                      )}
                    </div>
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
