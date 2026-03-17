import nodemailer from 'nodemailer';

const SMTP_CONNECTION_TIMEOUT = parseInt(process.env.SMTP_CONNECTION_TIMEOUT || '15000', 10);
const SMTP_GREETING_TIMEOUT = parseInt(process.env.SMTP_GREETING_TIMEOUT || '10000', 10);
const SMTP_SOCKET_TIMEOUT = parseInt(process.env.SMTP_SOCKET_TIMEOUT || '20000', 10);

const classifyEmailError = (error) => {
  const code = String(error?.code || '');
  const responseCode = Number(error?.responseCode || 0);
  const message = String(error?.message || '').toLowerCase();

  if (code === 'ETIMEDOUT' || message.includes('connection timeout') || message.includes('greeting never received')) {
    return 'SMTP connection timeout';
  }

  if (code === 'ESOCKET' && message.includes('timeout')) {
    return 'SMTP socket timeout';
  }

  if (
    code === 'EAUTH'
    || responseCode === 535
    || responseCode === 534
    || message.includes('invalid login')
    || message.includes('authentication unsuccessful')
    || message.includes('bad credentials')
    || message.includes('auth')
  ) {
    return 'Brevo auth failed';
  }

  if (
    responseCode === 550
    || responseCode === 553
    || message.includes('sender')
    || message.includes('not verified')
    || message.includes('rejected')
  ) {
    return 'SMTP sender rejected';
  }

  return error?.message || 'Email delivery failed';
};

// Create transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    secure: false,
    connectionTimeout: SMTP_CONNECTION_TIMEOUT,
    greetingTimeout: SMTP_GREETING_TIMEOUT,
    socketTimeout: SMTP_SOCKET_TIMEOUT,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });
};

// Send email
export const sendEmail = async ({ to, subject, text, html }) => {
  try {
    const transporter = createTransporter();
    await transporter.verify();
    
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM || 'ATHAND <noreply@athand.com>',
      to,
      subject,
      text,
      html
    });

    console.log(`Email sent: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    const classifiedError = classifyEmailError(error);
    console.error('Email error:', {
      message: error?.message,
      code: error?.code,
      response: error?.response,
      responseCode: error?.responseCode,
      command: error?.command,
      classifiedError,
    });
    return { success: false, error: classifiedError };
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
