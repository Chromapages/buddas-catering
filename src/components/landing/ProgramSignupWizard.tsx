"use client";

import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { useSearchParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, ChevronRight, Loader2, ArrowLeft, Calendar, Zap } from "lucide-react";
import { programSignupSchema, type ProgramSignupFormData } from "@/lib/schemas/programSignup";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/shared/Badge";
import { Button } from "@/components/shared/Button";

const STEPS = [
  { id: "business", title: "Business Info" },
  { id: "orgType", title: "Organization" },
  { id: "tier", title: "Program Tier" },
  { id: "needs", title: "Catering Needs" },
];

const ORG_TYPES = [
  "Technology / Software",
  "Healthcare / Medical",
  "Finance / Accounting",
  "Legal / Professional Services",
  "Real Estate / Construction",
  "Manufacturing / Logistics",
  "Education / Non-Profit",
  "Other",
];

const TIERS = [
  {
    id: "2_events",
    title: "Starter Tier",
    events: "2 events per year",
    discount: "10% Off",
    description: "Perfect for teams that host occasional all-hands or quarterly offsites.",
    badge: "Most Accessible",
  },
  {
    id: "4_events",
    title: "Growth Tier",
    events: "4 events per year",
    discount: "15% Off",
    description: "Ideal for growing offices with regular board meetings or monthly socials.",
    badge: "Most Popular",
  },
  {
    id: "6_events",
    title: "Enterprise Tier",
    events: "6+ events per year",
    discount: "20% Off",
    description: "For established teams that need reliable catering for frequent large gatherings.",
    badge: "Best Value",
  },
];

export function ProgramSignupWizard() {
  const searchParams = useSearchParams();
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    control,
    trigger,
    watch,
    formState: { errors, isValid },
  } = useForm<ProgramSignupFormData>({
    resolver: zodResolver(programSignupSchema),
    mode: "onTouched",
    defaultValues: {
      preferredContactMethod: "Email",
      deliveryOrPickup: "Delivery",
      interestedIn: [],
      typicalEventTypes: [],
      preferredMenuItems: [],
      dietaryRestrictions: [],
      programTier: searchParams.get("tier") === "10" ? "2_events" : 
                   searchParams.get("tier") === "15" ? "4_events" : 
                   searchParams.get("tier") === "20" ? "6_events" : undefined as any
    },
  });

  // Jump to step 3 if tier is pre-selected? No, better to start at step 0 for business info.

  const nextStep = async () => {
    // Determine which fields to validate based on the current step
    let fieldsToValidate: (keyof ProgramSignupFormData)[] = [];
    if (currentStep === 0) {
      fieldsToValidate = ["email", "contactName", "phone", "businessName", "jobTitle", "address", "city", "zipCode", "preferredContactMethod"];
    } else if (currentStep === 1) {
      fieldsToValidate = ["organizationType"];
    } else if (currentStep === 2) {
      fieldsToValidate = ["programTier"];
    }

    const isStepValid = await trigger(fieldsToValidate);
    if (isStepValid) {
      setCurrentStep((prev) => Math.min(prev + 1, STEPS.length - 1));
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const onSubmit = async (data: ProgramSignupFormData) => {
    setIsSubmitting(true);
    setServerError("");

    try {
      const response = await fetch("/api/corporate-signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to submit application.");
      }

      setIsSuccess(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err: any) {
      setServerError(err.message || "Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-24 text-center animate-in fade-in zoom-in duration-700">
        <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-teal-base/20 text-teal-dark mb-8 shadow-inner relative">
          <div className="absolute inset-0 rounded-full border-2 border-teal-base/30 animate-ping opacity-20"></div>
          <CheckCircle2 className="w-12 h-12" />
        </div>
        
        <div className="mb-12">
          <Badge variant="warning" className="mb-4 bg-gold/10 text-gold border-gold/20 px-4 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase">
            New Partner Application
          </Badge>
          <h1 className="text-4xl md:text-5xl font-heading font-bold text-brown mb-4 tracking-tight">Application Received!</h1>
          <p className="text-lg text-brown/70 max-w-2xl mx-auto leading-relaxed">
            Thank you for applying to the Buddas Corporate Program. You&apos;re one step away from unlocking premium catering perks.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch max-w-5xl mx-auto">
          {/* Scheduling Card */}
          <div className="bg-teal-dark text-white rounded-3xl shadow-2xl p-8 md:p-10 text-left flex flex-col justify-between relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-150 duration-700"></div>
            
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full text-[10px] font-bold uppercase tracking-wider mb-6">
                <Zap className="w-3 h-3 text-gold" />
                Priority Activation
              </div>
              <h2 className="text-2xl md:text-3xl font-bold mb-4 font-heading">Skip the queue.</h2>
              <p className="text-white/80 mb-8 leading-relaxed">
                Schedule your 5-minute kickoff call now to activate your account and start ordering today.
              </p>
            </div>
            
            <div className="space-y-4">
              <Button 
                size="lg" 
                className="w-full bg-orange hover:bg-orange/90 text-white border-none py-6 text-lg shadow-lg group/btn"
                asChild
              >
                <a 
                  href="https://calendly.com/buddas-catering/discovery" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-3"
                >
                  <Calendar className="w-5 h-5" />
                  Schedule Kickoff Call
                  <ChevronRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
                </a>
              </Button>
              <p className="text-center text-xs text-white/40 font-medium">No account needed to schedule</p>
            </div>
          </div>

          {/* Social Proof & Next Steps */}
          <div className="bg-white rounded-3xl shadow-sm border border-gray-border p-8 md:p-10 text-left flex flex-col">
            <h2 className="text-xl font-bold text-brown mb-8 flex items-center gap-2">
               What happens next?
            </h2>
            
            <div className="space-y-8 flex-grow">
              <div className="flex gap-4 group">
                <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-teal-base/10 text-teal-dark flex items-center justify-center font-bold transition-colors group-hover:bg-teal-base/20">1</div>
                <div>
                  <h3 className="font-bold text-brown">Review & Approval</h3>
                  <p className="text-brown/60 text-sm mt-1 leading-relaxed">Our managers are reviewing your application for the {TIERS.find(t => t.id === watch("programTier"))?.title || "selected tier"}.</p>
                </div>
              </div>
              
              <div className="flex gap-4 group opacity-60">
                <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gray-bg text-brown/50 flex items-center justify-center font-bold transition-colors group-hover:bg-gray-bg/80">2</div>
                <div>
                  <h3 className="font-bold text-brown">Quick Sync</h3>
                  <p className="text-brown/60 text-sm mt-1 leading-relaxed">We&apos;ll confirm your delivery zones and preferred menu items on our quick sync.</p>
                </div>
              </div>
              
              <div className="flex gap-4 group opacity-60">
                <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gray-bg text-brown/50 flex items-center justify-center font-bold transition-colors group-hover:bg-gray-bg/80">3</div>
                <div>
                  <h3 className="font-bold text-brown">Portal Access</h3>
                  <p className="text-brown/60 text-sm mt-1 leading-relaxed">Once verified, you&apos;ll get the keys to your custom booking dashboard.</p>
                </div>
              </div>
            </div>

            <div className="mt-12 pt-8 border-t border-gray-border flex items-center gap-4">
              <div className="flex -space-x-3 overflow-hidden">
                {[1,2,3,4].map(i => (
                  <div key={i} className="inline-block h-8 w-8 rounded-full ring-2 ring-white bg-gray-200"></div>
                ))}
              </div>
              <p className="text-xs font-bold text-brown/40 uppercase tracking-widest">Join 50+ local Utah companies</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const currentTier = watch("programTier");

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 md:py-24">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-heading font-bold text-brown mb-4">
          Corporate Catering Program
        </h1>
        <p className="text-lg text-brown/80 max-w-2xl mx-auto">
          Lock in exclusive discounts, priority delivery, and a dedicated account manager by committing to a yearly catering volume.
        </p>
      </div>

      {/* Progress Bar */}
      <div className="mb-12">
        <div className="flex items-center justify-between relative">
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-gray-border -z-10 rounded-full"></div>
          <div 
            className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-teal-dark -z-10 rounded-full transition-all duration-300 ease-in-out"
            style={{ width: `${(currentStep / (STEPS.length - 1)) * 100}%` }}
          ></div>
          
          {STEPS.map((step, index) => {
            const isCompleted = index < currentStep;
            const isCurrent = index === currentStep;
            return (
              <div key={step.id} className="flex flex-col items-center">
                <div 
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors shadow-sm",
                    isCompleted ? "bg-teal-dark text-white border-none" : 
                    isCurrent ? "bg-white text-teal-dark border-2 border-teal-dark" : 
                    "bg-white text-brown/40 border border-gray-border"
                  )}
                >
                  {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : index + 1}
                </div>
                <span className={cn(
                  "text-xs font-medium mt-2 absolute -bottom-6 w-24 text-center",
                  isCurrent || isCompleted ? "text-brown" : "text-brown/40"
                )}>
                  {step.title}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Form Container */}
      <div className="bg-white rounded-3xl shadow-lg border border-gray-border p-6 md:p-12 mt-16">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          
          {/* STEP 1: BUSINESS INFO */}
          {currentStep === 0 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="border-b border-gray-border pb-4 mb-6">
                <h2 className="text-2xl font-bold text-brown">Step 1: Your Details</h2>
                <p className="text-brown/70">Let's start with the basics.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2 col-span-1 md:col-span-2">
                  <label className="text-sm font-bold text-brown">Email Address *</label>
                  <input
                    {...register("email")}
                    type="email"
                    placeholder="you@company.com"
                    className="w-full px-4 py-3 rounded-xl border border-gray-border focus:border-teal-dark focus:ring-1 focus:ring-teal-dark outline-none transition-colors"
                  />
                  {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-brown">Full Name *</label>
                  <input
                    {...register("contactName")}
                    type="text"
                    placeholder="Jane Doe"
                    className="w-full px-4 py-3 rounded-xl border border-gray-border focus:border-teal-dark focus:ring-1 focus:ring-teal-dark outline-none transition-colors"
                  />
                  {errors.contactName && <p className="text-sm text-red-500">{errors.contactName.message}</p>}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-brown">Phone Number *</label>
                  <input
                    {...register("phone")}
                    type="tel"
                    placeholder="(801) 555-0123"
                    className="w-full px-4 py-3 rounded-xl border border-gray-border focus:border-teal-dark focus:ring-1 focus:ring-teal-dark outline-none transition-colors"
                  />
                  {errors.phone && <p className="text-sm text-red-500">{errors.phone.message}</p>}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-brown">Job Title</label>
                  <input
                    {...register("jobTitle")}
                    type="text"
                    placeholder="Office Manager, HR, etc."
                    className="w-full px-4 py-3 rounded-xl border border-gray-border focus:border-teal-dark focus:ring-1 focus:ring-teal-dark outline-none transition-colors"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-brown">Company Name *</label>
                  <input
                    {...register("businessName")}
                    type="text"
                    placeholder="Acme Corp"
                    className="w-full px-4 py-3 rounded-xl border border-gray-border focus:border-teal-dark focus:ring-1 focus:ring-teal-dark outline-none transition-colors"
                  />
                  {errors.businessName && <p className="text-sm text-red-500">{errors.businessName.message}</p>}
                </div>
              </div>

              <div className="pt-4 border-t border-gray-border">
                <p className="text-sm font-bold text-brown mb-3">Preferred Contact Method *</p>
                <div className="flex flex-wrap gap-4">
                  {["Email", "Call", "Text"].map((method) => (
                    <label key={method} className="flex items-center gap-2 cursor-pointer group">
                      <input
                        {...register("preferredContactMethod")}
                        type="radio"
                        value={method}
                        className="w-4 h-4 text-teal-dark focus:ring-teal-dark border-gray-border"
                      />
                      <span className="text-brown group-hover:text-teal-dark transition-colors">{method}</span>
                    </label>
                  ))}
                </div>
                {errors.preferredContactMethod && <p className="text-sm text-red-500 mt-2">{errors.preferredContactMethod.message}</p>}
              </div>
            </div>
          )}

          {/* STEP 2: ORG TYPE */}
          {currentStep === 1 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-500">
              <div className="border-b border-gray-border pb-4 mb-6">
                <h2 className="text-2xl font-bold text-brown">Step 2: Organization Type</h2>
                <p className="text-brown/70">What industry are you in? This helps us suggest the best menus.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {ORG_TYPES.map((type) => (
                  <label 
                    key={type} 
                    className="flex items-center p-4 border border-gray-border rounded-xl cursor-pointer hover:border-teal-dark hover:bg-teal-base/5 transition-all group has-[:checked]:border-teal-dark has-[:checked]:bg-teal-base/10"
                  >
                    <input
                      {...register("organizationType")}
                      type="radio"
                      value={type}
                      className="w-5 h-5 text-teal-dark focus:ring-teal-dark border-gray-border mt-0.5"
                    />
                    <span className="ml-3 font-medium text-brown group-hover:text-teal-dark transition-colors">{type}</span>
                  </label>
                ))}
              </div>
              {errors.organizationType && <p className="text-sm text-red-500">{errors.organizationType.message}</p>}
            </div>
          )}

          {/* STEP 3: TIER SELECTION */}
          {currentStep === 2 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-500">
              <div className="border-b border-gray-border pb-4 mb-6">
                <h2 className="text-2xl font-bold text-brown">Step 3: Choose Your Program</h2>
                <p className="text-brown/70">Select the tier that best matches your expected yearly catering volume.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {TIERS.map((tier) => (
                  <label 
                    key={tier.id}
                    className="relative flex flex-col p-6 border-2 border-gray-border rounded-2xl cursor-pointer hover:border-teal-dark hover:shadow-md transition-all has-[:checked]:border-teal-dark has-[:checked]:bg-teal-base/5 has-[:checked]:ring-1 has-[:checked]:ring-teal-dark"
                  >
                    <input
                      {...register("programTier")}
                      type="radio"
                      value={tier.id}
                      className="sr-only"
                    />
                    
                    {tier.badge && (
                      <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-orange text-white text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap">
                        {tier.badge}
                      </span>
                    )}
                    
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-heading font-bold text-xl text-brown">{tier.title}</h3>
                        <p className="text-teal-dark font-bold mt-1">{tier.events}</p>
                      </div>
                      <div className={cn(
                        "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors",
                        currentTier === tier.id ? "border-teal-dark bg-teal-dark text-white" : "border-gray-border bg-white"
                      )}>
                        {currentTier === tier.id && <CheckCircle2 className="w-4 h-4" />}
                      </div>
                    </div>
                    
                    <div className="text-3xl font-black text-brown mb-4">
                      {tier.discount}
                    </div>
                    
                    <p className="text-sm text-brown/70 leading-relaxed mt-auto">
                      {tier.description}
                    </p>
                  </label>
                ))}
              </div>
              {errors.programTier && <p className="text-sm text-red-500 text-center">{errors.programTier.message}</p>}
            </div>
          )}

          {/* STEP 4: CATERING NEEDS */}
          {currentStep === 3 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-8 duration-500">
              <div className="border-b border-gray-border pb-4 mb-6">
                <h2 className="text-2xl font-bold text-brown">Step 4: Catering Needs</h2>
                <p className="text-brown/70">Tell us how you typically order so we can prepare your custom portal.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Group Size */}
                <div className="space-y-2">
                  <label className="text-sm font-bold text-brown">Estimated Group Size (Average) *</label>
                  <select
                    {...register("estimatedGroupSize")}
                    className="w-full px-4 py-3 rounded-xl border border-gray-border focus:border-teal-dark focus:ring-1 focus:ring-teal-dark outline-none transition-colors bg-white"
                  >
                    <option value="">Select size...</option>
                    <option value="10-25">10 - 25 people</option>
                    <option value="26-50">26 - 50 people</option>
                    <option value="51-100">51 - 100 people</option>
                    <option value="100+">100+ people</option>
                  </select>
                  {errors.estimatedGroupSize && <p className="text-sm text-red-500">{errors.estimatedGroupSize.message}</p>}
                </div>

                {/* Delivery */}
                <div className="space-y-2">
                  <label className="text-sm font-bold text-brown">Delivery or Pickup? *</label>
                  <div className="flex gap-4 h-12">
                    {["Delivery", "Pickup", "Both"].map((o) => (
                      <label key={o} className="flex-1 flex items-center justify-center gap-2 border border-gray-border rounded-xl cursor-pointer hover:border-teal-dark has-[:checked]:border-teal-dark has-[:checked]:bg-teal-base/10 text-sm font-medium text-brown">
                        <input {...register("deliveryOrPickup")} type="radio" value={o} className="sr-only" />
                        {o}
                      </label>
                    ))}
                  </div>
                  {errors.deliveryOrPickup && <p className="text-sm text-red-500">{errors.deliveryOrPickup.message}</p>}
                </div>

                {/* Event Types (Checkboxes) */}
                <div className="space-y-3 col-span-1 md:col-span-2">
                  <label className="text-sm font-bold text-brown">Typical Event Types * <span className="text-brown/50 font-normal">(check all that apply)</span></label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {["Team Breakfasts", "Lunch & Learns", "Board Meetings", "Monthly Socials", "Client Pitches", "Holiday Parties", "Training Days", "Other"].map(type => (
                      <label key={type} className="flex items-start gap-2 cursor-pointer group">
                        <input {...register("typicalEventTypes")} type="checkbox" value={type} className="mt-1 rounded text-teal-dark focus:ring-teal-dark border-gray-border" />
                        <span className="text-sm text-brown leading-tight">{type}</span>
                      </label>
                    ))}
                  </div>
                  {errors.typicalEventTypes && <p className="text-sm text-red-500">{errors.typicalEventTypes.message}</p>}
                </div>

                {/* Menu Interests */}
                <div className="space-y-3 col-span-1 md:col-span-2">
                  <label className="text-sm font-bold text-brown">Interested In * <span className="text-brown/50 font-normal">(check all that apply)</span></label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {["Hot Breakfast", "Pastry Platters", "Boxed Lunches", "Taco Bar", "Sandwich Platters", "Salad Bowls", "Coffee Boxes", "Desserts"].map(item => (
                      <label key={item} className="flex items-start gap-2 cursor-pointer group">
                        <input {...register("interestedIn")} type="checkbox" value={item} className="mt-1 rounded text-teal-dark focus:ring-teal-dark border-gray-border" />
                        <span className="text-sm text-brown leading-tight">{item}</span>
                      </label>
                    ))}
                  </div>
                  {errors.interestedIn && <p className="text-sm text-red-500">{errors.interestedIn.message}</p>}
                </div>

                {/* Notes */}
                <div className="space-y-2 col-span-1 md:col-span-2 pt-4 border-t border-gray-border">
                  <label className="text-sm font-bold text-brown">Additional Notes or Dietary Needs</label>
                  <textarea
                    {...register("additionalNotes")}
                    rows={3}
                    placeholder="We have 3 glowing vegans and a severe peanut allergy..."
                    className="w-full px-4 py-3 rounded-xl border border-gray-border focus:border-teal-dark focus:ring-1 focus:ring-teal-dark outline-none transition-colors resize-none"
                  ></textarea>
                </div>
              </div>
            </div>
          )}

          {serverError && (
            <div className="p-4 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm font-medium">
              {serverError}
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between pt-8 border-t border-gray-border mt-8">
            {currentStep > 0 ? (
              <button
                type="button"
                onClick={prevStep}
                className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-brown/70 hover:bg-gray-bg transition-colors"
                disabled={isSubmitting}
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>
            ) : (
              <div></div> // Spacing
            )}

            {currentStep < STEPS.length - 1 ? (
              <button
                type="button"
                onClick={nextStep}
                className="flex items-center gap-2 px-8 py-3 rounded-xl font-bold bg-teal-dark text-white hover:bg-teal-dark/90 transition-colors shadow-sm"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center justify-center gap-2 w-full md:w-auto px-10 py-4 rounded-xl font-bold bg-orange text-white hover:bg-[#e06612] transition-colors shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Submitting Application...
                  </>
                ) : (
                  <>
                    Enroll in Program
                    <ChevronRight className="w-5 h-5" />
                  </>
                )}
              </button>
            )}
          </div>

        </form>
      </div>
    </div>
  );
}
