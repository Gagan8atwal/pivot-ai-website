import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-semibold ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 select-none',
  {
    variants: {
      variant: {
        default:
          'bg-navy-900 text-white hover:bg-navy-800 shadow-sm',
        amber:
          'bg-amber-500 text-navy-900 hover:bg-amber-400 shadow-sm font-bold',
        outline:
          'border-2 border-current bg-transparent hover:bg-white/10',
        'outline-navy':
          'border-2 border-navy-900 text-navy-900 bg-transparent hover:bg-navy-900 hover:text-white',
        ghost:
          'bg-transparent hover:bg-slate-100 text-slate-700',
        link:
          'text-navy-900 underline-offset-4 hover:underline p-0 h-auto',
        destructive:
          'bg-red-600 text-white hover:bg-red-700',
      },
      size: {
        default: 'h-10 px-5 py-2',
        sm: 'h-9 rounded-md px-4 text-xs',
        lg: 'h-12 rounded-lg px-8 text-base',
        xl: 'h-14 rounded-lg px-10 text-lg',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = 'Button'

export { Button, buttonVariants }
