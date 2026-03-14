import React from 'react';
import Button from '../components/Button';
import AppIcon from '../components/AppIcon';
import InteriorPage from '../components/InteriorPage';
import { Card, CardContent } from '../components/Card';

const features = [
  { icon: 'home', title: 'Home Services', description: 'A broad surface for daily help, urgent needs, and specialist bookings.' },
  { icon: 'shield', title: 'Verified Providers', description: 'Profiles are structured to look credible and easier to compare.' },
  { icon: 'chat', title: 'Direct Communication', description: 'Customers and providers stay connected through in-app messaging.' },
  { icon: 'star', title: 'Ratings & Trust', description: 'Reviews, completion signals, and cleaner cards support faster decisions.' },
];

const AboutATHAND = () => {
  return (
    <InteriorPage
      kicker="About ATHAND"
      title="A service marketplace with a clearer product story."
      description="ATHAND connects customers with home and technical service providers through a marketplace interface designed to feel more trustworthy, more premium, and easier to navigate."
      badge="Marketplace positioning, trust, and operational clarity"
      aside={(
        <div className="space-y-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-[1.4rem] bg-accent text-white">
            <AppIcon name="home" className="h-8 w-8" />
          </div>
          <p className="text-2xl font-black leading-tight text-text-primary">ATHAND now presents itself more like a serious service brand than a generic utility app.</p>
        </div>
      )}
    >
      <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <Card className="rounded-[1.8rem] border border-[#eadfd6] bg-white">
          <CardContent className="p-6 sm:p-8">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">Platform Overview</p>
            <h2 className="mt-3 text-3xl font-black tracking-[-0.04em] text-text-primary">Built for trusted discovery, cleaner booking, and better provider presentation.</h2>
            <p className="mt-5 text-sm leading-8 text-text-secondary">
              ATHAND is a platform that helps users find reliable service providers for home and technical work. The interface now follows the same editorial marketplace direction introduced on the home page so the rest of the product feels like one system.
            </p>
            <p className="mt-4 text-sm leading-8 text-text-secondary">
              Whether someone needs house help, cleaning, salon support, home move assistance, or painting, the goal is simple: clearer categories, stronger provider cards, and less friction moving from discovery into booking.
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-[1.8rem] border border-[#eadfd6] bg-[#faf7f4]">
          <CardContent className="p-6 sm:p-8">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-accent">Contact</p>
            <h3 className="mt-3 text-2xl font-black tracking-[-0.04em] text-text-primary">Reach the ATHAND team.</h3>
            <p className="mt-3 text-sm leading-7 text-text-secondary">Questions, demos, feedback, or support requests can be routed through the support channel below.</p>
            <Button variant="outline" className="mt-6 w-full gap-2 rounded-xl">
              <AppIcon name="mail" className="h-4 w-4" />
              support@athand.com
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {features.map((feature) => (
          <Card key={feature.title} className="rounded-[1.6rem] border border-[#eadfd6] bg-[#f4f6fb]">
            <CardContent className="p-6">
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-text-primary shadow-sm">
                <AppIcon name={feature.icon} className="h-5 w-5" />
              </span>
              <h3 className="mt-4 text-lg font-bold text-text-primary">{feature.title}</h3>
              <p className="mt-3 text-sm leading-7 text-text-secondary">{feature.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </InteriorPage>
  );
};

export default AboutATHAND;
