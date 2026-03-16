import React from 'react';
import { useNavigate } from 'react-router-dom';
import AppIcon from './AppIcon';

const InteriorPage = ({
  kicker = 'ATHAND',
  title,
  description,
  backLabel = 'Back',
  backTo = null,
  badge = null,
  accent = 'from-[#f3ede8] to-[#f3ebf7]',
  children,
  aside = null,
}) => {
  const navigate = useNavigate();

  const handleBack = () => {
    if (backTo) {
      navigate(backTo);
      return;
    }

    navigate(-1);
  };

  return (
    <div className="min-h-screen bg-background pb-24 md:pb-10">
      <section className={`relative overflow-hidden bg-gradient-to-r ${accent} dark:from-slate-900 dark:via-slate-800 dark:to-slate-900`}>
        <div className="absolute left-0 top-0 h-56 w-56 rounded-full bg-white/40 blur-3xl dark:bg-white/10" />
        <div className="absolute bottom-0 right-0 h-64 w-64 rounded-full bg-[#ffd7bf]/40 blur-3xl dark:bg-accent/10" />
        <div className="relative mx-auto max-w-7xl px-4 pb-12 pt-6 sm:px-8 lg:px-10 lg:pb-16 lg:pt-10">
          <button
            type="button"
            onClick={handleBack}
            className="inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/70 px-4 py-2 text-sm font-medium text-text-primary shadow-sm transition hover:bg-white dark:border-white/10 dark:bg-slate-900/70 dark:hover:bg-slate-800"
          >
            <AppIcon name="arrowRight" className="h-4 w-4 rotate-180" />
            {backLabel}
          </button>

          <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_360px] lg:items-end">
            <div className="max-w-3xl">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary">{kicker}</p>
              <h1 className="mt-4 text-[2.7rem] font-black leading-[1.02] tracking-[-0.05em] text-text-primary sm:text-[3.35rem]">
                {title}
              </h1>
              {description ? (
                <p className="mt-5 max-w-2xl text-sm leading-8 text-text-secondary sm:text-base">
                  {description}
                </p>
              ) : null}
              {badge ? (
                <div className="mt-6 inline-flex rounded-full bg-white px-4 py-2 text-sm font-semibold text-accent shadow-sm dark:bg-slate-900 dark:text-accent-lighter">
                  {badge}
                </div>
              ) : null}
            </div>

            {aside ? (
              <div className="rounded-[1.8rem] border border-white/60 bg-white/80 p-5 shadow-[0_18px_40px_rgba(39,55,86,0.08)] backdrop-blur dark:border-white/10 dark:bg-slate-900/75">
                {aside}
              </div>
            ) : null}
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-8 lg:px-10">
        {children}
      </div>
    </div>
  );
};

export default InteriorPage;
