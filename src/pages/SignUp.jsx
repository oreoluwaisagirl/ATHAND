import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Button from '../components/Button';
import InteriorPage from '../components/InteriorPage';
import { Card, CardContent } from '../components/Card';
import AppIcon from '../components/AppIcon';

const PendingRequestView = ({ email }) => (
  <div className="min-h-screen bg-[linear-gradient(180deg,#f7f3ef_0%,#eef5ea_100%)] px-4 py-10 text-text-primary">
    <div className="mx-auto flex min-h-[80vh] max-w-3xl items-center justify-center">
      <div className="w-full rounded-[2rem] border border-[#eadfd6] bg-white px-8 py-12 text-center shadow-[0_24px_50px_rgba(39,55,86,0.08)]">
        <div className="mx-auto inline-flex h-20 w-20 items-center justify-center rounded-full bg-[#eef5ea] text-primary">
          <AppIcon name="calendar" className="h-9 w-9" />
        </div>
        <p className="mt-6 text-sm font-semibold uppercase tracking-[0.24em] text-primary">Request Pending</p>
        <h1 className="mt-4 text-4xl font-black tracking-[-0.05em] text-text-primary">Your provider request is under review.</h1>
        <p className="mx-auto mt-5 max-w-xl text-base leading-8 text-text-secondary">
          ATHAND has received your service provider application. An admin must review and approve the request before your worker account is created.
        </p>
        <div className="mt-8 rounded-[1.4rem] border border-[#e8efe3] bg-[#f6faf3] px-5 py-4 text-left">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-text-tertiary">What happens next</p>
          <p className="mt-2 text-sm leading-7 text-text-secondary">We will notify <span className="font-semibold text-text-primary">{email}</span> as soon as your request is approved and ready for sign in.</p>
        </div>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link to="/login">
            <Button>Back to Login</Button>
          </Link>
          <Link to="/">
            <Button variant="outline">Go Home</Button>
          </Link>
        </div>
      </div>
    </div>
  </div>
);

const SignUp = () => {
  const navigate = useNavigate();
  const { register, requestProviderSignup } = useAuth();

  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'user',
  });
  const [requestPending, setRequestPending] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const onChange = (field) => (event) => {
    setFormData((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const validateForm = () => {
    if (!formData.fullName || !formData.email || !formData.phone || !formData.password) {
      return 'All fields are required.';
    }
    if (formData.password.length < 6) {
      return 'Password must be at least 6 characters.';
    }
    if (formData.password !== formData.confirmPassword) {
      return 'Passwords do not match.';
    }
    if (!agreeToTerms) {
      return 'You must agree to the terms to continue.';
    }
    return '';
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setIsSubmitting(true);

      if (formData.role === 'worker') {
        await requestProviderSignup({
          fullName: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          password: formData.password,
        });
        setRequestPending(true);
        return;
      }

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

  if (requestPending) {
    return <PendingRequestView email={formData.email} />;
  }

  return (
    <InteriorPage
      kicker="Create Account"
      title="Join ATHAND with the same home-page visual system."
      description="Customers can create accounts immediately with password sign up, while provider applications still pause for admin review."
      badge="Choose customer or provider access"
      backLabel="Back Home"
      backTo="/"
      aside={(
        <div className="space-y-4">
          <div className="rounded-[1.5rem] bg-[#eef5ea] p-5">
            <p className="text-xs uppercase tracking-[0.18em] text-primary">Membership</p>
            <p className="mt-3 text-2xl font-black leading-tight text-text-primary">Customers activate immediately. Providers go through a review queue before account approval.</p>
          </div>
          {[
            ['worker', 'Provider requests pause for admin approval'],
            ['calendar', 'Customers can start booking right away'],
            ['lock', 'Standard password-based signup and sign in'],
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
                <input type="checkbox" checked={agreeToTerms} onChange={(event) => setAgreeToTerms(event.target.checked)} className="mt-1" />
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
                  {isSubmitting ? 'Submitting...' : formData.role === 'worker' ? 'Request Provider Access' : 'Create Account'}
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
                {[
                  'Choose the right account type',
                  'Provider requests require admin approval before sign in',
                  'Keep your password at least 6 characters',
                ].map((item) => (
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
