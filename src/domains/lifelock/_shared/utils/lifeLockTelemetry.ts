import { safeSupabase } from '@/services/shared/data.service';

export type LifeLockTelemetryEvent = 'voice_task_processor' | 'eisenhower_matrix';

export interface LifeLockTelemetryPayload {
  event: LifeLockTelemetryEvent;
  status: 'success' | 'failure';
  durationMs: number;
  metadata?: Record<string, unknown>;
  errorMessage?: string | null;
}

type LifeLockTelemetryStats = {
  total: number;
  success: number;
  failure: number;
  totalDurationMs: number;
};

const LIFELOCK_TELEMETRY_TABLE = 'lifelock_ai_telemetry';
const stats = new Map<LifeLockTelemetryEvent, LifeLockTelemetryStats>();

const now = () => (typeof performance !== 'undefined' && performance.now ? performance.now() : Date.now());

function updateStats(event: LifeLockTelemetryEvent, status: 'success' | 'failure', durationMs: number) {
  const currentStats = stats.get(event) ?? {
    total: 0,
    success: 0,
    failure: 0,
    totalDurationMs: 0
  };

  currentStats.total += 1;
  currentStats.totalDurationMs += durationMs;

  if (status === 'success') {
    currentStats.success += 1;
  } else {
    currentStats.failure += 1;
  }

  stats.set(event, currentStats);

  const successRate = currentStats.total > 0 ? Math.round((currentStats.success / currentStats.total) * 100) : 0;
  const averageDuration = currentStats.total > 0 ? Math.round(currentStats.totalDurationMs / currentStats.total) : 0;

  console.log(
    `📊 [LifeLock Telemetry] ${event} ${status} in ${Math.round(durationMs)}ms (success: ${currentStats.success}/${currentStats.total}, ${successRate}% success, avg ${averageDuration}ms)`
  );
}

async function persistTelemetry(payload: LifeLockTelemetryPayload) {
  try {
    const { error } = await safeSupabase
      .from(LIFELOCK_TELEMETRY_TABLE)
      .insert([
        {
          event_name: payload.event,
          status: payload.status,
          duration_ms: Math.round(payload.durationMs),
          success: payload.status === 'success',
          metadata: payload.metadata ?? {},
          error_message: payload.errorMessage ?? null,
          occurred_at: new Date().toISOString()
        }
      ]);

    if (error) {
      throw error;
    }
  } catch (error) {
    console.warn('⚠️ [LifeLock Telemetry] Failed to persist telemetry event', error);
  }
}

export async function recordLifeLockTelemetry(payload: LifeLockTelemetryPayload) {
  updateStats(payload.event, payload.status, payload.durationMs);
  await persistTelemetry(payload);
}

export async function instrumentLifeLockEvent<T>(
  event: LifeLockTelemetryEvent,
  action: () => Promise<T>,
  metadata?: Record<string, unknown>
): Promise<T> {
  const start = now();

  try {
    const result = await action();
    const durationMs = now() - start;

    await recordLifeLockTelemetry({
      event,
      status: 'success',
      durationMs,
      metadata: metadata ?? {}
    });

    return result;
  } catch (error) {
    const durationMs = now() - start;

    await recordLifeLockTelemetry({
      event,
      status: 'failure',
      durationMs,
      metadata: metadata ?? {},
      errorMessage: error instanceof Error ? error.message : String(error)
    });

    throw error;
  }
}

export function getLifeLockTelemetryStats(event: LifeLockTelemetryEvent): LifeLockTelemetryStats | undefined {
  const currentStats = stats.get(event);
  return currentStats ? { ...currentStats } : undefined;
}
