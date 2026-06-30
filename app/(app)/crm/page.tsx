'use client'

import * as React from 'react'
import { useSearchParams } from 'next/navigation'
import { Search, Users2, Plus, CheckCircle2, Circle, ListTodo } from 'lucide-react'
import { PageHeader } from '@/components/app/page-header'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input, Select } from '@/components/ui/input'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  EmptyState,
  ErrorState,
  TableSkeleton,
  LoadingState,
  NotConfiguredState,
} from '@/components/app/states'
import { LeadDrawer } from '@/components/app/lead-drawer'
import { useAuth } from '@/components/app/auth-provider'
import { useApi } from '@/lib/use-api'
import {
  api,
  asArray,
  can,
  errorMessage,
  isApiConfigured,
  type Lead,
  type PipelineStage,
  type Task,
} from '@/lib/api'
import { formatRelative, leadDisplayName, statusTone, titleCase } from '@/lib/format'

export default function CrmPage() {
  const { me, configured } = useAuth()
  const role = (me?.role as string) ?? null
  const params = useSearchParams()

  const leads = useApi(() => api.leads.list().then((r) => asArray<Lead>(r)), [])
  const [localLeads, setLocalLeads] = React.useState<Lead[] | null>(null)
  React.useEffect(() => setLocalLeads(leads.data), [leads.data])

  const [search, setSearch] = React.useState('')
  const [statusFilter, setStatusFilter] = React.useState('')
  const [activeLeadId, setActiveLeadId] = React.useState<string | null>(null)

  // Deep-link: /crm?lead=<id> opens the drawer.
  React.useEffect(() => {
    const id = params.get('lead')
    if (id) setActiveLeadId(id)
  }, [params])

  if (!configured || !isApiConfigured) {
    return (
      <>
        <PageHeader title="CRM" description="Leads, pipeline, and follow-ups." />
        <NotConfiguredState feature="The CRM" />
      </>
    )
  }

  const allLeads = localLeads ?? []
  const statuses = Array.from(
    new Set(allLeads.map((l) => l.status).filter(Boolean) as string[])
  )

  const filtered = allLeads.filter((l) => {
    if (statusFilter && (l.status ?? '') !== statusFilter) return false
    if (search) {
      const q = search.toLowerCase()
      const hay = [l.name, l.phone, l.email, l.source, l.stage]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
      if (!hay.includes(q)) return false
    }
    return true
  })

  const activeLead = allLeads.find((l) => l.id === activeLeadId) ?? null

  const handleLeadUpdated = (updated: Lead) => {
    setLocalLeads((prev) =>
      (prev ?? []).map((l) => (l.id === updated.id ? { ...l, ...updated } : l))
    )
  }

  return (
    <>
      <PageHeader
        title="CRM"
        description="Every lead Pivot AI captures, with pipeline and follow-up tracking."
      />

      <Tabs defaultValue="leads">
        <TabsList>
          <TabsTrigger value="leads">Leads</TabsTrigger>
          <TabsTrigger value="pipeline">Pipeline</TabsTrigger>
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
        </TabsList>

        {/* ── Leads ── */}
        <TabsContent value="leads">
          <Card>
            <CardContent className="p-4">
              <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search by name, phone, email…"
                    className="pl-9"
                  />
                </div>
                <div className="sm:w-48">
                  <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                    <option value="">All statuses</option>
                    {statuses.map((s) => (
                      <option key={s} value={s}>
                        {titleCase(s)}
                      </option>
                    ))}
                  </Select>
                </div>
              </div>

              {leads.loading ? (
                <TableSkeleton rows={6} cols={4} />
              ) : leads.error ? (
                <ErrorState message={leads.error} onRetry={leads.refetch} />
              ) : allLeads.length === 0 ? (
                <EmptyState
                  icon={Users2}
                  title="No leads yet"
                  description="When Pivot AI answers a call and captures a caller, they'll appear here automatically."
                />
              ) : filtered.length === 0 ? (
                <EmptyState
                  icon={Search}
                  title="No matching leads"
                  description="Try a different search or clear the status filter."
                />
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="hidden md:table-cell">Source</TableHead>
                      <TableHead className="hidden md:table-cell">Added</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.map((lead) => (
                      <TableRow
                        key={lead.id}
                        className="cursor-pointer"
                        onClick={() => setActiveLeadId(lead.id)}
                      >
                        <TableCell className="font-medium">{leadDisplayName(lead)}</TableCell>
                        <TableCell className="text-slate-500">
                          {lead.phone || lead.email || '—'}
                        </TableCell>
                        <TableCell>
                          {lead.status ? (
                            <Badge variant={statusTone(lead.status)} className="capitalize">
                              {lead.status}
                            </Badge>
                          ) : (
                            <span className="text-slate-400">—</span>
                          )}
                        </TableCell>
                        <TableCell className="hidden text-slate-500 md:table-cell">
                          {lead.source || '—'}
                        </TableCell>
                        <TableCell className="hidden text-slate-400 md:table-cell">
                          {formatRelative(lead.created_at)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}

              {!leads.loading && filtered.length > 0 && (
                <p className="mt-3 text-xs text-slate-400">
                  Showing {filtered.length} of {allLeads.length} leads
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Pipeline ── */}
        <TabsContent value="pipeline">
          <PipelineBoard onOpenLead={setActiveLeadId} />
        </TabsContent>

        {/* ── Tasks ── */}
        <TabsContent value="tasks">
          <TasksPanel role={role} />
        </TabsContent>
      </Tabs>

      <LeadDrawer
        lead={activeLead}
        open={Boolean(activeLeadId)}
        onClose={() => setActiveLeadId(null)}
        role={role}
        onUpdated={handleLeadUpdated}
      />
    </>
  )
}

/* ─────────────────────────── Pipeline ─────────────────────────── */

function PipelineBoard({ onOpenLead }: { onOpenLead: (id: string) => void }) {
  const pipeline = useApi(() => api.pipeline().then((r) => asArray<PipelineStage>(r)), [])

  if (pipeline.loading) return <LoadingState label="Loading pipeline…" />
  if (pipeline.error) return <ErrorState message={pipeline.error} onRetry={pipeline.refetch} />
  const stages = pipeline.data ?? []
  if (stages.length === 0) {
    return (
      <EmptyState
        icon={Users2}
        title="Pipeline is empty"
        description="Your pipeline stages will populate as leads move through them."
      />
    )
  }

  return (
    <div className="flex gap-4 overflow-x-auto pb-2">
      {stages.map((stage) => (
        <div key={stage.stage} className="w-72 flex-shrink-0">
          <div className="mb-2 flex items-center justify-between px-1">
            <h3 className="text-sm font-semibold capitalize text-navy-900">
              {titleCase(stage.stage)}
            </h3>
            <Badge variant="secondary">{stage.count ?? stage.leads?.length ?? 0}</Badge>
          </div>
          <div className="space-y-2 rounded-xl bg-slate-100/70 p-2">
            {(stage.leads ?? []).length === 0 ? (
              <p className="px-2 py-6 text-center text-xs text-slate-400">No leads</p>
            ) : (
              (stage.leads ?? []).map((lead) => (
                <button
                  key={lead.id}
                  onClick={() => onOpenLead(lead.id)}
                  className="w-full rounded-lg border border-slate-200 bg-white p-3 text-left shadow-sm transition-shadow hover:shadow-md"
                >
                  <p className="truncate text-sm font-medium text-navy-900">
                    {leadDisplayName(lead)}
                  </p>
                  <p className="truncate text-xs text-slate-500">
                    {lead.phone || lead.email || '—'}
                  </p>
                </button>
              ))
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

/* ─────────────────────────── Tasks ─────────────────────────── */

function TasksPanel({ role }: { role: string | null }) {
  const writable = can.write(role)
  const tasks = useApi(() => api.tasks.list().then((r) => asArray<Task>(r)), [])
  const [items, setItems] = React.useState<Task[] | null>(null)
  React.useEffect(() => setItems(tasks.data), [tasks.data])

  const [newTitle, setNewTitle] = React.useState('')
  const [creating, setCreating] = React.useState(false)
  const [actionError, setActionError] = React.useState<string | null>(null)

  const isDone = (t: Task) =>
    ['done', 'completed', 'closed'].includes((t.status ?? '').toLowerCase())

  const toggle = async (task: Task) => {
    const next = isDone(task) ? 'open' : 'done'
    setItems((prev) => (prev ?? []).map((t) => (t.id === task.id ? { ...t, status: next } : t)))
    try {
      await api.tasks.update(task.id, { status: next })
    } catch (err) {
      setActionError(errorMessage(err))
      tasks.refetch()
    }
  }

  const create = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTitle.trim()) return
    setCreating(true)
    setActionError(null)
    try {
      const created = await api.tasks.create({ title: newTitle.trim(), status: 'open' })
      setItems((prev) => [created, ...(prev ?? [])])
      setNewTitle('')
    } catch (err) {
      setActionError(errorMessage(err))
    } finally {
      setCreating(false)
    }
  }

  const list = items ?? []

  return (
    <Card>
      <CardContent className="p-4">
        {writable && (
          <form onSubmit={create} className="mb-4 flex gap-2">
            <Input
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Add a follow-up task…"
            />
            <Button type="submit" disabled={creating || !newTitle.trim()}>
              <Plus className="mr-1 h-4 w-4" /> Add
            </Button>
          </form>
        )}

        {actionError && <div className="mb-3"><ErrorState message={actionError} /></div>}

        {tasks.loading ? (
          <TableSkeleton rows={4} cols={2} />
        ) : tasks.error ? (
          <ErrorState message={tasks.error} onRetry={tasks.refetch} />
        ) : list.length === 0 ? (
          <EmptyState
            icon={ListTodo}
            title="No tasks"
            description={writable ? 'Add a follow-up task to stay on top of your leads.' : 'No follow-up tasks have been created.'}
          />
        ) : (
          <ul className="divide-y divide-slate-100">
            {list.map((task) => (
              <li key={task.id} className="flex items-center gap-3 py-3">
                <button
                  onClick={() => writable && toggle(task)}
                  disabled={!writable}
                  className="flex-shrink-0 disabled:cursor-default"
                  aria-label={isDone(task) ? 'Mark incomplete' : 'Mark complete'}
                >
                  {isDone(task) ? (
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                  ) : (
                    <Circle className="h-5 w-5 text-slate-300" />
                  )}
                </button>
                <div className="min-w-0 flex-1">
                  <p
                    className={
                      isDone(task)
                        ? 'truncate text-sm text-slate-400 line-through'
                        : 'truncate text-sm font-medium text-navy-900'
                    }
                  >
                    {task.title || 'Untitled task'}
                  </p>
                  {task.due_at && (
                    <p className="text-xs text-slate-400">Due {formatRelative(task.due_at)}</p>
                  )}
                </div>
                {task.status && (
                  <Badge variant={statusTone(task.status)} className="capitalize">
                    {task.status}
                  </Badge>
                )}
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
