"use client";

import { 
  Users2, 
  MapPin, 
  Coffee, 
  Wine, 
  Sun, 
  CloudSun, 
  Plus, 
  Calendar,
  ChevronRight,
  TrendingUp,
  Clock,
  ExternalLink
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/shared/Badge";
import { Button } from "@/components/shared/Button";

// 1. Booking Capacity Radial Widget
export const BookingCapacityRadial = ({ value = 75, total = 100 }: { value?: number, total?: number }) => {
  const percentage = Math.round((value / total) * 100);
  const strokeDasharray = 2 * Math.PI * 40;
  const strokeDashoffset = strokeDasharray - (percentage / 100) * strokeDasharray;

  return (
    <div className="bg-v-surface p-8 rounded-[24px] shadow-ambient border border-v-outline/20 flex flex-col items-center justify-center h-full group hover:shadow-ambient-bold transition-all duration-500">
      <div className="w-full flex justify-between items-start mb-6">
        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-v-on-surface/40">Booking Capacity</h3>
        <TrendingUp className="h-4 w-4 text-v-primary/60" />
      </div>
      
      <div className="relative h-48 w-48 flex items-center justify-center">
        <svg className="h-full w-full -rotate-90">
          <circle
            cx="96"
            cy="96"
            r="80"
            className="stroke-v-container fill-none"
            strokeWidth="12"
          />
          <circle
            cx="96"
            cy="96"
            r="80"
            className="stroke-v-primary fill-none transition-all duration-1000 ease-out"
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray={strokeDasharray * 2}
            style={{ 
              strokeDasharray: `${strokeDasharray}px`, 
              strokeDashoffset: `${strokeDashoffset}px` 
            }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-4xl font-black text-v-on-surface tracking-tighter">{percentage}%</span>
          <span className="text-[9px] font-black uppercase tracking-[0.2em] text-v-on-surface/40 mt-1">Occupied</span>
        </div>
      </div>
      
      <div className="mt-8 text-center">
        <p className="text-xs font-bold text-v-on-surface/60">
          {total - value} slots remaining for Q3
        </p>
      </div>
    </div>
  );
};

// 2. Upcoming Events List
export const UpcomingEventsList = ({ events = [] }: { events?: any[] }) => {
  const defaultEvents = [
    { id: 1, title: "Ocean Breeze Wedding", subtitle: "120 Guests • Lahaina Coast", date: "Aug 24", status: "PENDING", image: "https://images.unsplash.com/photo-1519741497674-611481863552?w=100&h=100&fit=crop" },
    { id: 2, title: "Tech Summit Gala", subtitle: "350 Guests • Grand Ballroom", date: "Aug 26", status: "CONFIRMED", image: "https://images.unsplash.com/photo-1511578314322-379afb476865?w=100&h=100&fit=crop" },
    { id: 3, title: "Sunset Luau Dinner", subtitle: "45 Guests • Private Cove", date: "Aug 29", status: "CONFIRMED", image: "https://images.unsplash.com/photo-1504159506876-f8338247a14a?w=100&h=100&fit=crop" },
  ];

  const displayEvents = events.length > 0 ? events : defaultEvents;

  return (
    <div className="bg-v-surface rounded-[24px] shadow-ambient border border-v-outline/20 overflow-hidden flex flex-col h-full">
      <div className="px-8 py-6 flex items-center justify-between border-b border-v-outline/10">
        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-v-on-surface/40">Upcoming Events</h3>
        <button className="text-[9px] font-black uppercase tracking-[0.2em] text-v-primary hover:text-v-secondary transition-colors">View Calendar</button>
      </div>
      
      <div className="flex-1 divide-y divide-v-outline/5 overflow-y-auto custom-scrollbar">
        {displayEvents.map((event) => (
          <div key={event.id} className="p-6 flex items-center gap-4 hover:bg-v-container/20 transition-all cursor-pointer group">
            <div className="h-14 w-14 rounded-2xl overflow-hidden shadow-md border border-v-outline/10 shrink-0">
              <img src={event.image} alt="" className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-500" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-bold text-v-on-surface truncate group-hover:text-v-primary transition-colors">{event.title}</h4>
              <p className="text-[10px] font-medium text-v-on-surface/40 mt-1 uppercase tracking-tight">{event.subtitle}</p>
            </div>
            <div className="text-right shrink-0">
              <p className="text-[11px] font-black text-v-on-surface uppercase tracking-tighter">{event.date}</p>
              <Badge className={cn(
                "mt-1.5 text-[8px] font-black border-none px-2 py-0.5",
                event.status === 'CONFIRMED' ? "bg-v-primary/10 text-v-primary" : "bg-v-secondary/10 text-v-secondary"
              )}>
                {event.status}
              </Badge>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// 3. Lead Origins Map
export const LeadOriginsMap = () => {
  return (
    <div className="bg-v-surface rounded-[24px] shadow-ambient border border-v-outline/20 overflow-hidden flex flex-col h-full group">
      <div className="px-8 py-6 flex items-center justify-between border-b border-v-outline/10">
        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-v-on-surface/40">Lead Origins</h3>
        <div className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-v-primary animate-pulse" />
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-v-on-surface/20">Global Reach</span>
        </div>
      </div>
      
      <div className="flex-1 relative bg-v-primary/5 group-hover:bg-v-primary/10 transition-all duration-700 overflow-hidden">
        {/* Simplified Map Stylization */}
        <div className="absolute inset-0 opacity-20 contrast-125 saturate-0 mix-blend-multiply transition-all duration-700 group-hover:opacity-30 group-hover:scale-105" 
          style={{ 
            backgroundImage: "url('https://images.unsplash.com/photo-1521295121783-8a321d551ad2?auto=format&fit=crop&q=80&w=1000')",
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }} 
        />
        
        {/* Markers */}
        <div className="absolute top-1/3 left-1/4 animate-bounce duration-[2000ms]">
          <div className="bg-v-surface p-2 rounded-xl shadow-xl flex items-center gap-2 border border-v-outline/20">
             <MapPin className="h-3 w-3 text-v-primary" />
             <span className="text-[9px] font-black uppercase">SF, USA</span>
          </div>
        </div>

        <div className="absolute bottom-1/4 right-1/3 animate-bounce duration-[3000ms]">
          <div className="bg-v-surface p-2 rounded-xl shadow-xl flex items-center gap-2 border border-v-outline/20">
             <MapPin className="h-3 w-3 text-v-secondary" />
             <span className="text-[9px] font-black uppercase">Tokyo, JP</span>
          </div>
        </div>

        <div className="absolute bottom-6 left-8 flex -space-x-3">
          {[1,2,3].map(i => (
            <div key={i} className="h-8 w-8 rounded-full border-2 border-v-surface bg-v-container overflow-hidden shadow-lg">
              <img src={`https://i.pravatar.cc/100?img=${i+10}`} alt="" />
            </div>
          ))}
          <div className="h-8 w-8 rounded-full border-2 border-v-surface bg-v-primary flex items-center justify-center text-[10px] font-black text-white shadow-lg">
            +14
          </div>
        </div>
        
        <div className="absolute bottom-8 right-8 text-right">
          <p className="text-[10px] font-black text-v-on-surface tracking-[0.2em] uppercase">12 New Inquiries</p>
        </div>
      </div>
    </div>
  );
};

// 4. Inventory Alerts
export const InventoryAlerts = () => {
  const items = [
    { name: "Premium Kona Coffee", value: 4, unit: "kg Left", limit: 20, color: "bg-v-secondary" },
    { name: "Vintage Champagne", value: 12, unit: "Units", limit: 50, color: "bg-v-primary" },
  ];

  return (
    <div className="bg-v-surface p-8 rounded-[24px] shadow-ambient border border-v-outline/20 h-full flex flex-col">
      <div className="flex items-center gap-2 mb-8">
        <div className="h-6 w-6 rounded-lg bg-v-secondary/10 flex items-center justify-center">
          <AlertTriangleIcon className="h-3.5 w-3.5 text-v-secondary" />
        </div>
        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-v-on-surface/40">Low Stock Alerts</h3>
      </div>
      
      <div className="space-y-8 flex-1">
        {items.map((item) => (
          <div key={item.name} className="space-y-3">
            <div className="flex justify-between items-end">
              <p className="text-xs font-bold text-v-on-surface/80 tracking-tight">{item.name}</p>
              <p className="text-[10px] font-black text-v-secondary tracking-tight">
                <span className="text-sm">{item.value}</span> {item.unit}
              </p>
            </div>
            <div className="h-1.5 w-full bg-v-container rounded-full overflow-hidden">
              <div 
                className={cn("h-full rounded-full transition-all duration-1000", item.color)} 
                style={{ width: `${(item.value / item.limit) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
      
      <Button variant="outline" className="w-full mt-6 h-12 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] border-v-outline/10 hover:bg-v-container">
        Restock All
      </Button>
    </div>
  );
};

// 5. Active Staffing
export const ActiveStaffing = () => {
  const staff = [
    { label: "Front of House", count: 8 },
    { label: "Kitchen Brigade", count: 14 },
    { label: "Event Logistics", count: 3 },
  ];

  return (
    <div className="bg-v-surface p-8 rounded-[24px] shadow-ambient border border-v-outline/20 h-full flex flex-col justify-between">
      <div>
        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-v-on-surface/40 mb-8">Active Staff</h3>
        <div className="space-y-5">
          {staff.map((s) => (
            <div key={s.label} className="flex items-center gap-3">
              <span className="h-1.5 w-1.5 rounded-full bg-v-primary" />
              <span className="text-xs font-bold text-v-on-surface/80">{s.label} ({s.count})</span>
            </div>
          ))}
        </div>
      </div>
      
      <div className="pt-8 border-t border-v-outline/10 flex items-center justify-between">
         <span className="text-[9px] font-black uppercase tracking-[0.2em] text-v-on-surface/40">Payroll Period</span>
         <span className="text-[10px] font-black text-v-on-surface tracking-tight">3 Days Left</span>
      </div>
    </div>
  );
};

// 6. Weather Widget + FAB
export const WeatherLocationCard = () => {
  return (
    <div className="relative h-full bg-[#1a1c1b] rounded-[24px] shadow-ambient border border-white/5 overflow-hidden group">
      <div className="p-8 h-full flex flex-col justify-between relative z-10">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <h4 className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Honolulu, HI</h4>
            <p className="text-5xl font-black text-white tracking-tighter">82°F</p>
          </div>
          <CloudSun className="h-10 w-10 text-white animate-pulse" />
        </div>
        
        <div>
           <img 
            src="https://ouch-cdn2.icons8.com/PZ8rRzW9_S3_u_uXW5Z_f-vXQf_f-vXQf_f-vXQf_f-vXQ.png" 
            alt="Weather Visualization" 
            className="w-24 h-24 mx-auto opacity-50 contrast-125 mb-4 group-hover:scale-110 transition-transform duration-700"
          />
          <p className="text-[10px] font-medium text-white/50 tracking-tight leading-relaxed">
            Outdoor venues are optimal today.<br />
            <span className="text-white/80 font-bold">Humidity: 64%</span>
          </p>
        </div>
      </div>
      
      {/* Floating Action Button */}
      <button className="absolute bottom-6 right-6 h-12 w-12 rounded-2xl bg-v-primary/90 text-white flex items-center justify-center shadow-[0_10px_30px_rgba(13,115,119,0.3)] hover:scale-110 hover:rotate-90 active:scale-95 transition-all z-20">
        <Plus className="h-6 w-6" />
      </button>
      
      {/* Background Decorative Gradient */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-v-primary/10 blur-[60px] rounded-full" />
    </div>
  );
};

function AlertTriangleIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
      <path d="M12 9v4" />
      <path d="M12 17h.01" />
    </svg>
  );
}
