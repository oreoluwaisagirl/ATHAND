const BREVO_API_URL = 'https://api.brevo.com/v3/smtp/email';
const BREVO_TIMEOUT_MS = parseInt(process.env.BREVO_TIMEOUT_MS || '15000', 10);

const parseSender = () => {
  const fallbackEmail = 'noreply@athand.com';
  const fallbackName = 'ATHAND';
  const rawFrom = String(process.env.EMAIL_FROM || '').trim();
  const explicitName = String(process.env.EMAIL_FROM_NAME || '').trim();

  const match = rawFrom.match(/^(.*)<(.+)>$/);
  if (match) {
    return {
      name: explicitName || match[1].trim().replace(/^"|"$/g, '') || fallbackName,
      email: match[2].trim(),
    };
  }

  return {
    name: explicitName || fallbackName,
    email: rawFrom || fallbackEmail,
  };
};

const classifyBrevoError = ({ status = 0, payload = null, error = null }) => {
  const message = String(payload?.message || error?.message || '').toLowerCase();

  if (error?.name === 'AbortError' || message.includes('timed out')) {
    return 'Brevo API timeout';
  }

  if (status === 401 || status === 403 || message.includes('api key')) {
    return 'Brevo auth failed';
  }

  if (status === 400 && (message.includes('sender') || message.includes('from'))) {
    return 'Brevo sender rejected';
  }

  return payload?.message || error?.message || 'Brevo email delivery failed';
};

// Send email
export const sendEmail = async ({ to, subject, text, html }) => {
  const apiKey = String(process.env.BREVO_API_KEY || '').trim();
  if (!apiKey) {
    return { success: false, error: 'BREVO_API_KEY is missing' };
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), BREVO_TIMEOUT_MS);

  try {
    const sender = parseSender();
    const response = await fetch(BREVO_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': apiKey,
      },
      body: JSON.stringify({
        sender,
        to: [{ email: to }],
        subject,
        htmlContent: html,
        textContent: text,
      }),
      signal: controller.signal,
    });

    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      const classifiedError = classifyBrevoError({ status: response.status, payload });
      console.error('Brevo email error:', {
        status: response.status,
        payload,
        classifiedError,
      });
      return { success: false, error: classifiedError };
    }

    console.log(`Email sent: ${payload.messageId}`);
    return { success: true, messageId: payload.messageId };
  } catch (error) {
    const classifiedError = classifyBrevoError({ error });
    console.error('Brevo email error:', {
      message: error?.message,
      classifiedError,
    });
    return { success: false, error: classifiedError };
  } finally {
    clearTimeout(timeout);
  }
};

// Email templates
export const sendWelcomeEmail = async (user) => {
  return sendEmail({
    to: user.email,
    subject: 'Welcome to ATHAND!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #0B1C2D;">Welcome to ATHAND!</h1>
        <p>Hi ${user.fullName},</p>
        <p>Thank you for joining ATHAND - your trusted platform for finding professional house help.</p>
        <p>With ATHAND, you can:</p>
        <ul>
          <li>Browse verified house help professionals</li>
          <li>Book services easily</li>
          <li>Track your bookings in real-time</li>
          <li>Rate and review services</li>
        </ul>
        <p>Get started by exploring our categories!</p>
        <a href="${process.env.FRONTEND_URL}/categories" 
           style="display: inline-block; background: #3B82F6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 16px;">
          Browse Services
        </a>
        <p style="margin-top: 32px; color: #666; font-size: 12px;">
          © ${new Date().getFullYear()} ATHAND. All rights reserved.
        </p>
      </div>
    `
  });
};

export const sendBookingConfirmationEmail = async (user, booking) => {
  return sendEmail({
    to: user.email,
    subject: 'Booking Confirmed - ATHAND',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #0B1C2D;">Booking Confirmed!</h1>
        <p>Hi ${user.fullName},</p>
        <p>Your booking has been confirmed. Here are the details:</p>
        <div style="background: #f5f5f5; padding: 16px; border-radius: 8px; margin: 16px 0;">
          <p><strong>Service:</strong> ${booking.serviceId?.name || 'N/A'}</p>
          <p><strong>Date:</strong> ${new Date(booking.scheduledDate).toLocaleDateString()}</p>
          <p><strong>Time:</strong> ${booking.scheduledTime}</p>
          <p><strong>Address:</strong> ${booking.address?.street}, ${booking.address?.city}</p>
          <p><strong>Amount:</strong> ₦${booking.price?.toLocaleString()}</p>
        </div>
        <p>We look forward to serving you!</p>
        <p style="margin-top: 32px; color: #666; font-size: 12px;">
          © ${new Date().getFullYear()} ATHAND. All rights reserved.
        </p>
      </div>
    `
  });
};

export const sendPaymentReceiptEmail = async (user, booking) => {
  return sendEmail({
    to: user.email,
    subject: 'Payment Receipt - ATHAND',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #0B1C2D;">Payment Receipt</h1>
        <p>Hi ${user.fullName},</p>
        <p>Your payment has been received. Thank you!</p>
        <div style="background: #f5f5f5; padding: 16px; border-radius: 8px; margin: 16px 0;">
          <p><strong>Amount Paid:</strong> ₦${booking.paymentAmount?.toLocaleString()}</p>
          <p><strong>Date:</strong> ${new Date(booking.paidAt).toLocaleDateString()}</p>
          <p><strong>Reference:</strong> ${booking.paymentReference}</p>
        </div>
        <p style="margin-top: 32px; color: #666; font-size: 12px;">
          © ${new Date().getFullYear()} ATHAND. All rights reserved.
        </p>
      </div>
    `
  });
};

export const sendWorkerVerificationEmail = async (worker, status) => {
  const user = await import('../models/User.js').then(m => m.default.findById(worker.userId));
  
  const subject = status === 'verified' 
    ? 'Verification Approved - ATHAND' 
    : 'Verification Update - ATHAND';
  
  const message = status === 'verified'
    ? 'Great news! Your verification has been approved. You can now receive bookings.'
    : `Your verification is still pending. Please check your documents and try again.`;

  return sendEmail({
    to: user?.email,
    subject,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #0B1C2D;">Verification ${status === 'verified' ? 'Approved' : 'Update'}</h1>
        <p>${message}</p>
        ${status === 'verified' ? `
          <a href="${process.env.FRONTEND_URL}/worker/dashboard" 
             style="display: inline-block; background: #3B82F6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 16px;">
            Go to Dashboard
          </a>
        ` : ''}
        <p style="margin-top: 32px; color: #666; font-size: 12px;">
          © ${new Date().getFullYear()} ATHAND. All rights reserved.
        </p>
      </div>
    `
  });
};

export const sendPasswordResetEmail = async (user, resetToken) => {
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
  
  return sendEmail({
    to: user.email,
    subject: 'Password Reset - ATHAND',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #0B1C2D;">Reset Your Password</h1>
        <p>Hi ${user.fullName},</p>
        <p>You requested to reset your password. Click the button below:</p>
        <a href="${resetUrl}" 
           style="display: inline-block; background: #3B82F6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 16px 0;">
          Reset Password
        </a>
        <p>This link expires in 1 hour.</p>
        <p>If you didn't request this, please ignore this email.</p>
        <p style="margin-top: 32px; color: #666; font-size: 12px;">
          © ${new Date().getFullYear()} ATHAND. All rights reserved.
        </p>
      </div>
    `
  });
};

export const sendProviderApprovalEmail = async ({ fullName, email }) => {
  return sendEmail({
    to: email,
    subject: 'Your ATHAND provider request has been approved',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #0B1C2D;">Provider Request Approved</h1>
        <p>Hi ${fullName},</p>
        <p>Your request to join ATHAND as a service provider has been reviewed and approved.</p>
        <p>You can now sign in and continue with your worker onboarding.</p>
        <a href="${process.env.FRONTEND_URL}/login"
           style="display: inline-block; background: #3B82F6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 16px 0;">
          Sign In to ATHAND
        </a>
        <p style="margin-top: 32px; color: #666; font-size: 12px;">
          © ${new Date().getFullYear()} ATHAND. All rights reserved.
        </p>
      </div>
    `
  });
};

export default {
  sendEmail,
  sendWelcomeEmail,
  sendBookingConfirmationEmail,
  sendPaymentReceiptEmail,
  sendWorkerVerificationEmail,
  sendPasswordResetEmail,
  sendProviderApprovalEmail
};
