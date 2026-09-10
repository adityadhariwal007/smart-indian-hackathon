import { useState } from 'react';
import { Clock, Calendar, Check, AlertCircle, Save, ShieldAlert, CheckCircle2 } from 'lucide-react';

export default function DoctorAvailability() {
  const [isOnCall, setIsOnCall] = useState(true);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const [schedule, setSchedule] = useState([
    { day: 'Monday', enabled: true, morning: '09:00 AM - 01:00 PM', evening: '04:00 PM - 07:00 PM', maxCapacity: 35 },
    { day: 'Tuesday', enabled: true, morning: '09:00 AM - 01:00 PM', evening: '04:00 PM - 07:00 PM', maxCapacity: 35 },
    { day: 'Wednesday', enabled: true, morning: '09:00 AM - 01:00 PM', evening: 'Closed', maxCapacity: 20 },
    { day: 'Thursday', enabled: true, morning: '09:00 AM - 01:00 PM', evening: '04:00 PM - 07:00 PM', maxCapacity: 35 },
    { day: 'Friday', enabled: true, morning: '09:00 AM - 01:00 PM', evening: '04:00 PM - 07:00 PM', maxCapacity: 35 },
    { day: 'Saturday', enabled: true, morning: '09:00 AM - 02:00 PM', evening: 'Closed', maxCapacity: 25 },
    { day: 'Sunday', enabled: false, morning: 'Closed', evening: 'Closed', maxCapacity: 0 },
  ]);

  const toggleDay = (index) => {
    setSchedule(prev => prev.map((item, i) => i === index ? { ...item, enabled: !item.enabled } : item));
  };

  const handleSave = () => {
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Clock size={26} style={{ color: 'var(--primary)' }} />
            OPD Schedule & Slot Availability
          </h2>
          <p className="text-secondary text-sm">
            Set your weekly consultation hours, slot limits, and emergency on-call status
          </p>
        </div>

        <button className="btn btn-primary btn-sm flex items-center gap-2" onClick={handleSave}>
          <Save size={16} /> Save Schedule
        </button>
      </div>

      {saveSuccess && (
        <div className="p-3 bg-success-light text-success rounded-lg flex items-center gap-2 text-sm border border-success">
          <CheckCircle2 size={18} />
          Availability schedule saved. Patient booking slots updated across HealthFlow platform.
        </div>
      )}

      {/* Emergency On-Call Banner */}
      <div className="card p-5 flex flex-wrap justify-between items-center gap-4 bg-teal-50 dark:bg-teal-950/20 border-teal-200">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-teal-600 text-white">
            <ShieldAlert size={22} />
          </div>
          <div>
            <h4 className="font-bold text-base">Emergency Department On-Call Roster</h4>
            <p className="text-xs text-secondary">
              When enabled, hospital triage can alert you for emergency code-cardiac cases.
            </p>
          </div>
        </div>

        <button
          className={`btn btn-sm ${isOnCall ? 'btn-success' : 'btn-ghost border'}`}
          onClick={() => setIsOnCall(!isOnCall)}
        >
          {isOnCall ? '🟢 Active On-Call' : '⚪ Off Duty'}
        </button>
      </div>

      {/* Weekly Schedule Grid */}
      <div className="card p-5 space-y-4">
        <h3 className="font-bold text-lg border-b pb-3">Weekly OPD Chamber Hours</h3>

        <div className="divide-y">
          {schedule.map((dayItem, idx) => (
            <div key={dayItem.day} className="py-3.5 flex flex-wrap justify-between items-center gap-4">
              <div className="w-32">
                <div className="font-bold text-sm">{dayItem.day}</div>
                <span className={`text-xs ${dayItem.enabled ? 'text-success font-medium' : 'text-secondary'}`}>
                  {dayItem.enabled ? 'Active OPD' : 'Not Working'}
                </span>
              </div>

              {dayItem.enabled ? (
                <div className="flex-1 flex flex-wrap gap-4 items-center text-xs">
                  <div className="p-2 bg-bg-secondary rounded-lg">
                    <span className="text-secondary block">Morning Shift</span>
                    <span className="font-semibold">{dayItem.morning}</span>
                  </div>

                  <div className="p-2 bg-bg-secondary rounded-lg">
                    <span className="text-secondary block">Evening Shift</span>
                    <span className="font-semibold">{dayItem.evening}</span>
                  </div>

                  <div className="p-2 bg-bg-secondary rounded-lg">
                    <span className="text-secondary block">Max Slots</span>
                    <span className="font-semibold">{dayItem.maxCapacity} patients</span>
                  </div>
                </div>
              ) : (
                <div className="flex-1 text-xs text-secondary italic">
                  Chamber closed. No appointments or walk-ins accepted.
                </div>
              )}

              <div>
                <button
                  className={`btn btn-xs ${dayItem.enabled ? 'btn-ghost text-danger' : 'btn-secondary'}`}
                  onClick={() => toggleDay(idx)}
                >
                  {dayItem.enabled ? 'Disable Day' : 'Enable Day'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
