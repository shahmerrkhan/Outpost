"use client";

import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar,
} from "recharts";

const COLORS = ["#facc15", "#60a5fa", "#a78bfa", "#4ade80", "#f472b6", "#fb923c", "#22d3ee", "#f87171", "#c084fc", "#94a3b8"];

export default function AnalyticsCharts({
  timeSeries,
  breakdown,
  productivity,
  pipeline,
}: {
  timeSeries: { date: string; count: number }[];
  breakdown: { name: string; value: number }[];
  productivity: { name: string; count: number }[];
  pipeline: { status: string; count: number }[];
}) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="bg-[#14141c] border border-[#26262f] rounded-xl p-6">
        <h3 className="text-white font-semibold mb-4 text-sm">Activity Over Time</h3>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={timeSeries}>
            <CartesianGrid strokeDasharray="3 3" stroke="#26262f" />
            <XAxis dataKey="date" stroke="#666" fontSize={11} />
            <YAxis stroke="#666" fontSize={11} />
            <Tooltip contentStyle={{ background: "#0a0a0f", border: "1px solid #26262f", borderRadius: 8 }} />
            <Line type="monotone" dataKey="count" stroke="#facc15" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-[#14141c] border border-[#26262f] rounded-xl p-6">
        <h3 className="text-white font-semibold mb-4 text-sm">Activity Breakdown</h3>
        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            <Pie data={breakdown} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80}>
              {breakdown.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip contentStyle={{ background: "#0a0a0f", border: "1px solid #26262f", borderRadius: 8 }} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-[#14141c] border border-[#26262f] rounded-xl p-6">
        <h3 className="text-white font-semibold mb-4 text-sm">Team Productivity</h3>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={productivity}>
            <CartesianGrid strokeDasharray="3 3" stroke="#26262f" />
            <XAxis dataKey="name" stroke="#666" fontSize={11} />
            <YAxis stroke="#666" fontSize={11} />
            <Tooltip contentStyle={{ background: "#0a0a0f", border: "1px solid #26262f", borderRadius: 8 }} />
            <Bar dataKey="count" fill="#a78bfa" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-[#14141c] border border-[#26262f] rounded-xl p-6">
        <h3 className="text-white font-semibold mb-4 text-sm">CRM Pipeline</h3>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={pipeline}>
            <CartesianGrid strokeDasharray="3 3" stroke="#26262f" />
            <XAxis dataKey="status" stroke="#666" fontSize={10} angle={-15} textAnchor="end" height={50} />
            <YAxis stroke="#666" fontSize={11} />
            <Tooltip contentStyle={{ background: "#0a0a0f", border: "1px solid #26262f", borderRadius: 8 }} />
            <Bar dataKey="count" fill="#4ade80" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}