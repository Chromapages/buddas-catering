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

interface KanbanBoardProps {
  initialLeads: Lead[];
}

const COLUMNS: { id: LeadStatus; title: string }[] = [
  { id: "New", title: "New Intake" },
  { id: "Contacted", title: "Contacted" },
  { id: "Quote Sent", title: "Quote Sent" },
  { id: "Approved", title: "Approved" },
];

export const KanbanBoard = ({ initialLeads }: KanbanBoardProps) => {
  const { user } = useAuth();
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

    // Handle moving lead to a different column
    // Dnd-kit logic for sortable across containers
    setLeads((prevLeads) => {
      const activeIndex = prevLeads.findIndex((l) => l.id === activeId);
      const isOverAColumn = COLUMNS.some(col => col.id === overId);
      
      const newLeads = [...prevLeads];
      const lead = { ...newLeads[activeIndex] };

      if (isOverAColumn) {
        // Dropped on a column header or empty area
        lead.status = overId as LeadStatus;
        newLeads[activeIndex] = lead;
        return newLeads;
      }

      // Dropped over another lead
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

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveLead(null);

    if (!over) return;

    const lead = leads.find((l) => l.id === active.id);
    if (!lead) return;

    const originalLead = initialLeads.find(l => l.id === lead.id);
    if (originalLead && originalLead.status !== lead.status) {
      // Status changed, persist to Firebase
      try {
        await updateLeadStatus(
          lead.id,
          lead.status as any,
          originalLead.status,
          user?.uid || "system",
          user?.displayName || "System"
        );
        toast.success(`Moved to ${lead.status}`);
      } catch (error) {
        toast.error("Failed to update status");
        // Revert local state if error
        setLeads(initialLeads);
      }
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
