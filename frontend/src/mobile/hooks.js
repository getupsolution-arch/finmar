import { useState, useEffect, useCallback } from 'react';
import {
  isNative,
  getPlatform,
  initMobileApp,
  cleanupMobileApp,
  getNetworkStatus,
  saveToOfflineQueue,
  getOfflineQueue,
  clearOfflineQueue,
  cacheData,
  getCachedData
} from './capacitor';

// Hook to check if running on native platform
export const useIsNative = () => {
  const [native, setNative] = useState(false);
  const [platform, setPlatform] = useState('web');

  useEffect(() => {
    setNative(isNative());
    setPlatform(getPlatform());
  }, []);

  return { isNative: native, platform };
};

// Hook for network status and offline mode
export const useNetwork = () => {
  const [isOnline, setIsOnline] = useState(true);
  const [connectionType, setConnectionType] = useState('unknown');

  useEffect(() => {
    const checkNetwork = async () => {
      const status = await getNetworkStatus();
      setIsOnline(status.connected);
      setConnectionType(status.connectionType);
    };

    checkNetwork();

    // Also listen to browser online/offline events
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return { isOnline, connectionType };
};

// Hook for offline data queue
export const useOfflineQueue = () => {
  const [queue, setQueue] = useState([]);
  const { isOnline } = useNetwork();

  const loadQueue = useCallback(async () => {
    const q = await getOfflineQueue();
    setQueue(q);
  }, []);

  const addToQueue = useCallback(async (action) => {
    await saveToOfflineQueue(action);
    await loadQueue();
  }, [loadQueue]);

  const processQueue = useCallback(async (processor) => {
    if (!isOnline || queue.length === 0) return;

    for (const action of queue) {
      try {
        await processor(action);
      } catch (error) {
        console.error('Failed to process offline action:', error);
        return; // Stop processing on error
      }
    }

    await clearOfflineQueue();
    setQueue([]);
  }, [isOnline, queue]);

  useEffect(() => {
    loadQueue();
  }, [loadQueue]);

  return { queue, addToQueue, processQueue, queueLength: queue.length };
};

// Hook for cached data
export const useCachedData = (key, fetcher, maxAgeMs = 3600000) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { isOnline } = useNetwork();

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Try to get cached data first
      const cached = await getCachedData(key, maxAgeMs);
      if (cached) {
        setData(cached);
        setLoading(false);
      }

      // If online, fetch fresh data
      if (isOnline && fetcher) {
        const freshData = await fetcher();
        setData(freshData);
        await cacheData(key, freshData);
      } else if (!cached) {
        setError('No cached data available offline');
      }
    } catch (err) {
      setError(err.message);
      // Fall back to cached data on error
      const cached = await getCachedData(key, Infinity);
      if (cached) setData(cached);
    } finally {
      setLoading(false);
    }
  }, [key, fetcher, maxAgeMs, isOnline]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { data, loading, error, refresh };
};

// Hook for push notifications
export const usePushNotifications = (onNotification) => {
  const [pushToken, setPushToken] = useState(null);
  const [permissionGranted, setPermissionGranted] = useState(false);

  useEffect(() => {
    if (!isNative()) return;

    const handleToken = (token) => {
      setPushToken(token);
      setPermissionGranted(true);
    };

    const handleNotification = (notification, tapped = false) => {
      if (onNotification) {
        onNotification(notification, tapped);
      }
    };

    // Initialize is handled by MobileProvider
    return () => {};
  }, [onNotification]);

  return { pushToken, permissionGranted };
};

// Hook for app initialization
export const useMobileApp = (options = {}) => {
  const [initialized, setInitialized] = useState(false);
  const { isNative: native, platform } = useIsNative();

  useEffect(() => {
    const init = async () => {
      await initMobileApp(options);
      setInitialized(true);
    };

    if (native) {
      init();
    } else {
      setInitialized(true);
    }

    return () => {
      cleanupMobileApp();
    };
  }, [native]); // eslint-disable-line react-hooks/exhaustive-deps

  return { initialized, isNative: native, platform };
};
