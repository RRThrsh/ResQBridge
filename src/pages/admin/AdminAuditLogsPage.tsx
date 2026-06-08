import { useQuery } from 'convex/react'
import { api } from '../../../convex/_generated/api'
import { useAdminAuth } from '@/context/AdminAuthContext'
import { normalizeEmail } from '@/lib/admin'
import { useEffect, useMemo, useRef, useState } from 'react'

const ACTION_COLORS: Record<string, string> = {
  'user.signup': '#00ff88',
  'user.login': '#00ff88',
  'user.login.failed': '#ff4444',
  'user.account_locked': '#ff4444',
  'user.update_profile': '#00ff88',
  'user.report.submit': '#ffcc00',
  'user.report.update': '#ffcc00',
  'user.report.delete': '#ff4444',
  'user.password_reset': '#ff8800',
  'user.logout': '#ff4444',
  'admin.login': '#00aaff',
  'admin.logout': '#00aaff',
  'admin.update_profile': '#00aaff',
  'admin.change_password': '#ff8800',
  'admin.add': '#ff44ff',
  'admin.remove': '#ff4444',
  'admin.update': '#00aaff',
  'admin.report.update': '#00aaff',
  'admin.report.delete': '#ff4444',
  'admin.report.assign_rescuer': '#ff8800',
  'admin.report.reassign': '#ff8800',
  'admin.rescuer.add': '#ff44ff',
  'admin.rescuer.update': '#00aaff',
  'admin.rescuer.remove': '#ff4444',
  'admin.approver.add': '#ff44ff',
  'admin.approver.remove': '#ff4444',
  'admin.wildlife.create': '#ff44ff',
  'admin.wildlife.update': '#00aaff',
  'admin.wildlife.delete': '#ff4444',
  'admin.news.create': '#ff44ff',
  'admin.news.update': '#00aaff',
  'admin.news.delete': '#ff4444',
  'admin.password_reset': '#ff8800',
  'rescuer.login': '#88ff88',
  'rescuer.accept_report': '#88ff88',
  'rescuer.mark_en_route': '#88ff88',
  'rescuer.complete_rescue': '#88ff88',
  'rescuer.password_reset': '#ff8800',
  'rescuer.logout': '#ff4444',
  'domestic_approver.login': '#88aaff',
  'domestic_approver.logout': '#ff4444',
  'guest.page_view': '#aaaaaa',
}

const ACTION_LABELS: Record<string, string> = {
  'user.signup': 'USER SIGNUP',
  'user.login': 'USER LOGIN',
  'user.login.failed': 'LOGIN FAILED',
  'user.account_locked': 'ACCOUNT LOCKED',
  'user.update_profile': 'USER UPDATE PROFILE',
  'user.report.submit': 'REPORT SUBMITTED',
  'user.report.update': 'REPORT UPDATED',
  'user.report.delete': 'REPORT DELETED',
  'user.password_reset': 'PASSWORD RESET',
  'user.logout': 'USER LOGOUT',
  'admin.login': 'ADMIN LOGIN',
  'admin.logout': 'ADMIN LOGOUT',
  'admin.update_profile': 'ADMIN UPDATE PROFILE',
  'admin.change_password': 'ADMIN CHANGE PASSWORD',
  'admin.add': 'ADMIN ADDED',
  'admin.remove': 'ADMIN REMOVED',
  'admin.update': 'ADMIN UPDATED',
  'admin.report.update': 'ADMIN EDIT REPORT',
  'admin.report.delete': 'ADMIN DELETE REPORT',
  'admin.report.assign_rescuer': 'RESCUER ASSIGNED',
  'admin.report.reassign': 'RESCUER REASSIGNED',
  'admin.rescuer.add': 'RESCUER ADDED',
  'admin.rescuer.update': 'RESCUER UPDATED',
  'admin.rescuer.remove': 'RESCUER REMOVED',
  'admin.approver.add': 'APPROVER ADDED',
  'admin.approver.remove': 'APPROVER REMOVED',
  'admin.wildlife.create': 'WILDLIFE CREATED',
  'admin.wildlife.update': 'WILDLIFE UPDATED',
  'admin.wildlife.delete': 'WILDLIFE DELETED',
  'admin.news.create': 'NEWS CREATED',
  'admin.news.update': 'NEWS UPDATED',
  'admin.news.delete': 'NEWS DELETED',
  'admin.password_reset': 'ADMIN PASSWORD RESET',
  'rescuer.login': 'RESCUER LOGIN',
  'rescuer.accept_report': 'RESCUER ACCEPTED',
  'rescuer.mark_en_route': 'RESCUER EN ROUTE',
  'rescuer.complete_rescue': 'RESCUE COMPLETED',
  'rescuer.password_reset': 'RESCUER PASSWORD RESET',
  'rescuer.logout': 'RESCUER LOGOUT',
  'domestic_approver.login': 'APPROVER LOGIN',
  'domestic_approver.logout': 'APPROVER LOGOUT',
  'guest.page_view': 'GUEST PAGE VIEW',
}

function formatTimestamp(ts: number): string {
  const d = new Date(ts)
  return d.toISOString().replace('T', ' ').slice(0, 19)
}

type AuditLogEntry = {
  _id: string
  _creationTime: number
  action: string
  actorEmail: string
  actorName?: string
  actorRole?: string
  targetType?: string
  targetId?: string
  details?: string
  metadata?: string
  ipAddress?: string
  createdAt: number
}

function extractActorName(log: AuditLogEntry): string {
  if (log.actorName?.trim()) return log.actorName.trim()
  return log.actorEmail.split('@')[0]
}

function buildLogObject(log: AuditLogEntry): Record<string, unknown> {
  const obj: Record<string, unknown> = {
    action: log.action,
    actor: log.actorEmail,
    timestamp: formatTimestamp(log.createdAt),
  }

  if (log.actorName) obj.actorName = log.actorName
  if (log.actorRole) obj.role = log.actorRole
  if (log.targetType) obj.targetType = log.targetType
  if (log.targetId) obj.targetId = log.targetId
  if (log.ipAddress) obj.ip = log.ipAddress

  if (log.details) {
    try {
      obj.details = JSON.parse(log.details)
    } catch {
      obj.details = log.details
    }
  }

  if (log.metadata) {
    try {
      obj.metadata = JSON.parse(log.metadata)
    } catch {
      obj.metadata = log.metadata
    }
  }

  return obj
}

export function AdminAuditLogsPage() {
  const { admin } = useAdminAuth()
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [refreshTick, setRefreshTick] = useState(0)
  const [roleFilter, setRoleFilter] = useState<string>('all')
  const scrollRef = useRef<HTMLDivElement>(null)

  const adminEmail = admin ? normalizeEmail(admin.email) : null

  const logs = useQuery(
    api.auditLogs.list,
    adminEmail ? { adminEmail, limit: 500 } : 'skip',
  )

  const filteredLogs = useMemo(() => {
    const reversed = logs?.slice().reverse()
    return reversed?.filter(
      (log) => roleFilter === 'all' || log.actorRole === roleFilter,
    )
  }, [logs, roleFilter])

  useEffect(() => {
    const id = setInterval(() => setRefreshTick((t) => t + 1), 1000)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    if (!scrollRef.current || !filteredLogs) return
    scrollRef.current.scrollTop = scrollRef.current.scrollHeight
  }, [filteredLogs?.length])

  if (!admin) return null

  return (
    <div
      className="mx-auto w-full max-w-full"
      style={{
        fontFamily: "'Courier New', 'Consolas', monospace",
      }}
    >
      <div className="rounded-lg border border-[#00ff8844] bg-[#0a0a0a] p-4 sm:p-6">
        {/* Header */}
        <pre
          className="mb-6 text-xs leading-tight text-[#00ff88] sm:text-sm"
          style={{
            textShadow: '0 0 8px rgba(0,255,136,0.3)',
          }}
        >
{`  ╔══════════════════════════════════════╗
  ║  🐱  AUDIT LOG TERMINAL  v1.0  🐱  ║
  ╚══════════════════════════════════════╝
`}
        </pre>

        {/* Role filter */}
        <div className="mb-4 flex items-center gap-2 text-[10px] uppercase tracking-widest text-[#00ff8877]">
          <span>Filter by role:</span>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="rounded border border-[#00ff8844] bg-[#0a0a0a] px-2 py-1 text-[10px] uppercase text-[#00ff88] outline-none focus:border-[#00ff88]"
          >
            <option value="all">All</option>
            <option value="user">User</option>
            <option value="admin">Admin</option>
            <option value="rescuer">Rescuer</option>
            <option value="domestic_approver">Approver</option>
            <option value="guest">Guest</option>
          </select>
        </div>

        {logs === undefined ? (
          <div className="py-12 text-center text-[#00ff8866]">
            <span className="animate-pulse">
              connecting to audit stream...
            </span>
          </div>
        ) : logs.length === 0 ? (
          <div className="py-12 text-center text-[#00ff8866]">
            <p>{'>'} No audit logs found.</p>
          </div>
        ) : filteredLogs === undefined || filteredLogs.length === 0 ? (
          <div className="py-12 text-center text-[#00ff8866]">
            <p>{'>'} No logs match the selected filter.</p>
          </div>
        ) : (
            <div className="overflow-hidden rounded-md border border-[#00ff8815]">
              {/* Fixed Height Container */}
              <div ref={scrollRef} className="h-[650px] overflow-y-auto">
                {/* Sticky Header */}
                <div className="sticky top-0 z-20 grid grid-cols-[24px_200px_120px_90px_120px_180px] border-b border-[#00ff8822] bg-[#0a0a0a] px-2 py-2 text-[10px] uppercase tracking-widest text-[#00ff8877] backdrop-blur">
                  <span />
                  <span>Action</span>
                  <span>Actor</span>
                  <span>Role</span>
                  <span>IP</span>
                  <span className="text-right">Timestamp</span>
                </div>

              {filteredLogs!.map((log) => {
                const color =
                  ACTION_COLORS[log.action] ?? '#ffffff'

                const label =
                  ACTION_LABELS[log.action] ??
                  log.action.toUpperCase()

                const isExpanded =
                  expandedId === log._id

                const logObj =
                  buildLogObject(log)

                return (
                  <div
                    key={log._id}
                    className="border-b border-[#ffffff08]"
                  >
                    <button
                      type="button"
                      onClick={() =>
                        setExpandedId(
                          isExpanded ? null : log._id,
                        )
                      }
                      className="w-full text-left transition-colors hover:bg-[#ffffff05]"
                    >
                      <div className="grid grid-cols-[24px_200px_120px_90px_120px_180px] items-center px-2 py-2">
                        <span
                          className={`text-xs transition-transform ${
                            isExpanded
                              ? 'rotate-90'
                              : ''
                          }`}
                          style={{
                            color: '#00ff8877',
                          }}
                        >
                          ▶
                        </span>

                        <span
                          className="truncate text-xs font-bold tracking-wide"
                          style={{
                            color,
                            textShadow: `0 0 6px ${color}`,
                          }}
                        >
                          [{label}]
                        </span>

                        <span className="truncate text-xs text-[#999]">
                          {extractActorName(log)}
                        </span>

                        <span className="truncate text-xs text-[#666]">
                          {log.actorRole ?? '-'}
                        </span>

                        <span className="truncate text-[10px] text-[#555] font-mono">
                          {log.ipAddress ?? '-'}
                        </span>

                        <span className="text-right text-[10px] text-[#555]">
                          {formatTimestamp(
                            log.createdAt,
                          )}
                        </span>
                      </div>
                    </button>

                    {/* Expandable JSON */}
                    <div
                      className={`overflow-hidden transition-all duration-300 ease-out ${
                        isExpanded
                          ? 'max-h-[600px]'
                          : 'max-h-0'
                      }`}
                    >
                      <div className="bg-[#00000055] px-4 py-3">
                        <pre className="overflow-x-auto text-[11px] leading-relaxed text-[#bdbdbd]">
{JSON.stringify(logObj, null, 2)}
                        </pre>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-4 border-t border-[#00ff8822] pt-3 text-[10px] text-[#00ff8844]">
          <span className="animate-pulse">●</span>
          {' '}LIVE
          {' | '}
          {logs?.length ?? 0} total
          {' | '}
          {filteredLogs?.length ?? 0} shown
          {' | '}
          {refreshTick}s
          {' | '}
          click row to inspect payload
        </div>
      </div>
    </div>
  )
}