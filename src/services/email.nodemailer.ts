import nodemailer from 'nodemailer';
import sgMail from '@sendgrid/mail';
import { Resend } from 'resend';

export async function sendEmail(to: string, subject: string, text: string) {
  // Try Resend first (most reliable for cloud platforms)
  if (process.env.RESEND_API_KEY) {
    try {
      const resend = new Resend(process.env.RESEND_API_KEY);
      const { data, error } = await resend.emails.send({
        from: (process.env.RESEND_FROM || 'noreply@hello.meetcitadel.com').toLowerCase(),
        to: [to],
        subject,
        text,
      });

      if (error) {
        console.error('Resend email error:', error);
        throw error;
      }

      console.log(`OTP sent via Resend to ${to}:`, data?.id);
      return true;
    } catch (err: any) {
      console.error('Resend email error:', err?.message || err);
      // fall through to try SendGrid
    }
  }

  // Fallback to SendGrid
  if (process.env.SENDGRID_API_KEY) {
    try {
      sgMail.setApiKey(process.env.SENDGRID_API_KEY);
      await sgMail.send({
        to,
        from: process.env.SENDGRID_FROM || process.env.GMAIL_USER || 'no-reply@example.com',
        subject,
        text,
      });
      console.log(`OTP sent via SendGrid to ${to}`);
      return true;
    } catch (err: any) {
      console.error('SendGrid email error:', err?.response?.body || err?.message || err);
      // fall through to try SMTP
    }
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : 465,
    secure: process.env.SMTP_SECURE ? process.env.SMTP_SECURE === 'true' : true,
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
    pool: true,
    connectionTimeout: 10000,
    socketTimeout: 10000,
    // Additional Gmail optimizations for production
    tls: {
      rejectUnauthorized: false
    },
    debug: process.env.NODE_ENV === 'development',
    logger: process.env.NODE_ENV === 'development'
  } as any);

  try {
    // Wrap in Promise to ensure email is fully sent before function returns
    await new Promise((resolve, reject) => {
      transporter.sendMail({
        from: process.env.GMAIL_USER,
        to,
        subject,
        text,
      }, (err, info) => {
        if (err) {
          console.error('SMTP email error:', err);
          reject(err);
        } else {
          console.log(`OTP sent via SMTP to ${to}:`, info?.messageId);
          resolve(info);
        }
      });
    });
    return true;
  } catch (error: any) {
    console.error('SMTP email error:', error?.message || error);
    throw new Error('EMAIL_SEND_FAILED');
  }
}