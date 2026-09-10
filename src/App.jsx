import { Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/landing/LandingPage';
import LoginPage from './pages/auth/LoginPage';
import PatientSignupPage from './pages/auth/PatientSignupPage';
import DashboardLayout from './components/layout/DashboardLayout';
import EffectsShowcase from './pages/EffectsShowcase';
import PrivacyPolicy from './pages/legal/PrivacyPolicy';
import TermsAndConditions from './pages/legal/TermsAndConditions';
import NotFoundPage from './pages/NotFoundPage';
import CookieConsent from './components/common/CookieConsent';
import SEO from './components/common/SEO';

// Patient Pages
import PatientDashboard from './pages/patient/PatientDashboard';
import HospitalSearch from './pages/patient/HospitalSearch';
import HospitalDetail from './pages/patient/HospitalDetail';
import HospitalCompare from './pages/patient/HospitalCompare';
import DoctorSearch from './pages/patient/DoctorSearch';
import DoctorProfile from './pages/patient/DoctorProfile';
import ExpertiseSearch from './pages/patient/ExpertiseSearch';
import QueueToken from './pages/patient/QueueToken';
import AmbulancePage from './pages/patient/AmbulancePage';
import EmergencyPage from './pages/patient/EmergencyPage';
import CostEstimator from './pages/patient/CostEstimator';
import SchemesPage from './pages/patient/SchemesPage';
import AppointmentsPage from './pages/patient/AppointmentsPage';
import CrowdPrediction from './pages/patient/CrowdPrediction';
import MapView from './pages/patient/MapView';
import NotificationsPage from './pages/patient/NotificationsPage';
import ProfilePage from './pages/patient/ProfilePage';
import OnlineConsultation from './pages/patient/OnlineConsultation';
import ComplaintsPage from './pages/patient/ComplaintsPage';
import PatientPortal from './pages/patient/PatientPortal';

// Doctor Pages
import DoctorDashboard from './pages/doctor/DoctorDashboard';
import DoctorPatients from './pages/doctor/DoctorPatients';
import DoctorQueue from './pages/doctor/DoctorQueue';
import DoctorAppointments from './pages/doctor/DoctorAppointments';
import DoctorAvailability from './pages/doctor/DoctorAvailability';
import DoctorProfilePage from './pages/doctor/DoctorProfile';
import DoctorOnlineConsultation from './pages/doctor/DoctorOnlineConsultation';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import LiveCrowd from './pages/admin/LiveCrowd';
import AdminPredictions from './pages/admin/AdminPredictions';
import AdminDepartments from './pages/admin/AdminDepartments';
import AdminDoctors from './pages/admin/AdminDoctors';
import AdminAmbulances from './pages/admin/AdminAmbulances';
import AdminAnalytics from './pages/admin/AdminAnalytics';
import ResourceAllocation from './pages/admin/ResourceAllocation';
import AdminSettings from './pages/admin/AdminSettings';
import AdminComplaints from './pages/admin/AdminComplaints';

export default function App() {
  return (
    <>
    <Routes>
      {/* Public Pages */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/privacy" element={<PrivacyPolicy />} />
      <Route path="/terms" element={<TermsAndConditions />} />
      <Route path="/book-appointment" element={<Navigate to="/patient" replace />} />
      <Route path="/complaints" element={<Navigate to="/patient/complaints" replace />} />
      <Route path="/portal" element={<Navigate to="/patient/portal" replace />} />
      <Route path="/signup" element={<PatientSignupPage />} />
      <Route path="/patient/signup" element={<PatientSignupPage />} />
      <Route path="/effects" element={<DashboardLayout />}>
        <Route index element={<EffectsShowcase />} />
      </Route>

      {/* Patient Portal Routes */}
      <Route path="/patient" element={<DashboardLayout />}>
        <Route index element={<PatientDashboard />} />
        <Route path="portal" element={<PatientPortal />} />
        <Route path="hospitals" element={<HospitalSearch />} />
        <Route path="hospitals/compare" element={<HospitalCompare />} />
        <Route path="hospitals/:id" element={<HospitalDetail />} />
        <Route path="doctors" element={<DoctorSearch />} />
        <Route path="doctors/:id" element={<DoctorProfile />} />
        <Route path="expertise" element={<ExpertiseSearch />} />
        <Route path="queue" element={<QueueToken />} />
        <Route path="ambulance" element={<AmbulancePage />} />
        <Route path="emergency" element={<EmergencyPage />} />
        <Route path="cost" element={<CostEstimator />} />
        <Route path="schemes" element={<SchemesPage />} />
        <Route path="appointments" element={<AppointmentsPage />} />
        <Route path="crowd" element={<CrowdPrediction />} />
        <Route path="map" element={<MapView />} />
        <Route path="notifications" element={<NotificationsPage />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="consultation" element={<OnlineConsultation />} />
        <Route path="complaints" element={<ComplaintsPage />} />
      </Route>

      {/* Doctor Portal Routes */}
      <Route path="/doctor" element={<DashboardLayout />}>
        <Route index element={<DoctorDashboard />} />
        <Route path="patients" element={<DoctorPatients />} />
        <Route path="queue" element={<DoctorQueue />} />
        <Route path="appointments" element={<DoctorAppointments />} />
        <Route path="consultation" element={<DoctorOnlineConsultation />} />
        <Route path="availability" element={<DoctorAvailability />} />
        <Route path="profile" element={<DoctorProfilePage />} />
      </Route>

      {/* Admin Operations Portal Routes */}
      <Route path="/admin" element={<DashboardLayout />}>
        <Route index element={<AdminDashboard />} />
        <Route path="crowd" element={<LiveCrowd />} />
        <Route path="predictions" element={<AdminPredictions />} />
        <Route path="departments" element={<AdminDepartments />} />
        <Route path="doctors" element={<AdminDoctors />} />
        <Route path="ambulances" element={<AdminAmbulances />} />
        <Route path="analytics" element={<AdminAnalytics />} />
        <Route path="resources" element={<ResourceAllocation />} />
        <Route path="settings" element={<AdminSettings />} />
        <Route path="profile" element={<AdminSettings />} />
        <Route path="complaints" element={<AdminComplaints />} />
      </Route>

      {/* 404 Catch-all */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
    <CookieConsent />
    <SEO />
    </>
  );
}
