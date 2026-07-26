import { randomBytes, scryptSync, timingSafeEqual } from "crypto";
import { jwtVerify, SignJWT } from "jose";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Role, type User } from "@prisma/client";
import { db } from "@/lib/db";

const SESSION_COOKIE = "paper_checker_session";

type SessionPayload = {
  sub: string;
  role: Role;
  schoolId?: string | null;
  email: string;
};

function getJwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET is not set.");
  }

  return new TextEncoder().encode(secret);
}

export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

export async function verifyPassword(password: string, passwordHash: string) {
  const [salt, storedHash] = passwordHash.split(":");

  if (!salt || !storedHash) {
    return false;
  }

  const derivedHash = scryptSync(password, salt, 64);
  const storedBuffer = Buffer.from(storedHash, "hex");

  if (storedBuffer.length !== derivedHash.length) {
    return false;
  }

  return timingSafeEqual(storedBuffer, derivedHash);
}

export async function createSession(user: User) {
  const token = await new SignJWT({
    role: user.role,
    schoolId: user.schoolId,
    email: user.email
  })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(user.id)
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(getJwtSecret());

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    // Only mark Secure when explicitly served over HTTPS. A Secure cookie is never sent
    // back over plain HTTP, which would silently break login on an http:// deployment.
    secure: process.env.COOKIE_SECURE === "true",
    path: "/",
    maxAge: 60 * 60 * 24 * 7
  });
}

export async function clearSession() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;

  if (!token) {
    return null;
  }

  try {
    const verified = await jwtVerify(token, getJwtSecret());
    const payload = verified.payload as SessionPayload;

    return {
      sub: payload.sub,
      role: payload.role,
      schoolId: payload.schoolId,
      email: payload.email
    };
  } catch {
    return null;
  }
}

export async function requireSession() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  return session;
}

export async function requireRole(roles: Role[]) {
  const session = await requireSession();

  if (!roles.includes(session.role)) {
    redirect("/dashboard");
  }

  return session;
}

export async function getAuthorizedApiSession(roles: Role[]) {
  const session = await getSession();

  if (!session) {
    return { error: "Unauthorized", status: 401 as const };
  }

  if (!roles.includes(session.role)) {
    return { error: "Forbidden", status: 403 as const };
  }

  return { session };
}

export async function authenticate(email: string, password: string) {
  const user = await db.user.findUnique({
    where: { email }
  });

  if (!user) {
    return null;
  }

  const valid = await verifyPassword(password, user.passwordHash);
  return valid ? user : null;
}
