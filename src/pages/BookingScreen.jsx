import React, { useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import { Card, CardContent, CardHeader } from '../components/Card';
import AppIcon from '../components/AppIcon';
import { useData } from '../context/DataContext';
import { resolveAvatar } from '../lib/avatars';

const BookingScreen = () => {
  const navigate = useNavigate();
  const locationState = useLocation();
  const { getAllWorkers, addBooking } = useData();

  const worker = locationState.state?.worker || getAllWorkers()[0] || null;
  const [service, setService] = useState(worker?.categoryId || 'mechanic');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [serviceLocation, setServiceLocation] = useState('Ikeja, Lagos');
  const [notes, setNotes] = useState('');

  const price = useMemo(() => {
    const base = worker?.rate || 8000;
    return Math.max(8000, Math.round(base * 1.2));
  }, [worker?.rate]);

  if (!worker) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <p className="text-text-secondary">No worker selected yet.</p>
            <Button className="mt-4" onClick={() => navigate('/other-help')}>Choose Worker</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const confirmBooking = () => {
    if (!date || !time || !serviceLocation) {
      alert('Please complete date, time and location.');
      return;
    }
    const booking = addBooking({
      workerId: worker.id,
      serviceType: service,
      scheduledDate: date,
      scheduledTime: time,
      location: serviceLocation,
      notes,
      total: price,
      status: 'confirmed',
      trackingStatus: 'confirmed',
    });
    navigate(`/booking-tracking/${booking.id || booking._id}`);
  };

  return (
    <div className="min-h-screen bg-background pb-24 md:pb-10">
      <div className="bg-container shadow-sm px-4 py-3 flex items-center justify-between border-b border-border">
        <button onClick={() => navigate(-1)} className="text-text-secondary hover:text-text-primary">←</button>
        <h1 className="text-xl font-semibold text-text-primary">Booking</h1>
        <div className="w-8" />
      </div>

      <div className="mx-auto max-w-3xl px-4 py-6 space-y-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <img src={resolveAvatar(worker.avatar, worker.name)} alt={worker.name} className="h-12 w-12 rounded-full object-cover" />
              <div>
                <p className="font-semibold">{worker.name}</p>
                <p className="flex items-center gap-1 text-sm text-text-secondary"><AppIcon name="star" className="h-4 w-4 text-orange-500" />{worker.rating || 0} | {worker.completedJobs || 0} Jobs</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><h3 className="font-semibold">Booking Details</h3></CardHeader>
          <CardContent className="space-y-3">
            <label className="block">
              <span className="mb-1 block text-sm text-text-secondary">Service</span>
              <input value={service} onChange={(e) => setService(e.target.value)} className="w-full rounded-md border border-border bg-background px-3 py-2" />
            </label>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block">
                <span className="mb-1 block text-sm text-text-secondary">Date</span>
                <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full rounded-md border border-border bg-background px-3 py-2" />
              </label>
              <label className="block">
                <span className="mb-1 block text-sm text-text-secondary">Time</span>
                <input type="time" value={time} onChange={(e) => setTime(e.target.value)} className="w-full rounded-md border border-border bg-background px-3 py-2" />
              </label>
            </div>
            <label className="block">
              <span className="mb-1 block text-sm text-text-secondary">Location</span>
              <input value={serviceLocation} onChange={(e) => setServiceLocation(e.target.value)} className="w-full rounded-md border border-border bg-background px-3 py-2" />
            </label>
            <label className="block">
              <span className="mb-1 block text-sm text-text-secondary">Notes</span>
              <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} className="w-full rounded-md border border-border bg-background px-3 py-2" />
            </label>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-text-secondary">Estimated Price</span>
              <span className="font-semibold text-text-primary">₦{price.toLocaleString()}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="fixed bottom-0 left-0 right-0 border-t border-border bg-container p-4">
        <Button className="w-full" onClick={confirmBooking}>Confirm Booking</Button>
      </div>
    </div>
  );
};

export default BookingScreen;
