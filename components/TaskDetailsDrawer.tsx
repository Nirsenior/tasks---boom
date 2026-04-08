
import React, { useState } from 'react';
import { Task, TaskStatus, TaskPriority, User } from '../types';
import { ICONS } from '../constants';
import { useZenithStore } from '../store';
import { ComboBox } from './ComboBox';
import { MultiSelectComboBox } from './MultiSelectComboBox';

interface TaskDetailsDrawerProps {
  task: Task | null;
  users: User[];
  onClose: () => void;
  onUpdate: (id: string, updates: Partial<Task>) => void;
  onDelete: (id: string) => void;
}

export const TaskDetailsDrawer: React.FC<TaskDetailsDrawerProps> = ({ task, users, onClose, onUpdate, onDelete }) => {
  const store = useZenithStore();
  const [showError, setShowError] = useState(false);

  if (!task) return null;

  const handleStatusChange = (status: string) => {
    onUpdate(task.id, { status });
  };

  const handleSave = () => {
    if (!task.description || task.description.trim() === '') {
      setShowError(true);
      const textarea = document.getElementById('task-description-input');
      textarea?.focus();
      return;
    }
    setShowError(false);
    onClose();
  };

  const getStatusLabel = (status: string) => {
    switch(status) {
      case TaskStatus.OPEN: return 'פתוח';
      case TaskStatus.IN_PROGRESS: return 'בתהליך';
      case TaskStatus.DONE: return 'בוצע';
      case TaskStatus.NOT_DONE: return 'לא בוצע';
      case TaskStatus.ONGOING: return 'שוטף';
      case TaskStatus.CANCELLED: return 'בוטל';
      default: return status;
    }
  };

  const InputGroup = ({ label, children, isMandatory, error }: { label: string, children?: React.ReactNode, isMandatory?: boolean, error?: boolean }) => (
    <div className="relative pt-2">
      <label className={`absolute -top-1 right-3 px-1 bg-[#0d1117] text-[12px] font-bold z-10 transition-colors ${error ? 'text-red-500' : 'text-slate-500'}`}>
        {label}
        {isMandatory && <span className="text-red-500 mr-0.5">*</span>}
      </label>
      <div className={`w-full rounded-xl transition-all ${error ? 'ring-1 ring-red-500' : ''}`}>
        {children}
      </div>
    </div>
  );

  return (
    <div className="fixed inset-y-0 left-0 w-[560px] bg-[#0d1117] border-r border-[#30363d] shadow-2xl z-[100] flex flex-col animate-in slide-in-from-left duration-300">
      {/* Header */}
      <div className="px-8 py-6 flex items-start justify-between">
        <div className="flex flex-col">
          <h2 className="text-2xl font-black text-white leading-tight">עריכת הנחיה</h2>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-[#30363d] rounded-full text-slate-400 transition-colors">
          <ICONS.Plus className="w-6 h-6 rotate-45" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-grow overflow-y-auto custom-scrollbar px-8 pb-8 space-y-9">
        
        {/* 1. Logical Section - "מגירה" (Moved to first) */}
        <InputGroup label="מגירה">
          <div className="relative group">
            <select className="w-full bg-transparent border border-[#30363d] group-focus-within:border-blue-500/50 rounded-xl px-4 py-3.5 text-sm text-white appearance-none outline-none transition-all cursor-pointer font-bold">
              <option>הנחיות דחופות לביצוע מיידי</option>
              <option>משימות שגרתיות</option>
              <option>תוכנית עבודה שנתית</option>
            </select>
            <ICONS.ChevronDown className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none group-focus-within:text-blue-500" />
          </div>
        </InputGroup>

        {/* 2. Subject / Title - "גורם מנחה" */}
        <InputGroup label="גורם מנחה (ניתן לבחור מספר גורמים)">
          <div className="border border-[#30363d] focus-within:border-blue-500/50 rounded-xl px-2 py-3 transition-all">
            <MultiSelectComboBox 
              values={task.title || []}
              onChange={(val) => onUpdate(task.id, { title: val })}
              options={store.titleSuggestions}
              placeholder="למשל: רמ״ט, מפקד היחידה..."
            />
          </div>
        </InputGroup>

        {/* 3. Detailed Description - "מהות ההנחיה" */}
        <InputGroup 
          label="מהות ההנחיה" 
          isMandatory={true} 
          error={showError && (!task.description || task.description.trim() === '')}
        >
          <textarea 
            id="task-description-input"
            className={`w-full bg-transparent border rounded-xl p-5 min-h-[160px] text-[15px] text-slate-300 outline-none placeholder:text-slate-700 resize-none transition-all leading-relaxed ${showError && (!task.description || task.description.trim() === '') ? 'border-red-500' : 'border-[#30363d] focus:border-blue-500/50'}`}
            value={task.description}
            onChange={(e) => {
              onUpdate(task.id, { description: e.target.value });
              if (e.target.value.trim() !== '') setShowError(false);
            }}
            placeholder="הקלד כאן את פירוט ההנחיה..."
          />
          {showError && (!task.description || task.description.trim() === '') && (
            <p className="text-red-500 text-xs font-bold mt-1 px-1">יש להזין תיאור להנחיה</p>
          )}
        </InputGroup>

        {/* 4. Assignee / Responsibility */}
        <InputGroup label="אחריות ביצוע (ניתן לבחור מספר אחראים)">
          <div className="border border-[#30363d] focus-within:border-blue-500/50 rounded-xl px-2 py-3 transition-all">
            <MultiSelectComboBox 
              values={task.assignee || []}
              onChange={(val) => onUpdate(task.id, { assignee: val })}
              options={store.assigneeSuggestions}
              placeholder="בחר גורם אחראי..."
            />
          </div>
        </InputGroup>

        {/* 5. Status Segmented Control */}
        <div className="space-y-3">
          <label className="text-[13px] font-bold text-slate-400 block px-1">סטטוס ביצוע</label>
          <div className="grid grid-cols-3 gap-2.5">
            {store.statuses.map((status: string) => {
              const isActive = task.status === status;
              return (
                <button
                  key={status}
                  onClick={() => handleStatusChange(status)}
                  className={`py-3 px-2 rounded-xl text-[12px] font-bold transition-all border truncate ${
                    isActive 
                      ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-900/20' 
                      : 'bg-[#161b22] border-[#30363d] text-slate-400 hover:border-slate-500'
                  }`}
                  title={getStatusLabel(status)}
                >
                  {getStatusLabel(status)}
                </button>
              );
            })}
          </div>
        </div>

        {/* 6. Dates Side by Side */}
        <div className="grid grid-cols-2 gap-4">
          <InputGroup label="תאריך התחלה">
             <input 
              type="text"
              className="w-full bg-transparent border border-[#30363d] focus:border-blue-500/50 rounded-xl px-4 py-3.5 text-center text-sm text-white font-bold outline-none transition-all"
              value={task.startTime}
              onChange={(e) => onUpdate(task.id, { startTime: e.target.value })}
              placeholder="01/01/2024"
            />
          </InputGroup>
          <InputGroup label="תאריך גמר">
             <input 
              type="text"
              className="w-full bg-transparent border border-[#30363d] focus:border-blue-500/50 rounded-xl px-4 py-3.5 text-center text-sm text-white font-bold outline-none transition-all"
              value={task.endTime}
              onChange={(e) => onUpdate(task.id, { endTime: e.target.value })}
              placeholder="01/01/2025"
            />
          </InputGroup>
        </div>

        {/* 7. Files Section */}
        <InputGroup label="קבצים ונספחים">
          <div className="w-full h-24 border-2 border-dashed border-[#30363d] hover:border-blue-500/50 rounded-2xl flex flex-col items-center justify-center bg-[#161b22]/30 hover:bg-[#161b22]/50 transition-all cursor-pointer">
             <ICONS.Download className="w-6 h-6 text-slate-600 mb-2" />
             <span className="text-[11px] text-slate-500 font-bold uppercase tracking-widest px-4 text-center">גרור קבצים לכאן או לחץ להעלאה</span>
          </div>
        </InputGroup>
      </div>

      {/* Footer Actions */}
      <div className="p-8 bg-[#0d1117] border-t border-[#30363d] grid grid-cols-5 gap-4">
        <button 
          onClick={onClose}
          className="col-span-1 bg-[#21262d] hover:bg-[#30363d] text-slate-200 font-bold py-4 px-4 rounded-xl transition-all active:scale-95 text-sm"
        >
          ביטול
        </button>
        <button 
          onClick={handleSave}
          className="col-span-4 bg-blue-600 hover:bg-blue-700 text-white font-black py-4 px-8 rounded-xl shadow-xl shadow-blue-900/20 transition-all active:scale-95 text-lg"
        >
          שמור שינויים
        </button>
      </div>
    </div>
  );
};
