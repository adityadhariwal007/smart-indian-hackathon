import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { trackPageView } from '../../services/analytics';

const ROUTE_METADATA = {
  '/': {
    title: 'HealthFlow — Smart Healthcare Coordination & Outpatient Queue Network',
    description: 'Intelligent healthcare coordination across Patiala. Real-time hospital crowd tracking, zero-wait outpatient queue tokens, teleconsultations, and rapid 108/112 emergency ambulance dispatch.',
    keywords: 'healthcare coordination, patiala hospitals, opd tokens, emergency ambulance 108, doctor appointments, abdm triage'
  },
  '/login': {
    title: 'Sign In — HealthFlow Patient & Staff Portal',
    description: 'Sign in to HealthFlow using Google or verified Mobile OTP to access your appointments, prescriptions, and Universal Health ID.',
    keywords: 'healthflow login, google sign in, mobile otp, abha login, patient portal'
  },
  '/privacy': {
    title: 'Privacy Policy — HealthFlow Legal & Data Protection',
    description: 'HealthFlow Privacy Policy: Comprehensive patient health data security, DPDP Act 2023 compliance, and Ayushman Bharat Digital Mission (ABDM) standards.',
    keywords: 'privacy policy, dpdp act 2023, health data security, abdm compliance'
  },
  '/terms': {
    title: 'Terms & Conditions — HealthFlow Clinical & Service Protocols',
    description: 'Terms and Conditions governing outpatient queue tokens, telemedicine consultations, emergency triage disclaimers, and platform usage.',
    keywords: 'terms of service, telemedicine guidelines, patient terms, triage disclaimer'
  },
  '/patient': {
    title: 'Patient Overview — HealthFlow Care Portal',
    description: 'Patient dashboard for tracking upcoming clinical consultations, active queue tickets, and personal health metrics.',
    keywords: 'patient dashboard, queue ticket, health records'
  },
  '/patient/hospitals': {
    title: 'Find Hospitals & Live Crowd Status — HealthFlow Patiala',
    description: 'Explore 20 verified Patiala government and private hospitals. View live wait times, ICU bed availability, and book direct OPD consultations.',
    keywords: 'find hospital patiala, live crowd status, gmc rajindra, hospital wait times'
  },
  '/patient/appointments': {
    title: 'Appointments & Consultations — HealthFlow',
    description: 'View, schedule, and manage your in-person hospital visits and tele-consultations.',
    keywords: 'doctor appointments, opd booking, medical consult'
  },
  '/patient/complaints': {
    title: 'Healthcare Grievance & Complaint Portal — HealthFlow',
    description: 'Submit and track patient grievances regarding hospital waiting times, billing transparency, hygiene, or ambulance response.',
    keywords: 'hospital complaints, healthcare grievance, patient rights patiala'
  },
  '/patient/emergency': {
    title: 'Emergency SOS & Ambulance Dispatch — HealthFlow',
    description: 'Immediate 108/112 emergency response network. Real-time GPS location transmission to trauma centers and nearest ambulance units.',
    keywords: 'emergency sos, 108 ambulance, trauma hospital dispatch patiala'
  },
  '/patient/portal': {
    title: 'Universal Health ID Portal (ABHA) — HealthFlow',
    description: 'Access your permanent collision-free Universal Health ID, lifetime digital health records, and diagnostic reports.',
    keywords: 'universal health id, abha card, digital health records'
  },
  '/doctor': {
    title: 'Doctor Clinical Workspace — HealthFlow',
    description: 'Specialist clinical portal for OPD queue management, virtual tele-consultations, and diagnostic patient history review.',
    keywords: 'doctor dashboard, opd triage queue, clinical workspace'
  },
  '/admin': {
    title: 'Hospital Operations & Crowd Analytics — HealthFlow Admin',
    description: 'Real-time bed occupancy monitoring, surge crowd predictions, and inter-department resource allocation.',
    keywords: 'hospital admin, crowd analytics, bed management system'
  }
};

const DEFAULT_META = {
  title: 'HealthFlow — Smart Healthcare Coordination Platform',
  description: 'Right Hospital. Right Doctor. Right Time. Right Cost. Intelligent healthcare coordination for government and private hospitals.',
  keywords: 'healthcare, patiala, hospitals, appointments, abdm, ambulance'
};

export default function SEO({ title, description, keywords, image }) {
  const location = useLocation();

  useEffect(() => {
    const routeData = ROUTE_METADATA[location.pathname] || DEFAULT_META;

    const finalTitle = title || routeData.title;
    const finalDesc = description || routeData.description;
    const finalKeywords = keywords || routeData.keywords;
    const siteUrl = import.meta.env.VITE_SITE_URL || 'https://smart-indian-hackathon.vercel.app';
    const finalUrl = `${siteUrl}${location.pathname}`;
    const finalImage = image || `${siteUrl}/og-preview.png`;

    // 1. Set Document Title
    document.title = finalTitle;

    // 2. Helper to set or create meta tags
    const setMeta = (attr, key, content) => {
      let el = document.querySelector(`meta[${attr}="${key}"]`);
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute(attr, key);
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    };

    // Standard SEO
    setMeta('name', 'description', finalDesc);
    setMeta('name', 'keywords', finalKeywords);

    // Open Graph
    setMeta('property', 'og:title', finalTitle);
    setMeta('property', 'og:description', finalDesc);
    setMeta('property', 'og:url', finalUrl);
    setMeta('property', 'og:image', finalImage);
    setMeta('property', 'og:type', 'website');
    setMeta('property', 'og:site_name', 'HealthFlow');

    // Twitter Card
    setMeta('name', 'twitter:card', 'summary_large_image');
    setMeta('name', 'twitter:title', finalTitle);
    setMeta('name', 'twitter:description', finalDesc);
    setMeta('name', 'twitter:image', finalImage);

    // Canonical link
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', finalUrl);

    // 3. Analytics Pageview dispatch
    trackPageView(location.pathname, finalTitle);
  }, [location.pathname, title, description, keywords, image]);

  return null;
}
