
import React, { useState, useEffect, useRef } from 'react';
import { Task, TaskStatus, User } from '../types';
import { ICONS } from '../constants';
import { useZenithStore } from '../store';
import { ComboBox } from './ComboBox';
import { MultiSelectComboBox } from './MultiSelectComboBox';

interface TaskListViewProps {
  tasks: Task[];
  users: User[];
  onSelectTask: (id: string) => void;
  onAddTask: (value: string, sectionId?: string) => void;
  onUpdateTask: (id: string, updates: Partial<Task>) => void;
  sectionId?: string;
  hideSearch?: boolean;
}

type EditableField = 'title' | 'description' | 'assignee' | 'status' | 'startTime' | 'endTime';

export const TaskListView: React.FC<TaskListViewProps> = ({ tasks, users, onSelectTask, onAddTask, onUpdateTask, sectionId, hideSearch = false }) => {
  const store = useZenithStore();
  const [newValue, setNewValue] = useState('');
  const [editingCell, setEditingCell] = useState<{ id: string, field: EditableField } | null>(null);
  const [editingHeader, setEditingHeader] = useState<string | null>(null);
  const [headerInput, setHeaderInput] = useState('');
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [dropTargetTaskId, setDropTargetTaskId] = useState<string | null>(null);
  
  // Context Menu state
  const [contextMenu, setContextMenu] = useState<{ x: number, y: number, taskId: string } | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setContextMenu(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleContextMenu = (e: React.MouseEvent, taskId: string) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY, taskId });
  };

  const getStatusStyle = (status: string) => {
    switch(status) {
      case TaskStatus.NOT_DONE: return 'text-red-400 bg-red-400/10 border-red-400/20';
      case TaskStatus.DONE: return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20';
      case TaskStatus.IN_PROGRESS: return 'text-purple-400 bg-purple-400/10 border-purple-400/20';
      case TaskStatus.ONGOING: return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
      case TaskStatus.CANCELLED: return 'text-slate-500 bg-slate-500/10 border-slate-500/20';
      default: return 'text-slate-400 bg-slate-400/10 border-slate-400/20';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && newValue.trim()) {
      onAddTask(newValue.trim(), sectionId);
      setNewValue('');
    }
  };

  const handleCellClick = (e: React.MouseEvent, id: string, field: EditableField) => {
    e.stopPropagation();
    setEditingCell({ id, field });
  };

  const handleInlineUpdate = (id: string, field: EditableField, value: string) => {
    let finalValue = value;
    if ((field === 'startTime' || field === 'endTime') && value.includes('-')) {
      const [y, m, d] = value.split('-');
      finalValue = `${d}/${m}/${y}`;
    }

    onUpdateTask(id, { [field]: finalValue });
    setEditingCell(null);
  };

  const handleHeaderDoubleClick = (key: string) => {
    setEditingHeader(key);
    setHeaderInput(store.columnLabels[key] || '');
  };

  const handleHeaderSubmit = (key: string) => {
    if (headerInput.trim()) {
      store.updateColumnLabel(key, headerInput.trim());
    }
    setEditingHeader(null);
  };

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData('taskId', taskId);
    setDraggedTaskId(taskId);
    e.dataTransfer.effectAllowed = 'move';
    const target = e.currentTarget as HTMLElement;
    target.style.opacity = '0.5';
  };

  const handleDragEnd = (e: React.DragEvent) => {
    const target = e.currentTarget as HTMLElement;
    target.style.opacity = '1';
    setDraggedTaskId(null);
    setDropTargetTaskId(null);
  };

  const handleDragOverRow = (e: React.DragEvent, taskId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (taskId !== draggedTaskId) {
      setDropTargetTaskId(taskId);
    }
  };

  const handleDropRow = (e: React.DragEvent, targetTaskId: string) => {
    e.preventDefault();
    e.stopPropagation();
    const taskId = e.dataTransfer.getData('taskId');
    if (taskId && taskId !== targetTaskId) {
      store.moveTask(taskId, sectionId || '', targetTaskId);
    }
    setDropTargetTaskId(null);
  };

  const renderInlineEditor = (task: Task, field: EditableField) => {
    const value = (task[field] as string) || '';
    
    if (field === 'title') {
      return (
        <div className="bg-[#0d1117] border border-blue-500 rounded px-1 -mx-2">
          <MultiSelectComboBox
            autoFocus
            values={(value as unknown as string[]) || []}
            options={store.titleSuggestions}
            onChange={(val) => onUpdateTask(task.id, { title: val })}
            onBlur={() => setEditingCell(null)}
          />
        </div>
      );
    }

    if (field === 'status') {
      return (
        <select
          autoFocus
          className="bg-[#0d1117] text-white border border-blue-500 rounded px-1 outline-none w-full text-[11px]"
          value={value}
          onBlur={() => setEditingCell(null)}
          onChange={(e) => handleInlineUpdate(task.id, field, e.target.value)}
        >
          {store.statuses.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      );
    }

    if (field === 'assignee') {
      return (
        <div className="bg-[#0d1117] border border-blue-500 rounded px-1 -mx-2">
          <MultiSelectComboBox
            autoFocus
            values={(value as unknown as string[]) || []}
            options={store.assigneeSuggestions}
            onChange={(val) => onUpdateTask(task.id, { assignee: val })}
            onBlur={() => setEditingCell(null)}
          />
        </div>
      );
    }

    if (field === 'startTime' || field === 'endTime') {
      let dateVal = '';
      if (value.includes('/')) {
        const [d, m, y] = value.split('/');
        dateVal = `${y}-${m}-${d}`;
      }
      return (
        <input
          type="date"
          autoFocus
          className="bg-[#0d1117] text-white border border-blue-500 rounded px-1 outline-none w-full text-[11px] [color-scheme:dark]"
          defaultValue={dateVal}
          onBlur={(e) => handleInlineUpdate(task.id, field, e.target.value)}
          onChange={(e) => {
             if (e.target.value) handleInlineUpdate(task.id, field, e.target.value);
          }}
        />
      );
    }

    return (
      <input
        autoFocus
        className="bg-[#0d1117] text-white border border-blue-500 rounded px-2 py-0.5 outline-none w-full"
        defaultValue={value}
        onBlur={(e) => handleInlineUpdate(task.id, field, (e.target as HTMLInputElement).value)}
        onKeyDown={(e) => e.key === 'Enter' && handleInlineUpdate(task.id, field, (e.target as HTMLInputElement).value)}
      />
    );
  };

  const renderHeader = (key: string, className: string = '') => {
    const isEditing = editingHeader === key;
    const label = store.columnLabels[key] || '';

    return (
      <th className={`px-5 py-3.5 font-semibold ${className} group/th`}>
        {isEditing ? (
          <input
            autoFocus
            className="bg-[#0d1117] text-white border border-blue-500 rounded px-2 py-0.5 outline-none w-full font-bold text-sm"
            value={headerInput}
            onChange={(e) => setHeaderInput(e.target.value)}
            onBlur={() => handleHeaderSubmit(key)}
            onKeyDown={(e) => e.key === 'Enter' && handleHeaderSubmit(key)}
          />
        ) : (
          <div 
            className="flex items-center cursor-pointer select-none justify-center md:justify-start"
            onDoubleClick={() => handleHeaderDoubleClick(key)}
            title="לחץ פעמיים כדי לערוך את כותרת העמודה"
          >
            <span>{label}</span>
            <ICONS.Edit className="w-3 h-3 mr-2 text-slate-600 opacity-0 group-hover/th:opacity-100 transition-opacity flex-shrink-0" />
          </div>
        )}
      </th>
    );
  };

  return (
    <div className="flex flex-col bg-[#161b22]">
      {contextMenu && (
        <div 
          ref={menuRef}
          className="fixed z-[1000] bg-[#1c2128] border border-[#30363d] rounded-xl shadow-2xl py-1.5 w-52 animate-in fade-in zoom-in-95 duration-100 ring-1 ring-black/5"
          style={{ top: contextMenu.y, left: contextMenu.x }}
          dir="rtl"
        >
          <button 
            onClick={() => { onSelectTask(contextMenu.taskId); setContextMenu(null); }}
            className="w-full flex items-center px-4 py-2.5 text-sm text-slate-300 hover:bg-blue-600 hover:text-white transition-all text-right group/item"
          >
            <ICONS.Edit className="w-4 h-4 ml-3 text-slate-500 group-hover/item:text-white transition-colors" />
            <span className="font-bold">ערוך הנחיה</span>
          </button>
          <div className="h-px bg-[#30363d] my-1 mx-2" />
          <button 
            onClick={() => { store.duplicateTask(contextMenu.taskId); setContextMenu(null); }}
            className="w-full flex items-center px-4 py-2.5 text-sm text-slate-300 hover:bg-blue-600 hover:text-white transition-all text-right group/item"
          >
            <ICONS.Copy className="w-4 h-4 ml-3 text-slate-500 group-hover/item:text-white transition-colors" />
            <span className="font-bold">שכפל הנחיה</span>
          </button>
          <div className="h-px bg-[#30363d] my-1 mx-2" />
          <button 
            onClick={() => { store.deleteTask(contextMenu.taskId); setContextMenu(null); }}
            className="w-full flex items-center px-4 py-2.5 text-sm text-red-400 hover:bg-red-500 hover:text-white transition-all text-right group/item"
          >
            <ICONS.Trash className="w-4 h-4 ml-3 text-red-400/50 group-hover/item:text-white transition-colors" />
            <span className="font-bold">מחק הנחיה</span>
          </button>
        </div>
      )}

      <div className="overflow-x-auto custom-scrollbar">
        <table className="w-full text-[13px] text-right table-fixed min-w-[1200px]">
          <thead className="text-slate-500 bg-[#0d1117] border-b border-[#30363d]">
            <tr>
              {renderHeader('id_num', 'w-[70px]')}
              {renderHeader('creationTime', 'w-[130px]')}
              {renderHeader('title', 'w-[15%]')}
              {renderHeader('description', '')}
              {renderHeader('assignee', 'w-[150px]')}
              {renderHeader('status', 'text-center w-[120px]')}
              {renderHeader('startTime', 'w-[110px]')}
              {renderHeader('endTime', 'w-[110px]')}
              {renderHeader('actions', 'text-center w-[60px]')}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#30363d]">
            {tasks.map(task => (
              <tr 
                key={task.id} 
                draggable
                onDragStart={(e) => handleDragStart(e, task.id)}
                onDragEnd={handleDragEnd}
                onDragOver={(e) => handleDragOverRow(e, task.id)}
                onDrop={(e) => handleDropRow(e, task.id)}
                onContextMenu={(e) => handleContextMenu(e, task.id)}
                className={`hover:bg-[#21262d] transition-all duration-150 group cursor-move ${
                  draggedTaskId === task.id ? 'opacity-40' : ''
                } ${dropTargetTaskId === task.id ? 'border-t-2 border-t-blue-500 bg-[#1c2128]' : ''}`}
              >
                <td className="px-5 py-3.5 text-slate-500 font-mono text-[12px]">{task.id_num}</td>
                <td className="px-5 py-3.5 text-[11px] text-slate-400 leading-tight">
                  {task.creationTime}
                </td>
                <td 
                  className="px-5 py-3.5 transition-colors cursor-text"
                  onDoubleClick={(e) => handleCellClick(e, task.id, 'title')}
                >
                  {editingCell?.id === task.id && editingCell.field === 'title' 
                    ? renderInlineEditor(task, 'title') 
                    : (
                      <span className={`group-hover:text-blue-400 truncate block ${(!task.title || task.title.length === 0) ? 'text-slate-600 font-normal italic text-[12px]' : 'text-white'}`}>
                        {task.title?.length > 0 ? task.title.join(', ') : 'ללא גורם מנחה'}
                      </span>
                    )
                  }
                </td>
                <td 
                  className="px-5 py-3.5 text-slate-300 opacity-80 group-hover:opacity-100 cursor-text whitespace-normal"
                  onDoubleClick={(e) => handleCellClick(e, task.id, 'description')}
                >
                   {editingCell?.id === task.id && editingCell.field === 'description' 
                    ? renderInlineEditor(task, 'description') 
                    : task.description
                  }
                </td>
                <td 
                  className="px-5 py-3.5 cursor-text"
                  onDoubleClick={(e) => handleCellClick(e, task.id, 'assignee')}
                >
                   <div className="flex items-center space-x-2.5 space-x-reverse">
                      {editingCell?.id === task.id && editingCell.field === 'assignee' 
                        ? renderInlineEditor(task, 'assignee') 
                        : (
                          <span className={`truncate group-hover:text-slate-200 ${(!task.assignee || task.assignee.length === 0) ? 'text-slate-600 italic text-[12px]' : 'text-slate-400'}`}>
                            {task.assignee?.length > 0 ? task.assignee.join(', ') : 'טרם הוקצה'}
                          </span>
                        )
                      }
                   </div>
                </td>
                <td 
                  className="px-5 py-3.5 text-center cursor-pointer"
                  onClick={(e) => handleCellClick(e, task.id, 'status')}
                >
                   {editingCell?.id === task.id && editingCell.field === 'status' 
                    ? renderInlineEditor(task, 'status') 
                    : (
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold border transition-all ${getStatusStyle(task.status)}`}>
                        <span className="w-1.5 h-1.5 rounded-full bg-current mr-2 opacity-50"></span>
                        {task.status}
                      </span>
                    )
                   }
                </td>
                <td 
                  className="px-5 py-3.5 text-slate-400 text-[11px] group-hover:text-slate-300 cursor-text"
                  onDoubleClick={(e) => handleCellClick(e, task.id, 'startTime')}
                >
                  {editingCell?.id === task.id && editingCell.field === 'startTime' 
                    ? renderInlineEditor(task, 'startTime') 
                    : task.startTime
                  }
                </td>
                <td 
                  className="px-5 py-3.5 text-slate-400 text-[11px] group-hover:text-slate-300 cursor-text"
                  onDoubleClick={(e) => handleCellClick(e, task.id, 'endTime')}
                >
                  {editingCell?.id === task.id && editingCell.field === 'endTime' 
                    ? renderInlineEditor(task, 'endTime') 
                    : task.endTime
                  }
                </td>
                <td className="px-5 py-3.5 text-center relative">
                   <div className="flex items-center justify-center space-x-1.5 space-x-reverse text-slate-500">
                      <ICONS.Paperclip className="w-3.5 h-3.5" />
                      <span className="text-[11px] font-medium">{task.fileCount}</span>
                   </div>
                </td>
              </tr>
            ))}
            
            <tr className="bg-[#0d1117]/20 hover:bg-[#161b22] transition-colors group/add-task">
              <td className="px-5 py-4 text-slate-600 font-mono text-center">
                <ICONS.Plus className="w-4 h-4 mx-auto opacity-40 group-hover/add-task:opacity-100 group-hover/add-task:text-blue-400 transition-all" />
              </td>
              <td className="px-5 py-4"></td>
              <td colSpan={7} className="px-0 py-0">
                <div className="flex items-center h-full px-5">
                   <input 
                    type="text" 
                    value={newValue}
                    onChange={(e) => setNewValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="+ הוספת הנחיה חדשה... הקלד את מהות ההנחיה ולחץ Enter לשמירה מהירה"
                    className="w-full bg-transparent border-none text-[15px] font-bold text-blue-400 placeholder:text-blue-500/50 focus:placeholder:text-blue-400 outline-none py-4 transition-all"
                   />
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};
