/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as admin from "../admin.js";
import type * as content from "../content.js";
import type * as email from "../email.js";
import type * as http from "../http.js";
import type * as lib_adminAccess from "../lib/adminAccess.js";
import type * as lib_admins from "../lib/admins.js";
import type * as lib_authParse from "../lib/authParse.js";
import type * as lib_contactPhone from "../lib/contactPhone.js";
import type * as lib_contentValidators from "../lib/contentValidators.js";
import type * as lib_defaultContent from "../lib/defaultContent.js";
import type * as lib_domesticPublic from "../lib/domesticPublic.js";
import type * as lib_generateOtp from "../lib/generateOtp.js";
import type * as lib_httpResponses from "../lib/httpResponses.js";
import type * as lib_otpCode from "../lib/otpCode.js";
import type * as lib_otpInternal from "../lib/otpInternal.js";
import type * as lib_reportAnalytics from "../lib/reportAnalytics.js";
import type * as lib_reportFields from "../lib/reportFields.js";
import type * as lib_reportPhotos from "../lib/reportPhotos.js";
import type * as lib_reportStatus from "../lib/reportStatus.js";
import type * as lib_rescuerAccess from "../lib/rescuerAccess.js";
import type * as migrations from "../migrations.js";
import type * as otp from "../otp.js";
import type * as reportPhotoStorage from "../reportPhotoStorage.js";
import type * as reports from "../reports.js";
import type * as rescuers from "../rescuers.js";
import type * as users from "../users.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  admin: typeof admin;
  content: typeof content;
  email: typeof email;
  http: typeof http;
  "lib/adminAccess": typeof lib_adminAccess;
  "lib/admins": typeof lib_admins;
  "lib/authParse": typeof lib_authParse;
  "lib/contactPhone": typeof lib_contactPhone;
  "lib/contentValidators": typeof lib_contentValidators;
  "lib/defaultContent": typeof lib_defaultContent;
  "lib/domesticPublic": typeof lib_domesticPublic;
  "lib/generateOtp": typeof lib_generateOtp;
  "lib/httpResponses": typeof lib_httpResponses;
  "lib/otpCode": typeof lib_otpCode;
  "lib/otpInternal": typeof lib_otpInternal;
  "lib/reportAnalytics": typeof lib_reportAnalytics;
  "lib/reportFields": typeof lib_reportFields;
  "lib/reportPhotos": typeof lib_reportPhotos;
  "lib/reportStatus": typeof lib_reportStatus;
  "lib/rescuerAccess": typeof lib_rescuerAccess;
  migrations: typeof migrations;
  otp: typeof otp;
  reportPhotoStorage: typeof reportPhotoStorage;
  reports: typeof reports;
  rescuers: typeof rescuers;
  users: typeof users;
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
