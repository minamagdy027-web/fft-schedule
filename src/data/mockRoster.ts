import { RosterResponse } from '../types/roster';

/**
 * Clean empty initial state.
 * No sensitive agent names, IDs, or roster records are stored or bundled in client source code.
 */
export const mockRosterData: RosterResponse = {
  tabs: ['Current Month'],
  activeTab: 'Current Month',
  dates: [],
  agents: [],
};
