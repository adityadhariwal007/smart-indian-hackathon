import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { 
  FileText, Search, List, ShieldAlert, PlusCircle, 
  HelpCircle, ShieldCheck, HeartPulse, CheckCircle2 
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import ComplaintForm from '../../components/complaints/ComplaintForm';
import ComplaintTracker from '../../components/complaints/ComplaintTracker';
import MyComplaintsList from '../../components/complaints/MyComplaintsList';
import { queryComplaints } from '../../services/complaintService';
import '../../components/complaints/Complaints.css';

export default function ComplaintsPage() {
  const { user } = useAuth();
  const { language } = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // Tab: 'submit' | 'track' | 'my-complaints'
  const initialTab = searchParams.get('tab') || 'submit';
  const [activeTab, setActiveTab] = useState(initialTab);
  const [trackId, setTrackId] = useState(searchParams.get('id') || '');
  const [myComplaintsCount, setMyComplaintsCount] = useState(0);

  // Sync tab with URL search param
  useEffect(() => {
    const t = searchParams.get('tab');
    if (t && ['submit', 'track', 'my-complaints'].includes(t)) {
      setActiveTab(t);
    }
    const id = searchParams.get('id');
    if (id) {
      setTrackId(id);
    }
  }, [searchParams]);

  // Load count of user complaints
  const updateCount = () => {
    const list = queryComplaints({ user });
    setMyComplaintsCount(list.length);
  };

  useEffect(() => {
    updateCount();
    window.addEventListener('healthflow:complaints_updated', updateCount);
    return () => window.removeEventListener('healthflow:complaints_updated', updateCount);
  }, [user]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSearchParams(prev => {
      const next = new URLSearchParams(prev);
      next.set('tab', tab);
      return next;
    });
  };

  const handleComplaintSubmitted = (newComplaint) => {
    updateCount();
  };

  const handleTrackComplaint = (id) => {
    setTrackId(id);
    setActiveTab('track');
    setSearchParams({ tab: 'track', id });
  };

  return (
    <div className="complaints-container">
      {/* Page Header */}
      <div className="complaints-header">
        <div className="complaints-header-badge">
          <ShieldAlert size={13} />
          <span>Patient Grievance & Quality Redressal Cell</span>
        </div>
        <h1 className="complaints-title">
          {language === 'hi' ? 'स्वास्थ्य सेवा शिकायत व निवारण पोर्टल' : 'Healthcare Complaint Portal'}
        </h1>
        <p className="complaints-subtitle">
          {language === 'hi' 
            ? 'अस्पताल सेवाओं, डॉक्टरों, नर्सिंग स्टाफ, एम्बुलेंस, प्रतीक्षा समय या बिलिंग से संबंधित अपनी शिकायतें दर्ज करें और उनकी जांच प्रगति को रीयल-टाइम में ट्रैक करें।'
            : 'Report concerns regarding hospitals, clinical staff, ambulance services, waiting times, or billing. Every complaint is tracked with guaranteed administrative review under state quality standards.'}
        </p>
      </div>

      {/* 3 Main Navigation Tabs */}
      <div className="complaints-nav-tabs">
        <button
          type="button"
          onClick={() => handleTabChange('submit')}
          className={`complaints-tab-btn ${activeTab === 'submit' ? 'active' : ''}`}
        >
          <PlusCircle size={17} />
          <span>Submit a Complaint</span>
        </button>

        <button
          type="button"
          onClick={() => handleTabChange('track')}
          className={`complaints-tab-btn ${activeTab === 'track' ? 'active' : ''}`}
        >
          <Search size={17} />
          <span>Track Complaint</span>
        </button>

        <button
          type="button"
          onClick={() => handleTabChange('my-complaints')}
          className={`complaints-tab-btn ${activeTab === 'my-complaints' ? 'active' : ''}`}
        >
          <List size={17} />
          <span>My Complaints</span>
          {myComplaintsCount > 0 && (
            <span className="complaints-tab-count">{myComplaintsCount}</span>
          )}
        </button>
      </div>

      {/* Tab Content Panels */}
      <div className="complaints-tab-content">
        {activeTab === 'submit' && (
          <ComplaintForm 
            onSuccess={handleComplaintSubmitted}
            onTrackComplaint={handleTrackComplaint}
          />
        )}

        {activeTab === 'track' && (
          <ComplaintTracker 
            initialId={trackId}
            onOpenSubmit={() => handleTabChange('submit')}
          />
        )}

        {activeTab === 'my-complaints' && (
          <MyComplaintsList 
            user={user}
            onFileNewComplaint={() => handleTabChange('submit')}
          />
        )}
      </div>

      {/* Footer Support Banner */}
      <div className="mt-12 p-4 bg-slate-50 border border-slate-200 rounded-xl flex flex-wrap items-center justify-between gap-4 text-xs text-slate-600">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white rounded-lg border border-slate-200 text-emerald-600">
            <ShieldCheck size={18} />
          </div>
          <div>
            <span className="font-bold text-slate-800 block">Immediate Medical Emergency Notice</span>
            <span>If you are facing an acute life-threatening medical emergency, call <strong>112</strong> or <strong>108</strong> immediately.</span>
          </div>
        </div>
        <button
          type="button"
          onClick={() => navigate('/patient/emergency')}
          className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition"
        >
          Emergency SOS
        </button>
      </div>
    </div>
  );
}
