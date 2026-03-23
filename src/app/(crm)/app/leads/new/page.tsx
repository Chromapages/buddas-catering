"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Input } from "@/components/shared/Input";
import { Select } from "@/components/shared/Select";
import { Button } from "@/components/shared/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/shared/Card";
import toast from "react-hot-toast";

const newLeadSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  company: z.string().min(2, "Company name must be at least 2 characters."),
  email: z.string().email("Please enter a valid email address."),
  phone: z.string().min(10, "Please enter a valid phone number."),
  eventType: z.string().min(1, "Please enter an event type."),
  cateringNeed: z.enum(["Breakfast", "Lunch", "Pastries", "Not Sure Yet"]),
  estimatedGroupSize: z.number().int().min(10, "Group size must be at least 10."),
  preferredDate: z.string().optional(),
  notes: z.string().max(500).optional(),
  source: z.string().min(1, "Please select a source."),
});

type NewLeadFormData = z.infer<typeof newLeadSchema>;

const CATERING_NEED_OPTIONS = [
  { value: "Breakfast", label: "Breakfast" },
  { value: "Lunch", label: "Lunch" },
  { value: "Pastries", label: "Pastries" },
  { value: "Not Sure Yet", label: "Not Sure Yet" },
];

const SOURCE_OPTIONS = [
  { value: "crm_manual", label: "Manual Entry (CRM)" },
  { value: "referral", label: "Referral" },
  { value: "cold_call", label: "Cold Call" },
  { value: "event", label: "Event / Trade Show" },
  { value: "direct", label: "Direct / Walk-in" },
  { value: "other", label: "Other" },
];

export default function NewLeadPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<NewLeadFormData>({
    resolver: zodResolver(newLeadSchema),
    defaultValues: {
      cateringNeed: "Not Sure Yet",
      source: "crm_manual",
    },
  });

  const onSubmit = async (data: NewLeadFormData) => {
    setSubmitting(true);
    try {
      const res = await fetch("/api/catering-lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          medium: "internal",
          campaign: "",
          content: "",
          refCode: "",
          landingPageSlug: "",
          referringUrl: "",
        }),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.error || "Submission failed.");
      }

      toast.success("Lead created successfully.");
      router.push("/app/leads");
    } catch (err: any) {
      toast.error(err.message || "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-6 lg:p-8 max-w-3xl">
      <div className="mb-6">
        <Link
          href="/app/leads"
          className="inline-flex items-center gap-1.5 text-sm text-brown/60 hover:text-brown transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Leads
        </Link>
        <h1 className="text-2xl font-bold font-heading text-teal-dark">New Lead</h1>
        <p className="text-sm text-brown/70 mt-1">
          Manually add a lead. Existing contacts will be matched by email.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Contact Info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-brown mb-1">
                Full Name <span className="text-orange">*</span>
              </label>
              <Input
                {...register("name")}
                placeholder="Jane Smith"
                error={errors.name?.message}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-brown mb-1">
                Company <span className="text-orange">*</span>
              </label>
              <Input
                {...register("company")}
                placeholder="Acme Corporation"
                error={errors.company?.message}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-brown mb-1">
                Email <span className="text-orange">*</span>
              </label>
              <Input
                {...register("email")}
                type="email"
                placeholder="jane@acme.com"
                error={errors.email?.message}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-brown mb-1">
                Phone <span className="text-orange">*</span>
              </label>
              <Input
                {...register("phone")}
                type="tel"
                placeholder="801-555-0100"
                error={errors.phone?.message}
              />
            </div>
          </CardContent>
        </Card>

        {/* Event Details */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Event Details</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-brown mb-1">
                Event Type <span className="text-orange">*</span>
              </label>
              <Input
                {...register("eventType")}
                placeholder="e.g. Company Lunch, Team Meeting"
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
                placeholder="50"
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
              <label className="block text-sm font-medium text-brown mb-1">Notes</label>
              <textarea
                {...register("notes")}
                rows={3}
                placeholder="Any additional details about the request..."
                className="flex w-full rounded-lg border border-gray-border bg-white px-3 py-2 text-sm text-brown placeholder:text-brown/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-base focus-visible:border-teal-base transition-colors resize-none"
              />
              {errors.notes && (
                <span className="text-xs text-orange font-medium">{errors.notes.message}</span>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Attribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Attribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="max-w-xs">
              <label className="block text-sm font-medium text-brown mb-1">Lead Source</label>
              <Select
                {...register("source")}
                options={SOURCE_OPTIONS}
                error={errors.source?.message}
              />
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/app/leads")}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={submitting}>
            {submitting ? "Creating..." : "Create Lead"}
          </Button>
        </div>
      </form>
    </div>
  );
}
