'use client'

import * as React from 'react'
import { Bot, Eye, Lock, MessageSquare, ScrollText } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { PageHeader } from '@/components/app/page-header'
import { EmptyState, ErrorState, LoadingState, NotConfiguredState } from '@/components/app/states'
import { useApi } from '@/lib/use-api'
import { api, isApiConfigured, type AssistantConversation, type AssistantOverview } from '@/lib/api'
import {
  assistantErrorText,
  isNotEnabledError,
  normalizeMessage,
  titleFromMessage,
} from '@/lib/assistant'
import { ConversationList } from '@/components/app/assistant/conversation-list'
import { MessageList, type ChatMessage } from '@/components/app/assistant/message-list'
import { Composer, StarterPrompts } from '@/components/app/assistant/composer'
import { ActivityPanel } from '@/components/app/assistant/activity-panel'

const HEADER = {
  title: 'Assistant',
  description:
    'Ask about your account in plain English. The assistant reads your setup, integrations and recent activity — it never changes anything.',
}

/** The read-only guarantee, shown before any chat UI. */
function CapabilityNotice({ overview }: { overview: AssistantOverview }) {
  const note = overview.capabilities?.note?.trim()
  return (
    <div className="mb-5 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
      <Eye className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-600" aria-hidden="true" />
      <div className="min-w-0 text-sm text-amber-900">
        <p className="font-semibold">This assistant is read-only.</p>
        <p className="mt-1">
          It can look things up and explain them. It cannot change your settings, your integrations
          or anything else in your account — you stay in control of every change.
        </p>
        {note && <p className="mt-2 text-amber-800">{note}</p>}
      </div>
    </div>
  )
}

function NotEnabledState() {
  return (
    <EmptyState
      icon={Lock}
      title="The assistant is not enabled for this account yet"
      description="Pivot Assistant is rolling out gradually. Nothing is broken and nothing is missing from your account — the feature simply is not switched on for you yet. Your account team can tell you where you are in the rollout."
    />
  )
}

/** What the assistant is able to look up, straight from the backend catalogue. */
function ToolCatalogue({ overview }: { overview: AssistantOverview }) {
  const tools = Array.isArray(overview.tools) ? overview.tools : []
  if (tools.length === 0) return null
  return (
    <details className="mt-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <summary className="cursor-pointer text-sm font-semibold text-navy-900">
        What the assistant can look up ({tools.length})
      </summary>
      <ul className="mt-3 space-y-2" role="list">
        {tools.map((tool, i) => (
          <li key={`${tool.name}-${i}`} className="text-sm">
            <span className="font-medium text-navy-900">{tool.name}</span>
            {tool.risk && (
              <Badge variant="secondary" className="ml-2 px-2 py-0 text-[11px]">
                {tool.risk} risk
              </Badge>
            )}
            {tool.description && <p className="mt-0.5 text-slate-500">{tool.description}</p>}
          </li>
        ))}
      </ul>
    </details>
  )
}

export function AssistantConsole() {
  // ── Feature flag + capabilities ────────────────────────────────────────────
  const overview = useApi(async () => {
    try {
      return { notEnabled: false, data: await api.assistant.overview() }
    } catch (err) {
      if (isNotEnabledError(err)) return { notEnabled: true, data: null }
      throw err
    }
  }, [])

  const enabled = overview.data?.data?.enabled === true
  const notEnabled = overview.data?.notEnabled === true || overview.data?.data?.enabled === false

  // ── Conversations ──────────────────────────────────────────────────────────
  const [conversations, setConversations] = React.useState<AssistantConversation[]>([])
  const [conversationsLoading, setConversationsLoading] = React.useState(false)
  const [conversationsError, setConversationsError] = React.useState<string | null>(null)
  const [activeId, setActiveId] = React.useState<string | null>(null)

  // ── Transcript ─────────────────────────────────────────────────────────────
  const [messages, setMessages] = React.useState<ChatMessage[]>([])
  const [messagesLoading, setMessagesLoading] = React.useState(false)
  const [messagesError, setMessagesError] = React.useState<string | null>(null)

  // ── Composer ───────────────────────────────────────────────────────────────
  const [draft, setDraft] = React.useState('')
  const [pending, setPending] = React.useState(false)
  const [flagRevoked, setFlagRevoked] = React.useState(false)
  const [tab, setTab] = React.useState('chat')
  const inputRef = React.useRef<HTMLTextAreaElement>(null)
  const sendSeq = React.useRef(0)

  const loadMessages = React.useCallback(async (conversationId: string) => {
    setMessagesLoading(true)
    setMessagesError(null)
    try {
      const stored = await api.assistant.conversations.messages(conversationId)
      setMessages(stored.map(normalizeMessage))
    } catch (err) {
      setMessages([])
      setMessagesError(assistantErrorText(err))
      if (isNotEnabledError(err)) setFlagRevoked(true)
    } finally {
      setMessagesLoading(false)
    }
  }, [])

  const loadConversations = React.useCallback(
    async (opts: { selectFirst?: boolean } = {}) => {
      setConversationsLoading(true)
      setConversationsError(null)
      try {
        const list = await api.assistant.conversations.list()
        setConversations(list)
        if (opts.selectFirst && list.length > 0 && list[0]?.id) {
          const first = String(list[0].id)
          setActiveId(first)
          await loadMessages(first)
        }
      } catch (err) {
        setConversationsError(assistantErrorText(err))
        if (isNotEnabledError(err)) setFlagRevoked(true)
      } finally {
        setConversationsLoading(false)
      }
    },
    [loadMessages]
  )

  // Load the server-side history once the feature is confirmed available.
  React.useEffect(() => {
    if (!enabled) return
    void loadConversations({ selectFirst: true })
  }, [enabled, loadConversations])

  const selectConversation = React.useCallback(
    (id: string) => {
      if (pending || id === activeId) return
      setActiveId(id)
      setDraft('')
      void loadMessages(id)
      inputRef.current?.focus()
    },
    [activeId, loadMessages, pending]
  )

  const startNewConversation = React.useCallback(() => {
    if (pending) return
    setActiveId(null)
    setMessages([])
    setMessagesError(null)
    setDraft('')
    inputRef.current?.focus()
  }, [pending])

  /**
   * Send one turn. The user's message is shown immediately and *kept* on
   * failure with the real reason; an assistant bubble is only ever appended
   * from a reply the backend actually returned.
   */
  const send = React.useCallback(
    async (text: string) => {
      const message = text.trim()
      if (!message || pending) return

      const seq = ++sendSeq.current
      const localId = `local-${seq}`
      setMessages((prev) => [
        ...prev,
        { id: localId, role: 'user', content: message, createdAt: new Date().toISOString() },
      ])
      setDraft('')
      setPending(true)

      const fail = (err: unknown) => {
        const reason = assistantErrorText(err)
        setMessages((prev) => prev.map((m) => (m.id === localId ? { ...m, error: reason } : m)))
        if (isNotEnabledError(err)) setFlagRevoked(true)
      }

      try {
        let conversationId = activeId
        if (!conversationId) {
          const created = await api.assistant.conversations.create({
            title: titleFromMessage(message),
          })
          conversationId = created?.conversation?.id ? String(created.conversation.id) : null
          if (!conversationId) throw new Error('The backend did not return a conversation.')
          setActiveId(conversationId)
        }

        const res = await api.assistant.conversations.send(conversationId, { message })
        const reply = typeof res?.reply === 'string' ? res.reply.trim() : ''
        const toolsUsed = Array.isArray(res?.toolsUsed)
          ? res.toolsUsed.filter((t): t is string => typeof t === 'string' && t.trim().length > 0)
          : []

        if (!reply) {
          // No fabricated answer: an empty reply is reported as a failure.
          throw new Error('The assistant returned an empty reply. Try sending that again.')
        }

        setMessages((prev) => [
          ...prev,
          {
            id: `reply-${seq}`,
            role: 'assistant',
            content: reply,
            toolsUsed,
            createdAt: new Date().toISOString(),
          },
        ])
        void loadConversations()
      } catch (err) {
        fail(err)
      } finally {
        setPending(false)
        inputRef.current?.focus()
      }
    },
    [activeId, loadConversations, pending]
  )

  const retry = React.useCallback(
    (failed: ChatMessage) => {
      setMessages((prev) => prev.filter((m) => m.id !== failed.id))
      void send(failed.content)
    },
    [send]
  )

  const pickStarter = React.useCallback(
    (prompt: string) => {
      inputRef.current?.focus()
      void send(prompt)
    },
    [send]
  )

  // ── Framing states ─────────────────────────────────────────────────────────
  const header = <PageHeader title={HEADER.title} description={HEADER.description} />

  if (!isApiConfigured) {
    return (
      <>
        {header}
        <NotConfiguredState feature="The assistant" />
      </>
    )
  }

  if (overview.loading && !overview.data) {
    return (
      <>
        {header}
        <LoadingState label="Checking whether the assistant is available…" />
      </>
    )
  }

  if (overview.error) {
    return (
      <>
        {header}
        <ErrorState
          title="Could not load the assistant"
          message={overview.error}
          onRetry={overview.refetch}
        />
      </>
    )
  }

  if (notEnabled || flagRevoked || !overview.data?.data) {
    return (
      <>
        {header}
        <NotEnabledState />
      </>
    )
  }

  const data = overview.data.data
  const busy = pending || messagesLoading
  const showStarters = messages.length === 0 && !messagesLoading && !messagesError

  return (
    <>
      <PageHeader
        title={HEADER.title}
        description={HEADER.description}
        actions={
          <Badge variant="secondary" className="gap-1.5">
            <Lock className="h-3 w-3" aria-hidden="true" /> Read-only
          </Badge>
        }
      />

      <CapabilityNotice overview={data} />

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="chat">
            <span className="inline-flex items-center gap-1.5">
              <MessageSquare className="h-4 w-4" aria-hidden="true" /> Chat
            </span>
          </TabsTrigger>
          <TabsTrigger value="activity">
            <span className="inline-flex items-center gap-1.5">
              <ScrollText className="h-4 w-4" aria-hidden="true" /> Activity
            </span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="chat">
          <div className="grid gap-4 lg:grid-cols-[260px_minmax(0,1fr)]">
            <ConversationList
              conversations={conversations}
              activeId={activeId}
              loading={conversationsLoading && conversations.length === 0}
              error={conversationsError}
              disabled={pending}
              onSelect={selectConversation}
              onNew={startNewConversation}
              onRetry={() => void loadConversations()}
            />

            <Card className="flex min-h-[420px] flex-col">
              <CardContent className="flex flex-1 flex-col gap-4 p-4 sm:p-6">
                <div className="min-h-[220px] flex-1 overflow-y-auto lg:max-h-[calc(100vh-30rem)]">
                  {messagesLoading ? (
                    <LoadingState label="Loading this conversation…" />
                  ) : messagesError ? (
                    <ErrorState
                      title="Could not load this conversation"
                      message={messagesError}
                      onRetry={() => activeId && void loadMessages(activeId)}
                    />
                  ) : messages.length === 0 && !pending ? (
                    <EmptyState
                      icon={Bot}
                      title="Ask your first question"
                      description="Your questions and the assistant's answers are saved to your account, so you can pick this up again later."
                    />
                  ) : (
                    <MessageList messages={messages} pending={pending} onRetry={retry} />
                  )}
                </div>

                {showStarters && <StarterPrompts onPick={pickStarter} disabled={busy} />}

                <Composer
                  value={draft}
                  onChange={setDraft}
                  onSend={() => void send(draft)}
                  pending={pending}
                  disabled={messagesLoading}
                  inputRef={inputRef}
                />
              </CardContent>
            </Card>
          </div>

          <ToolCatalogue overview={data} />
        </TabsContent>

        <TabsContent value="activity">
          <ActivityPanel />
        </TabsContent>
      </Tabs>
    </>
  )
}
