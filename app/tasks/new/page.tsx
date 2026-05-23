"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { usePlanner, TaskList } from "../../providers";
import { formatWeekLabel } from "../../lib/weeks";

export default function Page() {
  const router = useRouter();
  const params = useSearchParams();
  const { setTasks, currentWeekStart, currentWeekEnd } = usePlanner();

  const assignParam = params.get("assign");
  const initialList: TaskList = assignParam === "today" ? "today" : "week";

  const [taskName, setTaskName] = useState("");
  const [profileCourses, setProfileCourses] = useState<string[]>([]);
  const [course, setCourse] = useState("");
  const [list, setList] = useState<TaskList>(initialList);
  const [dueDate, setDueDate] = useState(currentWeekStart);
  const [estimatedHours, setEstimatedHours] = useState<number>(1);
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (assignParam === "today") setList("today");
    if (assignParam === "week") setList("week");
  }, [assignParam]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("studyPlannerProfile");
      if (raw) {
        const profile = JSON.parse(raw);
        const courses = profile.courses ?? [];
        setProfileCourses(courses);
        setCourse(courses[0] ?? "");
      } else {
        router.push("/");
      }
    } catch {
      router.push("/");
    }
  }, [router]);

  const canSubmit = useMemo(() => {
    return (
      taskName.trim().length > 0 &&
      course.trim().length > 0 &&
      dueDate.trim().length > 0 &&
      dueDate >= currentWeekStart &&
      dueDate <= currentWeekEnd &&
      Number.isFinite(estimatedHours) &&
      estimatedHours > 0
    );
  }, [taskName, course, dueDate, estimatedHours, currentWeekStart, currentWeekEnd]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!canSubmit) {
      setError("Please fill out all fields. Due date must be within the current week.");
      return;
    }

    const newTask = {
      id: crypto.randomUUID(),
      name: taskName.trim(),
      course,
      list,
      dueDate,
      estimatedHours: Number(estimatedHours),
      notes: notes.trim() ? notes.trim() : undefined,
    };

    setTasks((prev) => [newTask, ...prev]);
    router.push("/dashboard");
  }

  return (
    <main className="min-h-screen bg-[#f0f2f5]">
      <div className="mx-auto max-w-2xl px-6 py-10">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/dashboard")}
            className="flex h-10 w-10 items-center justify-center rounded-full border bg-white text-[#1e293b] shadow-sm hover:bg-slate-50"
            aria-label="Back"
            title="Back"
          >
            ←
          </button>
          <div>
            <h1 className="text-2xl font-bold text-[#1e293b]">New Task</h1>
            <p className="text-xs text-[#64748b]">
              Week of{" "}
              <span className="font-semibold text-[#2563eb]">
                {formatWeekLabel(currentWeekStart, currentWeekEnd)}
              </span>
            </p>
          </div>
        </div>

        <div className="mt-6 rounded-2xl border bg-white p-6 shadow-sm">
          {error ? (
            <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          ) : null}

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-medium text-[#1e293b]">Task name</label>
              <input
                className="mt-2 w-full rounded-xl border bg-white px-3 py-2 text-[#1e293b] placeholder-slate-400 outline-none focus:ring-2 focus:ring-[#2563eb]"
                value={taskName}
                onChange={(e) => setTaskName(e.target.value)}
                placeholder="e.g., Finish HW3"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#1e293b]">Course</label>
              <select
                className="mt-2 w-full rounded-xl border bg-white px-3 py-2 text-[#1e293b] outline-none focus:ring-2 focus:ring-[#2563eb]"
                value={course}
                onChange={(e) => setCourse(e.target.value)}
              >
                {profileCourses.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#1e293b]">Assign to</label>
              <div className="mt-2 inline-flex rounded-xl border bg-white p-1">
                <button
                  type="button"
                  onClick={() => setList("today")}
                  className={[
                    "rounded-lg px-3 py-2 text-sm font-medium transition",
                    list === "today" ? "bg-[#2563eb] text-white" : "text-[#1e293b] hover:bg-slate-50",
                  ].join(" ")}
                >
                  Today's Tasks
                </button>
                <button
                  type="button"
                  onClick={() => setList("week")}
                  className={[
                    "rounded-lg px-3 py-2 text-sm font-medium transition",
                    list === "week" ? "bg-[#2563eb] text-white" : "text-[#1e293b] hover:bg-slate-50",
                  ].join(" ")}
                >
                  This Week's Tasks
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#1e293b]">
                Due date
                <span className="ml-2 text-xs font-normal text-[#94a3b8]">
                  ({formatWeekLabel(currentWeekStart, currentWeekEnd)})
                </span>
              </label>
              <input
                type="date"
                min={currentWeekStart}
                max={currentWeekEnd}
                className="mt-2 w-full rounded-xl border bg-white px-3 py-2 text-[#1e293b] outline-none focus:ring-2 focus:ring-[#2563eb]"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
              <p className="mt-1 text-xs text-[#94a3b8]">
                Only dates within the current week are allowed.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#1e293b]">Estimated hours</label>
              <input
                type="number"
                min={1}
                className="mt-2 w-full rounded-xl border bg-white px-3 py-2 text-[#1e293b] outline-none focus:ring-2 focus:ring-[#2563eb]"
                value={estimatedHours}
                onChange={(e) => setEstimatedHours(Number(e.target.value))}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#1e293b]">Notes (optional)</label>
              <textarea
                className="mt-2 w-full rounded-xl border bg-white px-3 py-2 text-[#1e293b] placeholder-slate-400 outline-none focus:ring-2 focus:ring-[#2563eb]"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Anything you want to remember…"
                rows={4}
              />
            </div>

            <button
              type="submit"
              disabled={!canSubmit}
              className="w-full rounded-xl bg-[#2563eb] px-4 py-3 font-semibold text-white shadow-sm hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Add Task
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}

