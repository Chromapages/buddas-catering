"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/shared/Card";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

interface DonutData {
  name: string;
  value: number;
  color: string;
  gradient?: string[]; // Optional gradient colors [start, end]
}

interface SalesDonutChartProps {
  title: string;
  data: DonutData[];
  className?: string;
}

export function SalesDonutChart({
  title,
  data,
  className
}: SalesDonutChartProps) {
  const total = data.reduce((acc, curr) => acc + curr.value, 0);
  let cumulativeValue = 0;

  return (
    <div className={cn("flex flex-col items-center p-6 h-full bg-v-surface rounded-[24px] shadow-ambient border border-v-outline/20", className)}>
      <div className="w-full mb-8">
        <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-v-on-surface/40">
          {title}
        </h3>
      </div>
      
      {/* Chart Area */}
      <div className="relative w-44 h-44 flex items-center justify-center">
        <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
          {/* Background Track */}
          <circle
            cx="50"
            cy="50"
            r="38"
            fill="transparent"
            stroke="#1a1c1b"
            strokeWidth="8"
            className="opacity-[0.03]"
          />

          {data.map((item, index) => {
            const startValue = cumulativeValue;
            cumulativeValue += item.value;
            const startPercent = (startValue / total) * 100;
            const percent = (item.value / total) * 100;
            
            const radius = 38;
            const circumference = 2 * Math.PI * radius;
            const gap = 1.2; 
            const visiblePercent = Math.max(0, percent - gap);
            const offset = circumference - (visiblePercent / 100) * circumference;
            const rotation = (startPercent / 100) * 360 + (gap / 2 / 100) * 360;

            return (
              <motion.circle
                key={item.name}
                cx="50"
                cy="50"
                r={radius}
                fill="transparent"
                stroke={item.color}
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={circumference}
                initial={{ strokeDashoffset: circumference }}
                animate={{ 
                    strokeDashoffset: offset
                }}
                transition={{ 
                    strokeDashoffset: { duration: 1.5, ease: "circOut", delay: 0.2 + index * 0.1 }
                }}
                style={{ transformOrigin: 'center', rotate: `${rotation}deg` }}
                className="transition-all duration-300"
              />
            );
          })}
        </svg>

        {/* Center Info */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.8 }}
            className="flex flex-col items-center"
          >
            <span className="text-[9px] font-bold text-v-on-surface/30 uppercase tracking-[0.2rem] mb-0.5">Total</span>
            <div className="relative">
              <span className="text-2xl font-bold text-v-on-surface tabular-nums tracking-tighter">
                ${(total/1000).toFixed(0)}k
              </span>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Improved Legend with Intensity Bars */}
      <div className="mt-10 w-full space-y-5">
        {data.map((item, index) => {
          const percentage = Math.round((item.value / total) * 100);
          
          return (
            <div key={item.name} className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-[10px] font-bold text-v-on-surface/50 uppercase tracking-widest leading-none">
                    {item.name}
                  </span>
                </div>
                <span className="text-[10px] font-bold text-v-on-surface tracking-tight tabular-nums">
                  {percentage}%
                </span>
              </div>
              
              <div className="relative h-1 w-full bg-v-outline/10 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${percentage}%` }}
                  transition={{ duration: 1.5, delay: 0.5 + index * 0.1, ease: "circOut" }}
                  className="absolute inset-y-0 left-0 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
