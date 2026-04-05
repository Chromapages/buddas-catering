"use client";

import { useState, useEffect } from "react";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
  DragOverEvent,
  defaultDropAnimationSideEffects,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { KanbanColumn } from "./KanbanColumn";
import { KanbanCard } from "./KanbanCard";
import { Lead, LeadStatus } from "@/types/crm";
import { updateLeadStatus } from "@/lib/firebase/services/crm";
import { useAuth } from "@/lib/firebase/context/auth";
import toast from "react-hot-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface KanbanBoardProps {
  initialLeads: Lead[];
}

const COLUMNS: { id: LeadStatus; title: string }[] = [
  { id: "New", title: "New Intake" },
  { id: "Contacted", title: "Contacted" },
  { id: "Quote Sent", title: "Quote Sent" },
  { id: "Approved", title: "Converted" },
  { id: "Lost", title: "Closed/Lost" },
];

export const KanbanBoard = ({ initialLeads }: KanbanBoardProps) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [leads, setLeads] = useState<Lead[]>(initialLeads);
  const [activeLead, setActiveLead] = useState<Lead | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    setLeads(initialLeads);
  }, [initialLeads]);

  const mutation = useMutation({
    mutationFn: ({ id, newStatus, currentStatus }: { id: string, newStatus: LeadStatus, currentStatus: LeadStatus }) => 
      updateLeadStatus(id, newStatus as any, currentStatus, user?.uid || "system", user?.displayName || "System"),
    onMutate: async ({ id, newStatus }) => {
      // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
      await queryClient.cancelQueries({ queryKey: ['leads', user?.uid] });

      // Snapshot the previous value
      const previousLeads = queryClient.getQueryData<Lead[]>(['leads', user?.uid]);

      // Optimistically update to the new value
      if (previousLeads) {
        queryClient.setQueryData(['leads', user?.uid], 
          previousLeads.map(lead => lead.id === id ? { ...lead, status: newStatus } : lead)
        );
      }

      return { previousLeads };
    },
    onError: (err, variables, context) => {
      if (context?.previousLeads) {
        queryClient.setQueryData(['leads', user?.uid], context.previousLeads);
      }
      toast.error("Failed to update lead status");
    },
    onSuccess: (data, variables) => {
      toast.success(`Moved to ${variables.newStatus}`);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['leads', user?.uid] });
    },
  });

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const lead = leads.find((l) => l.id === active.id);
    if (lead) setActiveLead(lead);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) return;

    const isActiveALead = active.data.current?.type === "Lead";
    if (!isActiveALead) return;

    setLeads((prevLeads) => {
      const activeIndex = prevLeads.findIndex((l) => l.id === activeId);
      const isOverAColumn = COLUMNS.some(col => col.id === overId);
      
      const newLeads = [...prevLeads];
      const lead = { ...newLeads[activeIndex] };

      if (isOverAColumn) {
        lead.status = overId as LeadStatus;
        newLeads[activeIndex] = lead;
        return newLeads;
      }

      const overIndex = prevLeads.findIndex((l) => l.id === overId);
      if (overIndex !== -1) {
        const overLead = prevLeads[overIndex];
        if (lead.status !== overLead.status) {
          lead.status = overLead.status;
          newLeads[activeIndex] = lead;
        }
        return arrayMove(newLeads, activeIndex, overIndex);
      }

      return prevLeads;
    });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveLead(null);

    if (!over) return;

    const lead = leads.find((l) => l.id === active.id);
    if (!lead) return;

    const originalLead = initialLeads.find(l => l.id === lead.id);
    if (originalLead && originalLead.status !== lead.status) {
      mutation.mutate({ 
        id: lead.id, 
        newStatus: lead.status as LeadStatus, 
        currentStatus: originalLead.status as LeadStatus 
      });
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-6 overflow-x-auto pb-8 min-h-[calc(100vh-12rem)] no-scrollbar">
        {COLUMNS.map((col) => (
          <KanbanColumn
            key={col.id}
            id={col.id}
            title={col.title}
            leads={leads.filter((l) => l.status === col.id)}
          />
        ))}
      </div>

      <DragOverlay dropAnimation={{
        sideEffects: defaultDropAnimationSideEffects({
          styles: {
            active: {
              opacity: "0.5",
            },
          },
        }),
      }}>
        {activeLead ? <KanbanCard lead={activeLead} /> : null}
      </DragOverlay>
    </DndContext>
  );
};
