import nodemailer from 'nodemailer';

export async function sendEmail(to: string, subject: string, text: string) {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });

  await transporter.sendMail({
    from: process.env.GMAIL_USER,
    to,
    subject,
    text,
  });

  console.log(`OTP sent to ${to}: ${text}`);
  return true;
} 