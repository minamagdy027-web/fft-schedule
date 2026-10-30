/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Agent, RosterResponse, ViewMode } from './types/roster';
import { mockRosterData } from './data/mockRoster';
import { DEFAULT_API_URL } from './utils/rosterUtils';
import { Header } from './components/Header';
import { Toolbar } from './components/Toolbar';
import { RosterTable } from './components/RosterTable';
import { LeaderView } from './components/LeaderView';
import { StatisticsView } from './components/StatisticsView';
import { AgentModal } from './components/AgentModal';
import { useSecurityProtection } from './hooks/useSecurityProtection';

export default function App() {
  useSecurityProtection();

  const [apiUrl] = useState<string>(DEFAULT_API_URL);

  const [data, setData] = useState<RosterResponse>(mockRosterData);
  const [activeTab, setActiveTab] = useState<string>(mockRosterData.activeTab);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  const [viewMode, setViewMode] = useState<ViewMode>('roster');
  const [selectedAgentIds, setSelectedAgentIds] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedLeaderDate, setSelectedLeaderDate] = useState<string>('1');
  const [modalAgent, setModalAgent] = useState<Agent | null>(null);

  // Core Data Fetcher from Google Apps Script Web App
  const loadData = useCallback(
    async (tabName: string = '', isRefresh: boolean = false) => {
      if (isRefresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }

      try {
        const uniqueKey = `live_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
        let url = apiUrl;
        const targetTab = tabName || activeTab;

        if (targetTab && targetTab !== 'Loading...') {
          url += (url.includes('?') ? '&' : '?') + `tab=${encodeURIComponent(targetTab)}&nocache=${uniqueKey}`;
        } else {
          url += (url.includes('?') ? '&' : '?') + `nocache=${uniqueKey}`;
        }

        const res = await fetch(url, { cache: 'no-store' });
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }

        const fetchedData = await res.json();

        if (fetchedData && fetchedData.agents && Array.isArray(fetchedData.agents) && fetchedData.agents.length > 0) {
          setData(fetchedData);
          if (fetchedData.activeTab) {
            setActiveTab(fetchedData.activeTab);
          }
          if (fetchedData.dates && fetchedData.dates.length > 0) {
            setSelectedLeaderDate(fetchedData.dates[0].date);
          }
        } else {
          console.warn('Fetched data structure incomplete, using current data state');
        }
      } catch (err) {
        console.warn('Live Google Apps Script fetch notice (using baseline/cached roster):', err);
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [apiUrl, activeTab]
  );

  // Initial load
  useEffect(() => {
    loadData();
    // Default leader date
    if (mockRosterData.dates && mockRosterData.dates.length > 0) {
      setSelectedLeaderDate(mockRosterData.dates[0].date);
    }
  }, []);

  // Tab change
  const handleSelectTab = (newTab: string) => {
    setActiveTab(newTab);
    loadData(newTab, false);
  };

  // Toggle agent in swap filter
  const handleToggleAgent = (sfId: string) => {
    setSelectedAgentIds((prev) => {
      const next = new Set(prev);
      if (next.has(sfId)) {
        next.delete(sfId);
      } else {
        next.add(sfId);
      }
      return next;
    });
  };

  const handleClearSelectedAgents = () => {
    setSelectedAgentIds(new Set());
  };

  const handleResetFilters = () => {
    setSelectedAgentIds(new Set());
    setSearchTerm('');
  };

  // Filter agents for display
  const agentsToDisplay = data.agents.filter((a) => {
    // If agents selected in swap filter, restrict roster table to selected agents
    if (selectedAgentIds.size > 0 && !selectedAgentIds.has(a.sfId)) {
      return false;
    }
    // Search query filter
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const matchName = a.name.toLowerCase().includes(q);
      const matchId = a.sfId.toLowerCase().includes(q);
      return matchName || matchId;
    }
    return true;
  });

  return (
    <div className="h-screen flex flex-col bg-slate-100 text-slate-800 overflow-hidden font-sans select-none">
      {/* 1. Header Bar */}
      <Header
        tabs={data.tabs}
        activeTab={activeTab}
        onSelectTab={handleSelectTab}
        viewMode={viewMode}
        onSelectViewMode={setViewMode}
        onRefresh={() => loadData(activeTab, true)}
        isRefreshing={isRefreshing}
        onResetFilters={handleResetFilters}
      />

      {/* 2. Structured Swap Tool & Search Toolbar */}
      <Toolbar
        agents={data.agents}
        selectedAgentIds={selectedAgentIds}
        onToggleAgent={handleToggleAgent}
        onClearSelectedAgents={handleClearSelectedAgents}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        totalAgentsCount={data.agents.length}
        filteredAgentsCount={agentsToDisplay.length}
      />

      {/* 3. Main Workspace Area */}
      <main className="flex-1 p-2 sm:p-3 overflow-hidden flex flex-col">
        {isLoading ? (
          <div className="flex-1 flex flex-col items-center justify-center bg-white rounded-lg border border-slate-200">
            <div className="w-9 h-9 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mb-3"></div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">
              Loading FFT Schedule...
            </p>
          </div>
        ) : data.agents.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center bg-white rounded-lg border border-slate-200 p-8 text-center">
            <p className="text-xs text-slate-600 font-semibold mb-3">
              Unable to reach Google Apps Script or no active agents found in tab &ldquo;{activeTab}&rdquo;.
            </p>
            <button
              onClick={() => loadData(activeTab, true)}
              className="px-3 py-1.5 bg-indigo-600 text-white rounded text-xs font-bold hover:bg-indigo-700 cursor-pointer shadow-xs"
            >
              Retry Sync
            </button>
          </div>
        ) : (
          <>
            {/* VIEW 1: MASTER OPERATIONS ROSTER */}
            {viewMode === 'roster' && (
              <RosterTable
                dates={data.dates}
                agents={agentsToDisplay}
                selectedAgentIds={selectedAgentIds}
                onSelectAgent={setModalAgent}
                onToggleAgentSwap={handleToggleAgent}
                onClearFilters={handleResetFilters}
              />
            )}

            {/* VIEW 2: TEAM LEADER VIEW */}
            {viewMode === 'leader' && (
              <LeaderView
                dates={data.dates}
                agents={data.agents}
                selectedDate={selectedLeaderDate}
                onSelectDate={setSelectedLeaderDate}
                onSelectAgent={setModalAgent}
              />
            )}

            {/* VIEW 3: STATISTICS VIEW */}
            {viewMode === 'stats' && (
              <StatisticsView
                dates={data.dates}
                agents={data.agents}
                onSelectAgent={setModalAgent}
              />
            )}
          </>
        )}
      </main>

      {/* Agent Profile Details Modal */}
      {modalAgent && (
        <AgentModal agent={modalAgent} onClose={() => setModalAgent(null)} />
      )}
    </div>
  );
}
