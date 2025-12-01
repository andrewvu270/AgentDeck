/**
 * Property-Based Tests for Encryption
 * Feature: mcp-integration, Property 6: Credential Encryption Round-Trip
 * Validates: Requirements 7.1
 */

import * as fc from 'fast-check';
import { encrypt, decrypt } from '../encryption';

describe('Encryption Property Tests', () => {
  /**
   * Property 6: Credential Encryption Round-Trip
   * For any MCP server credentials, encrypting then decrypting should produce the original credentials
   */
  describe('Property 6: Encryption Round-Trip', () => {
    it('should preserve data through encrypt-decrypt cycle', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 1000 }),
          (originalText: string) => {
            // Property: Encrypting then decrypting should return original text
            const encrypted = encrypt(originalText);
            const decrypted = decrypt(encrypted);
            expect(decrypted).toBe(originalText);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should produce different ciphertext for same plaintext', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 100 }),
          (text: string) => {
            // Property: Same plaintext should produce different ciphertext (due to random IV)
            const encrypted1 = encrypt(text);
            const encrypted2 = encrypt(text);
            
            // Ciphertexts should be different
            expect(encrypted1).not.toBe(encrypted2);
            
            // But both should decrypt to the same original text
            expect(decrypt(encrypted1)).toBe(text);
            expect(decrypt(encrypted2)).toBe(text);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should handle various credential formats', () => {
      fc.assert(
        fc.property(
          fc.oneof(
            fc.string(), // Regular strings
            fc.hexaString(), // Hex strings (like API keys)
            fc.base64String(), // Base64 strings (like tokens)
            fc.uuid(), // UUIDs
            fc.emailAddress(), // Email addresses
            fc.webUrl() // URLs
          ),
          (credential: string) => {
            if (credential.length === 0) return true; // Skip empty strings
            
            // Property: All credential formats should round-trip correctly
            const encrypted = encrypt(credential);
            const decrypted = decrypt(encrypted);
            expect(decrypted).toBe(credential);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should handle special characters and unicode', () => {
      fc.assert(
        fc.property(
          fc.fullUnicodeString({ minLength: 1, maxLength: 100 }),
          (text: string) => {
            // Property: Unicode and special characters should be preserved
            const encrypted = encrypt(text);
            const decrypted = decrypt(encrypted);
            expect(decrypted).toBe(text);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should handle very long credentials', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1000, maxLength: 5000 }),
          (longText: string) => {
            // Property: Long credentials should round-trip correctly
            const encrypted = encrypt(longText);
            const decrypted = decrypt(encrypted);
            expect(decrypted).toBe(longText);
          }
        ),
        { numRuns: 50 } // Fewer runs for performance
      );
    });

    it('should produce encrypted text in expected format', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 100 }),
          (text: string) => {
            // Property: Encrypted text should have format: iv:authTag:ciphertext
            const encrypted = encrypt(text);
            const parts = encrypted.split(':');
            
            expect(parts).toHaveLength(3);
            expect(parts[0]).toMatch(/^[0-9a-f]+$/); // IV in hex
            expect(parts[1]).toMatch(/^[0-9a-f]+$/); // Auth tag in hex
            expect(parts[2]).toMatch(/^[0-9a-f]+$/); // Ciphertext in hex
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should not decrypt with tampered ciphertext', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 10, maxLength: 100 }),
          (text: string) => {
            const encrypted = encrypt(text);
            const parts = encrypted.split(':');
            
            // Tamper with the ciphertext
            const tamperedCiphertext = parts[2].substring(0, parts[2].length - 2) + 'ff';
            const tampered = `${parts[0]}:${parts[1]}:${tamperedCiphertext}`;
            
            // Property: Tampered ciphertext should throw error
            expect(() => decrypt(tampered)).toThrow();
          }
        ),
        { numRuns: 50 }
      );
    });

    it('should not decrypt with tampered auth tag', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 10, maxLength: 100 }),
          (text: string) => {
            const encrypted = encrypt(text);
            const parts = encrypted.split(':');
            
            // Tamper with the auth tag
            const tamperedAuthTag = parts[1].substring(0, parts[1].length - 2) + 'ff';
            const tampered = `${parts[0]}:${tamperedAuthTag}:${parts[2]}`;
            
            // Property: Tampered auth tag should throw error
            expect(() => decrypt(tampered)).toThrow();
          }
        ),
        { numRuns: 50 }
      );
    });
  });
});
