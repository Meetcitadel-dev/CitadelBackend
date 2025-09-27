"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendEmail = sendEmail;
const nodemailer_1 = __importDefault(require("nodemailer"));
const mail_1 = __importDefault(require("@sendgrid/mail"));
const resend_1 = require("resend");
async function sendEmail(to, subject, text) {
    // Try Resend first (most reliable for cloud platforms)
    if (process.env.RESEND_API_KEY) {
        try {
            const resend = new resend_1.Resend(process.env.RESEND_API_KEY);
            const { data, error } = await resend.emails.send({
                from: process.env.RESEND_FROM || 'noreply@hello.meetcitadel.com',
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
        }
        catch (err) {
            console.error('Resend email error:', err?.message || err);
            // fall through to try SendGrid
        }
    }
    // Fallback to SendGrid
    if (process.env.SENDGRID_API_KEY) {
        try {
            mail_1.default.setApiKey(process.env.SENDGRID_API_KEY);
            await mail_1.default.send({
                to,
                from: process.env.SENDGRID_FROM || process.env.GMAIL_USER || 'no-reply@example.com',
                subject,
                text,
            });
            console.log(`OTP sent via SendGrid to ${to}`);
            return true;
        }
        catch (err) {
            console.error('SendGrid email error:', err?.response?.body || err?.message || err);
            // fall through to try SMTP
        }
    }
    const transporter = nodemailer_1.default.createTransport({
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
    });
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
                }
                else {
                    console.log(`OTP sent via SMTP to ${to}:`, info?.messageId);
                    resolve(info);
                }
            });
        });
        return true;
    }
    catch (error) {
        console.error('SMTP email error:', error?.message || error);
        throw new Error('EMAIL_SEND_FAILED');
    }
}
