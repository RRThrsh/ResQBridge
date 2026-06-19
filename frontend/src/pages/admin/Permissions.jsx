const roles = [
  {
    name: 'Superadmin',
    color: 'red',
    badge: 'bg-red-100 text-red-800',
    permissions: [
      'Full system access',
      'Manage all user roles (including superadmin)',
      'View and delete audit logs',
      'View admin dashboard & monitoring',
      'Edit system configuration',
      'Edit landing page content',
      'Access all reports and data',
    ],
  },
  {
    name: 'Admin',
    color: 'blue',
    badge: 'bg-blue-100 text-blue-800',
    permissions: [
      'View users and stats',
      'Change user roles (cannot promote to superadmin)',
      'Cannot change own role',
      'No access to audit logs',
      'No access to system configuration',
      'No access to dashboard & monitoring',
    ],
  },
  {
    name: 'Rescuer',
    color: 'amber',
    badge: 'bg-amber-100 text-amber-800',
    permissions: [
      'View assigned rescue cases',
      'Update case status',
      'Submit field reports',
      'View wildlife guide',
    ],
  },
  {
    name: 'User',
    color: 'gray',
    badge: 'bg-gray-100 text-gray-800',
    permissions: [
      'Report an animal',
      'View community board',
      'Access wildlife guide',
      'Contact support',
    ],
  },
]

const colorClasses = {
  red: 'border-red-200 bg-red-50/50',
  blue: 'border-blue-200 bg-blue-50/50',
  amber: 'border-amber-200 bg-amber-50/50',
  gray: 'border-gray-200 bg-gray-50/50',
}

export default function Permissions() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Permissions</h1>
        <p className="mt-1 text-sm text-gray-500">
          Role-based access control matrix for the ResQBridge platform.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-4">
        {roles.map((role) => (
          <div key={role.name} className={`rounded-xl border ${colorClasses[role.color]} p-6`}>
            <div className="flex items-center gap-3">
              <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${role.badge}`}>
                {role.name}
              </span>
            </div>
            <ul className="mt-5 space-y-3">
              {role.permissions.map((perm) => (
                <li key={perm} className="flex items-start gap-2.5 text-sm text-gray-600">
                  <svg className="mt-0.5 h-4 w-4 shrink-0 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  {perm}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  )
}
