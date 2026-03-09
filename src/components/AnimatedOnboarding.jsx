import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

const AnimatedOnboarding = ({ onComplete }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const navigate = useNavigate();

  const slides = [
    {
      id: 1,
      title: "Welcome to ATHAND",
      subtitle: "Your trusted platform for finding reliable house help",
      description: "Connect with verified professionals for all your home care needs",
      icon: (
        <svg className="w-24 h-24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
      color: "from-blue-500 to-indigo-600"
    },
    {
      id: 2,
      title: "Find Trusted Help",
      subtitle: "Browse through verified professionals",
      description: "Read reviews, check ratings, and choose the perfect match for your needs",
      icon: (
        <svg className="w-24 h-24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      ),
      color: "from-green-500 to-teal-600"
    },
    {
      id: 3,
      title: "Book Easily",
      subtitle: "Schedule services in just a few taps",
      description: "Choose your preferred date, time, and location - it's that simple",
      icon: (
        <svg className="w-24 h-24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      color: "from-purple-500 to-pink-600"
    },
    {
      id: 4,
      title: "Get Started",
      subtitle: "Join thousands of happy users",
      description: "Experience the future of home care services today",
      icon: (
        <svg className="w-24 h-24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      color: "from-orange-500 to-red-600"
    }
  ];

  const handleComplete = useCallback(() => {
    setIsVisible(false);
    setTimeout(() => {
      if (onComplete) {
        onComplete();
      } else {
        navigate('/house-help-search');
      }
    }, 300);
  }, [navigate, onComplete]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (currentSlide < slides.length - 1) {
        setIsVisible(false);
        setTimeout(() => {
          setCurrentSlide(currentSlide + 1);
          setIsVisible(true);
        }, 300);
      } else {
        handleComplete();
      }
    }, 4000);
    return () => clearTimeout(timer);
  }, [currentSlide, slides.length, handleComplete]);

  const nextSlide = () => {
    if (currentSlide < slides.length - 1) {
      setIsVisible(false);
      setTimeout(() => {
        setCurrentSlide(currentSlide + 1);
        setIsVisible(true);
      }, 300);
    } else {
      handleComplete();
    }
  };

  const skipOnboarding = () => {
    handleComplete();
  };

  const currentSlideData = slides[currentSlide];

  return (
    <div className="fixed inset-0 z-50 bg-white dark:bg-gray-900 flex flex-col items-center justify-center overflow-hidden">
      {/* Animated Background */}
      <div className={`absolute inset-0 bg-gradient-to-br ${currentSlideData.color} opacity-10`}>
        <div className="absolute inset-0 animate-pulse" style={{ animationDuration: '3s' }}>
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-white opacity-20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-white opacity-10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        </div>
      </div>

      {/* Content */}
      <div 
        className={`relative z-10 text-center px-8 max-w-lg transition-all duration-500 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}
      >
        {/* Icon */}
        <div className="mb-8 flex justify-center">
          <div className={`p-8 rounded-full bg-gradient-to-br ${currentSlideData.color} text-white shadow-2xl animate-bounce`} style={{ animationDuration: '2s' }}>
            {currentSlideData.icon}
          </div>
        </div>

        {/* Title */}
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          {currentSlideData.title}
        </h1>

        {/* Subtitle */}
        <p className="text-xl text-gray-600 dark:text-gray-300 mb-4">
          {currentSlideData.subtitle}
        </p>

        {/* Description */}
        <p className="text-gray-500 dark:text-gray-400 mb-8">
          {currentSlideData.description}
        </p>

        {/* Progress Dots */}
        <div className="flex justify-center gap-2 mb-8">
          {slides.map((_, index) => (
            <div
              key={index}
              className={`h-2 rounded-full transition-all duration-300 ${
                index === currentSlide 
                  ? 'w-8 bg-primary' 
                  : 'w-2 bg-gray-300 dark:bg-gray-600'
              }`}
            />
          ))}
        </div>

        {/* Buttons */}
        <div className="flex justify-center gap-4">
          <button
            onClick={skipOnboarding}
            className="px-6 py-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
          >
            Skip
          </button>
          <button
            onClick={nextSlide}
            className={`px-8 py-3 bg-gradient-to-r ${currentSlideData.color} text-white rounded-full font-medium shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300`}
          >
            {currentSlide === slides.length - 1 ? 'Get Started' : 'Next'}
          </button>
        </div>
      </div>

      {/* Skip hint */}
      <button
        onClick={skipOnboarding}
        className="absolute bottom-8 text-sm text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
      >
        Press any key or swipe to continue
      </button>
    </div>
  );
};

export default AnimatedOnboarding;

