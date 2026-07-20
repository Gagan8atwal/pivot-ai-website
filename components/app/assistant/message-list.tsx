'use client'

import * as React from 'react'
import { AlertCircle, Bot, Loader2, RotateCcw, Search, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { formatDateTime } from '@/lib/format'
import { humanizeToolName } from '@/lib/assistant'

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  /** Tool names the backend reported for this reply. Never inferred. */
  toolsUsed?: string[]
  createdAt?: string | null
  /** Present on a user message whose send failed — it stays visible and retryable. */
  error?: string | null
}

/** Evidence chips: the tools the assistant actually ran, humanised. */
function ToolChips({ tools }: { tools: string[] }) {
  const names = tools.map(humanizeToolName).filter(Boolean)
  if (names.length === 0) return null
  return (
    <div className="mt-2 flex flex-wrap items-center gap-1.5">
      <span className="inline-flex items-center gap-1 text-xs text-slate-400">
        <Search className="h-3 w-3" aria-hidden="true" />
        checked:
      </span>
      {names.map((name, i) => (
        <span
          key={`${name}-${i}`}
          className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-xs font-medium text-slate-600"
        >
          {name}
        </span>
      ))}
    </div>
  )
}

function Avatar({ role }: { role: 'user' | 'assistant' }) {
  const Icon = role === 'assistant' ? Bot : User
  return (
    <div
      className={cn(
        'flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full',
        role === 'assistant' ? 'bg-navy-900 text-white' : 'bg-slate-200 text-slate-600'
      )}
      aria-hidden="true"
    >
      <Icon className="h-4 w-4" />
    </div>
  )
}

function Bubble({
  message,
  onRetry,
  retryDisabled,
}: {
  message: ChatMessage
  onRetry: (message: ChatMessage) => void
  retryDisabled: boolean
}) {
  const isUser = message.role === 'user'
  return (
    <li className={cn('flex gap-3', isUser && 'flex-row-reverse')}>
      <Avatar role={message.role} />
      <div className={cn('min-w-0 max-w-[85%] sm:max-w-[75%]', isUser && 'flex flex-col items-end')}>
        <div
          className={cn(
            'rounded-2xl px-4 py-2.5 text-sm leading-relaxed',
            isUser
              ? 'bg-navy-900 text-white'
              : 'border border-slate-200 bg-white text-slate-700 shadow-sm',
            message.error && 'ring-1 ring-red-300'
          )}
        >
          <span className="sr-only">{isUser ? 'You said: ' : 'Assistant said: '}</span>
          <p className="whitespace-pre-wrap break-words">{message.content}</p>
        </div>

        {!isUser && <ToolChips tools={message.toolsUsed ?? []} />}

        {message.error ? (
          <div className="mt-2 flex flex-wrap items-center justify-end gap-2">
            <p className="flex items-start gap-1.5 text-xs text-red-600" role="alert">
              <AlertCircle className="mt-0.5 h-3.5 w-3.5 flex-shrink-0" aria-hidden="true" />
              {message.error}
            </p>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-xs text-red-700"
              onClick={() => onRetry(message)}
              disabled={retryDisabled}
            >
              <RotateCcw className="mr-1 h-3 w-3" aria-hidden="true" /> Retry
            </Button>
          </div>
        ) : message.createdAt ? (
          <p className="mt-1 text-xs text-slate-400">{formatDateTime(message.createdAt)}</p>
        ) : null}
      </div>
    </li>
  )
}

/** Real in-flight state for the request — not a simulated typing animation. */
function ThinkingRow() {
  return (
    <li className="flex gap-3">
      <Avatar role="assistant" />
      <div
        className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-500 shadow-sm"
        role="status"
      >
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
        Looking this up in your account…
      </div>
    </li>
  )
}

export function MessageList({
  messages,
  pending,
  onRetry,
}: {
  messages: ChatMessage[]
  pending: boolean
  onRetry: (message: ChatMessage) => void
}) {
  const endRef = React.useRef<HTMLLIElement>(null)

  React.useEffect(() => {
    endRef.current?.scrollIntoView({ block: 'end' })
  }, [messages, pending])

  return (
    <ul className="space-y-5" role="log" aria-live="polite" aria-label="Assistant conversation">
      {messages.map((m) => (
        <Bubble key={m.id} message={m} onRetry={onRetry} retryDisabled={pending} />
      ))}
      {pending && <ThinkingRow />}
      <li ref={endRef} aria-hidden="true" />
    </ul>
  )
}
