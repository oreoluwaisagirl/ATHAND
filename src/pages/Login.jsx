import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Button from '../components/Button';
import InteriorPage from '../components/InteriorPage';
import AppIcon from '../components/AppIcon';
import { Card, CardContent } from '../components/Card';

const Login = () => {
  const navigate = useNavigate();
  const { requestOtp, verifyOtp, loginWithEmailOtp } = useAuth();

  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [otpRequested, setOtpRequested] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [otpToken, setOtpToken] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleRequestOtp = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!email) {
      setError('Enter your email address.');
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await requestOtp({ email, purpose: 'login' });
      setOtpRequested(true);
      setOtpVerified(false);
      setOtpToken('');
      setMessage(`OTP sent to ${response?.deliveryEmail || email}.`);
    } catch (err) {
      setError(err?.message || 'Unable to send OTP.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!email || !code) {
      setError('Enter your email and OTP code.');
      return;
    }

    try {
      setIsSubmitting(true);
      const token = await verifyOtp({ email, purpose: 'login', code });
      setOtpToken(token);
      setOtpVerified(true);
      setMessage('OTP verified. You can now continue.');
    } catch (err) {
      setError(err?.message || 'Unable to verify OTP.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!otpToken) {
      setError('Verify your OTP before continuing.');
      return;
    }

    try {
      setIsSubmitting(true);
      const user = await loginWithEmailOtp({ email, otpToken });
      if (user?.role === 'admin') {
        navigate('/admin');
      } else if (user?.role === 'worker') {
        navigate('/worker-panel');
      } else {
        navigate('/');
      }
    } catch (err) {
      setError(err?.message || 'Unable to log in with OTP.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <InteriorPage
      kicker="Sign In"
      title="Continue with the same polished ATHAND experience."
      description="Access bookings, saved providers, messages, and account settings from an interior layout that follows the home page visual rhythm."
      badge="Trusted access for customers and service providers"
      backLabel="Back Home"
      backTo="/"
      aside={(
        <div className="space-y-4">
          <div className="rounded-[1.4rem] bg-[#120d0b] p-5 text-white">
            <p className="text-xs uppercase tracking-[0.2em] text-white/60">Session Access</p>
            <p className="mt-3 text-2xl font-black leading-tight">Everything important stays one click away.</p>
          </div>
          {[
            ['shield', 'Trusted profiles and verified providers'],
            ['chat', 'Messages and updates in one place'],
            ['calendar', 'Booking history without extra steps'],
          ].map(([icon, text]) => (
            <div key={text} className="flex items-center gap-3 rounded-2xl bg-white px-4 py-3 shadow-sm">
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-[#f7f3ef] text-text-primary">
                <AppIcon name={icon} className="h-5 w-5" />
              </span>
              <p className="text-sm font-medium text-text-primary">{text}</p>
            </div>
          ))}
        </div>
      )}
    >
      <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <Card className="rounded-[1.8rem] border border-[#eadfd6] bg-white shadow-[0_18px_40px_rgba(39,55,86,0.08)]">
          <CardContent className="p-6 sm:p-8">
            <div className="mb-8">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary">Account Access</p>
              <h2 className="mt-3 text-3xl font-black tracking-[-0.04em] text-text-primary">Sign in to ATHAND</h2>
              <p className="mt-3 text-sm leading-7 text-text-secondary">Use your email to receive a one-time code, verify it, then continue into your dashboard.</p>
            </div>

            <form onSubmit={handleRequestOtp} className="space-y-4">
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-text-secondary">Email</span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setOtpRequested(false);
                    setOtpVerified(false);
                    setOtpToken('');
                    setCode('');
                  }}
                  className="w-full rounded-2xl border border-[#eadfd6] bg-[#faf7f4] px-4 py-3.5 outline-none transition focus:border-accent"
                  placeholder="you@example.com"
                  autoComplete="email"
                />
              </label>

              <Button type="submit" className="mt-2 w-full rounded-xl" size="lg" disabled={isSubmitting}>
                {isSubmitting ? 'Sending OTP...' : 'Send OTP'}
              </Button>
            </form>

            <form onSubmit={handleVerifyOtp} className="mt-4 space-y-4">
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-text-secondary">OTP code</span>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="w-full rounded-2xl border border-[#eadfd6] bg-[#faf7f4] px-4 py-3.5 outline-none transition focus:border-accent"
                  placeholder="123456"
                />
              </label>

              <Button type="submit" variant="outline" className="w-full rounded-xl" size="lg" disabled={isSubmitting || !otpRequested}>
                {isSubmitting ? 'Verifying OTP...' : 'Verify OTP'}
              </Button>
            </form>

            {message ? (
              <p className="mt-4 rounded-2xl border border-[#d9ead7] bg-[#eef7ed] px-4 py-3 text-sm text-text-primary">
                {message}
              </p>
            ) : null}

            {error ? (
              <p className="mt-4 rounded-2xl border border-error bg-error-light px-4 py-3 text-sm text-text-primary">
                {error}
              </p>
            ) : null}

            <form onSubmit={handleLogin} className="mt-4">
              <Button type="submit" className="w-full rounded-xl" size="lg" disabled={isSubmitting || !otpVerified}>
                {isSubmitting ? 'Logging in...' : 'Continue to Dashboard'}
              </Button>
            </form>

          </CardContent>
        </Card>

        <div className="space-y-5">
          <Card className="rounded-[1.8rem] border border-[#eadfd6] bg-[#faf7f4]">
            <CardContent className="p-6">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-accent">New here?</p>
              <h3 className="mt-3 text-2xl font-black tracking-[-0.04em] text-text-primary">Create your account in minutes.</h3>
              <p className="mt-3 text-sm leading-7 text-text-secondary">
                Join as a service seeker or provider and verify your email before creating the account.
              </p>
              <Link to="/signup" className="mt-5 inline-flex rounded-full bg-accent px-5 py-3 text-sm font-semibold text-white transition hover:bg-accent-darker">
                Go to Sign Up
              </Link>
            </CardContent>
          </Card>

          <Card className="rounded-[1.8rem] border border-[#eadfd6] bg-white">
            <CardContent className="p-6">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">What you get</p>
              <div className="mt-4 space-y-3">
                {['Passwordless email sign in', 'Track active bookings', 'Manage your profile settings'].map((item) => (
                  <div key={item} className="flex items-center gap-3 rounded-2xl border border-[#f0e6de] px-4 py-3">
                    <span className="h-2.5 w-2.5 rounded-full bg-primary" />
                    <p className="text-sm text-text-primary">{item}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </InteriorPage>
  );
};

export default Login;
