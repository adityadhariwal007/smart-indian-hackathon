import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Stethoscope, Award, Building2, MapPin, Star, Clock, CheckCircle2, ShieldCheck, Mail, Phone, Edit3 } from 'lucide-react';

export default function DoctorProfile() {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);

  const [profile, setProfile] = useState({
    name: user?.name || 'Dr. Ananya Sharma',
    regNumber: 'DMC-48910 (Delhi Medical Council)',
    specialization: 'Cardiology & Interventional Cardiology',
    department: 'Cardiology',
    hospital: user?.hospital_name || 'CityCare Government Hospital',
    room: 'Chamber 204, OPD Block B',
    experience: '14 Years',
    qualifications: 'MBBS, MD (Internal Medicine), DM (Cardiology), FACC',
    phone: '+91-98765-43211',
    email: 'dr.ananya@healthflow.in',
    fee: '₹0 (Government OPD) / ₹800 (Private Evening OPD)',
    rating: 4.9,
    totalPatients: 14200,
    expertise: ['Angioplasty', 'Heart Failure Management', 'Echocardiography', 'Preventive Cardiology', 'Arrhythmia Evaluation'],
    bio: 'Senior Consultant Cardiologist with over 14 years of clinical experience in advanced cardiovascular therapeutics, radial coronary interventions, and inpatient cardiac critical care.'
  });

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Stethoscope size={26} style={{ color: 'var(--primary)' }} />
            Physician Credential & Profile
          </h2>
          <p className="text-secondary text-sm">
            Verified physician credentials, hospital affiliations, and professional bio
          </p>
        </div>

        <button
          className="btn btn-secondary btn-sm flex items-center gap-1.5"
          onClick={() => setIsEditing(!isEditing)}
        >
          <Edit3 size={16} /> {isEditing ? 'Done' : 'Edit Bio'}
        </button>
      </div>

      {/* Main Identity Card */}
      <div
        className="card p-6 text-white relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #0F766E 0%, #0D9488 50%, #14B8A6 100%)',
          borderRadius: '16px'
        }}
      >
        <div className="flex flex-wrap justify-between items-start gap-4">
          <div className="flex items-center gap-4">
            <div
              className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center font-bold text-2xl"
            >
              AS
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-2xl font-bold">{profile.name}</h3>
                <ShieldCheck size={20} className="text-emerald-200" />
              </div>
              <p className="text-sm opacity-90">{profile.specialization}</p>
              <p className="text-xs opacity-80 mt-1 font-mono">{profile.regNumber}</p>
            </div>
          </div>

          <div className="text-right">
            <span className="badge" style={{ background: 'rgba(255,255,255,0.25)', color: 'white' }}>
              ⭐ {profile.rating} / 5.0 Rating
            </span>
            <div className="mt-2 text-xs opacity-90">{profile.totalPatients.toLocaleString()}+ Consultations</div>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-teal-500 flex flex-wrap gap-6 text-sm">
          <div>
            <span className="opacity-75 block text-xs">Affiliated Hospital</span>
            <span className="font-semibold">{profile.hospital}</span>
          </div>
          <div>
            <span className="opacity-75 block text-xs">Chamber Location</span>
            <span className="font-semibold">{profile.room}</span>
          </div>
          <div>
            <span className="opacity-75 block text-xs">Experience</span>
            <span className="font-semibold">{profile.experience}</span>
          </div>
        </div>
      </div>

      {/* Grid: Qualifications & Bio */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="card p-5 space-y-4">
          <h3 className="font-bold text-lg border-b pb-2 flex items-center gap-2">
            <Award size={18} style={{ color: 'var(--primary)' }} />
            Degrees & Qualifications
          </h3>

          <div className="space-y-2 text-sm">
            <div className="p-3 bg-bg-secondary rounded-lg font-mono font-medium">
              {profile.qualifications}
            </div>

            <div>
              <span className="text-xs text-secondary block mb-1">Consultation Fee</span>
              <div className="p-2.5 rounded-lg border font-semibold text-primary">
                {profile.fee}
              </div>
            </div>

            <div className="pt-2">
              <span className="text-xs text-secondary block mb-2 font-medium">Clinical Sub-specialties</span>
              <div className="flex flex-wrap gap-1.5">
                {profile.expertise.map((item, idx) => (
                  <span key={idx} className="badge badge-primary text-xs">
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="card p-5 space-y-4">
          <h3 className="font-bold text-lg border-b pb-2 flex items-center gap-2">
            <Building2 size={18} style={{ color: 'var(--primary)' }} />
            Professional Bio & Department
          </h3>

          <div className="space-y-3 text-sm">
            {isEditing ? (
              <textarea
                className="input w-full h-32 leading-relaxed text-sm"
                value={profile.bio}
                onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
              />
            ) : (
              <p className="text-secondary leading-relaxed bg-bg-secondary p-4 rounded-xl">
                {profile.bio}
              </p>
            )}

            <div className="pt-2 space-y-2">
              <div className="flex items-center gap-2 text-xs text-secondary">
                <Mail size={14} /> {profile.email}
              </div>
              <div className="flex items-center gap-2 text-xs text-secondary">
                <Phone size={14} /> {profile.phone}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
