/**
 * End-to-End Encryption Module
 *
 * Implements encryption for PHI data at rest and in transit using
 * public-key cryptography (Curve25519/XSalsa20-Poly1305).
 *
 * SECURITY MODEL:
 *
 * 1. Key Generation:
 *    - Each device generates a unique Curve25519 key pair on first launch
 *    - Private key is stored in secure enclave (Keychain/Android Keystore)
 *    - Public key is registered with the backend for key exchange
 *
 * 2. Key Exchange:
 *    - When connecting to a provider, we receive their public key
 *    - We use X25519 to derive a shared secret
 *    - The shared secret is used for symmetric encryption (XSalsa20-Poly1305)
 *
 * 3. Data Encryption:
 *    - All PHI is encrypted before writing to disk
 *    - Each encrypted payload includes a unique nonce
 *    - Encrypted data has a TTL and is wiped on expiry
 *
 * 4. Key Rotation:
 *    - Keys are rotated on:
 *      - User logout + re-login
 *      - Biometric re-enrollment
 *      - Security event (e.g., failed auth attempts)
 *    - Old keys are securely destroyed
 *
 * THREATS MITIGATED:
 * - Device theft: Data encrypted with per-device key
 * - MITM: End-to-end encryption on top of TLS
 * - Server compromise: Server cannot decrypt without device private key
 * - Key extraction: Private keys stored in hardware-backed keystore
 */

import nacl from 'tweetnacl';
import { encodeBase64, decodeBase64, encodeUTF8, decodeUTF8 } from 'tweetnacl-util';

import { Logger } from '../../utils/logger';

/**
 * Encrypted payload structure
 */
export interface EncryptedPayload {
  /** Base64-encoded ciphertext */
  ciphertext: string;
  /** Base64-encoded nonce */
  nonce: string;
  /** Base64-encoded sender public key (for box encryption) */
  ephemeralPublicKey?: string;
  /** Encryption algorithm identifier */
  algorithm: 'nacl-secretbox' | 'nacl-box';
  /** Timestamp when data was encrypted */
  encryptedAt: string;
  /** TTL in milliseconds (0 = no expiry) */
  ttlMs: number;
  /** Version for future compatibility */
  version: 1;
}

/**
 * Key pair for encryption
 */
export interface EncryptionKeyPair {
  publicKey: string; // Base64-encoded
  secretKey: string; // Base64-encoded (stored in secure storage)
}

/**
 * Encryption service
 */
export class E2EEncryption {
  private keyPair: nacl.BoxKeyPair | null = null;
  private symmetricKey: Uint8Array | null = null;

  /**
   * Generate a new key pair
   */
  generateKeyPair(): EncryptionKeyPair {
    const keyPair = nacl.box.keyPair();
    this.keyPair = keyPair;

    return {
      publicKey: encodeBase64(keyPair.publicKey),
      secretKey: encodeBase64(keyPair.secretKey),
    };
  }

  /**
   * Load existing key pair from secure storage
   */
  loadKeyPair(publicKey: string, secretKey: string): void {
    this.keyPair = {
      publicKey: decodeBase64(publicKey),
      secretKey: decodeBase64(secretKey),
    };
  }

  /**
   * Generate a symmetric key for local encryption
   */
  generateSymmetricKey(): string {
    const key = nacl.randomBytes(nacl.secretbox.keyLength);
    this.symmetricKey = key;
    return encodeBase64(key);
  }

  /**
   * Load symmetric key from secure storage
   */
  loadSymmetricKey(key: string): void {
    this.symmetricKey = decodeBase64(key);
  }

  /**
   * Get public key for sharing
   */
  getPublicKey(): string | null {
    if (!this.keyPair) {
      return null;
    }
    return encodeBase64(this.keyPair.publicKey);
  }

  /**
   * Encrypt data with symmetric key (for local storage)
   *
   * Use this for encrypting data stored locally on the device.
   * The symmetric key should be stored in secure storage.
   */
  encryptLocal(data: string, ttlMs = 0): EncryptedPayload {
    if (!this.symmetricKey) {
      throw new Error('Symmetric key not initialized');
    }

    const nonce = nacl.randomBytes(nacl.secretbox.nonceLength);
    const messageBytes = decodeUTF8(data);
    const ciphertext = nacl.secretbox(messageBytes, nonce, this.symmetricKey);

    return {
      ciphertext: encodeBase64(ciphertext),
      nonce: encodeBase64(nonce),
      algorithm: 'nacl-secretbox',
      encryptedAt: new Date().toISOString(),
      ttlMs,
      version: 1,
    };
  }

  /**
   * Decrypt locally encrypted data
   */
  decryptLocal(payload: EncryptedPayload): string | null {
    if (!this.symmetricKey) {
      throw new Error('Symmetric key not initialized');
    }

    // Check TTL
    if (payload.ttlMs > 0) {
      const encryptedAt = new Date(payload.encryptedAt).getTime();
      if (Date.now() > encryptedAt + payload.ttlMs) {
        Logger.warn('Encrypted data has expired');
        return null;
      }
    }

    const nonce = decodeBase64(payload.nonce);
    const ciphertext = decodeBase64(payload.ciphertext);
    const decrypted = nacl.secretbox.open(ciphertext, nonce, this.symmetricKey);

    if (!decrypted) {
      Logger.error('Failed to decrypt data - authentication failed');
      return null;
    }

    return encodeUTF8(decrypted);
  }

  /**
   * Encrypt data for a specific recipient (E2E with provider)
   *
   * Use this for encrypting data that will be sent to a provider.
   * The recipient's public key is required.
   */
  encryptForRecipient(data: string, recipientPublicKey: string, ttlMs = 0): EncryptedPayload {
    if (!this.keyPair) {
      throw new Error('Key pair not initialized');
    }

    const nonce = nacl.randomBytes(nacl.box.nonceLength);
    const messageBytes = decodeUTF8(data);
    const recipientKey = decodeBase64(recipientPublicKey);

    const ciphertext = nacl.box(messageBytes, nonce, recipientKey, this.keyPair.secretKey);

    return {
      ciphertext: encodeBase64(ciphertext),
      nonce: encodeBase64(nonce),
      ephemeralPublicKey: encodeBase64(this.keyPair.publicKey),
      algorithm: 'nacl-box',
      encryptedAt: new Date().toISOString(),
      ttlMs,
      version: 1,
    };
  }

  /**
   * Decrypt data from a sender
   */
  decryptFromSender(payload: EncryptedPayload, senderPublicKey: string): string | null {
    if (!this.keyPair) {
      throw new Error('Key pair not initialized');
    }

    // Check TTL
    if (payload.ttlMs > 0) {
      const encryptedAt = new Date(payload.encryptedAt).getTime();
      if (Date.now() > encryptedAt + payload.ttlMs) {
        Logger.warn('Encrypted data has expired');
        return null;
      }
    }

    const nonce = decodeBase64(payload.nonce);
    const ciphertext = decodeBase64(payload.ciphertext);
    const senderKey = decodeBase64(senderPublicKey);

    const decrypted = nacl.box.open(ciphertext, nonce, senderKey, this.keyPair.secretKey);

    if (!decrypted) {
      Logger.error('Failed to decrypt data - authentication failed');
      return null;
    }

    return encodeUTF8(decrypted);
  }

  /**
   * Encrypt data with anonymous sender (sealed box)
   *
   * The recipient can decrypt without knowing the sender.
   * Useful for submitting anonymous data.
   */
  encryptAnonymous(data: string, recipientPublicKey: string): string {
    const ephemeral = nacl.box.keyPair();
    const recipientKey = decodeBase64(recipientPublicKey);
    const nonce = nacl.randomBytes(nacl.box.nonceLength);
    const messageBytes = decodeUTF8(data);

    const ciphertext = nacl.box(messageBytes, nonce, recipientKey, ephemeral.secretKey);

    // Combine: ephemeral public key + nonce + ciphertext
    const combined = new Uint8Array(ephemeral.publicKey.length + nonce.length + ciphertext.length);
    combined.set(ephemeral.publicKey);
    combined.set(nonce, ephemeral.publicKey.length);
    combined.set(ciphertext, ephemeral.publicKey.length + nonce.length);

    return encodeBase64(combined);
  }

  /**
   * Securely wipe all keys from memory
   *
   * Call this on logout or security events
   */
  wipe(): void {
    if (this.keyPair) {
      // Zero out the secret key
      for (let i = 0; i < this.keyPair.secretKey.length; i++) {
        this.keyPair.secretKey[i] = 0;
      }
      this.keyPair = null;
    }

    if (this.symmetricKey) {
      for (let i = 0; i < this.symmetricKey.length; i++) {
        this.symmetricKey[i] = 0;
      }
      this.symmetricKey = null;
    }

    Logger.info('Encryption keys wiped from memory');
  }

  /**
   * Hash data using SHA-512
   */
  hash(data: string): string {
    const messageBytes = decodeUTF8(data);
    const hashBytes = nacl.hash(messageBytes);
    return encodeBase64(hashBytes);
  }

  /**
   * Generate a random ID
   */
  generateRandomId(length = 32): string {
    const bytes = nacl.randomBytes(length);
    return encodeBase64(bytes);
  }
}

// Singleton instance
export const encryption = new E2EEncryption();

export default E2EEncryption;
