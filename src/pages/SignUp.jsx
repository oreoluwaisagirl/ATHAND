import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Button from '../components/Button';
import InteriorPage from '../components/InteriorPage';
import { Card, CardContent } from '../components/Card';
import AppIcon from '../components/AppIcon';

const SignUp = () => {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'user',
  });
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const onChange = (field) => (e) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.fullName || !formData.email || !formData.phone || !formData.password) {
      setError('All fields are required.');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (!agreeToTerms) {
      setError('You must agree to the terms to continue.');
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await register({
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        role: formData.role,
      });
      if (response?.requiresWorkerOnboarding) {
        navigate('/worker-onboarding');
      } else {
        navigate('/');
      }
    } catch (err) {
      setError(err?.message || 'Unable to create your account.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <InteriorPage
      kicker="Create Account"
      title="Join ATHAND with the same home-page visual system."
      description="This sign-up flow now follows the landing page layout language: editorial headings, softer cards, lighter gradients, and cleaner form spacing."
      badge="Choose customer or provider access"
      backLabel="Back Home"
      backTo="/"
      aside={(
        <div className="space-y-4">
          <div className="rounded-[1.5rem] bg-[#eef5ea] p-5">
            <p className="text-xs uppercase tracking-[0.18em] text-primary">Membership</p>
            <p className="mt-3 text-2xl font-black leading-tight text-text-primary">Set up your account and move straight into booking or onboarding.</p>
          </div>
          {[
            ['worker', 'Service providers can continue into onboarding'],
            ['calendar', 'Customers can start searching immediately'],
            ['lock', 'Password-based access with terms acknowledgment'],
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
      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <Card className="rounded-[1.8rem] border border-[#eadfd6] bg-white shadow-[0_18px_40px_rgba(39,55,86,0.08)]">
          <CardContent className="p-6 sm:p-8">
            <div className="mb-8">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary">Registration</p>
              <h2 className="mt-3 text-3xl font-black tracking-[-0.04em] text-text-primary">Create your ATHAND profile</h2>
            </div>

            <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
              <label className="sm:col-span-2">
                <span className="mb-2 block text-sm font-medium text-text-secondary">Full name</span>
                <input type="text" value={formData.fullName} onChange={onChange('fullName')} className="w-full rounded-2xl border border-[#eadfd6] bg-[#faf7f4] px-4 py-3.5 outline-none transition focus:border-accent" placeholder="Your full name" />
              </label>

              <label>
                <span className="mb-2 block text-sm font-medium text-text-secondary">Email</span>
                <input type="email" value={formData.email} onChange={onChange('email')} className="w-full rounded-2xl border border-[#eadfd6] bg-[#faf7f4] px-4 py-3.5 outline-none transition focus:border-accent" placeholder="you@example.com" />
              </label>

              <label>
                <span className="mb-2 block text-sm font-medium text-text-secondary">Phone</span>
                <input type="tel" value={formData.phone} onChange={onChange('phone')} className="w-full rounded-2xl border border-[#eadfd6] bg-[#faf7f4] px-4 py-3.5 outline-none transition focus:border-accent" placeholder="+234..." />
              </label>

              <label>
                <span className="mb-2 block text-sm font-medium text-text-secondary">Password</span>
                <input type="password" value={formData.password} onChange={onChange('password')} className="w-full rounded-2xl border border-[#eadfd6] bg-[#faf7f4] px-4 py-3.5 outline-none transition focus:border-accent" placeholder="Minimum 6 characters" />
              </label>

              <label>
                <span className="mb-2 block text-sm font-medium text-text-secondary">Confirm password</span>
                <input type="password" value={formData.confirmPassword} onChange={onChange('confirmPassword')} className="w-full rounded-2xl border border-[#eadfd6] bg-[#faf7f4] px-4 py-3.5 outline-none transition focus:border-accent" placeholder="Repeat password" />
              </label>

              <label className="sm:col-span-2">
                <span className="mb-2 block text-sm font-medium text-text-secondary">Account type</span>
                <select value={formData.role} onChange={onChange('role')} className="w-full rounded-2xl border border-[#eadfd6] bg-[#faf7f4] px-4 py-3.5 outline-none transition focus:border-accent">
                  <option value="user">Service seeker</option>
                  <option value="worker">Service provider</option>
                </select>
              </label>

              <label className="sm:col-span-2 flex items-start gap-3 rounded-2xl border border-[#f0e6de] bg-[#faf7f4] px-4 py-4 text-sm text-text-secondary">
                <input type="checkbox" checked={agreeToTerms} onChange={(e) => setAgreeToTerms(e.target.checked)} className="mt-1" />
                <span>
                  I agree to the <Link to="/terms-of-service" className="font-medium text-accent hover:underline">Terms of Service</Link> and platform policies.
                </span>
              </label>

              {error ? (
                <p className="sm:col-span-2 rounded-2xl border border-error bg-error-light px-4 py-3 text-sm text-text-primary">
                  {error}
                </p>
              ) : null}

              <div className="sm:col-span-2">
                <Button type="submit" className="w-full rounded-xl" size="lg" disabled={isSubmitting}>
                  {isSubmitting ? 'Creating account...' : 'Create Account'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <div className="space-y-5">
          <Card className="rounded-[1.8rem] border border-[#eadfd6] bg-[#faf7f4]">
            <CardContent className="p-6">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-accent">Already registered?</p>
              <h3 className="mt-3 text-2xl font-black tracking-[-0.04em] text-text-primary">Return to sign in.</h3>
              <p className="mt-3 text-sm leading-7 text-text-secondary">If you already have an account, go back to login and continue with your existing credentials.</p>
              <Link to="/login" className="mt-5 inline-flex rounded-full bg-[#120d0b] px-5 py-3 text-sm font-semibold text-white transition hover:bg-black">
                Go to Login
              </Link>
            </CardContent>
          </Card>

          <Card className="rounded-[1.8rem] border border-[#eadfd6] bg-white">
            <CardContent className="p-6">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">Before you continue</p>
              <div className="mt-4 space-y-3">
                {['Choose the right account type', 'Use an active phone number', 'Keep your password at least 6 characters'].map((item) => (
                  <div key={item} className="flex items-center gap-3 rounded-2xl border border-[#f0e6de] px-4 py-3">
                    <span className="h-2.5 w-2.5 rounded-full bg-accent" />
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

export default SignUp;
