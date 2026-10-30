import React, { useState } from 'react';
import { Agent, DateColumn } from '../types/roster';
import { getStatusStyle } from '../utils/rosterUtils';
import { UserCheck, ArrowUpDown, Copy, Check } from 'lucide-react';

interface RosterTableProps {
  dates: DateColumn[];
  agents: Agent[];
  selectedAgentIds: Set<string>;
  onSelectAgent: (agent: Agent) => void;
  onToggleAgentSwap: (sfId: string) => void;
  onClearFilters: () => void;
}

export const RosterTable: React.FC<RosterTableProps> = ({
  dates,
  agents,
  selectedAgentIds,
  onSelectAgent,
  onToggleAgentSwap,
  onClearFilters,
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopySfId = (sfId: string) => {
    navigator.clipboard.writeText(sfId);
    setCopiedId(sfId);
    setTimeout(() => setCopiedId(null), 1500);
  };

  if (agents.length === 0) {
    return (
      <div className="flex-1 bg-white rounded-lg border border-slate-200 shadow-xs flex flex-col items-center justify-center p-8 text-center">
        <div className="w-12 h-12 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 mb-3">
          <UserCheck className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-slate-900 mb-1">No agents found</h3>
        <p className="text-xs text-slate-500 max-w-sm mb-4">
          No agent records match the current search term or swap filter criteria.
        </p>
        <button
          onClick={onClearFilters}
          className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-md transition shadow-xs cursor-pointer"
        >
          Reset All Filters
        </button>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden flex flex-col">
      <div className="flex-1 overflow-auto">
        <table className="w-full text-left text-xs">
          <thead>
            {/* Row 1: Days */}
            <tr className="sticky top-0 z-15">
              <th className="th-corner-sfid px-3 py-1.5 text-slate-400 font-bold uppercase text-[10px]">
                FFT
              </th>
              <th className="th-corner-name px-3 py-1.5 text-slate-400 font-bold uppercase text-[10px]">
                Operation Roster
              </th>
              {dates.map((d) => (
                <th
                  key={`day-${d.colIndex}-${d.date}`}
                  className="bg-slate-900 text-slate-300 text-center font-bold px-2 py-1.5 border-r border-slate-700 min-w-[78px] text-[10px] uppercase select-none"
                >
                  {d.day.substring(0, 3)}
                </th>
              ))}
            </tr>

            {/* Row 2: Dates */}
            <tr className="sticky top-[28px] z-15">
              <th className="th-sub-sfid px-3 py-1.5 text-slate-700 font-extrabold text-[11px]">
                SF ID
              </th>
              <th className="th-sub-name px-3 py-1.5 text-slate-700 font-extrabold text-[11px]">
                Full Name
              </th>
              {dates.map((d) => (
                <th
                  key={`date-${d.colIndex}-${d.date}`}
                  className="bg-slate-100 text-slate-800 text-center font-black px-2 py-1.5 border-r border-slate-200 border-b-2 border-slate-300 min-w-[78px] text-[11px] select-none"
                >
                  {d.date}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {agents.map((agent) => {
              const isSelectedForSwap = selectedAgentIds.has(agent.sfId);
              const isCopied = copiedId === agent.sfId;
              return (
                <tr
                  key={agent.sfId}
                  onClick={() => onSelectAgent(agent)}
                  className={`group cursor-pointer transition ${
                    isSelectedForSwap
                      ? 'bg-indigo-50/40 hover:bg-indigo-50/70'
                      : 'hover:bg-slate-50'
                  }`}
                >
                  {/* Sticky SF ID with Easy Copy */}
                  <td
                    className={`sticky-sfid px-2.5 py-1.5 font-mono text-slate-600 font-bold ${
                      isSelectedForSwap
                        ? 'bg-indigo-50/60 font-black text-indigo-700'
                        : 'group-hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1">
                      <div className="flex items-center gap-1">
                        <span>{agent.sfId}</span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCopySfId(agent.sfId);
                          }}
                          className={`p-0.5 rounded transition cursor-pointer ${
                            isCopied
                              ? 'text-emerald-600 bg-emerald-50'
                              : 'text-slate-400 hover:text-indigo-600 hover:bg-slate-100'
                          }`}
                          title={isCopied ? 'Copied SF ID!' : 'Copy SF ID'}
                        >
                          {isCopied ? (
                            <Check className="w-3 h-3 text-emerald-600" />
                          ) : (
                            <Copy className="w-3 h-3 opacity-60 group-hover:opacity-100" />
                          )}
                        </button>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleAgentSwap(agent.sfId);
                        }}
                        className={`text-[9px] p-0.5 rounded transition ${
                          isSelectedForSwap
                            ? 'text-indigo-600 hover:text-indigo-800'
                            : 'opacity-0 group-hover:opacity-100 text-slate-400 hover:text-indigo-600'
                        }`}
                        title={isSelectedForSwap ? 'Remove from swap' : 'Add to swap compare'}
                      >
                        <ArrowUpDown className="w-3 h-3" />
                      </button>
                    </div>
                  </td>

                  {/* Sticky Full Name */}
                  <td
                    className={`sticky-name px-3 py-1.5 font-bold text-slate-900 truncate ${
                      isSelectedForSwap
                        ? 'bg-indigo-50/60 text-indigo-900 font-black'
                        : 'group-hover:bg-slate-50'
                    }`}
                    title={agent.name}
                  >
                    <div className="flex items-center gap-1.5 truncate">
                      <span className="truncate">{agent.name}</span>
                      {isSelectedForSwap && (
                        <span className="text-[9px] px-1 py-0.2 bg-indigo-200/80 text-indigo-800 rounded font-normal shrink-0">
                          Swap
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Shift Cells */}
                  {agent.schedule.map((s, idx) => (
                    <td
                      key={`${agent.sfId}-${s.date}-${idx}`}
                      className="px-1 py-1 text-center border-b border-r border-slate-100"
                    >
                      <span
                        className={`inline-block w-full py-0.5 px-0.5 rounded text-[10px] leading-tight select-none ${getStatusStyle(
                          s.status
                        )}`}
                        title={`${agent.name} - ${s.day} ${s.date}: ${s.status}`}
                      >
                        {s.status}
                      </span>
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
