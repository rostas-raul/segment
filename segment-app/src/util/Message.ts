import * as crypto from 'crypto';

export function encryptMessage(message: string, ss: string) {
  // A random salt
  const salt = crypto.randomBytes(32).toString('hex');
  // A random IV
  const iv = crypto.randomBytes(12).toString('hex');

  // Compute the first variation of the key
  const ek = crypto.createHash('sha256').update(ss).digest('base64');

  // Compute the second variation of the key
  const rawKey = crypto
    .createHash('sha256')
    .update(ek)
    .update(salt)
    .digest('hex');

  // Truncate the key
  const key = rawKey.slice(0, 32);

  // Use AES GCM to encrypt the message
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  const encryptedMessage = Buffer.concat([
    cipher.update(message, 'utf8'),
    cipher.final(),
  ]).toString('base64');

  return {
    encryptedMessage,
    key,
    iv,
    authTag: cipher.getAuthTag().toString('base64'),
    salt,
  };
}

export function decryptMessage(
  cipherText: string,
  ss: string,
  iv: string,
  authTag: string,
  salt: string,
) {
  // Compute the first variation of the key
  const ek = crypto.createHash('sha256').update(ss).digest('base64');

  // Compute the second variation of the key
  const rawKey = crypto
    .createHash('sha256')
    .update(ek)
    .update(salt)
    .digest('hex');

  // Truncate the key
  const key = rawKey.slice(0, 32);

  // Decrypt the message
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(Buffer.from(authTag, 'base64'));

  return Buffer.concat([
    decipher.update(cipherText, 'base64'),
    decipher.final(),
  ]).toString();
}
