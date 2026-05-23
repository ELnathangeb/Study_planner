"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

export type TaskList = "today" | "week";

export type Task = {
  id: string;
  name: string;
  course: string;
  list: TaskList;
  dueDate: string; // YYYY-MM-DD
  estimatedHours: number;
  notes?: string;
};

export type WeekRecord = {
  id: string;
  weekNumber: number;
  startDate: string; // YYYY-MM-DD (Sunday)
  endDate: string;   // YYYY-MM-DD (Saturday)
  completedTasks: Task[];
  incompleteTasks: Task[];
};

type PlannerState = {
  tasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
  selectedCourse: string;
  setSelectedCourse: React.Dispatch<React.SetStateAction<string>>;
  doneTasks: Task[];
  setDoneTasks: React.Dispatch<React.SetStateAction<Task[]>>;
  currentWeekStart: string; // YYYY-MM-DD (Sunday)
  currentWeekEnd: string;   // YYYY-MM-DD (Saturday)
  weekHistory: WeekRecord[];
  reset: () => void;
};

const PlannerContext = createContext<PlannerState | null>(null);

// ── date helpers ──────────────────────────────────────────────
function toYMD(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function getWeekBounds(date: Date): { start: Date; end: Date } {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const day = d.getDay(); // 0 = Sunday
  const sunday = new Date(d);
  sunday.setDate(d.getDate() - day);
  const saturday = new Date(sunday);
  saturday.setDate(sunday.getDate() + 6);
  return { start: sunday, end: saturday };
}

function isSameWeek(dateStr: string, weekStart: string): boolean {
  const { start, end } = getWeekBounds(new Date(weekStart));
  const d = new Date(dateStr);
  return d >= start && d <= end;
}
// ─────────────────────────────────────────────────────────────

export function PlannerProvider({ children }: { children: React.ReactNode }) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [doneTasks, setDoneTasks] = useState<Task[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<string>("All Courses");
  const [weekHistory, setWeekHistory] = useState<WeekRecord[]>([]);

  // current week bounds
  const { start: weekStartDate, end: weekEndDate } = getWeekBounds(new Date());
  const currentWeekStart = toYMD(weekStartDate);
  const currentWeekEnd = toYMD(weekEndDate);

  // ── hydrate from localStorage ─────────────────────────────
  useEffect(() => {
    try {
      const raw = localStorage.getItem("studyPlannerTasks");
      if (raw) setTasks(JSON.parse(raw));
    } catch {}
  }, []);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("studyPlannerDone");
      if (raw) setDoneTasks(JSON.parse(raw));
    } catch {}
  }, []);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("studyPlannerHistory");
      if (raw) setWeekHistory(JSON.parse(raw));
    } catch {}
  }, []);
  // ─────────────────────────────────────────────────────────

  // ── persist to localStorage ───────────────────────────────
  useEffect(() => {
    try { localStorage.setItem("studyPlannerTasks", JSON.stringify(tasks)); } catch {}
  }, [tasks]);

  useEffect(() => {
    try { localStorage.setItem("studyPlannerDone", JSON.stringify(doneTasks)); } catch {}
  }, [doneTasks]);

  useEffect(() => {
    try { localStorage.setItem("studyPlannerHistory", JSON.stringify(weekHistory)); } catch {}
  }, [weekHistory]);
  // ─────────────────────────────────────────────────────────

  // ── auto-archive previous week on new week start ──────────
  useEffect(() => {
    try {
      const lastArchivedRaw = localStorage.getItem("studyPlannerLastArchived");
      if (lastArchivedRaw === currentWeekStart) return; // already archived this week

      // check if there was a previous week with data to archive
      const prevSunday = new Date(weekStartDate);
      prevSunday.setDate(prevSunday.getDate() - 7);
      const prevWeekStart = toYMD(prevSunday);
      const prevSaturday = new Date(prevSunday);
      prevSaturday.setDate(prevSunday.getDate() + 6);
      const prevWeekEnd = toYMD(prevSaturday);

      const prevCompleted = doneTasks.filter((t) => isSameWeek(t.dueDate, prevWeekStart));
      const prevIncomplete = tasks.filter((t) => isSameWeek(t.dueDate, prevWeekStart));

      if (prevCompleted.length > 0 || prevIncomplete.length > 0) {
        setWeekHistory((prev) => {
          const alreadyArchived = prev.some((w) => w.startDate === prevWeekStart);
          if (alreadyArchived) return prev;

          const newRecord: WeekRecord = {
            id: crypto.randomUUID(),
            weekNumber: prev.length + 1,
            startDate: prevWeekStart,
            endDate: prevWeekEnd,
            completedTasks: prevCompleted,
            incompleteTasks: prevIncomplete,
          };
          return [newRecord, ...prev];
        });

        // remove archived incomplete tasks from active list
        setTasks((prev) => prev.filter((t) => !isSameWeek(t.dueDate, prevWeekStart)));
      }

      localStorage.setItem("studyPlannerLastArchived", currentWeekStart);
    } catch {}
  }, [currentWeekStart]);
  // ─────────────────────────────────────────────────────────

  const reset = () => {
    setTasks([]);
    setDoneTasks([]);
    setSelectedCourse("All Courses");
    setWeekHistory([]);
    try {
      localStorage.removeItem("studyPlannerTasks");
      localStorage.removeItem("studyPlannerDone");
      localStorage.removeItem("studyPlannerProfile");
      localStorage.removeItem("studyPlannerHistory");
      localStorage.removeItem("studyPlannerLastArchived");
    } catch {}
  };

  const value = useMemo(
    () => ({
      tasks,
      setTasks,
      selectedCourse,
      setSelectedCourse,
      doneTasks,
      setDoneTasks,
      currentWeekStart,
      currentWeekEnd,
      weekHistory,
      reset,
    }),
    [tasks, selectedCourse, doneTasks, currentWeekStart, currentWeekEnd, weekHistory]
  );

  return <PlannerContext.Provider value={value}>{children}</PlannerContext.Provider>;
}

export function usePlanner() {
  const ctx = useContext(PlannerContext);
  if (!ctx) throw new Error("usePlanner must be used within PlannerProvider");
  return ctx;
}