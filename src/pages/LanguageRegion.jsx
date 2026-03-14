import React from 'react';
import AppIcon from '../components/AppIcon';
import InteriorPage from '../components/InteriorPage';
import { Card, CardContent } from '../components/Card';

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

const OptionCard = ({ title, subtitle, selected, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className={`flex w-full items-center justify-between rounded-[1.4rem] border px-4 py-4 text-left transition ${
      selected ? 'border-accent bg-[#fff5ee]' : 'border-[#f0e6de] bg-[#faf7f4] hover:bg-white'
    }`}
  >
    <div>
      <p className="font-semibold text-text-primary">{title}</p>
      {subtitle ? <p className="mt-1 text-sm text-text-secondary">{subtitle}</p> : null}
    </div>
    {selected ? (
      <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-accent text-white">
        <AppIcon name="shield" className="h-4 w-4" />
      </span>
    ) : null}
  </button>
);

const LanguageRegion = () => {
  const [selectedLanguage, setSelectedLanguage] = React.useState('en');
  const [selectedRegion, setSelectedRegion] = React.useState('ng');

  return (
    <InteriorPage
      kicker="Language & Region"
      title="Regional preferences aligned with the new marketplace layout."
      description="This settings page now uses the same visual hierarchy as the landing page, with editorial headings, rounded surfaces, and cleaner state selection."
      badge="Customize language and currency context"
      aside={(
        <div className="space-y-3">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">Localization</p>
          <p className="text-2xl font-black leading-tight text-text-primary">Choose the language and currency context that best matches your market.</p>
        </div>
      )}
    >
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="rounded-[1.8rem] border border-[#eadfd6] bg-white">
          <CardContent className="p-6 sm:p-8">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">Language</p>
            <div className="mt-5 space-y-3">
              {languages.map((lang) => (
                <OptionCard
                  key={lang.code}
                  title={lang.name}
                  selected={selectedLanguage === lang.code}
                  onClick={() => setSelectedLanguage(lang.code)}
                />
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-[1.8rem] border border-[#eadfd6] bg-white">
          <CardContent className="p-6 sm:p-8">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-accent">Region & Currency</p>
            <div className="mt-5 space-y-3">
              {regions.map((region) => (
                <OptionCard
                  key={region.code}
                  title={region.name}
                  subtitle={region.currency}
                  selected={selectedRegion === region.code}
                  onClick={() => setSelectedRegion(region.code)}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </InteriorPage>
  );
};

export default LanguageRegion;
