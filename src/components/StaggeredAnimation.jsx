import React, { useState, useEffect } from 'react';

const StaggeredFadeIn = ({ children, delay = 0, className = '' }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div
      className={`transition-all duration-500 ease-out ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      } ${className}`}
    >
      {children}
    </div>
  );
};

const StaggeredList = ({ items, renderItem, animationDelay = 100, className = '' }) => {
  return (
    <div className={`space-y-4 ${className}`}>
      {items.map((item, index) => (
        <StaggeredFadeIn key={index} delay={index * animationDelay}>
          {renderItem(item, index)}
        </StaggeredFadeIn>
      ))}
    </div>
  );
};

const StaggeredGrid = ({ items, renderItem, columns = 2, animationDelay = 100, className = '' }) => {
  const getGridClass = () => {
    switch (columns) {
      case 1:
        return 'grid-cols-1';
      case 2:
        return 'grid-cols-1 sm:grid-cols-2';
      case 3:
        return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3';
      case 4:
        return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4';
      default:
        return 'grid-cols-1 sm:grid-cols-2';
    }
  };

  return (
    <div className={`grid ${getGridClass()} gap-4 ${className}`}>
      {items.map((item, index) => (
        <StaggeredFadeIn key={index} delay={index * animationDelay}>
          {renderItem(item, index)}
        </StaggeredFadeIn>
      ))}
    </div>
  );
};

export { StaggeredFadeIn, StaggeredList, StaggeredGrid };
export default StaggeredFadeIn;

