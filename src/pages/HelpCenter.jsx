import React from 'react';
import Button from '../components/Button';
import AppIcon from '../components/AppIcon';
import InteriorPage from '../components/InteriorPage';
import { Card, CardContent } from '../components/Card';

const helpTopics = [
  { id: 1, title: 'Getting Started', icon: 'rocket', description: 'Learn how to browse, compare, and start using ATHAND.' },
  { id: 2, title: 'Booking Help', icon: 'calendar', description: 'Understand booking flow, scheduling, and confirmation steps.' },
  { id: 3, title: 'Payment Issues', icon: 'card', description: 'Resolve billing questions and saved-payment concerns.' },
  { id: 4, title: 'Account Security', icon: 'lock', description: 'Protect your account and understand sign-in issues.' },
  { id: 5, title: 'Provider Support', icon: 'worker', description: 'Guidance for onboarding, availability, and profile setup.' },
  { id: 6, title: 'Report a Problem', icon: 'alert', description: 'Flag issues with bookings, listings, or the interface.' },
];

const HelpCenter = () => {
  return (
    <InteriorPage
      kicker="Help Center"
      title="Support that now looks like the rest of the product."
      description="The support area follows the same section-based visual language as the home page, with softer cards, larger hierarchy, and cleaner topic grouping."
      badge="Search, browse, and escalate support"
      aside={(
        <div className="space-y-4">
          <div className="rounded-[1.5rem] bg-[#120d0b] p-5 text-white">
            <p className="text-xs uppercase tracking-[0.2em] text-white/60">Support Access</p>
            <p className="mt-3 text-2xl font-black leading-tight">Faster answers for booking, payments, and account issues.</p>
          </div>
          <Button className="w-full rounded-xl">Contact Support</Button>
        </div>
      )}
    >
      <Card className="rounded-[1.8rem] border border-[#eadfd6] bg-white">
        <CardContent className="p-5 sm:p-6">
          <input
            type="text"
            placeholder="Search for help..."
            className="w-full rounded-2xl border border-[#eadfd6] bg-[#faf7f4] px-4 py-4 text-text-primary outline-none transition placeholder:text-text-tertiary focus:border-accent"
          />
        </CardContent>
      </Card>

      <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {helpTopics.map((topic) => (
          <Card
            key={topic.id}
            className="cursor-pointer rounded-[1.6rem] border border-[#eadfd6] bg-white transition hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(39,55,86,0.08)]"
            onClick={() => alert(`Opening ${topic.title}...`)}
          >
            <CardContent className="p-6">
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[#f4f6fb] text-text-primary">
                <AppIcon name={topic.icon} className="h-5 w-5" />
              </span>
              <h3 className="mt-4 text-lg font-bold text-text-primary">{topic.title}</h3>
              <p className="mt-3 text-sm leading-7 text-text-secondary">{topic.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </InteriorPage>
  );
};

export default HelpCenter;
