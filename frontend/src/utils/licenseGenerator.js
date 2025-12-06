/**
 * License Generator Utility
 * Generates a signed JWT token for Pro license activation
 */

// Simple JWT-like encoding (in production, use a proper JWT library)
const base64UrlEncode = (str) => {
  return btoa(str)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
};

const base64UrlDecode = (str) => {
  str = str.replace(/-/g, '+').replace(/_/g, '/');
  while (str.length % 4) {
    str += '=';
  }
  return atob(str);
};

// Secret key for signing (in production, use a secure server-side secret)
const SECRET_KEY = 'merndesk-pro-license-secret-key-2024';

// Simple HMAC-like hash (in production, use proper crypto)
const simpleHash = (str) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(16);
};

/**
 * Generate a license token
 * @param {string} transactionId - Payment transaction ID
 * @returns {string} Signed JWT-like token
 */
export const generateLicenseToken = (transactionId) => {
  const header = {
    alg: 'HS256',
    typ: 'JWT'
  };

  const payload = {
    plan: 'PRO',
    transactionId: transactionId,
    issuedAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 year
    version: '1.0'
  };

  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));
  const signature = simpleHash(encodedHeader + '.' + encodedPayload + SECRET_KEY);

  return `${encodedHeader}.${encodedPayload}.${signature}`;
};

/**
 * Generate and download license.json file
 * @param {string} transactionId - Payment transaction ID
 */
export const generateAndDownloadLicense = (transactionId) => {
  const token = generateLicenseToken(transactionId);
  
  const licenseData = {
    plan: 'PRO',
    licenseKey: token,
    transactionId: transactionId,
    activatedAt: new Date().toISOString(),
    version: '1.0'
  };

  const blob = new Blob([JSON.stringify(licenseData, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'license.json';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Validate license token (mock validation)
 * @param {string} transactionId - Transaction ID to validate
 * @returns {Promise<boolean>} Validation result
 */
export const validateTransaction = async (transactionId) => {
  // Mock validation - in production, this would call an API
  return new Promise((resolve) => {
    setTimeout(() => {
      // Simple validation: transaction ID should be at least 10 characters
      const isValid = transactionId && transactionId.trim().length >= 10;
      resolve(isValid);
    }, 1500); // Simulate API call delay
  });
};

