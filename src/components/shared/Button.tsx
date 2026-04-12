import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-xl font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-base focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary: "bg-teal-base text-white hover:bg-teal-dark shadow-sm shadow-teal-base/20 active:scale-95 transition-all duration-200",
        secondary: "bg-teal-dark text-white hover:bg-teal-dark/90 active:scale-95 transition-all duration-200",
        outline: "border border-teal-dark/20 bg-white hover:bg-gray-bg text-teal-dark active:scale-95 transition-all duration-200",
        accent: "bg-orange text-white hover:bg-orange/90 shadow-sm shadow-orange/20 active:scale-95 transition-all duration-200",
        ghost: "hover:bg-teal-dark/5 text-teal-dark/60 hover:text-teal-dark transition-colors",
      },
      size: {
        default: "h-[44px] px-6 py-2",
        sm: "h-9 px-4 text-sm",
        lg: "h-12 px-8 text-lg",
        icon: "h-11 w-11",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
