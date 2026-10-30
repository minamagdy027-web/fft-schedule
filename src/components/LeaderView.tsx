import React, { useState } from 'react';
import { Agent, DateColumn } from '../types/roster';
import { getShiftCategory, getStatusStyle } from '../utils/rosterUtils';
import { Calendar, Search, Users, Copy, Check } from 'lucide-react';

interface LeaderViewProps {
  dates: DateColumn[];
  agents: Agent[];
  selectedDate: string;
  onSelectDate: (date: string) => void;
  onSelectAgent: (agent: Agent) => void;
}

export const LeaderView: React.FC<LeaderViewProps> = ({
  dates,
  agents,
  selectedDate,
  onSelectDate,
  onSelectAgent,
}) => {
  const [selectedShiftFilter, setSelectedShiftFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [copied, setCopied] = useState(false);
  const [copiedSfId, setCopiedSfId] = useState<string | null>(null);

  // Compute shift counts for the selected date
  const shiftCounts: { [shift: string]: number } = {};
  let totalOnDuty = 0;
  let totalOff = 0;
  let totalLeave = 0;

  const agentDateMap: { agent: Agent; status: string }[] = [];

  agents.forEach((ag) => {
    const match = ag.schedule.find((s) => s.date === selectedDate);
    const status = match ? match.status || 'OFF' : 'OFF';
    shiftCounts[status] = (shiftCounts[status] || 0) + 1;

    const cat = getShiftCategory(status);
    if (cat === 'shift') totalOnDuty++;
    else if (cat === 'off') totalOff++;
    else if (cat === 'leave') totalLeave++;

    agentDateMap.push({ agent: ag, status });
  });

  // Filter agents based on active chip and query
  const filteredAgents = agentDateMap.filter(({ agent, status }) => {
    const matchesFilter = selectedShiftFilter === 'ALL' || status === selectedShiftFilter;
    const matchesSearch =
      agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      agent.sfId.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const currentDateObj = dates.find((d) => d.date === selectedDate);

  const handleCopySummary = () => {
    const lines = [
      `FFT Operations Roster - ${selectedDate} (${currentDateObj?.day || ''})`,
      `Total Agents: ${agents.length} | Working: ${totalOnDuty} | Off: ${totalOff} | Leave: ${totalLeave}`,
      '----------------------------------------',
      ...filteredAgents.map((a) => `${a.agent.sfId} - ${a.agent.name}: ${a.status}`),
    ];
    navigator.clipboard.writeText(lines.join('\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex-1 flex flex-col gap-2 overflow-hidden">
      {/* Top Controls: Date Selector & Headcount Chips */}
      <div className="bg-white rounded-lg border border-slate-200 p-3 shrink-0 flex flex-wrap items-center justify-between gap-3 shadow-2xs">
        {/* Date Selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-indigo-600" />
            Date:
          </span>
          <select
            value={selectedDate}
            onChange={(e) => {
              onSelectDate(e.target.value);
              setSelectedShiftFilter('ALL');
            }}
            className="text-xs font-extrabold text-slate-900 border border-slate-300 rounded px-2.5 py-1.5 bg-slate-50 outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
          >
            {dates.map((d) => (
              <option key={d.date} value={d.date}>
                {d.date} ({d.day})
              </option>
            ))}
          </select>
        </div>

        {/* Quick Duty Metrics */}
        <div className="flex items-center gap-3 text-xs text-slate-600">
          <span className="flex items-center gap-1 font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
            Working: <strong>{totalOnDuty}</strong>
          </span>
          <span className="flex items-center gap-1 font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
            Off: <strong>{totalOff}</strong>
          </span>
          {totalLeave > 0 && (
            <span className="flex items-center gap-1 font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
              Leave: <strong>{totalLeave}</strong>
            </span>
          )}
        </div>

        {/* Headcount Chips */}
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => setSelectedShiftFilter('ALL')}
            className={`px-2.5 py-1 text-xs rounded-full font-bold border transition cursor-pointer ${
              selectedShiftFilter === 'ALL'
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
          >
            All ({agents.length})
          </button>

          {Object.keys(shiftCounts)
            .sort()
            .map((stat) => (
              <button
                key={stat}
                onClick={() =>
                  setSelectedShiftFilter((prev) => (prev === stat ? 'ALL' : stat))
                }
                className={`px-2.5 py-1 text-xs rounded-full font-bold border transition cursor-pointer ${
                  selectedShiftFilter === stat
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                {stat}: {shiftCounts[stat]}
              </button>
            ))}
        </div>
      </div>

      {/* Main Roster Details Table */}
      <div className="flex-1 bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden flex flex-col">
        {/* Table Header Bar with Search & Actions */}
        <div className="px-4 py-2 border-b border-slate-200 bg-slate-50 flex flex-wrap items-center justify-between gap-2">
          <div>
            <span className="text-xs font-black text-slate-800">
              Roster for {selectedDate} ({currentDateObj?.day})
            </span>
            <span className="text-xs text-slate-500 ml-2">
              {selectedShiftFilter === 'ALL'
                ? `Showing all ${filteredAgents.length} agents`
                : `Showing ${filteredAgents.length} agents in "${selectedShiftFilter}"`}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Quick Search */}
            <div className="relative w-48">
              <input
                type="text"
                placeholder="Search date roster..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-xs pl-7 pr-2 py-1 rounded border border-slate-300 outline-none focus:border-indigo-500 bg-white"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2 top-1.5" />
            </div>

            {/* Copy */}
            <button
              onClick={handleCopySummary}
              className="flex items-center gap-1 text-xs px-2.5 py-1 rounded border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 font-medium cursor-pointer"
              title="Copy shift roster to clipboard"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700 font-bold">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-500" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Table Body */}
        <div className="flex-1 overflow-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-100 sticky top-0 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px] z-10">
              <tr>
                <th className="px-4 py-2 w-32">SF ID</th>
                <th className="px-4 py-2">Full Name</th>
                <th className="px-4 py-2 w-48 text-center">Shift / Leave Status</th>
                <th className="px-4 py-2 w-28 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredAgents.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-slate-400">
                    No agents found matching &ldquo;{selectedShiftFilter}&rdquo; or query
                  </td>
                </tr>
              ) : (
                filteredAgents.map(({ agent, status }) => (
                  <tr
                    key={agent.sfId}
                    onClick={() => onSelectAgent(agent)}
                    className="hover:bg-slate-50 cursor-pointer transition"
                  >
                    <td className="px-4 py-2.5 font-mono font-bold text-slate-600">
                      <div className="flex items-center gap-1.5">
                        <span>{agent.sfId}</span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigator.clipboard.writeText(agent.sfId);
                            setCopiedSfId(agent.sfId);
                            setTimeout(() => setCopiedSfId(null), 1500);
                          }}
                          className={`p-1 rounded transition cursor-pointer ${
                            copiedSfId === agent.sfId
                              ? 'text-emerald-600 bg-emerald-50'
                              : 'text-slate-400 hover:text-indigo-600 hover:bg-slate-100'
                          }`}
                          title={copiedSfId === agent.sfId ? 'Copied SF ID!' : 'Copy SF ID'}
                        >
                          {copiedSfId === agent.sfId ? (
                            <Check className="w-3 h-3 text-emerald-600" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                      </div>
                    </td>
                    <td className="px-4 py-2.5 font-bold text-slate-900">
                      {agent.name}
                    </td>
                    <td className="px-4 py-2.5 text-center">
                      <span
                        className={`inline-block px-3 py-1 rounded text-xs leading-none ${getStatusStyle(
                          status
                        )}`}
                      >
                        {status}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectAgent(agent);
                        }}
                        className="text-xs text-indigo-600 hover:text-indigo-800 font-bold hover:underline"
                      >
                        View Profile
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
