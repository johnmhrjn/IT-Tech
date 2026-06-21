import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold transition-colors",
  {
    variants: {
      variant: {
        default: "bg-orange-100 text-orange-700",
        secondary: "bg-yellow-100 text-yellow-800",
        success: "bg-green-100 text-green-700",
        destructive: "bg-red-100 text-red-700",
        outline: "border-2 border-gray-200 text-gray-700",
        age: "bg-sky-100 text-sky-700",
        safety: "bg-emerald-100 text-emerald-700",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
