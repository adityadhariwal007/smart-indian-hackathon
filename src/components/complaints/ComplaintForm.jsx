import React, { useState } from 'react';
import { 
  Send, CheckCircle2, AlertCircle, Copy, Check, 
  FileText, Clock, Paperclip, X, Sparkles 
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import hospitals from '../../data/hospitals';
import { 
  COMPLAINT_CATEGORIES, 
  createComplaint 
} from '../../services/complaintService';

export default function ComplaintForm({ onSuccess, onTrackComplaint }) {
  const { user } = useAuth();
  const { addToast } = useNotifications();

  // Short & Simple state
  const [formData, setFormData] = useState({
    hospitalName: hospitals[0]?.name || 'Government Medical College & Rajindra Hospital',
    category: 'Waiting Time',
    description: '',
    fullName: user?.name && user.name !== 'Guest Patient' ? user.name : '',
    phone: user?.phone || '',
    attachments: [],
  });

  const [showAttachment, setShowAttachment] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionResult, setSubmissionResult] = useState(null);
  const [copiedId, setCopiedId] = useState(false);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => {
        const u = { ...prev };
        delete u[field];
        return u;
      });
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      addToast('File size must be under 5 MB', 'error');
      return;
    }
    setFormData(prev => ({
      ...prev,
      attachments: [{ name: file.name, size: file.size, type: file.type }]
    }));
  };

  const removeAttachment = () => {
    setFormData(prev => ({ ...prev, attachments: [] }));
    setShowAttachment(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    const errs = {};
    if (!formData.description.trim() || formData.description.trim().length < 10) {
      errs.description = 'Please provide a brief description (at least 10 characters).';
    }
    if (!formData.fullName.trim()) {
      errs.fullName = 'Please enter your name.';
    }
    const cleanPhone = formData.phone.replace(/[\s+-]/g, '');
    if (!cleanPhone || cleanPhone.length < 10) {
      errs.phone = 'Please enter a 10-digit mobile number.';
    }

    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setIsSubmitting(true);
    try {
      const created = await createComplaint(formData, user);
      setSubmissionResult(created);
      addToast(`Grievance submitted! ID: ${created.publicId}`, 'success');
      if (onSuccess) onSuccess(created);
    } catch (err) {
      console.error(err);
      addToast(err.message || 'Submission failed. Please try again.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyComplaintId = () => {
    if (!submissionResult?.publicId) return;
    navigator.clipboard.writeText(submissionResult.publicId);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  // SUCCESS CONFIRMATION SCREEN
  if (submissionResult) {
    return (
      <div className="complaint-success-box animate-in">
        <div className="complaint-success-icon">
          <CheckCircle2 size={36} />
        </div>
        <h2 className="text-xl font-extrabold text-slate-900 mb-1">
          Complaint Submitted Successfully
        </h2>
        <p className="text-xs text-slate-500 mb-3">
          Registered with the Patient Grievance Desk at <strong>{submissionResult.hospitalName}</strong>.
        </p>

        <div className="complaint-id-badge">
          <span>{submissionResult.publicId}</span>
          <button 
            type="button" 
            onClick={copyComplaintId}
            className="text-emerald-400 hover:text-white transition p-1"
            title="Copy ID"
          >
            {copiedId ? <Check size={18} /> : <Copy size={18} />}
          </button>
        </div>

        <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600 mb-5 max-w-md mx-auto text-left space-y-1">
          <div>Status: <span className="font-bold text-emerald-700">{submissionResult.status}</span></div>
          <div>Assigned: <span className="font-semibold text-slate-800">{submissionResult.assignedDepartment}</span></div>
          <div>Response SLA: <span className="font-semibold text-slate-800">Within 24–48 hours</span></div>
        </div>

        <div className="flex justify-center gap-3">
          <button
            type="button"
            onClick={() => onTrackComplaint && onTrackComplaint(submissionResult.publicId)}
            className="complaint-submit-btn text-xs py-2 px-4"
          >
            <Clock size={15} />
            <span>Track This Complaint</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setSubmissionResult(null);
              setFormData({
                hospitalName: hospitals[0]?.name || '',
                category: 'Waiting Time',
                description: '',
                fullName: user?.name || '',
                phone: user?.phone || '',
                attachments: [],
              });
            }}
            className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition"
          >
            Submit Another
          </button>
        </div>
      </div>
    );
  }

  // SHORT & SIMPLE FORM
  return (
    <form onSubmit={handleSubmit} className="complaint-card-box max-w-2xl mx-auto" noValidate>
      <div className="border-b border-slate-100 pb-3 mb-5 flex justify-between items-center">
        <div>
          <h3 className="text-base font-bold text-slate-900">Report an Issue</h3>
          <p className="text-xs text-slate-500">
            Tell us what went wrong. We will review and investigate your concern.
          </p>
        </div>
        <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
          Fast Grievance Form
        </span>
      </div>

      <div className="space-y-4">
        {/* 1. Hospital & Category (2-column row) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Select Hospital *
            </label>
            <select
              className="complaint-select text-xs"
              value={formData.hospitalName}
              onChange={(e) => handleChange('hospitalName', e.target.value)}
            >
              {hospitals.map(h => (
                <option key={h.id} value={h.name}>{h.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Issue Type *
            </label>
            <select
              className="complaint-select text-xs"
              value={formData.category}
              onChange={(e) => handleChange('category', e.target.value)}
            >
              {COMPLAINT_CATEGORIES.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>

        {/* 2. What happened? (Single clear description box) */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <label className="text-xs font-bold text-slate-700">
              What happened? *
            </label>
            <span className="text-[11px] text-slate-400 font-medium">
              {formData.description.length}/1000
            </span>
          </div>
          <textarea
            maxLength={1000}
            className={`complaint-textarea text-xs ${errors.description ? 'error' : ''}`}
            placeholder="Describe your issue (e.g. Waited over 2 hours in OPD Room 4 without doctor update, or billing discrepancy)..."
            style={{ minHeight: '100px' }}
            value={formData.description}
            onChange={(e) => handleChange('description', e.target.value)}
          />
          {errors.description && (
            <span className="complaint-error-text text-xs mt-1">
              <AlertCircle size={12} /> {errors.description}
            </span>
          )}
        </div>

        {/* 3. Your Contact Details (Single 2-column row) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Your Name *
            </label>
            <input
              type="text"
              placeholder="e.g. Aditya Kumar"
              className={`complaint-input text-xs ${errors.fullName ? 'error' : ''}`}
              value={formData.fullName}
              onChange={(e) => handleChange('fullName', e.target.value)}
            />
            {errors.fullName && (
              <span className="complaint-error-text text-xs mt-1">
                <AlertCircle size={12} /> {errors.fullName}
              </span>
            )}
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Mobile Number (for updates) *
            </label>
            <input
              type="tel"
              placeholder="10-digit mobile number"
              className={`complaint-input text-xs ${errors.phone ? 'error' : ''}`}
              value={formData.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
            />
            {errors.phone && (
              <span className="complaint-error-text text-xs mt-1">
                <AlertCircle size={12} /> {errors.phone}
              </span>
            )}
          </div>
        </div>

        {/* 4. Optional Attachment (Compact 1-line) */}
        <div className="pt-2 border-t border-slate-100">
          {!showAttachment && formData.attachments.length === 0 ? (
            <button
              type="button"
              onClick={() => setShowAttachment(true)}
              className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1.5 transition"
            >
              <Paperclip size={13} />
              <span>+ Attach photo or receipt (optional)</span>
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <input
                type="file"
                accept=".jpg,.jpeg,.png,.pdf"
                className="text-xs text-slate-600 file:mr-2 file:py-1 file:px-2.5 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
                onChange={handleFileUpload}
              />
              {formData.attachments.length > 0 && (
                <button
                  type="button"
                  onClick={removeAttachment}
                  className="p-1 text-slate-400 hover:text-red-500 transition"
                  title="Remove attachment"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Action footer */}
      <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
        <span className="text-[11px] text-slate-400">
          Guaranteed grievance desk review within 24h
        </span>

        <button
          type="submit"
          disabled={isSubmitting}
          className="complaint-submit-btn text-xs py-2.5 px-5"
        >
          {isSubmitting ? (
            <>
              <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Submitting...</span>
            </>
          ) : (
            <>
              <Send size={14} />
              <span>Submit Complaint</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}
