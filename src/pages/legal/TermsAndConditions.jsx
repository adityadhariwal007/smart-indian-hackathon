import React from 'react';
import { useNavigate } from 'react-router-dom';
import { HeartPulse, ArrowLeft, AlertTriangle, FileText, CheckCircle2, ShieldAlert, Phone, Mail } from 'lucide-react';
import './Legal.css';

export default function TermsAndConditions() {
  const navigate = useNavigate();

  return (
    <div className="legal-page">
      {/* Top Header */}
      <header className="legal-header">
        <div className="legal-header-inner max-w-5xl mx-auto px-6 flex justify-between items-center">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
            <HeartPulse size={28} className="text-emerald-400" />
            <span className="font-bold text-xl text-white">HealthFlow</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
              Legal & Trust
            </span>
          </div>
          <button onClick={() => navigate('/')} className="legal-back-btn">
            <ArrowLeft size={16} />
            <span>Back to Home</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-6 py-12">
        <div className="legal-card">
          <div className="legal-badge">
            <FileText size={16} />
            <span>TERMS OF SERVICE & CLINICAL PROTOCOLS</span>
          </div>

          <h1 className="legal-title">Terms & Conditions</h1>
          <p className="legal-subtitle">
            Last Updated: September 10, 2026 • Version 2.4 (Patiala Network Release)
          </p>

          <div className="legal-intro">
            Welcome to HealthFlow. By accessing or using our healthcare coordination web platform, mobile portals, outpatient token management systems, or teleconsultation modules, you agree to be bound by these Terms and Conditions. If you do not agree to these terms, do not use the Platform.
          </div>

          {/* Critical Emergency Warning Alert */}
          <div className="legal-emergency-alert">
            <div className="flex gap-3">
              <AlertTriangle size={24} className="text-red-400 shrink-0 mt-0.5" />
              <div>
                <h3 className="font-bold text-red-300 text-sm">CRITICAL MEDICAL EMERGENCY NOTICE</h3>
                <p className="text-xs text-red-200 mt-1 leading-relaxed">
                  HealthFlow's online booking and digital triage services are <strong>NOT a replacement for acute resuscitation or critical emergency treatment</strong>. If you or someone you are assisting is experiencing chest pain, severe difficulty breathing, stroke symptoms, major trauma, or uncontrolled hemorrhage, immediately dial <strong>112</strong> or <strong>108</strong>, or use our <strong>Emergency SOS</strong> button to request urgent ambulance dispatch.
                </p>
              </div>
            </div>
          </div>

          <hr className="legal-divider" />

          {/* Section 1 */}
          <section className="legal-section">
            <h2>1. Platform Scope & Healthcare Coordination Role</h2>
            <p>
              HealthFlow operates as a high-efficiency coordination layer between patients and verified hospitals, clinics, and accredited healthcare practitioners.
            </p>
            <ul>
              <li><strong>Coordination Only:</strong> HealthFlow coordinates appointments, bed visibility, ambulance dispatch, and queue tickets; the actual medical diagnosis, clinical treatment, and prescription issuance remain the sole professional responsibility of the treating healthcare practitioner.</li>
              <li><strong>Hospital Information Accuracy:</strong> While bed availability, OPD waiting estimates, and fee schedules are synchronized in real-time with participating Patiala hospitals, sudden mass-casualty surges or urgent surgical triage may temporarily affect exact queue timings.</li>
            </ul>
          </section>

          {/* Section 2 */}
          <section className="legal-section">
            <h2>2. Patient Registration & ABHA Verification</h2>
            <p>Users registering on HealthFlow agree to:</p>
            <ul>
              <li>Provide accurate, truthful identity and contact details (name, valid phone number) to ensure emergency notifications and prescription deliveries reach the intended person.</li>
              <li>Maintain the confidentiality of their login credentials, SMS OTPs, and Universal Patient IDs.</li>
              <li>Promptly notify the platform of any unauthorized access to their health account.</li>
            </ul>
          </section>

          {/* Section 3 */}
          <section className="legal-section">
            <h2>3. Telemedicine & Video Consultations</h2>
            <p>
              Teleconsultations conducted over HealthFlow are governed by the <strong>Telemedicine Practice Guidelines</strong> issued by the National Medical Commission (NMC):
            </p>
            <ul>
              <li>The consulting physician retains the clinical discretion to determine whether a virtual consultation is appropriate or if an in-person physical examination is urgently required.</li>
              <li>Patients must ensure they are in a secure, well-lit environment with sufficient audio/video bandwidth.</li>
              <li>Prescriptions generated during virtual visits conform to valid Indian e-prescription guidelines and are recognized by registered pharmacies.</li>
            </ul>
          </section>

          {/* Section 4 */}
          <section className="legal-section">
            <h2>4. Outpatient Queue Tokens & Cancellation Policy</h2>
            <p>
              Tokens issued through the platform grant priority triage slots at the participating hospital. To prevent artificial queue blocking:
            </p>
            <ul>
              <li>Cancellations should be requested at least 1 hour prior to the scheduled slot whenever possible.</li>
              <li>Patients failing to report within 45 minutes of their token call time may be marked as a no-show and re-queued according to live hospital OPD triage rules.</li>
              <li>Government hospital OPD consultation fees (typically ₹10–₹50) are paid directly to the hospital counter or through ABDM digital QR systems upon arrival.</li>
            </ul>
          </section>

          {/* Section 5 */}
          <section className="legal-section">
            <h2>5. Public Grievance & Complaint Redressal</h2>
            <p>
              The HealthFlow Complaint Portal enables transparent accountability across public and private hospitals:
            </p>
            <ul>
              <li>Users submitting complaints warrant that all statements, dates, and uploaded documents are factual and submitted in good faith.</li>
              <li>Frivolous, abusive, or defamatory submissions targeting healthcare personnel are strictly prohibited and may result in platform suspension.</li>
              <li>Hospitals are held to statutory turnaround targets (typically 48 to 72 hours for initial review) under State health administration oversight.</li>
            </ul>
          </section>

          {/* Section 6 */}
          <section className="legal-section">
            <h2>6. Limitation of Liability</h2>
            <p>
              To the maximum extent permitted under applicable law, HealthFlow, its developers, and affiliated healthcare entities shall not be liable for any indirect, incidental, or consequential damages resulting from third-party network outages, delayed patient reporting, or clinical decisions made independently by participating physicians.
            </p>
          </section>

          {/* Section 7 */}
          <section className="legal-section">
            <h2>7. Governing Law & Jurisdiction</h2>
            <p>
              These Terms shall be governed by and construed in accordance with the laws of the Republic of India. Any legal disputes arising out of the use of this Platform shall be subject to the exclusive jurisdiction of the competent courts in <strong>Patiala, Punjab</strong>.
            </p>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="legal-footer">
        <div className="max-w-5xl mx-auto px-6 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-slate-500">
          <span>© 2026 HealthFlow Platform. All rights reserved.</span>
          <div className="flex gap-4">
            <button onClick={() => navigate('/privacy')} className="hover:text-emerald-400 transition">Privacy Policy</button>
            <button onClick={() => navigate('/patient/complaints')} className="hover:text-emerald-400 transition">Grievance Portal</button>
            <button onClick={() => navigate('/')} className="hover:text-emerald-400 transition">Home</button>
          </div>
        </div>
      </footer>
    </div>
  );
}
