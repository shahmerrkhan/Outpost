"use client";

function getLastNDays(n: number) {
  const days: string[] = [];
  const today = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    days.push(d.toISOString().slice(0, 10));
  }
  return days;
}

export default function ActivityHeatmap({ byDay }: { byDay: Record<string, number> }) {
  const days = getLastNDays(70);
  const weeks: string[][] = [];
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }

  function colorFor(count: number) {
    if (count === 0) return "bg-[#1a1a24]";
    if (count <= 2) return "bg-yellow-900";
    if (count <= 5) return "bg-yellow-700";
    if (count <= 9) return "bg-yellow-500";
    return "bg-yellow-400";
  }

  return (
    <div>
      <div className="flex gap-1">
        {weeks.map((week, wi) => (
          <div key={wi} className="flex flex-col gap-1">
            {week.map((day) => (
              <div
                key={day}
                title={`${day}: ${byDay[day] ?? 0} activities`}
                className={`w-3 h-3 rounded-sm ${colorFor(byDay[day] ?? 0)}`}
              />
            ))}
          </div>
        ))}
      </div>
      <div className="flex items-center gap-2 mt-3 text-xs text-gray-500">
        <span>Less</span>
        <div className="w-3 h-3 rounded-sm bg-[#1a1a24]" />
        <div className="w-3 h-3 rounded-sm bg-yellow-900" />
        <div className="w-3 h-3 rounded-sm bg-yellow-700" />
        <div className="w-3 h-3 rounded-sm bg-yellow-500" />
        <div className="w-3 h-3 rounded-sm bg-yellow-400" />
        <span>More</span>
      </div>
    </div>
  );
}