'use client'

import * as React from 'react'
import { Phone, Mail, Tag, Calendar, Send, StickyNote } from 'lucide-react'
import { Drawer } from '@/components/ui/drawer'
import { Button } from '@/components/ui/button'
import { Textarea, Select } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Spinner, ErrorState } from '@/components/app/states'
import { useApi } from '@/lib/use-api'
import {
  api,
  asArray,
  can,
  errorMessage,
  type Lead,
  type LeadNote,
} from '@/lib/api'
import { formatDateTime, formatRelative, leadDisplayName, statusTone } from '@/lib/format'

const STATUS_OPTIONS = ['new', 'open', 'contacted', 'qualified', 'won', 'lost']

export function LeadDrawer({
  lead,
  open,
  onClose,
  role,
  onUpdated,
}: {
  lead: Lead | null
  open: boolean
  onClose: () => void
  role?: string | null
  onUpdated?: (lead: Lead) => void
}) {
  const writable = can.write(role)
  const [status, setStatus] = React.useState<string>('')
  const [savingStatus, setSavingStatus] = React.useState(false)
  const [noteBody, setNoteBody] = React.useState('')
  const [savingNote, setSavingNote] = React.useState(false)
  const [actionError, setActionError] = React.useState<string | null>(null)

  React.useEffect(() => {
    setStatus(lead?.status ?? '')
    setActionError(null)
    setNoteBody('')
  }, [lead?.id, lead?.status])

  const notes = useApi(
    () => (lead ? api.leads.notes.list(lead.id).then((r) => asArray<LeadNote>(r)) : Promise.resolve([])),
    [lead?.id, open]
  )

  if (!lead) return null

  const handleStatusChange = async (next: string) => {
    setStatus(next)
    setSavingStatus(true)
    setActionError(null)
    try {
      const updated = await api.leads.update(lead.id, { status: next })
      onUpdated?.({ ...lead, ...updated, status: next })
    } catch (err) {
      setActionError(errorMessage(err))
      setStatus(lead.status ?? '')
    } finally {
      setSavingStatus(false)
    }
  }

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!noteBody.trim()) return
    setSavingNote(true)
    setActionError(null)
    try {
      await api.leads.notes.create(lead.id, { body: noteBody.trim() })
      setNoteBody('')
      notes.refetch()
    } catch (err) {
      setActionError(errorMessage(err))
    } finally {
      setSavingNote(false)
    }
  }

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title={leadDisplayName(lead)}
      description={lead.source ? `Source: ${lead.source}` : undefined}
    >
      <div className="space-y-6">
        {/* Contact details */}
        <div className="space-y-2.5">
          <DetailRow icon={Phone} label="Phone" value={lead.phone} href={lead.phone ? `tel:${lead.phone}` : undefined} />
          <DetailRow icon={Mail} label="Email" value={lead.email} href={lead.email ? `mailto:${lead.email}` : undefined} />
          <DetailRow icon={Tag} label="Stage" value={lead.stage} />
          <DetailRow icon={Calendar} label="Created" value={formatDateTime(lead.created_at)} />
        </div>

        {actionError && <ErrorState message={actionError} />}

        {/* Status */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-navy-900">
            Status {savingStatus && <Spinner className="ml-2 inline h-3.5 w-3.5" />}
          </label>
          {writable ? (
            <Select value={status} onChange={(e) => handleStatusChange(e.target.value)} disabled={savingStatus}>
              <option value="">— Set status —</option>
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s} className="capitalize">
                  {s}
                </option>
              ))}
              {status && !STATUS_OPTIONS.includes(status) && (
                <option value={status}>{status}</option>
              )}
            </Select>
          ) : (
            <Badge variant={statusTone(lead.status)} className="capitalize">
              {lead.status || 'No status'}
            </Badge>
          )}
        </div>

        {/* Notes */}
        <div>
          <div className="mb-3 flex items-center gap-2">
            <StickyNote className="h-4 w-4 text-slate-400" />
            <h3 className="text-sm font-semibold text-navy-900">Notes</h3>
          </div>

          {writable && (
            <form onSubmit={handleAddNote} className="mb-4 space-y-2">
              <Textarea
                value={noteBody}
                onChange={(e) => setNoteBody(e.target.value)}
                placeholder="Add a note about this lead…"
                rows={2}
              />
              <div className="flex justify-end">
                <Button type="submit" size="sm" disabled={savingNote || !noteBody.trim()}>
                  {savingNote ? 'Saving…' : (
                    <>
                      <Send className="mr-1.5 h-3.5 w-3.5" /> Add note
                    </>
                  )}
                </Button>
              </div>
            </form>
          )}

          {notes.loading ? (
            <div className="py-4 text-center">
              <Spinner className="mx-auto" />
            </div>
          ) : notes.error ? (
            <ErrorState message={notes.error} onRetry={notes.refetch} />
          ) : (notes.data ?? []).length === 0 ? (
            <p className="py-4 text-center text-sm text-slate-500">No notes yet.</p>
          ) : (
            <ul className="space-y-3">
              {(notes.data ?? []).map((n) => (
                <li key={n.id} className="rounded-lg border border-slate-100 bg-slate-50/60 p-3">
                  <p className="whitespace-pre-wrap text-sm text-navy-900">{n.body}</p>
                  <p className="mt-1.5 text-xs text-slate-400">
                    {n.author ? `${n.author} · ` : ''}
                    {formatRelative(n.created_at)}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </Drawer>
  )
}

function DetailRow({
  icon: Icon,
  label,
  value,
  href,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value?: string | null
  href?: string
}) {
  return (
    <div className="flex items-center gap-3 text-sm">
      <Icon className="h-4 w-4 flex-shrink-0 text-slate-400" />
      <span className="w-16 flex-shrink-0 text-slate-500">{label}</span>
      {href && value ? (
        <a href={href} className="truncate font-medium text-navy-900 hover:underline">
          {value}
        </a>
      ) : (
        <span className="truncate font-medium text-navy-900">{value || '—'}</span>
      )}
    </div>
  )
}
