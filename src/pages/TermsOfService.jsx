import React from 'react';
import InteriorPage from '../components/InteriorPage';
import { Card, CardContent } from '../components/Card';

const sections = [
  ['Acceptance of Terms', 'By accessing and using ATHAND, you accept and agree to be bound by the terms and provision of this agreement.'],
  ['Use License', 'Permission is granted to use ATHAND for personal, marketplace-related access subject to these platform terms.'],
  ['User Accounts', 'You are responsible for maintaining the confidentiality of your account credentials and activity.'],
  ['Booking and Payments', 'All bookings made through ATHAND remain subject to booking conditions, provider availability, and payment terms.'],
  ['Service Providers', 'ATHAND connects users with independent providers and does not directly perform the listed services.'],
  ['Privacy', 'Your privacy matters, and data handling is governed by the platform privacy standards and related policies.'],
  ['Limitation of Liability', 'ATHAND shall not be liable for indirect, incidental, or consequential damages arising from platform use.'],
  ['Contact Information', 'For legal or policy questions, contact support@athand.com.'],
];

const TermsOfService = () => {
  return (
    <InteriorPage
      kicker="Terms of Service"
      title="Policy content presented in the same interface language as the home page."
      description="Even legal content should feel part of the same product. This page now uses the same softer section framing, stronger typography, and cleaner reading rhythm."
      badge="Last updated: March 2024"
      aside={(
        <div className="space-y-3">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">Read Time</p>
          <p className="text-3xl font-black tracking-[-0.04em] text-text-primary">8 Sections</p>
          <p className="text-sm leading-7 text-text-secondary">A concise overview of account use, bookings, provider relationships, and liability.</p>
        </div>
      )}
    >
      <Card className="rounded-[1.8rem] border border-[#eadfd6] bg-white">
        <CardContent className="p-6 sm:p-8">
          <div className="space-y-8">
            {sections.map(([title, body], index) => (
              <div key={title} className={index === sections.length - 1 ? '' : 'border-b border-[#f0e6de] pb-8'}>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-accent">Section {index + 1}</p>
                <h2 className="mt-3 text-2xl font-black tracking-[-0.04em] text-text-primary">{title}</h2>
                <p className="mt-4 max-w-4xl text-sm leading-8 text-text-secondary">{body}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </InteriorPage>
  );
};

export default TermsOfService;
