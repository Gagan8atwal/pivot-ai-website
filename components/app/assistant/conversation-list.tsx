'use client'

import * as React from 'react'
import { MessageSquarePlus, Loader2, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { formatRelative } from '@/lib/format'
import { conversationTitle } from '@/lib/assistant'
import type { AssistantConversation } from '@/lib/api'

export function ConversationList({
  conversations,
  activeId,
  loading,
  error,
  disabled,
  onSelect,
  onNew,
  onRetry,
}: {
  conversations: AssistantConversation[]
  /** null while a brand-new conversation is being composed. */
  activeId: string | null
  loading: boolean
  error: string | null
  disabled: boolean
  onSelect: (id: string) => void
  onNew: () => void
  onRetry: () => void
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between gap-2 border-b border-slate-100 px-4 py-3">
        <h2 className="text-sm font-semibold text-navy-900">Conversations</h2>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-8 px-2"
          onClick={onNew}
          disabled={disabled}
        >
          <MessageSquarePlus className="mr-1.5 h-4 w-4" aria-hidden="true" />
          New
        </Button>
      </div>

      <div className="max-h-[280px] overflow-y-auto p-2 lg:max-h-[calc(100vh-22rem)]">
        {loading ? (
          <p className="flex items-center gap-2 px-2 py-3 text-xs text-slate-500" role="status">
            <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" /> Loading conversations…
          </p>
        ) : error ? (
          <div className="px-2 py-3">
            <p className="flex items-start gap-1.5 text-xs text-red-600" role="alert">
              <AlertCircle className="mt-0.5 h-3.5 w-3.5 flex-shrink-0" aria-hidden="true" />
              {error}
            </p>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="mt-2 h-7 px-2 text-xs"
              onClick={onRetry}
            >
              Try again
            </Button>
          </div>
        ) : conversations.length === 0 ? (
          <p className="px-2 py-3 text-xs text-slate-500">
            No conversations yet. Your first question starts one, and it is saved to your account.
          </p>
        ) : (
          <ul className="space-y-1" role="list">
            {conversations.map((c) => {
              const active = c.id === activeId
              return (
                <li key={c.id}>
                  <button
                    type="button"
                    onClick={() => onSelect(c.id)}
                    disabled={disabled}
                    aria-current={active ? 'true' : undefined}
                    className={cn(
                      'w-full rounded-lg px-3 py-2 text-left transition-colors',
                      'focus:outline-none focus-visible:ring-2 focus-visible:ring-navy-900/30',
                      'disabled:cursor-not-allowed disabled:opacity-60',
                      active ? 'bg-navy-900 text-white' : 'text-slate-600 hover:bg-slate-100'
                    )}
                  >
                    <span className="block truncate text-sm font-medium">
                      {conversationTitle(c.title)}
                    </span>
                    <span
                      className={cn(
                        'mt-0.5 block text-xs',
                        active ? 'text-white/70' : 'text-slate-400'
                      )}
                    >
                      {formatRelative(c.updated_at ?? c.created_at)}
                    </span>
                  </button>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </div>
  )
}
