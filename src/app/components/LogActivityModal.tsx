"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { logActivity } from "@/app/actions/outreach";
import { toActionError } from "@/app/lib/action-error";

const ACTIVITY_TYPES = [
  { value: "email", label: "Email Sent" },
  { value: "follow_up", label: "Follow-Up Sent" },
  { value: "call", label: "Call Made" },
  { value: "meeting", label: "Meeting Booked" },
  { value: "sponsor_outreach", label: "Sponsor Outreach" },
  { value: "partnership_outreach", label: "Partnership Outreach" },
  { value: "social_media", label: "Social Media Work" },
  { value: "design_work", label: "Design Work" },
  { value: "dev_work", label: "Development Work" },
  { value: "general_task", label: "General Task" },
];

export default function LogActivityModal({
  teamId,
  onClose,
}: {
  teamId: string;
  onClose: () => void;
}) {
  const [type, setType] = useState("email");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(formData: FormData) {
    setSubmitting(true);
    try {
      await logActivity({
        teamId,
        type: type as any,
        company: formData.get("company") as string,
        contactEmail: formData.get("contactEmail") as string,
        notes: formData.get("notes") as string,
        outcome: formData.get("outcome") as string,
        timeSpentMin: formData.get("timeSpentMin") as string,
      });
      onClose();
    } catch (e) {
      alert(toActionError(e).message);
      setSubmitting(false);
    }
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 10 }}
          transition={{ type: "spring", stiffness: 400, damping: 32, mass: 0.7 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-[#14141c] border border-[#26262f] rounded-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto"
        >
          <div className="flex items-center justify-between p-6 border-b border-[#26262f]">
            <div>
              <h2 className="text-white font-semibold text-lg">Log Activity</h2>
              <p className="text-gray-500 text-sm">Record your work for today</p>
            </div>
            <button onClick={onClose} className="text-gray-500 hover:text-white">
              <X size={20} />
            </button>
          </div>

          <form action={handleSubmit} className="p-6 space-y-5">
            <div>
              <label className="text-xs uppercase tracking-wide text-gray-500 mb-2 block">
                Activity Type <span className="text-red-400">*</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                {ACTIVITY_TYPES.map((t) => (
                  <button
                    key={t.value}
                    type="button"
                    onClick={() => setType(t.value)}
                    className={`text-left text-sm px-3 py-2.5 rounded-lg border transition-all duration-200 ease-out active:scale-[0.97] ${
                      type === t.value
                        ? "bg-yellow-400/10 border-yellow-400/40 text-yellow-400 scale-[1.02]"
                        : "bg-[#0a0a0f] border-[#26262f] text-gray-400 hover:border-gray-600 hover:bg-[#111117] hover:-translate-y-0.5"
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs uppercase tracking-wide text-gray-500 mb-2 block">
                  Company / Person
                </label>
                <input
                  name="company"
                  placeholder="e.g. Microsoft, John Smith"
                  className="bg-[#0a0a0f] border border-[#26262f] text-white placeholder-gray-600 p-3 w-full rounded-lg text-sm focus:outline-none focus:border-yellow-400 transition-colors duration-200 transition-colors duration-200 transition-colors duration-200 transition-colors duration-200 transition-colors duration-200 transition-colors duration-200 transition-colors duration-200 transition-colors duration-200 transition-colors duration-200 transition-colors duration-200 transition-colors duration-200 transition-colors duration-200 transition-colors duration-200 transition-colors duration-200 transition-colors duration-200 transition-colors duration-200 transition-colors duration-200 transition-colors duration-200 transition-colors duration-200 transition-colors duration-200 transition-colors duration-200 transition-colors duration-200 transition-colors duration-200 transition-colors duration-200"
                />
              </div>
              <div>
                <label className="text-xs uppercase tracking-wide text-gray-500 mb-2 block">
                  Contact Email
                </label>
                <input
                  name="contactEmail"
                  placeholder="contact@company.com"
                  className="bg-[#0a0a0f] border border-[#26262f] text-white placeholder-gray-600 p-3 w-full rounded-lg text-sm focus:outline-none focus:border-yellow-400 transition-colors duration-200 transition-colors duration-200 transition-colors duration-200 transition-colors duration-200 transition-colors duration-200 transition-colors duration-200 transition-colors duration-200 transition-colors duration-200 transition-colors duration-200 transition-colors duration-200 transition-colors duration-200 transition-colors duration-200 transition-colors duration-200 transition-colors duration-200 transition-colors duration-200 transition-colors duration-200 transition-colors duration-200 transition-colors duration-200 transition-colors duration-200 transition-colors duration-200 transition-colors duration-200 transition-colors duration-200 transition-colors duration-200"
                />
              </div>
            </div>

            <div>
              <label className="text-xs uppercase tracking-wide text-gray-500 mb-2 block">
                Notes
              </label>
              <textarea
                name="notes"
                placeholder="What happened? Any context..."
                rows={3}
                className="bg-[#0a0a0f] border border-[#26262f] text-white placeholder-gray-600 p-3 w-full rounded-lg text-sm focus:outline-none focus:border-yellow-400 transition-colors duration-200 transition-colors duration-200 transition-colors duration-200 transition-colors duration-200 transition-colors duration-200 transition-colors duration-200 transition-colors duration-200 transition-colors duration-200 transition-colors duration-200 transition-colors duration-200 transition-colors duration-200 transition-colors duration-200 transition-colors duration-200 transition-colors duration-200 transition-colors duration-200 transition-colors duration-200 transition-colors duration-200 transition-colors duration-200 transition-colors duration-200 transition-colors duration-200 transition-colors duration-200 transition-colors duration-200 transition-colors duration-200"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs uppercase tracking-wide text-gray-500 mb-2 block">
                  Outcome
                </label>
                <input
                  name="outcome"
                  placeholder="Result / next steps"
                  className="bg-[#0a0a0f] border border-[#26262f] text-white placeholder-gray-600 p-3 w-full rounded-lg text-sm focus:outline-none focus:border-yellow-400 transition-colors duration-200 transition-colors duration-200 transition-colors duration-200 transition-colors duration-200 transition-colors duration-200 transition-colors duration-200 transition-colors duration-200 transition-colors duration-200 transition-colors duration-200 transition-colors duration-200 transition-colors duration-200 transition-colors duration-200 transition-colors duration-200 transition-colors duration-200 transition-colors duration-200 transition-colors duration-200 transition-colors duration-200 transition-colors duration-200 transition-colors duration-200 transition-colors duration-200 transition-colors duration-200 transition-colors duration-200 transition-colors duration-200"
                />
              </div>
              <div>
                <label className="text-xs uppercase tracking-wide text-gray-500 mb-2 block">
                  Time Spent (min)
                </label>
                <input
                  name="timeSpentMin"
                  type="number"
                  min="0"
                  max="600"
                  placeholder="30"
                  className="bg-[#0a0a0f] border border-[#26262f] text-white placeholder-gray-600 p-3 w-full rounded-lg text-sm focus:outline-none focus:border-yellow-400 transition-colors duration-200 transition-colors duration-200 transition-colors duration-200 transition-colors duration-200 transition-colors duration-200 transition-colors duration-200 transition-colors duration-200 transition-colors duration-200 transition-colors duration-200 transition-colors duration-200 transition-colors duration-200 transition-colors duration-200 transition-colors duration-200 transition-colors duration-200 transition-colors duration-200 transition-colors duration-200 transition-colors duration-200 transition-colors duration-200 transition-colors duration-200 transition-colors duration-200 transition-colors duration-200 transition-colors duration-200 transition-colors duration-200"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 border border-[#26262f] text-gray-300 py-2.5 rounded-lg text-sm"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 bg-yellow-400 text-black font-semibold py-2.5 rounded-lg text-sm disabled:opacity-50"
              >
                {submitting ? "Logging..." : "Log Activity"}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}