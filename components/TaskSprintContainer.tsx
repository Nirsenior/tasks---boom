
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { ICONS } from '../constants';
import { TaskListView } from './TaskListView';
import { Task, User, TaskStatus } from '../types';
import { useZenithStore } from '../store';

interface TaskSprintContainerProps {
  id: string;
  title: string;
  subtitle?: string;
  status?: string;
  tasks: Task[];
  users: User[];
  onSelectTask: (id: string) => void;
  onAddTask: (value: string, sectionId?: string) => void;
  onUpdateTitle: (newTitle: string) => void;
  onUpdateTask: (id: string, updates: Partial<Task>) => void;
  isOpen?: boolean;
}

export const TaskSprintContainer: React.FC<TaskSprintContainerProps> = ({ 
  id, title, subtitle, status, tasks, users, onSelectTask, onAddTask, onUpdateTitle, onUpdateTask, isOpen: initialOpen = true 
}) => {
  const store = useZenithStore();
  const [isOpen, setIsOpen] = useState(initialOpen);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleInput, setTitleInput] = useState(title);
  const [isOver, setIsOver] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState<{ x: number, y: number } | null>(null);
  
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node) && !buttonRef.current?.contains(event.target as Node)) {
        setMenuAnchor(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleTitleSubmit = () => {
    if (titleInput.trim() && titleInput !== title) {
      onUpdateTitle(titleInput);
    }
    setIsEditingTitle(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (!isOver) setIsOver(true);
  };

  const handleDragLeave = () => {
    setIsOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsOver(false);
    const taskId = e.dataTransfer.getData('taskId');
    if (taskId) {
      store.moveTask(taskId, id);
    }
  };

  const handleMoreClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (menuAnchor) {
      setMenuAnchor(null);
    } else {
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      setMenuAnchor({ x: rect.left, y: rect.bottom + 8 });
    }
  };

  const handleDeleteSection = () => {
    // Removed confirm dialog as requested: "ברגע שמשתמש לוחץ על מחק מגירה המגירה נמחקת"
    store.deleteSection(store.activeSidebarView, id);
    setMenuAnchor(null);
  };

  const handleRenameClick = () => {
    setIsEditingTitle(true);
    setMenuAnchor(null);
  };

  return (
    <div 
      className={`relative mb-6 bg-[#161b22] border transition-all duration-200 rounded-lg overflow-hidden shadow-sm h-auto ${
        isOver ? 'border-blue-500 ring-2 ring-blue-500/20 bg-[#1c2128]' : 'border-[#30363d]'
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Sprint Header */}
      <div 
        className="flex items-center justify-between px-5 py-3 bg-[#21262d] border-b border-[#30363d] group/header"
      >
        <div className="flex items-center space-x-4 space-x-reverse flex-grow">
          <button 
            onClick={() => setIsOpen(!isOpen)}
            className="p-1 hover:bg-[#30363d] rounded transition-colors"
          >
            <ICONS.ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${!isOpen ? '-rotate-90' : ''}`} />
          </button>
          
          <div className="flex items-center flex-grow max-w-[50%]">
            {isEditingTitle ? (
              <input 
                autoFocus
                value={titleInput}
                onChange={e => setTitleInput(e.target.value)}
                onBlur={handleTitleSubmit}
                onKeyDown={e => e.key === 'Enter' && handleTitleSubmit()}
                className="bg-[#0d1117] border border-blue-500 rounded px-2 py-1 text-sm font-bold text-white outline-none w-full shadow-lg"
              />
            ) : (
              <div 
                className="flex items-center group/title cursor-pointer" 
                onDoubleClick={() => setIsEditingTitle(true)}
                title="לחץ פעמיים כדי לערוך את שם המגירה"
              >
                <h3 className="text-[14px] font-bold text-white whitespace-nowrap">{title}</h3>
                <ICONS.Edit className="w-3 h-3 mr-2 text-slate-600 opacity-0 group-hover/title:opacity-100 transition-opacity" />
              </div>
            )}
          </div>
        </div>
        
        <div className="flex items-center space-x-3 space-x-reverse">
          <div className="flex items-center text-xs text-slate-500 bg-[#0d1117] px-2 py-1 rounded border border-[#30363d]">
            <span className="font-bold ml-1.5 text-slate-300">{tasks.length}</span>
            <span>הנחיות</span>
          </div>
          
          <button 
            ref={buttonRef}
            onClick={handleMoreClick}
            className={`p-1.5 rounded transition-colors ${menuAnchor ? 'bg-blue-600 text-white' : 'hover:bg-[#30363d] text-slate-500 hover:text-white'}`}
          >
            <ICONS.MoreVertical className="w-4 h-4" />
          </button>

          {menuAnchor && (
            <div 
              ref={menuRef}
              className="fixed z-[1000] bg-[#1c2128] border border-[#30363d] rounded-xl shadow-2xl py-2 w-44 animate-in fade-in zoom-in-95 duration-100 ring-1 ring-black/5"
              style={{ top: menuAnchor.y, left: menuAnchor.x }}
              dir="rtl"
            >
              <button 
                onClick={handleRenameClick}
                className="w-full flex items-center px-4 py-2.5 text-sm text-white hover:bg-[#30363d] transition-all text-right group/item font-bold"
              >
                שנה שם מגירה
              </button>
              
              <button 
                onClick={handleDeleteSection}
                disabled={id === 'active' || id === 'done'}
                className={`w-full flex items-center px-4 py-2.5 text-sm text-red-500 hover:bg-red-500/10 transition-all text-right group/item font-bold ${
                  (id === 'active' || id === 'done') ? 'opacity-30 cursor-not-allowed' : ''
                }`}
              >
                מחק מגירה
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Content Area - Auto growing height */}
      {isOpen && (
        <div className="animate-in fade-in slide-in-from-top-2 duration-300 origin-top">
          <TaskListView 
            tasks={tasks} 
            users={users}
            sectionId={id}
            onSelectTask={onSelectTask} 
            onAddTask={(val, sId) => {
              const newTask = store.addTask({ title: val ? [val] : [], sectionId: sId });
              store.setActiveTaskId(newTask.id);
            }}
            onUpdateTask={onUpdateTask}
            hideSearch={true} 
          />
        </div>
      )}
    </div>
  );
};
