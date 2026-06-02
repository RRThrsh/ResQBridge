/**
 * Jest-friendly re-export of the generated Convex API (avoids parsing ESM api.js).
 */
import { anyApi, componentsGeneric } from 'convex/server'

export const api = anyApi
export const internal = anyApi
export const components = componentsGeneric()
