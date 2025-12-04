/**
 * Input 组件 - shadcn/ui
 */

import * as React from 'react';
import { cn } from '@/lib/utils/cn';

const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          'flex h-9 w-full rounded-md border border-[#E9E9E7] dark:border-[#3F3F3F] bg-white dark:bg-[#2F2F2F] px-3 py-1 text-sm transition-all file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-[#37352F] placeholder:text-[#787774] dark:placeholder:text-[#9B9A97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2383E2] dark:focus-visible:ring-[#529CCA] disabled:cursor-not-allowed disabled:opacity-50 text-[#37352F] dark:text-[#E6E6E6]',
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = 'Input';

export { Input };
