"use client";

import { useState, useEffect } from "react";
import { Building2, Loader2 } from "lucide-react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from "../shared/Dialog";
import { Button } from "@/components/shared/Button";
import { Select } from "@/components/shared/Select";
import { Input } from "@/components/shared/Input";
import { createCommitment } from "@/lib/firebase/services/commitment.service";
import { getAllCompanies } from "@/lib/firebase/services/company.service";
import { useAuth } from "@/lib/firebase/context/auth";
import toast from "react-hot-toast";

interface NewCommitmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialCompanyId?: string;
}

const TIER_OPTIONS = [
  { value: "Tier 1", label: "Tier 1 (2 Events / Mo) — 10% off" },
  { value: "Tier 2", label: "Tier 2 (4 Events / Mo) — 15% off" },
  { value: "Tier 3", label: "Tier 3 (6 Events / Mo) — 20% off" },
];

const TIER_ORDERS: Record<string, number> = {
  "Tier 1": 2,
  "Tier 2": 4,
  "Tier 3": 6,
};

export function NewCommitmentModal({ isOpen, onClose, onSuccess, initialCompanyId }: NewCommitmentModalProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [companies, setCompanies] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    companyId: initialCompanyId || "",
    tier: "Tier 1",
    ordersCommitted: TIER_ORDERS["Tier 1"],
    notes: "",
  });

  useEffect(() => {
    if (isOpen) {
      const fetchCompanies = async () => {
        const data = await getAllCompanies();
        setCompanies(data);
        if (!formData.companyId && data.length > 0) {
          setFormData(prev => ({ ...prev, companyId: data[0].id }));
        }
      };
      fetchCompanies();
    }
  }, [isOpen]);

  useEffect(() => {
    if (initialCompanyId) {
      setFormData(prev => ({ ...prev, companyId: initialCompanyId }));
    }
  }, [initialCompanyId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.companyId) {
      toast.error("Please select a company");
      return;
    }

    setLoading(true);
    try {
      const tierMap: Record<string, { tier: number, discount: number }> = {
        "Tier 1": { tier: 1, discount: 10 },
        "Tier 2": { tier: 2, discount: 15 },
        "Tier 3": { tier: 3, discount: 20 }
      };
      
      const { tier, discount } = tierMap[formData.tier];

      await createCommitment(
        {
          companyId: formData.companyId,
          tier: tier,
          discountPercent: discount,
          ordersCommitted: Number(formData.ordersCommitted),
          ordersUsed: 0,
          notes: formData.notes
        } as any,
        user?.uid || "system",
        user?.displayName || user?.email || "System"
      );

      toast.success("Commitment created successfully");
      onSuccess();
      onClose();
    } catch (error) {
      toast.error("Failed to create commitment");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] bg-white/40 backdrop-blur-3xl border border-teal-dark/10 shadow-glass rounded-[32px] p-0 overflow-hidden">
        <DialogHeader>
          <div className="p-8 border-b border-teal-dark/10 bg-white/5 min-w-full -m-6 mb-0">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-2xl bg-teal-base/10 border border-teal-base/20 flex items-center justify-center">
                <Building2 className="w-5 h-5 text-teal-base" />
              </div>
              <DialogTitle>
                <span className="text-[14px] font-black uppercase tracking-[0.3em] text-teal-dark">Create Corporate Protocol</span>
              </DialogTitle>
            </div>
          </div>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-8 p-8">
          <div className="space-y-3">
            <label className="text-[9px] font-black uppercase tracking-[0.2em] text-teal-dark/40 ml-1">Company Registry</label>
            <div className="relative group">
              <select 
                value={formData.companyId}
                onChange={(e) => setFormData({ ...formData, companyId: e.target.value })}
                disabled={!!initialCompanyId}
                className="w-full bg-teal-dark/5 border border-teal-dark/10 text-teal-dark rounded-xl h-12 px-4 focus:border-teal-base text-[11px] font-black uppercase tracking-widest disabled:opacity-40 outline-none appearance-none cursor-pointer transition-all"
              >
                {companies.map(c => (
                  <option key={c.id} value={c.id} className="bg-white text-teal-dark">{c.name}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="space-y-3">
            <label className="text-[9px] font-black uppercase tracking-[0.2em] text-teal-dark/40 ml-1">Membership Tier Strategy</label>
            <select 
              value={formData.tier}
              onChange={(e) => setFormData({ ...formData, tier: e.target.value, ordersCommitted: TIER_ORDERS[e.target.value] ?? formData.ordersCommitted })}
              className="w-full bg-teal-dark/5 border border-teal-dark/10 text-teal-dark rounded-xl h-12 px-4 focus:border-teal-base text-[11px] font-black uppercase tracking-widest outline-none appearance-none cursor-pointer transition-all"
            >
              {TIER_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value} className="bg-white text-teal-dark">{opt.label}</option>
              ))}
            </select>
          </div>
          <div className="space-y-3">
            <label className="text-[9px] font-black uppercase tracking-[0.2em] text-teal-dark/40 ml-1">Committed Event Volume</label>
            <Input 
              type="number"
              value={formData.ordersCommitted}
              onChange={(e) => setFormData({ ...formData, ordersCommitted: parseInt(e.target.value) })}
              className="bg-teal-dark/5 border-teal-dark/10 text-teal-dark rounded-xl h-12 focus:border-teal-base text-[11px] font-black uppercase tracking-widest placeholder:text-teal-dark/20"
            />
          </div>
          <div className="space-y-3">
            <label className="text-[9px] font-black uppercase tracking-[0.2em] text-teal-dark/40 ml-1">Operational Directives</label>
            <Input 
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Initialize special requirements..."
              className="bg-teal-dark/5 border-teal-dark/10 text-teal-dark rounded-xl h-12 focus:border-teal-base text-[11px] font-black uppercase tracking-widest placeholder:text-teal-dark/10"
            />
          </div>
          <DialogFooter className="pt-6 border-t border-teal-dark/10 flex gap-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading} className="border-teal-dark/10 text-teal-dark/40 h-12 rounded-xl px-6 font-black uppercase tracking-widest text-[10px] hover:bg-teal-dark/5">
              Abort
            </Button>
            <Button type="submit" disabled={loading} className="bg-teal-base hover:bg-teal-base/80 h-12 rounded-xl px-10 font-black uppercase tracking-widest text-[10px] text-teal-dark shadow-glass">
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Synchronizing...
                </>
              ) : "Finalize Commitment"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
