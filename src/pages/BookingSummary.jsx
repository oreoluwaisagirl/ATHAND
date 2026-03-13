import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import Badge from '../components/Badge';
import { Card, CardContent, CardHeader } from '../components/Card';
import { useData } from '../context/DataContext';
import { resolveAvatar } from '../lib/avatars';

const BookingSummary = () => {
  const navigate = useNavigate();
  const { getAllWorkers } = useData();
  const [serviceDescription, setServiceDescription] = useState('');
  const [duration, setDuration] = useState('4 hours');

  const provider = useMemo(() => {
    const first = getAllWorkers()[0];
    if (!first) return null;
    return {
      ...first,
      avatar: resolveAvatar(first.avatar, first.name),
    };
  }, [getAllWorkers]);

  const estimate = useMemo(() => {
    const hours = parseInt(duration, 10) || 4;
    const subtotal = (provider?.rate || 0) * hours;
    const serviceFee = Math.round(subtotal * 0.075);
    return { subtotal, serviceFee, total: subtotal + serviceFee };
  }, [duration, provider?.rate]);

  if (!provider) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-6 text-center">
            <h3 className="text-lg font-semibold text-text-primary">No providers available</h3>
            <p className="text-text-secondary mt-2">Add workers in admin panel or sync backend workers first.</p>
            <Button onClick={() => navigate('/house-help-search')} className="mt-4">Find Workers</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="bg-container shadow-sm px-4 py-3 flex items-center justify-between border-b border-border">
        <button onClick={() => navigate(-1)} className="text-text-secondary hover:text-text-primary">←</button>
        <h1 className="text-xl font-semibold text-text-primary">Book Service</h1>
        <div className="w-8" />
      </div>

      <div className="px-4 py-6 space-y-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-start space-x-3 mb-4">
              <img src={provider.avatar} alt={provider.name} className="w-12 h-12 rounded-full object-cover" onError={(e) => { e.currentTarget.src = '/images/provider-fallback.svg'; }} />
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <h3 className="font-semibold text-text-primary">{provider.name}</h3>
                  {provider.verified && <Badge variant="success" size="xs">Verified</Badge>}
                </div>
                <p className="text-sm text-text-secondary">{provider.location}</p>
                <p className="text-lg font-bold text-text-primary">₦{provider.rate.toLocaleString()}/hr</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><h3 className="font-semibold text-text-primary">Duration</h3></CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              {['2 hours', '4 hours', '6 hours', '8 hours'].map((option) => (
                <button
                  key={option}
                  onClick={() => setDuration(option)}
                  className={`p-3 border rounded-lg text-center ${duration === option ? 'border-primary bg-primary text-white' : 'border-border text-text-secondary'}`}
                >
                  {option}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><h3 className="font-semibold text-text-primary">Description (Optional)</h3></CardHeader>
          <CardContent>
            <textarea
              value={serviceDescription}
              onChange={(e) => setServiceDescription(e.target.value)}
              placeholder="Describe your needs"
              rows={3}
              className="w-full px-3 py-2 border border-border rounded-lg bg-background text-text-primary"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader><h3 className="font-semibold text-text-primary">Estimated Cost</h3></CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm text-text-secondary">
              <div className="flex justify-between"><span>Subtotal</span><span>₦{estimate.subtotal.toLocaleString()}</span></div>
              <div className="flex justify-between"><span>Service fee</span><span>₦{estimate.serviceFee.toLocaleString()}</span></div>
              <hr className="border-border" />
              <div className="flex justify-between font-semibold text-text-primary"><span>Total</span><span>₦{estimate.total.toLocaleString()}</span></div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-container border-t border-border p-4 md:static md:mt-6 md:mx-auto md:max-w-3xl md:rounded-lg md:border">
        <Button onClick={() => navigate('/booking-datetime')} className="w-full">Continue to Date & Time</Button>
      </div>
    </div>
  );
};

export default BookingSummary;
