import { useQuery } from 'convex/react'
import { api } from '../../../convex/_generated/api'
import { useAdminAuth } from '@/context/AdminAuthContext'
import { normalizeEmail } from '@/lib/admin'
import { useState } from 'react'

const ACTION_COLORS: Record<string, string> = {
  'user.signup': '#00ff88',
  'user.login': '#00ff88',
  'user.update_profile': '#00ff88',
  'user.report.submit': '#ffcc00',
  'user.report.update': '#ffcc00',
  'user.report.delete': '#ff4444',
  'admin.login': '#00aaff',
  'admin.update_profile': '#00aaff',
  'admin.change_password': '#ff8800',
  'admin.add': '#ff44ff',
  'admin.remove': '#ff4444',
  'admin.update': '#00aaff',
  'admin.report.update': '#00aaff',
  'admin.report.delete': '#ff4444',
  'admin.report.assign_rescuer': '#ff8800',
  'admin.rescuer.add': '#ff44ff',
  'admin.rescuer.update': '#00aaff',
  'admin.rescuer.remove': '#ff4444',
  'admin.wildlife.create': '#ff44ff',
  'admin.wildlife.update': '#00aaff',
  'admin.wildlife.delete': '#ff4444',
  'admin.news.create': '#ff44ff',
  'admin.news.update': '#00aaff',
  'admin.news.delete': '#ff4444',
  'rescuer.login': '#88ff88',
  'rescuer.mark_en_route': '#88ff88',
  'rescuer.complete_rescue': '#88ff88',
  'domestic_approver.login': '#88aaff',
}

const ACTION_LABELS: Record<string, string> = {
  'user.signup': 'USER SIGNUP',
  'user.login': 'USER LOGIN',
  'user.update_profile': 'USER UPDATE PROFILE',
  'user.report.submit': 'REPORT SUBMITTED',
  'user.report.update': 'REPORT UPDATED',
  'user.report.delete': 'REPORT DELETED',
  'admin.login': 'ADMIN LOGIN',
  'admin.update_profile': 'ADMIN UPDATE PROFILE',
  'admin.change_password': 'ADMIN CHANGE PASSWORD',
  'admin.add': 'ADMIN ADDED',
  'admin.remove': 'ADMIN REMOVED',
  'admin.update': 'ADMIN UPDATED',
  'admin.report.update': 'ADMIN EDIT REPORT',
  'admin.report.delete': 'ADMIN DELETE REPORT',
  'admin.report.assign_rescuer': 'RESCUER ASSIGNED',
  'admin.rescuer.add': 'RESCUER ADDED',
  'admin.rescuer.update': 'RESCUER UPDATED',
  'admin.rescuer.remove': 'RESCUER REMOVED',
  'admin.wildlife.create': 'WILDLIFE CREATED',
  'admin.wildlife.update': 'WILDLIFE UPDATED',
  'admin.wildlife.delete': 'WILDLIFE DELETED',
  'admin.news.create': 'NEWS CREATED',
  'admin.news.update': 'NEWS UPDATED',
  'admin.news.delete': 'NEWS DELETED',
  'rescuer.login': 'RESCUER LOGIN',
  'rescuer.mark_en_route': 'RESCUER EN ROUTE',
  'rescuer.complete_rescue': 'RESCUE COMPLETED',
  'domestic_approver.login': 'APPROVER LOGIN',
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
  createdAt: number
}

function extractActorName(log: AuditLogEntry): string {
  if (log.actorName && log.actorName.trim()) return log.actorName.trim()
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
  const adminEmail = admin ? normalizeEmail(admin.email) : null

  const logs = useQuery(
    api.auditLogs.list,
    adminEmail ? { adminEmail, limit: 200 } : 'skip',
  )

  if (!admin) return null

  return (
    <div className="mx-auto w-full max-w-full" style={{ fontFamily: "'Courier New', 'Consolas', monospace" }}>
      <div className="rounded-lg border border-[#00ff8844] bg-[#0a0a0a] p-4 sm:p-6">
        <pre className="mb-6 text-xs leading-tight text-[#00ff88] sm:text-sm" style={{ textShadow: '0 0 8px rgba(0,255,136,0.3)' }}>
          
        </pre>

        {logs === undefined ? (
          <div className="py-8 text-center text-[#00ff8866]">
            <span className="animate-pulse">connecting to audit stream...</span>
          </div>
        ) : logs.length === 0 ? (
          <div className="py-8 text-center text-[#00ff8866]">
            <p className="mb-2">{'>'} No audit logs found.</p>
            <p className="text-xs opacity-60">{'>'} Waiting for system events...</p>
          </div>
        ) : (
          <div className="space-y-1">
            {[...logs].reverse().map((log) => {
              const color = ACTION_COLORS[log.action] ?? '#ffffff'
              const label = ACTION_LABELS[log.action] ?? log.action.toUpperCase()
              const isExpanded = expandedId === log._id
              const logObj = buildLogObject(log)

              return (
                <div key={log._id} className="group">
                  <button
                    type="button"
                    onClick={() => setExpandedId(isExpanded ? null : log._id)}
                    className="w-full text-left transition-opacity hover:opacity-80"
                  >
                    <div className="flex items-start gap-2 border-b border-[#ffffff08] py-1.5">
                      <span className="mt-0.5 shrink-0 select-none text-[#00ff8844]">▸</span>
                      <span
                        className="shrink-0 select-none text-xs font-bold tracking-wider"
                        style={{ color, textShadow: `0 0 4px ${color}` }}
                      >
                        [{label}]
                      </span>
                      <span className="truncate text-xs text-[#888]">
                        {extractActorName(log)}
                      </span>
                      <span className="ml-auto shrink-0 text-[10px] text-[#444]">
                        {formatTimestamp(log.createdAt)}
                      </span>
                    </div>
                  </button>
                  {isExpanded && (
                    <div className="overflow-x-auto border-b border-[#ffffff08] bg-[#00000044] px-4 py-2">
                      <pre className="text-[11px] leading-relaxed text-[#aaa]">
{JSON.stringify(logObj, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}

        <div className="mt-4 border-t border-[#00ff8822] pt-3 text-[10px] text-[#00ff8844]">
          <span className="animate-pulse">●</span> LIVE &nbsp;|&nbsp; {logs?.length ?? 0} entries &nbsp;|&nbsp; click any row to expand JSON
        </div>
      </div>
    </div>
  )
}
