import React, { useState, useRef } from 'react';

const PullToRefresh = ({ onRefresh, children, pullingText = 'Pull to refresh', readyText = 'Release to refresh', loadingText = 'Loading...' }) => {
  const [isPulling, setIsPulling] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const startY = useRef(0);
  const currentY = useRef(0);

  const handleTouchStart = (e) => {
    startY.current = e.touches[0].clientY;
  };

  const handleTouchMove = (e) => {
    currentY.current = e.touches[0].clientY;
    const diff = currentY.current - startY.current;
    
    // Only trigger when pulling down and at the top of the page
    if (diff > 0 && window.scrollY === 0) {
      if (diff > 80) {
        setIsReady(true);
      } else {
        setIsPulling(true);
        setIsReady(false);
      }
    }
  };

  const handleTouchEnd = async () => {
    if (isReady && !isRefreshing) {
      setIsRefreshing(true);
      setIsPulling(false);
      setIsReady(false);
      
      if (onRefresh) {
        await onRefresh();
      }
      
      setTimeout(() => {
        setIsRefreshing(false);
      }, 1000);
    } else {
      setIsPulling(false);
      setIsReady(false);
    }
  };

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className="relative"
    >
      {/* Pull indicator */}
      <div
        className={`absolute top-0 left-0 right-0 flex items-center justify-center h-16 transition-transform duration-300 ${
          isPulling || isReady || isRefreshing ? 'translate-y-0' : '-translate-y-full'
        }`}
      >
        {isRefreshing ? (
          <div className="flex items-center gap-2 text-primary">
            <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <span className="text-sm font-medium">{loadingText}</span>
          </div>
        ) : isReady ? (
          <div className="flex items-center gap-2 text-accent">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
            </svg>
            <span className="text-sm font-medium">{readyText}</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-gray-500">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
            <span className="text-sm font-medium">{pullingText}</span>
          </div>
        )}
      </div>
      
      {children}
    </div>
  );
};

export default PullToRefresh;

