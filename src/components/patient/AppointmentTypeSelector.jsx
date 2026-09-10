import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Laptop, Calendar, MapPin, Building2, ArrowRight, 
  Check, Video, Clock, ShieldCheck, Sparkles, Stethoscope 
} from 'lucide-react';
import './AppointmentTypeSelector.css';

export default function AppointmentTypeSelector({
  onSelectType,
  onBookOnline,
  onBookOffline,
  defaultSelected = null
}) {
  const navigate = useNavigate();
  const [selectedType, setSelectedType] = useState(defaultSelected);

  const handleSelect = (type) => {
    setSelectedType(type);
    if (onSelectType) onSelectType(type);
  };

  const handleProceedOnline = (e) => {
    e.stopPropagation();
    setSelectedType('online');
    if (onBookOnline) {
      onBookOnline();
    } else {
      navigate('/patient/consultation');
    }
  };

  const handleProceedOffline = (e) => {
    e.stopPropagation();
    setSelectedType('offline');
    if (onBookOffline) {
      onBookOffline();
    } else {
      navigate('/patient/hospitals');
    }
  };

  return (
    <div className="appointment-selection-wrapper">
      <div className="appointment-selection-container">
        {/* Header Section */}
        <div className="selection-header">
          <div className="selection-eyebrow">
            <span className="selection-eyebrow-dot" />
            <span>Consultation Mode</span>
          </div>
          <h2 className="selection-title">
            How would you like to book?
          </h2>
          <p className="selection-subtitle">
            Choose the option that works best for you.
          </p>
        </div>

        {/* Side-by-Side Selectable Cards Grid */}
        <div className="selection-cards-grid">
          {/* Card 1: Online Appointment */}
          <div
            className={`selection-card card-online ${selectedType === 'online' ? 'selected' : ''}`}
            onClick={() => handleSelect('online')}
            role="button"
            tabIndex={0}
            aria-pressed={selectedType === 'online'}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleSelect('online'); }}
          >
            {/* Selection Checkbox Pill */}
            <div className="card-radio-indicator">
              <div className="card-radio-inner" />
            </div>

            <div>
              {/* Category Pill */}
              <span className="card-pill-tag">
                <Video size={12} />
                <span>Tele-Consultation</span>
              </span>

              {/* Icon Container with glowing halo */}
              <div className="card-icon-container">
                <div className="card-icon-halo" />
                <div className="relative z-10 flex items-center justify-center">
                  <Laptop size={28} />
                </div>
              </div>

              {/* Title & Description */}
              <h3 className="card-title">Online Appointment</h3>
              <p className="card-description">
                Book your appointment digitally from anywhere.
              </p>

              {/* Quick Perks List */}
              <div className="card-features-list">
                <div className="card-feature-item">
                  <Check size={14} className="text-sky-600 shrink-0" />
                  <span>Audio / Video call from phone or laptop</span>
                </div>
                <div className="card-feature-item">
                  <Check size={14} className="text-sky-600 shrink-0" />
                  <span>Digital prescriptions & instant triage advice</span>
                </div>
                <div className="card-feature-item">
                  <Check size={14} className="text-sky-600 shrink-0" />
                  <span>Zero travel & zero waiting room delays</span>
                </div>
              </div>
            </div>

            {/* Action Button */}
            <button
              type="button"
              className="card-action-btn"
              onClick={handleProceedOnline}
            >
              <span>Book Online</span>
              <ArrowRight size={17} className="arrow-icon" />
            </button>
          </div>

          {/* Card 2: Offline Appointment */}
          <div
            className={`selection-card card-offline ${selectedType === 'offline' ? 'selected' : ''}`}
            onClick={() => handleSelect('offline')}
            role="button"
            tabIndex={0}
            aria-pressed={selectedType === 'offline'}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleSelect('offline'); }}
          >
            {/* Selection Checkbox Pill */}
            <div className="card-radio-indicator">
              <div className="card-radio-inner" />
            </div>

            <div>
              {/* Category Pill */}
              <span className="card-pill-tag">
                <Building2 size={12} />
                <span>In-Person Visit</span>
              </span>

              {/* Icon Container with glowing halo */}
              <div className="card-icon-container">
                <div className="card-icon-halo" />
                <div className="relative z-10 flex items-center justify-center">
                  <Building2 size={28} />
                </div>
              </div>

              {/* Title & Description */}
              <h3 className="card-title">Offline Appointment</h3>
              <p className="card-description">
                Choose a nearby centre and book your visit.
              </p>

              {/* Quick Perks List */}
              <div className="card-features-list">
                <div className="card-feature-item">
                  <Check size={14} className="text-emerald-600 shrink-0" />
                  <span>In-person physical examination & vital checks</span>
                </div>
                <div className="card-feature-item">
                  <Check size={14} className="text-emerald-600 shrink-0" />
                  <span>Priority token allocation at 20 Patiala centers</span>
                </div>
                <div className="card-feature-item">
                  <Check size={14} className="text-emerald-600 shrink-0" />
                  <span>On-site diagnostic radiology & pharmacy access</span>
                </div>
              </div>
            </div>

            {/* Action Button */}
            <button
              type="button"
              className="card-action-btn"
              onClick={handleProceedOffline}
            >
              <span>Book Offline</span>
              <ArrowRight size={17} className="arrow-icon" />
            </button>
          </div>
        </div>

        {/* Reassurance Footer Strip */}
        <div className="selection-footer-strip">
          <div className="selection-footer-item">
            <ShieldCheck size={15} className="text-emerald-600" />
            <span>ABHA & ABDM Verified Network</span>
          </div>
          <div className="selection-footer-item">
            <Clock size={15} className="text-sky-600" />
            <span>Instant Confirmation & Real-Time Sync</span>
          </div>
          <div className="selection-footer-item">
            <Sparkles size={15} className="text-amber-500" />
            <span>Free Cancellation up to 1 hr Prior</span>
          </div>
        </div>
      </div>
    </div>
  );
}
