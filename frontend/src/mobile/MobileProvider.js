import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useMobileApp, useNetwork, useOfflineQueue } from './hooks';
import { toast } from 'sonner';

const MobileContext = createContext(null);

export const useMobile = () => {
  const context = useContext(MobileContext);
  if (!context) {
    throw new Error('useMobile must be used within MobileProvider');
  }
  return context;
};

export const MobileProvider = ({ children }) => {
  const [pushToken, setPushToken] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const { isOnline, connectionType } = useNetwork();
  const { queue, addToQueue, processQueue, queueLength } = useOfflineQueue();

  const handlePushToken = useCallback((token) => {
    setPushToken(token);
    // Send token to backend for storage
    // This would typically be done after user login
    console.log('Push token received:', token);
  }, []);

  const handlePushNotification = useCallback((notification, tapped = false) => {
    setNotifications(prev => [...prev, { ...notification, tapped, receivedAt: new Date() }]);
    
    if (!tapped) {
      // Show toast for foreground notifications
      toast(notification.title || 'New Notification', {
        description: notification.body,
      });
    }
  }, []);

  const handleNetworkChange = useCallback((status) => {
    if (status.connected) {
      toast.success('Back online');
    } else {
      toast.warning('You are offline. Changes will sync when connected.');
    }
  }, []);

  const handleAppStateChange = useCallback((isActive) => {
    if (isActive) {
      // App came to foreground - sync data
      console.log('App became active');
    }
  }, []);

  const { initialized, isNative, platform } = useMobileApp({
    onPushTokenReceived: handlePushToken,
    onPushNotificationReceived: handlePushNotification,
    onNetworkChange: handleNetworkChange,
    onAppStateChange: handleAppStateChange,
  });

  // Process offline queue when coming back online
  useEffect(() => {
    if (isOnline && queueLength > 0) {
      processQueue(async (action) => {
        // Process each queued action
        // This would typically be API calls that failed while offline
        console.log('Processing offline action:', action);
      });
    }
  }, [isOnline, queueLength, processQueue]);

  const value = {
    initialized,
    isNative,
    platform,
    isOnline,
    connectionType,
    pushToken,
    notifications,
    offlineQueue: queue,
    queueLength,
    addToOfflineQueue: addToQueue,
  };

  return (
    <MobileContext.Provider value={value}>
      {children}
    </MobileContext.Provider>
  );
};

// Offline indicator component
export const OfflineIndicator = () => {
  const { isOnline, queueLength } = useMobile();

  if (isOnline) return null;

  return (
    <div className="fixed top-0 left-0 right-0 bg-amber-500 text-amber-950 text-center py-2 text-sm font-medium z-50">
      📴 You're offline
      {queueLength > 0 && ` • ${queueLength} pending action${queueLength > 1 ? 's' : ''}`}
    </div>
  );
};

export default MobileProvider;
