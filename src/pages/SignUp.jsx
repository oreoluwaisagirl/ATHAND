import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Button from '../components/Button';

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
  const [info, setInfo] = useState('');

  const onChange = (field) => (e) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setInfo('');

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
    <div className="min-h-screen bg-background text-text-primary pb-20">
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <form onSubmit={handleSubmit} className="rounded-3xl border border-border bg-container p-6 shadow-xl sm:p-8">
          <div className="mb-8">
            <p className="text-xs uppercase tracking-[0.18em] text-text-tertiary">Create account</p>
            <h1 className="mt-2 text-3xl font-semibold">Join ATHAND</h1>
            <p className="mt-2 text-text-secondary">Create your account with email and password.</p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="sm:col-span-2">
              <span className="mb-1 block text-sm text-text-secondary">Full name</span>
              <input
                type="text"
                value={formData.fullName}
                onChange={onChange('fullName')}
                className="w-full rounded-xl border border-border bg-background px-4 py-3 outline-none transition focus:border-amber"
                placeholder="Your full name"
              />
            </label>

            <label>
              <span className="mb-1 block text-sm text-text-secondary">Email</span>
              <input
                type="email"
                value={formData.email}
                onChange={onChange('email')}
                className="w-full rounded-xl border border-border bg-background px-4 py-3 outline-none transition focus:border-amber"
                placeholder="you@example.com"
              />
            </label>

            <label>
              <span className="mb-1 block text-sm text-text-secondary">Phone</span>
              <input
                type="tel"
                value={formData.phone}
                onChange={onChange('phone')}
                className="w-full rounded-xl border border-border bg-background px-4 py-3 outline-none transition focus:border-amber"
                placeholder="+234..."
              />
            </label>

            <label>
              <span className="mb-1 block text-sm text-text-secondary">Password</span>
              <input
                type="password"
                value={formData.password}
                onChange={onChange('password')}
                className="w-full rounded-xl border border-border bg-background px-4 py-3 outline-none transition focus:border-amber"
                placeholder="Minimum 6 characters"
              />
            </label>

            <label>
              <span className="mb-1 block text-sm text-text-secondary">Confirm password</span>
              <input
                type="password"
                value={formData.confirmPassword}
                onChange={onChange('confirmPassword')}
                className="w-full rounded-xl border border-border bg-background px-4 py-3 outline-none transition focus:border-amber"
                placeholder="Repeat password"
              />
            </label>

            <label className="sm:col-span-2">
              <span className="mb-1 block text-sm text-text-secondary">Account type</span>
              <select
                value={formData.role}
                onChange={onChange('role')}
                className="w-full rounded-xl border border-border bg-background px-4 py-3 outline-none transition focus:border-amber"
              >
                <option value="user">Service seeker</option>
                <option value="worker">Service provider</option>
              </select>
            </label>
          </div>

          <label className="mt-5 flex items-start gap-2 text-sm text-text-secondary">
            <input
              type="checkbox"
              checked={agreeToTerms}
              onChange={(e) => setAgreeToTerms(e.target.checked)}
              className="mt-0.5"
            />
            <span>
              I agree to the <Link to="/terms-of-service" className="text-amber hover:underline">Terms</Link> and platform policies.
            </span>
          </label>

          {info && (
            <p className="mt-4 rounded-lg border border-info bg-info-light px-3 py-2 text-sm text-text-primary">
              {info}
            </p>
          )}

          {error && (
            <p className="mt-4 rounded-lg border border-error bg-error-light px-3 py-2 text-sm text-text-primary">
              {error}
            </p>
          )}

          <Button type="submit" className="mt-6 w-full" size="lg" disabled={isSubmitting}>
            {isSubmitting ? 'Creating account...' : 'Create Account'}
          </Button>

          <p className="mt-5 text-sm text-text-secondary">
            Already registered?{' '}
            <Link to="/login" className="font-medium text-amber hover:underline">
              Log in
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default SignUp;
