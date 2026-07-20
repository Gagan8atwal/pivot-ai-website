'use client'

import * as React from 'react'
import { Loader2, Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/input'
import { STARTER_PROMPTS } from '@/lib/assistant'

/** Clickable starter prompts — each maps to a real read-only lookup. */
export function StarterPrompts({
  onPick,
  disabled,
}: {
  onPick: (prompt: string) => void
  disabled: boolean
}) {
  return (
    <div>
      <p id="assistant-starters-label" className="text-xs font-medium text-slate-500">
        Try one of these
      </p>
      <div className="mt-2 flex flex-wrap gap-2" role="group" aria-labelledby="assistant-starters-label">
        {STARTER_PROMPTS.map((prompt) => (
          <button
            key={prompt}
            type="button"
            onClick={() => onPick(prompt)}
            disabled={disabled}
            className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:border-navy-900 hover:text-navy-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-navy-900/30 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {prompt}
          </button>
        ))}
      </div>
    </div>
  )
}

export function Composer({
  value,
  onChange,
  onSend,
  pending,
  disabled,
  inputRef,
}: {
  value: string
  onChange: (v: string) => void
  onSend: () => void
  pending: boolean
  disabled: boolean
  inputRef: React.RefObject<HTMLTextAreaElement | null>
}) {
  const canSend = value.trim().length > 0 && !pending && !disabled

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Enter sends; Shift+Enter inserts a newline. IME composition is respected.
    if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault()
      if (canSend) onSend()
    }
  }

  return (
    <form
      className="flex items-end gap-2"
      onSubmit={(e) => {
        e.preventDefault()
        if (canSend) onSend()
      }}
    >
      <div className="min-w-0 flex-1">
        <label htmlFor="assistant-composer" className="sr-only">
          Ask the assistant a question about your account
        </label>
        <Textarea
          id="assistant-composer"
          ref={inputRef}
          rows={2}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          placeholder="Ask about your setup, integrations or recent calls…"
          aria-describedby="assistant-composer-hint"
          className="min-h-[52px] resize-none py-3"
        />
        <p id="assistant-composer-hint" className="mt-1 text-xs text-slate-400">
          Enter to send · Shift + Enter for a new line. The assistant can read your account, not
          change it.
        </p>
      </div>
      <Button type="submit" disabled={!canSend} className="mb-6 h-11 px-4">
        {pending ? (
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
        ) : (
          <Send className="h-4 w-4" aria-hidden="true" />
        )}
        <span className="ml-2 hidden sm:inline">{pending ? 'Sending…' : 'Send'}</span>
        <span className="sr-only sm:hidden">{pending ? 'Sending' : 'Send message'}</span>
      </Button>
    </form>
  )
}
