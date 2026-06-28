import * as React from 'react'
import { cn } from '@/lib/utils'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          'flex h-11 w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm text-navy-900 ring-offset-background transition-colors',
          'placeholder:text-slate-400',
          'focus:border-navy-900 focus:outline-none focus:ring-2 focus:ring-navy-900/20',
          'disabled:cursor-not-allowed disabled:opacity-50',
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = 'Input'

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          'flex min-h-[100px] w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-navy-900 ring-offset-background transition-colors resize-y',
          'placeholder:text-slate-400',
          'focus:border-navy-900 focus:outline-none focus:ring-2 focus:ring-navy-900/20',
          'disabled:cursor-not-allowed disabled:opacity-50',
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Textarea.displayName = 'Textarea'

const Label = React.forwardRef<
  HTMLLabelElement,
  React.LabelHTMLAttributes<HTMLLabelElement>
>(({ className, ...props }, ref) => (
  <label
    ref={ref}
    className={cn(
      'text-sm font-medium text-navy-900 leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
      className
    )}
    {...props}
  />
))
Label.displayName = 'Label'

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <select
        className={cn(
          'flex h-11 w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm text-navy-900 ring-offset-background transition-colors appearance-none cursor-pointer',
          'focus:border-navy-900 focus:outline-none focus:ring-2 focus:ring-navy-900/20',
          'disabled:cursor-not-allowed disabled:opacity-50',
          className
        )}
        ref={ref}
        {...props}
      >
        {children}
      </select>
    )
  }
)
Select.displayName = 'Select'

export interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: React.ReactNode
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, id, ...props }, ref) => {
    return (
      <div className="flex items-start gap-3">
        <input
          type="checkbox"
          ref={ref}
          id={id}
          className={cn(
            'h-4 w-4 mt-0.5 flex-shrink-0 rounded border border-slate-300 bg-white accent-navy-900 cursor-pointer',
            'focus:outline-none focus:ring-2 focus:ring-navy-900/20 focus:ring-offset-2',
            'disabled:cursor-not-allowed disabled:opacity-50',
            className
          )}
          {...props}
        />
        {label && (
          <label htmlFor={id} className="text-sm text-slate-600 leading-relaxed cursor-pointer">
            {label}
          </label>
        )}
      </div>
    )
  }
)
Checkbox.displayName = 'Checkbox'

export { Input, Textarea, Label, Select, Checkbox }
