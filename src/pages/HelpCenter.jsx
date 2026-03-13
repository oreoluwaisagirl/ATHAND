import React from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import AppIcon from '../components/AppIcon';

const HelpCenter = () => {
  const navigate = useNavigate();

  const helpTopics = [
    { id: 1, title: 'Getting Started', icon: 'rocket', description: 'Learn how to use ATHAND' },
    { id: 2, title: 'Booking Help', icon: 'calendar', description: 'How to book services' },
    { id: 3, title: 'Payment Issues', icon: 'card', description: 'Payment and billing support' },
    { id: 4, title: 'Account Security', icon: 'lock', description: 'Keep your account safe' },
    { id: 5, title: 'Provider Support', icon: 'worker', description: 'Help for service providers' },
    { id: 6, title: 'Report a Problem', icon: 'alert', description: 'Report issues or concerns' },
  ];

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="bg-container shadow-sm px-4 py-3 flex items-center border-b border-border">
        <button onClick={() => navigate(-1)} className="mr-3 text-text-primary">
          ←
        </button>
        <h1 className="text-xl font-semibold text-text-primary">Help Center</h1>
      </div>

      {/* Search */}
      <div className="px-4 py-4">
        <input
          type="text"
          placeholder="Search for help..."
          className="w-full px-4 py-3 border border-border rounded-lg bg-container text-text-primary placeholder-text-tertiary focus:outline-none focus:ring-2 focus:ring-amber"
        />
      </div>

      {/* Help Topics */}
      <div className="px-4">
        <h2 className="text-lg font-semibold text-text-primary mb-4">How can we help?</h2>
        <div className="space-y-3">
          {helpTopics.map((topic) => (
            <div
              key={topic.id}
              className="bg-container p-4 rounded-lg border border-border cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => alert(`Opening ${topic.title}...`)}
            >
              <div className="flex items-center space-x-3">
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-background text-text-primary">
                  <AppIcon name={topic.icon} className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="font-semibold text-text-primary">{topic.title}</h3>
                  <p className="text-sm text-text-secondary">{topic.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Contact Support */}
      <div className="px-4 py-6">
        <div className="bg-amber bg-opacity-10 p-4 rounded-lg">
          <h3 className="font-semibold text-text-primary mb-2">Still need help?</h3>
          <p className="text-sm text-text-secondary mb-3">Our support team is available 24/7</p>
          <Button className="w-full">Contact Support</Button>
        </div>
      </div>
    </div>
  );
};

export default HelpCenter;
