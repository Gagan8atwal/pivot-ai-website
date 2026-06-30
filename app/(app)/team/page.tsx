'use client'

import * as React from 'react'
import { UsersRound, UserPlus, Trash2, ShieldAlert } from 'lucide-react'
import { PageHeader } from '@/components/app/page-header'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input, Select, Label } from '@/components/ui/input'
import { Modal } from '@/components/ui/drawer'
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
  NotConfiguredState,
} from '@/components/app/states'
import { FormError, FormSuccess } from '@/components/app/auth-card'
import { useAuth } from '@/components/app/auth-provider'
import { useApi } from '@/lib/use-api'
import {
  api,
  asArray,
  can,
  roleRank,
  errorMessage,
  isApiConfigured,
  type TeamMember,
} from '@/lib/api'
import { titleCase } from '@/lib/format'

// Deterministic avatar tint from a string (no external dep).
const AVATAR_TONES = [
  'bg-navy-100 text-navy-800',
  'bg-amber-100 text-amber-800',
  'bg-green-100 text-green-800',
  'bg-blue-100 text-blue-800',
  'bg-purple-100 text-purple-800',
]
function initialsTone(seed: string): string {
  let h = 0
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0
  return AVATAR_TONES[h % AVATAR_TONES.length]
}

const ASSIGNABLE_ROLES = [
  { id: 'viewer', label: 'Viewer — read only' },
  { id: 'driver', label: 'Driver — read only' },
  { id: 'dispatcher', label: 'Dispatcher — can edit' },
  { id: 'mechanic', label: 'Mechanic — can edit' },
  { id: 'employee', label: 'Employee — can edit' },
  { id: 'manager', label: 'Manager — admin' },
  { id: 'admin', label: 'Admin — admin' },
  { id: 'owner', label: 'Owner — full control' },
]

function roleBadgeTone(role: string): 'default' | 'amber' | 'secondary' {
  const r = roleRank(role)
  if (r >= 4) return 'amber'
  if (r >= 3) return 'default'
  return 'secondary'
}

export default function TeamPage() {
  const { me } = useAuth()
  const myRole = (me?.role as string) ?? null
  const isAdmin = can.admin(myRole)
  const isOwner = can.owner(myRole)

  const team = useApi(() => api.team.list().then((r) => asArray<TeamMember>(r)), [])
  const [members, setMembers] = React.useState<TeamMember[] | null>(null)
  React.useEffect(() => setMembers(team.data), [team.data])

  const [inviteOpen, setInviteOpen] = React.useState(false)
  const [inviteEmail, setInviteEmail] = React.useState('')
  const [inviteRole, setInviteRole] = React.useState('dispatcher')
  const [busy, setBusy] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [success, setSuccess] = React.useState<string | null>(null)
  const [removeTarget, setRemoveTarget] = React.useState<TeamMember | null>(null)

  if (!isApiConfigured) {
    return (
      <>
        <PageHeader title="Team" description="Invite teammates and manage roles." />
        <NotConfiguredState feature="Team management" />
      </>
    )
  }

  const list = members ?? []
  const ownerCount = list.filter((m) => roleRank(m.role) >= 4).length

  // Roles a non-owner admin may assign exclude owner grants.
  const assignable = ASSIGNABLE_ROLES.filter((r) => isOwner || r.id !== 'owner')

  const invite = async (e: React.FormEvent) => {
    e.preventDefault()
    setBusy(true)
    setError(null)
    setSuccess(null)
    try {
      const created = await api.team.invite({ email: inviteEmail.trim(), role: inviteRole })
      setSuccess(`Invitation sent to ${inviteEmail}.`)
      setMembers((prev) => [created, ...(prev ?? [])])
      setInviteEmail('')
      setInviteOpen(false)
    } catch (err) {
      setError(errorMessage(err))
    } finally {
      setBusy(false)
    }
  }

  const changeRole = async (member: TeamMember, role: string) => {
    setError(null)
    setSuccess(null)
    const prev = members
    setMembers((p) => (p ?? []).map((m) => (m.user_id === member.user_id ? { ...m, role } : m)))
    try {
      await api.team.update(member.user_id, { role })
    } catch (err) {
      setError(errorMessage(err))
      setMembers(prev ?? null)
    }
  }

  const remove = async () => {
    if (!removeTarget) return
    setBusy(true)
    setError(null)
    try {
      await api.team.remove(removeTarget.user_id)
      setMembers((p) => (p ?? []).filter((m) => m.user_id !== removeTarget.user_id))
      setRemoveTarget(null)
    } catch (err) {
      setError(errorMessage(err))
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <PageHeader
        title="Team"
        description="Invite teammates and control what each person can do."
        actions={
          isAdmin && (
            <Button onClick={() => setInviteOpen(true)}>
              <UserPlus className="mr-1.5 h-4 w-4" /> Invite member
            </Button>
          )
        }
      />

      {error && <div className="mb-4"><FormError message={error} /></div>}
      {success && <div className="mb-4"><FormSuccess message={success} /></div>}

      <Card>
        <CardContent className="p-4">
          {team.loading ? (
            <TableSkeleton rows={5} cols={3} />
          ) : team.error ? (
            <ErrorState message={team.error} onRetry={team.refetch} />
          ) : list.length === 0 ? (
            <EmptyState
              icon={UsersRound}
              title="No team members yet"
              description={isAdmin ? 'Invite your first teammate to collaborate.' : 'Your team roster will appear here.'}
              action={isAdmin ? <Button onClick={() => setInviteOpen(true)}><UserPlus className="mr-1 h-4 w-4" />Invite member</Button> : undefined}
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Member</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead className="hidden sm:table-cell">Status</TableHead>
                  {isAdmin && <TableHead className="text-right">Actions</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {list.map((m) => {
                  const isLastOwner = roleRank(m.role) >= 4 && ownerCount <= 1
                  const isSelf = m.user_id === me?.user?.id
                  // Admins can't manage someone ranked above them; owner grants need owner.
                  const canManage = isAdmin && roleRank(myRole) >= roleRank(m.role)
                  return (
                    <TableRow key={m.user_id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div
                            className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-sm font-semibold ${initialsTone(m.email ?? m.name ?? '')}`}
                          >
                            {(m.name?.[0] ?? m.email?.[0] ?? '?').toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="truncate font-medium text-navy-900">
                              {m.name || m.email || 'Member'}
                              {isSelf && <span className="ml-1 text-xs text-slate-400">(you)</span>}
                            </p>
                            {m.name && m.email && (
                              <p className="truncate text-xs text-slate-500">{m.email}</p>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {canManage && !isLastOwner ? (
                          <Select
                            value={String(m.role)}
                            onChange={(e) => changeRole(m, e.target.value)}
                            className="h-9 w-40"
                          >
                            {assignable.map((r) => (
                              <option key={r.id} value={r.id}>
                                {titleCase(r.id)}
                              </option>
                            ))}
                          </Select>
                        ) : (
                          <Badge variant={roleBadgeTone(String(m.role))} className="capitalize">
                            {titleCase(String(m.role))}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <Badge variant={m.status === 'active' ? 'success' : 'secondary'} className="capitalize">
                          {titleCase(m.status) || 'Active'}
                        </Badge>
                      </TableCell>
                      {isAdmin && (
                        <TableCell className="text-right">
                          {isLastOwner ? (
                            <span className="inline-flex items-center gap-1 text-xs text-slate-400">
                              <ShieldAlert className="h-3.5 w-3.5" /> Last owner
                            </span>
                          ) : canManage && !isSelf ? (
                            <button
                              onClick={() => setRemoveTarget(m)}
                              className="rounded-md p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600"
                              aria-label="Remove member"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          ) : (
                            <span className="text-slate-300">—</span>
                          )}
                        </TableCell>
                      )}
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <p className="mt-4 text-xs text-slate-400">
        Permissions: <strong>Owner</strong> (full control) · <strong>Admin / Manager</strong> (manage
        team &amp; settings) · <strong>Dispatcher / Mechanic / Employee</strong> (edit leads &amp;
        tasks) · <strong>Driver / Viewer</strong> (read only). Owner grants require owner; the last
        owner can&apos;t be removed.
      </p>

      {/* Invite modal */}
      <Modal
        open={inviteOpen}
        onClose={() => setInviteOpen(false)}
        title="Invite a team member"
        description="They'll receive an email to join your workspace."
      >
        <form onSubmit={invite} className="space-y-4">
          <FormError message={error} />
          <div className="space-y-1.5">
            <Label htmlFor="invite-email">Email</Label>
            <Input
              id="invite-email"
              type="email"
              required
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              placeholder="teammate@business.com"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="invite-role">Role</Label>
            <Select
              id="invite-role"
              value={inviteRole}
              onChange={(e) => setInviteRole(e.target.value)}
            >
              {assignable.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.label}
                </option>
              ))}
            </Select>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" type="button" onClick={() => setInviteOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={busy || !inviteEmail.trim()}>
              {busy ? 'Sending…' : 'Send invite'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Remove confirm */}
      <Modal
        open={Boolean(removeTarget)}
        onClose={() => setRemoveTarget(null)}
        title="Remove team member?"
        description={`${removeTarget?.name || removeTarget?.email || 'This member'} will lose access to the workspace.`}
      >
        <div className="flex justify-end gap-3">
          <Button variant="ghost" onClick={() => setRemoveTarget(null)}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={remove} disabled={busy}>
            {busy ? 'Removing…' : 'Remove member'}
          </Button>
        </div>
      </Modal>
    </>
  )
}
