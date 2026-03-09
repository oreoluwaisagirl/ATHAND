import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';
import Button from '../components/Button';
import { Card, CardContent } from '../components/Card';

const OtherHelpHub = () => {
  const navigate = useNavigate();
  const { categories, getAllWorkers } = useData();
  const [searchQuery, setSearchQuery] = useState('');

  const featuredWorkers = useMemo(() => {
    const workers = getAllWorkers();
    return [...workers]
      .sort((a, b) => {
        if ((b.verified ? 1 : 0) !== (a.verified ? 1 : 0)) {
          return (b.verified ? 1 : 0) - (a.verified ? 1 : 0);
        }
        if ((b.rating || 0) !== (a.rating || 0)) {
          return (b.rating || 0) - (a.rating || 0);
        }
        return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
      })
      .slice(0, 10);
  }, [getAllWorkers]);

  const categoryNameById = useMemo(
    () => Object.fromEntries(categories.map((cat) => [cat.id, cat.name])),
    [categories]
  );

  const featuredProviders = useMemo(
    () =>
      featuredWorkers.map(worker => ({
        id: worker.id,
        categoryId: worker.categoryId,
        name: worker.name,
        category: categoryNameById[worker.categoryId] || worker.categoryId,
        rating: worker.rating,
        rate: worker.rate,
        avatar: worker.avatar
      })),
    [featuredWorkers, categoryNameById]
  );

  const visibleCategories = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return categories;
    return categories.filter((category) => {
      return String(category.name || '').toLowerCase().includes(query)
        || String(category.id || '').toLowerCase().includes(query);
    });
  }, [categories, searchQuery]);

  const handleCategoryClick = (categoryId) => {
    navigate(`/category/${categoryId}`);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Top Navigation */}
      <div className="bg-container shadow-sm px-4 py-3 flex items-center justify-between border-b border-border">
        <button
          onClick={() => navigate('/')}
          className="text-text-secondary hover:text-text-primary"
        >
          ←
        </button>
        <h1 className="text-xl font-semibold text-text-primary">Explore Services</h1>
        <button 
          onClick={() => navigate('/notification-settings')}
          className="text-text-secondary hover:text-text-primary"
        >
          🔔
        </button>
      </div>

      {/* Category Grid */}
      <div className="px-4 py-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {visibleCategories.map((category) => (
            <Card
              key={category.id}
              className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => handleCategoryClick(category.id)}
            >
              <CardContent className="p-4 text-center">
                <div className="text-3xl mb-2">{category.icon}</div>
                <h3 className="font-semibold text-sm mb-1 text-text-primary">{category.name}</h3>
                <p className="text-xs text-text-tertiary">
                  {category.avgRating} ★ | {category.providers} providers
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Search All Categories */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Search all services..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-amber focus:border-transparent bg-container text-text-primary placeholder-text-tertiary"
          />
        </div>

        {/* Featured Providers */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-4 text-text-primary">Featured Providers</h2>
          <div className="flex space-x-4 overflow-x-auto pb-2">
            {featuredProviders.map((provider) => (
              <Card 
                key={provider.id} 
                className="flex-shrink-0 w-48 cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => navigate(`/worker/${provider.categoryId}/${provider.id}`)}
              >
                <CardContent className="p-3">
                  <img
                    src={provider.avatar}
                    alt={provider.name}
                    className="w-12 h-12 rounded-full object-cover mb-2"
                  />
                  <h4 className="font-medium text-sm mb-1 text-text-primary">{provider.name}</h4>
                  <p className="text-xs text-text-tertiary mb-1">{provider.category}</p>
                  <div className="flex items-center mb-2">
                    <div className="flex text-amber text-xs mr-1">
                      {'★'.repeat(Math.floor(provider.rating))}
                    </div>
                    <span className="text-xs text-text-tertiary">{provider.rating}</span>
                  </div>
                  <p className="text-sm font-semibold text-text-primary">₦{provider.rate.toLocaleString()}/hr</p>
                  <Button 
                    size="sm" 
                    className="w-full mt-2"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/worker/${provider.categoryId}/${provider.id}`);
                    }}
                  >
                    View Profile
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OtherHelpHub;
