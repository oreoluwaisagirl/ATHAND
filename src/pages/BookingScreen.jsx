import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import { Card, CardContent, CardHeader } from '../components/Card';
import AppIcon from '../components/AppIcon';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { resolveAvatar } from '../lib/avatars';
import { bookingsApi, paymentsApi, servicesApi } from '../lib/dataApi';

const categoryToServiceSlug = {
  cleaner: 'cleaner',
  maid: 'part-time-maid',
  cook: 'cook',
  driver: 'driver',
  gardener: 'gardener',
  electrician: 'electrician',
  mechanic: 'mechanic',
  nanny: 'childcare',
  plumber: 'plumber',
};

const formatTimeForApi = (time) => {
  if (!time) return '';
  const [hours, minutes] = String(time).split(':');
  if (!hours || !minutes) return '';
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
};

const isMongoObjectId = (value) => typeof value === 'string' && /^[a-fA-F0-9]{24}$/.test(value);

const resolveServiceForWorker = (services, worker) => {
  if (!Array.isArray(services) || services.length === 0 || !worker) return null;

  const preferredSlug = categoryToServiceSlug[worker.categoryId];
  const preferredBySlug = services.find((service) => service.slug === preferredSlug);
  if (preferredBySlug) return preferredBySlug;

  const occupation = String(worker.categoryId || '').toLowerCase();
  const byName = services.find((service) => String(service.name || '').toLowerCase().includes(occupation));
  return byName || services[0] || null;
};

const BookingScreen = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { getAllWorkers, updateBooking } = useData();
  const { isAuthenticated } = useAuth();

  const worker = location.state?.worker || getAllWorkers()[0] || null;
  const [services, setServices] = useState([]);
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [duration, setDuration] = useState(120);
  const [serviceLocation, setServiceLocation] = useState(worker?.location || 'Lagos');
  const [notes, setNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState(location.state?.paymentMethod === 'cash' ? 'cash' : 'paystack');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [isLoadingServices, setIsLoadingServices] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const loadServices = async () => {
      try {
        const response = await servicesApi.list({ limit: 100 });
        setServices(Array.isArray(response?.data) ? response.data : []);
      } catch (loadError) {
        setError(loadError?.message || 'Unable to load services.');
      } finally {
        setIsLoadingServices(false);
      }
    };

    loadServices();
  }, []);

  const selectedService = useMemo(
    () => resolveServiceForWorker(services, worker),
    [services, worker]
  );

  const estimatedPrice = useMemo(() => {
    if (!worker) return 0;
    const hourlyRate = Number(worker.rate || worker.startingPrice || 0);
    const amount = (hourlyRate / 60) * Number(duration || 0);
    return Math.round(amount);
  }, [worker, duration]);

  useEffect(() => {
    if (!isAuthenticated) return;
    if (!worker) return;
    if (!selectedService) return;
    setMessage(`Booking ${selectedService.name} with ${worker.name}.`);
  }, [isAuthenticated, worker, selectedService]);

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

  const handleSubmit = async () => {
    setError('');
    setMessage('');

    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (!selectedService) {
      setError('No matching service was found for this worker.');
      return;
    }

    if (!isMongoObjectId(worker.id)) {
      setError('This worker is not synced with the backend yet. Refresh workers or choose a synced profile.');
      return;
    }

    if (!date || !time || !serviceLocation) {
      setError('Please complete date, time, and service location.');
      return;
    }

    try {
      setIsSubmitting(true);

      const bookingResponse = await bookingsApi.create({
        workerId: worker.id,
        serviceId: selectedService._id,
        address: {
          street: serviceLocation,
          city: 'Lagos',
          state: 'Lagos',
        },
        scheduledDate: new Date(date).toISOString(),
        scheduledTime: formatTimeForApi(time),
        duration: Number(duration),
        notes,
      });

      const booking = bookingResponse?.booking;
      if (!booking?._id) {
        throw new Error('Booking was created without an id.');
      }

      updateBooking(booking._id, booking);

      if (paymentMethod === 'cash') {
        setMessage('Booking created successfully. Payment will be collected on completion.');
        navigate(`/booking-tracking/${booking._id}`);
        return;
      }

      const paymentResponse = await paymentsApi.initialize({ bookingId: booking._id });
      const authorizationUrl = paymentResponse?.authorizationUrl || paymentResponse?.authorization_url;
      if (!authorizationUrl) {
        throw new Error('Payment session was created without an authorization URL.');
      }

      window.location.href = authorizationUrl;
    } catch (submitError) {
      setError(submitError?.message || 'Unable to create booking and start payment.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-24 md:pb-10">
      <div className="bg-container shadow-sm px-4 py-3 flex items-center justify-between border-b border-border">
        <button onClick={() => navigate(-1)} className="text-text-secondary hover:text-text-primary">←</button>
        <h1 className="text-xl font-semibold text-text-primary">Booking & Payment</h1>
        <div className="w-8" />
      </div>

      <div className="mx-auto max-w-3xl px-4 py-6 space-y-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <img
                src={resolveAvatar(worker.avatar, worker.name)}
                alt={worker.name}
                className="h-12 w-12 rounded-full object-cover"
                onError={(event) => { event.currentTarget.src = '/images/provider-fallback.svg'; }}
              />
              <div>
                <p className="font-semibold">{worker.name}</p>
                <p className="flex items-center gap-1 text-sm text-text-secondary">
                  <AppIcon name="star" className="h-4 w-4 text-orange-500" />
                  {worker.rating || 0} | {worker.completedJobs || 0} Jobs
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><h3 className="font-semibold">Service Details</h3></CardHeader>
          <CardContent className="space-y-3">
            <label className="block">
              <span className="mb-1 block text-sm text-text-secondary">Service</span>
              <input
                value={isLoadingServices ? 'Loading services...' : selectedService?.name || 'No matching service'}
                readOnly
                className="w-full rounded-md border border-border bg-background px-3 py-2"
              />
            </label>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block">
                <span className="mb-1 block text-sm text-text-secondary">Date</span>
                <input type="date" value={date} onChange={(event) => setDate(event.target.value)} className="w-full rounded-md border border-border bg-background px-3 py-2" />
              </label>
              <label className="block">
                <span className="mb-1 block text-sm text-text-secondary">Time</span>
                <input type="time" value={time} onChange={(event) => setTime(event.target.value)} className="w-full rounded-md border border-border bg-background px-3 py-2" />
              </label>
            </div>
            <label className="block">
              <span className="mb-1 block text-sm text-text-secondary">Duration</span>
              <select value={duration} onChange={(event) => setDuration(Number(event.target.value))} className="w-full rounded-md border border-border bg-background px-3 py-2">
                <option value={60}>1 hour</option>
                <option value={120}>2 hours</option>
                <option value={240}>4 hours</option>
                <option value={480}>8 hours</option>
              </select>
            </label>
            <label className="block">
              <span className="mb-1 block text-sm text-text-secondary">Service location</span>
              <input value={serviceLocation} onChange={(event) => setServiceLocation(event.target.value)} className="w-full rounded-md border border-border bg-background px-3 py-2" />
            </label>
            <label className="block">
              <span className="mb-1 block text-sm text-text-secondary">Notes</span>
              <textarea value={notes} onChange={(event) => setNotes(event.target.value)} rows={3} className="w-full rounded-md border border-border bg-background px-3 py-2" />
            </label>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><h3 className="font-semibold">Payment</h3></CardHeader>
          <CardContent className="space-y-3">
            <label className="flex items-center space-x-3 p-3 border border-border rounded-lg cursor-pointer">
              <input type="radio" name="payment" value="paystack" checked={paymentMethod === 'paystack'} onChange={(event) => setPaymentMethod(event.target.value)} />
              <div>
                <p className="font-medium text-text-primary">Pay online</p>
                <p className="text-sm text-text-secondary">Start Paystack checkout and hold funds in escrow.</p>
              </div>
            </label>
            <label className="flex items-center space-x-3 p-3 border border-border rounded-lg cursor-pointer">
              <input type="radio" name="payment" value="cash" checked={paymentMethod === 'cash'} onChange={(event) => setPaymentMethod(event.target.value)} />
              <div>
                <p className="font-medium text-text-primary">Cash on completion</p>
                <p className="text-sm text-text-secondary">Create the booking without online payment.</p>
              </div>
            </label>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-text-secondary">Estimated Price</span>
              <span className="font-semibold text-text-primary">₦{estimatedPrice.toLocaleString()}</span>
            </div>
            {message ? <p className="mt-3 text-sm text-text-secondary">{message}</p> : null}
            {error ? <p className="mt-3 rounded-lg border border-error bg-error-light px-3 py-2 text-sm text-text-primary">{error}</p> : null}
          </CardContent>
        </Card>
      </div>

      <div className="fixed bottom-0 left-0 right-0 border-t border-border bg-container p-4">
        <Button className="w-full" onClick={handleSubmit} disabled={isSubmitting || isLoadingServices}>
          {isSubmitting ? 'Processing...' : paymentMethod === 'cash' ? 'Create Booking' : 'Continue to Payment'}
        </Button>
      </div>
    </div>
  );
};

export default BookingScreen;
