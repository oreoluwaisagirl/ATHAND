import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import Button from '../components/Button';
import Badge from '../components/Badge';
import { Card, CardContent } from '../components/Card';
import AppIcon from '../components/AppIcon';
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
    navigate('/booking', { state: { worker, categoryId } });
  };

  const handleMessage = () => {
    if (!isAuthenticated) {
      alert('Please log in or create an account to message a worker.');
      navigate('/login');
      return;
    }
    navigate(`/chat/${encodeURIComponent(`worker-${worker.id}`)}`);
  };

  const handleCall = () => {
    const target = worker.phoneNumber || '';
    if (!target) {
      alert('Phone number is not available for this worker yet.');
      return;
    }
    window.location.href = `tel:${target}`;
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
          <AppIcon name="bell" className="h-5 w-5" />
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
                <Badge variant="success" size="sm">Verified</Badge>
              )}
            </div>
            <p className="text-text-secondary">{category?.name}</p>
            <p className="text-text-tertiary text-sm">{worker.location}</p>
            
            {/* Rating */}
            <div className="flex items-center justify-center mt-2">
              <div className="mr-1 flex text-amber">
                {Array.from({ length: Math.max(1, Math.floor(worker.rating || 0)) }).map((_, index) => (
                  <AppIcon key={index} name="star" className="h-4 w-4 fill-current stroke-current" />
                ))}
              </div>
              <span className="text-text-secondary">{worker.rating} ({worker.reviews} reviews)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="bg-container px-4 py-4 border-b border-border">
        <div className="grid grid-cols-4 gap-4 text-center">
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
          <div>
            <div className="text-xl font-bold text-amber">{worker.completedJobs || 0}</div>
            <div className="text-xs text-text-secondary">Completed Jobs</div>
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
              NIN Verified
            </Badge>
          )}
          <Badge variant="primary" className="whitespace-nowrap">
            ID Verified
          </Badge>
          <Badge variant="warning" className="whitespace-nowrap">
            Background Checked
          </Badge>
        </div>
      </div>

      {/* Portfolio */}
      <div className="px-4 py-4">
        <h3 className="text-lg font-semibold text-text-primary mb-3">Portfolio</h3>
        {Array.isArray(worker.portfolioImages) && worker.portfolioImages.length > 0 ? (
          <div className="grid grid-cols-3 gap-2">
            {worker.portfolioImages.slice(0, 6).map((imageUrl, index) => (
              <img
                key={`${imageUrl}-${index}`}
                src={imageUrl}
                alt={`${worker.name} portfolio ${index + 1}`}
                className="h-24 w-full rounded-md border border-border object-cover"
              />
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-4 text-sm text-text-secondary">
              No portfolio uploaded yet.
            </CardContent>
          </Card>
        )}
      </div>

      {/* Reviews */}
      <div className="px-4 py-4">
        <h3 className="text-lg font-semibold text-text-primary mb-3">Reviews</h3>
        <Card>
          <CardContent className="p-4">
            <p className="flex items-center gap-1 text-sm text-text-secondary"><AppIcon name="star" className="h-4 w-4 text-orange-500" />{worker.rating} average from {worker.reviews || 0} customer reviews.</p>
            {(worker.reviews || 0) === 0 ? (
              <p className="mt-2 text-sm text-text-tertiary">No public review comments yet.</p>
            ) : null}
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons */}
      <div className="px-4 py-4 fixed bottom-16 left-0 right-0 bg-container border-t border-border md:static md:mt-6 md:mx-auto md:max-w-3xl md:rounded-lg md:border">
        <div className="flex space-x-3">
          <Button 
            variant="outline" 
            className="flex-1"
            onClick={handleMessage}
          >
            Chat
          </Button>
          <Button
            variant="outline"
            className="flex-1"
            onClick={handleCall}
          >
            Call
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
