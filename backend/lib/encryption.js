import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY;

if (!ENCRYPTION_KEY) {
    throw new Error('ENCRYPTION_KEY must be defined in environment variables');
}

const KEY = Buffer.from(ENCRYPTION_KEY, 'hex');

/**
 * Encrypts a text message
 * @param {string} text - Plain text message
 * @returns {string} Encrypted string in format: iv:authTag:encryptedData
 */
export const encryptMessage = (text) => {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(ALGORITHM, KEY, iv);

    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    const authTag = cipher.getAuthTag();

    return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
};

/**
 * Check if a message is encrypted
 * @param {string} text - Text to check
 * @returns {boolean} True if encrypted
 */
const isEncrypted = (text) => {
    // Encrypted format: "hexIV:hexAuthTag:hexEncrypted"
    // Must have exactly 2 colons and all parts must be hex
    const parts = text.split(':');
    if (parts.length !== 3) return false;

    // Check if all parts are valid hex (IV=32 chars, authTag=32 chars, encrypted=variable)
    const hexRegex = /^[0-9a-f]+$/i;
    return parts[0].length === 32 &&
        parts[1].length === 32 &&
        hexRegex.test(parts[0]) &&
        hexRegex.test(parts[1]) &&
        hexRegex.test(parts[2]);
};

/**
 * Decrypts an encrypted message
 * @param {string} encryptedData - Encrypted string in format: iv:authTag:encryptedData
 * @returns {string} Decrypted plain text
 */
export const decryptMessage = (encryptedData) => {
    // ✅ If empty or not a string, return as-is
    if (!encryptedData || typeof encryptedData !== 'string') {
        return encryptedData || '';
    }

    // ✅ If it's plain text (not encrypted), return as-is
    if (!isEncrypted(encryptedData)) {
        return encryptedData;
    }

    // ✅ It's encrypted, so decrypt it
    try {
        const parts = encryptedData.split(':');
        const iv = Buffer.from(parts[0], 'hex');
        const authTag = Buffer.from(parts[1], 'hex');
        const encrypted = parts[2];

        const decipher = crypto.createDecipheriv(ALGORITHM, KEY, iv);
        decipher.setAuthTag(authTag);

        let decrypted = decipher.update(encrypted, 'hex', 'utf8');
        decrypted += decipher.final('utf8');

        return decrypted;
    } catch (error) {
        console.error('Decryption failed:', error);
        return '[Message could not be decrypted]';
    }
};