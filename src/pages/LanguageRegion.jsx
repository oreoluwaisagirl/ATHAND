import React from 'react';
import { useNavigate } from 'react-router-dom';

const LanguageRegion = () => {
  const navigate = useNavigate();

  const [selectedLanguage, setSelectedLanguage] = React.useState('en');
  const [selectedRegion, setSelectedRegion] = React.useState('ng');

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'fr', name: 'Français' },
    { code: 'es', name: 'Español' },
    { code: 'de', name: 'Deutsch' },
    { code: 'pt', name: 'Português' },
  ];

  const regions = [
    { code: 'ng', name: 'Nigeria', currency: 'NGN (₦)' },
    { code: 'gh', name: 'Ghana', currency: 'GHS (₵)' },
    { code: 'ke', name: 'Kenya', currency: 'KES (KSh)' },
    { code: 'za', name: 'South Africa', currency: 'ZAR (R)' },
    { code: 'uk', name: 'United Kingdom', currency: 'GBP (£)' },
  ];

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="bg-container shadow-sm px-4 py-3 flex items-center border-b border-border">
        <button onClick={() => navigate(-1)} className="mr-3 text-text-primary">
          ←
        </button>
        <h1 className="text-xl font-semibold text-text-primary">Language & Region</h1>
      </div>

      {/* Language Selection */}
      <div className="px-4 py-4">
        <h2 className="text-lg font-semibold text-text-primary mb-4">Language</h2>
        <div className="bg-container rounded-lg border border-border divide-y divide-border">
          {languages.map((lang) => (
            <div
              key={lang.code}
              className="p-4 flex items-center justify-between cursor-pointer"
              onClick={() => setSelectedLanguage(lang.code)}
            >
              <span className="text-text-primary">{lang.name}</span>
              {selectedLanguage === lang.code && (
                <span className="text-amber">✓</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Region Selection */}
      <div className="px-4 py-4">
        <h2 className="text-lg font-semibold text-text-primary mb-4">Region & Currency</h2>
        <div className="bg-container rounded-lg border border-border divide-y divide-border">
          {regions.map((region) => (
            <div
              key={region.code}
              className="p-4 flex items-center justify-between cursor-pointer"
              onClick={() => setSelectedRegion(region.code)}
            >
              <div>
                <span className="text-text-primary">{region.name}</span>
                <p className="text-sm text-text-tertiary">{region.currency}</p>
              </div>
              {selectedRegion === region.code && (
                <span className="text-amber">✓</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LanguageRegion;

