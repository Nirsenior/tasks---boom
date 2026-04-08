
import React, { useState } from 'react';
import { Task, TaskPriority, User } from '../types';
import { ICONS } from '../constants';
import { useZenithStore } from '../store';

interface TaskBoardViewProps {
  tasks: Task[];
  users: User[];
  onUpdateTask: (id: string, updates: Partial<Task>) => void;
  onSelectTask: (id: string) => void;
}

export const TaskBoardView: React.FC<TaskBoardViewProps> = ({ tasks, users, onUpdateTask, onSelectTask }) => {
  const store = useZenithStore();
  const [editingStatus, setEditingStatus] = useState<string | null>(null);
  const [statusInput, setStatusInput] = useState('');
  const [isAddingColumn, setIsAddingColumn] = useState(false);
  const [newColumnName, setNewColumnName] = useState('');

  const getPriorityColor = (p: TaskPriority) => {
    switch(p) {
      case TaskPriority.HIGH: return 'bg-red-500';
      case TaskPriority.MED: return 'bg-orange-500';
      default: return 'bg-blue-500';
    }
  };

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData('taskId', taskId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDrop = (e: React.DragEvent, status: string) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('taskId');
    if (taskId) {
      onUpdateTask(taskId, { status });
    }
  };

  const handleRenameSubmit = (oldName: string) => {
    const trimmed = statusInput.trim();
    if (trimmed && trimmed !== oldName) {
      store.renameStatus(oldName, trimmed);
    }
    setEditingStatus(null);
  };

  const handleAddColumn = () => {
    if (newColumnName.trim()) {
      store.addStatus(newColumnName.trim());
      setNewColumnName('');
      setIsAddingColumn(false);
    }
  };

  return (
    <div className="flex h-full min-h-[600px] overflow-x-auto custom-scrollbar p-6 space-x-6 space-x-reverse items-start" dir="rtl">
      {store.statuses.map((status, idx) => {
        const columnTasks = tasks.filter(t => t.status === status);
        const isFirst = idx === 0;
        const isLast = idx === store.statuses.length - 1;

        return (
          <div 
            key={status} 
            className="flex-shrink-0 w-80 bg-[#161b22] border border-[#30363d] rounded-2xl flex flex-col max-h-full shadow-sm group/column"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => handleDrop(e, status)}
          >
            {/* Column Header */}
            <div className="p-4 flex items-center justify-between border-b border-[#30363d] bg-[#21262d] rounded-t-2xl min-h-[64px]">
              <div className="flex items-center space-x-3 space-x-reverse flex-grow overflow-hidden pr-1">
                <div className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-lg shadow-blue-500/20 flex-shrink-0"></div>
                
                {editingStatus === status ? (
                  <input 
                    autoFocus
                    className="bg-[#0d1117] border border-blue-500 rounded px-2 py-1 text-sm font-bold text-white outline-none w-full animate-in zoom-in-95 duration-100"
                    value={statusInput}
                    onChange={(e) => setStatusInput(e.target.value)}
                    onBlur={() => handleRenameSubmit(status)}
                    onKeyDown={(e) => e.key === 'Enter' && handleRenameSubmit(status)}
                    onFocus={(e) => e.target.select()}
                  />
                ) : (
                  <div 
                    className="flex items-center space-x-2 space-x-reverse group/title cursor-pointer overflow-hidden flex-grow select-none" 
                    onDoubleClick={() => { setEditingStatus(status); setStatusInput(status); }}
                    title="לחץ פעמיים כדי לערוך את שם העמודה"
                  >
                    <h3 className="text-[15px] font-black text-white truncate hover:text-blue-400 transition-colors">
                      {status}
                    </h3>
                    <ICONS.Edit className="w-3.5 h-3.5 text-slate-500 opacity-0 group-hover/title:opacity-100 transition-opacity flex-shrink-0" />
                  </div>
                )}
                
                <span className="text-[11px] font-bold text-slate-500 bg-[#0d1117] px-2 py-0.5 rounded-full flex-shrink-0 ml-2">
                  {columnTasks.length}
                </span>
              </div>
              
              {/* Column Actions Menu */}
              <div className="flex items-center space-x-1 space-x-reverse opacity-0 group-hover/column:opacity-100 transition-opacity pr-2">
                 <button 
                  onClick={() => store.reorderStatus(idx, 'right')}
                  disabled={isFirst}
                  className={`p-1.5 rounded text-slate-500 hover:text-white transition-colors ${isFirst ? 'opacity-20 cursor-not-allowed' : 'hover:bg-[#30363d]'}`}
                  title="הזז עמודה ימינה"
                 >
                   <ICONS.ArrowRight className="w-4 h-4" />
                 </button>
                 <button 
                  onClick={() => store.reorderStatus(idx, 'left')}
                  disabled={isLast}
                  className={`p-1.5 rounded text-slate-500 hover:text-white transition-colors ${isLast ? 'opacity-20 cursor-not-allowed' : 'hover:bg-[#30363d]'}`}
                  title="הזז עמודה שמאלה"
                 >
                   <ICONS.ArrowLeft className="w-4 h-4" />
                 </button>
                 {store.statuses.length > 1 && (
                   <button 
                    onClick={() => { if(confirm('האם למחוק עמודה זו? ההנחיות יועברו לעמודה אחרת.')) store.deleteStatus(status); }}
                    className="p-1.5 rounded text-slate-500 hover:text-red-400 transition-colors hover:bg-red-400/10"
                    title="מחק עמודה"
                   >
                     <ICONS.X className="w-4 h-4" />
                   </button>
                 )}
              </div>
            </div>

            {/* Column Body */}
            <div className="p-3 flex-grow overflow-y-auto custom-scrollbar space-y-3 pb-6 min-h-[150px]">
              {columnTasks.map(task => (
                <div 
                  key={task.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, task.id)}
                  onClick={() => onSelectTask(task.id)}
                  className="bg-[#0d1117] border border-[#30363d] rounded-xl p-4 hover:border-slate-500 transition-all cursor-grab active:cursor-grabbing group shadow-sm hover:shadow-md animate-in fade-in duration-200"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-mono text-slate-600">#{task.id_num}</span>
                    <div className={`w-2 h-2 rounded-full ${getPriorityColor(task.priority)}`}></div>
                  </div>
                  <h4 className="text-[14px] font-bold text-slate-100 leading-tight mb-3 group-hover:text-blue-400 transition-colors">
                    {task.title?.length > 0 ? task.title.join(', ') : 'ללא גורם מנחה'}
                  </h4>
                  <p className="text-[12px] text-slate-500 line-clamp-2 mb-4 leading-relaxed">
                    {task.description}
                  </p>
                  
                  {task.assignee && task.assignee.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {task.assignee.map(a => (
                        <span key={a} className="text-[10px] font-bold text-blue-400 bg-blue-500/10 px-1.5 py-0.5 rounded">
                          {a}
                        </span>
                      ))}
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between pt-3 border-t border-[#1c2128]">
                    <div className="flex items-center text-[11px] text-slate-400">
                      <ICONS.Clock className="w-3 h-3 ml-1.5 opacity-50" />
                      {task.endTime}
                    </div>
                  </div>
                </div>
              ))}
              
              <button 
                onClick={() => {
                  const newTask = store.addTask({ status });
                  store.setActiveTaskId(newTask.id);
                }}
                className="w-full py-3 border border-dashed border-[#30363d] rounded-xl text-slate-600 hover:text-blue-400 hover:border-blue-500/30 hover:bg-blue-500/5 transition-all text-[13px] font-bold"
              >
                + הוספת הנחיה
              </button>
            </div>
          </div>
        );
      })}

      {/* Add Column Button */}
      <div className="flex-shrink-0 w-80">
        {isAddingColumn ? (
          <div className="bg-[#161b22] border border-blue-500 rounded-2xl p-5 shadow-2xl animate-in zoom-in-95 duration-200">
             <div className="flex items-center justify-between mb-4">
                <h4 className="text-sm font-black text-white">הוספת הנחיה חדשה</h4>
                <button onClick={() => setIsAddingColumn(false)} className="text-slate-500 hover:text-white">
                  <ICONS.X className="w-4 h-4" />
                </button>
             </div>
             <input 
              autoFocus
              className="w-full bg-[#0d1117] border border-[#30363d] rounded-xl px-4 py-3 text-sm text-white font-bold mb-4 outline-none focus:border-blue-500 shadow-inner"
              placeholder="שם העמדה / העמודה..."
              value={newColumnName}
              onChange={(e) => setNewColumnName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddColumn()}
             />
             <div className="flex space-x-2 space-x-reverse">
                <button 
                  onClick={handleAddColumn}
                  className="flex-grow bg-blue-600 text-white font-bold py-2.5 rounded-xl text-sm hover:bg-blue-700 shadow-lg shadow-blue-900/20 active:scale-95 transition-all"
                >
                  הוספה
                </button>
                <button 
                  onClick={() => setIsAddingColumn(false)}
                  className="px-4 bg-[#30363d] text-slate-400 py-2.5 rounded-xl text-sm hover:text-white transition-all"
                >
                  ביטול
                </button>
             </div>
          </div>
        ) : (
          <button 
            onClick={() => setIsAddingColumn(true)}
            className="w-full py-12 border-2 border-dashed border-[#30363d] rounded-2xl text-slate-500 hover:text-blue-400 hover:border-blue-500/50 hover:bg-blue-500/5 transition-all flex flex-col items-center justify-center space-y-4 group shadow-sm active:scale-95"
          >
            <div className="p-3 rounded-2xl bg-[#21262d] group-hover:bg-blue-500/20 group-hover:text-blue-400 transition-all shadow-inner">
               <ICONS.Plus className="w-7 h-7" />
            </div>
            <div className="text-center">
              <span className="font-black text-sm block">הוספת עמדה (עמודה)</span>
              <span className="text-[11px] opacity-60 font-medium">ניהול תהליכי עבודה דינמיים</span>
            </div>
          </button>
        )}
      </div>
    </div>
  );
};
