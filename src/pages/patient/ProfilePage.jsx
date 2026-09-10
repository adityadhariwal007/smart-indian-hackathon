import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { User, Phone, Mail, MapPin, Heart, Shield, Award, Edit3, Save, CheckCircle, FileText, Activity } from 'lucide-react';

export default function ProfilePage() {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const [formData, setFormData] = useState({
    name: user?.name || 'Aditya Kumar',
    email: user?.email || 'aditya.demo@healthflow.in',
    phone: user?.phone || '+91-98765-43210',
    bloodGroup: user?.bloodGroup || 'O+',
    age: user?.age || 32,
    gender: 'Male',
    address: 'Sector 14, Connaught Place, New Delhi',
    emergencyContact: '+91-98111-22334 (Brother - Rohan)',
    abhaId: '91-4521-8890-1234',
    scheme: 'Ayushman Bharat PM-JAY (Eligible)',
    allergies: 'Penicillin, Dust Mites',
    chronicConditions: 'Mild Hypertension (Managed)',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsEditing(false);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <User size={24} style={{ color: 'var(--primary)' }} />
            Patient Health Profile
          </h2>
          <p className="text-secondary text-sm">
            Manage your ABHA digital health ID, medical history, and emergency details
          </p>
        </div>

        <button
          className={`btn ${isEditing ? 'btn-success' : 'btn-secondary'} btn-sm`}
          onClick={() => {
            if (isEditing) {
              setSavedSuccess(true);
              setTimeout(() => setSavedSuccess(false), 3000);
            }
            setIsEditing(!isEditing);
          }}
        >
          {isEditing ? <><Save size={16} /> Save Changes</> : <><Edit3 size={16} /> Edit Profile</>}
        </button>
      </div>

      {savedSuccess && (
        <div className="p-3 bg-success-light text-success rounded-lg flex items-center gap-2 text-sm border border-success">
          <CheckCircle size={18} />
          Profile updated successfully! All records synchronized with HealthFlow network.
        </div>
      )}

      {/* ABHA / Identity Card */}
      <div
        className="card p-6 text-white relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #0891B2 0%, #0E7490 50%, #155E75 100%)',
          borderRadius: '16px',
          boxShadow: 'var(--shadow-lg)'
        }}
      >
        <div className="relative z-10 flex flex-wrap justify-between items-start gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Shield size={20} className="text-teal-200" />
              <span className="text-xs tracking-wider uppercase opacity-90">National Health Authority • ABHA Card</span>
            </div>
            <h3 className="text-2xl font-bold mb-1">{formData.name}</h3>
            <p className="text-sm opacity-90">ABHA Number: <span className="font-mono font-semibold tracking-wider">{formData.abhaId}</span></p>
          </div>

          <div className="text-right">
            <span className="badge" style={{ background: 'rgba(255,255,255,0.2)', color: 'white' }}>
              ✓ Verified Patient
            </span>
            <div className="mt-2 text-xs opacity-80">Govt. of India Certified</div>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-teal-600 flex flex-wrap gap-6 text-sm">
          <div>
            <span className="opacity-75 block text-xs">Blood Group</span>
            <span className="font-bold text-lg text-rose-200">{formData.bloodGroup}</span>
          </div>
          <div>
            <span className="opacity-75 block text-xs">Age / Gender</span>
            <span className="font-bold">{formData.age} Yrs / {formData.gender}</span>
          </div>
          <div>
            <span className="opacity-75 block text-xs">Primary Scheme</span>
            <span className="font-bold text-emerald-200">{formData.scheme}</span>
          </div>
        </div>
      </div>

      {/* Main Details Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Personal & Contact */}
        <div className="card p-5 space-y-4">
          <h3 className="font-bold text-lg flex items-center gap-2 border-b pb-2">
            <User size={18} style={{ color: 'var(--primary)' }} />
            Personal & Contact Details
          </h3>

          <div className="space-y-3 text-sm">
            <div>
              <label className="text-xs text-secondary font-medium block mb-1">Full Name</label>
              {isEditing ? (
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="input w-full"
                />
              ) : (
                <div className="font-medium">{formData.name}</div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-secondary font-medium block mb-1">Phone Number</label>
                {isEditing ? (
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="input w-full"
                  />
                ) : (
                  <div className="flex items-center gap-1.5 font-medium">
                    <Phone size={14} className="text-secondary" /> {formData.phone}
                  </div>
                )}
              </div>

              <div>
                <label className="text-xs text-secondary font-medium block mb-1">Email</label>
                {isEditing ? (
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="input w-full"
                  />
                ) : (
                  <div className="flex items-center gap-1.5 font-medium truncate">
                    <Mail size={14} className="text-secondary" /> {formData.email}
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="text-xs text-secondary font-medium block mb-1">Residential Address</label>
              {isEditing ? (
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className="input w-full"
                />
              ) : (
                <div className="flex items-center gap-1.5 font-medium">
                  <MapPin size={14} className="text-secondary" /> {formData.address}
                </div>
              )}
            </div>

            <div>
              <label className="text-xs text-secondary font-medium block mb-1">Emergency Contact</label>
              {isEditing ? (
                <input
                  type="text"
                  name="emergencyContact"
                  value={formData.emergencyContact}
                  onChange={handleChange}
                  className="input w-full"
                />
              ) : (
                <div className="p-2.5 rounded-lg bg-danger-light text-danger font-medium border border-danger">
                  🚨 {formData.emergencyContact}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Medical & Clinical Summary */}
        <div className="card p-5 space-y-4">
          <h3 className="font-bold text-lg flex items-center gap-2 border-b pb-2">
            <Activity size={18} style={{ color: 'var(--primary)' }} />
            Clinical Snapshot & Vitals
          </h3>

          <div className="space-y-3 text-sm">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-secondary font-medium block mb-1">Known Allergies</label>
                {isEditing ? (
                  <input
                    type="text"
                    name="allergies"
                    value={formData.allergies}
                    onChange={handleChange}
                    className="input w-full"
                  />
                ) : (
                  <div className="p-2 rounded bg-bg-secondary font-medium text-amber-700">
                    ⚠️ {formData.allergies}
                  </div>
                )}
              </div>

              <div>
                <label className="text-xs text-secondary font-medium block mb-1">Chronic Conditions</label>
                {isEditing ? (
                  <input
                    type="text"
                    name="chronicConditions"
                    value={formData.chronicConditions}
                    onChange={handleChange}
                    className="input w-full"
                  />
                ) : (
                  <div className="p-2 rounded bg-bg-secondary font-medium">
                    {formData.chronicConditions}
                  </div>
                )}
              </div>
            </div>

            <div className="pt-2">
              <label className="text-xs text-secondary font-medium block mb-2">Connected Health Benefits</label>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-2.5 rounded-lg border bg-card">
                  <div className="flex items-center gap-2">
                    <Award size={18} style={{ color: 'var(--primary)' }} />
                    <div>
                      <div className="font-semibold text-xs">Ayushman Bharat PM-JAY</div>
                      <div className="text-xs text-secondary">₹5,00,000 Annual Family Cover</div>
                    </div>
                  </div>
                  <span className="badge badge-success text-xs">Active</span>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-lg border bg-card">
                  <div className="flex items-center gap-2">
                    <FileText size={18} style={{ color: '#10B981' }} />
                    <div>
                      <div className="font-semibold text-xs">Star Health Comprehensive</div>
                      <div className="text-xs text-secondary">Policy #SH-8829104</div>
                    </div>
                  </div>
                  <span className="badge badge-primary text-xs">Linked</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
