"use client";

import { useState } from "react";
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "@/lib/firebase/config";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/shared/Input";
import { Button } from "@/components/shared/Button";
import Link from "next/link";
import { FirebaseError } from "firebase/app";

export function LoginPageClient() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const requestedReturnUrl = searchParams.get("returnUrl");
  const returnUrl = requestedReturnUrl?.startsWith("/") ? requestedReturnUrl : "/app/leads";
  const denied = searchParams.get("denied") === "1";

  const syncSessionAndRedirect = async () => {
    const currentUser = auth.currentUser;

    if (!currentUser) {
      throw new Error("Your login completed, but the session is not ready yet.");
    }

    const token = await currentUser.getIdToken(true);
    const response = await fetch("/api/auth/session", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ token }),
    });

    if (!response.ok) {
      const payload = (await response.json().catch(() => null)) as { error?: string } | null;
      throw new Error(payload?.error || "We could not start your secure CRM session.");
    }

    router.push(returnUrl);
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError("");
    const provider = new GoogleAuthProvider();

    try {
      await signInWithPopup(auth, provider);
      await syncSessionAndRedirect();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to sign in with Google.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await signInWithEmailAndPassword(auth, email, password);
      await syncSessionAndRedirect();
    } catch (err: unknown) {
      if (err instanceof FirebaseError) {
        if (err.code === "auth/invalid-credential" || err.code === "auth/user-not-found" || err.code === "auth/wrong-password") {
          setError("Invalid email or password.");
        } else {
          setError("Failed to sign in. Please try again.");
        }
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unexpected error occurred.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-border">
      <div className="text-center mb-8">
        <Link href="/" className="inline-block mb-6">
          <span className="font-heading text-2xl font-bold tracking-tight text-teal-dark">
            Buddas <span className="text-gold">Catering</span>
          </span>
        </Link>
        <h1 className="text-2xl font-bold font-heading text-brown">Staff Login</h1>
        <p className="text-sm text-brown/60 mt-2">Enter your credentials to access the CRM</p>
      </div>

      <form onSubmit={handleLogin} className="space-y-6">
        {denied && !error && (
          <div className="p-3 bg-orange/10 border border-orange/20 rounded-lg text-orange text-sm font-medium text-center">
            Your account is signed in, but it does not currently have CRM access.
          </div>
        )}
        {error && (
          <div className="p-3 bg-orange/10 border border-orange/20 rounded-lg text-orange text-sm font-medium text-center">
            {error}
          </div>
        )}

        <div className="space-y-2">
          <label className="text-sm font-semibold text-teal-dark">Email</label>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@buddascatering.com"
            required
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-semibold text-teal-dark">Password</label>
            <button type="button" className="text-xs font-medium text-teal-base hover:text-teal-dark transition-colors">
              Forgot password?
            </button>
          </div>
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <Button
          type="submit"
          className="w-full"
          disabled={loading || !email || !password}
        >
          {loading ? "Signing in..." : "Sign In"}
        </Button>
      </form>

      <div className="mt-6 relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-border"></div>
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white px-2 text-brown/40 font-medium tracking-wider">Or continue with</span>
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-3">
        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          className="flex w-full items-center justify-center gap-3 rounded-xl border border-gray-border bg-white px-4 py-2.5 text-sm font-semibold text-brown shadow-sm transition-all hover:bg-zinc-50 disabled:opacity-50"
        >
          <svg viewBox="0 0 48 48" className="h-5 w-5">
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.13-.45-4.65H24v9.03h12.91c-.54 2.81-2.11 5.17-4.43 6.75l7.1 5.5c4.15-3.83 6.4-9.45 6.4-16.63z"/>
            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.1-5.5c-1.97 1.35-4.55 2.16-8.79 2.16-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
            <path fill="none" d="M0 0h48v48H0z"/>
          </svg>
          Google Workspace
        </button>

        <p className="mt-4 text-center text-xs text-brown/40">
          Only authorized staff can access the dashboard.
        </p>
      </div>
    </div>
  );
}
