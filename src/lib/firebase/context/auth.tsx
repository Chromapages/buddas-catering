"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { 
  User, 
  onAuthStateChanged, 
  signOut as firebaseSignOut 
} from "firebase/auth";
import { auth } from "@/lib/firebase/config";
import { useRouter } from "next/navigation";
import { isAuthorizedCrmRole } from "@/lib/auth/session";

interface AuthContextType {
  user: User | null;
  role: string | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  role: null,
  loading: true,
  signOut: async () => {},
});

export const useAuth = () => useContext(AuthContext);

async function syncServerSession(token: string) {
  const response = await fetch("/api/auth/session", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ token }),
  });

  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as { error?: string } | null;
    throw new Error(payload?.error || "Unable to establish your secure session.");
  }
}

async function clearServerSession() {
  await fetch("/api/auth/session", {
    method: "DELETE",
  }).catch(() => null);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Listen for auth state changes
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const tokenResult = await user.getIdTokenResult();
        let userRole = tokenResult.claims.role as string;
        
        // If role is not in the token, check Firestore document
        if (!userRole) {
          try {
            const { getDoc, doc } = await import("firebase/firestore");
            const { db } = await import("@/lib/firebase/config");
            const userSnap = await getDoc(doc(db, "users", user.uid));
            if (userSnap.exists()) {
              userRole = userSnap.data().role;
            }
          } catch (err) {
            console.error("Error fetching user role from Firestore:", err);
          }
        }

        try {
          const token = await user.getIdToken();
          await syncServerSession(token);
        } catch (err) {
          console.error("Error syncing auth session:", err);
        }
        
        setRole(isAuthorizedCrmRole(userRole) ? userRole : 'rep');
        setUser(user);
      } else {
        await clearServerSession();
        setUser(null);
        setRole(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signOut = async () => {
    await clearServerSession();
    await firebaseSignOut(auth);
    router.push("/login");
  };

  return (
    <AuthContext.Provider value={{ user, role, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}
