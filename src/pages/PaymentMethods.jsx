import React from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/Button';

const PaymentMethods = () => {
  const navigate = useNavigate();

  const paymentMethods = [
    { id: 1, type: 'Visa', last4: '4242', expiry: '12/25', isDefault: true },
    { id: 2, type: 'Mastercard', last4: '8888', expiry: '06/26', isDefault: false },
  ];

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="bg-container shadow-sm px-4 py-3 flex items-center border-b border-border">
        <button onClick={() => navigate(-1)} className="mr-3 text-text-primary">
          ←
        </button>
        <h1 className="text-xl font-semibold text-text-primary">Payment Methods</h1>
      </div>

      {/* Saved Cards */}
      <div className="px-4 py-4">
        <h2 className="text-lg font-semibold text-text-primary mb-4">Saved Cards</h2>
        <div className="space-y-3">
          {paymentMethods.map((method) => (
            <div
              key={method.id}
              className="bg-container p-4 rounded-lg border border-border flex items-center justify-between"
            >
              <div className="flex items-center space-x-3">
                <div className="w-12 h-8 bg-gray-200 rounded flex items-center justify-center text-xs font-bold">
                  {method.type}
                </div>
                <div>
                  <p className="font-semibold text-text-primary">•••• {method.last4}</p>
                  <p className="text-sm text-text-tertiary">Expires {method.expiry}</p>
                </div>
              </div>
              {method.isDefault && (
                <span className="text-xs bg-success text-text-primary px-2 py-1 rounded">Default</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Add New Card */}
      <div className="px-4 py-4">
        <Button variant="outline" className="w-full">
          + Add New Card
        </Button>
      </div>

      {/* Payment Options */}
      <div className="px-4 py-4 border-t border-border">
        <h2 className="text-lg font-semibold text-text-primary mb-4">Other Payment Options</h2>
        <div className="space-y-3">
          <div className="bg-container p-4 rounded-lg border border-border cursor-pointer hover:shadow-md">
            <div className="flex items-center space-x-3">
              <span className="text-2xl">🏦</span>
              <div>
                <h3 className="font-semibold text-text-primary">Bank Transfer</h3>
                <p className="text-sm text-text-secondary">Pay directly from your bank account</p>
              </div>
            </div>
          </div>
          <div className="bg-container p-4 rounded-lg border border-border cursor-pointer hover:shadow-md">
            <div className="flex items-center space-x-3">
              <span className="text-2xl">📱</span>
              <div>
                <h3 className="font-semibold text-text-primary">Mobile Money</h3>
                <p className="text-sm text-text-secondary">Pay using mobile money services</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentMethods;

