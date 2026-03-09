import React, { useMemo } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import Button from '../components/Button';
import Badge from '../components/Badge';
import { Card, CardContent } from '../components/Card';
import { resolveAvatar } from '../lib/avatars';

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

  const savedProviders = useMemo(() => {
    return allWorkers.slice(0, 4);
  }, [allWorkers]);

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
    <div className="min-h-screen bg-background pb-24">
      <div className="bg-container shadow-sm px-4 py-3 flex items-center justify-between border-b border-border">
        <h1 className="text-xl font-semibold text-text-primary">Profile</h1>
        <button onClick={() => navigate('/notification-settings')} className="text-text-secondary hover:text-text-primary">⚙️</button>
      </div>

      <div className="bg-container px-4 py-6 border-b border-border">
        <div className="flex items-center space-x-4">
          <img src={displayUser.avatar} alt={displayUser.name} className="w-20 h-20 rounded-full object-cover" onError={(e) => { e.currentTarget.src = '/images/provider-fallback.svg'; }} />
          <div className="flex-1">
            <h2 className="text-xl font-semibold text-text-primary">{displayUser.name}</h2>
            <p className="text-text-secondary">{displayUser.location}</p>
            <p className="text-sm text-text-tertiary">{displayUser.email}</p>
            <p className="text-sm text-text-tertiary">{displayUser.phone}</p>
          </div>
          <Button variant="outline" size="sm">Edit</Button>
        </div>
      </div>

      <div className="bg-container px-4 py-6 border-b border-border">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div><div className="text-2xl font-bold text-amber">{bookings.length}</div><div className="text-sm text-text-secondary">Bookings</div></div>
          <div><div className="text-2xl font-bold text-amber">{recentBookings.filter((b) => b.status === 'completed').length}</div><div className="text-sm text-text-secondary">Completed</div></div>
          <div><div className="text-2xl font-bold text-amber">{savedProviders.length}</div><div className="text-sm text-text-secondary">Top Providers</div></div>
        </div>
      </div>

      <div className="px-4 py-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-text-primary">Recent Bookings</h3>
        </div>

        {recentBookings.length === 0 ? (
          <Card><CardContent className="p-4 text-text-secondary">No booking records yet.</CardContent></Card>
        ) : (
          <div className="space-y-3">
            {recentBookings.map((booking, idx) => (
              <Card key={booking.id || booking._id || idx} className="cursor-pointer hover:shadow-lg transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-text-primary">{booking.service?.name || booking.serviceType || 'Service Booking'}</h4>
                      <p className="text-sm text-text-secondary">{booking.scheduledDate ? new Date(booking.scheduledDate).toLocaleDateString() : 'Date pending'}</p>
                    </div>
                    <Badge variant={booking.status === 'completed' ? 'success' : 'primary'} size="xs">{booking.status || 'pending'}</Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <div className="px-4 py-6 border-t border-border">
        <h3 className="text-lg font-semibold text-text-primary mb-4">Top Providers</h3>
        {savedProviders.length === 0 ? (
          <Card><CardContent className="p-4 text-text-secondary">No providers available yet.</CardContent></Card>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {savedProviders.map((provider) => (
              <Card key={provider.id} className="cursor-pointer" onClick={() => navigate(`/worker/${provider.categoryId}/${provider.id}`)}>
                <CardContent className="p-3 text-center">
                  <img src={resolveAvatar(provider.avatar, provider.name)} alt={provider.name} className="w-12 h-12 rounded-full object-cover mx-auto mb-2" onError={(e) => { e.currentTarget.src = '/images/provider-fallback.svg'; }} />
                  <h4 className="font-medium text-sm text-text-primary">{provider.name}</h4>
                  <p className="text-xs text-text-tertiary">₦{provider.rate?.toLocaleString?.() || provider.rate}/hr</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <div className="px-4 py-6 border-t border-border space-y-3">
        <Button variant="outline" className="w-full justify-start" onClick={() => navigate('/payment-methods')}>💳 Payment Methods</Button>
        <Button variant="outline" className="w-full justify-start" onClick={() => navigate('/notification-settings')}>🔔 Notification Settings</Button>
        <Button variant="outline" className="w-full justify-start" onClick={() => navigate('/help-center')}>❓ Help Center</Button>
      </div>

      <div className="px-4 pb-8">
        <Button variant="outline" className="w-full" onClick={handleLogout}>Log Out</Button>
      </div>
    </div>
  );
};

export default Profile;
