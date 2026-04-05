"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/shared/Card";
import { Badge } from "@/components/shared/Badge";
import { Button } from "@/components/shared/Button";
import Link from "next/link";
import { Calendar, ArrowRight } from "lucide-react";
import { ReactNode } from "react";

interface BookedCallLead {
  id: string;
  companyName: string;
  contactName?: string;
  bookedCallDate?: {
    toDate?: () => Date;
  };
  [key: string]: any;
}

interface BookedCallsWidgetProps {
  leads: BookedCallLead[];
  renderHeatIndicator: (lead: any) => ReactNode;
}

export function BookedCallsWidget({ leads, renderHeatIndicator }: BookedCallsWidgetProps) {
  if (!leads || leads.length === 0) return null;

  return (
    <Card className="border-blue-500/30 shadow-lg overflow-hidden border-2 bg-blue-50/30">
      <CardHeader className="bg-blue-500/10 border-b border-blue-500/10 py-4 flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-blue-600" />
          <CardTitle className="text-lg font-heading text-blue-900">Upcoming Kickoff Calls</CardTitle>
        </div>
        <Badge className="bg-blue-600 text-white border-none">{leads.length}</Badge>
      </CardHeader>
      <CardContent className="p-0">
        <ul className="divide-y divide-blue-100">
          {leads.map((lead) => (
            <li key={lead.id} className="p-4 hover:bg-blue-50/50 transition-colors flex items-center justify-between group">
              <div className="flex items-center gap-4">
                <div className="bg-white rounded-lg p-2 border border-blue-100 text-center min-w-[60px]">
                  <p className="text-[10px] uppercase font-bold text-blue-400">
                    {lead.bookedCallDate?.toDate ? lead.bookedCallDate.toDate().toLocaleDateString('en-US', { month: 'short' }) : '---'}
                  </p>
                  <p className="text-xl font-black text-blue-600 leading-none">
                    {lead.bookedCallDate?.toDate ? lead.bookedCallDate.toDate().getDate() : '--'}
                  </p>
                </div>
                <div>
                  <p className="font-bold text-blue-900">{lead.companyName}</p>
                  <div className="flex items-center gap-2">
                    <p className="text-sm text-blue-700/70">
                      {lead.bookedCallDate?.toDate ? lead.bookedCallDate.toDate().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) : 'Time TBD'}
                      {lead.contactName && ` · with ${lead.contactName}`}
                    </p>
                    {renderHeatIndicator(lead)}
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <Button size="sm" asChild className="bg-blue-600 hover:bg-blue-700 text-white border-none">
                  <Link href={`/app/leads/${lead.id}`} className="flex items-center gap-2">
                    Prepare <ArrowRight className="w-3 h-3" />
                  </Link>
                </Button>
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
