"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { doc, getDoc } from "firebase/firestore";
import { sendPasswordResetEmail, updateProfile } from "firebase/auth";
import {
  ArrowLeft,
  CheckCircle2,
  KeyRound,
  Mail,
  Shield,
  Sparkles,
  User2,
  Users,
  ClipboardList,
  CheckSquare,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/shared/Card";
import { Input } from "@/components/shared/Input";
import { Button } from "@/components/shared/Button";
import { Badge } from "@/components/shared/Badge";
import { auth, db } from "@/lib/firebase/config";
import { useAuth } from "@/lib/firebase/context/auth";
import { getAllLeads, getAllCateringRequests, updateUserProfile } from "@/lib/firebase/services/crm";
import { getTasksByRep } from "@/lib/firebase/services/task.service";

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

interface FirestoreTimestamp {
  seconds: number;
  nanoseconds: number;
}

interface UserProfileMeta {
  createdAt?: FirestoreTimestamp;
  updatedAt?: FirestoreTimestamp;
  displayName?: string;
}

export default function AccountSettingsPage() {
  const { user, role } = useAuth();
  const [displayName, setDisplayName] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);
  const [sendingReset, setSendingReset] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [profileMeta, setProfileMeta] = useState<UserProfileMeta | null>(null);

  useEffect(() => {
    setDisplayName(user?.displayName || "");
  }, [user]);

  useEffect(() => {
    async function loadUserMeta() {
      if (!user) return;

      try {
        const snap = await getDoc(doc(db, "users", user.uid));
        if (snap.exists()) {
          setProfileMeta(snap.data() as UserProfileMeta);
        }
      } catch (error) {
        console.error("Failed to load user profile metadata:", error);
      }
    }

    void loadUserMeta();
  }, [user]);

  const { data: leads = [] } = useQuery({
    queryKey: ["account-leads-stat", user?.uid],
    queryFn: () => getAllLeads(user!.uid, role || "rep"),
    enabled: !!user && !!role,
  });

  const { data: requests = [] } = useQuery({
    queryKey: ["account-requests-stat", user?.uid],
    queryFn: () => getAllCateringRequests(user!.uid, role || "rep"),
    enabled: !!user && !!role,
  });

  const { data: tasks = [] } = useQuery({
    queryKey: ["account-tasks-stat", user?.uid],
    queryFn: () => getTasksByRep(user!.uid, "Upcoming"),
    enabled: !!user,
  });

  const initials = useMemo(() => {
    if (user?.displayName) {
      return user.displayName
        .split(" ")
        .map((part) => part[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();
    }

    return user?.email?.slice(0, 2).toUpperCase() || "BU";
  }, [user]);

  const joinedLabel = useMemo(() => {
    const createdAt = profileMeta?.createdAt;
    if (!createdAt || typeof createdAt !== "object" || !("seconds" in createdAt)) return "Recently added";
    return formatDistanceToNow(new Date(createdAt.seconds * 1000), { addSuffix: true });
  }, [profileMeta]);

  const stats = [
    { label: "Visible Leads", value: leads.length, icon: Users, tone: "from-teal-dark to-teal-base" },
    { label: "Visible Requests", value: requests.length, icon: ClipboardList, tone: "from-[#B88746] to-[#E9C559]" },
    { label: "Upcoming Tasks", value: tasks.length, icon: CheckSquare, tone: "from-brown to-[#8E6C56]" },
  ];

  const handleSaveProfile = async () => {
    if (!user || !displayName.trim()) return;

    setSavingProfile(true);
    try {
      await updateProfile(user, { displayName: displayName.trim() });
      await updateUserProfile(user.uid, displayName.trim());
      setProfileSaved(true);
      toast.success("Account profile updated");
      setTimeout(() => setProfileSaved(false), 3000);
    } catch (error) {
      console.error("Failed to update profile:", error);
      toast.error("Failed to save profile");
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
    } catch (error) {
      console.error("Failed to send password reset:", error);
      toast.error("Failed to send reset email");
    } finally {
      setSendingReset(false);
    }
  };

  return (
    <div className="mx-auto max-w-6xl space-y-8 p-6 lg:p-8">
      <div className="relative overflow-hidden rounded-[2rem] border border-white/60 bg-gradient-to-br from-[#0F3A3A] via-[#14514D] to-[#1A6C67] px-6 py-8 text-white shadow-[0_30px_80px_-30px_rgba(10,56,54,0.75)] lg:px-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(233,197,89,0.28),transparent_34%),radial-gradient(circle_at_bottom_left,rgba(255,255,255,0.14),transparent_30%)]" />
        <div className="relative">
          <Link href="/app" className="inline-flex items-center gap-2 text-sm font-semibold text-white/80 transition-colors hover:text-white">
            <ArrowLeft className="h-4 w-4" />
            Back to CRM
          </Link>

          <div className="mt-6 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-20 w-20 items-center justify-center rounded-[1.5rem] border border-white/20 bg-white/10 text-2xl font-bold shadow-xl backdrop-blur-xl">
                {initials}
              </div>
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.24em] text-white/80 backdrop-blur-xl">
                  <Sparkles className="h-3.5 w-3.5" />
                  Account
                </div>
                <h1 className="mt-4 font-heading text-3xl font-bold tracking-tight lg:text-4xl">
                  {user?.displayName || "Your Account"}
                </h1>
                <p className="mt-2 max-w-2xl text-sm text-white/78">
                  Update your profile, manage account security, and keep a pulse on your current CRM footprint from one polished workspace.
                </p>
              </div>
            </div>

            <div className="rounded-[1.5rem] border border-white/15 bg-white/10 p-4 backdrop-blur-xl">
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/65">Membership</p>
              <div className="mt-2 flex items-center gap-3">
                <Badge variant={ROLE_BADGE[role || "rep"] ?? "neutral"} className="border-none bg-white/90 text-teal-dark">
                  {ROLE_LABELS[role || "rep"] || role || "Team Member"}
                </Badge>
                <span className="text-sm text-white/80">Joined {joinedLabel}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="overflow-hidden rounded-[1.5rem] border border-white/60 bg-white/70 p-5 shadow-[0_20px_60px_-28px_rgba(45,35,30,0.28)] backdrop-blur-xl"
          >
            <div className={`inline-flex rounded-2xl bg-gradient-to-br ${stat.tone} p-3 text-white shadow-lg`}>
              <stat.icon className="h-5 w-5" />
            </div>
            <p className="mt-4 text-[11px] font-bold uppercase tracking-[0.2em] text-brown/45">{stat.label}</p>
            <p className="mt-2 font-heading text-3xl font-bold text-teal-dark">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
        <Card className="rounded-[1.75rem] border-white/60 bg-white/75 shadow-[0_24px_80px_-36px_rgba(17,64,62,0.35)] backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User2 className="h-5 w-5 text-teal-dark" />
              Profile Details
            </CardTitle>
            <CardDescription>
              Display name updates are synced to Firebase Auth and the CRM user profile.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-brown">Display Name</label>
                <Input value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="Your name" />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-brown">Email</label>
                <Input value={user?.email || ""} disabled className="cursor-not-allowed opacity-60" />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-gray-border/70 bg-[#F8F7F4] p-4">
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-brown/45">Current Role</p>
                <p className="mt-2 text-base font-semibold text-brown">{ROLE_LABELS[role || "rep"] || role || "Team Member"}</p>
              </div>
              <div className="rounded-2xl border border-gray-border/70 bg-[#F8F7F4] p-4">
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-brown/45">Account Status</p>
                <p className="mt-2 text-base font-semibold text-brown">Active</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-border/70 pt-5">
              <div className="text-sm text-brown/60">
                Additional profile metadata like phone or title is not editable yet in this screen.
              </div>
              <Button onClick={handleSaveProfile} disabled={savingProfile || !displayName.trim()}>
                {profileSaved ? (
                  <>
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Saved
                  </>
                ) : savingProfile ? (
                  "Saving..."
                ) : (
                  "Save Profile"
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="rounded-[1.75rem] border-white/60 bg-white/75 shadow-[0_24px_80px_-36px_rgba(17,64,62,0.35)] backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <KeyRound className="h-5 w-5 text-teal-dark" />
                Security
              </CardTitle>
              <CardDescription>
                Send yourself a secure password reset link when you need to rotate credentials.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-2xl border border-gray-border/70 bg-[#F8F7F4] p-4">
                <div className="flex items-start gap-3">
                  <Mail className="mt-0.5 h-4 w-4 text-brown/45" />
                  <div>
                    <p className="text-sm font-semibold text-brown">Reset email destination</p>
                    <p className="mt-1 text-sm text-brown/60">{user?.email || "No email on file"}</p>
                  </div>
                </div>
              </div>

              <Button variant="outline" className="w-full" onClick={handlePasswordReset} disabled={sendingReset || resetSent}>
                {resetSent ? "Reset Email Sent" : sendingReset ? "Sending..." : "Send Password Reset"}
              </Button>
            </CardContent>
          </Card>

          <Card className="rounded-[1.75rem] border-white/60 bg-white/75 shadow-[0_24px_80px_-36px_rgba(17,64,62,0.35)] backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-teal-dark" />
                Account Activity
              </CardTitle>
              <CardDescription>Quick signals about your current CRM identity and workload.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-2xl border border-gray-border/70 bg-[#F8F7F4] p-4">
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-brown/45">Last Sign In</p>
                <p className="mt-2 text-sm font-semibold text-brown">
                  {user?.metadata?.lastSignInTime
                    ? formatDistanceToNow(new Date(user.metadata.lastSignInTime), { addSuffix: true })
                    : "Unavailable"}
                </p>
              </div>

              <div className="rounded-2xl border border-gray-border/70 bg-[#F8F7F4] p-4">
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-brown/45">Auth Provider</p>
                <p className="mt-2 text-sm font-semibold text-brown capitalize">
                  {user?.providerData?.[0]?.providerId?.replace(".com", "") || "password"}
                </p>
              </div>

              <div className="rounded-2xl border border-gray-border/70 bg-[#F8F7F4] p-4">
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-brown/45">Workspace</p>
                <p className="mt-2 text-sm font-semibold text-brown">Buddas CRM</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
