import React, { useState, useRef, useEffect } from 'react';
import { Search, X, ArrowLeftRight, Check, HelpCircle } from 'lucide-react';
import { Agent } from '../types/roster';
import { getStatusStyle } from '../utils/rosterUtils';

interface ToolbarProps {
  agents: Agent[];
  selectedAgentIds: Set<string>;
  onToggleAgent: (sfId: string) => void;
  onClearSelectedAgents: () => void;
  searchTerm: string;
  onSearchChange: (val: string) => void;
  totalAgentsCount: number;
  filteredAgentsCount: number;
}

export const Toolbar: React.FC<ToolbarProps> = ({
  agents,
  selectedAgentIds,
  onToggleAgent,
  onClearSelectedAgents,
  searchTerm,
  onSearchChange,
  totalAgentsCount,
  filteredAgentsCount,
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [dropdownSearch, setDropdownSearch] = useState('');
  const [showLegend, setShowLegend] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredDropdownAgents = agents.filter(
    (a) =>
      a.name.toLowerCase().includes(dropdownSearch.toLowerCase()) ||
      a.sfId.toLowerCase().includes(dropdownSearch.toLowerCase())
  );

  const selectedAgentObjects = agents.filter((a) => selectedAgentIds.has(a.sfId));

  const legendItems = [
    { label: '08:00', desc: 'Morning Shift' },
    { label: '10:00', desc: 'Mid-Morning' },
    { label: '12:00', desc: 'Noon Shift' },
    { label: '15:00', desc: 'Evening Shift' },
    { label: '23:00', desc: 'Night Shift' },
    { label: 'OFF', desc: 'Rest Day' },
    { label: 'CASUAL', desc: 'Casual Leave' },
    { label: 'SICK', desc: 'Sick Leave' },
    { label: 'ANNUAL', desc: 'Annual Leave' },
    { label: 'PH', desc: 'Public Holiday' },
    { label: 'UPL', desc: 'Unpaid Leave' },
  ];

  return (
    <section className="bg-white border-b border-slate-200 px-4 py-2 shrink-0 relative z-30 text-xs">
      <div className="max-w-[99%] mx-auto flex flex-wrap items-center justify-between gap-3">
        {/* Left: Swap Filter & Search Box */}
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5 shrink-0">
            <ArrowLeftRight className="w-3.5 h-3.5 text-indigo-600" />
            <span>Swap Filter:</span>
          </span>

          {/* Search Box & Dropdown Wrapper */}
          <div className="relative w-80 sm:w-96 z-40" ref={containerRef}>
            <div className="relative">
              <input
                type="text"
                placeholder="Search by name or SF ID..."
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                onFocus={() => setDropdownOpen(true)}
                onClick={() => setDropdownOpen(true)}
                className="w-full text-xs pl-8 pr-7 py-1.5 rounded-md border border-slate-300 outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 bg-slate-50 hover:bg-white transition"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
              {searchTerm && (
                <button
                  onClick={() => onSearchChange('')}
                  className="absolute right-2.5 top-1.5 text-slate-400 hover:text-slate-600 font-bold text-xs p-0.5 cursor-pointer"
                  title="Clear search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Dropdown Menu */}
            {dropdownOpen && (
              <div className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-slate-300 rounded-lg shadow-2xl max-h-80 overflow-hidden z-50 flex flex-col">
                <div className="bg-slate-50 px-3 py-2 border-b border-slate-200 flex items-center justify-between text-[11px] font-semibold text-slate-600">
                  <span>
                    {selectedAgentIds.size > 0
                      ? `${selectedAgentIds.size} agent(s) selected for swap`
                      : 'Select agents to compare for swaps'}
                  </span>
                  {selectedAgentIds.size > 0 && (
                    <button
                      onClick={onClearSelectedAgents}
                      className="text-indigo-600 hover:text-indigo-800 text-[10px] font-bold cursor-pointer"
                    >
                      Clear All
                    </button>
                  )}
                </div>

                {/* Dropdown Search Filter */}
                <div className="p-2 border-b border-slate-100 bg-white">
                  <input
                    type="text"
                    placeholder="Filter agent list..."
                    value={dropdownSearch}
                    onChange={(e) => setDropdownSearch(e.target.value)}
                    className="w-full px-2 py-1 text-xs border border-slate-200 rounded outline-none focus:border-indigo-500 bg-slate-50"
                  />
                </div>

                {/* Agent Checkbox List */}
                <div className="overflow-y-auto divide-y divide-slate-100 p-1 max-h-52">
                  {filteredDropdownAgents.length === 0 ? (
                    <div className="p-3 text-center text-xs text-slate-400">
                      No matching agents found
                    </div>
                  ) : (
                    filteredDropdownAgents.map((a) => {
                      const isChecked = selectedAgentIds.has(a.sfId);
                      return (
                        <label
                          key={a.sfId}
                          className={`flex items-center justify-between px-3 py-2 rounded-md cursor-pointer transition text-xs ${
                            isChecked
                              ? 'bg-indigo-50 font-bold border-l-2 border-indigo-600'
                              : 'hover:bg-slate-50'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 truncate">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => onToggleAgent(a.sfId)}
                              className="w-3.5 h-3.5 rounded text-indigo-600 accent-indigo-600 cursor-pointer shrink-0"
                            />
                            <span className="text-slate-800 truncate font-medium">{a.name}</span>
                          </div>
                          <span className="font-mono text-[10px] text-slate-400 bg-slate-50 border border-slate-200 px-1.5 py-0.5 rounded ml-2 shrink-0">
                            {a.sfId}
                          </span>
                        </label>
                      );
                    })
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Selected Agent Badges Bar */}
          <div className="flex flex-wrap items-center gap-1.5">
            {selectedAgentObjects.map((agent) => (
              <span
                key={agent.sfId}
                className="inline-flex items-center gap-1 bg-indigo-50 text-indigo-700 border border-indigo-200 text-[10px] font-bold px-2 py-0.5 rounded shadow-2xs"
              >
                <span>{agent.name.split(' ')[0]}</span>
                <span className="font-mono text-[9px] text-indigo-400">({agent.sfId})</span>
                <button
                  onClick={() => onToggleAgent(agent.sfId)}
                  className="hover:text-red-500 font-black cursor-pointer ml-0.5 text-xs"
                  title="Remove agent from swap"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Right: Agent Count & Legend Toggle */}
        <div className="flex items-center gap-3">
          <div className="text-[11px] text-slate-500 font-medium">
            Showing <strong className="text-slate-800">{filteredAgentsCount}</strong> of{' '}
            <span className="text-slate-600">{totalAgentsCount}</span> agents
          </div>

          {/* Shift Palette Legend Toggle */}
          <div className="relative">
            <button
              onClick={() => setShowLegend(!showLegend)}
              className="flex items-center gap-1 px-2 py-1 rounded border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-600 font-medium text-[11px] cursor-pointer"
            >
              <HelpCircle className="w-3 h-3 text-slate-400" />
              <span>Shift Legend</span>
            </button>

            {showLegend && (
              <div className="absolute right-0 top-full mt-2 w-72 bg-white border border-slate-200 rounded-lg shadow-xl p-3 z-50">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
                  <span className="font-bold text-slate-800 text-xs">Shift Color Palette</span>
                  <button
                    onClick={() => setShowLegend(false)}
                    className="text-slate-400 hover:text-slate-600 text-xs"
                  >
                    ✕
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  {legendItems.map((item) => (
                    <div key={item.label} className="flex items-center gap-1.5 text-[10px]">
                      <span
                        className={`inline-block px-1.5 py-0.5 rounded font-mono text-[9px] ${getStatusStyle(
                          item.label
                        )}`}
                      >
                        {item.label}
                      </span>
                      <span className="text-slate-600 truncate">{item.desc}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
