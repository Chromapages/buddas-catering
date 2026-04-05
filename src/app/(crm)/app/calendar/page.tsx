"use client";

import { useState, useEffect } from "react";
import { CateringCalendar } from "@/components/crm/CateringCalendar";
import { getAllCateringRequests, getSalesReps } from "@/lib/firebase/services/crm";
import { useAuth } from "@/lib/firebase/context/auth";
import { Button } from "@/components/shared/Button";
import Link from "next/link";
import { Filter, Plus, Check } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/shared/DropdownMenu";

export default function CalendarPage() {
  const { user, role } = useAuth();
  const [requests, setRequests] = useState<any[]>([]);
  const [reps, setReps] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  
  // Filter state
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [repFilter, setRepFilter] = useState<string>("All");

  useEffect(() => {
    if (!user || !role) return;

    const fetchData = async () => {
      try {
        const [requestsData, repsData] = await Promise.all([
          getAllCateringRequests(user.uid, role),
          getSalesReps()
        ]);
        setRequests(requestsData);
        setReps(repsData);
      } catch (error) {
        console.error("Error fetching data for calendar:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, role]);

  const filteredRequests = requests.filter(req => {
    const matchesStatus = statusFilter === "All" || req.fulfillmentStatus === statusFilter;
    const matchesRep = repFilter === "All" || req.assignedRepId === repFilter;
    return matchesStatus && matchesRep;
  });

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
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="flex">
                <Filter className="w-4 h-4 mr-2" />
                Filter
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Status Filter</DropdownMenuLabel>
              <DropdownMenuGroup>
                {["All", "Pending", "Confirmed", "In Progress", "Fulfilled", "Cancelled"].map(s => (
                  <DropdownMenuItem key={s} onClick={() => setStatusFilter(s)}>
                    {s}
                    {statusFilter === s && <Check className="ml-auto w-4 h-4" />}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuLabel>Sales Rep Filter</DropdownMenuLabel>
              <DropdownMenuGroup>
                <DropdownMenuItem onClick={() => setRepFilter("All")}>
                  All Reps
                  {repFilter === "All" && <Check className="ml-auto w-4 h-4" />}
                </DropdownMenuItem>
                {Object.entries(reps).map(([id, name]) => (
                  <DropdownMenuItem key={id} onClick={() => setRepFilter(id)}>
                    {name}
                    {repFilter === id && <Check className="ml-auto w-4 h-4" />}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>

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
          <CateringCalendar requests={filteredRequests} reps={reps} />
        )}
      </div>
    </div>
  );
}
