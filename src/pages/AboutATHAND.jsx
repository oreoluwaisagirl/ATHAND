import React from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import AppIcon from '../components/AppIcon';

const AboutATHAND = () => {
  const navigate = useNavigate();

  const features = [
    { icon: 'home', title: 'Home Services', description: 'Find reliable help for your home' },
    { icon: 'shield', title: 'Verified Providers', description: 'All providers are vetted' },
    { icon: 'chat', title: 'Easy Communication', description: 'Chat directly with providers' },
    { icon: 'star', title: 'Reviews & Ratings', description: 'Make informed decisions' },
  ];

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="bg-container shadow-sm px-4 py-3 flex items-center border-b border-border">
        <button onClick={() => navigate(-1)} className="mr-3 text-text-primary">
          ←
        </button>
        <h1 className="text-xl font-semibold text-text-primary">About ATHAND</h1>
      </div>

      {/* App Info */}
      <div className="px-4 py-8 text-center">
        <div className="w-20 h-20 bg-amber rounded-2xl flex items-center justify-center mx-auto mb-4 text-white">
          <AppIcon name="home" className="h-9 w-9" />
        </div>
        <h2 className="text-2xl font-bold text-text-primary mb-2">ATHAND</h2>
        <p className="text-text-secondary mb-2">Version 1.0.0</p>
        <p className="text-text-tertiary">Your trusted home service platform</p>
      </div>

      {/* Features */}
      <div className="px-4 py-4">
        <h3 className="text-lg font-semibold text-text-primary mb-4">Why ATHAND?</h3>
        <div className="grid grid-cols-2 gap-4">
          {features.map((feature, index) => (
            <div key={index} className="bg-container p-4 rounded-lg border border-border">
              <span className="mb-2 inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-background text-text-primary">
                <AppIcon name={feature.icon} className="h-5 w-5" />
              </span>
              <h4 className="font-semibold text-text-primary mb-1">{feature.title}</h4>
              <p className="text-xs text-text-secondary">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* About Text */}
      <div className="px-4 py-4">
        <div className="bg-container p-4 rounded-lg border border-border">
          <h3 className="font-semibold text-text-primary mb-2">About Us</h3>
          <p className="text-text-secondary text-sm">
            ATHAND is a platform that connects users with trusted home service providers. 
            Whether you need a house help, tutor, cleaner, or any other home service, 
            ATHAND makes it easy to find and book reliable professionals in your area.
          </p>
        </div>
      </div>

      {/* Contact */}
      <div className="px-4 py-4">
        <div className="bg-container p-4 rounded-lg border border-border">
          <h3 className="font-semibold text-text-primary mb-2">Contact Us</h3>
          <p className="text-text-secondary text-sm mb-3">
            Have questions or feedback? We'd love to hear from you!
          </p>
          <Button variant="outline" className="w-full gap-2">
            <AppIcon name="mail" className="h-4 w-4" />
            support@athand.com
          </Button>
        </div>
      </div>

      {/* Social Links */}
      <div className="px-4 py-4 text-center">
        <p className="text-text-tertiary text-sm mb-3">Follow us on social media</p>
        <div className="flex justify-center space-x-4">
          <button className="w-10 h-10 bg-container rounded-full flex items-center justify-center border border-border text-text-primary">
            <AppIcon name="facebook" className="h-4 w-4" />
          </button>
          <button className="w-10 h-10 bg-container rounded-full flex items-center justify-center border border-border text-text-primary">
            <AppIcon name="instagram" className="h-4 w-4" />
          </button>
          <button className="w-10 h-10 bg-container rounded-full flex items-center justify-center border border-border text-text-primary">
            <AppIcon name="twitter" className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Copyright */}
      <div className="px-4 py-6 text-center">
        <p className="text-xs text-text-tertiary">© 2024 ATHAND. All rights reserved.</p>
      </div>
    </div>
  );
};

export default AboutATHAND;
