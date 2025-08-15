"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendEmail = sendEmail;
const aws_1 = require("../config/aws");
async function sendEmail(to, subject, text) {
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
            await aws_1.ses.sendEmail(params).promise();
            return true;
        }
        catch (err) {
            console.error('SES send error', err);
            return false;
        }
    }
    else {
        // Fallback: log
        console.log(`Sending email to ${to}: ${subject} - ${text}`);
        return true;
    }
}
