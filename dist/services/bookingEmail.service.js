"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendBookingConfirmationEmail = sendBookingConfirmationEmail;
const resend_1 = require("resend");
async function sendBookingConfirmationEmail(data) {
    if (!process.env.RESEND_API_KEY) {
        console.error('RESEND_API_KEY is not configured');
        return false;
    }
    try {
        const resend = new resend_1.Resend(process.env.RESEND_API_KEY);
        // Format date nicely
        const eventDateFormatted = new Date(data.eventDate).toLocaleDateString('en-IN', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        // Create email subject
        const subject = `🎉 Booking Confirmed - Citadel Dinner on ${eventDateFormatted}`;
        // Create HTML email content
        const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      background-color: #f5f5f5;
    }
    .container {
      background-color: #ffffff;
      border-radius: 12px;
      padding: 40px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    .header {
      text-align: center;
      margin-bottom: 30px;
      padding-bottom: 20px;
      border-bottom: 2px solid #1BEA7B;
    }
    .header h1 {
      color: #1BEA7B;
      margin: 0;
      font-size: 28px;
    }
    .greeting {
      font-size: 18px;
      margin-bottom: 20px;
      color: #333;
    }
    .details-section {
      background-color: #f9f9f9;
      border-radius: 8px;
      padding: 20px;
      margin: 20px 0;
    }
    .detail-row {
      display: flex;
      justify-content: space-between;
      padding: 12px 0;
      border-bottom: 1px solid #e0e0e0;
    }
    .detail-row:last-child {
      border-bottom: none;
    }
    .detail-label {
      font-weight: 600;
      color: #666;
    }
    .detail-value {
      color: #333;
      text-align: right;
    }
    .highlight {
      background-color: #1BEA7B;
      color: white;
      padding: 15px;
      border-radius: 8px;
      text-align: center;
      margin: 20px 0;
      font-weight: 600;
    }
    .payment-info {
      background-color: ${data.paymentStatus === 'pending' ? '#FFF3CD' : '#D4EDDA'};
      border-left: 4px solid ${data.paymentStatus === 'pending' ? '#FFC107' : '#28A745'};
      padding: 15px;
      margin: 20px 0;
      border-radius: 4px;
    }
    .footer {
      text-align: center;
      margin-top: 30px;
      padding-top: 20px;
      border-top: 1px solid #e0e0e0;
      color: #666;
      font-size: 14px;
    }
    .button {
      display: inline-block;
      background-color: #1BEA7B;
      color: white;
      padding: 12px 30px;
      text-decoration: none;
      border-radius: 6px;
      margin: 20px 0;
      font-weight: 600;
    }
    .important-note {
      background-color: #E3F2FD;
      border-left: 4px solid #2196F3;
      padding: 15px;
      margin: 20px 0;
      border-radius: 4px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎉 Booking Confirmed!</h1>
    </div>

    <div class="greeting">
      Hi ${data.userName},
    </div>

    <p>
      Your booking for the Citadel Dinner has been confirmed! We're excited to have you join us for an amazing evening of great food and wonderful company.
    </p>

    <div class="highlight">
      Booking ID: ${data.bookingId}
    </div>

    <div class="details-section">
      <h3 style="margin-top: 0; color: #333;">📅 Event Details</h3>
      
      <div class="detail-row">
        <span class="detail-label">Date:</span>
        <span class="detail-value">${eventDateFormatted}</span>
      </div>
      
      <div class="detail-row">
        <span class="detail-label">Time:</span>
        <span class="detail-value">${data.eventTime}</span>
      </div>
      
      <div class="detail-row">
        <span class="detail-label">City:</span>
        <span class="detail-value">${data.city}</span>
      </div>
      
      <div class="detail-row">
        <span class="detail-label">Area:</span>
        <span class="detail-value">${data.area}</span>
      </div>
      
      ${data.venue ? `
      <div class="detail-row">
        <span class="detail-label">Venue:</span>
        <span class="detail-value">${data.venue}</span>
      </div>
      ` : ''}
      
      ${data.venueAddress ? `
      <div class="detail-row">
        <span class="detail-label">Address:</span>
        <span class="detail-value">${data.venueAddress}</span>
      </div>
      ` : ''}
    </div>

    <div class="details-section">
      <h3 style="margin-top: 0; color: #333;">💳 Payment Details</h3>
      
      <div class="detail-row">
        <span class="detail-label">Booking Fee:</span>
        <span class="detail-value">₹${data.bookingFee}</span>
      </div>
      
      <div class="detail-row">
        <span class="detail-label">Payment Method:</span>
        <span class="detail-value">${data.paymentMethod === 'cash' ? 'Cash (Pay at Venue)' : data.paymentGateway.toUpperCase()}</span>
      </div>
      
      <div class="detail-row">
        <span class="detail-label">Payment Status:</span>
        <span class="detail-value">${data.paymentStatus === 'pending' ? '⏳ Pending' : '✅ Completed'}</span>
      </div>
    </div>

    ${data.paymentStatus === 'pending' ? `
    <div class="payment-info">
      <strong>⚠️ Payment Pending:</strong> Please bring ₹${data.bookingFee} in cash to the venue. Payment will be collected before the event starts.
    </div>
    ` : `
    <div class="payment-info">
      <strong>✅ Payment Completed:</strong> Your payment of ₹${data.bookingFee} has been successfully processed.
    </div>
    `}

    <div class="important-note">
      <strong>📍 Important Information:</strong>
      <ul style="margin: 10px 0; padding-left: 20px;">
        <li>Restaurant details will be shared <strong>24 hours before</strong> the event</li>
        <li>The booking fee covers only seat reservation, not dinner cost</li>
        <li>Please arrive on time to make the most of your evening</li>
        <li>You'll receive a reminder notification before the event</li>
      </ul>
    </div>

    <div style="text-align: center;">
      <p style="font-size: 16px; color: #666;">
        Questions? Reply to this email or contact our support team.
      </p>
    </div>

    <div class="footer">
      <p>
        <strong>Citadel</strong><br>
        Building meaningful connections, one dinner at a time
      </p>
      <p style="font-size: 12px; color: #999;">
        This is an automated confirmation email. Please do not reply directly to this message.
      </p>
    </div>
  </div>
</body>
</html>
    `;
        // Create plain text version
        const textContent = `
🎉 Booking Confirmed!

Hi ${data.userName},

Your booking for the Citadel Dinner has been confirmed!

Booking ID: ${data.bookingId}

📅 EVENT DETAILS
Date: ${eventDateFormatted}
Time: ${data.eventTime}
City: ${data.city}
Area: ${data.area}
${data.venue ? `Venue: ${data.venue}` : ''}
${data.venueAddress ? `Address: ${data.venueAddress}` : ''}

💳 PAYMENT DETAILS
Booking Fee: ₹${data.bookingFee}
Payment Method: ${data.paymentMethod === 'cash' ? 'Cash (Pay at Venue)' : data.paymentGateway.toUpperCase()}
Payment Status: ${data.paymentStatus === 'pending' ? 'Pending' : 'Completed'}

${data.paymentStatus === 'pending' ?
            `⚠️ PAYMENT PENDING: Please bring ₹${data.bookingFee} in cash to the venue.` :
            `✅ PAYMENT COMPLETED: Your payment has been successfully processed.`}

📍 IMPORTANT INFORMATION:
- Restaurant details will be shared 24 hours before the event
- The booking fee covers only seat reservation, not dinner cost
- Please arrive on time
- You'll receive a reminder notification before the event

Questions? Reply to this email or contact our support team.

---
Citadel
Building meaningful connections, one dinner at a time
    `;
        // Send email using Resend
        const { data: emailData, error } = await resend.emails.send({
            from: (process.env.RESEND_FROM || 'support@hello.meetcitadel.com').toLowerCase(),
            to: [data.userEmail],
            subject,
            html: htmlContent,
            text: textContent,
        });
        if (error) {
            console.error('❌ Resend email error:', error);
            return false;
        }
        console.log(`✅ Booking confirmation email sent to ${data.userEmail}:`, emailData === null || emailData === void 0 ? void 0 : emailData.id);
        return true;
    }
    catch (err) {
        console.error('❌ Error sending booking confirmation email:', (err === null || err === void 0 ? void 0 : err.message) || err);
        return false;
    }
}
