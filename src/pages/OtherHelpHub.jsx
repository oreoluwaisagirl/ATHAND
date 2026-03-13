import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';
import Button from '../components/Button';
import { Card, CardContent } from '../components/Card';
import AppIcon from '../components/AppIcon';

const serviceCategories = [
  { id: 'maid', label: 'House Helps', icon: 'home' },
  { id: 'mechanic', label: 'Mechanics', icon: 'wrench' },
  { id: 'electrician', label: 'Electricians', icon: 'electric' },
  { id: 'tutor', label: 'Tutors', icon: 'book' },
  { id: 'plumber', label: 'Plumbers', icon: 'pipe' },
  { id: 'cleaner', label: 'Cleaners', icon: 'cleaning' },
  { id: 'carpenter', label: 'Carpenters', icon: 'hammer' },
  { id: 'engineer', label: 'Engineers', icon: 'gear' },
];

const OtherHelpHub = () => {
  const navigate = useNavigate();
  const { categories } = useData();
  const [query, setQuery] = useState('');
  const categoryIndex = useMemo(() => Object.fromEntries(categories.map((cat) => [cat.id, cat])), [categories]);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return serviceCategories;
    return serviceCategories.filter((item) => item.label.toLowerCase().includes(needle));
  }, [query]);

  return (
    <div className="min-h-screen bg-background pb-24 md:pb-10">
      <div className="bg-container shadow-sm px-4 py-3 flex items-center justify-between border-b border-border">
        <button onClick={() => navigate('/')} className="text-text-secondary hover:text-text-primary">←</button>
        <h1 className="text-xl font-semibold text-text-primary">Service Categories</h1>
        <button onClick={() => navigate('/emergency-help')} className="text-sm text-primary hover:underline">Help Now</button>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-8">
        <div className="relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-slate-900 via-teal-900 to-emerald-800 p-6 text-white shadow-xl">
          <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-emerald-300/20 blur-2xl" />
          <p className="text-xs uppercase tracking-[0.2em] text-cyan-200">ATHAND Directory</p>
          <h2 className="mt-2 text-2xl font-semibold">Choose the right expert in seconds</h2>
          <p className="mt-2 text-sm text-slate-100/85">From home services to technical fixes, compare trusted professionals quickly.</p>
        </div>

        <Card className="mt-4">
          <CardContent className="p-4">
            <p className="text-sm text-text-secondary">Choose what help you need.</p>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search categories..."
              className="mt-3 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
            />
          </CardContent>
        </Card>

        <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
          {filtered.map((item) => {
            const meta = categoryIndex[item.id];
            return (
              <Card
                key={item.id}
                className="group cursor-pointer overflow-hidden border border-slate-200 bg-gradient-to-br from-white to-slate-50 transition hover:-translate-y-1 hover:shadow-xl"
                onClick={() => navigate(`/category/${item.id}`)}
              >
                <CardContent className="p-4 text-center">
                  <div className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-background text-text-primary transition group-hover:scale-110">
                    <AppIcon name={item.icon} className="h-6 w-6" />
                  </div>
                  <p className="mt-2 text-sm font-semibold text-text-primary">{item.label}</p>
                  <p className="mt-1 text-xs text-text-tertiary">
                    {meta?.providers || 0} workers
                  </p>
                  <div className="mt-3 inline-flex rounded-full bg-primary/10 px-2 py-1 text-[11px] font-semibold text-primary">
                    Explore
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="mt-6 flex gap-3">
          <Button className="flex-1" onClick={() => navigate('/house-help-search')}>Find House Help</Button>
          <Button className="flex-1" variant="danger" onClick={() => navigate('/emergency-help')}>Emergency Services</Button>
        </div>
      </div>
    </div>
  );
};

export default OtherHelpHub;
