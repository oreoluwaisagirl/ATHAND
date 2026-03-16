import React, { useMemo } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import Button from '../components/Button';
import Badge from '../components/Badge';
import { Card, CardContent } from '../components/Card';
import AppIcon from '../components/AppIcon';
import InteriorPage from '../components/InteriorPage';
import { resolveAvatar } from '../lib/avatars';

const quickActions = [
  { label: 'Payment Methods', path: '/payment-methods', icon: 'card' },
  { label: 'Notification Settings', path: '/notification-settings', icon: 'bell' },
  { label: 'Help Center', path: '/help-center', icon: 'question' },
];

const Profile = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { bookings, getAllWorkers } = useData();

  const allWorkers = getAllWorkers();

  const recentBookings = useMemo(() => {
    return [...bookings]
      .sort((a, b) => new Date(b.createdAt || b.scheduledDate || 0) - new Date(a.createdAt || a.scheduledDate || 0))
      .slice(0, 3);
  }, [bookings]);

  const savedProviders = useMemo(() => allWorkers.slice(0, 4), [allWorkers]);

  const displayUser = {
    name: user?.fullName || user?.name || 'User',
    location: user?.location || 'Lagos',
    phone: user?.phone || user?.phoneNumber || 'Not set',
    email: user?.email || 'Not set',
    avatar: resolveAvatar(user?.profilePhotoUrl, user?.fullName || user?.name || 'user'),
  };

  if (user?.role === 'worker') {
    return <Navigate to="/worker-panel" replace />;
  }

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to log out?')) {
      logout();
      navigate('/login');
    }
  };

  return (
    <InteriorPage
      kicker="Your Account"
      title={`${displayUser.name}, your ATHAND profile now follows the home-page layout.`}
      description="Bookings, provider shortcuts, and account settings have been restructured into softer editorial sections so your dashboard feels like part of the same marketplace system."
      badge={`${bookings.length} total bookings`}
      backLabel="Back Home"
      backTo="/"
      aside={(
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <img
              src={displayUser.avatar}
              alt={displayUser.name}
              className="h-20 w-20 rounded-[1.5rem] object-cover shadow-sm"
              onError={(e) => { e.currentTarget.src = '/images/provider-fallback.svg'; }}
            />
            <div>
              <p className="text-xl font-black tracking-[-0.04em] text-text-primary">{displayUser.name}</p>
              <p className="mt-1 text-sm text-text-secondary">{displayUser.location}</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-2xl bg-container px-3 py-4 text-center shadow-sm">
              <p className="text-2xl font-black text-text-primary">{bookings.length}</p>
              <p className="text-xs uppercase tracking-[0.16em] text-text-tertiary">Bookings</p>
            </div>
            <div className="rounded-2xl bg-container px-3 py-4 text-center shadow-sm">
              <p className="text-2xl font-black text-text-primary">{recentBookings.filter((b) => b.status === 'completed').length}</p>
              <p className="text-xs uppercase tracking-[0.16em] text-text-tertiary">Completed</p>
            </div>
            <div className="rounded-2xl bg-container px-3 py-4 text-center shadow-sm">
              <p className="text-2xl font-black text-text-primary">{savedProviders.length}</p>
              <p className="text-xs uppercase tracking-[0.16em] text-text-tertiary">Providers</p>
            </div>
          </div>
        </div>
      )}
    >
      <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <div className="space-y-6">
          <Card className="rounded-[1.8rem] border border-border bg-container">
            <CardContent className="p-6 sm:p-8">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">Account Details</p>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                {[
                  ['Email', displayUser.email],
                  ['Phone', displayUser.phone],
                  ['Location', displayUser.location],
                  ['Role', user?.role || 'user'],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-[1.4rem] border border-border bg-container-secondary px-4 py-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-text-tertiary">{label}</p>
                    <p className="mt-2 text-sm font-medium text-text-primary">{value}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-[1.8rem] border border-border bg-container">
            <CardContent className="p-6 sm:p-8">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">Recent Bookings</p>
                  <h2 className="mt-3 text-2xl font-black tracking-[-0.04em] text-text-primary">Your latest activity</h2>
                </div>
              </div>

              {recentBookings.length === 0 ? (
                <div className="mt-5 rounded-[1.4rem] border border-border bg-container-secondary px-4 py-5 text-sm text-text-secondary">
                  No booking records yet.
                </div>
              ) : (
                <div className="mt-5 space-y-4">
                  {recentBookings.map((booking, idx) => (
                    <button
                      key={booking.id || booking._id || idx}
                      type="button"
                      className="w-full rounded-[1.4rem] border border-border bg-container-secondary px-4 py-4 text-left transition hover:bg-container"
                      onClick={() => navigate(`/booking-tracking/${booking.id || booking._id}`)}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h3 className="font-semibold text-text-primary">{booking.service?.name || booking.serviceType || 'Service Booking'}</h3>
                          <p className="mt-1 text-sm text-text-secondary">
                            {booking.scheduledDate ? new Date(booking.scheduledDate).toLocaleDateString() : 'Date pending'}
                          </p>
                        </div>
                        <Badge variant={booking.status === 'completed' ? 'success' : 'primary'} size="xs">
                          {booking.status || 'pending'}
                        </Badge>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="rounded-[1.8rem] border border-border bg-container-secondary">
            <CardContent className="p-6 sm:p-8">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-accent">Quick Actions</p>
              <div className="mt-5 space-y-3">
                {quickActions.map((item) => (
                  <Button
                    key={item.path}
                    variant="outline"
                    className="w-full justify-start gap-3 rounded-xl"
                    onClick={() => navigate(item.path)}
                  >
                    <AppIcon name={item.icon} className="h-4 w-4" />
                    {item.label}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-[1.8rem] border border-border bg-container">
            <CardContent className="p-6 sm:p-8">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">Top Providers</p>
              {savedProviders.length === 0 ? (
                <div className="mt-5 rounded-[1.4rem] border border-border bg-container-secondary px-4 py-5 text-sm text-text-secondary">
                  No providers available yet.
                </div>
              ) : (
                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  {savedProviders.map((provider) => (
                    <button
                      key={provider.id}
                      type="button"
                      className="rounded-[1.4rem] border border-border bg-container-secondary p-4 text-left transition hover:bg-container"
                      onClick={() => navigate(`/worker/${provider.categoryId}/${provider.id}`)}
                    >
                      <img
                        src={resolveAvatar(provider.avatar, provider.name)}
                        alt={provider.name}
                        className="h-14 w-14 rounded-2xl object-cover"
                        onError={(e) => { e.currentTarget.src = '/images/provider-fallback.svg'; }}
                      />
                      <h3 className="mt-4 font-semibold text-text-primary">{provider.name}</h3>
                      <p className="mt-1 text-sm text-text-secondary">₦{provider.rate?.toLocaleString?.() || provider.rate}/hr</p>
                    </button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Button variant="outline" className="w-full rounded-xl" onClick={handleLogout}>Log Out</Button>
        </div>
      </div>
    </InteriorPage>
  );
};

export default Profile;
