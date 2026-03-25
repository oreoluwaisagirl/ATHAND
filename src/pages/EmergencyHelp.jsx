import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import Badge from '../components/Badge';
import { Card, CardContent, CardHeader } from '../components/Card';
import { workersApi, bookingsApi } from '../lib/dataApi';
import { useAuth } from '../context/AuthContext';
import { resolveAvatar } from '../lib/avatars';
import GoogleLiveMap from '../components/GoogleLiveMap';

const defaultCategories = [
  { id: 'mechanic', label: 'Emergency Mechanic' },
  { id: 'plumber', label: 'Emergency Plumber' },
  { id: 'electrician', label: 'Emergency Electrician' },
  { id: 'generator_repair', label: 'Emergency Generator Repair' },
];

const EmergencyHelp = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [location, setLocation] = useState('Lagos');
  const [category, setCategory] = useState('mechanic');
  const [categories, setCategories] = useState(defaultCategories);
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [bookingWorkerId, setBookingWorkerId] = useState(null);
  const [error, setError] = useState('');
  const [userCoords, setUserCoords] = useState(null);

  const categoryLabel = useMemo(
    () => categories.find((item) => item.id === category)?.label || 'Emergency Help',
    [categories, category]
  );

  const loadEmergencyWorkers = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await workersApi.emergencyNearby({
        location,
        category,
        limit: 20,
        ...(Number.isFinite(userCoords?.lat) && Number.isFinite(userCoords?.lng)
          ? { latitude: userCoords.lat, longitude: userCoords.lng }
          : {})
      });
      setWorkers(Array.isArray(response?.data) ? response.data : []);
    } catch (err) {
      setError(err?.message || 'Unable to load emergency workers');
      setWorkers([]);
    } finally {
      setLoading(false);
    }
  }, [location, category, userCoords?.lat, userCoords?.lng]);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const response = await workersApi.emergencyCategories();
        const items = Array.isArray(response?.data) && response.data.length > 0 ? response.data : defaultCategories;
        setCategories(items);
        setCategory((current) => (items.some((item) => item.id === current) ? current : items[0].id));
      } catch {
        setCategories(defaultCategories);
      }
    };
    loadCategories();
  }, []);

  useEffect(() => {
    loadEmergencyWorkers();
  }, [loadEmergencyWorkers]);

  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserCoords({
          lat: Number(position.coords.latitude),
          lng: Number(position.coords.longitude)
        });
      },
      () => {}
    );
  }, []);

  const markers = useMemo(() => {
    const workerMarkers = workers
      .filter((worker) => Number.isFinite(worker.latitude) && Number.isFinite(worker.longitude))
      .map((worker) => ({
        lat: Number(worker.latitude),
        lng: Number(worker.longitude),
        label: worker?.userId?.fullName || 'Worker',
        info: `<strong>${worker?.userId?.fullName || 'Worker'}</strong><br/>ETA: ${worker.etaWindow || '20-40 mins'}`
      }));

    if (userCoords) {
      return [
        {
          lat: userCoords.lat,
          lng: userCoords.lng,
          label: 'Your location',
          info: '<strong>Your location</strong>'
        },
        ...workerMarkers
      ];
    }
    return workerMarkers;
  }, [workers, userCoords]);

  const handleEmergencyBooking = async (worker) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    const serviceId = worker?.recommendedService?.id;
    if (!serviceId) {
      alert('This worker has no active service attached yet. Ask admin to map worker services first.');
      return;
    }

    setBookingWorkerId(worker._id);
    setError('');
    try {
      const now = new Date();
      const scheduledTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      const bookingResponse = await bookingsApi.create({
        workerId: worker._id,
        serviceId,
        address: {
          street: `${location} Emergency Request`,
          city: 'Lagos',
          state: 'Lagos'
        },
        scheduledDate: now.toISOString(),
        scheduledTime,
        duration: 60,
        notes: `${categoryLabel} requested from emergency flow`,
        emergency: true,
        emergencyType: category
      });

      const bookingId = bookingResponse?.booking?._id;
      if (!bookingId) {
        throw new Error('Booking was created but no booking ID was returned.');
      }

      alert('Emergency booking created. Worker dispatch updates will begin shortly (20-40 mins ETA).');
      navigate('/profile');
    } catch (err) {
      setError(err?.message || 'Could not create emergency booking');
    } finally {
      setBookingWorkerId(null);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-24 md:pb-10">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-8">
        <div className="relative mb-6 overflow-hidden rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 shadow-lg">
          <div className="pointer-events-none absolute -right-12 -top-12 h-36 w-36 rounded-full bg-red-300/30 blur-3xl" />
          <div className="pointer-events-none absolute -left-12 bottom-0 h-32 w-32 rounded-full bg-amber-300/30 blur-2xl" />
          <div className="border-b border-red-200/70 px-5 py-4">
            <p className="text-xs uppercase tracking-[0.18em] text-red-600">Emergency Dispatch</p>
            <h1 className="mt-1 text-2xl font-semibold text-slate-900">Need help immediately?</h1>
            <p className="mt-1 text-sm text-slate-700">Mechanic, electrician, plumber, and generator repair response in 20-40 mins.</p>
          </div>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <h2 className="text-lg font-semibold text-text-primary">Live Dispatch Board</h2>
            <p className="mt-1 text-sm text-text-secondary">Track nearby workers, ETAs, and dispatch readiness.</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <label className="block">
                <span className="mb-1 block text-sm text-text-secondary">Location</span>
                <input
                  value={location}
                  onChange={(event) => setLocation(event.target.value)}
                  placeholder="Lagos, Lekki"
                  className="w-full rounded-md border border-border bg-background px-3 py-2"
                />
              </label>
              <div className="rounded-md border border-border bg-background px-3 py-2">
                <p className="text-xs text-text-tertiary">Dispatch Map</p>
                <p className="mb-2 text-sm text-text-secondary">Live worker markers via Google Maps SDK.</p>
                <GoogleLiveMap
                  center={userCoords || { lat: 6.5244, lng: 3.3792 }}
                  markers={markers}
                  height={210}
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {categories.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setCategory(item.id)}
                  className={`rounded-full border px-3 py-1 text-sm transition ${
                    item.id === category
                      ? 'border-red-500 bg-red-500 text-white shadow-md'
                      : 'border-border bg-container text-text-secondary hover:border-red-400'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {error ? <p className="mb-4 rounded-md border border-error bg-error-light px-3 py-2 text-sm">{error}</p> : null}

        {loading ? (
          <Card><CardContent className="p-4 text-text-secondary">Loading emergency workers...</CardContent></Card>
        ) : workers.length === 0 ? (
          <Card><CardContent className="p-4 text-text-secondary">No emergency workers available right now for this category/location.</CardContent></Card>
        ) : (
          <div className="space-y-3">
            {workers.map((worker) => {
              const name = worker?.userId?.fullName || 'Worker';
              return (
                <Card key={worker._id} className="overflow-hidden border border-slate-200 bg-gradient-to-r from-white to-slate-50">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <img
                          src={resolveAvatar(worker.profilePhotoUrl || worker?.userId?.profilePhotoUrl, name)}
                          alt={name}
                          className="h-12 w-12 rounded-full object-cover"
                        />
                        <div>
                          <h3 className="font-semibold text-text-primary">{name}</h3>
                          <p className="text-sm text-text-secondary">{worker.occupation || 'Emergency technician'}</p>
                          <p className="text-xs text-text-tertiary">{worker.serviceArea?.[0] || 'Lagos'}</p>
                          <div className="mt-2 flex items-center gap-2">
                            <Badge size="xs" variant={worker.verificationStatus === 'verified' ? 'success' : 'warning'}>
                              {worker.verificationStatus || 'pending'}
                            </Badge>
                            <Badge size="xs" variant="primary">{worker.etaWindow || '20-40 mins'}</Badge>
                            {typeof worker.distanceKm === 'number' ? (
                              <Badge size="xs" variant="info">{worker.distanceKm}km</Badge>
                            ) : null}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-text-primary">₦{(worker.hourlyRate || 5000).toLocaleString()}/hr</p>
                        <p className="text-xs text-text-tertiary">Trust {worker.trustScore || 0}</p>
                      </div>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                      <Button variant="outline" size="sm" onClick={() => navigate(`/worker/${category}/${worker._id}`)}>
                        View Profile
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleEmergencyBooking(worker)}
                        disabled={bookingWorkerId === worker._id}
                      >
                        {bookingWorkerId === worker._id ? 'Dispatching...' : 'Request Emergency Help'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default EmergencyHelp;
