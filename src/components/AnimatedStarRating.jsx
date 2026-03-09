import React, { useState, useEffect } from 'react';

const AnimatedStarRating = ({ rating = 0, maxStars = 5, size = 'md', onRatingChange, interactive = false }) => {
  const [displayRating, setDisplayRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);

  useEffect(() => {
    let currentRating = 0;
    const interval = setInterval(() => {
      currentRating += 0.5;
      if (currentRating <= rating) {
        setDisplayRating(currentRating);
      } else {
        clearInterval(interval);
      }
    }, 50);
    return () => clearInterval(interval);
  }, [rating]);

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'w-4 h-4';
      case 'lg':
        return 'w-8 h-8';
      default:
        return 'w-5 h-5';
    }
  };

  const handleClick = (index) => {
    if (interactive && onRatingChange) {
      onRatingChange(index + 1);
    }
  };

  const handleMouseEnter = (index) => {
    if (interactive) {
      setHoverRating(index + 1);
    }
  };

  const handleMouseLeave = () => {
    if (interactive) {
      setHoverRating(0);
    }
  };

  const currentRating = hoverRating || displayRating;

  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: maxStars }).map((_, index) => {
        const isFilled = index < Math.floor(currentRating);
        
        return (
          <button
            key={index}
            type="button"
            disabled={!interactive}
            onClick={() => handleClick(index)}
            onMouseEnter={() => handleMouseEnter(index)}
            onMouseLeave={handleMouseLeave}
            className={`${interactive ? 'cursor-pointer hover:scale-110' : 'cursor-default'} transition-transform duration-200 focus:outline-none`}
          >
            <svg
              className={`${getSizeClasses()} ${
                isFilled
                  ? 'text-yellow-400 fill-current'
                  : 'text-gray-300 dark:text-gray-600'
              } transition-colors duration-200`}
              viewBox="0 0 24 24"
            >
              <path
                fill={isFilled ? "currentColor" : "none"}
                stroke="currentColor"
                strokeWidth={isFilled ? 0 : 1}
                d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
              />
            </svg>
          </button>
        );
      })}
      <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
        {rating.toFixed(1)}
      </span>
    </div>
  );
};

export default AnimatedStarRating;

