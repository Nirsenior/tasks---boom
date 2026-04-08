
import React, { useState } from 'react';
import { Task, TaskStatus } from '../types';
import { ICONS } from '../constants';

interface GaugeProps {
  percentage: number;
  count: number;
  label: string;
  color: string;
}

const Gauge: React.FC<GaugeProps> = ({ percentage, count, label, color }) => {
  const radius = 60;
  const circumference = Math.PI * radius;
  // Calculate stroke dashoffset for a semicircle (0 to 100% of half circle)
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-[180px] h-[90px] overflow-hidden flex flex-col items-center">
        {/* SVG Arc */}
        <svg width="160" height="80" viewBox="0 0 140 70" className="mt-2">
          {/* Background Track */}
          <path 
            d="M 10 70 A 60 60 0 0 1 130 70" 
            fill="none" 
            stroke="#21262d" 
            strokeWidth="12" 
            strokeLinecap="round"
          />
          {/* Active Fill */}
          <path 
            d="M 10 70 A 60 60 0 0 1 130 70" 
            fill="none" 
            stroke={color} 
            strokeWidth="12" 
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        
        {/* Inner Text */}
        <div className="absolute top-[35px] left-1/2 -translate-x-1/2 text-center">
          <div className="text-2xl font-black text-white leading-none">{Math.round(percentage)}%</div>
          <div className="text-[11px] text-slate-500 font-bold mt-1.5">{count} הנחיות</div>
        </div>
      </div>
      
      {/* Bottom Label */}
      <div className="mt-3 text-[13px] font-bold text-slate-400 tracking-tight">
        {label}
      </div>
    </div>
  );
};

export const DashboardBI: React.FC<{ tasks: Task[] }> = ({ tasks }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const total = tasks.length || 0;

  const getStats = (statusList: string[]) => {
    const count = tasks.filter(t => statusList.includes(t.status)).length;
    const percentage = total > 0 ? (count / total) * 100 : 0;
    return { count, percentage };
  };

  const openStats = getStats([TaskStatus.OPEN, TaskStatus.ONGOING]);
  const finishedStats = getStats([TaskStatus.DONE]);
  const progressStats = getStats([TaskStatus.IN_PROGRESS]);
  const delayedStats = getStats([TaskStatus.NOT_DONE]);

  return (
    <div className="bg-[#0d1117] border-b border-[#1c2128] transition-all duration-300">
       {/* Header / Toggle Bar */}
       <div 
         className="flex items-center justify-between px-8 py-3 cursor-pointer hover:bg-[#161b22] transition-colors"
         onClick={() => setIsExpanded(!isExpanded)}
       >
         <div className="flex items-center space-x-2 space-x-reverse text-slate-300">
           {isExpanded ? <ICONS.ChevronUp className="w-5 h-5" /> : <ICONS.ChevronDown className="w-5 h-5" />}
           <span className="font-bold text-sm">סטטיסטיקת הנחיות</span>
         </div>
         {!isExpanded && (
           <div className="flex items-center space-x-6 space-x-reverse text-xs font-bold text-slate-500">
             <span>סה"כ: <span className="text-white">{total}</span></span>
             <span className="text-emerald-400">הסתיימו: {finishedStats.count}</span>
             <span className="text-purple-400">פתוחות: {openStats.count}</span>
             <span className="text-slate-400">בביצוע: {progressStats.count}</span>
             <span className="text-rose-400">לא בוצעו: {delayedStats.count}</span>
           </div>
         )}
       </div>

       {/* Expanded Content */}
       {isExpanded && (
         <div className="py-6 px-12 animate-in slide-in-from-top-2 fade-in duration-300">
           <div className="max-w-[1600px] mx-auto flex items-center justify-between">
              
              {/* Total Section (Now on the Right in RTL) */}
              <div className="flex flex-col items-center justify-center pl-8 border-l border-[#30363d]">
                <div className="text-[72px] font-black text-white leading-none tracking-tighter">
                  {total}
                </div>
                <div className="flex items-center mt-4">
                   <span className="text-[14px] font-bold text-slate-400 ml-2">סה"כ הנחיות</span>
                   <div className="w-1.5 h-6 bg-blue-500 rounded-full"></div>
                </div>
              </div>

              {/* Gauges Section (Now on the Left in RTL) */}
              <div className="flex flex-grow justify-around items-end">
                <Gauge 
                  percentage={openStats.percentage} 
                  count={openStats.count} 
                  label="הנחיות פתוחות" 
                  color="#a855f7" 
                />
                <Gauge 
                  percentage={finishedStats.percentage} 
                  count={finishedStats.count} 
                  label="הנחיות שהסתיימו" 
                  color="#10b981" 
                />
                <Gauge 
                  percentage={progressStats.percentage} 
                  count={progressStats.count} 
                  label="הנחיות בביצוע" 
                  color="#4b5563" 
                />
                <Gauge 
                  percentage={delayedStats.percentage} 
                  count={delayedStats.count} 
                  label="הנחיות שלא בוצעו" 
                  color="#f43f5e" 
                />
              </div>

           </div>
         </div>
       )}
    </div>
  );
};
