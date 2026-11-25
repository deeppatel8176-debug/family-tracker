'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { fetchWithAuth } from './memberApi';

export type GeolocationStatus =
  | 'idle'
  | 'sharing_active'
  | 'sharing_paused'
  | 'permission_denied'
  | 'unavailable'
  | 'offline';

export interface LocationState {
  latitude: number | null;
  longitude: number | null;
  accuracy: number | null;
  altitude: number | null;
  speed: number | null;
  batteryPercentage: number | null;
  lastUpdated: Date | null;
  status: GeolocationStatus;
  errorMessage: string | null;
  isOnline: boolean;
}

export function useGeolocation() {
  const [state, setState] = useState<LocationState>({
    latitude: null,
    longitude: null,
    accuracy: null,
    altitude: null,
    speed: null,
    batteryPercentage: null,
    lastUpdated: null,
    status: 'idle',
    errorMessage: null,
    isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
  });

  const watchIdRef = useRef<number | null>(null);
  const isSharingActiveRef = useRef<boolean>(false);
  const lastSentCoordRef = useRef<{ lat: number; lng: number; time: number } | null>(null);

  // Monitor battery level
  const updateBattery = useCallback(async () => {
    try {
      if ('getBattery' in navigator) {
        const battery: any = await (navigator as any).getBattery();
        const level = Math.round(battery.level * 100);
        setState((prev) => ({ ...prev, batteryPercentage: level }));
      }
    } catch (_) {}
  }, []);

  // Update online/offline listeners
  useEffect(() => {
    const handleOnline = () => setState((s) => ({ ...s, isOnline: true }));
    const handleOffline = () =>
      setState((s) => ({
        ...s,
        isOnline: false,
        status: isSharingActiveRef.current ? 'offline' : s.status,
      }));

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    updateBattery();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [updateBattery]);

  // Handle position update
  const handlePosition = useCallback(
    async (pos: GeolocationPosition) => {
      const { latitude, longitude, accuracy, altitude, speed } = pos.coords;
      const recordedAt = new Date(pos.timestamp);

      setState((prev) => ({
        ...prev,
        latitude,
        longitude,
        accuracy,
        altitude,
        speed,
        lastUpdated: recordedAt,
        status: isSharingActiveRef.current ? 'sharing_active' : 'idle',
        errorMessage: null,
      }));

      // If sharing is active, send coordinates to NestJS
      if (isSharingActiveRef.current) {
        // Debounce: avoid duplicate sends if movement < 2m within 8 seconds
        const now = Date.now();
        if (lastSentCoordRef.current) {
          const latDiff = Math.abs(latitude - lastSentCoordRef.current.lat);
          const lngDiff = Math.abs(longitude - lastSentCoordRef.current.lng);
          const timeDiff = now - lastSentCoordRef.current.time;
          if (latDiff < 0.00003 && lngDiff < 0.00003 && timeDiff < 8000) {
            return;
          }
        }

        try {
          let batteryLevel: number | undefined;
          if ('getBattery' in navigator) {
            const b: any = await (navigator as any).getBattery();
            batteryLevel = Math.round(b.level * 100);
          }

          await fetchWithAuth('/api/locations/update', {
            method: 'POST',
            body: JSON.stringify({
              latitude,
              longitude,
              accuracy,
              altitude: altitude ?? undefined,
              speed: speed ?? undefined,
              batteryPercentage: batteryLevel,
              recordedAt: recordedAt.toISOString(),
            }),
          });

          lastSentCoordRef.current = { lat: latitude, lng: longitude, time: now };
        } catch (err: any) {
          console.error('Failed to send coordinates:', err);
        }
      }
    },
    []
  );

  const handleError = useCallback((err: GeolocationPositionError) => {
    let msg = 'Failed to get location.';
    let status: GeolocationStatus = 'unavailable';

    if (err.code === err.PERMISSION_DENIED) {
      msg = 'Location permission was denied. Please allow location access in Safari settings.';
      status = 'permission_denied';
    } else if (err.code === err.POSITION_UNAVAILABLE) {
      msg = 'GPS signal is currently unavailable.';
      status = 'unavailable';
    } else if (err.code === err.TIMEOUT) {
      msg = 'Location request timed out.';
    }

    setState((prev) => ({
      ...prev,
      status,
      errorMessage: msg,
    }));
  }, []);

  const startSharing = useCallback(async () => {
    if (!('geolocation' in navigator)) {
      setState((s) => ({
        ...s,
        status: 'unavailable',
        errorMessage: 'Geolocation is not supported by your browser.',
      }));
      return false;
    }

    try {
      await fetchWithAuth('/api/locations/sharing/start', { method: 'POST' });
    } catch (_) {}

    isSharingActiveRef.current = true;

    // Clear previous watch if any
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
    }

    // Initial fix
    navigator.geolocation.getCurrentPosition(handlePosition, handleError, {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 5000,
    });

    // Start continuous watching while PWA is active
    watchIdRef.current = navigator.geolocation.watchPosition(handlePosition, handleError, {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 10000,
    });

    setState((prev) => ({ ...prev, status: 'sharing_active', errorMessage: null }));
    return true;
  }, [handlePosition, handleError]);

  const stopSharing = useCallback(async () => {
    isSharingActiveRef.current = false;
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }

    try {
      await fetchWithAuth('/api/locations/sharing/stop', { method: 'POST' });
    } catch (_) {}

    setState((prev) => ({ ...prev, status: 'idle' }));
  }, []);

  const pauseSharing = useCallback(async () => {
    isSharingActiveRef.current = false;
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }

    try {
      await fetchWithAuth('/api/locations/sharing/pause', { method: 'POST' });
    } catch (_) {}

    setState((prev) => ({ ...prev, status: 'sharing_paused' }));
  }, []);

  return {
    ...state,
    startSharing,
    stopSharing,
    pauseSharing,
  };
}
