"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isUniversityEmail = isUniversityEmail;
exports.isValidUniversityEmail = isValidUniversityEmail;
// Validates if the email is a university email (e.g., ends with .edu or specific domains)
function isUniversityEmail(email) {
    // Example: allow .edu or .ac.[country] or add more as needed
    const universityEmailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.(edu|ac\.[a-z]{2,})$/i;
    return universityEmailRegex.test(email);
}
// Validates if the email is a university email from a list of allowed domains
function isValidUniversityEmail(email, allowedDomains) {
    if (!email || !allowedDomains || allowedDomains.length === 0)
        return false;
    const domain = email.split('@')[1]?.toLowerCase();
    return allowedDomains.map(d => d.toLowerCase()).includes(domain);
}
