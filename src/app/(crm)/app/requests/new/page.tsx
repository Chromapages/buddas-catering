"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { Input } from "@/components/shared/Input";
import { Select } from "@/components/shared/Select";
import { Button } from "@/components/shared/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/shared/Card";
import toast from "react-hot-toast";
import { useQuery } from "@tanstack/react-query";
import { getCompanyById, getContactsByCompanyId, createCateringRequest } from "@/lib/firebase/services/crm";
import { useAuth } from "@/lib/firebase/context/auth";
import type { FulfillmentStatus } from "@/types/crm";

const newRequestSchema = z.object({
  companyId: z.string().min(1, "Company is required."),
  contactId: z.string().min(1, "Contact is required."),
  eventType: z.string().min(1, "Please enter an event type."),
  cateringNeed: z.enum(["Breakfast", "Lunch", "Pastries", "Not Sure Yet"]),
  estimatedGroupSize: z.number().int().min(10, "Group size must be at least 10."),
  preferredDate: z.string().optional(),
  notes: z.string().max(500).optional(),
});

type NewRequestFormData = z.infer<typeof newRequestSchema>;

const CATERING_NEED_OPTIONS = [
  { value: "Breakfast", label: "Breakfast" },
  { value: "Lunch", label: "Lunch" },
  { value: "Pastries", label: "Pastries" },
  { value: "Not Sure Yet", label: "Not Sure Yet" },
];

function NewRequestForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const companyId = searchParams.get("companyId");
  const [submitting, setSubmitting] = useState(false);

  const { data: companyData, isLoading: loadingCompany } = useQuery({
    queryKey: ["company", companyId],
    queryFn: () => companyId ? getCompanyById(companyId) : Promise.resolve(null),
    enabled: !!companyId,
  });

  const { data: contactsData, isLoading: loadingContacts } = useQuery({
    queryKey: ["contacts", companyId],
    queryFn: () => companyId ? getContactsByCompanyId(companyId) : Promise.resolve([]),
    enabled: !!companyId,
  });

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<NewRequestFormData>({
    resolver: zodResolver(newRequestSchema),
    defaultValues: {
      companyId: companyId || "",
      cateringNeed: "Not Sure Yet",
    },
  });

  useEffect(() => {
    if (companyId) setValue("companyId", companyId);
  }, [companyId, setValue]);

  const onSubmit = async (data: NewRequestFormData) => {
    if (!user) return;
    setSubmitting(true);
    try {
      const selectedContact = contactsData?.find(c => c.id === data.contactId);
      
      const payload = {
        ...data,
        companyName: companyData?.name || "Unknown",
        contactName: selectedContact?.fullName || "Unknown",
        assignedRepId: companyData?.assignedRepId || user.uid,
        fulfillmentStatus: "Pending" as FulfillmentStatus,
      };

      await createCateringRequest(payload, user.uid, user.displayName || "User");
      toast.success("Event scheduled successfully.");
      router.push(companyId ? `/app/companies/${companyId}` : "/app/orders");
    } catch (err: any) {
      toast.error(err.message || "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingCompany || loadingContacts) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-teal-base" />
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 max-w-3xl">
      <div className="mb-6">
        <Link
          href={companyId ? `/app/companies/${companyId}` : "/app/orders"}
          className="inline-flex items-center gap-1.5 text-sm text-brown/60 hover:text-brown transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" /> Back to {companyId ? "Company" : "Orders"}
        </Link>
        <h1 className="text-2xl font-bold font-heading text-teal-dark underline-teal text-3xl">Schedule New Event</h1>
        <p className="text-sm text-brown/70 mt-1">
          Create a new catering request for {companyData?.name || "an existing company"}.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Event Basic Info</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-brown mb-1">
                Contact Person <span className="text-orange">*</span>
              </label>
              <Select
                {...register("contactId")}
                options={contactsData?.map(c => ({ value: c.id, label: `${c.fullName} (${c.email})` })) || []}
                error={errors.contactId?.message}
                placeholder="Select a contact..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-brown mb-1">
                Event Type <span className="text-orange">*</span>
              </label>
              <Input
                {...register("eventType")}
                placeholder="e.g. Sales Meeting"
                error={errors.eventType?.message}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-brown mb-1">
                Catering Need <span className="text-orange">*</span>
              </label>
              <Select
                {...register("cateringNeed")}
                options={CATERING_NEED_OPTIONS}
                error={errors.cateringNeed?.message}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-brown mb-1">
                Estimated Group Size <span className="text-orange">*</span>
              </label>
              <Input
                {...register("estimatedGroupSize", { valueAsNumber: true })}
                type="number"
                min={10}
                placeholder="25"
                error={errors.estimatedGroupSize?.message}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-brown mb-1">
                Preferred Date
              </label>
              <Input
                {...register("preferredDate")}
                type="date"
                error={errors.preferredDate?.message}
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-brown mb-1">Additional Notes</label>
              <textarea
                {...register("notes")}
                rows={4}
                placeholder="Specific instructions, dietary notes, etc."
                className="flex w-full rounded-lg border border-gray-border bg-white px-3 py-2 text-sm text-brown placeholder:text-brown/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-base focus-visible:border-teal-base transition-colors resize-none"
              />
              {errors.notes && (
                <span className="text-xs text-orange font-medium">{errors.notes.message}</span>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center justify-end gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={submitting}>
            {submitting ? "Scheduling..." : "Schedule Event"}
          </Button>
        </div>
      </form>
    </div>
  );
}

export default function NewRequestPage() {
  return (
    <Suspense fallback={<div className="p-20 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto text-teal-base" /></div>}>
      <NewRequestForm />
    </Suspense>
  );
}
