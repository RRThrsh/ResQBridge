import type { Id } from '../../convex/_generated/dataModel'

type AdminRow = {
  _id: Id<'admins'>
  email: string
  firstName: string
  lastName: string
  createdAt: number
}

type RescuerRow = {
  _id: Id<'rescuers'>
  email: string
  firstName: string
  lastName: string
  createdAt: number
}

type ReportRow = {
  _id: Id<'reports'>
  userEmail: string
  category: 'wildlife' | 'domestic'
  type: string
  animalName: string
  location: string
  status: string
  assignedRescuerEmail?: string
  createdAt: number
}

type IndexFilter = { field: string; value: string }

function makeQuery<T extends Record<string, unknown>>(
  rows: T[],
  indexField: keyof T & string,
) {
  let filter: IndexFilter = { field: indexField, value: '' }

  return {
    withIndex(_index: string, builder: (q: { eq: (field: string, value: string) => unknown }) => unknown) {
      const q = {
        eq(field: string, value: string) {
          filter = { field, value }
          return q
        },
      }
      builder(q)
      return {
        async unique() {
          const row = rows.find((r) => String(r[filter.field as keyof T]) === filter.value)
          return row ?? null
        },
      }
    },
    collect: async () => [...rows],
  }
}

export function createMockConvexCtx(
  initialAdmins: Omit<AdminRow, '_id'>[] = [],
  extras?: {
    rescuers?: Omit<RescuerRow, '_id'>[]
    reports?: Omit<ReportRow, '_id'>[]
  },
) {
  const admins: AdminRow[] = initialAdmins.map((row, index) => ({
    _id: `admin_${index}` as Id<'admins'>,
    ...row,
  }))

  const rescuers: RescuerRow[] = (extras?.rescuers ?? []).map((row, index) => ({
    _id: `rescuer_${index}` as Id<'rescuers'>,
    ...row,
  }))

  const reports: ReportRow[] = (extras?.reports ?? []).map((row, index) => ({
    _id: `report_${index}` as Id<'reports'>,
    ...row,
  }))

  const ctx = {
    db: {
      query(table: 'admins' | 'rescuers' | 'reports') {
        if (table === 'admins') {
          return makeQuery(admins, 'email')
        }
        if (table === 'rescuers') {
          return makeQuery(rescuers, 'email')
        }
        if (table === 'reports') {
          return makeQuery(reports, 'userEmail')
        }
        throw new Error(`Unsupported table: ${table}`)
      },
      async insert(table: 'admins', doc: Omit<AdminRow, '_id'>) {
        if (table !== 'admins') throw new Error(`Unsupported insert: ${table}`)
        const row: AdminRow = {
          _id: `admin_${admins.length}` as Id<'admins'>,
          ...doc,
        }
        admins.push(row)
        return row._id
      },
      async patch(id: Id<'admins'>, patch: Partial<Pick<AdminRow, 'firstName' | 'lastName'>>) {
        const row = admins.find((a) => a._id === id)
        if (!row) throw new Error('Admin not found')
        Object.assign(row, patch)
      },
    },
  }

  return { ctx, admins, rescuers, reports }
}
