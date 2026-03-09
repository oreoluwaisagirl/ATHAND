import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import Button from '../components/Button';
import Badge from '../components/Badge';
import { Card, CardContent } from '../components/Card';
import { resolveAvatar } from '../lib/avatars';

const WorkerProfile = () => {
  const navigate = useNavigate();
  const { categoryId, workerId } = useParams();
  const { isAuthenticated } = useAuth();
  const { getWorkersByCategory, categories } = useData();

  // Find the worker
  const categoryWorkers = getWorkersByCategory(categoryId) || [];
  const worker = categoryWorkers.find((w) => String(w.id) === String(workerId));

  // Get category info
  const category = categories.find(c => c.id === categoryId);

  const handleBookNow = () => {
    if (!isAuthenticated) {
      alert('Please log in or create an account to book a worker.');
      navigate('/login');
      return;
    }
    navigate('/booking-location');
  };

  const handleMessage = () => {
    if (!isAuthenticated) {
      alert('Please log in or create an account to message a worker.');
      navigate('/login');
      return;
    }
    navigate(`/chat/${encodeURIComponent(`worker-${worker.id}`)}`);
  };

  if (!worker) {
    return (
      <div className="min-h-screen bg-background pb-20 flex items-center justify-center">
        <div className="text-center">
          <p className="text-text-secondary">Worker not found</p>
          <Button onClick={() => navigate(-1)} className="mt-4">
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Top Navigation */}
      <div className="bg-container shadow-sm px-4 py-3 flex items-center justify-between border-b border-border">
        <button
          onClick={() => navigate(-1)}
          className="text-text-secondary hover:text-text-primary text-2xl"
        >
          ←
        </button>
        <h1 className="text-xl font-semibold text-text-primary">Profile</h1>
        <button 
          onClick={() => navigate('/notification-settings')}
          className="text-text-secondary hover:text-text-primary"
        >
          🔔
        </button>
      </div>

      {/* Profile Header */}
      <div className="bg-container px-4 py-6 border-b border-border">
        <div className="flex flex-col items-center">
          <img
            src={resolveAvatar(worker.avatar, worker.name)}
            alt={worker.name}
            className="w-24 h-24 rounded-full object-cover mb-4"
            onError={(e) => {
              e.currentTarget.src = '/images/provider-fallback.svg';
            }}
          />
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <h2 className="text-2xl font-bold text-text-primary">{worker.name}</h2>
              {worker.verified && (
                <Badge variant="success" size="sm">✓ Verified</Badge>
              )}
            </div>
            <p className="text-text-secondary">{category?.name}</p>
            <p className="text-text-tertiary text-sm">{worker.location}</p>
            
            {/* Rating */}
            <div className="flex items-center justify-center mt-2">
              <div className="flex text-amber mr-1">
                {'★'.repeat(Math.floor(worker.rating))}
              </div>
              <span className="text-text-secondary">{worker.rating} ({worker.reviews} reviews)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="bg-container px-4 py-4 border-b border-border">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-xl font-bold text-amber">₦{worker.rate.toLocaleString()}</div>
            <div className="text-xs text-text-secondary">per hour</div>
          </div>
          <div>
            <div className="text-xl font-bold text-amber">{worker.experience}</div>
            <div className="text-xs text-text-secondary">Experience</div>
          </div>
          <div>
            <div className="text-xl font-bold text-amber">{worker.age}</div>
            <div className="text-xs text-text-secondary">Years Old</div>
          </div>
        </div>
      </div>

      {/* Availability */}
      <div className="bg-container px-4 py-4 border-b border-border">
        <div className="flex items-center justify-between">
          <span className="text-text-secondary">Availability</span>
          <Badge variant={worker.availability === 'Available Today' ? 'success' : 'primary'}>
            {worker.availability}
          </Badge>
        </div>
      </div>

      {/* About */}
      <div className="px-4 py-4">
        <h3 className="text-lg font-semibold text-text-primary mb-3">About</h3>
        <Card>
          <CardContent className="p-4">
            <p className="text-text-secondary">{worker.bio}</p>
          </CardContent>
        </Card>
      </div>

      {/* Skills */}
      <div className="px-4 py-4">
        <h3 className="text-lg font-semibold text-text-primary mb-3">Skills</h3>
        <div className="flex flex-wrap gap-2">
          {worker.skills.map((skill, index) => (
            <Badge key={index} variant="info" className="whitespace-nowrap">
              {skill}
            </Badge>
          ))}
        </div>
      </div>

      {/* Languages */}
      <div className="px-4 py-4">
        <h3 className="text-lg font-semibold text-text-primary mb-3">Languages</h3>
        <div className="flex flex-wrap gap-2">
          {worker.languages.map((lang, index) => (
            <Badge key={index} variant="secondary" className="whitespace-nowrap">
              {lang}
            </Badge>
          ))}
        </div>
      </div>

      {/* Verification Badges */}
      <div className="px-4 py-4">
        <h3 className="text-lg font-semibold text-text-primary mb-3">Verification</h3>
        <div className="flex flex-wrap gap-2">
          {worker.verified && (
            <Badge variant="success" className="whitespace-nowrap">
              ✓ NIN Verified
            </Badge>
          )}
          <Badge variant="primary" className="whitespace-nowrap">
            ✓ ID Verified
          </Badge>
          <Badge variant="warning" className="whitespace-nowrap">
            ✓ Background Checked
          </Badge>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="px-4 py-4 fixed bottom-16 left-0 right-0 bg-container border-t border-border">
        <div className="flex space-x-3">
          <Button 
            variant="outline" 
            className="flex-1"
            onClick={handleMessage}
          >
            💬 Message
          </Button>
          <Button 
            className="flex-1"
            onClick={handleBookNow}
          >
            Book Now
          </Button>
        </div>
      </div>
    </div>
  );
};

export default WorkerProfile;
