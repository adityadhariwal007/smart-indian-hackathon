import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { HeartPulse, User, Stethoscope, Shield, ArrowLeft } from 'lucide-react';
import './LoginPage.css';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const roles = [
    {
      role: 'patient',
      icon: User,
      title: 'Patient',
      description: 'Search hospitals, find doctors, get queue tokens, and track ambulances.',
      color: '#0891B2',
      demoUser: 'Aditya Kumar',
    },
    {
      role: 'doctor',
      icon: Stethoscope,
      title: 'Doctor',
      description: 'View appointments, manage queue, update availability, and track patients.',
      color: '#10B981',
      demoUser: 'Dr. Ananya Sharma',
    },
    {
      role: 'admin',
      icon: Shield,
      title: 'Hospital Admin',
      description: 'Monitor crowd, manage departments, view analytics, and allocate resources.',
      color: '#8B5CF6',
      demoUser: 'Rajesh Mehta',
    },
  ];

  const handleLogin = (role) => {
    login(role);
    navigate(`/${role}`);
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <button className="btn btn-ghost mb-6" onClick={() => navigate('/')}>
          <ArrowLeft size={18} /> Back to Home
        </button>

        <div className="login-header">
          <div className="login-logo">
            <HeartPulse size={32} />
            <span>HealthFlow</span>
          </div>
          <h2>Select Your Role</h2>
          <p>Choose a demo role to explore the platform. No sign-up required.</p>
        </div>

        <div className="role-cards">
          {roles.map(r => (
            <div key={r.role} className="role-card card card-hover" onClick={() => handleLogin(r.role)}>
              <div className="role-card-icon" style={{ background: `${r.color}15`, color: r.color }}>
                <r.icon size={28} />
              </div>
              <h3>{r.title}</h3>
              <p>{r.description}</p>
              <div className="role-card-user">
                <span>Demo: {r.demoUser}</span>
              </div>
              <button className="btn btn-primary" style={{ background: r.color, width: '100%' }}>
                Login as {r.title}
              </button>
            </div>
          ))}
        </div>

        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <span style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-sm)' }}>
            New patient looking to book a clinical triage call?{' '}
          </span>
          <button
            className="btn-ghost-link"
            onClick={() => handleLogin('patient')}
            style={{ fontWeight: 700, textDecoration: 'underline', color: 'var(--brand-purple-600)' }}
          >
            Enter Patient Portal & Book Appointment →
          </button>
        </div>

        <div className="disclaimer mt-6">
          <span>ⓘ</span>
          This is a demonstration with fictional data. No real authentication or personal data is used.
        </div>
      </div>
    </div>
  );
}
