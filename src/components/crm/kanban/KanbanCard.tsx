"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card, CardContent } from "@/components/shared/Card";
import { Badge } from "@/components/shared/Badge";
import { Lead } from "@/types/crm";
import { Calendar, User, Building2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";

interface KanbanCardProps {
  lead: Lead;
}

export const KanbanCard = ({ lead }: KanbanCardProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: lead.id,
    data: {
      type: "Lead",
      lead,
    },
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
  };

  if (isDragging) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="opacity-30 h-32 w-full rounded-xl border-2 border-dashed border-teal-base/30 bg-teal-base/5 mb-4"
      />
    );
  }

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="mb-4 touch-none group">
      <Card className="hover:ring-2 hover:ring-teal-base/30 transition-shadow cursor-grab active:cursor-grabbing border-gray-border/60 shadow-sm overflow-hidden bg-white">
        <CardContent className="p-4">
          <div className="flex flex-col gap-3">
            <div className="flex items-start justify-between">
              <h3 className="text-sm font-bold text-brown line-clamp-1 group-hover:text-teal-dark transition-colors">
                {lead.companyName || "Untitled Company"}
              </h3>
            </div>

            <div className="space-y-2">
              <div className="flex items-center text-xs text-brown/60 gap-2 font-medium">
                <User size={14} className="text-brown/40" />
                <span className="truncate">{lead.contactName}</span>
              </div>
              
              {lead.source && (
                <div className="flex items-center text-[10px] text-brown/40 uppercase tracking-widest font-bold">
                  <span className="bg-gray-bg px-1.5 py-0.5 rounded border border-gray-border/50">
                    {lead.source}
                  </span>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-gray-border/30 flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-[10px] text-brown/40 font-bold uppercase tracking-tight">
                <Calendar size={12} />
                {lead.createdAt?.seconds 
                  ? formatDistanceToNow(lead.createdAt.seconds * 1000, { addSuffix: true }) 
                  : "Recently"}
              </div>
              <Link 
                href={`/app/leads/${lead.id}`}
                className="text-[10px] font-bold text-teal-base hover:text-teal-dark uppercase tracking-widest hidden group-hover:block"
                onPointerDown={(e) => e.stopPropagation()}
              >
                View Details
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
