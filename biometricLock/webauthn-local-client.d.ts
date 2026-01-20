declare module "@lo-fi/webauthn-local-client" {
  export const supportsWebAuthn: boolean;

  export interface RegOptions {
    relyingPartyName: string;
    user: {
      id: string;
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
      credentialId: string;
      publicKey: string;
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
