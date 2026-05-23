"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { usePlanner, Task, WeekRecord } from "../providers";
import { formatWeekLabel } from "../lib/weeks";

type Profile = { name: string; weeklyHours: number; courses: string[] };

function getPriority(dueDate: string): "red" | "amber" | "green" {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(dueDate);
  due.setHours(0, 0, 0, 0);
  const daysUntilDue = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  if (daysUntilDue <= 3) return "red";
  if (daysUntilDue <= 5) return "amber";
  return "green";
}

const priorityConfig = {
  red: { dot: "bg-red-500", badge: "bg-red-50 text-red-600 border border-red-200", label: "Due now" },
  amber: { dot: "bg-amber-400", badge: "bg-amber-50 text-amber-600 border border-amber-200", label: "Coming up" },
  green: { dot: "bg-green-500", badge: "bg-green-50 text-green-600 border border-green-200", label: "On track" },
};


export default function DashboardPage() {
  const router = useRouter();
  const {
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
  } = usePlanner();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showDone, setShowDone] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [expandedWeek, setExpandedWeek] = useState<string | null>(null);

  useEffect(() => {
    const raw = localStorage.getItem("studyPlannerProfile");
    if (!raw) { router.push("/"); return; }
    try {
      setProfile(JSON.parse(raw));
    } catch {
      localStorage.removeItem("studyPlannerProfile");
      router.push("/");
    }
  }, [router]);

  const courseOptions = useMemo(() => {
    const fromProfile = profile?.courses ?? [];
    return Array.from(new Set(["All Courses", ...fromProfile]));
  }, [profile]);

  const filteredTasks = useMemo(() => {
    if (selectedCourse === "All Courses") return tasks;
    return tasks.filter((t) => t.course === selectedCourse);
  }, [tasks, selectedCourse]);

  const todayTasks = filteredTasks.filter((t) => t.list === "today");
  const weekTasks = filteredTasks.filter((t) => t.list === "week");

  function markDone(task: Task) {
    setTasks((prev) => prev.filter((t) => t.id !== task.id));
    setDoneTasks((prev) => [task, ...prev]);
    if (selectedTask?.id === task.id) setSelectedTask(null);
  }

  function handleReset() {
    reset();
    router.push("/");
  }

  if (!profile) return null;

  return (
    <main className="min-h-screen bg-[#f0f2f5]">
      <div className="mx-auto max-w-6xl px-6 py-10">

        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-[#1e293b]">Study Planner</h1>
            <p className="mt-1 text-sm text-[#64748b]">
              {profile.name} • Weekly capacity:{" "}
              <span className="font-semibold">{profile.weeklyHours} hrs</span>
              <span className="mx-2 text-[#cbd5e1]">|</span>
              <span className="font-semibold text-[#2563eb]">
                {formatWeekLabel(currentWeekStart, currentWeekEnd)}
              </span>
            </p>
          </div>

          <div className="flex items-center gap-3">
            <select
              className="rounded-xl border bg-white px-3 py-2 text-sm text-[#1e293b] shadow-sm outline-none"
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
            >
              {courseOptions.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>

            <button
              onClick={() => setShowHistory(true)}
              className="rounded-xl border bg-white px-4 py-2 font-medium text-[#1e293b] shadow-sm hover:bg-slate-50"
            >
              History
            </button>

            <button
              onClick={() => router.push("/tasks/new")}
              className="rounded-xl bg-[#2563eb] px-4 py-2 font-medium text-white shadow-sm hover:opacity-90"
            >
              + New Task
            </button>

            <button
              onClick={handleReset}
              className="rounded-xl border bg-white px-4 py-2 font-medium text-[#1e293b] shadow-sm hover:bg-slate-50"
            >
              Reset
            </button>
          </div>
        </div>

        {/* Legend */}
        <div className="mt-4 flex items-center gap-4">
          <p className="text-xs text-[#94a3b8]">Priority:</p>
          {(["red", "amber", "green"] as const).map((p) => (
            <div key={p} className="flex items-center gap-1.5">
              <span className={`h-2.5 w-2.5 rounded-full ${priorityConfig[p].dot}`} />
              <span className="text-xs text-[#64748b]">{priorityConfig[p].label}</span>
            </div>
          ))}
        </div>

        {/* Cards */}
        <div className="mt-6 grid gap-6 md:grid-cols-3">
          {/* Today */}
          <section className="rounded-2xl border bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-[#1e293b]">Today's Tasks</h2>
              <button
                onClick={() => router.push("/tasks/new?assign=today")}
                className="h-8 w-8 rounded-full bg-[#2563eb] text-white shadow-sm hover:opacity-90"
                title="Add to Today"
              >+</button>
            </div>
            <div className="mt-4 space-y-3">
              {todayTasks.length === 0 ? (
                <p className="text-sm text-[#64748b]">No tasks due today</p>
              ) : (
                todayTasks.map((t) => (
                  <TaskRow key={t.id} task={t} onClick={() => setSelectedTask(t)} onDone={() => markDone(t)} />
                ))
              )}
            </div>
          </section>

          {/* This Week */}
          <section className="rounded-2xl border bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-[#1e293b]">This Week's Tasks</h2>
              <button
                onClick={() => router.push("/tasks/new?assign=week")}
                className="h-8 w-8 rounded-full bg-[#2563eb] text-white shadow-sm hover:opacity-90"
                title="Add to This Week"
              >+</button>
            </div>
            <div className="mt-4 space-y-3">
              {weekTasks.length === 0 ? (
                <p className="text-sm text-[#64748b]">No tasks due this week</p>
              ) : (
                weekTasks.map((t) => (
                  <TaskRow key={t.id} task={t} onClick={() => setSelectedTask(t)} onDone={() => markDone(t)} />
                ))
              )}
            </div>
          </section>

          {/* Stats */}
          <section className="rounded-2xl border bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-[#1e293b]">Stats Overview</h2>
            <div className="mt-4 space-y-3">
              <StatRow label="Weekly capacity" value={`${profile.weeklyHours} hrs`} />
              <StatRow label="Tasks total" value={`${filteredTasks.length}`} />
              <StatRow label="Completed" value={`${doneTasks.length}`} />
              <div className="rounded-xl border p-4">
                <p className="text-sm font-medium text-[#1e293b]">Courses</p>
                <div className="mt-3 space-y-2 text-sm text-[#64748b]">
                  {(profile.courses ?? []).map((c) => <p key={c}>{c}</p>)}
                </div>
              </div>
              <div className="rounded-xl border p-4">
                <p className="text-sm font-medium text-[#1e293b]">Current filter</p>
                <p className="mt-1 text-sm text-[#64748b]">{selectedCourse}</p>
              </div>
            </div>
          </section>
        </div>
      </div>

      {/* Done FAB */}
      <button
        onClick={() => setShowDone(true)}
        className="fixed bottom-6 right-6 flex items-center gap-2 rounded-2xl bg-[#1e293b] px-5 py-3 text-sm font-semibold text-white shadow-lg hover:bg-[#0f172a] transition"
      >
        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white text-[#1e293b] text-xs font-bold">
          {doneTasks.length}
        </span>
        Done
      </button>

      {/* ── History Modal ─────────────────────────────────────── */}
      {showHistory && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
          onClick={() => setShowHistory(false)}
        >
          <div
            className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-[#1e293b]">Week History</h2>
              <button
                onClick={() => setShowHistory(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full border text-[#64748b] hover:bg-slate-50"
              >✕</button>
            </div>

            <div className="mt-4 max-h-[65vh] space-y-3 overflow-y-auto">
              {weekHistory.length === 0 ? (
                <p className="text-sm text-[#64748b]">No past weeks yet. History builds automatically each week.</p>
              ) : (
                weekHistory.map((week) => (
                  <WeekHistoryRow
                    key={week.id}
                    week={week}
                    expanded={expandedWeek === week.id}
                    onToggle={() => setExpandedWeek(expandedWeek === week.id ? null : week.id)}
                  />
                ))
              )}
            </div>

            <button
              onClick={() => setShowHistory(false)}
              className="mt-5 w-full rounded-xl border px-4 py-2 text-sm font-medium text-[#1e293b] hover:bg-slate-50"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* ── Done List Modal ───────────────────────────────────── */}
      {showDone && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
          onClick={() => setShowDone(false)}
        >
          <div
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-[#1e293b]">Completed Tasks</h2>
              <button
                onClick={() => setShowDone(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full border text-[#64748b] hover:bg-slate-50"
              >✕</button>
            </div>
            <div className="mt-4 max-h-[60vh] space-y-3 overflow-y-auto">
              {doneTasks.length === 0 ? (
                <p className="text-sm text-[#64748b]">No completed tasks yet.</p>
              ) : (
                doneTasks.map((t) => (
                  <div key={t.id} className="rounded-2xl border p-4">
                    <div className="flex items-start gap-3">
                      <span className="mt-1 text-green-500">✓</span>
                      <div>
                        <p className="font-semibold text-[#1e293b] line-through opacity-60">{t.name}</p>
                        <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-[#64748b]">
                          <span className="rounded-md bg-slate-100 px-2 py-1 font-medium text-[#1e293b]">{t.course}</span>
                          <span>Due {t.dueDate}</span>
                          <span>•</span>
                          <span>{t.estimatedHours}h</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
            <button
              onClick={() => setShowDone(false)}
              className="mt-5 w-full rounded-xl border px-4 py-2 text-sm font-medium text-[#1e293b] hover:bg-slate-50"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* ── Task Detail Modal ─────────────────────────────────── */}
      {selectedTask && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
          onClick={() => setSelectedTask(null)}
        >
          <div
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className={`mt-0.5 h-3 w-3 flex-shrink-0 rounded-full ${priorityConfig[getPriority(selectedTask.dueDate)].dot}`} />
                <h2 className="text-xl font-bold text-[#1e293b]">{selectedTask.name}</h2>
              </div>
              <button
                onClick={() => setSelectedTask(null)}
                className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border text-[#64748b] hover:bg-slate-50"
              >✕</button>
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              <span className="rounded-lg bg-slate-100 px-3 py-1 text-xs font-medium text-[#1e293b]">{selectedTask.course}</span>
              <span className="rounded-lg bg-blue-50 px-3 py-1 text-xs font-medium text-[#2563eb]">
                {selectedTask.list === "today" ? "Today's Tasks" : "This Week's Tasks"}
              </span>
              <span className={`rounded-lg px-3 py-1 text-xs font-medium ${priorityConfig[getPriority(selectedTask.dueDate)].badge}`}>
                {priorityConfig[getPriority(selectedTask.dueDate)].label}
              </span>
            </div>

            <div className="mt-5 space-y-3">
              <div className="flex items-center justify-between rounded-xl border px-4 py-3">
                <p className="text-sm text-[#64748b]">Due date</p>
                <p className="text-sm font-semibold text-[#1e293b]">{selectedTask.dueDate}</p>
              </div>
              <div className="flex items-center justify-between rounded-xl border px-4 py-3">
                <p className="text-sm text-[#64748b]">Estimated hours</p>
                <p className="text-sm font-semibold text-[#1e293b]">{selectedTask.estimatedHours}h</p>
              </div>
              {selectedTask.notes && (
                <div className="rounded-xl border px-4 py-3">
                  <p className="text-sm text-[#64748b]">Notes</p>
                  <p className="mt-1 text-sm text-[#1e293b]">{selectedTask.notes}</p>
                </div>
              )}
            </div>

            <div className="mt-5 flex gap-3">
              <button
                onClick={() => markDone(selectedTask)}
                className="flex-1 rounded-xl bg-green-500 px-4 py-2 text-sm font-semibold text-white hover:bg-green-600"
              >
                Mark as Done
              </button>
              <button
                onClick={() => setSelectedTask(null)}
                className="flex-1 rounded-xl border px-4 py-2 text-sm font-medium text-[#1e293b] hover:bg-slate-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

// ── Week History Row ──────────────────────────────────────────
function WeekHistoryRow({
  week,
  expanded,
  onToggle,
}: {
  week: WeekRecord;
  expanded: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="rounded-2xl border overflow-hidden">
      {/* Header — always visible */}
      <button
        onClick={onToggle}
        className="flex w-full items-center justify-between px-4 py-3 hover:bg-slate-50 transition"
      >
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold text-[#1e293b]">
            Week {week.weekNumber}
          </span>
          <span className="text-xs text-[#64748b]">
            {formatWeekLabel(week.startDate, week.endDate)}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="rounded-lg bg-green-50 px-2 py-1 text-xs font-medium text-green-600">
            {week.completedTasks.length} done
          </span>
          <span className="rounded-lg bg-red-50 px-2 py-1 text-xs font-medium text-red-500">
            {week.incompleteTasks.length} missed
          </span>
          <span className="text-xs text-[#94a3b8]">{expanded ? "▲" : "▼"}</span>
        </div>
      </button>

      {/* Expanded detail */}
      {expanded && (
        <div className="border-t px-4 pb-4 pt-3 space-y-4">
          {/* Completed */}
          {week.completedTasks.length > 0 && (
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-green-600">
                Completed
              </p>
              <div className="space-y-2">
                {week.completedTasks.map((t) => (
                  <HistoryTaskRow key={t.id} task={t} done />
                ))}
              </div>
            </div>
          )}

          {/* Incomplete */}
          {week.incompleteTasks.length > 0 && (
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-red-500">
                Not completed
              </p>
              <div className="space-y-2">
                {week.incompleteTasks.map((t) => (
                  <HistoryTaskRow key={t.id} task={t} done={false} />
                ))}
              </div>
            </div>
          )}

          {week.completedTasks.length === 0 && week.incompleteTasks.length === 0 && (
            <p className="text-sm text-[#94a3b8]">No tasks recorded for this week.</p>
          )}
        </div>
      )}
    </div>
  );
}

function HistoryTaskRow({ task, done }: { task: Task; done: boolean }) {
  return (
    <div className="flex items-start gap-2 rounded-xl border px-3 py-2">
      <span className={`mt-0.5 text-sm ${done ? "text-green-500" : "text-red-400"}`}>
        {done ? "✓" : "✗"}
      </span>
      <div>
        <p className={`text-sm font-medium text-[#1e293b] ${done ? "line-through opacity-50" : ""}`}>
          {task.name}
        </p>
        <div className="mt-1 flex flex-wrap gap-2 text-xs text-[#64748b]">
          <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[#1e293b]">{task.course}</span>
          <span>Due {task.dueDate}</span>
          <span>•</span>
          <span>{task.estimatedHours}h</span>
        </div>
      </div>
    </div>
  );
}

// ── Task Row ──────────────────────────────────────────────────
function TaskRow({ task, onClick, onDone }: { task: Task; onClick: () => void; onDone: () => void }) {
  const priority = getPriority(task.dueDate);
  const config = priorityConfig[priority];

  return (
    <div className="cursor-pointer rounded-2xl border p-4 shadow-sm transition hover:border-[#2563eb] hover:shadow-md">
      <div className="flex items-start gap-3">
        <span className={`mt-1 h-2.5 w-2.5 flex-shrink-0 rounded-full ${config.dot}`} />
        <div className="min-w-0 flex-1" onClick={onClick}>
          <p className="font-semibold text-[#1e293b]">{task.name}</p>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-[#64748b]">
            <span className="rounded-md bg-slate-100 px-2 py-1 font-medium text-[#1e293b]">{task.course}</span>
            <span>Due {task.dueDate}</span>
            <span>•</span>
            <span>{task.estimatedHours}h</span>
          </div>
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); onDone(); }}
          className="flex-shrink-0 rounded-lg border border-green-200 bg-green-50 px-2 py-1 text-xs font-semibold text-green-600 hover:bg-green-100 transition"
          title="Mark as done"
        >
          Done
        </button>
      </div>
    </div>
  );
}

function StatRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-xl border p-4">
      <p className="text-sm font-medium text-[#64748b]">{label}</p>
      <p className="text-base font-semibold text-[#1e293b]">{value}</p>
    </div>
  );
}

