"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { intakeSchema, type IntakeFormData } from "@/lib/schemas/intake";
import { Input } from "@/components/shared/Input";
import { Select } from "@/components/shared/Select";
import { Button } from "@/components/shared/Button";
import { SuccessState } from "@/components/landing/SuccessState";
import { useSearchParams } from "next/navigation";
import { Check, ArrowRight, ArrowLeft, Quote, Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/Popover";
import { Calendar } from "@/components/ui/Calendar";
import { format } from "date-fns";

interface LeadFormProps {
  sectionData?: {
    headline?: string;
    subheadline?: string;
  };
}

export function LeadForm({ sectionData }: LeadFormProps) {
  const searchParams = useSearchParams();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [date, setDate] = useState<Date | undefined>(undefined);

  const headline = sectionData?.headline || "Get Your Custom Quote in 2 Hours.";
  const subheadline = sectionData?.subheadline || "Tell us about your event — group size, date, dietary needs. We respond within 2 hours with a custom quote. No commitment required.";

  const defaultNeed = searchParams.get("need");
  const preferredNeed = ["Breakfast", "Lunch", "Pastries"].includes(defaultNeed as string) ? defaultNeed : "Not Sure Yet";

  const {
    register,
    handleSubmit,
    trigger,
    reset,
    setValue,
    formState: { errors },
  } = useForm<IntakeFormData>({
    // @ts-expect-error zodResolver type mismatch
    resolver: zodResolver(intakeSchema),
    defaultValues: {
      cateringNeed: preferredNeed as IntakeFormData["cateringNeed"],
      source: searchParams.get("utm_source") || "direct",
      medium: searchParams.get("utm_medium") || "none",
      campaign: searchParams.get("utm_campaign") || "",
      notes: searchParams.get("membership") ? `Interested in membership: ${searchParams.get("membership")}` : "",
    },
  });

  const nextStep = async () => {
    // Validate fields for Step 1
    const fieldsToValidate = ["eventType", "cateringNeed", "estimatedGroupSize", "preferredDate"];
    const isValid = await trigger(fieldsToValidate as any);
    if (isValid) {
      setStep(2);
      window.scrollTo({ top: document.getElementById('book')?.offsetTop ? document.getElementById('book')!.offsetTop - 100 : 0, behavior: 'smooth' });
    }
  };

  const prevStep = () => setStep(1);

  const onSubmit = async (data: any) => {
    setIsSubmitting(true);
    setServerError(null);
    try {
      const response = await fetch("/api/catering-lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to submit request.");
      }

      setIsSuccess(true);
      reset();
    } catch (err: unknown) {
      const error = err as Error;
      setServerError(error.message || "Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
    <section id="book" className="bg-cream pt-4 pb-16 md:pt-10 md:pb-20 lg:pt-12 lg:pb-24 border-t border-gray-border">
        <div className="mx-auto max-w-4xl px-4 md:px-6">
          <SuccessState onReset={() => { setIsSuccess(false); setStep(1); }} />
        </div>
      </section>
    );
  }

  return (
    <section id="book" className="bg-cream pt-4 pb-16 md:pt-10 md:pb-20 lg:pt-12 lg:pb-24 border-t border-gray-border overflow-hidden">
      <div className="container-rig px-4 md:px-6">
        <div className="flex flex-col lg:flex-row gap-12 items-start">
          
          {/* Left Side: Context & Trust */}
          <div className="w-full lg:w-1/3 space-y-8">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold font-heading text-teal-dark mb-4 text-center lg:text-left">
                {headline}
              </h2>
              <p className="text-lg text-brown/80 text-center lg:text-left">
                {subheadline}
              </p>
            </div>

            <div className="hidden lg:block bg-teal-base/5 p-6 rounded-2xl border border-teal-base/10 relative">
              <Quote className="absolute -top-3 -left-3 w-8 h-8 text-teal-base opacity-20" />
              <p className="text-brown leading-relaxed italic mb-4">
                "Buddas is the only caterer we use now. They are literally setting up 20 minutes early every single time. Total lifesavers for our all-hands meetings."
              </p>
              <div className="flex items-center gap-3">
                <div>
                  <p className="text-sm font-bold text-teal-dark">Sarah J.</p>
                  <p className="text-xs text-brown/60">Office Manager, TechFlow</p>
                </div>
              </div>
            </div>

            <div className="space-y-4 pt-4 hidden lg:block">
               <div className="flex items-center gap-3 text-sm text-brown/70">
                 <div className="h-2 w-2 rounded-full bg-teal-base"></div>
                 <span>No deposit, no commitment</span>
               </div>
               <div className="flex items-center gap-3 text-sm text-brown/70">
                 <div className="h-2 w-2 rounded-full bg-teal-base"></div>
                 <span>Dietary needs? We've got you covered.</span>
               </div>
            </div>
          </div>

          <div className="w-full lg:w-2/3">
            <div className="bg-white p-4 sm:p-6 md:p-10 rounded-2xl md:rounded-3xl shadow-xl border border-gray-border relative">
              
              {/* Step Progress Bar */}
              <div className="flex items-center justify-between mb-8 md:mb-10 px-2">
                <div className="flex flex-col items-center gap-2 group cursor-pointer" onClick={() => step > 1 && setStep(1)}>
                  <div className={cn(
                    "h-11 w-11 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all",
                    step >= 1 ? "bg-teal-dark border-teal-dark text-white shadow-md shadow-teal-dark/20" : "bg-white border-gray-border text-brown/40"
                  )}>
                    {step > 1 ? <Check className="h-5 w-5" /> : "1"}
                  </div>
                  <span className={cn("text-[10px] md:text-xs font-bold uppercase tracking-wider", step >= 1 ? "text-teal-dark" : "text-brown/40")}>Event info</span>
                </div>
                <div className={cn("h-px flex-1 mx-2 md:mx-4 transition-colors", step > 1 ? "bg-teal-dark" : "bg-gray-border")}></div>
                <div className="flex flex-col items-center gap-2">
                  <div className={cn(
                    "h-11 w-11 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all",
                    step === 2 ? "bg-teal-dark border-teal-dark text-white shadow-md shadow-teal-dark/20" : "bg-white border-gray-border text-brown/40"
                  )}>
                    2
                  </div>
                  <span className={cn("text-[10px] md:text-xs font-bold uppercase tracking-wider", step === 2 ? "text-teal-dark" : "text-brown/40")}>Contact Details</span>
                </div>
              </div>

              {serverError && (
                <div className="mb-8 p-4 bg-orange/10 border border-orange/20 rounded-lg text-orange text-sm font-medium">
                  {serverError}
                </div>
              )}

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 md:space-y-8">
                
                {/* STEP 1: EVENT SCOPE */}
                {step === 1 && (
                  <div className="space-y-4 md:space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-teal-dark uppercase tracking-tight">Event Type <span className="text-orange">*</span></label>
                        <Select 
                          {...register("eventType")} 
                          options={[
                            { value: "Internal Meeting", label: "Internal Meeting" },
                            { value: "Client Pitch", label: "Client Pitch" },
                            { value: "Training Session", label: "Training Session" },
                            { value: "Holiday Party", label: "Holiday Party" },
                            { value: "Other", label: "Other" }
                          ]}
                          placeholder="Select Event Type"
                          error={errors.eventType?.message}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-teal-dark uppercase tracking-tight">Catering Need <span className="text-orange">*</span></label>
                        <Select 
                          {...register("cateringNeed")} 
                          options={[
                            { value: "Breakfast", label: "Breakfast & Meetings" },
                            { value: "Lunch", label: "All-Hands Lunch" },
                            { value: "Pastries", label: "Pastries & Rolls" },
                            { value: "Not Sure Yet", label: "Not sure yet — let's talk" }
                          ]}
                          error={errors.cateringNeed?.message}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-teal-dark uppercase tracking-tight">Est. Headcount <span className="text-orange">*</span></label>
                        <Input 
                          {...register("estimatedGroupSize", { valueAsNumber: true })} 
                          type="number" 
                          min="10"
                          placeholder="Minimum 10 guests" 
                          error={errors.estimatedGroupSize?.message} 
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-teal-dark uppercase tracking-tight">Preferred Date <span className="text-brown/50 font-normal normal-case italic">(Optional)</span></label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full justify-start text-left font-normal border-gray-border h-11",
                                !date && "text-brown/50"
                              )}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {date ? format(date, "PPP") : <span>Pick a date</span>}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={date}
                              onSelect={(newDate) => {
                                setDate(newDate);
                                setValue("preferredDate", newDate ? format(newDate, "yyyy-MM-dd") : "");
                              }}
                              disabled={(date) => date < new Date()}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        {errors.preferredDate?.message && (
                          <p className="text-xs font-medium text-orange mt-1">{errors.preferredDate.message}</p>
                        )}
                        <input type="hidden" {...register("preferredDate")} />
                      </div>
                    </div>

                    <div className="pt-4">
                      <Button type="button" size="lg" className="w-full flex items-center justify-center gap-2 group" onClick={nextStep}>
                        Next: Contact Details <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </Button>
                      <p className="text-xs text-center text-brown/60 mt-4">Step 1 of 2: Basic event scope</p>
                    </div>
                  </div>
                )}

                {/* STEP 2: CONTACT & DETAILS */}
                {step === 2 && (
                  <div className="space-y-4 md:space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-teal-dark uppercase tracking-tight">Full Name <span className="text-orange">*</span></label>
                        <Input 
                          {...register("name")} 
                          placeholder="Jane Smith" 
                          error={errors.name?.message} 
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-teal-dark uppercase tracking-tight">Company Name <span className="text-orange">*</span></label>
                        <Input 
                          {...register("company")} 
                          placeholder="Acme Corp" 
                          error={errors.company?.message} 
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-teal-dark uppercase tracking-tight">Work Email <span className="text-orange">*</span></label>
                        <Input 
                          {...register("email")} 
                          type="email" 
                          placeholder="jane@acmecorp.com" 
                          error={errors.email?.message} 
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-teal-dark uppercase tracking-tight">Phone Number <span className="text-orange">*</span></label>
                        <Input 
                          {...register("phone")} 
                          type="tel" 
                          placeholder="(555) 123-4567" 
                          error={errors.phone?.message} 
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-teal-dark uppercase tracking-tight">Notes or Dietary Needs <span className="text-brown/50 font-normal normal-case italic">(Optional)</span></label>
                      <textarea 
                        {...register("notes")} 
                        rows={3}
                        className={cn(
                          "flex w-full rounded-lg border bg-white px-3 py-2 text-sm text-brown placeholder:text-brown/50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 resize-y",
                          errors.notes ? 'border-orange focus-visible:ring-orange' : 'border-gray-border focus-visible:ring-teal-base focus-visible:border-teal-base'
                        )}
                        placeholder="Dietary restrictions, budget constraints, or setup requests..."
                      />
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 pt-4">
                      <Button type="button" variant="outline" size="lg" className="flex-1 flex items-center justify-center gap-2" onClick={prevStep}>
                        <ArrowLeft className="h-4 w-4" /> Back
                      </Button>
                      <Button 
                        type="submit" 
                        size="lg" 
                        className="flex-[2] transition-all" 
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? "Sending..." : "Get My Free Quote"}
                      </Button>
                    </div>
                    <p className="text-xs text-center text-brown/60 mt-4">
                      No commitment required. We reply within 2 business hours.
                    </p>
                  </div>
                )}

              </form>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
