import React, { useState } from 'react';
import Button from '../components/Button';

const OtpDebug = () => {
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [purpose, setPurpose] = useState('signup');
  const [code, setCode] = useState('');
  const [otpToken, setOtpToken] = useState('');
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const apiOrigin = import.meta.env.VITE_API_URL || '';
  const apiBase = apiOrigin ? `${apiOrigin.replace(/\/+$/, '')}/api` : 'http://localhost:5000/api';

  const callApi = async (path, body) => {
    setIsLoading(true);
    try {
      const res = await fetch(`${apiBase}${path}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      setResponse(JSON.stringify(data, null, 2));
      return data;
    } catch (error) {
      setResponse(JSON.stringify({ error: error.message }, null, 2));
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const requestOtp = async () => {
    await callApi('/auth/otp/request', {
      purpose,
      ...(email ? { email } : {}),
      ...(phone ? { phone } : {}),
    });
  };

  const verifyOtp = async () => {
    const data = await callApi('/auth/otp/verify', {
      purpose,
      code,
      ...(email ? { email } : {}),
      ...(phone ? { phone } : {}),
    });
    if (data?.otpToken) {
      setOtpToken(data.otpToken);
    }
  };

  const loginWithPhone = async () => {
    await callApi('/auth/phone-login', { phone, otpToken });
  };

  const loginWithEmail = async () => {
    await callApi('/auth/email-login', { email, otpToken });
  };

  return (
    <div className="min-h-screen bg-background px-4 py-8 text-text-primary">
      <div className="mx-auto max-w-2xl rounded-2xl border border-border bg-container p-6 shadow-lg">
        <h1 className="text-2xl font-semibold mb-2">OTP Browser Tester</h1>
        <p className="text-sm text-text-secondary mb-6">Use this page to test OTP endpoints directly from your browser.</p>

        <div className="space-y-4">
          <div>
            <label className="block text-sm mb-1">Purpose</label>
            <select
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              className="w-full rounded-lg border border-border bg-background px-3 py-2"
            >
              <option value="signup">signup</option>
              <option value="login">login</option>
              <option value="password_reset">password_reset</option>
            </select>
          </div>

          <div>
            <label className="block text-sm mb-1">Email</label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full rounded-lg border border-border bg-background px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm mb-1">Phone</label>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="08012345678"
              className="w-full rounded-lg border border-border bg-background px-3 py-2"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <Button onClick={requestOtp} disabled={isLoading}>1. Request OTP</Button>
          </div>

          <div>
            <label className="block text-sm mb-1">OTP Code</label>
            <input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="123456"
              className="w-full rounded-lg border border-border bg-background px-3 py-2"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <Button onClick={verifyOtp} disabled={isLoading}>2. Verify OTP</Button>
          </div>

          <div>
            <label className="block text-sm mb-1">OTP Token (auto-filled after verify)</label>
            <textarea
              value={otpToken}
              onChange={(e) => setOtpToken(e.target.value)}
              rows={3}
              className="w-full rounded-lg border border-border bg-background px-3 py-2"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <Button onClick={loginWithPhone} disabled={isLoading}>3. Phone Login (login purpose only)</Button>
            <Button onClick={loginWithEmail} disabled={isLoading}>4. Email Login (login purpose only)</Button>
          </div>
        </div>

        <div className="mt-6">
          <h2 className="text-sm font-semibold mb-2">Response</h2>
          <pre className="overflow-x-auto rounded-lg border border-border bg-background p-3 text-xs">{response || 'No response yet.'}</pre>
        </div>
      </div>
    </div>
  );
};

export default OtpDebug;
