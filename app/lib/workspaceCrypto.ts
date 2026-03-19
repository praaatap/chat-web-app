const encoder = new TextEncoder();
const decoder = new TextDecoder();

const toArrayBuffer = (bytes: Uint8Array) => Uint8Array.from(bytes).buffer;

const toBase64 = (bytes: Uint8Array) => {
  let binary = "";
  bytes.forEach((b) => {
    binary += String.fromCharCode(b);
  });
  return btoa(binary);
};

const fromBase64 = (value: string) => {
  const binary = atob(value);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
};

const deriveKey = async (passphrase: string, salt: Uint8Array) => {
  const baseKey = await crypto.subtle.importKey(
    "raw",
    encoder.encode(passphrase),
    "PBKDF2",
    false,
    ["deriveKey"]
  );

  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: toArrayBuffer(salt),
      iterations: 250000,
      hash: "SHA-256",
    },
    baseKey,
    {
      name: "AES-GCM",
      length: 256,
    },
    false,
    ["encrypt", "decrypt"]
  );
};

export const encryptJsonWithPassphrase = async (
  payload: unknown,
  passphrase: string
) => {
  if (passphrase.trim().length < 8) {
    throw new Error("Passphrase must be at least 8 characters.");
  }

  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveKey(passphrase, salt);

  const plaintext = encoder.encode(JSON.stringify(payload));
  const ciphertext = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv: toArrayBuffer(iv) },
    key,
    plaintext
  );

  return JSON.stringify({
    version: 1,
    algorithm: "AES-GCM",
    kdf: "PBKDF2-SHA256",
    salt: toBase64(salt),
    iv: toBase64(iv),
    data: toBase64(new Uint8Array(ciphertext)),
  });
};

export const decryptJsonWithPassphrase = async <T>(
  encryptedPayload: string,
  passphrase: string
): Promise<T> => {
  const parsed = JSON.parse(encryptedPayload) as {
    salt: string;
    iv: string;
    data: string;
    version: number;
  };

  if (!parsed?.salt || !parsed?.iv || !parsed?.data || parsed.version !== 1) {
    throw new Error("Invalid encrypted workspace payload.");
  }

  const salt = fromBase64(parsed.salt);
  const iv = fromBase64(parsed.iv);
  const data = fromBase64(parsed.data);
  const key = await deriveKey(passphrase, salt);

  const plaintext = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: toArrayBuffer(iv) },
    key,
    toArrayBuffer(data)
  );

  return JSON.parse(decoder.decode(plaintext)) as T;
};
