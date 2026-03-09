import React, { useState } from 'react';

const FilterPanel = ({ filters = [], onFilterChange, title = 'Filters' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState({});

  const togglePanel = () => {
    setIsOpen(!isOpen);
  };

  const handleFilterChange = (filterKey, value) => {
    const newFilters = { ...selectedFilters, [filterKey]: value };
    setSelectedFilters(newFilters);
    if (onFilterChange) {
      onFilterChange(newFilters);
    }
  };

  const clearFilters = () => {
    setSelectedFilters({});
    if (onFilterChange) {
      onFilterChange({});
    }
  };

  const activeFilterCount = Object.values(selectedFilters).filter(v => v).length;

  return (
    <div className="mb-4">
      {/* Filter Toggle Button */}
      <button
        onClick={togglePanel}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300 ${
          isOpen 
            ? 'bg-primary text-white' 
            : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
        }`}
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
        </svg>
        <span className="font-medium">{title}</span>
        {activeFilterCount > 0 && (
          <span className="bg-accent text-white text-xs px-2 py-0.5 rounded-full">
            {activeFilterCount}
          </span>
        )}
        <svg 
          className={`w-4 h-4 ml-auto transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Filter Panel */}
      <div 
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          isOpen ? 'max-h-[500px] opacity-100 mt-4' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex flex-wrap gap-4">
            {filters.map((filter) => (
              <div key={filter.key} className="flex-1 min-w-[200px]">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {filter.label}
                </label>
                
                {filter.type === 'select' && (
                  <select
                    value={selectedFilters[filter.key] || ''}
                    onChange={(e) => handleFilterChange(filter.key, e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-accent focus:border-transparent transition-all duration-200"
                  >
                    <option value="">{filter.placeholder || 'All'}</option>
                    {filter.options?.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                )}
                
                {filter.type === 'range' && (
                  <div className="space-y-2">
                    <input
                      type="range"
                      min={filter.min || 0}
                      max={filter.max || 100}
                      value={selectedFilters[filter.key] || filter.min || 0}
                      onChange={(e) => handleFilterChange(filter.key, parseInt(e.target.value))}
                      className="w-full h-2 bg-gray-200 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer accent-accent"
                    />
                    <div className="flex justify-between text-sm text-gray-500">
                      <span>{filter.min || 0}</span>
                      <span>{selectedFilters[filter.key] || filter.min || 0}</span>
                      <span>{filter.max || 100}</span>
                    </div>
                  </div>
                )}
                
                {filter.type === 'checkbox' && (
                  <div className="space-y-2">
                    {filter.options?.map((option) => (
                      <label key={option.value} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedFilters[filter.key]?.includes(option.value)}
                          onChange={(e) => {
                            const current = selectedFilters[filter.key] || [];
                            const newValue = e.target.checked
                              ? [...current, option.value]
                              : current.filter(v => v !== option.value);
                            handleFilterChange(filter.key, newValue);
                          }}
                          className="w-4 h-4 text-accent rounded border-gray-300 focus:ring-accent"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">{option.label}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Clear Filters Button */}
          {activeFilterCount > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={clearFilters}
                className="text-sm text-accent hover:text-accent-dark font-medium transition-colors duration-200"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FilterPanel;

