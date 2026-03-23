import * as React from "react"
import { cn } from "@/lib/utils"

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 
    | "default" 
    | "success"
    | "warning" 
    | "danger"
    | "neutral";
}

const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant = "default", ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-teal-base focus:ring-offset-2",
          {
            "bg-teal-base/10 text-teal-dark font-medium": variant === "default",
            "bg-green-100 text-green-800": variant === "success",
            "bg-[#E9C559] text-brown": variant === "warning", // Brand Gold
            "bg-[#D36200] text-white": variant === "danger", // Brand Sunset Orange
            "bg-gray-border text-brown": variant === "neutral",
          },
          className
        )}
        {...props}
      />
    )
  }
)
Badge.displayName = "Badge"

export { Badge }
