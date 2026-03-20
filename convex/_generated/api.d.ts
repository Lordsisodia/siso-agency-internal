/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as dailyReflections_createOrUpdateDailyReflection from "../dailyReflections/createOrUpdateDailyReflection.js";
import type * as dailyReflections_getDailyReflections from "../dailyReflections/getDailyReflections.js";
import type * as habits_completeHabit from "../habits/completeHabit.js";
import type * as habits_createHabit from "../habits/createHabit.js";
import type * as habits_getCompletions from "../habits/getCompletions.js";
import type * as habits_getHabits from "../habits/getHabits.js";
import type * as habits_updateHabit from "../habits/updateHabit.js";
import type * as morningRoutines_createOrUpdateMorningRoutine from "../morningRoutines/createOrUpdateMorningRoutine.js";
import type * as morningRoutines_getMorningRoutines from "../morningRoutines/getMorningRoutines.js";
import type * as tasks_createTask from "../tasks/createTask.js";
import type * as tasks_getTasks from "../tasks/getTasks.js";
import type * as timebox_createSession from "../timebox/createSession.js";
import type * as timebox_getSessions from "../timebox/getSessions.js";
import type * as timebox_updateSession from "../timebox/updateSession.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  "dailyReflections/createOrUpdateDailyReflection": typeof dailyReflections_createOrUpdateDailyReflection;
  "dailyReflections/getDailyReflections": typeof dailyReflections_getDailyReflections;
  "habits/completeHabit": typeof habits_completeHabit;
  "habits/createHabit": typeof habits_createHabit;
  "habits/getCompletions": typeof habits_getCompletions;
  "habits/getHabits": typeof habits_getHabits;
  "habits/updateHabit": typeof habits_updateHabit;
  "morningRoutines/createOrUpdateMorningRoutine": typeof morningRoutines_createOrUpdateMorningRoutine;
  "morningRoutines/getMorningRoutines": typeof morningRoutines_getMorningRoutines;
  "tasks/createTask": typeof tasks_createTask;
  "tasks/getTasks": typeof tasks_getTasks;
  "timebox/createSession": typeof timebox_createSession;
  "timebox/getSessions": typeof timebox_getSessions;
  "timebox/updateSession": typeof timebox_updateSession;
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
