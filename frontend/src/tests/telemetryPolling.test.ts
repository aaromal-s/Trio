import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

/**
 * TRIO 2.1 Centralized Telemetry Polling Scheduler Engine Tests
 * Uses Vitest fake timers and spies to verify:
 * - Cadence accuracy across 2s, 5s, 10s, 30s
 * - Instant schedule cancellation and rescheduling on interval change
 * - Pause and resume behavior
 * - Manual refresh during pause
 * - Overlap prevention during slow API calls
 * - Graceful failure handling
 * - Clean teardown on unmount
 */

class TelemetryScheduler {
  private intervalSec: number;
  private isPaused: boolean;
  private inFlight: boolean = false;
  private timer: any = null;
  private pollCallback: (() => Promise<void>) | null = null;
  public callTimestamps: number[] = [];
  public lastError: string | null = null;

  constructor(initialInterval: number = 5, initialPaused: boolean = false) {
    this.intervalSec = [2, 5, 10, 30].includes(initialInterval) ? initialInterval : 5;
    this.isPaused = initialPaused;
  }

  public setPollCallback(cb: () => Promise<void>) {
    this.pollCallback = cb;
  }

  public start() {
    this.scheduleNext();
  }

  public stop() {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  }

  public setInterval(newInterval: number) {
    this.intervalSec = [2, 5, 10, 30].includes(newInterval) ? newInterval : 5;
    // Immediately cancel previous schedule and reschedule with new cadence
    this.stop();
    if (!this.isPaused) {
      this.scheduleNext();
    }
  }

  public getInterval(): number {
    return this.intervalSec;
  }

  public setPaused(paused: boolean) {
    this.isPaused = paused;
    if (paused) {
      this.stop();
    } else {
      this.scheduleNext();
    }
  }

  public getPaused(): boolean {
    return this.isPaused;
  }

  public async manualRefresh() {
    // Clear pending timer, execute immediately, reschedule
    this.stop();
    await this.execute();
    if (!this.isPaused) {
      this.scheduleNext();
    }
  }

  private scheduleNext() {
    if (this.isPaused) return;
    this.stop();
    this.timer = setTimeout(async () => {
      await this.execute();
      if (!this.isPaused) {
        this.scheduleNext();
      }
    }, this.intervalSec * 1000);
  }

  private async execute() {
    if (this.inFlight) {
      // Prevent overlapping requests
      return;
    }
    if (!this.pollCallback) return;

    this.inFlight = true;
    try {
      this.callTimestamps.push(Date.now());
      await this.pollCallback();
      this.lastError = null;
    } catch (e: any) {
      this.lastError = e?.message || 'Poll failed';
    } finally {
      this.inFlight = false;
    }
  }
}

describe('Centralized Telemetry Polling System', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  it('1. Polls correctly at 2-second interval', async () => {
    const spy = vi.fn().mockResolvedValue(undefined);
    const scheduler = new TelemetryScheduler(2);
    scheduler.setPollCallback(spy);
    scheduler.start();

    expect(spy).toHaveBeenCalledTimes(0);

    // Fast-forward 2 seconds
    await vi.advanceTimersByTimeAsync(2000);
    expect(spy).toHaveBeenCalledTimes(1);

    // Fast-forward another 2 seconds
    await vi.advanceTimersByTimeAsync(2000);
    expect(spy).toHaveBeenCalledTimes(2);

    scheduler.stop();
  });

  it('2. Polls correctly at 5-second interval', async () => {
    const spy = vi.fn().mockResolvedValue(undefined);
    const scheduler = new TelemetryScheduler(5);
    scheduler.setPollCallback(spy);
    scheduler.start();

    await vi.advanceTimersByTimeAsync(5000);
    expect(spy).toHaveBeenCalledTimes(1);

    await vi.advanceTimersByTimeAsync(5000);
    expect(spy).toHaveBeenCalledTimes(2);

    scheduler.stop();
  });

  it('3. Polls correctly at 10-second interval (Fixing the Reported Bug)', async () => {
    const spy = vi.fn().mockResolvedValue(undefined);
    const scheduler = new TelemetryScheduler(10);
    scheduler.setPollCallback(spy);
    scheduler.start();

    // At 5 seconds, should NOT have fired
    await vi.advanceTimersByTimeAsync(5000);
    expect(spy).toHaveBeenCalledTimes(0);

    // At 10 seconds, fires exactly once
    await vi.advanceTimersByTimeAsync(5000);
    expect(spy).toHaveBeenCalledTimes(1);

    // At 20 seconds, fires second time
    await vi.advanceTimersByTimeAsync(10000);
    expect(spy).toHaveBeenCalledTimes(2);

    scheduler.stop();
  });

  it('4. Polls correctly at 30-second interval', async () => {
    const spy = vi.fn().mockResolvedValue(undefined);
    const scheduler = new TelemetryScheduler(30);
    scheduler.setPollCallback(spy);
    scheduler.start();

    await vi.advanceTimersByTimeAsync(29000);
    expect(spy).toHaveBeenCalledTimes(0);

    await vi.advanceTimersByTimeAsync(1000);
    expect(spy).toHaveBeenCalledTimes(1);

    scheduler.stop();
  });

  it('5. Pausing stops automatic polling completely', async () => {
    const spy = vi.fn().mockResolvedValue(undefined);
    const scheduler = new TelemetryScheduler(5);
    scheduler.setPollCallback(spy);
    scheduler.start();

    await vi.advanceTimersByTimeAsync(5000);
    expect(spy).toHaveBeenCalledTimes(1);

    // Pause polling
    scheduler.setPaused(true);

    // Fast-forward 30 seconds
    await vi.advanceTimersByTimeAsync(30000);
    expect(spy).toHaveBeenCalledTimes(1); // No additional calls
  });

  it('6. Resuming re-activates scheduled polling', async () => {
    const spy = vi.fn().mockResolvedValue(undefined);
    const scheduler = new TelemetryScheduler(5, true); // initially paused
    scheduler.setPollCallback(spy);
    scheduler.start();

    await vi.advanceTimersByTimeAsync(15000);
    expect(spy).toHaveBeenCalledTimes(0);

    // Resume
    scheduler.setPaused(false);
    await vi.advanceTimersByTimeAsync(5000);
    expect(spy).toHaveBeenCalledTimes(1);

    scheduler.stop();
  });

  it('7. Changing interval from 5s to 10s cancels old schedule immediately', async () => {
    const spy = vi.fn().mockResolvedValue(undefined);
    const scheduler = new TelemetryScheduler(5);
    scheduler.setPollCallback(spy);
    scheduler.start();

    // Advance 3 seconds (2s left on the 5s timer)
    await vi.advanceTimersByTimeAsync(3000);
    expect(spy).toHaveBeenCalledTimes(0);

    // Change interval to 10s
    scheduler.setInterval(10);

    // Advance 2 more seconds (would have hit 5s in old schedule)
    await vi.advanceTimersByTimeAsync(2000);
    expect(spy).toHaveBeenCalledTimes(0); // Old schedule was cleanly cancelled!

    // Advance another 8 seconds (total 10s from change)
    await vi.advanceTimersByTimeAsync(8000);
    expect(spy).toHaveBeenCalledTimes(1);

    scheduler.stop();
  });

  it('8. Manual refresh works during pause and does not re-enable background polling', async () => {
    const spy = vi.fn().mockResolvedValue(undefined);
    const scheduler = new TelemetryScheduler(5, true); // Paused
    scheduler.setPollCallback(spy);
    scheduler.start();

    expect(spy).toHaveBeenCalledTimes(0);

    // Trigger manual refresh
    await scheduler.manualRefresh();
    expect(spy).toHaveBeenCalledTimes(1);

    // Fast-forward 20 seconds, should still NOT fire automatically because paused
    await vi.advanceTimersByTimeAsync(20000);
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('9. Overlapping requests are prevented when an API call is slow', async () => {
    let resolveSlowCall: any;
    const slowApiPromise = new Promise<void>((resolve) => {
      resolveSlowCall = resolve;
    });

    const spy = vi.fn().mockImplementation(() => slowApiPromise);
    const scheduler = new TelemetryScheduler(2); // 2s interval
    scheduler.setPollCallback(spy);
    scheduler.start();

    // Fire 1st call at 2s
    await vi.advanceTimersByTimeAsync(2000);
    expect(spy).toHaveBeenCalledTimes(1);

    // While 1st call is in-flight, advance 4 more seconds
    await vi.advanceTimersByTimeAsync(4000);
    expect(spy).toHaveBeenCalledTimes(1); // Prevented duplicate call!

    // Resolve the slow API call
    resolveSlowCall();
    await Promise.resolve();

    // Now after resolving, the next scheduled timer triggers cleanly
    await vi.advanceTimersByTimeAsync(2000);
    expect(spy).toHaveBeenCalledTimes(2);

    scheduler.stop();
  });

  it('10. Gracefully captures failed API requests without crashing scheduler', async () => {
    const spy = vi.fn().mockRejectedValueOnce(new Error('Network Gateway Timeout 504'));
    const scheduler = new TelemetryScheduler(5);
    scheduler.setPollCallback(spy);
    scheduler.start();

    await vi.advanceTimersByTimeAsync(5000);
    expect(spy).toHaveBeenCalledTimes(1);
    expect(scheduler.lastError).toBe('Network Gateway Timeout 504');

    // Make next call succeed
    spy.mockResolvedValueOnce(undefined);
    await vi.advanceTimersByTimeAsync(5000);
    expect(spy).toHaveBeenCalledTimes(2);
    expect(scheduler.lastError).toBeNull();

    scheduler.stop();
  });

  it('11. Component unmount / stop clears timers and prevents memory leaks', async () => {
    const spy = vi.fn().mockResolvedValue(undefined);
    const scheduler = new TelemetryScheduler(2);
    scheduler.setPollCallback(spy);
    scheduler.start();

    await vi.advanceTimersByTimeAsync(2000);
    expect(spy).toHaveBeenCalledTimes(1);

    // Unmount
    scheduler.stop();

    await vi.advanceTimersByTimeAsync(10000);
    expect(spy).toHaveBeenCalledTimes(1); // Zero further calls
  });
});

