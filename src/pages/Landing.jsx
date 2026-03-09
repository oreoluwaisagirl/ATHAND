import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Button from '../components/Button';

const stats = [
  { label: 'Verified pros', value: '4,200+' },
  { label: 'Avg response', value: '< 8 min' },
  { label: 'Cities covered', value: '2 major hubs' },
];

const pillars = [
  {
    title: 'Identity verification',
    text: 'NIN and profile checks before providers become publicly bookable.',
  },
  {
    title: 'Clear rates',
    text: 'Transparent pricing before booking so decisions are faster and safer.',
  },
  {
    title: 'Live communication',
    text: 'In-app messaging keeps booking discussions traceable and structured.',
  },
];

const Landing = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, isAdmin, logout } = useAuth();

  return (
    <main className="relative min-h-screen overflow-hidden bg-background pb-24 text-text-primary">
      <div className="pointer-events-none absolute -left-24 top-[-120px] h-80 w-80 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 top-40 h-72 w-72 rounded-full bg-gradient-to-br from-amber/20 to-terracotta/20 blur-3xl" />

      <section className="mx-auto max-w-6xl px-4 pt-10 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-border bg-container/95 p-6 shadow-xl backdrop-blur sm:p-10">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs uppercase tracking-[0.2em] text-text-tertiary">ATHAND Marketplace</p>
            <div className="flex items-center gap-2">
              {isAuthenticated ? (
                <>
                  <span className="rounded-full border border-border bg-background px-3 py-1 text-xs text-text-secondary">
                    {user?.fullName || user?.name || 'Signed in'}
                  </span>
                  {isAdmin && (
                    <button onClick={() => navigate('/admin')} className="text-xs font-medium text-primary hover:underline">
                      Admin panel
                    </button>
                  )}
                  <button onClick={logout} className="text-xs text-text-secondary hover:text-text-primary">
                    Logout
                  </button>
                </>
              ) : (
                <button onClick={() => navigate('/login')} className="text-xs font-medium text-primary hover:underline">
                  Log in
                </button>
              )}
            </div>
          </div>

          <div className="mt-10 grid items-center gap-10 lg:grid-cols-2">
            <div>
              <h1 className="text-4xl font-semibold leading-tight sm:text-5xl">
                Trusted help, faster than
                <span className="block text-primary">traditional hiring.</span>
              </h1>
              <p className="mt-5 max-w-xl text-base text-text-secondary sm:text-lg">
                Discover qualified domestic and technical professionals in Lagos and Abuja with clear trust signals and booking flow.
              </p>

              <div className="mt-7 flex flex-wrap gap-3">
                <Button size="lg" onClick={() => navigate('/house-help-search')}>Find House Helps</Button>
                <Button variant="outline" size="lg" onClick={() => navigate('/other-help')}>Explore Other Help</Button>
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-background p-5 shadow-inner">
              <img
                src="/images/hero-service.svg"
                alt="ATHAND marketplace overview"
                className="mb-4 h-40 w-full rounded-xl object-cover sm:h-52"
              />
              <p className="text-sm text-text-secondary">Operational quality snapshot</p>
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                {stats.map((stat) => (
                  <div key={stat.label} className="rounded-xl border border-border bg-container px-4 py-3">
                    <p className="text-xl font-semibold text-primary">{stat.value}</p>
                    <p className="text-xs text-text-secondary">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto mt-10 max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-4 md:grid-cols-3">
          {pillars.map((pillar) => (
            <article key={pillar.title} className="rounded-2xl border border-border bg-container p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg">
              <h3 className="text-lg font-semibold">{pillar.title}</h3>
              <p className="mt-2 text-sm text-text-secondary">{pillar.text}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
};

export default Landing;
