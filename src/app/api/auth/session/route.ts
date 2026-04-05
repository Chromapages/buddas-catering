import { NextResponse } from "next/server";
import { auth as adminAuth, db } from "@/lib/firebase/admin";
import { CRM_ALLOWED_ROLES, isAuthorizedCrmRole, SESSION_COOKIE_NAME, SESSION_MAX_AGE_MS } from "@/lib/auth/session";

async function resolveUserRole(uid: string, tokenRole?: string | null) {
  if (isAuthorizedCrmRole(tokenRole)) {
    return tokenRole;
  }

  const userSnap = await db.collection("users").doc(uid).get();
  const firestoreRole = userSnap.exists ? userSnap.data()?.role : null;

  if (isAuthorizedCrmRole(firestoreRole)) {
    return firestoreRole;
  }

  return null;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const idToken = typeof body?.token === "string" ? body.token : "";

    if (!idToken) {
      return NextResponse.json({ ok: false, error: "Missing authentication token." }, { status: 400 });
    }

    const decodedToken = await adminAuth.verifyIdToken(idToken);
    const role = await resolveUserRole(decodedToken.uid, typeof decodedToken.role === "string" ? decodedToken.role : null);

    if (!role) {
      return NextResponse.json(
        { ok: false, error: `Your account does not have CRM access. Allowed roles: ${CRM_ALLOWED_ROLES.join(", ")}.` },
        { status: 403 }
      );
    }

    const sessionCookie = await adminAuth.createSessionCookie(idToken, {
      expiresIn: SESSION_MAX_AGE_MS,
    });

    const response = NextResponse.json({ ok: true, role });

    response.cookies.set({
      name: SESSION_COOKIE_NAME,
      value: sessionCookie,
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: SESSION_MAX_AGE_MS / 1000,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Failed to establish CRM session:", error);
    return NextResponse.json(
      { ok: false, error: "We could not verify your sign-in. Please try again." },
      { status: 401 }
    );
  }
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true });

  response.cookies.set({
    name: SESSION_COOKIE_NAME,
    value: "",
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 0,
    expires: new Date(0),
    path: "/",
  });

  return response;
}
