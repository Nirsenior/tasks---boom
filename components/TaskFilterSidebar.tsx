
import React, { useMemo, useState } from 'react';
import { Task, TaskStatus } from '../types';
import { ICONS } from '../constants';
import { useZenithStore } from '../store';

interface TaskFilterSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  tasks: Task[];
  filters: {
    status: string[];
    assignee: string[];
    title: string[];
  };
  onFilterChange: (filters: { status: string[]; assignee: string[]; title: string[] }) => void;
}

export const TaskFilterSidebar: React.FC<TaskFilterSidebarProps> = ({ isOpen, onClose, tasks, filters, onFilterChange }) => {
  const store = useZenithStore();
  
  // States for collapsible sections
  const [isStatusOpen, setIsStatusOpen] = useState(true);
  const [isTitleOpen, setIsTitleOpen] = useState(true);
  const [isAssigneeOpen, setIsAssigneeOpen] = useState(true);

  const stats = useMemo(() => {
    const statusCounts: Record<string, number> = {};
    const assigneeCounts: Record<string, number> = {};
    const titleCounts: Record<string, number> = {};

    tasks.forEach(task => {
      statusCounts[task.status] = (statusCounts[task.status] || 0) + 1;
      
      if (task.assignee && task.assignee.length > 0) {
        task.assignee.forEach(a => {
          assigneeCounts[a] = (assigneeCounts[a] || 0) + 1;
        });
      }
      
      if (task.title && task.title.length > 0) {
        task.title.forEach(t => {
          titleCounts[t] = (titleCounts[t] || 0) + 1;
        });
      }
    });

    return { statusCounts, assigneeCounts, titleCounts };
  }, [tasks]);

  if (!isOpen) return null;

  const toggleStatus = (status: string) => {
    const newStatus = filters.status.includes(status)
      ? filters.status.filter(s => s !== status)
      : [...filters.status, status];
    onFilterChange({ ...filters, status: newStatus });
  };

  const toggleAssignee = (name: string) => {
    const newAssignee = filters.assignee.includes(name)
      ? filters.assignee.filter(a => a !== name)
      : [...filters.assignee, name];
    onFilterChange({ ...filters, assignee: newAssignee });
  };

  const toggleTitle = (title: string) => {
    const newTitle = filters.title.includes(title)
      ? filters.title.filter(t => t !== title)
      : [...filters.title, title];
    onFilterChange({ ...filters, title: newTitle });
  };

  const clearAll = () => {
    onFilterChange({ status: [], assignee: [], title: [] });
  };

  const getStatusDotColor = (status: string) => {
    switch(status) {
      case TaskStatus.NOT_DONE: return 'bg-red-500';
      case TaskStatus.DONE: return 'bg-emerald-500';
      case TaskStatus.IN_PROGRESS: return 'bg-purple-500';
      case TaskStatus.ONGOING: return 'bg-blue-500';
      case TaskStatus.CANCELLED: return 'bg-slate-500';
      default: return 'bg-slate-400';
    }
  };

  return (
    <div className="absolute top-0 left-0 bottom-0 w-[300px] bg-[#0d1117] border-r border-[#30363d] z-[60] flex flex-col animate-in slide-in-from-left duration-300 shadow-2xl">
      {/* Centered Header */}
      <div className="relative flex items-center justify-center px-5 py-4 border-b border-[#30363d]">
        <button 
          onClick={onClose} 
          className="absolute left-4 p-1.5 hover:bg-[#30363d] rounded text-slate-400 transition-colors"
        >
          <ICONS.X className="w-5 h-5" />
        </button>
        <div className="flex items-center text-white font-black text-xl">
          <span>סינון הנחיות</span>
          <ICONS.Filter className="w-5 h-5 mr-2 text-blue-500" />
        </div>
      </div>

      {/* Filter Sections */}
      <div className="flex-grow overflow-y-auto custom-scrollbar p-5 space-y-8">
        {/* Status Section */}
        <div className="space-y-4">
          <button 
            onClick={() => setIsStatusOpen(!isStatusOpen)}
            className="w-full flex items-center justify-between group cursor-pointer outline-none"
          >
             <div className="flex items-center">
                <ICONS.ChevronDown className={`w-4 h-4 ml-2 text-slate-500 transition-transform duration-200 ${!isStatusOpen ? 'rotate-90' : ''}`} />
                <span className="text-[16px] font-black text-slate-100 uppercase tracking-wider">סטטוס</span>
             </div>
          </button>
          
          {isStatusOpen && (
            <div className="space-y-3 pr-4 animate-in fade-in slide-in-from-top-1 duration-200">
              {store.statuses.map(s => (
                <button 
                  key={s}
                  onClick={() => toggleStatus(s)}
                  className={`w-full flex items-center justify-between text-[15px] transition-all py-2 px-2 rounded-lg ${filters.status.includes(s) ? 'bg-blue-500/10 text-blue-400' : 'text-slate-400 hover:text-white'}`}
                >
                  <div className="flex items-center">
                     <span className={`w-2.5 h-2.5 rounded-full ml-3 ${getStatusDotColor(s)} shadow-sm`}></span>
                     <span className="font-semibold">{s}</span>
                  </div>
                  <span className="text-slate-600 font-mono text-[13px] min-w-[20px]">{stats.statusCounts[s] || 0}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Guidance Factor (Title) Section */}
        <div className="space-y-4">
          <button 
            onClick={() => setIsTitleOpen(!isTitleOpen)}
            className="w-full flex items-center justify-between group cursor-pointer outline-none"
          >
             <div className="flex items-center">
                <ICONS.ChevronDown className={`w-4 h-4 ml-2 text-slate-500 transition-transform duration-200 ${!isTitleOpen ? 'rotate-90' : ''}`} />
                <span className="text-[16px] font-black text-slate-100 uppercase tracking-wider">גורם מנחה</span>
             </div>
          </button>
          
          {isTitleOpen && (
            <div className="space-y-3 pr-4 animate-in fade-in slide-in-from-top-1 duration-200">
              {Object.keys(stats.titleCounts).map(title => (
                <button 
                  key={title}
                  onClick={() => toggleTitle(title)}
                  className={`w-full flex items-center justify-between text-[15px] transition-all py-2 px-2 rounded-lg ${filters.title.includes(title) ? 'bg-blue-500/10 text-blue-400' : 'text-slate-400 hover:text-white'}`}
                >
                  <span className="font-semibold">{title}</span>
                  <span className="text-slate-600 font-mono text-[13px] min-w-[20px]">{stats.titleCounts[title] || 0}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Responsibility Section */}
        <div className="space-y-4">
          <button 
            onClick={() => setIsAssigneeOpen(!isAssigneeOpen)}
            className="w-full flex items-center justify-between group cursor-pointer outline-none"
          >
             <div className="flex items-center">
                <ICONS.ChevronDown className={`w-4 h-4 ml-2 text-slate-500 transition-transform duration-200 ${!isAssigneeOpen ? 'rotate-90' : ''}`} />
                <span className="text-[16px] font-black text-slate-100 uppercase tracking-wider">אחריות</span>
             </div>
          </button>
          
          {isAssigneeOpen && (
            <div className="space-y-3 pr-4 animate-in fade-in slide-in-from-top-1 duration-200">
              {Object.keys(stats.assigneeCounts).map(name => (
                <button 
                  key={name}
                  onClick={() => toggleAssignee(name)}
                  className={`w-full flex items-center justify-between text-[15px] transition-all py-2 px-2 rounded-lg ${filters.assignee.includes(name) ? 'bg-blue-500/10 text-blue-400' : 'text-slate-400 hover:text-white'}`}
                >
                  <span className="font-semibold">{name}</span>
                  <span className="text-slate-600 font-mono text-[13px] min-w-[20px]">{stats.assigneeCounts[name] || 0}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Footer Actions */}
      <div className="p-4 border-t border-[#30363d] bg-[#161b22]">
        <button 
          onClick={clearAll}
          className="w-full flex items-center justify-center space-x-2 space-x-reverse py-3.5 bg-[#30363d]/50 hover:bg-[#30363d] text-slate-300 hover:text-white rounded-xl transition-all font-black text-[15px]"
        >
          <ICONS.RotateCcw className="w-4.5 h-4.5" />
          <span>נקה את כל המסננים</span>
        </button>
      </div>
    </div>
  );
};

