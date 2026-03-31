import * as React from "react";
import { cn } from "../../lib/utils";

const Button = React.forwardRef(({ 
  className, 
  variant = "default", 
  size = "default", 
  children,
  ...props 
}, ref) => {
  const variants = {
    default: "bg-red-600 text-white hover:bg-red-700",
    outline: "border border-red-600 text-red-600 hover:bg-red-50 bg-transparent",
    ghost: "hover:bg-gray-100 text-gray-700 bg-transparent",
    destructive: "bg-red-700 text-white hover:bg-red-800",
    secondary: "bg-gray-100 text-gray-700 hover:bg-gray-200",
  };

  const sizes = {
    default: "px-4 py-2 text-sm",
    sm: "px-3 py-1.5 text-xs",
    lg: "px-6 py-3 text-base",
    icon: "p-2",
  };

  return (
    <button
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center rounded-lg font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
});

Button.displayName = "Button";

export { Button };