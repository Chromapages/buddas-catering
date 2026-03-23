"use client";

import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { KanbanCard } from "./KanbanCard";
import { Lead, LeadStatus } from "@/types/crm";

interface KanbanColumnProps {
  id: LeadStatus;
  title: string;
  leads: Lead[];
}

export const KanbanColumn = ({ id, title, leads }: KanbanColumnProps) => {
  const { setNodeRef } = useDroppable({
    id,
  });

  return (
    <div className="flex flex-col h-full min-w-[300px] max-w-[350px] bg-gray-bg/50 rounded-2xl border border-gray-border/40 p-4 shadow-sm">
      <div className="flex items-center justify-between mb-5 px-1">
        <h2 className="text-xs font-bold text-brown uppercase tracking-widest flex items-center gap-2">
          {title}
          <span className="h-5 w-5 rounded-full bg-white border border-gray-border/50 text-teal-dark flex items-center justify-center text-[10px] font-bold">
            {leads.length}
          </span>
        </h2>
      </div>

      <div
        ref={setNodeRef}
        className="flex-1 overflow-y-auto no-scrollbar min-h-[500px]"
      >
        <SortableContext items={leads.map(l => l.id)} strategy={verticalListSortingStrategy}>
          {leads.map((lead) => (
            <KanbanCard key={lead.id} lead={lead} />
          ))}
        </SortableContext>
        
        {leads.length === 0 && (
          <div className="h-full border-2 border-dashed border-gray-border/30 rounded-xl flex items-center justify-center p-8 text-center">
            <p className="text-xs text-brown/30 font-medium italic">No leads in this stage</p>
          </div>
        )}
      </div>
    </div>
  );
};
