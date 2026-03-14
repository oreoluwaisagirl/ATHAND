import React from 'react';
import Button from '../components/Button';
import AppIcon from '../components/AppIcon';
import InteriorPage from '../components/InteriorPage';
import { Card, CardContent } from '../components/Card';

const paymentMethods = [
  { id: 1, type: 'Visa', last4: '4242', expiry: '12/25', isDefault: true, tone: 'from-[#6ca8ff] to-[#3f6ed8]' },
  { id: 2, type: 'Mastercard', last4: '8888', expiry: '06/26', isDefault: false, tone: 'from-[#ffbb4d] to-[#f08b32]' },
];

const alternatives = [
  { title: 'Bank Transfer', description: 'Pay directly from your bank account when card use is not preferred.', icon: 'home' },
  { title: 'Mobile Money', description: 'Use supported mobile money services as they become available.', icon: 'card' },
];

const PaymentMethods = () => {
  return (
    <InteriorPage
      kicker="Payments"
      title="Manage cards and payment options in the home-page style."
      description="Saved payment methods now sit inside the same softer marketplace surfaces used on the landing page, instead of the older utility-screen layout."
      badge="Payment overview and saved cards"
      aside={(
        <div className="space-y-4">
          <div className="rounded-[1.5rem] bg-[#eef5ea] p-5">
            <p className="text-xs uppercase tracking-[0.2em] text-primary">Billing</p>
            <p className="mt-3 text-2xl font-black leading-tight text-text-primary">Keep one default method ready for smoother booking checkout.</p>
          </div>
          <Button variant="outline" className="w-full rounded-xl">+ Add New Card</Button>
        </div>
      )}
    >
      <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <Card className="rounded-[1.8rem] border border-[#eadfd6] bg-white">
          <CardContent className="p-6 sm:p-8">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">Saved Cards</p>
            <div className="mt-5 space-y-4">
              {paymentMethods.map((method) => (
                <div key={method.id} className={`rounded-[1.6rem] bg-gradient-to-br ${method.tone} p-[1px] shadow-sm`}>
                  <div className="rounded-[1.5rem] bg-white/92 p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-text-tertiary">{method.type}</p>
                        <p className="mt-4 text-2xl font-black tracking-[0.18em] text-text-primary">•••• {method.last4}</p>
                        <p className="mt-2 text-sm text-text-secondary">Expires {method.expiry}</p>
                      </div>
                      {method.isDefault ? (
                        <span className="rounded-full bg-primary px-3 py-1 text-xs font-semibold text-white">Default</span>
                      ) : null}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-[1.8rem] border border-[#eadfd6] bg-[#faf7f4]">
          <CardContent className="p-6 sm:p-8">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-accent">Other Options</p>
            <div className="mt-5 space-y-4">
              {alternatives.map((item) => (
                <div key={item.title} className="rounded-[1.4rem] border border-[#eadfd6] bg-white p-4">
                  <div className="flex items-start gap-3">
                    <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-[#f4f6fb] text-text-primary">
                      <AppIcon name={item.icon} className="h-5 w-5" />
                    </span>
                    <div>
                      <h3 className="font-semibold text-text-primary">{item.title}</h3>
                      <p className="mt-1 text-sm leading-6 text-text-secondary">{item.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </InteriorPage>
  );
};

export default PaymentMethods;
