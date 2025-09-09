/**
 * ✅ Validation Utilities
 */

export const AI_INTERFACE = {
  purpose: "Input validation functions",
  exports: ["validateEmail", "validatePassword"],
  patterns: ["pure-functions"]
};

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validatePassword(password: string): boolean {
  return password.length >= 8;
}
