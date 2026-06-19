import { useState, useEffect } from 'react'
import { admin as adminApi } from '../../services/api'

export default function Permissions() {
  const [noAdmin, setNoAdmin] = useState(false)

  useEffect(() => {
    adminApi.getUsers()
      .then((res) => {
        const admins = (res.users || []).filter((u) => u.role === 'admin')
        setNoAdmin(admins.length === 0)
      })
      .catch(() => {})
  }, [])

  if (noAdmin) {
    return <p className="text-sm text-gray-500">No admin user yet.</p>
  }

  return <div />
}