import React from 'react';
import InteriorPage from '../components/InteriorPage';
import { Card, CardContent } from '../components/Card';

const Toggle = ({ checked, onChange }) => (
  <button
    type="button"
    onClick={onChange}
    className={`relative h-7 w-14 rounded-full transition ${checked ? 'bg-accent' : 'bg-[#d8d2cc]'}`}
  >
    <span
      className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition ${checked ? 'left-8' : 'left-1'}`}
    />
  </button>
);

const notificationGroups = [
  {
    title: 'Notification Channels',
    items: [
      ['push', 'Push Notifications', 'Receive notifications directly on your device.'],
      ['email', 'Email Notifications', 'Receive updates and account changes via email.'],
      ['sms', 'SMS Notifications', 'Get important text-message updates when needed.'],
    ],
  },
  {
    title: 'Notification Types',
    items: [
      ['bookings', 'Booking Updates', 'Status changes, reminders, and schedule updates.'],
      ['promotions', 'Promotions & Deals', 'Offers, discounts, and platform announcements.'],
      ['reviews', 'Reviews', 'Notifications when new feedback is left on completed work.'],
      ['messages', 'Messages', 'New chat activity from providers or support.'],
    ],
  },
];

const NotificationSettings = () => {
  const [notifications, setNotifications] = React.useState({
    push: true,
    email: true,
    sms: false,
    bookings: true,
    promotions: false,
    reviews: true,
    messages: true,
  });

  const toggleNotification = (key) => {
    setNotifications((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <InteriorPage
      kicker="Preferences"
      title="Notification settings rebuilt around the home-page system."
      description="The older settings rows have been restructured into softer marketplace-style cards with more space, stronger hierarchy, and cleaner toggles."
      badge="Manage channels and message types"
      aside={(
        <div className="space-y-4">
          <div className="rounded-[1.5rem] bg-[#120d0b] p-5 text-white">
            <p className="text-xs uppercase tracking-[0.2em] text-white/60">Preferences</p>
            <p className="mt-3 text-2xl font-black leading-tight">Control how ATHAND reaches you without losing context.</p>
          </div>
        </div>
      )}
    >
      <div className="space-y-6">
        {notificationGroups.map((group) => (
          <Card key={group.title} className="rounded-[1.8rem] border border-[#eadfd6] bg-white">
            <CardContent className="p-6 sm:p-8">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">{group.title}</p>
              <div className="mt-5 space-y-4">
                {group.items.map(([key, title, description]) => (
                  <div key={key} className="flex items-center justify-between gap-4 rounded-[1.4rem] border border-[#f0e6de] bg-[#faf7f4] px-4 py-4">
                    <div className="max-w-xl">
                      <h3 className="font-semibold text-text-primary">{title}</h3>
                      <p className="mt-1 text-sm leading-6 text-text-secondary">{description}</p>
                    </div>
                    <Toggle checked={notifications[key]} onChange={() => toggleNotification(key)} />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </InteriorPage>
  );
};

export default NotificationSettings;
