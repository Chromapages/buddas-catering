"use client";

import { User } from "lucide-react";
import { Badge } from "@/components/shared/Badge";
import { Card, CardContent } from "@/components/shared/Card";
import { useState } from "react";
import { Button } from "@/components/shared/Button";

interface ContactSidePanelProps {
  tags: string[];
  notes: string;
  assignedRep: {
    id: string;
    name: string;
  };
  onUpdateNotes: (notes: string) => void;
}

export const ContactSidePanel = ({
  tags,
  notes: initialNotes,
  assignedRep,
  onUpdateNotes
}: ContactSidePanelProps) => {
  const [notes, setNotes] = useState(initialNotes);
  const [isSaving, setIsSaving] = useState(false);

  const handleNotesUpdate = async () => {
    setIsSaving(true);
    await onUpdateNotes(notes);
    setIsSaving(false);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-right-6 duration-700">
      {/* Ownership Dashboard */}
      <Card className="bg-white border border-chef-charcoal/5 shadow-soft-low rounded-[32px] overflow-hidden">
        <CardContent className="p-8">
          <h3 className="text-[10px] font-black text-chef-muted uppercase tracking-[0.25em] mb-6">Account Accountability</h3>
          <div className="flex items-center gap-5 p-5 rounded-[20px] bg-chef-prep/50 border border-chef-charcoal/5 shadow-soft-low group">
            <div className="w-14 h-14 rounded-[16px] bg-chef-charcoal flex items-center justify-center text-white shadow-soft-mid group-hover:scale-110 transition-transform">
              <User size={24} />
            </div>
            <div className="flex-1">
              <p className="text-[10px] text-accent-fresh font-black uppercase tracking-widest">Protocol Agent</p>
              <h4 className="text-lg font-black text-chef-charcoal tracking-tight mt-0.5">{assignedRep.name}</h4>
            </div>
          </div>
          <Button variant="outline" className="w-full mt-6 h-14 rounded-[20px] border-chef-charcoal/10 text-chef-charcoal text-[10px] font-black uppercase tracking-widest hover:bg-chef-prep transition-all active:scale-95 shadow-soft-low">
            Reassign Integrity
          </Button>
        </CardContent>
      </Card>

      {/* Active Tags */}
      <Card className="bg-white border border-chef-charcoal/5 shadow-soft-low rounded-[32px] overflow-hidden">
        <CardContent className="p-8">
          <h3 className="text-[10px] font-black text-chef-muted uppercase tracking-[0.25em] mb-6">Classification Tags</h3>
          <div className="flex flex-wrap gap-2.5">
            {tags.map((tag) => (
              <Badge 
                key={tag} 
                className="bg-accent-fresh/10 text-accent-fresh border border-accent-fresh/10 font-black px-4 py-2 rounded-xl text-[9px] uppercase tracking-widest shadow-soft-low"
              >
                {tag}
              </Badge>
            ))}
            {tags.length === 0 && (
              <p className="text-[10px] text-chef-muted/30 font-black uppercase tracking-widest italic tracking-[0.1em]">No metadata assigned.</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Internal Workspace / Notes */}
      <Card className="bg-white border border-chef-charcoal/5 shadow-soft-mid rounded-[32px] overflow-hidden">
        <CardContent className="p-8 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-[10px] font-black text-chef-muted uppercase tracking-[0.25em]">Strategic Notes</h3>
          </div>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Document tactical insights..."
            className="w-full min-h-[180px] p-5 bg-chef-prep/30 border border-chef-charcoal/5 rounded-[24px] text-sm font-bold text-chef-charcoal placeholder:text-chef-muted/30 focus:outline-none focus:ring-4 focus:ring-accent-fresh/5 focus:bg-white transition-all resize-none shadow-soft-low"
          />
          <Button 
            onClick={handleNotesUpdate} 
            disabled={isSaving || notes === initialNotes}
            className="w-full h-14 rounded-[20px] bg-chef-charcoal hover:bg-black text-white text-[10px] font-black uppercase tracking-widest transition-all shadow-soft-mid active:scale-95 disabled:opacity-20"
          >
            {isSaving ? "Syncing..." : "Commit Update"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
