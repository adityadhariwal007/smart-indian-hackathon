import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import BottomNav from './BottomNav';
import ToastContainer from '../common/ToastContainer';

export default function DashboardLayout() {
  return (
    <>
      <div className="dashboard-container">
        <Sidebar />
        <Header />
        <main className="main-content">
          <div className="page-content">
            <Outlet />
          </div>
        </main>
        <BottomNav />
      </div>
      <ToastContainer />
    </>
  );
}
