import React from 'react';
import { Agent, DateColumn } from '../types/roster';
import { getStatusStyle } from '../utils/rosterUtils';
import { BarChart3 } from 'lucide-react';

interface StatisticsViewProps {
  dates: DateColumn[];
  agents: Agent[];
  onSelectAgent?: (agent: Agent) => void;
}

export const StatisticsView: React.FC<StatisticsViewProps> = ({
  dates,
  agents,
}) => {
  // Compute daily coverage
  const dailyCoverage = dates.map((d) => {
    const shiftCount: { [shift: string]: number } = {
      '08:00': 0,
      '10:00': 0,
      '12:00': 0,
      '15:00': 0,
      '23:00': 0,
      OFF: 0,
      LEAVE: 0,
    };
    let totalWorking = 0;

    agents.forEach((ag) => {
      const match = ag.schedule.find((s) => s.date === d.date);
      const st = (match ? match.status : 'OFF').trim().toUpperCase();

      if (shiftCount[st] !== undefined) {
        shiftCount[st]++;
      }

      if (st === 'OFF') {
        shiftCount.OFF++;
      } else if (
        st.includes('PH') ||
        st.includes('CASUAL') ||
        st.includes('SICK') ||
        st.includes('ANNUAL') ||
        st.includes('UPL')
      ) {
        shiftCount.LEAVE++;
      } else {
        totalWorking++;
      }
    });

    return {
      date: d.date,
      day: d.day,
      totalWorking,
      shifts: shiftCount,
    };
  });

  const shiftsToDisplay = ['08:00', '10:00', '12:00', '15:00', '23:00', 'OFF', 'LEAVE'];

  return (
    <div className="flex-1 bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden flex flex-col">
      {/* Title Bar */}
      <div className="px-4 py-3 border-b border-slate-200 bg-white flex flex-wrap items-center justify-between gap-2 shrink-0">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-indigo-600" />
          <h2 className="text-xs font-black text-slate-900 uppercase tracking-wide">
            DAILY OPERATIONS SHIFT HEADCOUNT
          </h2>
        </div>
        <span className="text-[11px] text-slate-400 font-medium">
          Breakdown of active agents by shift for each day of the month
        </span>
      </div>

      {/* Main Table */}
      <div className="flex-1 overflow-auto">
        <table className="w-full text-xs text-center border-collapse">
          <thead>
            <tr className="bg-[#0f172a] text-white sticky top-0 z-20">
              <th className="px-4 py-2.5 text-left text-[11px] font-black uppercase sticky left-0 bg-[#0f172a] z-30 min-w-[100px] border-r border-slate-700">
                SHIFT
              </th>
              {dates.map((d) => (
                <th
                  key={d.date}
                  className="px-2 py-2 text-[10px] font-bold min-w-[44px] border-r border-slate-800"
                >
                  <div className="text-slate-400 uppercase text-[9px]">{d.day.substring(0, 2)}</div>
                  <div className="text-white font-mono text-[11px]">{d.date}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {shiftsToDisplay.map((shiftName) => (
              <tr key={shiftName} className="hover:bg-slate-50 transition">
                <td className="px-4 py-2 text-left font-bold sticky left-0 bg-white shadow-2xs z-10 border-r border-slate-200">
                  <span
                    className={`inline-block px-2.5 py-0.5 rounded text-[10px] ${getStatusStyle(
                      shiftName
                    )}`}
                  >
                    {shiftName}
                  </span>
                </td>
                {dailyCoverage.map((c) => {
                  const count = c.shifts[shiftName] || 0;
                  return (
                    <td
                      key={c.date}
                      className={`px-1.5 py-2 font-mono text-[11px] border-r border-slate-100 ${
                        count === 0 ? 'text-slate-300' : 'font-bold text-slate-800'
                      }`}
                    >
                      {count > 0 ? count : '·'}
                    </td>
                  );
                })}
              </tr>
            ))}

            {/* Total Working Row */}
            <tr className="bg-indigo-50/70 font-black border-t-2 border-indigo-200">
              <td className="px-4 py-2.5 text-left text-indigo-900 sticky left-0 bg-indigo-50 z-10 text-[11px] border-r border-indigo-200 font-extrabold">
                Total On Duty
              </td>
              {dailyCoverage.map((c) => (
                <td
                  key={c.date}
                  className="px-1.5 py-2.5 font-mono text-indigo-950 font-black text-[11px] border-r border-indigo-100"
                >
                  {c.totalWorking}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};
