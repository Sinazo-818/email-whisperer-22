import { useCallback, useEffect, useRef, useState } from "react";

export type Task = {
  id: string;
  title: string;
  note: string;
  urgency: number;
  impact: number;
  bucket: "Now" | "Soon" | "Later";
  reason: string;
  done: boolean;
};

export type ScheduleBlock = {
  day: string;
  start: string;
  duration: string;
  title: string;
  kind: "focus" | "meeting" | "admin";
};

export type Digest = {
  title: string;
  summary: string;
  actionItems: { task: string; owner: string }[];
  decisions: string[];
  deadlines: { label: string; due: string }[];
};

export type EmailDraft = {
  tone: "Formal" | "Friendly" | "Persuasive";
  intent: string;
  recipient: string;
  sender: string;
  subject: string;
  body: string;
};

export function useLocalState<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(initial);
  const loaded = useRef(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(key);
      if (raw) setValue(JSON.parse(raw) as T);
    } catch {
      /* ignore unreadable storage */
    }
    loaded.current = true;
  }, [key]);

  useEffect(() => {
    if (!loaded.current) return;
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      /* ignore full storage */
    }
  }, [key, value]);

  const update = useCallback((next: T | ((prev: T) => T)) => setValue(next), []);

  return [value, update] as const;
}

export const newId = () => Math.random().toString(36).slice(2, 10);
