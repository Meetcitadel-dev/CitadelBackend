"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendEmail = sendEmail;
const resend_1 = require("resend");
async function sendEmail(to, subject, text) {
    if (!process.env.RESEND_API_KEY) {
        throw new Error('RESEND_API_KEY is required');
    }
    try {
        const resend = new resend_1.Resend(process.env.RESEND_API_KEY);
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
    }
    catch (err) {
        console.error('Resend email error:', err?.message || err);
        throw new Error('EMAIL_SEND_FAILED');
    }
}
