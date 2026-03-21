"use client";

import { useEffect, useRef, useState, useCallback } from 'react';

interface UseAutoRefreshOptions<T> {
  /** Fetch function to call on each refresh */
  fetchFn: () => Promise<T>;
  /** Refresh interval in milliseconds (default: 5000) */
  interval?: number;
  /** Initial data */
  initialData?: T;
  /** Whether to start polling immediately (default: true) */
  enabled?: boolean;
}

interface UseAutoRefreshReturn<T> {
  /** Current data */
  data: T | undefined;
  /** Loading state */
  loading: boolean;
  /** Error state */
  error: Error | null;
  /** Manual refresh trigger */
  refresh: () => Promise<void>;
  /** Whether currently refreshing */
  refreshing: boolean;
  /** Time since last successful update in seconds */
  lastUpdatedAgo: number | null;
  /** Connection failure count */
  failureCount: number;
  /** Whether connection is lost (3+ failures) */
  connectionLost: boolean;
  /** Reset connection state */
  resetConnection: () => void;
}

/**
 * Hook for auto-refreshing data with intelligent polling
 * - Configurable refresh interval (default 5s)
 * - Pauses when tab is not visible
 * - Exponential backoff on failures
 * - Shows "connection lost" after 3 failures
 * - Auto-reconnects when back online
 */
export function useAutoRefresh<T>({
  fetchFn,
  interval = 5000,
  initialData,
  enabled = true,
}: UseAutoRefreshOptions<T>): UseAutoRefreshReturn<T> {
  const [data, setData] = useState<T | undefined>(initialData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdatedAgo, setLastUpdatedAgo] = useState<number | null>(null);
  const [failureCount, setFailureCount] = useState(0);
  const [connectionLost, setConnectionLost] = useState(false);
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastUpdateTimeRef = useRef<number | null>(null);
  const backoffDelayRef = useRef<number>(interval);
  const isMountedRef = useRef(true);

  // Calculate time since last update
  useEffect(() => {
    if (!lastUpdateTimeRef.current) return;

    const updateAgo = () => {
      if (isMountedRef.current) {
        const seconds = Math.floor((Date.now() - lastUpdateTimeRef.current!) / 1000);
        setLastUpdatedAgo(seconds);
      }
    };

    updateAgo();
    const timer = setInterval(updateAgo, 1000);
    return () => clearInterval(timer);
  }, []);

  const executeFetch = useCallback(async () => {
    try {
      const result = await fetchFn();
      
      if (isMountedRef.current) {
        setData(result);
        setError(null);
        setFailureCount(0);
        setConnectionLost(false);
        lastUpdateTimeRef.current = Date.now();
        backoffDelayRef.current = interval; // Reset backoff on success
      }
    } catch (err) {
      if (isMountedRef.current) {
        const newError = err instanceof Error ? err : new Error(String(err));
        setError(newError);
        setFailureCount(prev => {
          const newCount = prev + 1;
          if (newCount >= 3) {
            setConnectionLost(true);
          }
          return newCount;
        });
        
        // Exponential backoff: double the delay, max 60s
        backoffDelayRef.current = Math.min(backoffDelayRef.current * 2, 60000);
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
        setRefreshing(false);
      }
    }
  }, [fetchFn, interval]);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    backoffDelayRef.current = interval; // Reset backoff on manual refresh
    await executeFetch();
  }, [executeFetch, interval]);

  // Check if tab is visible
  const isTabVisible = useCallback(() => {
    return document.visibilityState === 'visible';
  }, []);

  // Initial fetch and setup polling
  useEffect(() => {
    isMountedRef.current = true;
    
    // Initial fetch
    executeFetch();

    if (!enabled) return;

    // Setup polling interval
    const startPolling = () => {
      // Only poll if tab is visible
      if (!isTabVisible()) return;

      intervalRef.current = setInterval(() => {
        if (isTabVisible() && !connectionLost) {
          executeFetch();
        }
      }, backoffDelayRef.current);
    };

    startPolling();

    // Visibility change handler
    const handleVisibilityChange = () => {
      if (isTabVisible()) {
        // Tab became visible - resume polling
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
        startPolling();
      } else {
        // Tab became hidden - pause polling
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Cleanup
    return () => {
      isMountedRef.current = false;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [enabled, executeFetch, isTabVisible, connectionLost, interval]);

  const resetConnection = useCallback(() => {
    setFailureCount(0);
    setConnectionLost(false);
    backoffDelayRef.current = interval;
    refresh();
  }, [refresh, interval]);

  return {
    data,
    loading,
    error,
    refresh,
    refreshing,
    lastUpdatedAgo,
    failureCount,
    connectionLost,
    resetConnection,
  };
}

/**
 * Format time ago for display
 */
export function formatLastUpdated(seconds: number | null): string {
  if (seconds === null) return 'Never';
  if (seconds < 1) return 'Just now';
  if (seconds === 1) return '1s ago';
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes === 1) return '1m ago';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours === 1) return '1h ago';
  return `${hours}h ago`;
}
