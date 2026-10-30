export interface DateColumn {
  colIndex: number;
  date: string;
  day: string;
}

export interface ScheduleEntry {
  date: string;
  day: string;
  status: string;
}

export interface Agent {
  sfId: string;
  name: string;
  schedule: ScheduleEntry[];
}

export interface RosterResponse {
  tabs: string[];
  activeTab: string;
  dates: DateColumn[];
  agents: Agent[];
}

export type ViewMode = 'roster' | 'leader' | 'stats';

export interface ShiftStatCount {
  [status: string]: number;
}

export interface AgentStats {
  totalDays: number;
  workingDays: number;
  offDays: number;
  leaveDays: number;
  statusCounts: ShiftStatCount;
}
