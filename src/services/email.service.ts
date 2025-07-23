import { ses } from '../config/aws';

export async function sendEmail(to: string, subject: string, text: string) {
  if (process.env.AWS_SES_EMAIL_FROM) {
    const params = {
      Source: process.env.AWS_SES_EMAIL_FROM,
      Destination: { ToAddresses: [to] },
      Message: {
        Subject: { Data: subject },
        Body: { Text: { Data: text } },
      },
    };
    try {
      await ses.sendEmail(params).promise();
      return true;
    } catch (err) {
      console.error('SES send error', err);
      return false;
    }
  } else {
    // Fallback: log
    console.log(`Sending email to ${to}: ${subject} - ${text}`);
    return true;
  }
}
