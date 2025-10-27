// Whitelist of specific emails that are allowed (non-university emails)
const WHITELISTED_EMAILS = [
  'mdtousifalam85@gmail.com'
];

// Validates if the email is a university email (e.g., ends with .edu or specific domains)
export function isUniversityEmail(email: string): boolean {
  // Example: allow .edu or .ac.[country] or add more as needed
  const universityEmailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.(edu|ac\.[a-z]{2,})$/i;
  return universityEmailRegex.test(email);
}

// Validates if the email is a university email from a list of allowed domains
export function isValidUniversityEmail(email: string, allowedDomains: string[]): boolean {
  if (!email || !allowedDomains || allowedDomains.length === 0) return false;

  // Check if email is in whitelist first
  if (WHITELISTED_EMAILS.includes(email.toLowerCase())) {
    return true;
  }

  const domain = email.split('@')[1]?.toLowerCase();
  return allowedDomains.map(d => d.toLowerCase()).includes(domain);
}
