import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Button from '../components/Button';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Enter your email and password.');
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await login({ email, password });
      const user = response?.user;
      if (response?.requiresWorkerOnboarding) {
        navigate('/worker-onboarding');
      } else if (user?.role === 'admin') {
        navigate('/admin');
      } else if (user?.role === 'worker') {
        navigate('/worker-panel');
      } else {
        navigate('/');
      }
    } catch (err) {
      setError(err?.message || 'Unable to log in with those credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-text-primary pb-20">
      <div className="mx-auto grid min-h-screen max-w-6xl items-stretch gap-6 px-4 py-8 lg:grid-cols-2 lg:px-8">
        <section className="hidden rounded-3xl border border-border bg-container p-10 shadow-xl lg:flex lg:flex-col lg:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-text-tertiary">ATHAND</p>
            <h1 className="mt-4 text-4xl font-semibold leading-tight">Welcome back.</h1>
            <p className="mt-4 max-w-md text-text-secondary">
              Access vetted help providers, manage bookings, and keep every conversation in one place.
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-background-secondary p-6">
            <p className="text-sm text-text-secondary">Login method</p>
            <div className="mt-3 space-y-2 text-sm text-text-primary">
              <p>Email and password</p>
            </div>
          </div>
        </section>

        <section className="flex items-center">
          <div className="w-full rounded-3xl border border-border bg-container p-6 shadow-xl sm:p-8">
            <div className="mb-6">
              <p className="text-xs uppercase tracking-[0.18em] text-text-tertiary">Sign in</p>
              <h2 className="mt-2 text-3xl font-semibold">Continue your session</h2>
            </div>

            <form onSubmit={handleEmailSubmit} className="space-y-4">
              <label className="block">
                <span className="mb-1 block text-sm text-text-secondary">Email</span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-border bg-background px-4 py-3 outline-none transition focus:border-amber"
                  placeholder="you@example.com"
                  autoComplete="email"
                />
              </label>

              <label className="block">
                <span className="mb-1 block text-sm text-text-secondary">Password</span>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-border bg-background px-4 py-3 outline-none transition focus:border-amber"
                  placeholder="Enter your password"
                  autoComplete="current-password"
                />
              </label>

              <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
                {isSubmitting ? 'Logging in...' : 'Log In'}
              </Button>
            </form>

            {error && (
              <p className="mt-4 rounded-lg border border-error bg-error-light px-3 py-2 text-sm text-text-primary">
                {error}
              </p>
            )}

            <p className="mt-6 text-sm text-text-secondary">
              No account yet?{' '}
              <Link to="/signup" className="font-medium text-amber hover:underline">
                Create one
              </Link>
            </p>

            <button
              type="button"
              onClick={() => navigate('/')}
              className="mt-3 text-sm text-text-tertiary hover:text-text-secondary"
            >
              Back to home
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Login;
