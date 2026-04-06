import * as React from "react"
import { cn } from "@/lib/utils"

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  error?: string;
  options: { value: string; label: string; disabled?: boolean }[];
  placeholder?: string;
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, error, options, placeholder, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5 w-full">
        <div className="relative">
          <select
            className={cn(
              "flex h-11 w-full appearance-none rounded-lg border bg-white px-3 py-2 pr-10 text-base text-brown placeholder:text-brown/50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50",
              error 
                ? "border-orange focus-visible:ring-orange" 
                : "border-gray-border focus-visible:ring-teal-base focus-visible:border-teal-base",
              className
            )}
            ref={ref}
            aria-invalid={error ? "true" : "false"}
            {...props}
          >
            {placeholder && (
              <option value="" disabled hidden>
                {placeholder}
              </option>
            )}
            {options.map((option) => (
              <option key={option.value} value={option.value} disabled={option.disabled}>
                {option.label}
              </option>
            ))}
          </select>
          {/* Custom chevron */}
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-brown/50">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m6 9 6 6 6-6" />
            </svg>
          </div>
        </div>
        {error && (
          <span className="text-xs text-orange font-medium" role="alert">
            {error}
          </span>
        )}
      </div>
    )
  }
)
Select.displayName = "Select"

export { Select }
