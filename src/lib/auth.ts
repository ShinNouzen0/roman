

// Utility for cryptographic JWT creation and verification using standard Web Crypto API
// Zero dependencies - 100% compatible with Next.js Edge Runtime (Middleware) and Node.js

export interface TokenPayload {
  userId: string;
  name: string;
  username: string;
  email: string;
  role: "Super Admin" | "Admin OPD";
  agency: string;
  exp: number; // Expiration timestamp in seconds
  iat?: number;
}

const DEFAULT_SECRET = "spbe_bekasikab_secure_secret_key_2026_jwt_token_987654321";

function getSecretKey(): string {
  return process.env.AUTH_SECRET || DEFAULT_SECRET;
}

// Base64URL encode and decode helpers
function base64UrlEncode(str: string): string {
  if (typeof btoa === "function") {
    return btoa(str).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  }
  return Buffer.from(str, "utf-8")
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function base64UrlDecode(str: string): string {
  let base64 = str.replace(/-/g, "+").replace(/_/g, "/");
  while (base64.length % 4 !== 0) {
    base64 += "=";
  }
  if (typeof atob === "function") {
    return atob(base64);
  }
  return Buffer.from(base64, "base64").toString("utf-8");
}

function bufferToBase64Url(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return base64UrlEncode(binary);
}

async function getCryptoKey(secret: string): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);
  return await crypto.subtle.importKey(
    "raw",
    keyData,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

/**
 * Creates a cryptographically signed HMAC-SHA256 JWT
 */
export async function createSignedToken(
  payload: Omit<TokenPayload, "iat">,
  secret: string = getSecretKey()
): Promise<string> {
  const header = { alg: "HS256", typ: "JWT" };
  const fullPayload: TokenPayload = {
    ...payload,
    iat: Math.floor(Date.now() / 1000),
  };

  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(fullPayload));
  const dataToSign = `${encodedHeader}.${encodedPayload}`;

  const cryptoKey = await getCryptoKey(secret);
  const encoder = new TextEncoder();
  const signatureBuffer = await crypto.subtle.sign(
    "HMAC",
    cryptoKey,
    encoder.encode(dataToSign)
  );

  const encodedSignature = bufferToBase64Url(signatureBuffer);
  return `${dataToSign}.${encodedSignature}`;
}

/**
 * Verifies a JWT token signature and expiration
 * Returns TokenPayload if valid, or null if invalid/tampered/expired
 */
export async function verifySignedToken(
  token: string | undefined | null,
  secret: string = getSecretKey()
): Promise<TokenPayload | null> {
  if (!token || typeof token !== "string") return null;

  const parts = token.split(".");
  if (parts.length !== 3) return null;

  const [encodedHeader, encodedPayload, encodedSignature] = parts;
  const dataToVerify = `${encodedHeader}.${encodedPayload}`;

  try {
    const cryptoKey = await getCryptoKey(secret);
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(dataToVerify);

    // Decode signature from base64url to Uint8Array
    const binarySignature = base64UrlDecode(encodedSignature);
    const signatureBytes = new Uint8Array(binarySignature.length);
    for (let i = 0; i < binarySignature.length; i++) {
      signatureBytes[i] = binarySignature.charCodeAt(i);
    }

    const isValid = await crypto.subtle.verify(
      "HMAC",
      cryptoKey,
      signatureBytes,
      dataBuffer
    );

    if (!isValid) return null;

    const payloadJson = base64UrlDecode(encodedPayload);
    const payload: TokenPayload = JSON.parse(payloadJson);

    // Check expiration
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < now) {
      return null;
    }

    // Ensure valid role
    if (payload.role !== "Super Admin" && payload.role !== "Admin OPD") {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}
