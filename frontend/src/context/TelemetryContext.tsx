import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';

export interface TelemetryContextType {
  intervalSec: number;
  isPaused: boolean;
  isFetching: boolean;
  lastUpdated: number;
  secondsAgo: number;
  fetchError: string | null;
  setIntervalSec: (sec: number) => void;
  setIsPaused: (paused: boolean) => void;
  togglePaused: () => void;
  triggerManualRefresh: () => Promise<void>;
  setPollCallback: (cb: () => Promise<void>) => void;
  setEnabled: (enabled: boolean) => void;
}

const TelemetryContext = createContext<TelemetryContextType | undefined>(undefined);

export const TelemetryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Read persisted interval from localStorage, defaulting to 5s
  const [intervalSec, setIntervalSecState] = useState<number>(() => {
    const saved = localStorage.getItem('trio_polling_interval');
    const parsed = saved ? parseInt(saved, 10) : 5;
    return [2, 5, 10, 30].includes(parsed) ? parsed : 5;
  });

  // Read persisted pause state
  const [isPaused, setIsPausedState] = useState<boolean>(() => {
    return localStorage.getItem('trio_polling_paused') === 'true';
  });

  const [isEnabled, setEnabled] = useState<boolean>(true);
  const [isFetching, setIsFetching] = useState<boolean>(false);
  const [lastUpdated, setLastUpdated] = useState<number>(() => Math.floor(Date.now() / 1000));
  const [secondsAgo, setSecondsAgo] = useState<number>(0);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // References for scheduling and preventing overlapping requests
  const timerRef = useRef<any>(null);
  const inFlightRef = useRef<boolean>(false);
  const pollCallbackRef = useRef<(() => Promise<void>) | null>(null);

  // Register callback
  const setPollCallback = useCallback((cb: () => Promise<void>) => {
    pollCallbackRef.current = cb;
  }, []);

  // Update interval immediately and persist
  const setIntervalSec = useCallback((sec: number) => {
    const valid = [2, 5, 10, 30].includes(sec) ? sec : 5;
    setIntervalSecState(valid);
    localStorage.setItem('trio_polling_interval', String(valid));
  }, []);

  // Update pause state and persist
  const setIsPaused = useCallback((paused: boolean) => {
    setIsPausedState(paused);
    localStorage.setItem('trio_polling_paused', String(paused));
  }, []);

  const togglePaused = useCallback(() => {
    setIsPausedState((prev) => {
      const next = !prev;
      localStorage.setItem('trio_polling_paused', String(next));
      return next;
    });
  }, []);

  // Core execution function with overlap prevention
  const executeFetch = useCallback(async () => {
    if (inFlightRef.current) {
      return; // Prevent overlapping requests
    }

    if (!pollCallbackRef.current) {
      return;
    }

    inFlightRef.current = true;
    setIsFetching(true);
    setFetchError(null);

    try {
      await pollCallbackRef.current();
      const now = Math.floor(Date.now() / 1000);
      setLastUpdated(now);
      setSecondsAgo(0);
      setFetchError(null);
    } catch (err: any) {
      setFetchError(err?.message || 'Telemetry polling failed');
    } finally {
      inFlightRef.current = false;
      setIsFetching(false);
    }
  }, []);

  // Manual refresh: runs immediately and resets timer
  const triggerManualRefresh = useCallback(async () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    await executeFetch();
  }, [executeFetch]);

  // Master recursive scheduler
  useEffect(() => {
    // Clear any existing timer
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    // Do not poll if paused or disabled
    if (isPaused || !isEnabled) {
      return;
    }

    let isMounted = true;

    const scheduleNext = () => {
      timerRef.current = setTimeout(async () => {
        if (!isMounted || isPaused || !isEnabled) return;
        await executeFetch();
        if (isMounted && !isPaused && isEnabled) {
          scheduleNext();
        }
      }, intervalSec * 1000);
    };

    scheduleNext();

    return () => {
      isMounted = false;
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [intervalSec, isPaused, isEnabled, executeFetch]);

  // Seconds ago live counter
  useEffect(() => {
    const secTimer = setInterval(() => {
      setSecondsAgo(Math.max(0, Math.floor(Date.now() / 1000 - lastUpdated)));
    }, 1000);
    return () => clearInterval(secTimer);
  }, [lastUpdated]);

  return (
    <TelemetryContext.Provider
      value={{
        intervalSec,
        isPaused,
        isFetching,
        lastUpdated,
        secondsAgo,
        fetchError,
        setIntervalSec,
        setIsPaused,
        togglePaused,
        triggerManualRefresh,
        setPollCallback,
        setEnabled
      }}
    >
      {children}
    </TelemetryContext.Provider>
  );
};

export const useTelemetry = (): TelemetryContextType => {
  const context = useContext(TelemetryContext);
  if (!context) {
    throw new Error('useTelemetry must be used within a TelemetryProvider');
  }
  return context;
};

