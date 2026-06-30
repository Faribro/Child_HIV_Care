// lib/utils/crypto.ts
import { User } from '@/types';

const SECRET_KEY_STR = process.env.HMAC_SECRET || 'mpac_fallback_super_secret_key_change_me_in_prod';

// Helper to get crypto key
async function getCryptoKey(): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const keyData = enc.encode(SECRET_KEY_STR);
  return crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify']
  );
}

// Convert ArrayBuffer to Base64URL
function bufferToBase64Url(buf: ArrayBuffer): string {
  const bin = String.fromCharCode(...new Uint8Array(buf));
  return btoa(bin)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

// Convert Base64URL to ArrayBuffer
function base64UrlToBuffer(b64: string): ArrayBuffer {
  const normalB64 = b64
    .replace(/-/g, '+')
    .replace(/_/g, '/')
    .padEnd(b64.length + ((4 - (b64.length % 4)) % 4), '=');
  const bin = atob(normalB64);
  const buf = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) {
    buf[i] = bin.charCodeAt(i);
  }
  return buf.buffer;
}

/**
 * Sign user details into a tamper-proof session token string.
 */
export async function signSession(user: Omit<User, 'userId'> & { userId?: string }): Promise<string> {
  const payloadStr = JSON.stringify({
    ...user,
    userId: user.userId || user.email,
    exp: Date.now() + 8 * 60 * 60 * 1000, // 8 Hours expiration
  });
  
  const enc = new TextEncoder();
  const payloadBytes = enc.encode(payloadStr);
  
  const key = await getCryptoKey();
  const signatureBuf = await crypto.subtle.sign('HMAC', key, payloadBytes);
  
  const payloadB64 = bufferToBase64Url(payloadBytes.buffer);
  const signatureB64 = bufferToBase64Url(signatureBuf);
  
  return `${payloadB64}.${signatureB64}`;
}

/**
 * Validate a session token string, returning the parsed User or null if invalid/expired.
 */
export async function validateSession(token: string): Promise<User | null> {
  try {
    const parts = token.split('.');
    if (parts.length !== 2) return null;
    
    const [payloadB64, signatureB64] = parts;
    
    const enc = new TextEncoder();
    const payloadBytes = new Uint8Array(base64UrlToBuffer(payloadB64));
    const signatureBytes = new Uint8Array(base64UrlToBuffer(signatureB64));
    
    const key = await getCryptoKey();
    const isValid = await crypto.subtle.verify('HMAC', key, signatureBytes, payloadBytes);
    
    if (!isValid) return null;
    
    const dec = new TextDecoder();
    const payload = JSON.parse(dec.decode(payloadBytes));
    
    // Check expiration
    if (payload.exp && Date.now() > payload.exp) {
      return null;
    }
    
    return {
      userId: payload.userId,
      email: payload.email,
      name: payload.name,
      role: payload.role,
    };
  } catch (err) {
    console.error('Session validation error:', err);
    return null;
  }
}
