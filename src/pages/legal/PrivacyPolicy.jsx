import React from 'react';
import { useNavigate } from 'react-router-dom';
import { HeartPulse, ArrowLeft, ShieldCheck, Lock, FileText, CheckCircle2, Mail, Phone } from 'lucide-react';
import './Legal.css';

export default function PrivacyPolicy() {
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
            <ShieldCheck size={16} />
            <span>ABDM & DPDP ACT 2023 COMPLIANT</span>
          </div>

          <h1 className="legal-title">Privacy Policy</h1>
          <p className="legal-subtitle">
            Last Updated: September 10, 2026 • Effective Date: January 1, 2026
          </p>

          <div className="legal-intro">
            HealthFlow ("we", "our", or "the Platform") operates a decentralized, intelligent healthcare coordination network coordinating patients, clinical specialists, and government/private hospitals across Patiala and Punjab. We are committed to safeguarding your Electronic Health Records (EHR), personal identifying information (PII), and biometric/telehealth session data in strict compliance with the <strong>Digital Personal Data Protection Act (DPDP Act, 2023)</strong> and the <strong>Ayushman Bharat Digital Mission (ABDM)</strong> standards.
          </div>

          <hr className="legal-divider" />

          {/* Section 1 */}
          <section className="legal-section">
            <h2>1. Information We Collect</h2>
            <p>To facilitate zero-wait outpatient queue tokens, smart emergency routing, and telehealth encounters, we collect the following categories of data:</p>
            <ul>
              <li><strong>Patient Identity Information:</strong> Full legal name, date of birth, gender, contact phone number, and email address.</li>
              <li><strong>Universal Patient Identifier:</strong> System-generated collision-free identifier (e.g., <code>MH-YYYY-XXXXXX</code>) and voluntary Ayushman Bharat Health Account (ABHA) address.</li>
              <li><strong>Medical & Diagnostic Data:</strong> Self-reported triage symptoms, selected clinical departments, appointment timestamps, past consultation summaries, and laboratory diagnostics voluntarily uploaded for doctor review.</li>
              <li><strong>Emergency Geolocation Data:</strong> Precise GPS coordinates captured strictly upon patient activation of the Emergency SOS feature for dispatching the nearest 108/112 ambulance.</li>
              <li><strong>Technical Metadata:</strong> Browser type, anonymized IP address, session timestamps, and device security characteristics for fraud detection.</li>
            </ul>
          </section>

          {/* Section 2 */}
          <section className="legal-section">
            <h2>2. Purpose and Lawful Basis for Processing</h2>
            <p>We process your personal and health information exclusively under the following legal grounds:</p>
            <div className="legal-grid">
              <div className="legal-box">
                <CheckCircle2 size={18} className="text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <strong>Clinical Triage & Appointment Scheduling:</strong> Allocating live tokens, minimizing physical hospital wait-room congestion, and connecting you with qualified physicians.
                </div>
              </div>
              <div className="legal-box">
                <CheckCircle2 size={18} className="text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <strong>Emergency Ambulance Dispatch:</strong> Transmitting real-time routing vectors to emergency vehicle crews and hospital trauma units.
                </div>
              </div>
              <div className="legal-box">
                <CheckCircle2 size={18} className="text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <strong>Grievance Redressal:</strong> Investigating service complaints, billing anomalies, or facility hygiene reports via the Public Complaint Portal.
                </div>
              </div>
              <div className="legal-box">
                <CheckCircle2 size={18} className="text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <strong>Public Health Analytics:</strong> Generating aggregated, strictly de-identified crowd-density forecasts for hospital administrators.
                </div>
              </div>
            </div>
          </section>

          {/* Section 3 */}
          <section className="legal-section">
            <h2>3. Cryptographic Security & Data Storage</h2>
            <p>
              Your security is engineered into our core architecture:
            </p>
            <ul>
              <li><strong>Password Hashing:</strong> All authentication credentials are salted and cryptographically hashed with SHA-256 before persistence. We never store plain-text passwords.</li>
              <li><strong>Transit Encryption:</strong> All client-server communications require TLS 1.3 encryption with HTTP Strict Transport Security (HSTS) forced across all subdomains.</li>
              <li><strong>Teleconsultation Privacy:</strong> Peer-to-peer WebRTC video consultations utilize end-to-end SRTP encryption. Video streams are never recorded or stored on central servers without explicit, affirmative bilateral consent.</li>
              <li><strong>Local Data Storage:</strong> Active session tokens and cached preferences are stored securely in browser <code>localStorage</code> with strict origin isolation.</li>
            </ul>
          </section>

          {/* Section 4 */}
          <section className="legal-section">
            <h2>4. Third-Party Sharing & Disclosure Restrictions</h2>
            <p>
              <strong>HealthFlow does NOT sell, rent, or monetize your health data under any circumstance.</strong>
            </p>
            <p>Information is shared only with:</p>
            <ol>
              <li>The specific hospital and consulting medical practitioners you explicitly select for an appointment.</li>
              <li>Accredited government emergency medical dispatchers (108/112) when an Emergency SOS trigger is fired.</li>
              <li>Statutory law enforcement or public health agencies solely when compelled by lawful judicial warrant under Indian law.</li>
            </ol>
          </section>

          {/* Section 5 */}
          <section className="legal-section">
            <h2>5. Patient Rights under DPDP Act 2023</h2>
            <p>As a data principal, you hold absolute rights regarding your personal health information:</p>
            <ul>
              <li><strong>Right to Access:</strong> View and export your complete consultation history and uploaded records anytime through the Patient Portal.</li>
              <li><strong>Right to Rectification:</strong> Update obsolete contact details or report inaccuracies in medical records.</li>
              <li><strong>Right to Erasure / Account Deletion:</strong> Request complete removal of non-statutory personal data from our operational databases.</li>
              <li><strong>Right to Withdraw Consent:</strong> Revoke consent for optional features (such as non-critical notifications) at any time.</li>
            </ul>
          </section>

          {/* Section 6 */}
          <section className="legal-section">
            <h2>6. Data Protection Officer & Grievance Contact</h2>
            <p>For inquiries regarding privacy, data rights, or security disclosures, contact our designated Data Protection Officer:</p>
            <div className="legal-contact-card">
              <div>
                <strong>Grievance & Data Protection Officer</strong>
                <p>HealthFlow Coordination Centre, GMC Rajindra Complex, Patiala, Punjab – 147001</p>
              </div>
              <div className="flex flex-wrap gap-4 text-sm mt-3">
                <a href="mailto:privacy@healthflow.gov.in" className="flex items-center gap-1.5 text-emerald-400 hover:underline">
                  <Mail size={15} />
                  <span>privacy@healthflow.gov.in</span>
                </a>
                <a href="tel:1800180112" className="flex items-center gap-1.5 text-emerald-400 hover:underline">
                  <Phone size={15} />
                  <span>1800-180-112 (Toll Free)</span>
                </a>
              </div>
            </div>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="legal-footer">
        <div className="max-w-5xl mx-auto px-6 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-slate-500">
          <span>© 2026 HealthFlow Platform. All rights reserved.</span>
          <div className="flex gap-4">
            <button onClick={() => navigate('/terms')} className="hover:text-emerald-400 transition">Terms & Conditions</button>
            <button onClick={() => navigate('/patient/complaints')} className="hover:text-emerald-400 transition">Grievance Portal</button>
            <button onClick={() => navigate('/')} className="hover:text-emerald-400 transition">Home</button>
          </div>
        </div>
      </footer>
    </div>
  );
}
