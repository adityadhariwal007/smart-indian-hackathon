import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import BottomNav from './BottomNav';
import ToastContainer from '../common/ToastContainer';
import HealthcareLogoBanner from '../common/HealthcareLogoBanner';
import { useAuth } from '../../context/AuthContext';
import consultationSocketService from '../../services/consultationSocketService';
import IncomingCallModal from '../doctor/IncomingCallModal';

export default function DashboardLayout() {
  const { user } = useAuth();
  const isDoctor = user?.role === 'doctor';
  const doctorId = user?.username || user?.id || 'aditya';

  useEffect(() => {
    if (isDoctor && doctorId) {
      consultationSocketService.registerDoctor(doctorId, 'available');
    }
  }, [isDoctor, doctorId]);

  return (
    <>
      <div className="dashboard-container">
        <Sidebar />
        <Header />
        <main className="main-content">
          <HealthcareLogoBanner />
          <div className="page-content">
            <Outlet />
          </div>
        </main>
        <BottomNav />
      </div>
      <ToastContainer />
      {isDoctor && <IncomingCallModal doctorId={doctorId} />}
    </>
  );
}

