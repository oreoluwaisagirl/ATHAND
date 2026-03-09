import crypto from 'crypto';

const OTP_LENGTH = 6;

export const normalizePhone = (phone) => {
  if (!phone) return '';
  const digits = phone.replace(/\D/g, '');

  if (digits.startsWith('0') && digits.length === 11) {
    return `+234${digits.slice(1)}`;
  }

  if (digits.startsWith('234')) {
    return `+${digits}`;
  }

  if (phone.startsWith('+')) {
    return `+${digits}`;
  }

  return `+${digits}`;
};

export const normalizeEmail = (email) => {
  if (!email) return '';
  return String(email).trim().toLowerCase();
};

const normalizeOtpIdentifier = (identifier) => {
  if (!identifier) return '';
  return identifier.includes('@') ? normalizeEmail(identifier) : normalizePhone(identifier);
};

export const generateOtp = () => {
  const min = 10 ** (OTP_LENGTH - 1);
  const max = (10 ** OTP_LENGTH) - 1;
  return String(Math.floor(Math.random() * (max - min + 1)) + min);
};

export const hashOtp = (phone, purpose, code) => {
  const secret = process.env.OTP_HASH_SECRET || process.env.JWT_SECRET || 'otp_secret';
  return crypto
    .createHmac('sha256', secret)
    .update(`${normalizeOtpIdentifier(phone)}:${purpose}:${code}`)
    .digest('hex');
};

const sendViaTermii = async ({ phone, message }) => {
  const apiKey = process.env.TERMII_API_KEY;
  const senderId = (process.env.TERMII_SENDER_ID || '').trim();

  if (!apiKey) {
    throw new Error('TERMII_API_KEY is missing');
  }
  if (!senderId) {
    throw new Error('TERMII_SENDER_ID is missing');
  }

  const normalizedForTermii = phone.replace('+', '');

  const payloadBody = {
    to: normalizedForTermii,
    sms: message,
    type: 'plain',
    channel: process.env.TERMII_CHANNEL || 'generic',
    api_key: apiKey,
    from: senderId,
  };

  const response = await fetch('https://api.ng.termii.com/api/sms/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payloadBody),
  });

  const payload = await response.json();

  if (!response.ok || payload.code === '400' || payload.status === 'false') {
    const toText = (value) => {
      if (value === null || value === undefined) return '';
      if (typeof value === 'string') return value;
      try {
        return JSON.stringify(value);
      } catch {
        return String(value);
      }
    };
    const details = toText(payload?.message) || toText(payload?.reason) || toText(payload);
    throw new Error(`Termii delivery failed: ${details}`);
  }

  return { success: true, provider: 'termii', payload };
};

const sendViaTwilio = async ({ phone, message }) => {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_FROM_NUMBER;

  if (!accountSid || !authToken || !from) {
    throw new Error('Twilio SMS configuration is incomplete');
  }

  const form = new URLSearchParams();
  form.append('To', phone);
  form.append('From', from);
  form.append('Body', message);

  const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString('base64')}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: form,
  });

  const payload = await response.json();

  if (!response.ok) {
    throw new Error(payload.message || 'Failed to send OTP via Twilio');
  }

  return { success: true, provider: 'twilio', payload };
};

export const sendOtpSms = async ({ phone, code, purpose }) => {
  const ttl = parseInt(process.env.OTP_EXPIRY_MINUTES || '10', 10);
  const message = `Your ATHAND ${purpose.replace('_', ' ')} code is ${code}. Expires in ${ttl} minutes.`;

  const provider = (process.env.OTP_PROVIDER || 'dev').toLowerCase();
  const fallbackEnabled = String(process.env.OTP_ALLOW_FALLBACK || '').toLowerCase() === 'true';

  try {
    if (provider === 'dev') {
      console.log(`DEV OTP (${purpose}) for ${phone}: ${code}`);
      return { success: true, provider: 'dev-console' };
    }

    if (provider === 'twilio') {
      return await sendViaTwilio({ phone, message });
    }

    if (provider === 'termii') {
      return await sendViaTermii({ phone, message });
    }

    throw new Error(`Unsupported OTP provider: ${provider}`);
  } catch (error) {
    if (process.env.NODE_ENV !== 'production' || fallbackEnabled) {
      console.log(`DEV OTP (${purpose}) for ${phone}: ${code}`);
      return {
        success: true,
        provider: 'fallback-dev',
        fallback: true,
        reason: error.message || 'sms_provider_failed'
      };
    }
    throw error;
  }
};
