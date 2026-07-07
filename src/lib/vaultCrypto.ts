/**
 * Kluis-encryptie (sealed-box model)
 *
 * Waarom dit ontwerp: de app moet gegevens in de kluis kunnen SCHRIJVEN
 * (vanuit flows, berichten, wensen) zonder dat de gebruiker eerst zijn
 * kluis-wachtwoord intypt. Daarom gebruiken we asymmetrische encryptie:
 *
 *  - Bij het instellen van de kluis wordt een x25519-sleutelpaar gemaakt.
 *  - De PUBLIEKE sleutel staat onversleuteld opgeslagen: iedereen mag
 *    ermee versleutelen ("sealen"), niemand kan ermee lezen.
 *  - De PRIVE-sleutel staat versleuteld opgeslagen met een sleutel die
 *    via PBKDF2 (100.000 iteraties, SHA-256) uit het wachtwoord wordt
 *    afgeleid. Alleen het juiste wachtwoord kan hem openen — een fout
 *    wachtwoord faalt cryptografisch (Poly1305 auth), niet via een
 *    stringvergelijking.
 *  - Elke kluis-inhoud wordt per item gesealed: efemeer x25519-paar →
 *    gedeeld geheim → HKDF → XChaCha20-Poly1305.
 *
 * Het wachtwoord zelf wordt nergens opgeslagen, ook niet als hash.
 */
import * as ExpoCrypto from 'expo-crypto';
import { x25519 } from '@noble/curves/ed25519.js';
import { xchacha20poly1305 } from '@noble/ciphers/chacha.js';
import { pbkdf2Async } from '@noble/hashes/pbkdf2.js';
import { sha256 } from '@noble/hashes/sha2.js';
import { hkdf } from '@noble/hashes/hkdf.js';
import { bytesToHex, hexToBytes, utf8ToBytes } from '@noble/hashes/utils.js';

export { bytesToHex, hexToBytes } from '@noble/hashes/utils.js';

const PBKDF2_ITERATIONS = 100_000;
const HKDF_INFO = utf8ToBytes('geregeld-vault-v1');

export interface VaultKeys {
  salt: string; // hex, 16 bytes
  publicKey: string; // hex, x25519
  encryptedPrivateKey: string; // `${nonceHex}:${cipherHex}`
}

function randomBytes(n: number): Uint8Array {
  const b = new Uint8Array(n);
  ExpoCrypto.getRandomValues(b);
  return b;
}

// Hermes mist TextDecoder in sommige versies; utf8ToBytes van noble dekt
// alleen encoderen, dus decoderen doen we zelf met een fallback.
function bytesToUtf8(bytes: Uint8Array): string {
  if (typeof TextDecoder !== 'undefined') {
    return new TextDecoder().decode(bytes);
  }
  let percent = '';
  for (let i = 0; i < bytes.length; i++) {
    percent += '%' + bytes[i].toString(16).padStart(2, '0');
  }
  return decodeURIComponent(percent);
}

async function deriveKek(password: string, salt: Uint8Array): Promise<Uint8Array> {
  return pbkdf2Async(sha256, password, salt, { c: PBKDF2_ITERATIONS, dkLen: 32 });
}

/** Maakt een nieuw sleutelpaar, beveiligd met het gegeven wachtwoord. */
export async function createVaultKeys(
  password: string
): Promise<{ keys: VaultKeys; privateKey: Uint8Array }> {
  const salt = randomBytes(16);
  const kek = await deriveKek(password, salt);
  const privateKey = randomBytes(32);
  const publicKey = x25519.getPublicKey(privateKey);
  const nonce = randomBytes(24);
  const encrypted = xchacha20poly1305(kek, nonce).encrypt(privateKey);
  return {
    keys: {
      salt: bytesToHex(salt),
      publicKey: bytesToHex(publicKey),
      encryptedPrivateKey: `${bytesToHex(nonce)}:${bytesToHex(encrypted)}`,
    },
    privateKey,
  };
}

/** Ontgrendelt de prive-sleutel. Gooit een error bij een fout wachtwoord. */
export async function unlockWithPassword(
  password: string,
  keys: VaultKeys
): Promise<Uint8Array> {
  const kek = await deriveKek(password, hexToBytes(keys.salt));
  const [nonceHex, cipherHex] = keys.encryptedPrivateKey.split(':');
  // decrypt gooit bij verkeerde sleutel (Poly1305-verificatie faalt)
  return xchacha20poly1305(kek, hexToBytes(nonceHex)).decrypt(hexToBytes(cipherHex));
}

/** Versleutelt tekst met de publieke sleutel — kan zonder wachtwoord. */
export function sealWithPublicKey(publicKeyHex: string, plaintext: string): string {
  const ephemeralPriv = randomBytes(32);
  const ephemeralPub = x25519.getPublicKey(ephemeralPriv);
  const shared = x25519.getSharedSecret(ephemeralPriv, hexToBytes(publicKeyHex));
  const key = hkdf(sha256, shared, undefined, HKDF_INFO, 32);
  const nonce = randomBytes(24);
  const cipher = xchacha20poly1305(key, nonce).encrypt(utf8ToBytes(plaintext));
  return `${bytesToHex(ephemeralPub)}:${bytesToHex(nonce)}:${bytesToHex(cipher)}`;
}

/** Ontsleutelt een gesealed item met de prive-sleutel. */
export function openSealed(privateKey: Uint8Array, sealed: string): string {
  const [ephPubHex, nonceHex, cipherHex] = sealed.split(':');
  const shared = x25519.getSharedSecret(privateKey, hexToBytes(ephPubHex));
  const key = hkdf(sha256, shared, undefined, HKDF_INFO, 32);
  const plain = xchacha20poly1305(key, hexToBytes(nonceHex)).decrypt(hexToBytes(cipherHex));
  return bytesToUtf8(plain);
}

/**
 * Versleutelt inhoud als de kluis is ingesteld; anders plaintext met een
 * vlag zodat het bij de eerstvolgende unlock alsnog versleuteld wordt.
 */
export function encryptContentIfPossible(
  vaultKeys: VaultKeys | null | undefined,
  content: string
): { content: string; encrypted: boolean } {
  if (vaultKeys?.publicKey) {
    return { content: sealWithPublicKey(vaultKeys.publicKey, content), encrypted: true };
  }
  return { content, encrypted: false };
}
