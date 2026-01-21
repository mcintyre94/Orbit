import {
  supportsWebAuthn,
  register,
  auth,
  regDefaults,
  authDefaults,
} from "@lo-fi/webauthn-local-client";
import _sodium from "libsodium-wrappers";

// Initialize libsodium - required by webauthn-local-client
await _sodium.ready;
(globalThis as any).sodium = _sodium;

export interface RegistrationResult {
  credentialId: string;
  publicKey: string;
}

/**
 * Check if WebAuthn biometric authentication is available on this device
 */
export async function checkBiometricSupport(): Promise<boolean> {
  return supportsWebAuthn;
}

/**
 * Register a new biometric credential
 * This will prompt the user for Touch ID / Windows Hello / fingerprint
 */
export async function registerBiometric(
  userId: string
): Promise<RegistrationResult> {
  // Convert userId string to ArrayBuffer as required by WebAuthn API
  const encoder = new TextEncoder();
  const userIdBuffer = encoder.encode(userId);

  const regOptions = regDefaults({
    relyingPartyName: "Orbit",
    user: {
      id: userIdBuffer,
      name: userId,
      displayName: "Orbit User",
    },
  });

  // Force biometric verification (not just device PIN)
  regOptions.authenticatorSelection = {
    ...regOptions.authenticatorSelection,
    userVerification: "required",
    authenticatorAttachment: "platform", // Use built-in authenticator (Touch ID, Windows Hello)
    residentKey: "preferred",
  };

  const regResult = await register(regOptions);

  // Convert publicKey raw bytes to base64 string for storage
  const publicKeyBase64 = btoa(
    String.fromCharCode(...regResult.response.publicKey.raw)
  );

  return {
    credentialId: regResult.response.credentialID,
    publicKey: publicKeyBase64,
  };
}

/**
 * Authenticate using a previously registered biometric credential
 * Returns true if authentication was successful
 */
export async function authenticateBiometric(
  credentialId: string
): Promise<boolean> {
  try {
    const authOptions = authDefaults({
      allowCredentials: [
        {
          type: "public-key",
          id: credentialId,
        },
      ],
    });

    // Force biometric verification
    authOptions.userVerification = "required";

    const authResult = await auth(authOptions);

    // If we get a result without throwing, authentication succeeded
    return !!authResult;
  } catch (error) {
    // User cancelled, timeout, or other error
    console.error("Biometric authentication failed:", error);
    return false;
  }
}
