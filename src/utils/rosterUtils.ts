import { Agent, AgentStats, DateColumn, ShiftStatCount } from '../types/roster';

export const DEFAULT_API_URL = "https://script.google.com/macros/s/AKfycbzZ3kLxy4hoRqacbuZXWhlJipHBssAboaUngFi_zNBul-T0rGnBlaaNEDkVsZENTIaxIw/exec";

/**
 * Exact color styling from FFT SCHEDULE specs
 */
export function getStatusStyle(status: string): string {
  const s = String(status || '').trim().toUpperCase();

  // OFF -> Gray
  if (s === 'OFF' || s === '') {
    return 'bg-slate-100 text-slate-500 border border-slate-300 font-semibold';
  }

  // 23:00 -> Bold Red
  if (s === '23:00') {
    return 'bg-red-100 text-red-800 border border-red-300 font-black';
  }

  // 15:00 -> Warm Yellow
  if (s === '15:00') {
    return 'bg-amber-100 text-amber-900 border border-amber-300 font-bold';
  }

  // Degrees of Green
  if (s === '08:00' || s === '8:00') {
    return 'bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold';
  }
  if (s === '10:00') {
    return 'bg-emerald-200 text-emerald-950 border border-emerald-400 font-black';
  }
  if (s === '12:00') {
    return 'bg-teal-100 text-teal-900 border border-teal-300 font-bold';
  }

  // Other Shifts
  if (s === '07:00' || s === '7:00') {
    return 'bg-cyan-100 text-cyan-800 border border-cyan-300 font-bold';
  }
  if (s === '14:00' || s === '16:00' || s === '17:00') {
    return 'bg-indigo-100 text-indigo-800 border border-indigo-300 font-bold';
  }

  // Leaves
  if (s.includes('PH')) {
    return 'bg-purple-100 text-purple-900 border border-purple-300 font-black';
  }
  if (s.includes('CASUAL')) {
    return 'bg-stone-200 text-stone-900 border border-stone-400 font-bold';
  }
  if (s.includes('SICK')) {
    return 'bg-sky-100 text-sky-900 border border-sky-300 font-bold';
  }
  if (s.includes('ANNUAL')) {
    return 'bg-blue-100 text-blue-900 border border-blue-300 font-bold';
  }
  if (s.includes('UPL')) {
    return 'bg-rose-200 text-rose-950 border border-rose-400 font-extrabold';
  }

  return 'bg-blue-50 text-blue-800 border border-blue-200 font-semibold';
}

/**
 * Determine shift category for high-level summaries
 */
export function getShiftCategory(status: string): 'off' | 'leave' | 'shift' {
  const s = String(status || '').trim().toUpperCase();
  if (s === 'OFF' || !s) return 'off';
  if (
    s.includes('PH') ||
    s.includes('CASUAL') ||
    s.includes('SICK') ||
    s.includes('ANNUAL') ||
    s.includes('UPL') ||
    s.includes('LEAVE')
  ) {
    return 'leave';
  }
  return 'shift';
}

/**
 * Compute aggregate statistics for an agent
 */
export function computeAgentStats(agent: Agent): AgentStats {
  const counts: ShiftStatCount = {};
  let workingDays = 0;
  let offDays = 0;
  let leaveDays = 0;

  agent.schedule.forEach((s) => {
    const rawStatus = (s.status || 'OFF').trim().toUpperCase();
    counts[rawStatus] = (counts[rawStatus] || 0) + 1;

    const cat = getShiftCategory(rawStatus);
    if (cat === 'shift') workingDays++;
    else if (cat === 'off') offDays++;
    else if (cat === 'leave') leaveDays++;
  });

  return {
    totalDays: agent.schedule.length,
    workingDays,
    offDays,
    leaveDays,
    statusCounts: counts,
  };
}
