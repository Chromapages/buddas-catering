"use client";

import { 
  BarChart3, 
  ChevronRight, 
  LayoutGrid, 
  CircleDot 
} from "lucide-react";
import { motion } from "framer-motion";

import { CateringRequest } from "@/types/crm";
import { useMemo } from "react";

interface StageFunnelProps {
  requests: CateringRequest[];
}

export const StageFunnel = ({ requests }: StageFunnelProps) => {
  const dynamicStages = useMemo(() => {
    const counts = {
      qualification: requests.filter(r => r.fulfillmentStatus === 'Pending').reduce((sum, r) => sum + (r.quoteAmount || 0), 0),
      proposal: requests.filter(r => r.fulfillmentStatus === 'Confirmed').reduce((sum, r) => sum + (r.quoteAmount || 0), 0),
      fulfillment: requests.filter(r => r.fulfillmentStatus === 'Fulfilled' || r.fulfillmentStatus === 'Invoiced').reduce((sum, r) => sum + (r.quoteAmount || 0), 0),
      payment: requests.filter(r => r.fulfillmentStatus === 'Paid').reduce((sum, r) => sum + (r.quoteAmount || 0), 0),
    };

    const total = Object.values(counts).reduce((a, b) => a + b, 0);

    return {
      total,
      items: [
        { id: "qualification", label: "Qualification", amount: counts.qualification, icon: CircleDot, active: counts.qualification > 0 && counts.proposal === 0 },
        { id: "proposal", label: "Proposal", amount: counts.proposal, icon: CircleDot, active: counts.proposal > 0 && counts.fulfillment === 0 },
        { id: "fulfillment", label: "Fulfillment", amount: counts.fulfillment, icon: CircleDot, active: counts.fulfillment > 0 && counts.payment === 0 },
        { id: "payment", label: "Payment", amount: counts.payment, icon: CircleDot, active: counts.payment > 0 },
      ]
    };
  }, [requests]);

  const funnelItems = dynamicStages.total > 0 ? dynamicStages.items : [
    { id: "qualification", label: "Qualification", amount: 0, icon: CircleDot, active: false },
    { id: "proposal", label: "Proposal", amount: 0, icon: CircleDot, active: false },
    { id: "fulfillment", label: "Fulfillment", amount: 0, icon: CircleDot, active: false },
    { id: "payment", label: "Payment", amount: 0, icon: CircleDot, active: false },
  ];

  const totalDisplay = dynamicStages.total;

  return (
    <div className="p-6 bg-glass rounded-[24px] shadow-glass border border-white/30 h-full w-full space-y-6">
      <div className="flex items-center justify-between px-2">
        <div className="space-y-1">
          <h2 className="text-xl font-heading font-medium text-teal-dark">Stage Funnel</h2>
          <p className="text-xs font-body text-brown/40">${totalDisplay.toLocaleString()} Total in Pipeline</p>
        </div>
        <div className="flex bg-white/50 dark:bg-white/5 p-1 rounded-full border border-white/80 dark:border-teal-base/10 backdrop-blur-md">
          <button className="px-3 py-1.5 text-[10px] font-medium bg-teal-dark dark:bg-teal-base dark:text-teal-dark text-white rounded-full">Weighted</button>
          <button className="px-3 py-1.5 text-[10px] font-medium text-brown/40 dark:text-brown/40">Total</button>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {funnelItems.map((stage, idx) => (
          <motion.div
            key={stage.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.1 }}
            className={`
              relative p-5 rounded-lg border transition-all duration-300 group
              ${stage.active ? 'bg-white dark:bg-teal-base/10 shadow-lg border-teal-base/20' : 'bg-white/30 dark:bg-white/5 border-white/20 dark:border-white/5 hover:bg-white/50 dark:hover:bg-white/10'}
            `}
          >
            <div className="flex items-center justify-between relative z-10">
              <div className="flex items-center gap-4">
                <div className={`p-2 rounded-xl transition-all ${stage.active ? 'bg-teal-dark text-white dark:bg-teal-base dark:text-teal-dark' : 'bg-white dark:bg-white/10 text-brown/30 dark:text-white/30 group-hover:text-teal-dark dark:group-hover:text-teal-base'}`}>
                  <stage.icon className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-heading font-medium text-brown/40 dark:text-white/40 group-hover:text-teal-dark dark:group-hover:text-teal-base uppercase tracking-widest">{stage.label}</h4>
                  <span className={`text-lg font-heading font-medium block mt-0.5 ${stage.active ? 'text-teal-dark dark:text-teal-base' : 'text-brown/30 dark:text-white/30'}`}>
                    ${stage.amount.toLocaleString()}
                  </span>
                </div>
              </div>
              
              <div className={`p-2 rounded-full border transition-all ${stage.active ? 'bg-teal-base/10 border-teal-base/20 text-teal-dark dark:text-teal-base scale-110' : 'bg-white/40 dark:bg-white/5 border-white dark:border-white/10 text-brown/20 dark:text-white/20 opacity-0 group-hover:opacity-100'}`}>
                <ChevronRight className="w-4 h-4" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
