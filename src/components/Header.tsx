import React from 'react';
import {
  Calendar,
  RefreshCw,
  RotateCcw,
  Users,
  Grid3X3,
  BarChart3,
} from 'lucide-react';
import { ViewMode } from '../types/roster';

interface HeaderProps {
  tabs: string[];
  activeTab: string;
  onSelectTab: (tab: string) => void;
  viewMode: ViewMode;
  onSelectViewMode: (mode: ViewMode) => void;
  onRefresh: () => void;
  isRefreshing: boolean;
  onResetFilters: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  tabs,
  activeTab,
  onSelectTab,
  viewMode,
  onSelectViewMode,
  onRefresh,
  isRefreshing,
  onResetFilters,
}) => {
  return (
    <header className="bg-white border-b border-slate-200 px-4 py-2 shrink-0 z-30 shadow-2xs">
      <div className="max-w-[99%] mx-auto flex flex-wrap items-center justify-between gap-3">
        {/* Title & Brand */}
        <div className="flex items-center space-x-2.5">
          <div className="p-1.5 bg-indigo-600 rounded-md text-white shadow-xs flex items-center justify-center">
            <Calendar className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-sm font-black tracking-tight text-slate-900 leading-none uppercase">
              FFT SCHEDULE
            </h1>
            <p className="text-[10px] text-slate-400 font-semibold tracking-wide">
              FFT Operation Roster
            </p>
          </div>
        </div>

        {/* Controls: Refresh, Month & Mode Switcher */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Live Instant Refresh Button */}
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-bold transition active:scale-95 shadow-2xs cursor-pointer disabled:opacity-50"
            title="Pull live changes from Google Sheet immediately"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>{isRefreshing ? 'Syncing...' : 'Refresh'}</span>
          </button>

          {/* Month Selector */}
          <div className="flex items-center bg-slate-100 rounded-md px-2 py-1 border border-slate-200 text-xs">
            <span className="text-[10px] font-bold text-slate-400 mr-1.5 uppercase">Month:</span>
            <select
              value={activeTab}
              onChange={(e) => onSelectTab(e.target.value)}
              className="bg-transparent font-bold text-slate-800 outline-none cursor-pointer text-xs"
            >
              {tabs.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="inline-flex rounded-md bg-slate-100 p-0.5 border border-slate-200 text-xs font-semibold">
            <button
              onClick={() => onSelectViewMode('roster')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded transition cursor-pointer ${
                viewMode === 'roster'
                  ? 'bg-white text-indigo-600 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Grid3X3 className="w-3.5 h-3.5" />
              <span>Operation Roster</span>
            </button>
            <button
              onClick={() => onSelectViewMode('leader')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded transition cursor-pointer ${
                viewMode === 'leader'
                  ? 'bg-white text-indigo-600 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Team Leader View</span>
            </button>
            <button
              onClick={() => onSelectViewMode('stats')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded transition cursor-pointer ${
                viewMode === 'stats'
                  ? 'bg-white text-indigo-600 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Statistics</span>
            </button>
          </div>

          <button
            onClick={onResetFilters}
            className="text-xs p-1.5 rounded-md border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 cursor-pointer shadow-2xs"
            title="Reset Filters"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </header>
  );
};
