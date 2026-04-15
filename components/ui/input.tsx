import * as React from 'react'

import { cn } from '@/lib/utils'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  isActive?: boolean;
}

function Input({ className, type, isActive = false, ...props }: InputProps) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "p-3 border border-gray-200 rounded-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500",
        "prose prose-sm max-w-none",
        "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 h-9 w-full min-w-0 bg-transparent px-3 py-1 text-base transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        "[&_blockquote]:border-l-4 [&_blockquote]:border-gray-300 [&_blockquote]:pl-3 [&_blockquote]:italic [&_blockquote]:text-gray-600",
        "[&_code]:bg-gray-100 [&_code]:px-1 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-sm [&_code]:font-mono [&_code]:text-red-600",
        "[&_a]:text-blue-600 [&_a]:underline",
        "[&_ol]:list-decimal [&_ol]:pl-5",
        "[&_ul]:list-disc [&_ul]:pl-5",
      )}
      {...props}
    />
  )
}
export { Input }
