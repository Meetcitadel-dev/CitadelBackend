"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isUniversityEmail = isUniversityEmail;
exports.isValidUniversityEmail = isValidUniversityEmail;
// Whitelist of specific emails that are allowed (non-university emails)
const WHITELISTED_EMAILS = [
    'mdtousifalam85@gmail.com'
];
// Validates if the email is a university email (e.g., ends with .edu or specific domains)
function isUniversityEmail(email) {
    // Example: allow .edu or .ac.[country] or add more as needed
    const universityEmailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.(edu|ac\.[a-z]{2,})$/i;
    return universityEmailRegex.test(email);
}
// Validates if the email is a university email from a list of allowed domains
function isValidUniversityEmail(email, allowedDomains) {
    var _a;
    if (!email || !allowedDomains || allowedDomains.length === 0)
        return false;
    // Check if email is in whitelist first
    if (WHITELISTED_EMAILS.includes(email.toLowerCase())) {
        return true;
    }
    const domain = (_a = email.split('@')[1]) === null || _a === void 0 ? void 0 : _a.toLowerCase();
    return allowedDomains.map(d => d.toLowerCase()).includes(domain);
}
