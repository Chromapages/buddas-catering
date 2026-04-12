"use client";

import { CateringRequest } from "@/types/crm";
import { 
  MoreHorizontal, 
  TrendingUp, 
  ArrowUpRight 
} from "lucide-react";
import { motion } from "framer-motion";
import { format } from "date-fns";

interface InteractionHistoryProps {
  requests: CateringRequest[];
}

const getStatusStyles = (status: string) => {
  switch (status.toLowerCase()) {
    case "pending": return "bg-orange-500 shadow-orange-500/20";
    case "confirmed": return "bg-deal-blue shadow-deal-blue/20";
    case "fulfilled": return "bg-teal-base shadow-teal-base/20";
    case "cancelled": return "bg-red-500 shadow-red-500/20";
    default: return "bg-gray-400 shadow-gray-400/20";
  }
};

const InteractionRow = ({ 
  request, 
  index 
}: { 
  request: CateringRequest, 
  index: number 
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ scale: 1.01 }}
      className="group flex items-center justify-between p-4 bg-white/40 dark:bg-white/5 backdrop-blur-sm border border-white/20 dark:border-teal-base/10 rounded-lg transition-all cursor-pointer shadow-sm hover:shadow-md hover:bg-white/60 dark:hover:bg-white/10"
    >
      <div className="flex items-center gap-4">
        {/* Status Indicator */}
        <div className="relative">
          <div className={`w-2.5 h-2.5 rounded-full ${getStatusStyles(request.fulfillmentStatus)} animate-pulse shadow-lg`} />
        </div>

        {/* Info */}
        <div className="flex flex-col">
          <span className="text-[11px] font-heading font-medium text-teal-base/50 dark:text-teal-base uppercase tracking-widest leading-none mb-1">
            {request.preferredDate ? format(new Date(request.preferredDate), 'EEE, MMM d') : 'Pending Date'}
          </span>
          <h3 className="text-[15px] font-heading font-medium text-teal-dark dark:text-brown leading-tight group-hover:text-teal-base transition-colors">
            {request.cateringNeed || "Catering Opportunity"}
          </h3>
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="text-right">
          <span className="text-[10px] block text-brown/40 dark:text-white/40 font-heading uppercase tracking-widest mb-0.5">EST. QUOTE</span>
          <span className="text-base font-heading font-semibold text-teal-dark dark:text-brown">
            ${request.quoteAmount?.toLocaleString() || "0"}
          </span>
        </div>
        
        <button className="p-2 rounded-xl bg-teal-base/5 text-teal-base opacity-0 group-hover:opacity-100 transition-all transform group-hover:translate-x-1">
          <ArrowUpRight className="w-5 h-5" />
        </button>
      </div>
    </motion.div>
  );
};

export const InteractionHistory = ({ requests }: InteractionHistoryProps) => {
  // Sort by date - most recent first
  const sortedRequests = [...requests].sort((a, b) => {
    const dateA = a.preferredDate ? new Date(a.preferredDate).getTime() : 0;
    const dateB = b.preferredDate ? new Date(b.preferredDate).getTime() : 0;
    return dateB - dateA;
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-2">
        <h2 className="text-xl font-heading font-medium text-teal-dark">Recent Interactions</h2>
        <div className="flex gap-2">
          <button className="text-xs font-heading font-medium text-teal-base hover:text-teal-dark transition-all px-3 py-1.5 rounded-full bg-teal-base/5">
            View All Activity
          </button>
        </div>
      </div>
      
      <div className="flex flex-col gap-3">
        {sortedRequests.length > 0 ? (
          sortedRequests.map((request, idx) => (
            <InteractionRow 
              key={request.id} 
              request={request} 
              index={idx}
            />
          ))
        ) : (
          <div className="p-12 border-2 border-dashed border-teal-base/10 rounded-lg flex flex-col items-center justify-center text-center">
            <TrendingUp className="w-8 h-8 text-teal-base/20 mb-3" />
            <p className="text-sm font-body text-brown/40">No recent interactions found for this contact.</p>
          </div>
        )}
      </div>
    </div>
  );
};
