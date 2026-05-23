// app/lib/weeks.ts

export function getCurrentWeek(): { start: Date; end: Date } {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const day = today.getDay(); // 0 = Sunday
    const sunday = new Date(today);
    sunday.setDate(today.getDate() - day);
    const saturday = new Date(sunday);
    saturday.setDate(sunday.getDate() + 6);
    return { start: sunday, end: saturday };
  }
  
  export function toYMD(date: Date): string {
    return date.toISOString().slice(0, 10);
  }
  
  export function formatWeekLabel(start: string, end: string): string {
    const s = new Date(start + "T00:00:00");
    const e = new Date(end + "T00:00:00");
    const months = [
      "Jan", "Feb", "Mar", "Apr", "May",
      "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
    ];
    return `${months[s.getMonth()]} ${s.getDate()} – ${months[e.getMonth()]} ${e.getDate()}`;
  }
  
  export function formatFullWeekLabel(start: string, end: string): string {
    const s = new Date(start + "T00:00:00");
    const e = new Date(end + "T00:00:00");
    const months = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December",
    ];
    return `${months[s.getMonth()]} ${s.getDate()} – ${months[e.getMonth()]} ${e.getDate()}, ${e.getFullYear()}`;
  }
  
  export function getWeekNumber(
    startDate: string,
    allWeeks: { startDate: string }[]
  ): number {
    const sorted = [...allWeeks].sort(
      (a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
    );
    const idx = sorted.findIndex((w) => w.startDate === startDate);
    return idx === -1 ? allWeeks.length : idx + 1;
  }
  
  export function isDateInCurrentWeek(dateStr: string): boolean {
    const { start, end } = getCurrentWeek();
    const d = new Date(dateStr + "T00:00:00");
    return d >= start && d <= end;
  }
  
  export function isSameWeek(dateStr: string, weekStart: string): boolean {
    const start = new Date(weekStart + "T00:00:00");
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    const d = new Date(dateStr + "T00:00:00");
    return d >= start && d <= end;
  }
  
  export function getPreviousWeekStart(currentWeekStart: string): string {
    const d = new Date(currentWeekStart + "T00:00:00");
    d.setDate(d.getDate() - 7);
    return toYMD(d);
  }
  
  export function getPreviousWeekEnd(currentWeekStart: string): string {
    const d = new Date(currentWeekStart + "T00:00:00");
    d.setDate(d.getDate() - 1);
    return toYMD(d);
  }