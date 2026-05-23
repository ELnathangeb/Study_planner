"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type Profile = {
  name: string;
  weeklyHours: number;
  courses: string[];
};

export default function OnboardingPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [weeklyHours, setWeeklyHours] = useState<number>(10);
  const [courseCount, setCourseCount] = useState<number>(3);
  const [courses, setCourses] = useState<string[]>(["", "", ""]);
  const [error, setError] = useState<string>("");

  // OPTIONAL: If they've already onboarded, skip this page
  useEffect(() => {
    const raw = localStorage.getItem("studyPlannerProfile");
    if (raw) router.push("/dashboard");
  }, [router]);

  // keep courses[] length in sync with courseCount
  useEffect(() => {
    const count = Math.max(1, Math.min(10, Number.isFinite(courseCount) ? courseCount : 1));
    if (count !== courseCount) setCourseCount(count);

    setCourses((prev) => {
      const next = [...prev];
      if (next.length < count) {
        while (next.length < count) next.push("");
      } else if (next.length > count) {
        next.length = count;
      }
      return next;
    });
  }, [courseCount]);

  const canSubmit = useMemo(() => {
    const trimmedName = name.trim();
    const validHours = Number.isFinite(weeklyHours) && weeklyHours > 0;
    const allCoursesFilled = courses.length > 0 && courses.every((c) => c.trim().length > 0);
    return trimmedName.length > 0 && validHours && allCoursesFilled;
  }, [name, weeklyHours, courses]);

  function updateCourse(i: number, value: string) {
    setCourses((prev) => prev.map((c, idx) => (idx === i ? value : c)));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const trimmedName = name.trim();
    const cleanedCourses = courses.map((c) => c.trim()).filter(Boolean);

    if (!trimmedName) return setError("Please enter your name.");
    if (!Number.isFinite(weeklyHours) || weeklyHours <= 0) return setError("Weekly hours must be greater than 0.");
    if (cleanedCourses.length !== courses.length) return setError("Please fill in all course names.");

    const profile: Profile = {
      name: trimmedName,
      weeklyHours: Number(weeklyHours),
      courses: cleanedCourses,
    };

    localStorage.setItem("studyPlannerProfile", JSON.stringify(profile));

    // ✅ IMPORTANT FIX: go to the dashboard route
    router.push("/dashboard");
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-2xl px-6 py-12">
        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <h1 className="text-2xl font-bold text-slate-900">Welcome to Study Planner</h1>
          <p className="mt-2 text-sm text-slate-600">
            Tell us your courses and your weekly study hours so we can personalize your dashboard.
          </p>

          {error ? (
            <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          ) : null}

          <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-medium text-slate-700">Your name</label>
              <input
                className="mt-2 w-full rounded-xl border px-3 py-2 text-slate-900 outline-none focus:ring-2 focus:ring-blue-500"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Elnathan"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">Weekly study hours</label>
              <input
                type="number"
                min={1}
                className="mt-2 w-full rounded-xl border px-3 py-2 text-slate-900 outline-none focus:ring-2 focus:ring-blue-500"
                value={weeklyHours}
                onChange={(e) => setWeeklyHours(Number(e.target.value))}
              />
              <p className="mt-1 text-xs text-slate-500">Example: 10–20 hours/week</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">How many courses are you taking?</label>
              <input
                type="number"
                min={1}
                max={10}
                className="mt-2 w-full rounded-xl border px-3 py-2 text-slate-900 outline-none focus:ring-2 focus:ring-blue-500"
                value={courseCount}
                onChange={(e) => setCourseCount(Number(e.target.value))}
              />
              <p className="mt-1 text-xs text-slate-500">Max 10</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">Course names</label>
              <div className="mt-2 space-y-3">
                {courses.map((c, i) => (
                  <input
                    key={i}
                    className="w-full rounded-xl border px-3 py-2 text-slate-900 outline-none focus:ring-2 focus:ring-blue-500"
                    value={c}
                    onChange={(e) => updateCourse(i, e.target.value)}
                    placeholder={`Course ${i + 1} (e.g., CS61C)`}
                  />
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={!canSubmit}
              className="w-full rounded-xl bg-blue-600 px-4 py-3 font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Save &amp; Continue
            </button>

            <button
              type="button"
              onClick={() => router.push("/dashboard")}
              className="w-full rounded-xl border px-4 py-3 font-semibold text-slate-800 hover:bg-slate-50"
            >
              Back to Dashboard
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}