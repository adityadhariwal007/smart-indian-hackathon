import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, User, CheckCircle, Video } from 'lucide-react';

const mockDoctorAppointments = [
  { id: 1, patient: 'Ramesh Verma', age: 54, time: '10:00 AM', date: 'Today', type: 'In-Clinic', status: 'Completed', phone: '+91-98110-34561', notes: 'ECG review' },
  { id: 2, patient: 'Sunita Rao', age: 46, time: '10:30 AM', date: 'Today', type: 'In-Clinic', status: 'Confirmed', phone: '+91-98772-99012', notes: 'Post-op review' },
  { id: 3, patient: 'Kavita Singh', age: 38, time: '11:00 AM', date: 'Today', type: 'In-Clinic', status: 'Confirmed', phone: '+91-99234-56781', notes: 'Hypertension check' },
  { id: 4, patient: 'Aarav Patel', age: 28, time: '02:00 PM', date: 'Today', type: 'Tele-Consultation', status: 'Upcoming', phone: '+91-98440-11223', notes: 'Preventive cardiology consult' },
  { id: 5, patient: 'Meenakshi Iyer', age: 61, time: '02:30 PM', date: 'Today', type: 'In-Clinic', status: 'Upcoming', phone: '+91-98331-44556', notes: 'Echo + Lipid evaluation' },
  { id: 6, patient: 'Suresh Menon', age: 52, time: '09:30 AM', date: 'Tomorrow', type: 'In-Clinic', status: 'Confirmed', phone: '+91-98123-55667', notes: 'Angiography review' },
  { id: 7, patient: 'Geeta Nair', age: 43, time: '10:15 AM', date: 'Tomorrow', type: 'Tele-Consultation', status: 'Confirmed', phone: '+91-98990-22114', notes: 'Diet and statin tolerance' },
];

export default function DoctorAppointments() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState('Today');
  const [appointments, setAppointments] = useState(mockDoctorAppointments);

  const filtered = appointments.filter(a => {
    if (filter === 'Today') return a.date === 'Today';
    if (filter === 'Tomorrow') return a.date === 'Tomorrow';
    if (filter === 'Tele-Consult') return a.type === 'Tele-Consultation';
    return true;
  });

  const updateStatus = (id, newStatus) => {
    setAppointments(prev => prev.map(a => a.id === id ? { ...a, status: newStatus } : a));
  };

  const todayCount = appointments.filter(a => a.date === 'Today').length;
  const completedToday = appointments.filter(a => a.date === 'Today' && a.status === 'Completed').length;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-wrap justify-between items-center gap-4 bg-white p-5 rounded-2xl border border-border shadow-xs">
        <div>
          <h1 className="text-2xl font-bold text-text-primary flex items-center gap-2">
            <Calendar size={24} className="text-primary" />
            Doctor Appointments
          </h1>
          <p className="text-secondary text-sm mt-0.5">
            Today's patient schedule and consultation slots
          </p>
        </div>

        <div className="flex gap-1.5 bg-bg-secondary p-1 rounded-xl">
          {['Today', 'Tomorrow', 'Tele-Consult', 'All'].map(t => (
            <button
              key={t}
              className={`btn btn-sm text-xs ${filter === t ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setFilter(t)}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* 3 Clean Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card p-4 bg-white border border-border rounded-xl shadow-xs">
          <span className="text-xs text-secondary font-medium">Today's Bookings</span>
          <div className="text-2xl font-bold text-text-primary mt-1">{todayCount}</div>
        </div>
        <div className="card p-4 bg-white border border-border rounded-xl shadow-xs">
          <span className="text-xs text-secondary font-medium">Completed Today</span>
          <div className="text-2xl font-bold text-primary mt-1">{completedToday}</div>
        </div>
        <div className="card p-4 bg-white border border-border rounded-xl shadow-xs">
          <span className="text-xs text-secondary font-medium">Remaining Today</span>
          <div className="text-2xl font-bold text-secondary mt-1">{todayCount - completedToday}</div>
        </div>
      </div>

      {/* Appointments List */}
      <div className="space-y-3">
        {filtered.map(item => (
          <div
            key={item.id}
            className="card p-4 bg-white border border-border rounded-2xl shadow-xs flex flex-wrap justify-between items-center gap-4 hover:border-primary/40 transition"
          >
            <div className="flex items-center gap-4">
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center font-bold text-sm ${
                item.type === 'Tele-Consultation'
                  ? 'bg-blue-50 text-blue-600'
                  : 'bg-emerald-50 text-primary'
              }`}>
                {item.type === 'Tele-Consultation' ? <Video size={20} /> : <User size={20} />}
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-base text-text-primary">{item.patient}</h4>
                  <span className="badge badge-neutral text-xs">{item.age} yrs</span>
                  <span className={`badge text-xs ${
                    item.status === 'Completed'
                      ? 'badge-success'
                      : item.status === 'Confirmed'
                      ? 'badge-primary'
                      : 'badge-warning'
                  }`}>
                    {item.status}
                  </span>
                </div>
                <div className="text-xs text-secondary mt-1 flex items-center gap-3">
                  <span className="flex items-center gap-1"><Clock size={12} /> {item.time} ({item.date})</span>
                  <span>•</span>
                  <span>{item.type}</span>
                  <span>•</span>
                  <span>{item.notes}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {item.type === 'Tele-Consultation' && (
                <button
                  className="btn btn-primary btn-sm text-xs flex items-center gap-1"
                  onClick={() => navigate('/doctor/consultation')}
                >
                  <Video size={14} /> Start Call
                </button>
              )}
              {item.status !== 'Completed' && (
                <button
                  className="btn btn-secondary btn-sm text-xs"
                  onClick={() => updateStatus(item.id, 'Completed')}
                >
                  <CheckCircle size={14} /> Mark Done
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
