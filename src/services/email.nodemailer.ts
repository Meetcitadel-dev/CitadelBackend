import { Resend } from 'resend';

export async function sendEmail(to: string, subject: string, text: string) {
  if (!process.env.RESEND_API_KEY) {
    throw new Error('RESEND_API_KEY is required');
  }

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
      throw new Error(`Email sending failed: ${error.message}`);
    }

    console.log(`OTP sent via Resend to ${to}:`, data?.id);
    return true;
  } catch (err: any) {
    console.error('Resend email error:', err?.message || err);
    throw new Error('EMAIL_SEND_FAILED');
  }
}