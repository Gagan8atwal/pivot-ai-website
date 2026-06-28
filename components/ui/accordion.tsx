'use client'

import * as React from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

interface AccordionItemProps {
  question: string
  answer: string
  defaultOpen?: boolean
}

export function AccordionItem({ question, answer, defaultOpen = false }: AccordionItemProps) {
  const [open, setOpen] = React.useState(defaultOpen)

  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden transition-all duration-200">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={cn(
          'flex w-full items-center justify-between px-6 py-5 text-left font-semibold text-navy-900 text-base transition-colors hover:bg-slate-50',
          open && 'bg-slate-50'
        )}
        aria-expanded={open}
      >
        <span>{question}</span>
        <ChevronDown
          className={cn(
            'h-5 w-5 flex-shrink-0 text-amber-500 transition-transform duration-200 ml-4',
            open && 'rotate-180'
          )}
          aria-hidden="true"
        />
      </button>
      <div
        className={cn(
          'overflow-hidden transition-all duration-300',
          open ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
        )}
      >
        <div className="px-6 pb-5 text-slate-600 leading-relaxed">
          {answer}
        </div>
      </div>
    </div>
  )
}

interface AccordionProps {
  items: AccordionItemProps[]
  className?: string
}

export function Accordion({ items, className }: AccordionProps) {
  return (
    <div className={cn('space-y-3', className)}>
      {items.map((item, i) => (
        <AccordionItem key={i} {...item} />
      ))}
    </div>
  )
}
