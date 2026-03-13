import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';
import Button from '../components/Button';

const categoryImages = {
  nanny: '/images/category-nanny.svg',
  maid: '/images/category-maid.svg',
  cook: '/images/category-cook.svg',
  driver: '/images/category-driver.svg',
  gardener: '/images/category-gardener.svg',
};
const HOUSE_HELP_CATEGORIES = ['nanny', 'maid', 'cook', 'driver', 'gardener'];

const HouseHelpSearch = () => {
  const navigate = useNavigate();
  const { categories } = useData();
  const [location, setLocation] = useState('');
  const [category, setCategory] = useState('');

  const [budget, setBudget] = useState(4500);
  const [urgency, setUrgency] = useState(70);
  const [requireVerified, setRequireVerified] = useState(true);

  const filteredCategories = useMemo(
    () => categories.filter((c) => HOUSE_HELP_CATEGORIES.includes(c.id)),
    [categories]
  );

  const locations = [
    'Lagos - Lekki',
    'Lagos - Ikoyi',
    'Lagos - Victoria Island',
    'Lagos - Surulere',
    'Lagos - Ikeja',
    'Abuja - Maitama',
    'Abuja - Asokoro',
    'Abuja - Gwarinpa',
  ];

  const smartMatches = useMemo(() => {
    const scoring = filteredCategories.map((cat) => {
      const providerSignal = Math.min((cat.providers || 0) * 12, 35);
      const ratingSignal = ((cat.avgRating || 4.5) / 5) * 30;
      const budgetSignal = budget > 3500 ? 18 : 10;
      const urgencySignal = urgency > 65 ? 12 : 20;
      const verifiedSignal = requireVerified ? 15 : 8;

      return {
        ...cat,
        score: Math.round(providerSignal + ratingSignal + budgetSignal + urgencySignal + verifiedSignal),
      };
    });

    return scoring.sort((a, b) => b.score - a.score).slice(0, 3);
  }, [filteredCategories, budget, urgency, requireVerified]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (category) {
      navigate(`/category/${category}?location=${encodeURIComponent(location)}`);
    } else {
      navigate(`/category/nanny?location=${encodeURIComponent(location)}`);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-24 md:pb-10">
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        <div className="mb-6 rounded-3xl border border-white/60 bg-white/75 p-6 shadow-xl">
          <img
            src="/images/hero-service.svg"
            alt="Find trusted help faster"
            className="mb-4 h-36 w-full rounded-2xl object-cover sm:h-44"
          />
          <h1 className="text-3xl font-bold text-text-primary">Find House Help</h1>
          <p className="mt-2 text-text-secondary">Use AI-style match settings and book verified providers faster.</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-3xl border border-white/60 bg-white/75 p-6 shadow-xl">
            <form onSubmit={handleSearch} className="space-y-5">
              <div>
                <label className="mb-1 block text-sm font-medium text-text-secondary">Location</label>
                <select
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full rounded-xl border border-white/70 bg-white/75 px-4 py-3 text-text-primary outline-none"
                  required
                >
                  <option value="">Select location</option>
                  {locations.map((loc) => (
                    <option key={loc} value={loc}>{loc}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-text-secondary">House Help Type</label>
                <div className="grid grid-cols-2 gap-2">
                  {filteredCategories.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setCategory(cat.id)}
                      className={`rounded-xl border px-4 py-2 text-sm transition ${category === cat.id ? 'border-sky-400 bg-sky-500/15 text-sky-700' : 'border-white/70 bg-white/70 text-text-secondary hover:bg-white'}`}
                    >
                      <div className="flex items-center gap-2">
                        <img
                          src={categoryImages[cat.id] || '/images/provider-fallback.svg'}
                          alt={cat.name}
                          className="h-8 w-8 rounded-lg object-cover"
                        />
                        <span>{cat.name}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <Button type="submit" className="w-full" size="lg">Search House Helps</Button>
            </form>
          </div>

          <div className="rounded-3xl border border-white/60 bg-white/75 p-6 shadow-xl">
            <div className="mb-4">
              <h2 className="text-xl font-semibold text-text-primary">Smart Match Studio</h2>
              <p className="text-sm text-text-secondary">Dynamic ranking based on your budget, urgency and trust preference.</p>
            </div>

            <div className="space-y-4">
              <label className="block">
                <span className="mb-1 block text-sm text-text-secondary">Budget ceiling (NGN/hr): {budget.toLocaleString()}</span>
                <input type="range" min="1500" max="10000" step="250" value={budget} onChange={(e) => setBudget(Number(e.target.value))} className="w-full" />
              </label>

              <label className="block">
                <span className="mb-1 block text-sm text-text-secondary">Urgency: {urgency}%</span>
                <input type="range" min="0" max="100" value={urgency} onChange={(e) => setUrgency(Number(e.target.value))} className="w-full" />
              </label>

              <label className="flex items-center gap-2 text-sm text-text-secondary">
                <input type="checkbox" checked={requireVerified} onChange={(e) => setRequireVerified(e.target.checked)} />
                Prioritize verified providers only
              </label>
            </div>

            <div className="mt-5 space-y-2">
              {smartMatches.map((match, index) => (
                <button
                  key={match.id}
                  onClick={() => navigate(`/category/${match.id}?location=${encodeURIComponent(location || 'Lagos')}`)}
                  className="flex w-full items-center justify-between rounded-xl border border-white/70 bg-white/75 px-4 py-3 text-left transition hover:bg-white"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={categoryImages[match.id] || '/images/provider-fallback.svg'}
                      alt={match.name}
                      className="h-11 w-11 rounded-xl object-cover"
                    />
                    <div>
                    <p className="text-sm text-text-secondary">#{index + 1} Recommended</p>
                    <p className="font-semibold text-text-primary">{match.name}</p>
                    </div>
                  </div>
                  <div className="rounded-full bg-sky-500 px-3 py-1 text-xs font-semibold text-white">
                    Fit {match.score}%
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HouseHelpSearch;
