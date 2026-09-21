const QRCode = require('qrcode');

/**
 * Generate a QR code base64 Data URL
 * @param {Object} payload { registrationId, studentId, eventId }
 * @returns {Promise<string>} Base64 Data URL string
 */
const generateQRCodeDataURL = async (payload) => {
  try {
    // We encode the registrationId (or JSON string) cleanly
    const stringData = typeof payload === 'string' ? payload : JSON.stringify(payload);
    const dataUrl = await QRCode.toDataURL(stringData, {
      errorCorrectionLevel: 'H',
      type: 'image/png',
      margin: 2,
      scale: 8,
      color: {
        dark: '#0f172a', // Clean dark slate for maximum camera optical contrast
        light: '#ffffff'
      }
    });
    return dataUrl;
  } catch (error) {
    console.error('QR Code Generation Error:', error);
    throw new Error('Failed to generate QR code');
  }
};

/**
 * Parse and validate QR code data
 * Handles JSON payload, URLs, and raw Registration IDs
 */
const parseQRData = (rawString) => {
  if (!rawString) return null;
  const str = String(rawString).trim();

  // 1. Try parsing JSON
  try {
    const parsed = JSON.parse(str);
    if (parsed.registrationId) {
      return { registrationId: parsed.registrationId.trim() };
    }
  } catch (e) {
    // Not JSON, continue to next parsers
  }

  // 2. Check if URL contains regId parameter
  try {
    if (str.includes('regId=')) {
      const match = str.match(/regId=([A-Za-z0-9-_]+)/i);
      if (match && match[1]) {
        return { registrationId: match[1].trim() };
      }
    }
  } catch (e) {}

  // 3. Check if contains MUIT-REG- pattern anywhere
  const regPatternMatch = str.match(/(MUIT-REG-[A-Za-z0-9-_]+)/i);
  if (regPatternMatch && regPatternMatch[1]) {
    return { registrationId: regPatternMatch[1].trim() };
  }

  // 4. Fallback: Return raw string trimmed
  return { registrationId: str };
};

module.exports = {
  generateQRCodeDataURL,
  parseQRData
};
