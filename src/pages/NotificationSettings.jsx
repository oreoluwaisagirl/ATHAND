import React from 'react';
import { useNavigate } from 'react-router-dom';

const NotificationSettings = () => {
  const navigate = useNavigate();

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
    setNotifications(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="bg-container shadow-sm px-4 py-3 flex items-center border-b border-border">
        <button onClick={() => navigate(-1)} className="mr-3 text-text-primary">
          ←
        </button>
        <h1 className="text-xl font-semibold text-text-primary">Notification Settings</h1>
      </div>

      {/* Notification Channels */}
      <div className="px-4 py-4">
        <h2 className="text-lg font-semibold text-text-primary mb-4">Notification Channels</h2>
        <div className="bg-container rounded-lg border border-border divide-y divide-border">
          <div className="p-4 flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-text-primary">Push Notifications</h3>
              <p className="text-sm text-text-secondary">Receive notifications on your device</p>
            </div>
            <button
              onClick={() => toggleNotification('push')}
              className={`w-12 h-6 rounded-full transition-colors ${notifications.push ? 'bg-amber' : 'bg-gray-300'}`}
            >
              <div className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform ${notifications.push ? 'translate-x-6' : 'translate-x-0.5'}`} />
            </button>
          </div>
          <div className="p-4 flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-text-primary">Email Notifications</h3>
              <p className="text-sm text-text-secondary">Receive updates via email</p>
            </div>
            <button
              onClick={() => toggleNotification('email')}
              className={`w-12 h-6 rounded-full transition-colors ${notifications.email ? 'bg-amber' : 'bg-gray-300'}`}
            >
              <div className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform ${notifications.email ? 'translate-x-6' : 'translate-x-0.5'}`} />
            </button>
          </div>
          <div className="p-4 flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-text-primary">SMS Notifications</h3>
              <p className="text-sm text-text-secondary">Receive text messages</p>
            </div>
            <button
              onClick={() => toggleNotification('sms')}
              className={`w-12 h-6 rounded-full transition-colors ${notifications.sms ? 'bg-amber' : 'bg-gray-300'}`}
            >
              <div className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform ${notifications.sms ? 'translate-x-6' : 'translate-x-0.5'}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Notification Types */}
      <div className="px-4 py-4">
        <h2 className="text-lg font-semibold text-text-primary mb-4">Notification Types</h2>
        <div className="bg-container rounded-lg border border-border divide-y divide-border">
          <div className="p-4 flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-text-primary">Booking Updates</h3>
              <p className="text-sm text-text-secondary">Status changes, reminders</p>
            </div>
            <button
              onClick={() => toggleNotification('bookings')}
              className={`w-12 h-6 rounded-full transition-colors ${notifications.bookings ? 'bg-amber' : 'bg-gray-300'}`}
            >
              <div className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform ${notifications.bookings ? 'translate-x-6' : 'translate-x-0.5'}`} />
            </button>
          </div>
          <div className="p-4 flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-text-primary">Promotions & Deals</h3>
              <p className="text-sm text-text-secondary">Special offers and discounts</p>
            </div>
            <button
              onClick={() => toggleNotification('promotions')}
              className={`w-12 h-6 rounded-full transition-colors ${notifications.promotions ? 'bg-amber' : 'bg-gray-300'}`}
            >
              <div className={`w-5 h-5 bg-white rounded-full shadow transform-transition ${notifications.promotions ? 'translate-x-6' : 'translate-x-0.5'}`} />
            </button>
          </div>
          <div className="p-4 flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-text-primary">Reviews</h3>
              <p className="text-sm text-text-secondary">New reviews on your bookings</p>
            </div>
            <button
              onClick={() => toggleNotification('reviews')}
              className={`w-12 h-6 rounded-full transition-colors ${notifications.reviews ? 'bg-amber' : 'bg-gray-300'}`}
            >
              <div className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform ${notifications.reviews ? 'translate-x-6' : 'translate-x-0.5'}`} />
            </button>
          </div>
          <div className="p-4 flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-text-primary">Messages</h3>
              <p className="text-sm text-text-secondary">New messages from providers</p>
            </div>
            <button
              onClick={() => toggleNotification('messages')}
              className={`w-12 h-6 rounded-full transition-colors ${notifications.messages ? 'bg-amber' : 'bg-gray-300'}`}
            >
              <div className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform ${notifications.messages ? 'translate-x-6' : 'translate-x-0.5'}`} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationSettings;

