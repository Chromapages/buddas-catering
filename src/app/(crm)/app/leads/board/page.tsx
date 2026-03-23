"use client";

import { useState, useEffect } from "react";
import { KanbanBoard } from "@/components/crm/kanban/KanbanBoard";
import { getAllLeads } from "@/lib/firebase/services/crm";
import { useAuth } from "@/lib/firebase/context/auth";
import { Lead } from "@/types/crm";
import { Button } from "@/components/shared/Button";
import Link from "next/link";
import { LayoutGrid, List } from "lucide-react";

export default function LeadsBoard() {
  const { user, role } = useAuth();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !role) return;

    const fetchLeads = async () => {
      try {
        const data = await getAllLeads(user.uid, role);
        setLeads(data);
      } catch (error) {
        console.error("Error fetching leads for board:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLeads();
  }, [user, role]);

  return (
    <div className="p-6 lg:p-8 space-y-8 h-full flex flex-col">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-heading text-teal-dark underline-teal">Pipeline Board</h1>
          <p className="mt-1 text-sm text-brown/70">
            Drag and drop leads to update their status in the sales funnel.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-gray-bg/50 p-1 rounded-lg border border-gray-border/50">
            <Button variant="ghost" size="sm" asChild className="h-8 px-3 rounded-md">
              <Link href="/app/leads">
                <List className="w-4 h-4 mr-2" />
                Table
              </Link>
            </Button>
            <Button variant="secondary" size="sm" className="h-8 px-3 rounded-md shadow-sm">
              <LayoutGrid className="w-4 h-4 mr-2" />
              Board
            </Button>
          </div>
          <Button asChild size="sm">
            <Link href="/app/leads/new">Add Lead</Link>
          </Button>
        </div>
      </div>

      <div className="flex-1 min-h-0">
        {loading ? (
          <div className="h-full flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-base"></div>
          </div>
        ) : (
          <KanbanBoard initialLeads={leads} />
        )}
      </div>
    </div>
  );
}
