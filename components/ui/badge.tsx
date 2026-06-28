import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        default:
          'border-transparent bg-navy-900 text-white',
        secondary:
          'border-transparent bg-slate-100 text-slate-700',
        amber:
          'border-amber-500/30 bg-amber-500/10 text-amber-700',
        'amber-solid':
          'border-transparent bg-amber-500 text-navy-900 font-bold',
        outline:
          'text-navy-900 border-navy-200',
        success:
          'border-transparent bg-green-100 text-green-700',
        white:
          'border-white/20 bg-white/10 text-white backdrop-blur-sm',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
