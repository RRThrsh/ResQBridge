import { mutation, query } from './_generated/server'
import { v } from 'convex/values'
import { getAdminByEmail } from './lib/adminAccess'
import { normalizeEmail } from './lib/admins'
import { normalizeContactPhone } from './lib/contactPhone'
import { getRescuerByEmail } from './lib/rescuerAccess'

const userProfileValidator = v.object({
  email: v.string(),
  firstName: v.string(),
  lastName: v.string(),
  role: v.literal('user'),
})

export const getByEmail = query({
  args: { email: v.string() },
  returns: v.union(userProfileValidator, v.null()),
  handler: async (ctx, args) => {
    const email = normalizeEmail(args.email)
    const user = await ctx.db
      .query('users')
      .withIndex('by_email', (q) => q.eq('email', email))
      .unique()

    if (!user) return null

    const admin = await getAdminByEmail(ctx, email)
    if (admin) return null

    const rescuer = await getRescuerByEmail(ctx, email)
    if (rescuer) return null

    return {
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: 'user' as const,
    }
  },
})

export const createUser = mutation({
  args: {
    email: v.string(),
    firstName: v.string(),
    lastName: v.string(),
  },
  returns: userProfileValidator,
  handler: async (ctx, args) => {
    const email = normalizeEmail(args.email)
    const firstName = args.firstName.trim()
    const lastName = args.lastName.trim()

    const admin = await getAdminByEmail(ctx, email)
    if (admin) {
      throw new Error('This email is reserved for admin access.')
    }

    const rescuer = await getRescuerByEmail(ctx, email)
    if (rescuer) {
      throw new Error('This email is reserved for rescuer access.')
    }

    const existing = await ctx.db
      .query('users')
      .withIndex('by_email', (q) => q.eq('email', email))
      .unique()

    if (existing) {
      if (existing.role !== 'user') {
        await ctx.db.patch(existing._id, { role: 'user' })
      }
      return {
        email: existing.email,
        firstName: existing.firstName,
        lastName: existing.lastName,
        role: 'user' as const,
      }
    }

    await ctx.db.insert('users', {
      email,
      firstName,
      lastName,
      role: 'user',
      createdAt: Date.now(),
    })

    return { email, firstName, lastName, role: 'user' as const }
  },
})

const userProfileWithCreatedAtValidator = v.object({
  email: v.string(),
  firstName: v.string(),
  lastName: v.string(),
  role: v.literal('user'),
  contactPhone: v.optional(v.string()),
  createdAt: v.number(),
})

export const getProfile = query({
  args: { email: v.string() },
  returns: v.union(userProfileWithCreatedAtValidator, v.null()),
  handler: async (ctx, args) => {
    const email = normalizeEmail(args.email)
    const user = await ctx.db
      .query('users')
      .withIndex('by_email', (q) => q.eq('email', email))
      .unique()

    if (!user) return null

    const admin = await getAdminByEmail(ctx, email)
    if (admin) return null

    const rescuer = await getRescuerByEmail(ctx, email)
    if (rescuer) return null

    const contactPhone = user.contactPhone?.trim()
    return {
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: 'user' as const,
      ...(contactPhone ? { contactPhone } : {}),
      createdAt: user.createdAt,
    }
  },
})

export const updateProfile = mutation({
  args: {
    email: v.string(),
    firstName: v.string(),
    lastName: v.string(),
    contactPhone: v.string(),
  },
  returns: userProfileValidator,
  handler: async (ctx, args) => {
    const email = normalizeEmail(args.email)
    const firstName = args.firstName.trim()
    const lastName = args.lastName.trim()
    const contactPhone = normalizeContactPhone(args.contactPhone)

    if (!firstName || !lastName) {
      throw new Error('First and last name are required.')
    }

    const admin = await getAdminByEmail(ctx, email)
    if (admin) {
      throw new Error('This email is reserved for admin access.')
    }

    const rescuer = await getRescuerByEmail(ctx, email)
    if (rescuer) {
      throw new Error('This email is reserved for rescuer access.')
    }

    const user = await ctx.db
      .query('users')
      .withIndex('by_email', (q) => q.eq('email', email))
      .unique()

    if (!user) {
      throw new Error('User not found.')
    }

    await ctx.db.patch(user._id, { firstName, lastName, contactPhone })

    return { email, firstName, lastName, role: 'user' as const }
  },
})
