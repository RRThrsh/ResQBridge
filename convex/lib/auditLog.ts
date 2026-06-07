import type { MutationCtx } from '../_generated/server'

export type AuditLogAction =
  | 'user.signup'
  | 'user.login'
  | 'user.update_profile'
  | 'user.report.submit'
  | 'user.report.update'
  | 'user.report.delete'
  | 'admin.login'
  | 'admin.logout'
  | 'admin.update_profile'
  | 'admin.change_password'
  | 'admin.add'
  | 'admin.remove'
  | 'admin.update'
  | 'admin.report.view'
  | 'admin.report.update'
  | 'admin.report.delete'
  | 'admin.report.assign_rescuer'
  | 'admin.report.reassign'
  | 'admin.rescuer.add'
  | 'admin.rescuer.update'
  | 'admin.rescuer.remove'
  | 'admin.approver.add'
  | 'admin.approver.remove'
  | 'admin.wildlife.create'
  | 'admin.wildlife.update'
  | 'admin.wildlife.delete'
  | 'admin.news.create'
  | 'admin.news.update'
  | 'admin.news.delete'
  | 'rescuer.login'
  | 'rescuer.accept_report'
  | 'rescuer.mark_en_route'
  | 'rescuer.complete_rescue'
  | 'domestic_approver.login'
  | 'user.password_reset'
  | 'rescuer.password_reset'
  | 'admin.password_reset'

export async function writeAuditLog(
  ctx: MutationCtx,
  fields: {
    action: AuditLogAction
    actorEmail: string
    actorName?: string
    actorRole?: 'user' | 'admin' | 'rescuer' | 'domestic_approver'
    targetType?: string
    targetId?: string
    details?: string
    metadata?: string
  },
) {
  await ctx.db.insert('auditLogs', {
    action: fields.action,
    actorEmail: fields.actorEmail,
    actorName: fields.actorName ?? '',
    actorRole: fields.actorRole,
    targetType: fields.targetType,
    targetId: fields.targetId,
    details: fields.details,
    metadata: fields.metadata,
    createdAt: Date.now(),
  })
}
