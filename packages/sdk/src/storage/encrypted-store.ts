import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const AUTH_TAG_LENGTH = 16;
const SALT_LENGTH = 32;
const KEY_LENGTH = 32;

export class EncryptedStore {
  private password: string;

  constructor(password: string) {
    this.password = password;
  }

  encrypt(data: string): string {
    const salt = randomBytes(SALT_LENGTH);
    const key = scryptSync(this.password, salt, KEY_LENGTH);
    const iv = randomBytes(IV_LENGTH);

    const cipher = createCipheriv(ALGORITHM, key, iv);
    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const authTag = cipher.getAuthTag();

    // Format: salt:iv:authTag:encrypted
    return [
      salt.toString('hex'),
      iv.toString('hex'),
      authTag.toString('hex'),
      encrypted,
    ].join(':');
  }

  decrypt(encryptedData: string): string {
    const [saltHex, ivHex, authTagHex, encrypted] = encryptedData.split(':');

    const salt = Buffer.from(saltHex, 'hex');
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');
    const key = scryptSync(this.password, salt, KEY_LENGTH);

    const decipher = createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }

  encryptJSON(data: unknown): string {
    return this.encrypt(JSON.stringify(data));
  }

  decryptJSON<T>(encryptedData: string): T {
    return JSON.parse(this.decrypt(encryptedData)) as T;
  }
}
