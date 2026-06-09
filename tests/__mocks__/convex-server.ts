import type { Doc, Id } from './convex-dataModel'

export type QueryCtx = {
  db: {
    query: (table: string) => unknown
    get: (id: Id<string>) => Promise<Doc<string> | null>
  }
  auth: {
    getUserIdentity: () => Promise<{ email: string; subject: string } | null>
  }
}

export type MutationCtx = {
  db: {
    query: (table: string) => unknown
    get: (id: Id<string>) => Promise<Doc<string> | null>
    insert: (table: string, doc: Record<string, unknown>) => Promise<Id<string>>
    patch: (id: Id<string>, patch: Record<string, unknown>) => Promise<void>
    delete: (id: Id<string>) => Promise<void>
  }
  auth: {
    getUserIdentity: () => Promise<{ email: string; subject: string } | null>
  }
}

export type ActionCtx = Record<string, unknown>

export const query = <T>(func: (ctx: QueryCtx, ...args: unknown[]) => T) => func
export const mutation = <T>(func: (ctx: MutationCtx, ...args: unknown[]) => T) => func
export const action = <T>(func: (ctx: ActionCtx, ...args: unknown[]) => T) => func
export const internalQuery = query
export const internalMutation = mutation
export const internalAction = action
export const httpAction = <T>(func: (ctx: ActionCtx, request: Request) => T) => func
