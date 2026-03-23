import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cn } from "@/lib/utils"

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "default", asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center whitespace-nowrap rounded-lg font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-base focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
          {
            "bg-teal-dark text-white hover:bg-teal-dark/90": variant === "primary", // Using Dark Teal for WCAG AA
            "bg-teal-base/10 text-teal-dark hover:bg-teal-base/20": variant === "secondary",
            "border border-gray-border bg-white hover:bg-gray-bg text-brown": variant === "outline",
            "hover:bg-teal-base/10 text-brown hover:text-teal-dark": variant === "ghost",
            "h-[44px] px-6 py-2": size === "default", // Minimum 44px tap target per specs
            "h-9 px-4 text-sm": size === "sm",
            "h-12 px-8 text-lg": size === "lg",
            "h-11 w-11": size === "icon",
          },
          className
        )}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button }

