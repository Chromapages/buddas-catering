"use client";

import { useState, useEffect } from "react";
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
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle>New Corporate Commitment</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Select Company</label>
            <Select 
              value={formData.companyId}
              onChange={(e) => setFormData({ ...formData, companyId: e.target.value })}
              options={companies.map(c => ({ value: c.id, label: c.name }))}
              disabled={!!initialCompanyId}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Membership Tier</label>
            <Select 
              value={formData.tier}
              onChange={(e) => setFormData({ ...formData, tier: e.target.value, ordersCommitted: TIER_ORDERS[e.target.value] ?? formData.ordersCommitted })}
              options={TIER_OPTIONS}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Orders Committed</label>
            <Input 
              type="number"
              value={formData.ordersCommitted}
              onChange={(e) => setFormData({ ...formData, ordersCommitted: parseInt(e.target.value) })}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Notes</label>
            <Input 
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="e.g. Special billing arrangements"
            />
          </div>
          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Save Commitment"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
