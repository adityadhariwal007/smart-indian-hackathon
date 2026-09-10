import React, { useState } from 'react';
import { 
  Send, Upload, CheckCircle2, AlertCircle, Copy, Check, 
  FileText, Calendar, Building2, User, Phone, Mail, Clock, ArrowRight 
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import hospitals from '../../data/hospitals';
import departments from '../../data/departments';
import { 
  COMPLAINT_CATEGORIES, 
  createComplaint 
} from '../../services/complaintService';

export default function ComplaintForm({ onSuccess, onTrackComplaint }) {
  const { user } = useAuth();
  const { addToast } = useNotifications();

  // Form State initialized with logged-in user details if available
  const [formData, setFormData] = useState({
    fullName: user?.name && user.name !== 'Guest Patient' ? user.name : '',
    email: user?.email || '',
    phone: user?.phone || '',
    hospitalName: hospitals[0]?.name || '',
    hospitalId: hospitals[0]?.id || 1,
    category: COMPLAINT_CATEGORIES[0],
    department: departments[0]?.name || 'General Medicine',
    subject: '',
    description: '',
    incidentDate: new Date().toISOString().split('T')[0],
    preferredContact: 'Email',
    attachments: [],
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionResult, setSubmissionResult] = useState(null);
  const [copiedId, setCopiedId] = useState(false);

  // Field change handler preserving input
  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => {
        const updated = { ...prev };
        delete updated[field];
        return updated;
      });
    }
  };

  const handleHospitalChange = (e) => {
    const selectedHosp = hospitals.find(h => h.name === e.target.value);
    setFormData(prev => ({
      ...prev,
      hospitalName: e.target.value,
      hospitalId: selectedHosp ? selectedHosp.id : null,
    }));
  };

  // File upload handling with validation
  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const validFiles = [];
    let fileError = null;

    files.forEach(file => {
      if (file.size > 5 * 1024 * 1024) {
        fileError = `File "${file.name}" exceeds maximum allowed size of 5 MB.`;
        return;
      }
      const allowed = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
      if (!allowed.includes(file.type)) {
        fileError = `File "${file.name}" has unsupported format. Use JPG, PNG, or PDF.`;
        return;
      }
      validFiles.push({
        name: file.name,
        size: file.size,
        type: file.type,
      });
    });

    if (fileError) {
      setErrors(prev => ({ ...prev, attachments: fileError }));
      return;
    }

    setFormData(prev => ({
      ...prev,
      attachments: [...prev.attachments, ...validFiles].slice(0, 3), // Max 3 attachments
    }));
    setErrors(prev => {
      const u = { ...prev };
      delete u.attachments;
      return u;
    });
  };

  const removeAttachment = (index) => {
    setFormData(prev => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index),
    }));
  };

  // Client-side validation before submission
  const validateForm = () => {
    const errs = {};
    if (!formData.fullName.trim() || formData.fullName.trim().length < 2) {
      errs.fullName = 'Please enter your full name (minimum 2 characters).';
    }
    if (!formData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      errs.email = 'Please provide a valid email address.';
    }
    const cleanPhone = formData.phone.replace(/[\s+-]/g, '');
    if (!cleanPhone || !/^[6-9]\d{9}$/.test(cleanPhone.slice(-10))) {
      errs.phone = 'Please provide a valid 10-digit mobile number.';
    }
    if (!formData.hospitalName) {
      errs.hospitalName = 'Please select a hospital.';
    }
    if (!formData.subject.trim() || formData.subject.trim().length < 5) {
      errs.subject = 'Subject must be at least 5 characters.';
    }
    if (!formData.description.trim() || formData.description.trim().length < 20) {
      errs.description = 'Please provide a detailed explanation (minimum 20 characters).';
    }
    if (formData.description.length > 2000) {
      errs.description = 'Description cannot exceed 2,000 characters.';
    }
    if (!formData.incidentDate) {
      errs.incidentDate = 'Date of incident is required.';
    } else {
      const d = new Date(formData.incidentDate);
      const now = new Date();
      if (d > now) {
        errs.incidentDate = 'Incident date cannot be in the future.';
      }
    }
    return errs;
  };

  // Form Submit Handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return; // Prevent double submit

    const validation = validateForm();
    if (Object.keys(validation).length > 0) {
      setErrors(validation);
      addToast('Please correct the highlighted errors before submitting.', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const created = await createComplaint(formData, user);
      setSubmissionResult(created);
      addToast(`Complaint submitted successfully! ID: ${created.publicId}`, 'success');
      if (onSuccess) onSuccess(created);
    } catch (err) {
      console.error('Submission failed:', err);
      if (err.validationErrors) {
        setErrors(err.validationErrors);
      }
      addToast('Something went wrong while submitting your complaint. Please try again.', 'error');
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
        <h2 className="text-2xl font-extrabold text-slate-900 mb-2">
          Your complaint has been submitted successfully.
        </h2>
        <p className="text-sm text-slate-600 mb-4 max-w-md mx-auto">
          We have registered your grievance with the official Patient Grievance Cell at <strong>{submissionResult.hospitalName}</strong>.
        </p>

        <div className="complaint-id-badge">
          <span>{submissionResult.publicId}</span>
          <button 
            type="button" 
            onClick={copyComplaintId}
            className="text-emerald-400 hover:text-white transition p-1"
            title="Copy Complaint ID"
          >
            {copiedId ? <Check size={18} /> : <Copy size={18} />}
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3 text-left bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs mb-6 max-w-lg mx-auto">
          <div>
            <span className="text-slate-400 block font-medium">Submission Timestamp</span>
            <span className="text-slate-800 font-semibold">
              {new Date(submissionResult.createdAt).toLocaleDateString('en-IN', {
                day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
              })}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block font-medium">Current Status</span>
            <span className="text-emerald-700 font-bold bg-emerald-100 px-2 py-0.5 rounded-full inline-block mt-0.5">
              {submissionResult.status}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block font-medium">Assigned Cell</span>
            <span className="text-slate-800 font-semibold">{submissionResult.assignedDepartment}</span>
          </div>
          <div>
            <span className="text-slate-400 block font-medium">Preferred Contact</span>
            <span className="text-slate-800 font-semibold">{submissionResult.preferredContact}</span>
          </div>
        </div>

        <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900 mb-6 max-w-lg mx-auto leading-relaxed">
          <strong>Expected Next Step:</strong> A grievance officer will examine this record within <strong>24–48 hours</strong> and follow up via {submissionResult.preferredContact.toLowerCase()}.
        </div>

        <div className="flex flex-wrap justify-center gap-3">
          <button
            type="button"
            onClick={() => onTrackComplaint && onTrackComplaint(submissionResult.publicId)}
            className="complaint-submit-btn"
          >
            <Clock size={16} />
            <span>Track This Complaint</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setSubmissionResult(null);
              setFormData(prev => ({
                ...prev,
                subject: '',
                description: '',
                attachments: [],
              }));
            }}
            className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-sm font-semibold hover:bg-slate-50 transition"
          >
            Submit Another Complaint
          </button>
        </div>
      </div>
    );
  }

  // SUBMISSION FORM
  return (
    <form onSubmit={handleSubmit} className="complaint-card-box" noValidate>
      <div className="border-b border-slate-100 pb-4 mb-6 flex justify-between items-center">
        <div>
          <h3 className="text-lg font-bold text-slate-900">File a Healthcare Grievance</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            All reports are directly dispatched to hospital administrative grievance cells under state healthcare audit guidelines.
          </p>
        </div>
        <span className="text-[11px] font-semibold text-slate-400">
          Fields marked with <span className="text-red-500 font-bold">*</span> are required
        </span>
      </div>

      <div className="complaint-form-grid">
        {/* Full Name */}
        <div className="complaint-form-group">
          <label className="complaint-label">
            <span>Full Name <span className="required-star">*</span></span>
          </label>
          <input
            type="text"
            className={`complaint-input ${errors.fullName ? 'error' : ''}`}
            placeholder="e.g. Aditya Kumar"
            value={formData.fullName}
            onChange={(e) => handleChange('fullName', e.target.value)}
          />
          {errors.fullName && <span className="complaint-error-text"><AlertCircle size={12} /> {errors.fullName}</span>}
        </div>

        {/* Email */}
        <div className="complaint-form-group">
          <label className="complaint-label">
            <span>Email Address <span className="required-star">*</span></span>
          </label>
          <input
            type="email"
            className={`complaint-input ${errors.email ? 'error' : ''}`}
            placeholder="e.g. yourname@example.com"
            value={formData.email}
            onChange={(e) => handleChange('email', e.target.value)}
          />
          {errors.email && <span className="complaint-error-text"><AlertCircle size={12} /> {errors.email}</span>}
        </div>

        {/* Phone Number */}
        <div className="complaint-form-group">
          <label className="complaint-label">
            <span>Phone Number <span className="required-star">*</span></span>
          </label>
          <input
            type="tel"
            className={`complaint-input ${errors.phone ? 'error' : ''}`}
            placeholder="10-digit mobile number"
            value={formData.phone}
            onChange={(e) => handleChange('phone', e.target.value)}
          />
          {errors.phone && <span className="complaint-error-text"><AlertCircle size={12} /> {errors.phone}</span>}
        </div>

        {/* Preferred Contact Method */}
        <div className="complaint-form-group">
          <label className="complaint-label">
            <span>Preferred Contact Method</span>
          </label>
          <select
            className="complaint-select"
            value={formData.preferredContact}
            onChange={(e) => handleChange('preferredContact', e.target.value)}
          >
            <option value="Email">Email</option>
            <option value="Phone">Phone Call</option>
            <option value="WhatsApp">WhatsApp</option>
            <option value="SMS">SMS Text</option>
          </select>
        </div>

        {/* Hospital Name */}
        <div className="complaint-form-group">
          <label className="complaint-label">
            <span>Hospital Name <span className="required-star">*</span></span>
          </label>
          <select
            className={`complaint-select ${errors.hospitalName ? 'error' : ''}`}
            value={formData.hospitalName}
            onChange={handleHospitalChange}
          >
            {hospitals.map(h => (
              <option key={h.id} value={h.name}>
                {h.name} ({h.type})
              </option>
            ))}
          </select>
          {errors.hospitalName && <span className="complaint-error-text"><AlertCircle size={12} /> {errors.hospitalName}</span>}
        </div>

        {/* Location / Department */}
        <div className="complaint-form-group">
          <label className="complaint-label">
            <span>Department / Location <span className="required-star">*</span></span>
          </label>
          <select
            className="complaint-select"
            value={formData.department}
            onChange={(e) => handleChange('department', e.target.value)}
          >
            {departments.map(d => (
              <option key={d.id} value={d.name}>{d.name}</option>
            ))}
            <option value="Emergency Ward">Emergency / Trauma Ward</option>
            <option value="Billing Counter">Billing Counter / Cash Desk</option>
            <option value="Ambulance Dispatch">Ambulance Dispatch & Fleet</option>
            <option value="Jan Aushadhi Pharmacy">Hospital Pharmacy / Dispensary</option>
            <option value="Sanitation & Restrooms">Sanitation & Public Restrooms</option>
            <option value="Other">Other / General Facility</option>
          </select>
        </div>

        {/* Complaint Category */}
        <div className="complaint-form-group">
          <label className="complaint-label">
            <span>Complaint Category <span className="required-star">*</span></span>
          </label>
          <select
            className={`complaint-select ${errors.category ? 'error' : ''}`}
            value={formData.category}
            onChange={(e) => handleChange('category', e.target.value)}
          >
            {COMPLAINT_CATEGORIES.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          {errors.category && <span className="complaint-error-text"><AlertCircle size={12} /> {errors.category}</span>}
        </div>

        {/* Date of Incident */}
        <div className="complaint-form-group">
          <label className="complaint-label">
            <span>Date of Incident <span className="required-star">*</span></span>
          </label>
          <input
            type="date"
            max={new Date().toISOString().split('T')[0]}
            className={`complaint-input ${errors.incidentDate ? 'error' : ''}`}
            value={formData.incidentDate}
            onChange={(e) => handleChange('incidentDate', e.target.value)}
          />
          {errors.incidentDate && <span className="complaint-error-text"><AlertCircle size={12} /> {errors.incidentDate}</span>}
        </div>

        {/* Complaint Subject */}
        <div className="complaint-form-group complaint-field-full">
          <label className="complaint-label">
            <span>Complaint Subject <span className="required-star">*</span></span>
            <span className="complaint-label-hint">{formData.subject.length}/100</span>
          </label>
          <input
            type="text"
            maxLength={100}
            className={`complaint-input ${errors.subject ? 'error' : ''}`}
            placeholder="Brief summary of the issue (e.g. Unexplained wait in OPD Room 4)"
            value={formData.subject}
            onChange={(e) => handleChange('subject', e.target.value)}
          />
          {errors.subject && <span className="complaint-error-text"><AlertCircle size={12} /> {errors.subject}</span>}
        </div>

        {/* Detailed Description */}
        <div className="complaint-form-group complaint-field-full">
          <label className="complaint-label">
            <span>Detailed Description <span className="required-star">*</span></span>
            <span className="complaint-label-hint">{formData.description.length}/2000 (Min 20 chars)</span>
          </label>
          <textarea
            maxLength={2000}
            className={`complaint-textarea ${errors.description ? 'error' : ''}`}
            placeholder="Please provide specific details including room numbers, staff designations, token codes, or time of day..."
            value={formData.description}
            onChange={(e) => handleChange('description', e.target.value)}
          />
          {errors.description && <span className="complaint-error-text"><AlertCircle size={12} /> {errors.description}</span>}
        </div>

        {/* Attachment Upload */}
        <div className="complaint-form-group complaint-field-full">
          <label className="complaint-label">
            <span>Attach Evidence or Supporting Documents (Optional)</span>
            <span className="complaint-label-hint">JPG, PNG, PDF up to 5MB (Max 3 files)</span>
          </label>

          <label className="complaint-upload-zone">
            <Upload size={24} className="text-emerald-600" />
            <span className="text-xs font-semibold text-slate-700">
              Click to browse or drop photos/receipts here
            </span>
            <input
              type="file"
              multiple
              accept=".jpg,.jpeg,.png,.webp,.pdf"
              className="hidden"
              onChange={handleFileUpload}
            />
          </label>

          {errors.attachments && (
            <span className="complaint-error-text mt-1"><AlertCircle size={12} /> {errors.attachments}</span>
          )}

          {formData.attachments.length > 0 && (
            <div className="flex flex-col gap-2 mt-2">
              {formData.attachments.map((file, idx) => (
                <div key={idx} className="complaint-upload-preview">
                  <div className="flex items-center gap-2 truncate">
                    <FileText size={16} className="text-slate-500 shrink-0" />
                    <span className="truncate font-medium">{file.name}</span>
                    <span className="text-slate-400 text-[11px]">({(file.size / 1024).toFixed(0)} KB)</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeAttachment(idx)}
                    className="text-red-500 hover:text-red-700 text-xs font-bold ml-2 shrink-0"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="mt-8 pt-5 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4">
        <div className="text-xs text-slate-500 max-w-md">
          By submitting this complaint, you certify that the provided information is accurate to the best of your knowledge under state public grievance guidelines.
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="complaint-submit-btn"
        >
          {isSubmitting ? (
            <>
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Registering Complaint...</span>
            </>
          ) : (
            <>
              <Send size={16} />
              <span>Submit Complaint</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}
