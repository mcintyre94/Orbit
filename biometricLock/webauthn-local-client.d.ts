declare module "@lo-fi/webauthn-local-client" {
  export const supportsWebAuthn: boolean;

  export interface RegOptions {
    relyingPartyName: string;
    user: {
      id: BufferSource; // WebAuthn requires ArrayBuffer or ArrayBufferView
      name: string;
      displayName: string;
    };
    authenticatorSelection?: {
      userVerification?: "required" | "preferred" | "discouraged";
      authenticatorAttachment?: "platform" | "cross-platform";
      residentKey?: "required" | "preferred" | "discouraged";
    };
  }

  export interface RegResult {
    response: {
      credentialID: string; // Note: uppercase ID
      publicKey: {
        algoCOSE: number;
        algoOID: string;
        spki: Uint8Array;
        raw: Uint8Array;
      };
    };
  }

  export interface AuthOptions {
    allowCredentials?: Array<{
      type: "public-key";
      id: string;
    }>;
    userVerification?: "required" | "preferred" | "discouraged";
  }

  export interface AuthResult {
    response: {
      credentialId: string;
    };
  }

  export function regDefaults(options: RegOptions): RegOptions;
  export function authDefaults(options: AuthOptions): AuthOptions;
  export function register(options: RegOptions): Promise<RegResult>;
  export function auth(options: AuthOptions): Promise<AuthResult>;
}
