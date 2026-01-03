// Minimal stub: choose primary implementation by default
export function selectImplementation<T>(impls: { primary: T; fallback?: T }): T {
  return impls.primary ?? impls.fallback as T;
}
