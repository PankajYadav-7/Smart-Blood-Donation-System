import * as React from "react";
import { cn } from "../../lib/utils";

const Badge = React.forwardRef(({ 
  className, 
  variant = "default",
  ...props 
}, ref) => {
  const variants = {
    default: "bg-red-100 text-red-700 border-red-200",
    secondary: "bg-gray-100 text-gray-700 border-gray-200",
    destructive: "bg-red-600 text-white border-red-600",
    outline: "bg-transparent text-gray-700 border-gray-300",
    success: "bg-green-100 text-green-700 border-green-200",
    warning: "bg-yellow-100 text-yellow-700 border-yellow-200",
  };

  return (
    <span
      ref={ref}
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold",
        variants[variant],
        className
      )}
      {...props}
    />
  );
});

Badge.displayName = "Badge";

export { Badge };