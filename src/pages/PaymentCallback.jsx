import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import InteriorPage from '../components/InteriorPage';
import { Card, CardContent } from '../components/Card';
import Button from '../components/Button';
import { apiRequest } from '../lib/api';

const PaymentCallback = () => {
  const [searchParams] = useSearchParams();
  const reference = searchParams.get('reference');
  const [state, setState] = useState({ loading: true, error: '', paymentStatus: '' });

  useEffect(() => {
    const verify = async () => {
      if (!reference) {
        setState({ loading: false, error: 'Missing payment reference.', paymentStatus: '' });
        return;
      }

      try {
        const response = await apiRequest(`/payments/verify/${reference}`);
        setState({
          loading: false,
          error: '',
          paymentStatus: response?.paymentStatus || 'unknown',
        });
      } catch (error) {
        setState({
          loading: false,
          error: error?.message || 'Unable to verify payment right now.',
          paymentStatus: '',
        });
      }
    };

    verify();
  }, [reference]);

  return (
    <InteriorPage
      kicker="Payment Status"
      title="Check the result of your booking payment."
      description="ATHAND verifies the transaction reference and reports whether funds are pending, held, or fully confirmed."
      badge="Callback and verification"
      backLabel="Back Home"
      backTo="/"
    >
      <Card className="mx-auto max-w-2xl rounded-[1.8rem] border border-[#eadfd6] bg-white shadow-[0_18px_40px_rgba(39,55,86,0.08)]">
        <CardContent className="p-6 sm:p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">Reference</p>
          <p className="mt-2 break-all text-sm text-text-secondary">{reference || 'Not provided'}</p>

          {state.loading ? (
            <p className="mt-6 text-text-primary">Verifying payment...</p>
          ) : state.error ? (
            <p className="mt-6 rounded-2xl border border-error bg-error-light px-4 py-3 text-sm text-text-primary">{state.error}</p>
          ) : (
            <div className="mt-6 rounded-[1.4rem] border border-[#d9ead7] bg-[#eef7ed] p-5">
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-primary">Current Status</p>
              <p className="mt-2 text-2xl font-black capitalize text-text-primary">{state.paymentStatus}</p>
            </div>
          )}

          <div className="mt-6 flex flex-wrap gap-3">
            <Link to="/profile">
              <Button>Go to Profile</Button>
            </Link>
            <Link to="/help-center">
              <Button variant="outline">Get Help</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </InteriorPage>
  );
};

export default PaymentCallback;
