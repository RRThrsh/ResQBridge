/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as activity from "../activity.js";
import type * as adminNotifications from "../adminNotifications.js";
import type * as admins from "../admins.js";
import type * as config from "../config.js";
import type * as equipmentChecklists from "../equipmentChecklists.js";
import type * as locations from "../locations.js";
import type * as logs from "../logs.js";
import type * as notes from "../notes.js";
import type * as otp from "../otp.js";
import type * as reports from "../reports.js";
import type * as rescuers from "../rescuers.js";
import type * as shifts from "../shifts.js";
import type * as users from "../users.js";
import type * as voiceNotes from "../voiceNotes.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  activity: typeof activity;
  adminNotifications: typeof adminNotifications;
  admins: typeof admins;
  config: typeof config;
  equipmentChecklists: typeof equipmentChecklists;
  locations: typeof locations;
  logs: typeof logs;
  notes: typeof notes;
  otp: typeof otp;
  reports: typeof reports;
  rescuers: typeof rescuers;
  shifts: typeof shifts;
  users: typeof users;
  voiceNotes: typeof voiceNotes;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
