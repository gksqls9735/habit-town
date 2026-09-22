import { useCallback, useEffect, useRef, useState } from 'react';
import {
  loadLastHourlyDeliveryTime,
  saveLastHourlyDeliveryTime,
} from './hourlyDeliveryRepository';

const DELIVERY_INTERVAL_MS = 60 * 60 * 1000; // 1 hour
const TICK_MS = 1000;

export type HourlyDeliveryState = {
  /** Seconds remaining until next delivery. null while loading. */
  secondsUntilNext: number | null;
  /** Call this after the delivery has been triggered and shown. */
  markDelivered: () => void;
};

/**
 * Tracks the hourly delivery cooldown.
 * Calls onTrigger() once per hour when the cooldown expires.
 */
export function useHourlyDelivery(onTrigger: () => void): HourlyDeliveryState {
  const [secondsUntilNext, setSecondsUntilNext] = useState<number | null>(null);
  const onTriggerRef = useRef(onTrigger);
  onTriggerRef.current = onTrigger;

  const lastDeliveryTimeRef = useRef<number | null>(null);
  const hasTriggeredRef = useRef(false);

  // Load persisted last delivery time on mount.
  useEffect(() => {
    loadLastHourlyDeliveryTime().then((saved) => {
      lastDeliveryTimeRef.current = saved;
      const now = Date.now();
      const elapsed = saved ? now - saved : DELIVERY_INTERVAL_MS;
      const remaining = Math.max(0, DELIVERY_INTERVAL_MS - elapsed);
      setSecondsUntilNext(Math.ceil(remaining / 1000));
    });
  }, []);

  // Tick every second, fire trigger when cooldown hits zero.
  useEffect(() => {
    if (secondsUntilNext === null) return;

    const id = setInterval(() => {
      const now = Date.now();
      const last = lastDeliveryTimeRef.current;
      const elapsed = last ? now - last : DELIVERY_INTERVAL_MS;
      const remaining = Math.max(0, DELIVERY_INTERVAL_MS - elapsed);
      const seconds = Math.ceil(remaining / 1000);

      setSecondsUntilNext(seconds);

      if (seconds <= 0 && !hasTriggeredRef.current) {
        hasTriggeredRef.current = true;
        onTriggerRef.current();
      }
    }, TICK_MS);

    return () => clearInterval(id);
  }, [secondsUntilNext]);

  const markDelivered = useCallback(() => {
    const now = Date.now();
    lastDeliveryTimeRef.current = now;
    hasTriggeredRef.current = false;
    setSecondsUntilNext(Math.ceil(DELIVERY_INTERVAL_MS / 1000));
    saveLastHourlyDeliveryTime(now);
  }, []);

  return { secondsUntilNext, markDelivered };
}

/** Format seconds as MM:SS */
export function formatCountdown(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}
