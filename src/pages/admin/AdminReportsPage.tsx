import { Navigate } from 'react-router-dom'

/** @deprecated Use /pwrcc/admin/reports/wildlife */
export function AdminReportsPage() {
  return <Navigate to="/pwrcc/admin/reports/wildlife" replace />
}
