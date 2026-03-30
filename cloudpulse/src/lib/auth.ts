import { SignJWT, jwtVerify } from "jose";
import { randomBytes } from "node:crypto";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "dev-secret-change-me"
);
const JWT_ISSUER = process.env.JWT_ISSUER || "cloudpulse";

export interface AccessTokenPayload {
  sub: string;
  email: string;
  type: "access";
}

/**
 * Sign a short-lived access token (15 minutes).
 */
export async function signAccessToken(
  userId: string,
  email: string
): Promise<string> {
  return new SignJWT({ email, type: "access" })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(userId)
    .setIssuer(JWT_ISSUER)
    .setIssuedAt()
    .setExpirationTime("15m")
    .sign(JWT_SECRET);
}

/**
 * Verify and decode an access token.
 */
export async function verifyAccessToken(
  token: string
): Promise<AccessTokenPayload> {
  const { payload } = await jwtVerify(token, JWT_SECRET, {
    issuer: process.env.JWT_ISSUER || "cloudpulse",
  });

  if (payload.type !== "access") {
    throw new Error("Invalid token type");
  }

  return {
    sub: payload.sub!,
    email: payload.email as string,
    type: "access",
  };
}

/**
 * Generate a random refresh token string.
 */
export function generateRefreshToken(): string {
  return randomBytes(48).toString("hex");
}

/**
 * Generate a random API key for server registration.
 */
export function generateApiKey(): string {
  return randomBytes(32).toString("hex");
}
