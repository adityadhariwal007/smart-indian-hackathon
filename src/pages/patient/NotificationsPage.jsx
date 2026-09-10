import { useState } from 'react';
import {
  Bell, Check, CheckCheck, Trash2, Ticket, Stethoscope,
  Activity, Ambulance, Calendar, Clock, Sparkles
} from 'lucide-react';
import notificationsData from '../../data/notifications';
import './NotificationsPage.css';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState(notificationsData);
  const [filter, setFilter] = useState('all');

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const markAsRead = (id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const deleteNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  const filtered = filter === 'all'
    ? notifications
    : filter === 'unread'
      ? notifications.filter(n => !n.read)
      : notifications.filter(n => n.type === filter);

  const getCategoryIcon = (type) => {
    switch (type) {
      case 'queue':
        return Ticket;
      case 'doctor':
        return Stethoscope;
      case 'crowd':
        return Activity;
      case 'ambulance':
        return Ambulance;
      case 'appointment':
        return Calendar;
      default:
        return Sparkles;
    }
  };

  const getCategoryLabel = (type) => {
    switch (type) {
      case 'queue':
        return 'QUEUE TOKEN';
      case 'doctor':
        return 'DOCTOR UPDATE';
      case 'crowd':
        return 'CROWD TELEMETRY';
      case 'ambulance':
        return 'AMBULANCE';
      case 'appointment':
        return 'APPOINTMENT';
      default:
        return 'SYSTEM ALERT';
    }
  };

  return (
    <div className="notifications-container animate-fade-in">
      <div className="notifications-header">
        <div className="notifications-title-area">
          <h1 className="notifications-h1">
            <Bell size={26} style={{ color: '#059669' }} />
            Notifications
          </h1>
          <p className="notifications-subtitle">
            Real-time queue alerts, doctor availability, and triage updates
          </p>
        </div>

        <div className="notifications-actions-row">
          {unreadCount > 0 && (
            <button className="btn btn-secondary btn-sm" onClick={markAllAsRead}>
              <CheckCheck size={15} /> Mark all read
            </button>
          )}
          {notifications.length > 0 && (
            <button className="btn btn-ghost btn-sm" onClick={clearAll}>
              <Trash2 size={15} /> Clear all
            </button>
          )}
        </div>
      </div>

      {/* DrDoctor Horizontal Scroll Filter Pills */}
      <div className="filter-pills-scroll">
        {[
          { id: 'all', label: `All (${notifications.length})` },
          { id: 'unread', label: `Unread (${unreadCount})` },
          { id: 'queue', label: 'Queue' },
          { id: 'crowd', label: 'Crowd' },
          { id: 'doctor', label: 'Doctor' },
          { id: 'ambulance', label: 'Ambulance' },
          { id: 'appointment', label: 'Appointments' },
        ].map(tab => (
          <button
            key={tab.id}
            className={`filter-pill ${filter === tab.id ? 'active' : ''}`}
            onClick={() => setFilter(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      <div className="notifications-list">
        {filtered.length === 0 ? (
          <div className="notifications-empty-card">
            <div className="empty-icon-circle">
              <Bell size={28} />
            </div>
            <h3 className="text-lg font-bold text-slate-800">No notifications in this category</h3>
            <p className="text-sm text-slate-500">You're completely up to date with your healthcare triage.</p>
          </div>
        ) : (
          filtered.map(notif => {
            const Icon = getCategoryIcon(notif.type);
            const categoryLabel = getCategoryLabel(notif.type);

            return (
              <div
                key={notif.id}
                className={`notification-card ${!notif.read ? 'unread' : ''}`}
              >
                <div className="notification-icon-circle">
                  <Icon size={20} />
                </div>

                <div className="notification-content">
                  <div className="notification-top-line">
                    <div className="notification-meta-left">
                      <h4 className="notification-item-title">{notif.title}</h4>
                      <span className="notification-category-badge">
                        {categoryLabel}
                      </span>
                      {!notif.read && (
                        <span className="notification-unread-dot" title="Unread" />
                      )}
                    </div>

                    <span className="notification-time">
                      <Clock size={13} /> {notif.time}
                    </span>
                  </div>

                  <p className="notification-item-message">{notif.message}</p>

                  <div className="notification-actions-footer">
                    {!notif.read && (
                      <button
                        className="notif-action-btn read"
                        onClick={() => markAsRead(notif.id)}
                      >
                        <Check size={13} /> Mark read
                      </button>
                    )}
                    <button
                      className="notif-action-btn dismiss"
                      onClick={() => deleteNotification(notif.id)}
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
