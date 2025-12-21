export default function Home() {
  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-6xl px-6 py-10">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-slate-900">Study Planner</h1>
          <button className="rounded-xl bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700">
            + New Task
          </button>
        </div>

        {/* Columns */}
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {/* Today */}
          <section className="rounded-2xl border bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">Today’s Tasks</h2>
              <select className="rounded-lg border px-3 py-2 text-sm text-slate-700">
                <option>All Courses</option>
                <option>CS61C</option>
                <option>CS70</option>
                <option>DATA8</option>
              </select>
            </div>

            <div className="mt-4 space-y-3">
              <TaskCard title="Read Chapter 5" course="CS61A" hours={2} meta="Due Today" />
              <TaskCard title="Finish Lab Assignment" course="DATA100" hours={3} meta="Due Today" />
            </div>

            <p className="mt-6 text-center text-sm text-slate-500">No tasks due today</p>
          </section>

          {/* This Week */}
          <section className="rounded-2xl border bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">This Week’s Tasks</h2>

            <div className="mt-4 space-y-3">
              <TaskCard title="Project Draft" course="CS70" hours={4} meta="Due Thu" />
              <TaskCard title="Review Lecture Notes" course="EPS80" hours={2} meta="Due Fri" />
              <TaskCard title="Prepare for Midterm" course="CS61A" hours={3} meta="Overdue" overdue />
            </div>

            <p className="mt-6 text-center text-sm text-slate-500">No tasks due this week</p>
          </section>

          {/* Stats */}
          <section className="rounded-2xl border bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">Stats Overview</h2>

            <div className="mt-4 space-y-3">
              <StatRow label="Planned Hours (This Week)" value="11 hrs" />
              <StatRow label="Tasks Completed" value="4 / 8" />
              <div className="rounded-xl border p-4">
                <p className="text-sm font-medium text-slate-700">Hours by Course</p>
                <div className="mt-3 space-y-2 text-sm text-slate-700">
                  <p>CS61A: 5h</p>
                  <p>DATA100: 3h</p>
                  <p>EPS80: 2h</p>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

function TaskCard({
  title,
  course,
  hours,
  meta,
  overdue,
}: {
  title: string;
  course: string;
  hours: number;
  meta: string;
  overdue?: boolean;
}) {
  return (
    <div className="flex items-start gap-3 rounded-xl border p-4">
      <input type="checkbox" className="mt-1 h-4 w-4" />
      <div className="flex-1">
        <p className="font-semibold text-slate-900">{title}</p>
        <div className="mt-2 flex items-center gap-2 text-sm text-slate-600">
          <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700">
            {course}
          </span>
          <span>
            {hours}h • {meta}
          </span>
        </div>
      </div>

      {overdue ? (
        <span className="rounded-md bg-red-100 px-2 py-1 text-xs font-semibold text-red-700">
          Overdue
        </span>
      ) : null}
    </div>
  );
}

function StatRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-xl border p-4">
      <p className="text-sm font-medium text-slate-700">{label}</p>
      <p className="text-lg font-bold text-slate-900">{value}</p>
    </div>
  );
}
