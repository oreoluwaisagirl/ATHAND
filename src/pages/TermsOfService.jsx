import React from 'react';
import { useNavigate } from 'react-router-dom';

const TermsOfService = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="bg-container shadow-sm px-4 py-3 flex items-center border-b border-border">
        <button onClick={() => navigate(-1)} className="mr-3 text-text-primary">
          ←
        </button>
        <h1 className="text-xl font-semibold text-text-primary">Terms of Service</h1>
      </div>

      {/* Content */}
      <div className="px-4 py-6">
        <div className="bg-container p-6 rounded-lg border border-border">
          <p className="text-sm text-text-secondary mb-4">Last updated: March 2024</p>
          
          <h3 className="text-lg font-semibold text-text-primary mb-2">1. Acceptance of Terms</h3>
          <p className="text-text-secondary mb-4">
            By accessing and using ATHAND, you accept and agree to be bound by the terms and provision of this agreement.
          </p>

          <h3 className="text-lg font-semibold text-text-primary mb-2">2. Use License</h3>
          <p className="text-text-secondary mb-4">
            Permission is granted to temporarily use ATHAND for personal, non-commercial use only.
          </p>

          <h3 className="text-lg font-semibold text-text-primary mb-2">3. User Accounts</h3>
          <p className="text-text-secondary mb-4">
            You are responsible for maintaining the confidentiality of your account and password.
          </p>

          <h3 className="text-lg font-semibold text-text-primary mb-2">4. Booking and Payments</h3>
          <p className="text-text-secondary mb-4">
            All bookings made through ATHAND are subject to our booking policies and payment terms.
          </p>

          <h3 className="text-lg font-semibold text-text-primary mb-2">5. Service Providers</h3>
          <p className="text-text-secondary mb-4">
            ATHAND provides a platform to connect users with independent service providers. We are not responsible for the services provided.
          </p>

          <h3 className="text-lg font-semibold text-text-primary mb-2">6. Privacy</h3>
          <p className="text-text-secondary mb-4">
            Your privacy is important to us. Please review our Privacy Policy to understand how we collect and use your information.
          </p>

          <h3 className="text-lg font-semibold text-text-primary mb-2">7. Limitation of Liability</h3>
          <p className="text-text-secondary mb-4">
            ATHAND shall not be liable for any indirect, incidental, or consequential damages.
          </p>

          <h3 className="text-lg font-semibold text-text-primary mb-2">8. Contact Information</h3>
          <p className="text-text-secondary">
            For questions about these Terms of Service, please contact us at support@athand.com
          </p>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService;

