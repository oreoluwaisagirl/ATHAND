import React, { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Button from '../components/Button';
import { Card, CardContent } from '../components/Card';
import AppIcon from '../components/AppIcon';
import { useData } from '../context/DataContext';
import GoogleLiveMap from '../components/GoogleLiveMap';

const statusSteps = [
  { key: 'confirmed', label: 'Booking confirmed' },
  { key: 'assigned', label: 'Worker assigned' },
  { key: 'en_route', label: 'Worker on the way' },
  { key: 'in_progress', label: 'Service in progress' },
  { key: 'awaiting_confirmation', label: 'Awaiting your confirmation' },
  { key: 'completed', label: 'Completed' },
];

const BookingTracking = () => {
  const navigate = useNavigate();
  const { bookingId } = useParams();
  const { bookings, updateBooking } = useData();

  const booking = useMemo(
    () => bookings.find((item) => String(item.id || item._id) === String(bookingId)) || bookings[0] || null,
    [bookings, bookingId]
  );

  const activeIndex = useMemo(() => {
    const key = booking?.emergencyStatus || booking?.trackingStatus || booking?.status || 'confirmed';
    const index = statusSteps.findIndex((step) => step.key === key);
    if (index >= 0) return index;
    if (booking?.status === 'awaiting_confirmation') return statusSteps.findIndex((step) => step.key === 'awaiting_confirmation');
    return 0;
  }, [booking?.emergencyStatus, booking?.trackingStatus, booking?.status]);

  const markCompleted = () => {
    if (!booking) return;
    const id = booking.id || booking._id;
    updateBooking(id, { status: 'completed', trackingStatus: 'completed' });
    alert('Booking completed. You can now leave a review.');
  };

  if (!booking) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <p className="text-text-secondary">No booking found yet.</p>
            <Button className="mt-4" onClick={() => navigate('/other-help')}>Book Service</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24 md:pb-10">
      <div className="bg-container shadow-sm px-4 py-3 flex items-center justify-between border-b border-border">
        <button onClick={() => navigate('/profile')} className="text-text-secondary hover:text-text-primary">←</button>
        <h1 className="text-xl font-semibold text-text-primary">Booking Tracking</h1>
        <div className="w-8" />
      </div>

      <div className="mx-auto max-w-3xl px-4 py-6">
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-text-secondary">Service</p>
            <p className="font-semibold text-text-primary">{booking.serviceType || 'Service booking'}</p>
            <p className="mt-1 text-sm text-text-secondary">
              {booking.scheduledDate || 'Date pending'} {booking.scheduledTime ? `• ${booking.scheduledTime}` : ''}
            </p>
          </CardContent>
        </Card>

        <Card className="mt-4">
          <CardContent className="p-5">
            <h2 className="font-semibold text-text-primary">Order Timeline</h2>
            <div className="mt-4 space-y-3">
              {statusSteps.map((step, index) => {
                const done = index <= activeIndex;
                return (
                  <div key={step.key} className="flex items-center gap-3">
                    <div className={`h-6 w-6 rounded-full border text-center text-xs leading-6 ${done ? 'border-primary bg-primary text-white' : 'border-border text-text-tertiary'}`}>
                      {done ? <AppIcon name="shield" className="mx-auto h-3.5 w-3.5 mt-[5px]" /> : ''}
                    </div>
                    <p className={done ? 'text-text-primary' : 'text-text-tertiary'}>{step.label}</p>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card className="mt-4">
          <CardContent className="p-5">
            <h2 className="mb-3 font-semibold text-text-primary">Live Location</h2>
            <GoogleLiveMap
              center={{ lat: 6.5244, lng: 3.3792 }}
              markers={[]}
              height={230}
            />
          </CardContent>
        </Card>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <Button variant="outline" onClick={() => navigate('/messages')}>Open Live Chat</Button>
          <Button onClick={markCompleted}>Mark Completed + Review</Button>
        </div>
      </div>
    </div>
  );
};

export default BookingTracking;
