import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1">
        <input
          type={type}
          className={cn(
            "flex h-10 w-full rounded-xl border-2 border-gray-200 bg-white px-4 py-2 text-sm text-gray-900 placeholder:text-gray-400 transition-colors",
            "focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-100",
            "disabled:cursor-not-allowed disabled:opacity-50",
            error && "border-red-400 focus:border-red-400 focus:ring-red-100",
            className
          )}
          ref={ref}
          {...props}
        />
        {error && <p className="text-xs text-red-500">{error}</p>}
      </div>
    );
  }
);
Input.displayName = "Input";

export { Input };
