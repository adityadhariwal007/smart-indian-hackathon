import React, { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext();

export const translations = {
  en: {
    // Nav & General
    brandName: 'HealthFlow',
    patient: 'Patient',
    doctor: 'Doctor',
    admin: 'Admin',
    patientPortal: 'Patient Portal',
    doctorPortal: 'Doctor Portal',
    adminPortal: 'Admin Portal',
    emergencySos: 'Emergency SOS',
    notifications: 'Notifications',
    signIn: 'Sign In',
    guest: 'Guest',

    // Hero Section
    badge: 'SMART HEALTHCARE COORDINATION',
    heroHeadlinePrefix: 'Behind every great patient experience',
    heroHeadlineLies: 'lies',
    heroSubheadline: 'Better healthcare. Less waiting. Less hassle.',
    trustAbha: 'ABHA & ABDM Verified Network',
    trustHospitals: '20+ Connected Hospitals',
    trustWait: '< 38 min Avg. Outpatient Wait',
    bookAppointment: 'Book an Appointment',
    emergencyBtn: 'Emergency',

    // Cards
    card1Tag: 'PATIALA HEALTHCARE DIRECTORY',
    card1Title: 'Verified Hospital Listings & Facilities',
    card1Desc: 'Access verified hospital information across Patiala district, including bed capacities, specialized departments, consultation fees (₹200–₹500), and live crowd status.',
    card1District: 'Patiala District Hospitals',
    card1Badge: '20 Verified Centers',
    card1Hosp1Name: 'GMC & Rajindra Hospital',
    card1Hosp1Desc: 'Sangrur Road • 1,100 Beds • Level-1 Trauma',
    card1Hosp2Name: 'Mata Kaushalya Hospital',
    card1Hosp2Desc: 'Lahori Gate • 420 Beds • Maternity & General',
    card1GovtFee: 'Govt • ₹200',
    card1Explore: 'Explore All 20 Patiala Hospitals',

    card1Benefit1: 'Real-time bed & ICU availability across 20+ centers',
    card1Benefit2: 'Clear consultation rates (₹200–₹500) with zero hidden fees',
    card1Benefit3: 'Direct mapping to Level-1 Trauma & emergency facilities',

    card2Tag: 'PATIENT SERVICES & TRIAGE',
    card2Title: 'Outpatient Queues & Emergency Support',
    card2Desc: 'Check queue status remotely to plan your hospital visit efficiently, and access direct 24/7 emergency response contacts for immediate medical assistance.',
    card2Benefit1: 'Remote digital token check-in — save ~45 min wait time',
    card2Benefit2: 'Smart AI crowd & estimated consultation forecast',
    card2Benefit3: 'One-touch 24/7 priority emergency SOS with GPS dispatch',
    card2QueueStatus: 'Digital Queue Status',
    card2ActiveHours: 'Active OPD Hours',
    card2TokenNumber: 'Token #A-128',
    card2TokenWait: 'General Medicine • Est. Wait ~20 min',
    card2InQueue: 'In Queue',
    card2Helpline: '24/7 Emergency Helplines: 112 / 108',
    card2Sos: 'SOS',

    // Stats
    statHospitals: 'Connected Hospitals',
    statSpecialists: 'Verified Specialists',
    statWait: 'Avg OPD Wait Time',
    statAccuracy: 'Triage Accuracy',

    // Bento / Capabilities
    capabilitiesTag: 'PLATFORM CAPABILITIES',
    whyHealthFlow: 'Why HealthFlow?',
    capabilitiesSub: 'One platform to solve healthcare accessibility, queue management, and emergency coordination.',
    bentoHospitalTitle: 'Smart Hospital Discovery',
    bentoHospitalDesc: 'Find hospitals based on distance, crowd, specialization and availability.',
    bentoCrowdTitle: 'AI Crowd Prediction',
    bentoCrowdDesc: 'Predict hospital and department congestion before you arrive.',
    bentoDocTitle: 'Doctor Expertise',
    bentoDocDesc: 'Find specialists based on their actual area of expertise.',
    bentoEmergencyTitle: 'Emergency Coordination',
    bentoEmergencyDesc: 'Locate and coordinate the nearest suitable ambulance.',
    learnMore: 'Learn more',

    // Footer
    footerDirectory: 'Hospital Directory',
    footerNetwork: 'Network Stats',
    footerFeatures: 'Platform Features',
    footerDemoNoticeTag: 'Demo Platform Notice',
    footerDemoNoticeText: 'HealthFlow is a demonstration platform with synthetic and fictional clinical data. It does not provide official medical advice, diagnosis, or treatment. In a medical emergency, immediately call 112 or 108.',
    footerCopy: '© 2026 HealthFlow Healthcare Technologies. All rights reserved.',
  },
  hi: {
    // Nav & General
    brandName: 'हेल्थफ्लो',
    patient: 'मरीज',
    doctor: 'डॉक्टर',
    admin: 'व्यवस्थापक',
    patientPortal: 'मरीज पोर्टल',
    doctorPortal: 'डॉक्टर पोर्टल',
    adminPortal: 'एडमिन पोर्टल',
    emergencySos: 'आपातकालीन SOS',
    notifications: 'सूचनाएं',
    signIn: 'साइन इन करें',
    guest: 'अतिथि',

    // Hero Section
    badge: 'स्मार्ट स्वास्थ्य सेवा समन्वय',
    heroHeadlinePrefix: 'हर बेहतरीन मरीज अनुभव के पीछे',
    heroHeadlineLies: 'है',
    heroSubheadline: 'बेहतर स्वास्थ्य सेवा। कम प्रतीक्षा। कम परेशानी।',
    trustAbha: 'ABHA और ABDM सत्यापित नेटवर्क',
    trustHospitals: '20+ जुड़े अस्पताल',
    trustWait: '< 38 मिनट औसत ओपीडी प्रतीक्षा',
    bookAppointment: 'अपॉइंटमेंट बुक करें',
    emergencyBtn: 'आपातकालीन',

    // Cards
    card1Tag: 'पटियाला स्वास्थ्य सेवा निर्देशिका',
    card1Title: 'सत्यापित अस्पताल सूची और सुविधाएं',
    card1Desc: 'पटियाला जिले के सत्यापित अस्पतालों की जानकारी प्राप्त करें, जिसमें बेड क्षमता, विशेषज्ञ विभाग, परामर्श शुल्क (₹200–₹500), और लाइव भीड़ की स्थिति शामिल है।',
    card1District: 'पटियाला जिला अस्पताल',
    card1Badge: '20 सत्यापित केंद्र',
    card1Hosp1Name: 'जीएमसी और राजिंदरा अस्पताल',
    card1Hosp1Desc: 'संगरूर रोड • 1,100 बेड • लेवल-1 ट्रॉमा',
    card1Hosp2Name: 'माता कौशल्या अस्पताल',
    card1Hosp2Desc: 'लाहौरी गेट • 420 बेड • प्रसूति एवं सामान्य',
    card1GovtFee: 'सरकारी • ₹200',
    card1Explore: 'सभी 20 पटियाला अस्पताल देखें',
    card1Benefit1: '20+ केंद्रों में रीयल-टाइम बेड व आईसीयू उपलब्धता',
    card1Benefit2: 'स्पष्ट परामर्श शुल्क (₹200–₹500), कोई छिपा हुआ खर्च नहीं',
    card1Benefit3: 'लेवल-1 ट्रॉमा और आपातकालीन सुविधाओं का सीधा मानचित्रण',

    card2Tag: 'मरीज सेवाएं और ट्राइएज',
    card2Title: 'ओपीडी कतारें और आपातकालीन सहायता',
    card2Desc: 'अस्पताल जाने से पहले डिजिटल कतार की स्थिति जांचें, और तत्काल चिकित्सा सहायता के लिए 24/7 आपातकालीन नंबरों से सीधे जुड़ें।',
    card2Benefit1: 'रिमोट डिजिटल टोकन — अस्पताल में ~45 मिनट प्रतीक्षा बचाएं',
    card2Benefit2: 'स्मार्ट एआई द्वारा भीड़ व अनुमानित प्रतीक्षा समय का सटीक पूर्वानुमान',
    card2Benefit3: 'जीपीएस डिस्पैच के साथ वन-टच 24/7 आपातकालीन एसओएस',
    card2QueueStatus: 'डिजिटल कतार स्थिति',
    card2ActiveHours: 'सक्रिय ओपीडी समय',
    card2TokenNumber: 'टोकन #A-128',
    card2TokenWait: 'जनरल मेडिसिन • अनुमानित प्रतीक्षा ~20 मिनट',
    card2InQueue: 'कतार में',
    card2Helpline: '24/7 आपातकालीन हेल्पलाइन: 112 / 108',
    card2Sos: 'आपातकाल',

    // Stats
    statHospitals: 'संबद्ध अस्पताल',
    statSpecialists: 'सत्यापित विशेषज्ञ',
    statWait: 'औसत ओपीडी प्रतीक्षा',
    statAccuracy: 'ट्राइएज सटीकता',

    // Bento / Capabilities
    capabilitiesTag: 'प्लेटफॉर्म की क्षमताएं',
    whyHealthFlow: 'हेल्थफ्लो क्यों चुनें?',
    capabilitiesSub: 'स्वास्थ्य सेवा पहुंच, कतार प्रबंधन और आपातकालीन समन्वय का समाधान करने वाला एकीकृत मंच।',
    bentoHospitalTitle: 'स्मार्ट अस्पताल खोज',
    bentoHospitalDesc: 'दूरी, भीड़, विशेषज्ञता और उपलब्धता के आधार पर अस्पताल खोजें।',
    bentoCrowdTitle: 'एआई भीड़ पूर्वानुमान',
    bentoCrowdDesc: 'अस्पताल पहुंचने से पहले विभाग की भीड़ और प्रतीक्षा समय जानें।',
    bentoDocTitle: 'डॉक्टर विशेषज्ञता',
    bentoDocDesc: 'वास्तविक विशेषज्ञता और अनुभव के आधार पर डॉक्टर खोजें।',
    bentoEmergencyTitle: 'आपातकालीन समन्वय',
    bentoEmergencyDesc: 'निकटतम उपयुक्त एम्बुलेंस को तुरंत खोजें और ट्रैक करें।',
    learnMore: 'और जानें',

    // Footer
    footerDirectory: 'अस्पताल निर्देशिका',
    footerNetwork: 'नेटवर्क आँकड़े',
    footerFeatures: 'प्लेटफॉर्म सुविधाएं',
    footerDemoNoticeTag: 'डेमो प्लेटफॉर्म सूचना',
    footerDemoNoticeText: 'हेल्थफ्लो काल्पनिक नैदानिक डेटा वाला एक प्रदर्शन मंच है। यह आधिकारिक चिकित्सा सलाह या निदान प्रदान नहीं करता है। आपात स्थिति में तुरंत 112 या 108 पर कॉल करें।',
    footerCopy: '© 2026 हेल्थफ्लो हेल्थकेयर टेक्नोलॉजीज। सर्वाधिकार सुरक्षित।',
  }
};

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState(() => {
    return localStorage.getItem('app_language') || 'en';
  });

  const setLanguage = (lang) => {
    setLanguageState(lang);
    localStorage.setItem('app_language', lang);
  };

  const toggleLanguage = () => {
    const nextLang = language === 'en' ? 'hi' : 'en';
    setLanguage(nextLang);
  };

  const t = (key) => {
    return translations[language]?.[key] || translations['en']?.[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
