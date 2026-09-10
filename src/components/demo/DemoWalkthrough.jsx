import { useState } from 'react';
import { X, ChevronRight, ChevronLeft, MapPin, Clock, Users, Stethoscope, Star } from 'lucide-react';

const demoSteps = [
  {
    title: 'Welcome to HealthFlow Demo',
    subtitle: 'Experience the complete patient journey in 2 minutes',
    content: (
      <div style={{ textAlign: 'center', padding: '20px 0' }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>🏥</div>
        <h3 style={{ marginBottom: '8px' }}>HealthFlow — Smart Healthcare Platform</h3>
        <p style={{ color: 'var(--text-secondary)', maxWidth: '500px', margin: '0 auto', lineHeight: 1.6 }}>
          This demo shows how a patient can find the right hospital, doctor, and get a queue token
          — all powered by AI recommendations and real-time crowd data.
        </p>
        <div style={{ marginTop: '24px', padding: '12px 20px', background: 'var(--primary-bg)', borderRadius: '12px', display: 'inline-block' }}>
          <strong style={{ color: 'var(--primary-dark)' }}>
            "Right Hospital. Right Doctor. Right Time. Right Cost."
          </strong>
        </div>
      </div>
    ),
  },
  {
    title: 'Step 1: Patient Need',
    subtitle: 'A patient needs orthopedic consultation',
    content: (
      <div>
        <div style={{ background: 'var(--bg-secondary)', borderRadius: '12px', padding: '20px', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'linear-gradient(135deg, #0891B2, #0E7490)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>AK</div>
            <div>
              <div style={{ fontWeight: 600 }}>Aditya Kumar</div>
              <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Patient</div>
            </div>
          </div>
          <div style={{ background: 'white', borderRadius: '8px', padding: '12px 16px', border: '1px solid var(--border)' }}>
            "I need orthopedic consultation."
          </div>
        </div>
        <div style={{ background: 'var(--primary-bg)', borderRadius: '8px', padding: '12px 16px', fontSize: '14px' }}>
          <strong style={{ color: 'var(--primary-dark)' }}>🔍 AI Analysis:</strong>
          <span style={{ color: 'var(--primary-dark)' }}> Matched to <strong>Orthopedics</strong> department. Searching nearby hospitals...</span>
        </div>
      </div>
    ),
  },
  {
    title: 'Step 2: Hospital Comparison',
    subtitle: 'AI finds and compares nearby hospitals',
    content: (
      <div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {[
            { name: 'Rajiv Gandhi Memorial Hospital', dist: '2 km', crowd: 91, wait: 110, color: 'high', label: '🔴 High' },
            { name: 'Mahatma Gandhi CHC', dist: '4 km', crowd: 34, wait: 25, color: 'low', label: '🟢 Low', recommended: true },
            { name: 'Central District Hospital', dist: '5 km', crowd: 55, wait: 55, color: 'medium', label: '🟡 Medium' },
          ].map((h, i) => (
            <div key={i} style={{
              padding: '16px', borderRadius: '12px', border: h.recommended ? '2px solid var(--primary)' : '1px solid var(--border)',
              background: h.recommended ? 'var(--primary-bg)' : 'white', position: 'relative'
            }}>
              {h.recommended && (
                <span style={{ position: 'absolute', top: '-10px', right: '12px', background: 'var(--primary)', color: 'white', padding: '2px 10px', borderRadius: '10px', fontSize: '11px', fontWeight: 600 }}>
                  ⭐ AI Recommended
                </span>
              )}
              <div style={{ fontWeight: 600, marginBottom: '8px' }}>{h.name}</div>
              <div style={{ display: 'flex', gap: '16px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                <span>📍 {h.dist}</span>
                <span>{h.label} ({h.crowd}%)</span>
                <span>⏱️ {h.wait} min wait</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    title: 'Step 3: AI Recommendation',
    subtitle: 'Smart hospital recommendation based on multiple factors',
    content: (
      <div>
        <div style={{ background: 'linear-gradient(135deg, var(--primary-bg), #E0F7FA)', borderRadius: '12px', padding: '24px', border: '1px solid var(--primary-200)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <Star size={20} style={{ color: 'var(--primary)' }} />
            <strong style={{ color: 'var(--primary-dark)' }}>AI Recommendation</strong>
          </div>
          <p style={{ lineHeight: 1.7, color: 'var(--text)', marginBottom: '16px' }}>
            "Hospital B (Mahatma Gandhi CHC) is recommended because although it is farther away,
            its significantly lower predicted waiting time and available orthopedic specialist
            result in a shorter expected overall visit time."
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
            <div style={{ textAlign: 'center', padding: '8px', background: 'white', borderRadius: '8px' }}>
              <div style={{ fontWeight: 700, color: 'var(--success)' }}>34%</div>
              <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Crowd Level</div>
            </div>
            <div style={{ textAlign: 'center', padding: '8px', background: 'white', borderRadius: '8px' }}>
              <div style={{ fontWeight: 700, color: 'var(--success)' }}>25 min</div>
              <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Wait Time</div>
            </div>
            <div style={{ textAlign: 'center', padding: '8px', background: 'white', borderRadius: '8px' }}>
              <div style={{ fontWeight: 700, color: 'var(--primary)' }}>4 km</div>
              <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Distance</div>
            </div>
          </div>
        </div>
        <div className="disclaimer" style={{ marginTop: '12px' }}>
          <span>ⓘ</span>
          Recommendations are informational and not medical advice. Always consult a qualified healthcare professional.
        </div>
      </div>
    ),
  },
  {
    title: 'Step 4: Find Doctor',
    subtitle: 'Orthopedic specialists at selected hospital',
    content: (
      <div>
        <div style={{ padding: '16px', border: '2px solid var(--primary)', borderRadius: '12px', background: 'var(--primary-bg)', marginBottom: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'linear-gradient(135deg, #8B5CF6, #6366F1)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '14px' }}>RS</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600 }}>Dr. Ravi Saxena</div>
              <div style={{ fontSize: '13px', color: 'var(--primary-dark)' }}>Orthopedics</div>
            </div>
            <span style={{ background: 'var(--success-bg)', color: 'var(--success-text)', padding: '2px 8px', borderRadius: '10px', fontSize: '11px', fontWeight: 600 }}>Available Today</span>
          </div>
          <div style={{ marginTop: '12px', display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {['Joint Replacement', 'Sports Medicine', 'Fracture Management', 'Arthroscopy'].map(e => (
              <span key={e} style={{ padding: '2px 8px', background: 'white', borderRadius: '10px', fontSize: '11px', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}>{e}</span>
            ))}
          </div>
          <div style={{ marginTop: '12px', display: 'flex', gap: '16px', fontSize: '13px', color: 'var(--text-secondary)' }}>
            <span>🎓 18 years exp</span>
            <span>⏰ 2:00 PM – 5:00 PM</span>
            <span>💰 ₹350</span>
          </div>
        </div>
        <div style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: '13px' }}>
          ✓ Patient selects Dr. Ravi Saxena
        </div>
      </div>
    ),
  },
  {
    title: 'Step 5: Digital Queue Token',
    subtitle: 'Instant queue token with real-time tracking',
    content: (
      <div style={{ textAlign: 'center' }}>
        <div style={{ background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))', color: 'white', borderRadius: '16px', padding: '32px', marginBottom: '16px' }}>
          <div style={{ fontSize: '13px', opacity: 0.8, marginBottom: '8px' }}>YOUR TOKEN</div>
          <div style={{ fontSize: '48px', fontWeight: 800, letterSpacing: '2px' }}>B-127</div>
          <div style={{ fontSize: '14px', opacity: 0.9, marginTop: '8px' }}>Department: Orthopedics</div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
          <div style={{ padding: '12px', background: 'var(--bg-secondary)', borderRadius: '10px' }}>
            <div style={{ fontWeight: 700, fontSize: '20px' }}>B-104</div>
            <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Current Token</div>
          </div>
          <div style={{ padding: '12px', background: 'var(--bg-secondary)', borderRadius: '10px' }}>
            <div style={{ fontWeight: 700, fontSize: '20px' }}>23</div>
            <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Ahead of You</div>
          </div>
          <div style={{ padding: '12px', background: 'var(--warning-bg)', borderRadius: '10px' }}>
            <div style={{ fontWeight: 700, fontSize: '20px', color: 'var(--warning-text)' }}>24 min</div>
            <div style={{ fontSize: '11px', color: 'var(--warning-text)' }}>Est. Wait</div>
          </div>
        </div>
      </div>
    ),
  },
  {
    title: 'Step 6: Cost Estimate',
    subtitle: 'Transparent treatment cost estimation',
    content: (
      <div>
        <div style={{ border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden' }}>
          <div style={{ background: 'var(--bg-secondary)', padding: '12px 16px', fontWeight: 600 }}>
            Estimated Treatment Cost — Orthopedic Consultation
          </div>
          <div style={{ padding: '16px' }}>
            {[
              ['Consultation', '₹250–₹350'],
              ['X-Ray / Diagnostics', '₹500–₹1,500'],
              ['Physiotherapy (if needed)', '₹200–₹500'],
              ['Medicines', '₹500–₹1,500'],
            ].map(([item, cost]) => (
              <div key={item} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border-light)' }}>
                <span style={{ color: 'var(--text-secondary)' }}>{item}</span>
                <span style={{ fontWeight: 600 }}>{cost}</span>
              </div>
            ))}
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', fontWeight: 700, fontSize: '16px' }}>
              <span>Estimated Total</span>
              <span style={{ color: 'var(--primary)' }}>₹1,450–₹3,850</span>
            </div>
          </div>
        </div>
        <div className="disclaimer" style={{ marginTop: '12px' }}>
          <span>ⓘ</span>
          This is an estimate based on demo data. Actual costs may vary. Not a final quotation.
        </div>
      </div>
    ),
  },
  {
    title: 'Step 7: Hospital Admin View',
    subtitle: 'How the hospital admin sees incoming patients',
    content: (
      <div>
        <div style={{ background: 'var(--bg-secondary)', borderRadius: '12px', padding: '20px', marginBottom: '12px' }}>
          <div style={{ fontWeight: 700, marginBottom: '12px' }}>🏥 Hospital Operations Center</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
            {[
              ['Patients Today', '1,842', 'var(--primary)'],
              ['Current OPD', '684', 'var(--warning)'],
              ['Avg Wait', '38 min', 'var(--success)'],
            ].map(([label, value, color]) => (
              <div key={label} style={{ padding: '12px', background: 'white', borderRadius: '8px', textAlign: 'center' }}>
                <div style={{ fontWeight: 700, fontSize: '18px', color }}>{value}</div>
                <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ padding: '10px 14px', background: 'var(--warning-bg)', borderRadius: '8px', fontSize: '13px', color: 'var(--warning-text)' }}>
            ⚠ Orthopedics is receiving increased patient flow — new token B-127 assigned.
          </div>
          <div style={{ padding: '10px 14px', background: 'var(--success-bg)', borderRadius: '8px', fontSize: '13px', color: 'var(--success-text)' }}>
            ✓ Dr. Ravi Saxena is available and has capacity for 6 more patients today.
          </div>
        </div>
      </div>
    ),
  },
  {
    title: 'Demo Complete! 🎉',
    subtitle: 'HealthFlow — The complete healthcare coordination platform',
    content: (
      <div style={{ textAlign: 'center', padding: '20px 0' }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>✅</div>
        <h3 style={{ marginBottom: '12px' }}>Complete Patient Journey Demonstrated</h3>
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: '24px', maxWidth: '480px', margin: '0 auto 24px' }}>
          From searching for a hospital to getting a queue token and cost estimate — HealthFlow
          streamlines the entire healthcare coordination process.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px', maxWidth: '400px', margin: '0 auto' }}>
          {[
            '✓ AI Hospital Recommendation',
            '✓ Doctor Expertise Matching',
            '✓ Digital Queue Token',
            '✓ Cost Estimation',
            '✓ Ambulance Coordination',
            '✓ Admin Operations Center',
          ].map(item => (
            <div key={item} style={{ padding: '8px 12px', background: 'var(--success-bg)', borderRadius: '8px', fontSize: '12px', color: 'var(--success-text)', fontWeight: 500 }}>
              {item}
            </div>
          ))}
        </div>
      </div>
    ),
  },
];

export default function DemoWalkthrough({ onClose }) {
  const [step, setStep] = useState(0);
  const current = demoSteps[step];
  const isLast = step === demoSteps.length - 1;
  const isFirst = step === 0;

  return (
    <div className="demo-walkthrough" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="demo-step">
        <div className="demo-step-header">
          <div>
            <h3>{current.title}</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '4px' }}>{current.subtitle}</p>
          </div>
          <button className="btn btn-ghost" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="demo-step-body">
          {current.content}
        </div>

        <div className="demo-step-footer">
          <div className="demo-progress">
            {demoSteps.map((_, i) => (
              <div
                key={i}
                className={`demo-progress-dot ${i === step ? 'active' : i < step ? 'completed' : ''}`}
              />
            ))}
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            {!isFirst && (
              <button className="btn btn-secondary" onClick={() => setStep(s => s - 1)}>
                <ChevronLeft size={16} /> Previous
              </button>
            )}
            {isLast ? (
              <button className="btn btn-primary" onClick={onClose}>
                Close Demo
              </button>
            ) : (
              <button className="btn btn-primary" onClick={() => setStep(s => s + 1)}>
                Next <ChevronRight size={16} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
