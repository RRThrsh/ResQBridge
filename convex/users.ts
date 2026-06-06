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
  password: v.optional(v.string()),
  role: v.literal('user'),
})

export const getAdmins = query({
  args: {},

  handler: async (ctx) => {
    return await ctx.db
      .query('users')
      .filter((q) => q.eq(q.field('role'), 'admin'))
      .collect()
  },
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
      password: user.password,
      role: 'user' as const,
    }
  },
})

export const createUser = mutation({
  args: {
    email: v.string(),
    firstName: v.string(),
    lastName: v.string(),
    password: v.string(),
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
      password: args.password,
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
    newEmail: v.optional(v.string()), // <-- ADDED: Allows the frontend to pass the new email/phone
    firstName: v.string(),
    lastName: v.string(),
    contactPhone: v.optional(v.string()), // <-- CHANGE THIS to v.optional!
  },
  returns: userProfileValidator,
  handler: async (ctx, args) => {
    const email = normalizeEmail(args.email)
    
    // Determine the final email/phone to save
    const finalEmailToSave = args.newEmail ? normalizeEmail(args.newEmail) : email
    
    const firstName = args.firstName.trim()
    const lastName = args.lastName.trim()
    const contactPhone = args.contactPhone ? normalizeContactPhone(args.contactPhone) : undefined

    if (!firstName || !lastName) {
      throw new Error('First and last name are required.')
    }

    // Check if the new contact info belongs to an Admin or Rescuer
    const admin = await getAdminByEmail(ctx, finalEmailToSave)
    if (admin) {
      throw new Error('This contact is reserved for admin access.')
    }

    const rescuer = await getRescuerByEmail(ctx, finalEmailToSave)
    if (rescuer) {
      throw new Error('This contact is reserved for rescuer access.')
    }

    // Ensure the new email/phone isn't already taken by another user
    if (finalEmailToSave !== email) {
      const emailTaken = await ctx.db
        .query('users')
        .withIndex('by_email', (q) => q.eq('email', finalEmailToSave))
        .unique()
      
      if (emailTaken) {
        throw new Error('This email or phone number is already in use by another account.')
      }
    }

    // Find the current user
    const user = await ctx.db
      .query('users')
      .withIndex('by_email', (q) => q.eq('email', email))
      .unique()

    if (!user) {
      throw new Error('User not found.')
    }

    // Apply the patch with the NEW email
    await ctx.db.patch(user._id, { 
      email: finalEmailToSave, 
      firstName, 
      lastName, 
      contactPhone 
    })

    // Return the updated data so the frontend syncs up perfectly
    return { email: finalEmailToSave, firstName, lastName, role: 'user' as const }
  },
})

export const validateUserPassword = query({
  args: {
    email: v.string(),
    password: v.string(),
  },

  returns: v.boolean(),

  handler: async (ctx, args) => {
    const email = normalizeEmail(args.email)

    const user = await ctx.db
      .query('users')
      .withIndex('by_email', (q) => q.eq('email', email))
      .unique()

    if (!user) return false

    return user.password === args.password
  },
})

export const resetUserPassword = mutation({
  args: {
    email: v.string(),
    newPassword: v.string(),
  },

  returns: v.null(),

  handler: async (ctx, args) => {
    const email = normalizeEmail(args.email)

    const user = await ctx.db
      .query('users')
      .withIndex('by_email', (q) =>
        q.eq('email', email),
      )
      .unique()

    if (!user) {
      throw new Error('User not found.')
    }

    if (args.newPassword.length < 8) {
      throw new Error(
        'Password must be at least 8 characters.',
      )
    }

    await ctx.db.patch(user._id, {
      password: args.newPassword,
    })

    return null
  },
})