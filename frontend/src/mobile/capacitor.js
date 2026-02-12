import { Capacitor } from '@capacitor/core';
import { PushNotifications } from '@capacitor/push-notifications';
import { Network } from '@capacitor/network';
import { Preferences } from '@capacitor/preferences';
import { App } from '@capacitor/app';
import { StatusBar, Style } from '@capacitor/status-bar';
import { SplashScreen } from '@capacitor/splash-screen';

// Check if running on native platform
export const isNative = () => Capacitor.isNativePlatform();
export const getPlatform = () => Capacitor.getPlatform();

// ==================== PUSH NOTIFICATIONS ====================

export const initPushNotifications = async (onTokenReceived, onNotificationReceived) => {
  if (!isNative()) {
    console.log('Push notifications only available on native platforms');
    return null;
  }

  try {
    // Request permission
    const permStatus = await PushNotifications.requestPermissions();
    
    if (permStatus.receive === 'granted') {
      // Register with Apple/Google to get push token
      await PushNotifications.register();

      // Listen for registration success
      PushNotifications.addListener('registration', (token) => {
        console.log('Push registration success, token:', token.value);
        if (onTokenReceived) {
          onTokenReceived(token.value);
        }
      });

      // Listen for registration errors
      PushNotifications.addListener('registrationError', (error) => {
        console.error('Push registration failed:', error);
      });

      // Listen for push notifications received while app is in foreground
      PushNotifications.addListener('pushNotificationReceived', (notification) => {
        console.log('Push notification received:', notification);
        if (onNotificationReceived) {
          onNotificationReceived(notification);
        }
      });

      // Listen for push notification action (user tapped on notification)
      PushNotifications.addListener('pushNotificationActionPerformed', (action) => {
        console.log('Push notification action performed:', action);
        if (onNotificationReceived) {
          onNotificationReceived(action.notification, true);
        }
      });

      return true;
    } else {
      console.log('Push notification permission denied');
      return false;
    }
  } catch (error) {
    console.error('Error initializing push notifications:', error);
    return false;
  }
};

export const removePushListeners = async () => {
  if (!isNative()) return;
  await PushNotifications.removeAllListeners();
};

// ==================== NETWORK / OFFLINE ====================

let networkListenerHandle = null;

export const initNetworkListener = (onNetworkChange) => {
  if (networkListenerHandle) return;

  networkListenerHandle = Network.addListener('networkStatusChange', (status) => {
    console.log('Network status changed:', status);
    if (onNetworkChange) {
      onNetworkChange(status);
    }
  });

  return networkListenerHandle;
};

export const getNetworkStatus = async () => {
  return await Network.getStatus();
};

export const removeNetworkListener = async () => {
  if (networkListenerHandle) {
    await networkListenerHandle.remove();
    networkListenerHandle = null;
  }
};

// ==================== OFFLINE DATA STORAGE ====================

const OFFLINE_QUEUE_KEY = 'finmar_offline_queue';
const CACHED_DATA_KEY = 'finmar_cached_data';

export const saveToOfflineQueue = async (action) => {
  const { value } = await Preferences.get({ key: OFFLINE_QUEUE_KEY });
  const queue = value ? JSON.parse(value) : [];
  queue.push({ ...action, timestamp: new Date().toISOString() });
  await Preferences.set({ key: OFFLINE_QUEUE_KEY, value: JSON.stringify(queue) });
};

export const getOfflineQueue = async () => {
  const { value } = await Preferences.get({ key: OFFLINE_QUEUE_KEY });
  return value ? JSON.parse(value) : [];
};

export const clearOfflineQueue = async () => {
  await Preferences.remove({ key: OFFLINE_QUEUE_KEY });
};

export const cacheData = async (key, data) => {
  const { value } = await Preferences.get({ key: CACHED_DATA_KEY });
  const cached = value ? JSON.parse(value) : {};
  cached[key] = { data, timestamp: new Date().toISOString() };
  await Preferences.set({ key: CACHED_DATA_KEY, value: JSON.stringify(cached) });
};

export const getCachedData = async (key, maxAgeMs = 3600000) => { // Default 1 hour
  const { value } = await Preferences.get({ key: CACHED_DATA_KEY });
  if (!value) return null;
  
  const cached = JSON.parse(value);
  if (!cached[key]) return null;
  
  const { data, timestamp } = cached[key];
  const age = Date.now() - new Date(timestamp).getTime();
  
  if (age > maxAgeMs) {
    // Data is stale
    return null;
  }
  
  return data;
};

export const clearCachedData = async () => {
  await Preferences.remove({ key: CACHED_DATA_KEY });
};

// ==================== APP LIFECYCLE ====================

export const initAppListeners = (onAppStateChange, onBackButton) => {
  if (!isNative()) return;

  // Listen for app state changes (foreground/background)
  App.addListener('appStateChange', (state) => {
    console.log('App state changed. Is active?', state.isActive);
    if (onAppStateChange) {
      onAppStateChange(state.isActive);
    }
  });

  // Handle back button on Android
  App.addListener('backButton', ({ canGoBack }) => {
    if (onBackButton) {
      onBackButton(canGoBack);
    } else if (!canGoBack) {
      App.exitApp();
    } else {
      window.history.back();
    }
  });
};

export const removeAppListeners = async () => {
  if (!isNative()) return;
  await App.removeAllListeners();
};

// ==================== STATUS BAR ====================

export const setStatusBarStyle = async (style = 'light') => {
  if (!isNative()) return;
  
  try {
    await StatusBar.setStyle({ style: style === 'light' ? Style.Light : Style.Dark });
    await StatusBar.setBackgroundColor({ color: '#0f172a' });
  } catch (error) {
    console.error('Error setting status bar style:', error);
  }
};

export const hideStatusBar = async () => {
  if (!isNative()) return;
  await StatusBar.hide();
};

export const showStatusBar = async () => {
  if (!isNative()) return;
  await StatusBar.show();
};

// ==================== SPLASH SCREEN ====================

export const hideSplashScreen = async () => {
  if (!isNative()) return;
  await SplashScreen.hide();
};

export const showSplashScreen = async () => {
  if (!isNative()) return;
  await SplashScreen.show();
};

// ==================== INITIALIZATION ====================

export const initMobileApp = async (options = {}) => {
  if (!isNative()) {
    console.log('Running in web browser, skipping native initialization');
    return;
  }

  const {
    onPushTokenReceived,
    onPushNotificationReceived,
    onNetworkChange,
    onAppStateChange,
    onBackButton
  } = options;

  console.log('Initializing FINMAR mobile app on', getPlatform());

  // Set status bar style
  await setStatusBarStyle('light');

  // Initialize push notifications
  if (onPushTokenReceived || onPushNotificationReceived) {
    await initPushNotifications(onPushTokenReceived, onPushNotificationReceived);
  }

  // Initialize network listener
  if (onNetworkChange) {
    initNetworkListener(onNetworkChange);
  }

  // Initialize app lifecycle listeners
  initAppListeners(onAppStateChange, onBackButton);

  // Hide splash screen after initialization
  await hideSplashScreen();

  console.log('FINMAR mobile app initialized successfully');
};

export const cleanupMobileApp = async () => {
  if (!isNative()) return;
  
  await removePushListeners();
  await removeNetworkListener();
  await removeAppListeners();
};
