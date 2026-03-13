import React, { useState, useMemo } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useData } from '../context/DataContext';
import Button from '../components/Button';
import Badge from '../components/Badge';
import { Card, CardContent } from '../components/Card';
import AppIcon from '../components/AppIcon';

// Map category ID to display name
const categoryNames = {
  nanny: 'Nannies',
  maid: 'House Maids',
  cook: 'Cooks',
  driver: 'Drivers',
  gardener: 'Gardeners',
  cleaner: 'Cleaners',
  tutor: 'Tutors',
  security: 'Security',
  engineer: 'Engineers',
  mechanic: 'Mechanics',
  carpenter: 'Carpenters',
  plumber: 'Plumbers',
  electrician: 'Electricians'
};

const categoryImages = {
  nanny: '/images/category-nanny.svg',
  maid: '/images/category-maid.svg',
  cook: '/images/category-cook.svg',
  driver: '/images/category-driver.svg',
  gardener: '/images/category-gardener.svg',
};

const CategoryList = () => {
  const navigate = useNavigate();
  const { categoryId } = useParams();
  const [searchParams] = useSearchParams();
  const { getWorkersByCategory } = useData();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [location] = useState(searchParams.get('location') || 'Lagos');
  const [sortBy, setSortBy] = useState('Relevance');
  const [activeFilters, setActiveFilters] = useState([]);
  const [compareIds, setCompareIds] = useState([]);

  // Get providers from DataContext based on category
  const categoryName = categoryNames[categoryId] || 'Category';

  // Toggle filter
  const toggleFilter = (filter) => {
    setActiveFilters(prev => 
      prev.includes(filter) 
        ? prev.filter(f => f !== filter)
        : [...prev, filter]
    );
  };

  // Filter and sort providers
  const filteredProviders = useMemo(() => {
    const categoryWorkers = getWorkersByCategory(categoryId) || [];
    let result = [...categoryWorkers];
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(provider => 
        provider.name.toLowerCase().includes(query) ||
        String(provider.location || '').toLowerCase().includes(query) ||
        String(provider.bio || '').toLowerCase().includes(query) ||
        (provider.skills || []).some(skill => String(skill).toLowerCase().includes(query))
      );
    }

    // Apply badge filters
    if (activeFilters.includes('available')) {
      result = result.filter(p => p.availability === 'Available Today' || p.availability === 'Available This Week');
    }
    if (activeFilters.includes('verified')) {
      result = result.filter(p => p.verified);
    }
    if (activeFilters.includes('topRated')) {
      result = result.filter(p => p.rating >= 4.8);
    }
    if (activeFilters.includes('under3000')) {
      result = result.filter(p => p.rate < 3000);
    }

    // Apply sorting
    switch (sortBy) {
      case 'Rating':
        return result.sort((a, b) => b.rating - a.rating);
      case 'Price Low-High':
        return result.sort((a, b) => a.rate - b.rate);
      case 'Price High-Low':
        return result.sort((a, b) => b.rate - a.rate);
      default:
        return result;
    }
  }, [getWorkersByCategory, categoryId, searchQuery, sortBy, activeFilters]);

  const mockProviders = filteredProviders;

  const toggleCompare = (providerId) => {
    setCompareIds((prev) => {
      if (prev.includes(providerId)) {
        return prev.filter((id) => id !== providerId);
      }
      if (prev.length >= 3) return prev;
      return [...prev, providerId];
    });
  };

  const compareProviders = mockProviders.filter((provider) => compareIds.includes(provider.id));
  const avgRate = compareProviders.length > 0
    ? Math.round(compareProviders.reduce((sum, p) => sum + p.rate, 0) / compareProviders.length)
    : 0;

  const avgRating = compareProviders.length > 0
    ? (compareProviders.reduce((sum, p) => sum + p.rating, 0) / compareProviders.length).toFixed(1)
    : '0.0';

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Top Navigation */}
      <div className="bg-container shadow-sm px-4 py-3 flex items-center justify-between border-b border-border">
        <button
          onClick={() => navigate('/other-help')}
          className="text-text-secondary hover:text-text-primary"
        >
          ←
        </button>
        <h1 className="text-xl font-semibold text-text-primary">{categoryName}</h1>
        <button 
          onClick={() => navigate('/notification-settings')}
          className="text-text-secondary hover:text-text-primary"
        >
          <AppIcon name="bell" className="h-5 w-5" />
        </button>
      </div>

      {/* Search & Filter Section */}
      <div className="bg-container px-4 py-4 border-b border-border">
        <img
          src={categoryImages[categoryId] || '/images/hero-service.svg'}
          alt={`${categoryName} category banner`}
          className="mb-4 h-32 w-full rounded-2xl object-cover"
        />
        <div className="mb-4">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={`Search ${categoryName.toLowerCase()} in ${location}...`}
            className="w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-amber focus:border-transparent bg-container text-text-primary placeholder-text-tertiary"
          />
        </div>

        {/* Quick Filter Chips */}
        <div className="flex space-x-2 mb-4 overflow-x-auto">
          <button 
            onClick={() => toggleFilter('available')}
            className={`px-3 py-1 rounded-full text-xs whitespace-nowrap transition-colors ${
              activeFilters.includes('available') 
                ? 'bg-primary text-white' 
                : 'bg-gray-100 text-text-secondary'
            }`}
          >
            Available This Week
          </button>
          <button 
            onClick={() => toggleFilter('verified')}
            className={`px-3 py-1 rounded-full text-xs whitespace-nowrap transition-colors ${
              activeFilters.includes('verified') 
                ? 'bg-success text-white' 
                : 'bg-gray-100 text-text-secondary'
            }`}
          >
            NIN Verified
          </button>
          <button 
            onClick={() => toggleFilter('topRated')}
            className={`px-3 py-1 rounded-full text-xs whitespace-nowrap transition-colors ${
              activeFilters.includes('topRated') 
                ? 'bg-warning text-white' 
                : 'bg-gray-100 text-text-secondary'
            }`}
          >
            Top Rated
          </button>
          <button 
            onClick={() => toggleFilter('under3000')}
            className={`px-3 py-1 rounded-full text-xs whitespace-nowrap transition-colors ${
              activeFilters.includes('under3000') 
                ? 'bg-info text-white' 
                : 'bg-gray-100 text-text-secondary'
            }`}
          >
            Under ₦3,000/hr
          </button>
        </div>

        {/* Sort Dropdown */}
        <div className="flex justify-between items-center">
          <span className="text-sm text-text-secondary">{mockProviders.length} providers found</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="text-sm border border-border rounded px-3 py-1 bg-container text-text-primary"
          >
            <option>Relevance</option>
            <option>Rating</option>
            <option>Price Low-High</option>
            <option>Price High-Low</option>
            <option>Distance</option>
          </select>
        </div>
      </div>

      {/* Provider List */}
      <div className="px-4 py-4">
        {mockProviders.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center text-text-secondary">
              No providers match your filters yet.
            </CardContent>
          </Card>
        ) : mockProviders.map((provider) => (
          <Card key={provider.id} className="mb-4 cursor-pointer hover:shadow-lg transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-start space-x-3">
                <img
                  src={provider.avatar?.includes('/api/placeholder') ? '/images/provider-fallback.svg' : provider.avatar}
                  alt={provider.name}
                  className="w-12 h-12 rounded-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = '/images/provider-fallback.svg';
                  }}
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-semibold text-text-primary">{provider.name} - Professional {categoryNames[categoryId]?.slice(0, -1) || 'Worker'}</h3>
                    <div className="flex space-x-1">
                      {provider.verified && <Badge variant="success" size="xs">NIN Verified</Badge>}
                      <Badge variant="primary" size="xs">ID Verified</Badge>
                    </div>
                  </div>
                  <p className="text-sm text-text-secondary mb-1">{provider.location}</p>
                  <p className="mb-2 flex items-center gap-1 text-sm text-text-secondary"><AppIcon name="star" className="h-4 w-4 text-orange-500" />{provider.rating} | {provider.completedJobs || 0} Jobs</p>
                  <p className="mb-2 inline-flex items-center gap-1 text-sm text-text-tertiary"><AppIcon name="pin" className="h-4 w-4" />{typeof provider.distanceKm === 'number' ? `${provider.distanceKm}km away` : 'Distance unavailable'}</p>
                  <p className="text-sm text-text-secondary mb-2">{provider.bio}</p>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-lg font-bold text-text-primary">₦{(provider.startingPrice || provider.rate).toLocaleString()} starting</span>
                      <span className="text-sm text-text-tertiary ml-2">{provider.availability}</span>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        variant={compareIds.includes(provider.id) ? 'secondary' : 'ghost'}
                        size="sm"
                        onClick={() => toggleCompare(provider.id)}
                      >
                        {compareIds.includes(provider.id) ? 'Added' : 'Compare'}
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => navigate(`/worker/${categoryId}/${provider.id}`)}
                      >
                        View Profile
                      </Button>
                      <Button 
                        size="sm"
                        onClick={() => navigate(`/chat/${encodeURIComponent(`worker-${provider.id}`)}`)}
                      >
                        Message
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => navigate(`/worker/${categoryId}/${provider.id}`)}
                      >
                        Book
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {compareProviders.length > 0 && (
        <div className="fixed bottom-24 left-4 right-4 z-40 mx-auto max-w-4xl rounded-2xl border border-white/70 bg-white/90 p-4 shadow-2xl">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.12em] text-text-tertiary">Compare Board</p>
              <p className="text-sm text-text-primary">
                {compareProviders.length} selected • Avg rating {avgRating} • Avg price ₦{avgRate.toLocaleString()}/hr
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setCompareIds([])}>Clear</Button>
              <Button size="sm" onClick={() => navigate(`/worker/${categoryId}/${compareProviders[0].id}`)}>
                Open Top Pick
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryList;
