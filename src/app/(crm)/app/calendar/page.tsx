"use client";

import { useState, useEffect } from "react";
import { CateringCalendar } from "@/components/crm/CateringCalendar";
import { getAllCateringRequests } from "@/lib/firebase/services/crm";
import { useAuth } from "@/lib/firebase/context/auth";
import { CateringRequest } from "@/types/crm";
import { Button } from "@/components/shared/Button";
import Link from "next/link";
import { Calendar as CalendarIcon, Filter, Plus } from "lucide-react";

export default function CalendarPage() {
  const { user, role } = useAuth();
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !role) return;

    const fetchRequests = async () => {
      try {
        const data = await getAllCateringRequests(user.uid, role);
        setRequests(data);
      } catch (error) {
        console.error("Error fetching requests for calendar:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, [user, role]);

  return (
    <div className="p-6 lg:p-8 space-y-8 h-full flex flex-col">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-heading text-teal-dark underline-teal">Operations Calendar</h1>
          <p className="mt-1 text-sm text-brown/70">
            Visualize and manage upcoming catering events and fulfillment status.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" className="hidden sm:flex">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
          <Button asChild size="sm">
            <Link href="/app/requests">
              <Plus className="w-4 h-4 mr-2" />
              Manage Requests
            </Link>
          </Button>
        </div>
      </div>

      <div className="flex-1 min-h-[600px] mb-8">
        {loading ? (
          <div className="h-full flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-base"></div>
          </div>
        ) : (
          <CateringCalendar requests={requests} />
        )}
      </div>
    </div>
  );
}
