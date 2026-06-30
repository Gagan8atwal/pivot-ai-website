'use client'

import * as React from 'react'
import { BookOpen, Plus, Pencil, Trash2, Mic, Save } from 'lucide-react'
import { PageHeader } from '@/components/app/page-header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input, Textarea, Select, Label } from '@/components/ui/input'
import { Modal } from '@/components/ui/drawer'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import {
  EmptyState,
  ErrorState,
  LoadingState,
  TableSkeleton,
  NotConfiguredState,
} from '@/components/app/states'
import { FormError, FormSuccess } from '@/components/app/auth-card'
import { useAuth } from '@/components/app/auth-provider'
import { useApi } from '@/lib/use-api'
import {
  api,
  asArray,
  can,
  errorMessage,
  isApiConfigured,
  type KnowledgeItem,
  type Settings,
} from '@/lib/api'
import { titleCase } from '@/lib/format'

const KB_TYPES = [
  { id: 'faq', label: 'FAQ' },
  { id: 'service', label: 'Service' },
  { id: 'policy', label: 'Policy' },
]

export default function KnowledgeBasePage() {
  const { me } = useAuth()
  const canWrite = can.admin(me?.role)

  if (!isApiConfigured) {
    return (
      <>
        <PageHeader title="Knowledge Base" description="Teach Pivot AI about your business." />
        <NotConfiguredState feature="The knowledge base" />
      </>
    )
  }

  return (
    <>
      <PageHeader
        title="Knowledge Base"
        description="What Pivot AI knows about your business: FAQs, services, policies, voice and hours."
      />
      <Tabs defaultValue="knowledge">
        <TabsList>
          <TabsTrigger value="knowledge">FAQs, Services &amp; Policies</TabsTrigger>
          <TabsTrigger value="voice">Voice, Greeting &amp; Hours</TabsTrigger>
        </TabsList>
        <TabsContent value="knowledge">
          <KnowledgePanel canWrite={canWrite} />
        </TabsContent>
        <TabsContent value="voice">
          <VoicePanel canWrite={canWrite} />
        </TabsContent>
      </Tabs>
    </>
  )
}

/* ───────────────── Knowledge items ───────────────── */

interface DraftItem {
  id?: string
  type: string
  question: string
  answer: string
}

function KnowledgePanel({ canWrite }: { canWrite: boolean }) {
  const kb = useApi(() => api.knowledge.list().then((r) => asArray<KnowledgeItem>(r)), [])
  const [items, setItems] = React.useState<KnowledgeItem[] | null>(null)
  React.useEffect(() => setItems(kb.data), [kb.data])

  const [editing, setEditing] = React.useState<DraftItem | null>(null)
  const [saving, setSaving] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const list = items ?? []

  const openNew = () => setEditing({ type: 'faq', question: '', answer: '' })
  const openEdit = (item: KnowledgeItem) =>
    setEditing({
      id: item.id,
      type: item.type ?? 'faq',
      question: item.question ?? item.title ?? '',
      answer: item.answer ?? item.body ?? '',
    })

  const save = async () => {
    if (!editing) return
    setSaving(true)
    setError(null)
    const payload = {
      type: editing.type,
      question: editing.question,
      answer: editing.answer,
      title: editing.question,
      body: editing.answer,
    }
    try {
      if (editing.id) {
        const updated = await api.knowledge.update(editing.id, payload)
        setItems((prev) => (prev ?? []).map((i) => (i.id === editing.id ? { ...i, ...updated } : i)))
      } else {
        const created = await api.knowledge.create(payload)
        setItems((prev) => [created, ...(prev ?? [])])
      }
      setEditing(null)
    } catch (err) {
      setError(errorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  const remove = async (item: KnowledgeItem) => {
    setItems((prev) => (prev ?? []).filter((i) => i.id !== item.id))
    try {
      await api.knowledge.remove(item.id)
    } catch {
      kb.refetch()
    }
  }

  return (
    <Card>
      <CardContent className="p-4">
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm text-slate-500">{list.length} entries</p>
          {canWrite && (
            <Button onClick={openNew} size="sm">
              <Plus className="mr-1 h-4 w-4" /> Add entry
            </Button>
          )}
        </div>

        {kb.loading ? (
          <TableSkeleton rows={5} cols={2} />
        ) : kb.error ? (
          <ErrorState message={kb.error} onRetry={kb.refetch} />
        ) : list.length === 0 ? (
          <EmptyState
            icon={BookOpen}
            title="No knowledge entries yet"
            description={
              canWrite
                ? 'Add FAQs, services, and policies so Pivot AI can answer accurately.'
                : 'An admin can add FAQs, services, and policies here.'
            }
            action={canWrite ? <Button onClick={openNew}><Plus className="mr-1 h-4 w-4" />Add entry</Button> : undefined}
          />
        ) : (
          <ul className="space-y-3">
            {list.map((item) => (
              <li
                key={item.id}
                className="rounded-lg border border-slate-200 p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="mb-1 flex items-center gap-2">
                      <Badge variant="secondary">{titleCase(item.type ?? 'faq')}</Badge>
                    </div>
                    <p className="font-medium text-navy-900">
                      {item.question || item.title || 'Untitled'}
                    </p>
                    <p className="mt-1 whitespace-pre-wrap text-sm text-slate-500">
                      {item.answer || item.body || '—'}
                    </p>
                  </div>
                  {canWrite && (
                    <div className="flex flex-shrink-0 gap-1">
                      <button
                        onClick={() => openEdit(item)}
                        className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-navy-900"
                        aria-label="Edit"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => remove(item)}
                        className="rounded-md p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600"
                        aria-label="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>

      <Modal
        open={Boolean(editing)}
        onClose={() => setEditing(null)}
        title={editing?.id ? 'Edit entry' : 'Add entry'}
      >
        {editing && (
          <div className="space-y-4">
            <FormError message={error} />
            <div className="space-y-1.5">
              <Label htmlFor="kb-type">Type</Label>
              <Select
                id="kb-type"
                value={editing.type}
                onChange={(e) => setEditing({ ...editing, type: e.target.value })}
              >
                {KB_TYPES.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.label}
                  </option>
                ))}
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="kb-q">Question / Title</Label>
              <Input
                id="kb-q"
                value={editing.question}
                onChange={(e) => setEditing({ ...editing, question: e.target.value })}
                placeholder="e.g. What areas do you serve?"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="kb-a">Answer / Details</Label>
              <Textarea
                id="kb-a"
                value={editing.answer}
                onChange={(e) => setEditing({ ...editing, answer: e.target.value })}
                placeholder="The answer Pivot AI should give callers."
                rows={5}
              />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="ghost" onClick={() => setEditing(null)}>
                Cancel
              </Button>
              <Button onClick={save} disabled={saving || !editing.question.trim()}>
                {saving ? 'Saving…' : 'Save entry'}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </Card>
  )
}

/* ───────────────── Voice / greeting / hours (settings) ───────────────── */

function VoicePanel({ canWrite }: { canWrite: boolean }) {
  const settings = useApi(() => api.settings.get(), [])
  const [form, setForm] = React.useState<Settings>({})
  const [saving, setSaving] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [success, setSuccess] = React.useState<string | null>(null)

  React.useEffect(() => {
    if (settings.data) setForm(settings.data)
  }, [settings.data])

  const hoursValue =
    typeof form.hours === 'string' ? form.hours : form.hours ? JSON.stringify(form.hours, null, 2) : ''

  const save = async () => {
    setSaving(true)
    setError(null)
    setSuccess(null)
    try {
      await api.settings.update({
        greeting: form.greeting,
        voice_instructions: form.voice_instructions,
        hours: form.hours,
      })
      setSuccess('Voice settings saved.')
    } catch (err) {
      setError(errorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  if (settings.loading) return <LoadingState label="Loading voice settings…" />
  if (settings.error) return <ErrorState message={settings.error} onRetry={settings.refetch} />

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Mic className="h-5 w-5 text-amber-500" /> How Pivot AI sounds
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <FormError message={error} />
        <FormSuccess message={success} />

        <div className="space-y-1.5">
          <Label htmlFor="greeting">Greeting</Label>
          <Textarea
            id="greeting"
            value={form.greeting ?? ''}
            disabled={!canWrite}
            onChange={(e) => setForm({ ...form, greeting: e.target.value })}
            placeholder="Thanks for calling VS Carriers, this is your AI assistant. How can I help?"
            rows={2}
          />
          <p className="text-xs text-slate-400">The first thing callers hear when Pivot AI answers.</p>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="voice">Voice instructions</Label>
          <Textarea
            id="voice"
            value={form.voice_instructions ?? ''}
            disabled={!canWrite}
            onChange={(e) => setForm({ ...form, voice_instructions: e.target.value })}
            placeholder="Be warm and concise. Always confirm the caller's phone number. Offer to book a callback if unsure."
            rows={5}
          />
          <p className="text-xs text-slate-400">Tone and behavior guidance for the AI receptionist.</p>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="hours">Business hours</Label>
          <Textarea
            id="hours"
            value={hoursValue}
            disabled={!canWrite}
            onChange={(e) => setForm({ ...form, hours: e.target.value })}
            placeholder={'Mon–Fri 8am–6pm\nSat 9am–2pm\nSun closed'}
            rows={4}
          />
          <p className="text-xs text-slate-400">
            Used for after-hours handling. Free text or JSON, whichever your backend expects.
          </p>
        </div>

        {canWrite ? (
          <div className="flex justify-end">
            <Button onClick={save} disabled={saving}>
              <Save className="mr-1.5 h-4 w-4" />
              {saving ? 'Saving…' : 'Save voice settings'}
            </Button>
          </div>
        ) : (
          <p className="text-sm text-slate-400">You need admin access to edit these settings.</p>
        )}
      </CardContent>
    </Card>
  )
}
