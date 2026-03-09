import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { workersApi } from '../lib/dataApi';
import Button from '../components/Button';
import Badge from '../components/Badge';
import { Card, CardContent } from '../components/Card';
import { resolveAvatar } from '../lib/avatars';

const WorkerPanel = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const [worker, setWorker] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [savingAvailability, setSavingAvailability] = useState(false);

  const isWorker = user?.role === 'worker';

  const loadWorkerData = async () => {
    setLoading(true);
    setError('');
    try {
      const profileResponse = await workersApi.me();
      const workerProfile = profileResponse?.worker || null;
      setWorker(workerProfile);

      if (workerProfile?._id) {
        const bookingsResponse = await workersApi.bookings(workerProfile._id, { limit: 100 });
        setBookings(Array.isArray(bookingsResponse?.data) ? bookingsResponse.data : []);
      } else {
        setBookings([]);
      }
    } catch (err) {
      setError(err?.message || 'Unable to load worker panel');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated || !isWorker) return;
    loadWorkerData();
  }, [isAuthenticated, isWorker]);

  const filteredBookings = useMemo(() => {
    if (statusFilter === 'all') return bookings;
    return bookings.filter((booking) => booking.status === statusFilter);
  }, [bookings, statusFilter]);

  const stats = useMemo(() => {
    const total = bookings.length;
    const pending = bookings.filter((b) => b.status === 'pending').length;
    const completed = bookings.filter((b) => b.status === 'completed').length;
    const inProgress = bookings.filter((b) => b.status === 'in_progress').length;
    return { total, pending, completed, inProgress };
  }, [bookings]);

  const handleAvailabilityToggle = async () => {
    if (!worker?._id) return;
    setSavingAvailability(true);
    setError('');
    try {
      const response = await workersApi.update(worker._id, { isAvailable: !worker.isAvailable });
      setWorker((prev) => ({ ...prev, ...response?.worker, isAvailable: response?.worker?.isAvailable }));
    } catch (err) {
      setError(err?.message || 'Failed to update availability');
    } finally {
      setSavingAvailability(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <h2 className="text-xl font-semibold text-text-primary">Sign in required</h2>
            <p className="text-text-secondary mt-2">Please log in with your worker email and password.</p>
            <Button className="mt-4 w-full" onClick={() => navigate('/login')}>Go to Login</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isWorker) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <h2 className="text-xl font-semibold text-text-primary">Worker access only</h2>
            <p className="text-text-secondary mt-2">This panel is only for worker accounts.</p>
            <Button className="mt-4 w-full" onClick={() => navigate('/')}>Back Home</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const workerName = worker?.userId?.fullName || user?.fullName || 'Worker';
  const workerEmail = worker?.userId?.email || user?.email || '';
  const workerPhone = worker?.userId?.phone || user?.phone || '';

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="bg-container shadow-sm px-4 py-3 flex items-center justify-between border-b border-border">
        <h1 className="text-xl font-semibold text-text-primary">Worker Panel</h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={loadWorkerData}>Refresh</Button>
          <button
            onClick={() => {
              logout();
              navigate('/login');
            }}
            className="text-error text-sm hover:underline"
          >
            Logout
          </button>
        </div>
      </div>

      {error && (
        <div className="px-4 pt-4">
          <p className="rounded-lg border border-error bg-error-light px-3 py-2 text-sm text-text-primary">{error}</p>
        </div>
      )}

      <div className="px-4 py-4">
        <Card className="bg-container">
          <CardContent className="p-4">
            <div className="flex items-start gap-4">
              <img
                src={resolveAvatar(worker?.profilePhotoUrl || worker?.userId?.profilePhotoUrl, workerName)}
                alt={workerName}
                className="w-16 h-16 rounded-full object-cover"
              />
              <div className="flex-1">
                <h2 className="text-lg font-semibold text-text-primary">{workerName}</h2>
                <p className="text-sm text-text-secondary">{workerEmail}</p>
                <p className="text-sm text-text-tertiary">{workerPhone}</p>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant={worker?.verificationStatus === 'verified' ? 'success' : 'warning'} size="sm">
                    {worker?.verificationStatus || 'pending'}
                  </Badge>
                  <Badge variant={worker?.isAvailable ? 'success' : 'warning'} size="sm">
                    {worker?.isAvailable ? 'Available' : 'Unavailable'}
                  </Badge>
                </div>
              </div>
            </div>
            <Button
              className="mt-4 w-full"
              variant="outline"
              disabled={savingAvailability || loading}
              onClick={handleAvailabilityToggle}
            >
              {savingAvailability ? 'Saving...' : worker?.isAvailable ? 'Set Unavailable' : 'Set Available'}
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-2 gap-3 px-4 pb-4 sm:grid-cols-4">
        <Card><CardContent className="p-3"><p className="text-xs text-text-tertiary">Total</p><p className="text-xl font-semibold">{stats.total}</p></CardContent></Card>
        <Card><CardContent className="p-3"><p className="text-xs text-text-tertiary">Pending</p><p className="text-xl font-semibold">{stats.pending}</p></CardContent></Card>
        <Card><CardContent className="p-3"><p className="text-xs text-text-tertiary">In Progress</p><p className="text-xl font-semibold">{stats.inProgress}</p></CardContent></Card>
        <Card><CardContent className="p-3"><p className="text-xs text-text-tertiary">Completed</p><p className="text-xl font-semibold">{stats.completed}</p></CardContent></Card>
      </div>

      <div className="px-4 pb-3">
        <div className="flex flex-wrap gap-2">
          {['all', 'pending', 'confirmed', 'in_progress', 'completed', 'cancelled'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1 rounded-full text-sm ${statusFilter === status ? 'bg-primary text-white' : 'bg-container text-text-secondary border border-border'}`}
            >
              {status === 'all' ? 'All' : status.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 pb-8">
        <h3 className="text-lg font-semibold text-text-primary mb-3">My Bookings</h3>
        {loading ? (
          <Card><CardContent className="p-4 text-text-secondary">Loading bookings...</CardContent></Card>
        ) : filteredBookings.length === 0 ? (
          <Card><CardContent className="p-4 text-text-secondary">No bookings for this filter.</CardContent></Card>
        ) : (
          <div className="space-y-3">
            {filteredBookings.map((booking) => (
              <Card key={booking._id} className="bg-container">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="font-semibold text-text-primary">{booking.serviceId?.name || 'Service'}</h4>
                      <p className="text-sm text-text-secondary">{booking.userId?.fullName || 'User'}</p>
                      <p className="text-xs text-text-tertiary">
                        {booking.scheduledDate ? new Date(booking.scheduledDate).toLocaleDateString() : 'No date'} • {booking.scheduledTime || 'No time'}
                      </p>
                      <p className="text-xs text-text-tertiary">
                        {booking.address?.street || 'No address'}, {booking.address?.city || 'Lagos'}
                      </p>
                    </div>
                    <Badge
                      variant={
                        booking.status === 'completed'
                          ? 'success'
                          : booking.status === 'confirmed' || booking.status === 'in_progress'
                            ? 'primary'
                            : 'warning'
                      }
                      size="sm"
                    >
                      {booking.status}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkerPanel;
