"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { updateProfile, sendPasswordResetEmail } from "firebase/auth";
import { User, Shield, Users, KeyRound, CheckCircle2 } from "lucide-react";
import { auth } from "@/lib/firebase/config";
import { useAuth } from "@/lib/firebase/context/auth";
import { getAllUsers, updateUserProfile } from "@/lib/firebase/services/crm";
import { Button } from "@/components/shared/Button";
import { Input } from "@/components/shared/Input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/shared/Card";
import { Badge } from "@/components/shared/Badge";
import toast from "react-hot-toast";

const ROLE_LABELS: Record<string, string> = {
  owner: "Owner",
  ops: "Operations",
  rep: "Sales Rep",
  marketing: "Marketing",
};

const ROLE_BADGE: Record<string, "success" | "default" | "warning" | "neutral"> = {
  owner: "success",
  ops: "default",
  rep: "warning",
  marketing: "neutral",
};

export default function SettingsPage() {
  const { user } = useAuth();

  // Profile section
  const [displayName, setDisplayName] = useState(user?.displayName || "");
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);

  // Team section
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [loadingTeam, setLoadingTeam] = useState(true);

  // Security section
  const [resetSent, setResetSent] = useState(false);
  const [sendingReset, setSendingReset] = useState(false);

  // Resolve role from custom claims
  const [userRole, setUserRole] = useState<string>("—");
  const isOwner = userRole === "owner";

  useEffect(() => {
    if (!user) return;
    setDisplayName(user.displayName || "");
    user.getIdTokenResult().then(result => {
      setUserRole((result.claims.role as string) || "—");
    });
  }, [user]);

  useEffect(() => {
    const fetchTeam = async () => {
      setLoadingTeam(true);
      try {
        const data = await getAllUsers();
        setTeamMembers(data);
      } catch {
        // silently fail — team section is non-critical
      } finally {
        setLoadingTeam(false);
      }
    };
    fetchTeam();
  }, []);

  const handleSaveProfile = async () => {
    if (!user || !displayName.trim()) return;
    setSavingProfile(true);
    try {
      await updateProfile(user, { displayName: displayName.trim() });
      await updateUserProfile(user.uid, displayName.trim());
      setProfileSaved(true);
      toast.success("Profile updated.");
      setTimeout(() => setProfileSaved(false), 3000);
    } catch {
      toast.error("Failed to save profile.");
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!user?.email) return;
    setSendingReset(true);
    try {
      await sendPasswordResetEmail(auth, user.email);
      setResetSent(true);
      toast.success(`Reset email sent to ${user.email}`);
    } catch {
      toast.error("Failed to send reset email.");
    } finally {
      setSendingReset(false);
    }
  };

  const formatTimestamp = (ts: any) => {
    if (!ts) return "—";
    if (ts?.seconds) return format(ts.seconds * 1000, "MMM d, yyyy");
    if (typeof ts === "string") return format(new Date(ts), "MMM d, yyyy");
    return "—";
  };

  return (
    <div className="p-6 lg:p-8 max-w-3xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold font-heading text-teal-dark">Settings</h1>
        <p className="text-sm text-brown/70 mt-1">Manage your profile and team.</p>
      </div>

      {/* Profile */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5 text-teal-dark" />
            My Profile
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-teal-dark/10 flex items-center justify-center text-teal-dark font-bold text-xl font-heading">
              {(user?.displayName || user?.email || "?")[0].toUpperCase()}
            </div>
            <div>
              <p className="font-semibold text-brown">{user?.displayName || "No name set"}</p>
              <p className="text-sm text-brown/60">{user?.email}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-brown mb-1">Display Name</label>
              <Input
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Your name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-brown mb-1">Email</label>
              <Input value={user?.email || ""} disabled className="opacity-60 cursor-not-allowed" />
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-2 text-sm text-brown/60">
              <Shield className="w-4 h-4" />
              Role:
              <Badge variant={ROLE_BADGE[userRole] ?? "neutral"}>
                {ROLE_LABELS[userRole] ?? userRole}
              </Badge>
            </div>
            <Button
              onClick={handleSaveProfile}
              disabled={savingProfile || !displayName.trim()}
              size="sm"
            >
              {profileSaved
                ? <><CheckCircle2 className="w-4 h-4 mr-1" /> Saved</>
                : savingProfile ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Security */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <KeyRound className="w-5 h-5 text-teal-dark" />
            Security
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-brown">Password</p>
              <p className="text-xs text-brown/60 mt-0.5">
                We'll send a reset link to <span className="font-medium">{user?.email}</span>.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handlePasswordReset}
              disabled={sendingReset || resetSent}
            >
              {resetSent ? "Email Sent" : sendingReset ? "Sending..." : "Send Reset Email"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Team Members */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-teal-dark" />
            Team Members
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loadingTeam ? (
            <div className="flex items-center gap-2 text-sm text-brown/50 py-4">
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-teal-base border-t-transparent" />
              Loading team...
            </div>
          ) : teamMembers.length > 0 ? (
            <div className="divide-y divide-gray-border">
              {teamMembers.map((member) => (
                <div key={member.id} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-teal-dark/10 flex items-center justify-center text-teal-dark font-semibold text-sm">
                      {(member.displayName || member.email || "?")[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-brown">{member.displayName || "—"}</p>
                      <p className="text-xs text-brown/60">{member.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={ROLE_BADGE[member.role] ?? "neutral"}>
                      {ROLE_LABELS[member.role] ?? member.role ?? "—"}
                    </Badge>
                    <span className="text-xs text-brown/40 hidden sm:block">
                      Joined {formatTimestamp(member.createdAt)}
                    </span>
                    {!member.active && (
                      <Badge variant="danger">Inactive</Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-6 text-center text-sm text-brown/50">
              No team members found in Firestore.{" "}
              {isOwner && (
                <span>
                  Run <code className="bg-gray-bg px-1 rounded text-xs">scripts/create-admin-user.ts</code> to add users.
                </span>
              )}
            </div>
          )}

          {isOwner && teamMembers.length > 0 && (
            <p className="mt-4 text-xs text-brown/50 border-t border-gray-border pt-3">
              To change roles, run{" "}
              <code className="bg-gray-bg px-1 rounded">scripts/promote-user.ts &lt;email&gt;</code> and redeploy Firestore rules.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
