import { useNotifications } from '../../context/NotificationContext';
import { X, CheckCircle, AlertTriangle, Info, AlertCircle } from 'lucide-react';

const icons = {
  success: CheckCircle,
  warning: AlertTriangle,
  danger: AlertCircle,
  info: Info,
};

export default function ToastContainer() {
  const { toasts, removeToast } = useNotifications();

  return (
    <div className="toast-container">
      {toasts.map(toast => {
        const Icon = icons[toast.type] || Info;
        return (
          <div key={toast.id} className={`toast toast-${toast.type}`}>
            <Icon size={20} />
            <span style={{ flex: 1 }}>{toast.message}</span>
            <button className="btn-icon" onClick={() => removeToast(toast.id)}>
              <X size={16} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
