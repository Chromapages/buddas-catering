"use client";

import { useState } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from "../shared/Dialog";
import { Button } from "@/components/shared/Button";
import { Input } from "@/components/shared/Input";
import { Select } from "@/components/shared/Select";
import { createCompany } from "@/lib/firebase/services/company.service";
import { useAuth } from "@/lib/firebase/context/auth";
import toast from "react-hot-toast";

interface AddCompanyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const COMPANY_TYPES = [
  { value: "Corporate", label: "Corporate" },
  { value: "Non-Profit", label: "Non-Profit" },
  { value: "Government", label: "Government" },
  { value: "Education", label: "Education" },
  { value: "Other", label: "Other" }
];

export function AddCompanyModal({ isOpen, onClose, onSuccess }: AddCompanyModalProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    industry: "",
    companyType: "Corporate",
    website: "",
    address: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) {
      toast.error("Company name is required");
      return;
    }

    setLoading(true);
    try {
      await createCompany(
        formData, 
        user?.uid || "system", 
        user?.displayName || user?.email || "System"
      );
      toast.success("Company created successfully");
      onSuccess();
      onClose();
      setFormData({
        name: "",
        industry: "",
        companyType: "Corporate",
        website: "",
        address: "",
      });
    } catch (error) {
      toast.error("Failed to create company");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add New Company</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Company Name *</label>
            <Input 
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Acme Corp"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Industry</label>
              <Input 
                value={formData.industry}
                onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                placeholder="e.g. Technology"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Company Type</label>
              <Select 
                value={formData.companyType}
                onChange={(e) => setFormData({ ...formData, companyType: e.target.value })}
                options={COMPANY_TYPES}
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Website</label>
            <Input 
              value={formData.website}
              onChange={(e) => setFormData({ ...formData, website: e.target.value })}
              placeholder="e.g. https://acme.com"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Headquarters Address</label>
            <Input 
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="123 Business Way, Suite 100"
            />
          </div>
          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create Company"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
