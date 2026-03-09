import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import { Card, CardContent, CardHeader } from '../components/Card';

const BookingLocation = () => {
  const navigate = useNavigate();
  const [address, setAddress] = useState('');
  const [apartment, setApartment] = useState('');
  const [landmark, setLandmark] = useState('');
  const [phone, setPhone] = useState('');

  const savedAddresses = [
    { id: 1, name: 'Home', address: '24 Admiralty Way, Lekki, Lagos' },
    { id: 2, name: 'Office', address: '12 Ozumba Mbadiwe, Victoria Island, Lagos' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation */}
      <div className="bg-white shadow-sm px-4 py-3 flex items-center justify-between">
        <button
          onClick={() => navigate('/booking-datetime')}
          className="text-gray-600 hover:text-gray-900"
        >
          ←
        </button>
        <h1 className="text-xl font-semibold">Location</h1>
        <div className="w-8"></div>
      </div>

      {/* Progress Indicator */}
      <div className="bg-white px-4 py-2 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-sm font-bold">3</div>
          <div className="flex-1 h-1 bg-gray-200 rounded">
            <div className="w-3/4 h-1 bg-primary rounded"></div>
          </div>
          <span className="text-sm text-gray-600">Step 3 of 4</span>
        </div>
      </div>

      <div className="px-4 py-6 space-y-6">
        {/* Location Input Section */}
        <Card>
          <CardHeader>
            <h3 className="font-semibold">Service Location</h3>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Saved Addresses */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Saved Addresses</h4>
              <div className="space-y-2">
                {savedAddresses.map((savedAddr) => (
                  <button
                    key={savedAddr.id}
                    onClick={() => setAddress(savedAddr.address)}
                    className={`w-full p-3 border rounded-lg text-left ${
                      address === savedAddr.address
                        ? 'border-primary bg-primary bg-opacity-10'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <div className="font-medium">{savedAddr.name}</div>
                    <div className="text-sm text-gray-600">{savedAddr.address}</div>
                  </button>
                ))}
                <button className="w-full p-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-gray-400">
                  + Add New Address
                </button>
              </div>
            </div>

            {/* Address Details */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Street Address *
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Enter your street address"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Apartment/Suite/Building (Optional)
              </label>
              <input
                type="text"
                value={apartment}
                onChange={(e) => setApartment(e.target.value)}
                placeholder="e.g., Apartment 5B, Lekki Gardens"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Landmark
              </label>
              <input
                type="text"
                value={landmark}
                onChange={(e) => setLandmark(e.target.value)}
                placeholder="Nearby landmark for easier navigation"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contact Phone Number
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Enter phone number for service day"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
          </CardContent>
        </Card>

        {/* Map Display Placeholder */}
        <Card>
          <CardContent className="p-4">
            <div className="bg-gray-200 h-48 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <div className="text-4xl mb-2">🗺️</div>
                <p className="text-gray-600">Interactive Map</p>
                <p className="text-sm text-gray-500">Map integration coming soon</p>
              </div>
            </div>
            <div className="mt-3 text-center">
              <Button variant="outline" size="sm">
                Adjust Pin
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Service Fee Notice */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-start space-x-3">
              <div className="text-blue-600 text-xl">ℹ️</div>
              <div>
                <h4 className="font-semibold text-blue-900 mb-1">Service Fee Adjustment</h4>
                <p className="text-sm text-blue-800">
                  Service fee may vary based on distance. Final price will be shown on the next screen.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Booking Summary Preview */}
        <Card>
          <CardHeader>
            <h3 className="font-semibold">Booking Summary</h3>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Provider</span>
                <span>Adebayo Johnson</span>
              </div>
              <div className="flex justify-between">
                <span>Date</span>
                <span>Not selected</span>
              </div>
              <div className="flex justify-between">
                <span>Time</span>
                <span>Not selected</span>
              </div>
              <div className="flex justify-between">
                <span>Duration</span>
                <span>8 hours</span>
              </div>
              <div className="flex justify-between">
                <span>Location</span>
                <span className="text-right max-w-40 truncate">{address || 'Not specified'}</span>
              </div>
              <div className="flex justify-between font-semibold">
                <span>Estimated Total</span>
                <span>₦22,000</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4">
        <div className="flex space-x-3">
          <Button
            variant="outline"
            onClick={() => navigate('/booking-datetime')}
            className="flex-1"
          >
            Back
          </Button>
          <Button
            onClick={() => navigate('/booking-confirmation')}
            className="flex-1"
            disabled={!address}
          >
            Continue to Confirmation
          </Button>
        </div>
      </div>
    </div>
  );
};

export default BookingLocation;
