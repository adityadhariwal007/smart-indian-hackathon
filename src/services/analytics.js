/**
 * HealthFlow Privacy-First Analytics Service
 * 
 * Compliant with DPDP Act 2023 & GDPR.
 * Checks consent settings from localStorage before recording telemetry.
 * Supports window.gtag (Google Analytics 4), custom webhook pipelines,
 * and dev logging.
 */

const CONSENT_KEY = 'healthflow_cookie_consent_v1';

/**
 * Checks if user has given consent for analytics tracking
 */
export function hasAnalyticsConsent() {
  try {
    const raw = localStorage.getItem(CONSENT_KEY);
    if (!raw) {
      // Prior to user choice, default to minimal privacy-preserving mode
      return false;
    }
    const parsed = JSON.parse(raw);
    return Boolean(parsed.analytics);
  } catch (e) {
    return false;
  }
}

/**
 * Core event tracking dispatch
 * @param {string} eventName - e.g. 'book_appointment_click', 'emergency_sos_trigger'
 * @param {Record<string, any>} properties - Key-value metadata
 */
export function trackEvent(eventName, properties = {}) {
  const allowed = hasAnalyticsConsent();
  const timestamp = new Date().toISOString();
  const payload = {
    event: eventName,
    ...properties,
    url: window.location.pathname,
    timestamp
  };

  // 1. In Development or Debug mode, log to console for visibility
  if (import.meta.env.DEV || window.__HEALTHFLOW_DEBUG__) {
    console.info(
      `%c[HealthFlow Analytics]%c ${eventName} (Consent: ${allowed ? 'YES' : 'ANONYMIZED'})`,
      'color: #0284c7; font-weight: bold;',
      'color: inherit;',
      payload
    );
  }

  // 2. If consent not granted, do not send to external analytics networks
  if (!allowed) {
    return;
  }

  // 3. Dispatch to Google Analytics 4 (gtag) if installed
  if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
    window.gtag('event', eventName, properties);
  }

  // 4. Dispatch to Plausible if installed
  if (typeof window !== 'undefined' && typeof window.plausible === 'function') {
    window.plausible(eventName, { props: properties });
  }

  // 5. Custom in-app telemetry buffer (retained in sessionStorage for session debugging)
  try {
    const sessionLogKey = 'hf_session_events';
    const recent = JSON.parse(sessionStorage.getItem(sessionLogKey) || '[]');
    recent.push({ event: eventName, ...properties, time: timestamp });
    if (recent.length > 50) recent.shift();
    sessionStorage.setItem(sessionLogKey, JSON.stringify(recent));
  } catch (e) {}
}

/**
 * Track route / virtual page views
 * @param {string} path 
 * @param {string} title 
 */
export function trackPageView(path, title) {
  trackEvent('page_view', {
    page_path: path,
    page_title: title || document.title
  });

  if (hasAnalyticsConsent() && typeof window !== 'undefined' && typeof window.gtag === 'function') {
    window.gtag('config', import.meta.env.VITE_GA_MEASUREMENT_ID || 'G-HEALTHFLOW', {
      page_path: path,
      page_title: title
    });
  }
}

/**
 * Specialized Healthcare Interaction Events
 */
export const analytics = {
  trackPageView,
  trackEvent,

  // Outpatient Appointment Booking Conversion
  trackAppointmentBooking: (details = {}) => {
    trackEvent('appointment_booked', {
      doctor_name: details.doctor || 'Unknown',
      department: details.department || 'General',
      hospital: details.hospital || 'Patiala Network',
      booking_mode: details.type || 'offline', // 'online' | 'offline'
      time_slot: details.time || 'N/A'
    });
  },

  // Emergency SOS Activation
  trackEmergencyTrigger: (details = {}) => {
    trackEvent('emergency_sos_triggered', {
      trigger_source: details.source || 'web_button',
      has_geolocation: Boolean(details.hasLocation),
      hospital_target: details.hospital || 'Nearest Emergency Center'
    });
  },

  // Complaint Grievance Submission
  trackComplaintSubmitted: (details = {}) => {
    trackEvent('complaint_submitted', {
      category: details.category || 'General',
      department: details.department || 'General OPD',
      has_evidence: Boolean(details.hasFiles),
      severity: details.severity || 'normal'
    });
  },

  // Auth / Login conversion
  trackAuth: (method, status, extra = {}) => {
    trackEvent('auth_attempt', {
      auth_method: method, // 'google', 'mobile_otp', 'demo'
      status: status, // 'success', 'failed'
      ...extra
    });
  },

  // Hospital search and filter discovery
  trackHospitalSearch: (query, filterType, count) => {
    trackEvent('hospital_search', {
      query: query || '',
      filter: filterType || 'all',
      result_count: count || 0
    });
  }
};

export default analytics;
