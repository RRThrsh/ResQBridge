/** Convex module map for convex-test (Jest has no import.meta.glob). */
export const convexModules = {
  './admin.ts': () => import('../../convex/admin'),
  './users.ts': () => import('../../convex/users'),
  './otp.ts': () => import('../../convex/otp'),
  './reports.ts': () => import('../../convex/reports'),
  './content.ts': () => import('../../convex/content'),
  './schema.ts': () => import('../../convex/schema'),
  './lib/adminAccess.ts': () => import('../../convex/lib/adminAccess'),
  './lib/admins.ts': () => import('../../convex/lib/admins'),
  './lib/contentValidators.ts': () => import('../../convex/lib/contentValidators'),
  './lib/defaultContent.ts': () => import('../../convex/lib/defaultContent'),
  './lib/otpCode.ts': () => import('../../convex/lib/otpCode'),
  './lib/otpInternal.ts': () => import('../../convex/lib/otpInternal'),
}
