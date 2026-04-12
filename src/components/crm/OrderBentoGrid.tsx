"use client";

import React from 'react';
import { 
  Package, 
  Calendar, 
  ChevronRight,
  User,
  Clock,
  CircleDollarSign,
  ArrowUpRight,
  ClipboardCheck,
  Truck
} from 'lucide-react';
import { cn } from "@/lib/utils";
import { EnhancedOrder } from "@/lib/firebase/services/order.service";
import { Badge } from "@/components/shared/Badge";
import { format } from "date-fns";

interface OrderBentoGridProps {
  orders: EnhancedOrder[];
  onSelect: (order: EnhancedOrder) => void;
}

export function OrderBentoGrid({ orders, onSelect }: OrderBentoGridProps) {
  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed': return <ClipboardCheck size={20} />;
      case 'fulfilled':
      case 'delivered': return <Truck size={20} />;
      default: return <Clock size={20} />;
    }
  };

  const statusColors: Record<string, string> = {
    'Pending': 'bg-accent-heat/10 text-accent-heat border-accent-heat/20',
    'Confirmed': 'bg-accent-fresh/10 text-accent-fresh border-accent-fresh/20',
    'Fulfilled': 'bg-chef-charcoal text-white border-transparent',
    'Invoiced': 'bg-gold/10 text-gold border-gold/20',
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {orders.map((order) => (
        <div 
          key={order.id}
          onClick={() => onSelect(order)}
          className="group relative bg-white rounded-[40px] border border-chef-charcoal/5 shadow-soft-low hover:shadow-soft-mid transition-all duration-700 cursor-pointer overflow-hidden active:scale-[0.98] flex flex-col h-full"
        >
          {/* Action Overlay */}
          <div className="absolute top-8 right-8 h-10 w-10 rounded-full bg-chef-prep/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-20">
            <ArrowUpRight size={18} className="text-chef-charcoal" />
          </div>

          <div className="p-8 pb-0 relative z-10 flex items-start gap-4">
            <div className={cn(
              "h-16 w-16 rounded-[24px] flex items-center justify-center shadow-soft-low transition-transform duration-700 group-hover:scale-110",
              order.fulfillmentStatus === 'Fulfilled' ? "bg-chef-charcoal text-white" : "bg-chef-prep text-chef-muted"
            )}>
              {getStatusIcon(order.fulfillmentStatus || 'Pending')}
            </div>
            <div className="flex-1 space-y-1">
              <div className="flex items-center justify-between">
                <Badge className={cn("font-black text-[9px] uppercase tracking-widest px-3 py-1 rounded-full", statusColors[order.fulfillmentStatus || 'Pending'] || statusColors['Pending'])}>
                  {order.fulfillmentStatus || 'Pending'}
                </Badge>
              </div>
              <h3 className="font-black text-xl text-chef-charcoal tracking-tight leading-tight group-hover:text-accent-fresh transition-colors truncate">
                {order.companyName || "Private Client"}
              </h3>
            </div>
          </div>

          {/* Logistics Summary */}
          <div className="p-8 pt-6 space-y-5 flex-1 z-10">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-[20px] bg-chef-prep/20 border border-chef-charcoal/5 group-hover/metric:bg-white transition-colors">
                <p className="text-[9px] font-black uppercase tracking-widest text-chef-muted mb-1 opacity-50">Event Pulse</p>
                <div className="flex items-center gap-2">
                  <Calendar size={14} className="text-chef-charcoal/30" />
                  <span className="text-[12px] font-black text-chef-charcoal uppercase tracking-tighter">
                    {order.preferredDate ? format(new Date(order.preferredDate), "MMM dd") : "TBD"}
                  </span>
                </div>
              </div>
              <div className="p-4 rounded-[20px] bg-chef-prep/20 border border-chef-charcoal/5 group-hover/metric:bg-white transition-colors">
                <p className="text-[9px] font-black uppercase tracking-widest text-chef-muted mb-1 opacity-50">Headcount</p>
                <div className="flex items-center gap-2">
                  <User size={14} className="text-chef-charcoal/30" />
                  <span className="text-[12px] font-black text-chef-charcoal">
                    {order.estimatedGroupSize || "—"} PAX
                  </span>
                </div>
              </div>
            </div>

            {/* Financial Tile */}
            <div className="flex items-center gap-4 px-6 py-5 bg-chef-charcoal rounded-[24px] text-white shadow-soft-mid group-hover:bg-accent-fresh transition-colors duration-500">
              <CircleDollarSign size={20} className="text-white/40" />
              <div className="flex-1">
                <p className="text-[8px] font-black uppercase tracking-[0.2em] opacity-40 mb-0.5">Manifest Value</p>
                <div className="text-xl font-black tracking-tight tabular-nums">
                  ${order.quoteAmount?.toLocaleString() || "0.00"}
                </div>
              </div>
              <div className="text-right">
                <p className="text-[8px] font-black uppercase tracking-[0.2em] opacity-40 mb-0.5">Log ID</p>
                <span className="text-[10px] font-black opacity-60">
                   #{order.id.slice(0, 5).toUpperCase()}
                </span>
              </div>
            </div>
          </div>

          {/* Footer Timeline */}
          <div className="px-8 py-5 border-t border-chef-charcoal/[0.03] bg-chef-prep/10 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock size={12} className="text-chef-muted opacity-40" />
              <span className="text-[10px] font-bold text-chef-muted tracking-tight">
                Recorded {order.createdAt?.seconds ? format(order.createdAt.toDate(), "hh:mm a") : "—"}
              </span>
            </div>
            <div className="h-8 w-8 rounded-full bg-white flex items-center justify-center text-chef-muted group-hover:bg-chef-charcoal group-hover:text-white transition-all shadow-soft-low">
              <ChevronRight size={14} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
