/**
 * Button 组件 - shadcn/ui
 */

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils/cn";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2383E2] dark:focus-visible:ring-[#529CCA] disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "border border-transparent bg-[#2383E2] text-white hover:bg-[#1a73d1] dark:bg-[#529CCA] dark:hover:bg-[#4a8ab8] shadow-sm",
        destructive:
          "border border-transparent bg-red-600 text-white hover:bg-red-700 shadow-sm",
        outline:
          "border border-[#E9E9E7] dark:border-[#3F3F3F] bg-transparent hover:bg-[#F1F1EF] dark:hover:bg-[#373737] text-[#37352F] dark:text-[#E6E6E6]",
        secondary:
          "border border-transparent bg-[#E9E9E7] dark:bg-[#3F3F3F] text-[#37352F] dark:text-[#E6E6E6] hover:bg-[#D3D2CF] dark:hover:bg-[#4F4F4F]",
        ghost:
          "border border-transparent hover:bg-[#F1F1EF] dark:hover:bg-[#373737] text-[#787774] dark:text-[#9B9A97]",
        link: "border border-transparent text-[#2383E2] dark:text-[#529CCA] underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-6",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
