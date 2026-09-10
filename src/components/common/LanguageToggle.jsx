import React from 'react';
import { Globe } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import './LanguageToggle.css';

export default function LanguageToggle({ className = '', variant = 'pill' }) {
  const { language, setLanguage } = useLanguage();

  return (
    <div className={`lang-toggle-wrapper ${className}`} role="group" aria-label="Language Selector">
      <Globe size={13} className="lang-globe-icon" />
      <div className="lang-toggle-options">
        <button
          type="button"
          className={`lang-option-btn ${language === 'en' ? 'active' : ''}`}
          onClick={() => setLanguage('en')}
          title="Switch to English"
        >
          EN
        </button>
        <span className="lang-divider">|</span>
        <button
          type="button"
          className={`lang-option-btn ${language === 'hi' ? 'active' : ''}`}
          onClick={() => setLanguage('hi')}
          title="हिन्दी में बदलें"
        >
          हिन्दी
        </button>
      </div>
    </div>
  );
}
