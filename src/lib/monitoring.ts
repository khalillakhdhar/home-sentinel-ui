import { useEffect, useState } from "react";
import { SensorPoint } from "@/lib/ubidots";

export type TimeRange = "15m" | "1h" | "24h";

export const TIME_RANGE_OPTIONS: Array<{ value: TimeRange; label: string }> = [
  { value: "15m", label: "15 min" },
  { value: "1h", label: "1h" },
  { value: "24h", label: "24h" },
];

const ALERT_SOUND_STORAGE_KEY = "monitoring_alert_sound_enabled";
const GAS_THRESHOLD_STORAGE_KEY = "monitoring_gas_threshold";

export const DEFAULT_GAS_ALERT_THRESHOLD = 600;
export const MIN_GAS_ALERT_THRESHOLD = 100;
export const MAX_GAS_ALERT_THRESHOLD = 2000;

function clampThreshold(value: number) {
  return Math.min(
    MAX_GAS_ALERT_THRESHOLD,
    Math.max(MIN_GAS_ALERT_THRESHOLD, value),
  );
}

function readBooleanFromStorage(key: string, fallback: boolean) {
  if (typeof window === "undefined") {
    return fallback;
  }

  const raw = window.localStorage.getItem(key);
  if (raw === null) {
    return fallback;
  }

  return raw === "true";
}

function readNumberFromStorage(key: string, fallback: number) {
  if (typeof window === "undefined") {
    return fallback;
  }

  const raw = window.localStorage.getItem(key);
  if (!raw) {
    return fallback;
  }

  const parsed = Number(raw);
  if (!Number.isFinite(parsed)) {
    return fallback;
  }

  return clampThreshold(parsed);
}

export function getRangeStartTimestamp(range: TimeRange) {
  const now = Date.now();

  if (range === "15m") {
    return now - 15 * 60 * 1000;
  }

  if (range === "1h") {
    return now - 60 * 60 * 1000;
  }

  return now - 24 * 60 * 60 * 1000;
}

export function filterByTimeRange(history: SensorPoint[], range: TimeRange) {
  const start = getRangeStartTimestamp(range);
  return history.filter((item) => item.timestamp >= start);
}

export function playAlertTone(durationMs = 280, frequency = 880) {
  if (typeof window === "undefined") {
    return;
  }

  const AudioContextClass =
    window.AudioContext ||
    (window as Window & { webkitAudioContext?: typeof AudioContext })
      .webkitAudioContext;
  if (!AudioContextClass) {
    return;
  }

  const context = new AudioContextClass();
  const oscillator = context.createOscillator();
  const gainNode = context.createGain();

  oscillator.type = "sine";
  oscillator.frequency.setValueAtTime(frequency, context.currentTime);

  gainNode.gain.setValueAtTime(0.001, context.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.12, context.currentTime + 0.03);
  gainNode.gain.exponentialRampToValueAtTime(
    0.001,
    context.currentTime + durationMs / 1000,
  );

  oscillator.connect(gainNode);
  gainNode.connect(context.destination);
  oscillator.start();
  oscillator.stop(context.currentTime + durationMs / 1000);

  oscillator.onended = () => {
    void context.close();
  };
}

export function useMonitoringPreferences() {
  const [alertSoundEnabled, setAlertSoundEnabled] = useState(() =>
    readBooleanFromStorage(ALERT_SOUND_STORAGE_KEY, true),
  );
  const [gasAlertThreshold, setGasAlertThresholdState] = useState(() =>
    readNumberFromStorage(
      GAS_THRESHOLD_STORAGE_KEY,
      DEFAULT_GAS_ALERT_THRESHOLD,
    ),
  );

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    window.localStorage.setItem(
      ALERT_SOUND_STORAGE_KEY,
      String(alertSoundEnabled),
    );
  }, [alertSoundEnabled]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    window.localStorage.setItem(
      GAS_THRESHOLD_STORAGE_KEY,
      String(gasAlertThreshold),
    );
  }, [gasAlertThreshold]);

  const setGasAlertThreshold = (value: number) => {
    if (!Number.isFinite(value)) {
      return;
    }

    setGasAlertThresholdState(clampThreshold(value));
  };

  return {
    alertSoundEnabled,
    setAlertSoundEnabled,
    gasAlertThreshold,
    setGasAlertThreshold,
  };
}
