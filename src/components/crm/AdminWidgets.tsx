import { Card, CardContent, CardHeader, CardTitle } from "@/components/shared/Card";
import { Badge } from "@/components/shared/Badge";
import { Activity, PieChart, AlertTriangle, Users } from "lucide-react";
import Link from "next/link";

export function SourceBreakdownWidget({ data }: { data: any[] }) {
  if (!data || data.length === 0) return null;
  const sorted = [...data].sort((a, b) => b.value - a.value).slice(0, 5);
  
  return (
    <Card className="border-gray-border/60 shadow-sm">
      <CardHeader className="border-b border-gray-border/50 pb-4">
        <div className="flex items-center gap-2">
          <PieChart className="h-5 w-5 text-teal-base" />
          <CardTitle className="text-lg text-brown font-heading font-semibold">Source Performance</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <ul className="divide-y divide-gray-border">
          {sorted.map((item, idx) => (
            <li key={idx} className="p-4 hover:bg-white transition-colors flex items-center justify-between">
              <span className="font-medium text-brown">{item.name}</span>
              <Badge variant="neutral">{item.value} leads</Badge>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

export function RepActivityWidget({ data }: { data: any[] }) {
  if (!data || data.length === 0) return null;
  
  return (
    <Card className="border-gray-border/60 shadow-sm">
      <CardHeader className="border-b border-gray-border/50 pb-4">
        <div className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-teal-base" />
          <CardTitle className="text-lg text-brown font-heading font-semibold">Rep Activity (7 Days)</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <ul className="divide-y divide-gray-border">
          {data.map((item, idx) => (
            <li key={idx} className="p-4 hover:bg-white transition-colors flex items-center justify-between">
              <span className="font-medium text-brown">{item.name}</span>
              <span className="text-sm font-semibold text-teal-dark">{item.count} notes</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

export function ActivationPipelineWidget({ data }: { data: any[] }) {
  if (!data || data.length === 0) return null;
  
  return (
    <Card className="border-gray-border/60 shadow-sm border-orange/30">
      <CardHeader className="border-b border-gray-border/50 bg-orange/5 pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange" />
            <CardTitle className="text-lg text-brown font-heading font-semibold">Activation Pipeline</CardTitle>
          </div>
          <Badge variant="warning">{data.length} Unactivated</Badge>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <ul className="divide-y divide-gray-border max-h-[300px] overflow-y-auto">
          {data.map((company, idx) => (
            <li key={idx} className="p-4 hover:bg-white transition-colors flex flex-col group">
              <div className="flex items-center justify-between">
                <span className="font-medium text-brown">{company.name}</span>
                <Link href={`/app/companies/${company.id}`} className="text-xs text-teal-base hover:underline opacity-0 group-hover:opacity-100 transition-opacity">
                  View
                </Link>
              </div>
              <span className="text-xs text-brown/60">Enrolled, no orders</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
