import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { TelemetrySnapshot, OverviewSummary, Incident, RiskPrediction } from '../types';
import { api } from '../services/api';

interface LiveDataContextType {
  telemetry: TelemetrySnapshot[];
  overview: OverviewSummary | null;
  incidents: Incident[];
  predictions: RiskPrediction[];
  clock: {
    timeString: string;
    dateString: string;
    timezoneString: string;
  };
  isRefreshing: boolean;
  isPaused: boolean;
  lastUpdated: Date | null;
  lastUpdatedRelative: string;
  refreshError: string | null;
  refreshNow: () => Promise<void>;
  togglePause: () => void;
  refreshIncidents: () => Promise<void>;
}

const LiveDataContext = createContext<LiveDataContextType | undefined>(undefined);

export const LiveDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [telemetry, setTelemetry] = useState<TelemetrySnapshot[]>([]);
  const [overview, setOverview] = useState<OverviewSummary | null>(null);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [predictions, setPredictions] = useState<RiskPrediction[]>([]);
  
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [lastUpdatedRelative, setLastUpdatedRelative] = useState<string>('Initializing...');
  const [refreshError, setRefreshError] = useState<string | null>(null);
  
  // Real 12-hour browser clock with seconds and IST indicator
  const [clock, setClock] = useState({
    timeString: '--:--:-- --',
    dateString: '---',
    timezoneString: 'IST (UTC+5:30)'
  });

  const inFlightRef = useRef<boolean>(false);
  const timerRef = useRef<any>(null);

  // 1. Live Clock updater (every 1 second)
  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      
      // 12-hour format with AM/PM and seconds
      const timeStr = now.toLocaleTimeString('en-US', {
        hour12: true,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
      
      // Date string
      const dateStr = now.toLocaleDateString('en-US', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });

      // Timezone identifier: Display IST timezone as required in Phase 7
      const tzStr = 'IST (UTC+5:30)';

      setClock({
        timeString: timeStr,
        dateString: dateStr,
        timezoneString: tzStr
      });
      
      // Also update relative lastUpdated string
      if (lastUpdated) {
        const diffSec = Math.floor((now.getTime() - lastUpdated.getTime()) / 1000);
        if (diffSec < 2) {
          setLastUpdatedRelative('Just now');
        } else if (diffSec < 60) {
          setLastUpdatedRelative(`${diffSec}s ago`);
        } else {
          const diffMin = Math.floor(diffSec / 60);
          setLastUpdatedRelative(`${diffMin}m ago`);
        }
      }
    };

    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, [lastUpdated]);

  // 2. Fetch live data with overlap protection and error fallback
  const fetchLiveData = useCallback(async (isManual = false) => {
    if (inFlightRef.current) return;
    inFlightRef.current = true;
    setIsRefreshing(true);
    setRefreshError(null);

    try {
      const [liveTele, overviewData, incs, preds] = await Promise.all([
        api.getLiveTelemetry(),
        api.getOverview(),
        api.getIncidents(),
        api.getLatestPredictions()
      ]);

      setTelemetry(liveTele);
      setOverview(overviewData);
      setIncidents(incs);
      setPredictions(preds);
      const updateTime = new Date();
      setLastUpdated(updateTime);
      setLastUpdatedRelative('Just now');
    } catch (err: any) {
      console.warn('Live refresh fallback:', err.message);
      setRefreshError(err.message || 'Telemetry connection transient jitter');
      // Notice: We preserve existing state during temporary failures as specified in Phase 7!
    } finally {
      setIsRefreshing(false);
      inFlightRef.current = false;
    }
  }, []);

  // 3. 5-second interval timer & tab visibility handler
  useEffect(() => {
    // Initial fetch
    fetchLiveData();

    const startInterval = () => {
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = setInterval(() => {
        if (!isPaused && !document.hidden) {
          fetchLiveData();
        }
      }, 5000);
    };

    startInterval();

    // Tab visibility handling: pause nonessential polling when tab is hidden, refresh immediately upon return
    const handleVisibilityChange = () => {
      if (!document.hidden && !isPaused) {
        fetchLiveData();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [fetchLiveData, isPaused]);

  const refreshNow = async () => {
    await fetchLiveData(true);
  };

  const togglePause = () => {
    setIsPaused(prev => !prev);
  };

  const refreshIncidents = async () => {
    try {
      const incs = await api.getIncidents();
      setIncidents(incs);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <LiveDataContext.Provider
      value={{
        telemetry,
        overview,
        incidents,
        predictions,
        clock,
        isRefreshing,
        isPaused,
        lastUpdated,
        lastUpdatedRelative,
        refreshError,
        refreshNow,
        togglePause,
        refreshIncidents
      }}
    >
      {children}
    </LiveDataContext.Provider>
  );
};

export const useLiveData = () => {
  const ctx = useContext(LiveDataContext);
  if (!ctx) throw new Error('useLiveData must be used within a LiveDataProvider');
  return ctx;
};
