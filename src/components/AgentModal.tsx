import React, { useEffect, useState } from 'react';
import { Agent } from '../types/roster';
import { computeAgentStats, getStatusStyle } from '../utils/rosterUtils';
import { X, Calendar, Clock, Copy, Check } from 'lucide-react';

interface AgentModalProps {
  agent: Agent | null;
  onClose: () => void;
}

export const AgentModal: React.FC<AgentModalProps> = ({ agent, onClose }) => {
  const [copiedSfId, setCopiedSfId] = useState(false);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        onClose();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!agent) return null;

  const stats = computeAgentStats(agent);

  const handleCopySfId = (sfId: string) => {
    navigator.clipboard.writeText(sfId);
    setCopiedSfId(true);
    setTimeout(() => setCopiedSfId(false), 1500);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden border border-slate-200 flex flex-col animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-3.5 bg-slate-50 shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded font-mono">
                SF ID: {agent.sfId}
              </span>
              <button
                onClick={() => handleCopySfId(agent.sfId)}
                className="flex items-center gap-1 text-[10px] font-semibold text-slate-600 hover:text-indigo-700 bg-white border border-slate-200 hover:border-indigo-300 px-1.5 py-0.5 rounded shadow-2xs transition cursor-pointer"
                title="Copy SF ID to clipboard"
              >
                {copiedSfId ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-600" />
                    <span className="text-emerald-700 font-bold">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3 text-slate-400" />
                    <span>Copy SF ID</span>
                  </>
                )}
              </button>
              <span className="text-xs text-slate-400 font-semibold">· Agent Profile</span>
            </div>
            <h2 className="text-lg font-black text-slate-900 mt-0.5 tracking-tight">
              {agent.name}
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="p-1.5 rounded-md text-slate-400 hover:text-slate-700 bg-white border border-slate-200 cursor-pointer shadow-2xs"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-5 overflow-y-auto space-y-4">
          {/* Top Quick Stats */}
          <div className="grid grid-cols-3 gap-2">
            <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-center">
              <span className="text-[10px] font-bold text-emerald-800 uppercase">Working Days</span>
              <div className="text-xl font-black text-emerald-900 mt-0.5">{stats.workingDays}</div>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-center">
              <span className="text-[10px] font-bold text-slate-500 uppercase">Rest / Off Days</span>
              <div className="text-xl font-black text-slate-800 mt-0.5">{stats.offDays}</div>
            </div>
            <div className="p-2.5 rounded-lg bg-purple-50 border border-purple-200 text-center">
              <span className="text-[10px] font-bold text-purple-800 uppercase">Leaves</span>
              <div className="text-xl font-black text-purple-900 mt-0.5">{stats.leaveDays}</div>
            </div>
          </div>

          {/* Detailed Shift Breakdown */}
          <div>
            <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Clock className="w-3 h-3" />
              Shift Distribution
            </h3>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5">
              {Object.keys(stats.statusCounts).map((k) => (
                <div
                  key={k}
                  className="p-2 rounded bg-slate-50 border border-slate-200 text-center"
                >
                  <div className="text-[10px] font-bold text-slate-500 uppercase truncate">
                    {k}
                  </div>
                  <div className="text-base font-black text-slate-900 mt-0.5">
                    {stats.statusCounts[k]}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Schedule Breakdown Calendar Grid */}
          <div>
            <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Calendar className="w-3 h-3" />
              Monthly Schedule Calendar
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              {agent.schedule.map((s) => (
                <div
                  key={`${s.date}-${s.day}`}
                  className="p-2 rounded-lg border border-slate-200 bg-white shadow-2xs flex flex-col justify-between"
                >
                  <div className="flex justify-between items-center text-[10px] pb-1 border-b border-slate-100">
                    <span className="font-bold text-slate-400 uppercase">
                      {s.day.substring(0, 3)}
                    </span>
                    <span className="font-black text-slate-700">{s.date}</span>
                  </div>
                  <div className="mt-1.5 text-center">
                    <span
                      className={`inline-block w-full py-1 text-[11px] font-bold rounded ${getStatusStyle(
                        s.status
                      )}`}
                    >
                      {s.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 text-right shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-md transition cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
