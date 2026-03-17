import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import Badge from '../components/Badge';
import { Card, CardContent, CardHeader } from '../components/Card';
import { useData } from '../context/DataContext';
import { resolveAvatar } from '../lib/avatars';

const BookingConfirmation = () => {
  const navigate = useNavigate();
  const { getAllWorkers } = useData();
  const [paymentMethod, setPaymentMethod] = useState('bank-transfer');
  const [agreeToTerms, setAgreeToTerms] = useState(false);

  const provider = useMemo(() => getAllWorkers()[0], [getAllWorkers]);

  if (!provider) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <Card className="max-w-md w-full"><CardContent className="p-6 text-center"><p className="text-text-secondary">No provider selected yet.</p><Button onClick={() => navigate('/house-help-search')} className="mt-4">Choose Provider</Button></CardContent></Card>
      </div>
    );
  }

  const total = provider.rate * 4;

  const handleProceed = () => {
    if (!agreeToTerms) {
      alert('Please agree to terms to continue.');
      return;
    }
    navigate('/booking', { state: { worker: provider, paymentMethod } });
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="bg-container shadow-sm px-4 py-3 flex items-center justify-between border-b border-border">
        <button onClick={() => navigate('/booking-location')} className="text-text-secondary hover:text-text-primary">←</button>
        <h1 className="text-xl font-semibold text-text-primary">Review Booking</h1>
        <div className="w-8" />
      </div>

      <div className="px-4 py-6 space-y-6">
        <Card>
          <CardHeader><h3 className="font-semibold text-text-primary">Booking Summary</h3></CardHeader>
          <CardContent>
            <div className="flex items-start space-x-3 mb-4">
              <img src={resolveAvatar(provider.avatar, provider.name)} alt={provider.name} className="w-12 h-12 rounded-full object-cover" onError={(e) => { e.currentTarget.src = '/images/provider-fallback.svg'; }} />
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <h4 className="font-semibold text-text-primary">{provider.name}</h4>
                  {provider.verified && <Badge variant="success" size="xs">Verified</Badge>}
                </div>
                <p className="text-sm text-text-secondary">{provider.location}</p>
              </div>
            </div>

            <div className="space-y-2 text-sm text-text-secondary">
              <div className="flex justify-between"><span>Service</span><span className="text-text-primary">{provider.categoryId}</span></div>
              <div className="flex justify-between"><span>Duration</span><span className="text-text-primary">4 hours</span></div>
              <div className="flex justify-between"><span>Total</span><span className="font-semibold text-text-primary">₦{total.toLocaleString()}</span></div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><h3 className="font-semibold text-text-primary">Payment Method</h3></CardHeader>
          <CardContent className="space-y-3">
            <label className="flex items-center space-x-3 p-3 border border-border rounded-lg cursor-pointer">
              <input type="radio" name="payment" value="bank-transfer" checked={paymentMethod === 'bank-transfer'} onChange={(e) => setPaymentMethod(e.target.value)} />
              <div className="text-text-primary">Paystack Checkout</div>
            </label>
            <label className="flex items-center space-x-3 p-3 border border-border rounded-lg cursor-pointer">
              <input type="radio" name="payment" value="cash" checked={paymentMethod === 'cash'} onChange={(e) => setPaymentMethod(e.target.value)} />
              <div className="text-text-primary">Cash on Completion</div>
            </label>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <label className="flex items-start space-x-3 cursor-pointer">
              <input type="checkbox" checked={agreeToTerms} onChange={(e) => setAgreeToTerms(e.target.checked)} className="mt-1" />
              <span className="text-sm text-text-secondary">I agree to ATHAND terms and cancellation policy.</span>
            </label>
          </CardContent>
        </Card>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-container border-t border-border p-4 md:static md:mt-6 md:mx-auto md:max-w-3xl md:rounded-lg md:border">
        <div className="flex space-x-3">
          <Button variant="outline" onClick={() => navigate('/booking-location')} className="flex-1">Back</Button>
          <Button onClick={handleProceed} className="flex-1" disabled={!agreeToTerms}>Continue to Checkout</Button>
        </div>
      </div>
    </div>
  );
};

export default BookingConfirmation;
