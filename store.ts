
import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { Task, List, Workspace, User, TaskStatus, TaskPriority, SidebarView, ListSection, ViewType } from './types';
import { SEED_TASKS, SEED_LISTS, SEED_WORKSPACES, SEED_USERS, COMMON_TITLE_SUGGESTIONS, COMMON_ASSIGNEE_SUGGESTIONS } from './constants';
import { trackEvent } from './services/analytics';

const DEFAULT_SECTIONS: ListSection[] = [
  { id: 'active', title: 'הנחיות פעילות', isCollapsed: false, statusMatch: [TaskStatus.OPEN, TaskStatus.IN_PROGRESS, TaskStatus.ONGOING, TaskStatus.NOT_DONE] },
  { id: 'done', title: 'בוצעו / הושלמו', isCollapsed: false, statusMatch: [TaskStatus.DONE, TaskStatus.CANCELLED] }
];

const INITIAL_STATUSES = [
  TaskStatus.OPEN,
  TaskStatus.IN_PROGRESS,
  TaskStatus.ONGOING,
  TaskStatus.NOT_DONE,
  TaskStatus.DONE,
  TaskStatus.CANCELLED
];

const INITIAL_COLUMN_LABELS = {
  id_num: 'מס"ד',
  creationTime: 'זמן יצירה',
  title: 'גורם מנחה',
  description: 'מהות',
  assignee: 'אחריות',
  status: 'סטטוס',
  startTime: 'התחלה',
  endTime: 'סיום',
  actions: 'קבצים'
};

const ZenithContext = createContext<any>(null);

export function ZenithProvider({ children }: { children?: React.ReactNode }) {
  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem('zenith_tasks_v9');
    if (saved) return JSON.parse(saved);
    
    const oldSaved = localStorage.getItem('zenith_tasks_v8');
    if (oldSaved) {
      const parsed = JSON.parse(oldSaved);
      return parsed.map((t: any) => ({
        ...t,
        title: Array.isArray(t.title) ? t.title : (t.title ? [t.title] : []),
        assignee: Array.isArray(t.assignee) ? t.assignee : (t.assignee ? [t.assignee] : []),
      }));
    }
    return SEED_TASKS;
  });

  const [lists, setLists] = useState<List[]>(() => {
    const saved = localStorage.getItem('zenith_lists_v6');
    const parsed = saved ? JSON.parse(saved) : SEED_LISTS;
    return parsed.map((l: List) => ({
      ...l,
      sections: l.sections || [...DEFAULT_SECTIONS]
    }));
  });

  const [statuses, setStatuses] = useState<string[]>(() => {
    const saved = localStorage.getItem('zenith_statuses_v3');
    return saved ? JSON.parse(saved) : INITIAL_STATUSES;
  });

  const [columnLabels, setColumnLabels] = useState<Record<string, string>>(() => {
    const saved = localStorage.getItem('zenith_column_labels_v3');
    return saved ? JSON.parse(saved) : INITIAL_COLUMN_LABELS;
  });

  const [viewType, setViewType] = useState<ViewType>(() => {
    const saved = localStorage.getItem('zenith_view_type');
    return (saved as ViewType) || 'list';
  });

  const [activeSidebarView, setActiveSidebarView] = useState<SidebarView>(() => lists[0]?.id || 'l1');
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [globalFilters, setGlobalFilters] = useState<{ status: string[]; assignee: string[]; title: string[] }>({
    status: [],
    assignee: [],
    title: []
  });

  // State for tracking notifications sent to external app
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    localStorage.setItem('zenith_tasks_v9', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('zenith_lists_v6', JSON.stringify(lists));
  }, [lists]);

  useEffect(() => {
    localStorage.setItem('zenith_statuses_v3', JSON.stringify(statuses));
  }, [statuses]);

  useEffect(() => {
    localStorage.setItem('zenith_column_labels_v3', JSON.stringify(columnLabels));
  }, [columnLabels]);

  useEffect(() => {
    localStorage.setItem('zenith_view_type', viewType);
  }, [viewType]);

  const currentUser = SEED_USERS[0];

  const triggerExternalNotification = useCallback((userName: string, taskTitle: string) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newNote = { id, userName, taskTitle, timestamp: new Date() };
    
    setNotifications(prev => [newNote, ...prev]);
    console.info(`[External App] Notification sent for: ${userName} on task: ${taskTitle}`);
    
    // Auto-remove notification from local UI after 5 seconds
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 5000);
  }, []);

  const updateColumnLabel = useCallback((key: string, label: string) => {
    setColumnLabels(prev => ({ ...prev, [key]: label }));
  }, []);

  const addStatus = useCallback((name: string) => {
    if (statuses.includes(name)) return;
    setStatuses(prev => [...prev, name]);
  }, [statuses]);

  const renameStatus = useCallback((oldName: string, newName: string) => {
    if (!newName.trim() || oldName === newName) return;
    setStatuses(prev => prev.map(s => s === oldName ? newName : s));
    setTasks(prev => prev.map(t => t.status === oldName ? { ...t, status: newName } : t));
  }, []);

  const deleteStatus = useCallback((name: string) => {
    if (statuses.length <= 1) return;
    setStatuses(prev => prev.filter(s => s !== name));
    setTasks(prev => prev.map(t => t.status === name ? { ...t, status: statuses.find(s => s !== name) || statuses[0] } : t));
  }, [statuses]);

  const reorderStatus = useCallback((index: number, direction: 'left' | 'right') => {
    const newStatuses = [...statuses];
    const targetIndex = direction === 'right' ? index - 1 : index + 1;
    if (targetIndex >= 0 && targetIndex < newStatuses.length) {
      [newStatuses[index], newStatuses[targetIndex]] = [newStatuses[targetIndex], newStatuses[index]];
      setStatuses(newStatuses);
    }
  }, [statuses]);

  const addList = useCallback((name: string) => {
    const newList: List = {
      id: Math.random().toString(36).substr(2, 9),
      name,
      isStarred: false,
      isPrivate: false,
      sections: [...DEFAULT_SECTIONS]
    };
    setLists(prev => [...prev, newList]);
    trackEvent('list_created', { id: newList.id });
    return newList;
  }, []);

  const updateList = useCallback((id: string, name: string) => {
    setLists(prev => prev.map(l => l.id === id ? { ...l, name } : l));
  }, []);

  const addSection = useCallback((listId: string) => {
    setLists(prev => prev.map(l => {
      if (l.id !== listId) return l;
      const sections = l.sections || [];
      const newSection: ListSection = { 
        id: Math.random().toString(36).substr(2, 9), 
        title: 'הנחיות', 
        isCollapsed: false, 
        statusMatch: [] 
      };
      return { ...l, sections: [...sections, newSection] };
    }));
  }, []);

  const deleteSection = useCallback((listId: string, sectionId: string) => {
    if (sectionId === 'active' || sectionId === 'done') return;
    setLists(prev => prev.map(l => {
      if (l.id !== listId) return l;
      return {
        ...l,
        sections: l.sections?.filter(s => s.id !== sectionId)
      };
    }));
    setTasks(prev => prev.map(t => t.sectionId === sectionId ? { ...t, sectionId: undefined } : t));
    trackEvent('bulk_action_applied', { action: 'delete_section', id: sectionId });
  }, []);

  const reorderSection = useCallback((listId: string, sectionId: string, direction: 'up' | 'down') => {
    setLists(prev => prev.map(l => {
      if (l.id !== listId || !l.sections) return l;
      const index = l.sections.findIndex(s => s.id === sectionId);
      if (index === -1) return l;
      const newSections = [...l.sections];
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      if (targetIndex >= 0 && targetIndex < newSections.length) {
        [newSections[index], newSections[targetIndex]] = [newSections[targetIndex], newSections[index]];
      }
      return { ...l, sections: newSections };
    }));
  }, []);

  const updateSectionTitle = useCallback((listId: string, sectionId: string, newTitle: string) => {
    setLists(prev => prev.map(l => {
      if (l.id !== listId) return l;
      return {
        ...l,
        sections: l.sections?.map(s => s.id === sectionId ? { ...s, title: newTitle } : s)
      };
    }));
  }, []);

  const addTask = useCallback((taskData: Partial<Task>) => {
    const listId = taskData.listId || (activeSidebarView.startsWith('l') ? activeSidebarView : 'l1');
    const sectionId = taskData.sectionId;
    const maxIdNum = tasks.length > 0 ? Math.max(...tasks.map(t => parseInt(t.id_num))) : 999;

    const newTask: Task = {
      id: Math.random().toString(36).substr(2, 9),
      id_num: (maxIdNum + 1).toString(),
      creationTime: new Date().toLocaleString('he-IL'),
      title: Array.isArray(taskData.title) ? taskData.title : (taskData.title ? [taskData.title] : []),
      description: taskData.description || '',
      assignee: Array.isArray(taskData.assignee) ? taskData.assignee : (taskData.assignee ? [taskData.assignee] : []),
      status: taskData.status || statuses[0] || TaskStatus.OPEN,
      startTime: taskData.startTime || new Date().toLocaleDateString('he-IL'),
      endTime: taskData.endTime || new Date().toLocaleDateString('he-IL'),
      fileCount: 0,
      priority: taskData.priority || TaskPriority.LOW,
      archived: false,
      listId: listId,
      sectionId: sectionId,
      tags: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...taskData
    };
    
    setTasks(prev => [...prev, newTask]);
    
    // Check for assignee in new task
    if (newTask.assignee && newTask.assignee.length > 0) {
      newTask.assignee.forEach(assignee => {
        triggerExternalNotification(assignee, newTask.title?.[0] || 'הנחיה חדשה');
      });
    }
    
    trackEvent('task_created', { id: newTask.id });
    return newTask;
  }, [tasks, activeSidebarView, statuses, triggerExternalNotification]);

  const duplicateTask = useCallback((id: string) => {
    const taskToCopy = tasks.find(t => t.id === id);
    if (taskToCopy) {
      const maxIdNum = tasks.length > 0 ? Math.max(...tasks.map(t => parseInt(t.id_num))) : 999;
      const newTask: Task = {
        ...taskToCopy,
        id: Math.random().toString(36).substr(2, 9),
        id_num: (maxIdNum + 1).toString(),
        title: taskToCopy.title && taskToCopy.title.length > 0 ? [...taskToCopy.title, '(עותק)'] : ['(עותק)'],
        creationTime: new Date().toLocaleString('he-IL'),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setTasks(prev => [...prev, newTask]);
      trackEvent('task_created', { id: newTask.id, source: 'duplicate' });
    }
  }, [tasks]);

  const updateTask = useCallback((id: string, updates: Partial<Task>) => {
    setTasks(prev => {
      const existingTask = prev.find(t => t.id === id);
      const isAssigneeChanged = updates.assignee !== undefined && JSON.stringify(updates.assignee) !== JSON.stringify(existingTask?.assignee);
      
      if (isAssigneeChanged && updates.assignee && updates.assignee.length > 0) {
        updates.assignee.forEach(assignee => {
          if (!existingTask?.assignee?.includes(assignee)) {
            triggerExternalNotification(assignee, (updates.title && updates.title[0]) || (existingTask?.title && existingTask.title[0]) || 'הנחיה');
          }
        });
      }

      return prev.map(t => t.id === id ? { ...t, ...updates, updatedAt: new Date().toISOString() } : t);
    });
    
    if (updates.status) trackEvent('task_status_changed', { id, status: updates.status });
  }, [triggerExternalNotification]);

  const moveTask = useCallback((taskId: string, targetSectionId: string, afterTaskId?: string) => {
    setTasks(prev => {
      const taskIndex = prev.findIndex(t => t.id === taskId);
      if (taskIndex === -1) return prev;

      const newTasks = [...prev];
      const task = { ...newTasks[taskIndex], sectionId: targetSectionId };
      
      if (targetSectionId === 'done') {
        task.status = TaskStatus.DONE;
      } else if (targetSectionId === 'active' && (task.status === TaskStatus.DONE || task.status === TaskStatus.CANCELLED)) {
        task.status = statuses[0] || TaskStatus.OPEN;
      }
      
      newTasks.splice(taskIndex, 1);
      
      if (afterTaskId) {
        const afterIndex = newTasks.findIndex(t => t.id === afterTaskId);
        newTasks.splice(afterIndex, 0, task);
      } else {
        newTasks.push(task);
      }
      
      return newTasks;
    });
  }, [statuses]);

  const deleteTask = useCallback((id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
    trackEvent('task_completed', { id });
  }, []);

  const filteredTasks = useMemo(() => {
    let result = tasks.filter(t => !t.archived);
    
    if (activeSidebarView.startsWith('l')) {
      result = result.filter(t => t.listId === activeSidebarView);
    } else if (activeSidebarView === 'overdue') {
      result = result.filter(t => t.status === TaskStatus.NOT_DONE);
    } else if (activeSidebarView === 'completed') {
      result = result.filter(t => t.status === TaskStatus.DONE);
    }

    // Apply Global Search
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(t => 
        (t.title?.some(title => title.toLowerCase().includes(q)) || false) || 
        (t.description?.toLowerCase().includes(q) || false) ||
        t.id_num.includes(q)
      );
    }

    // Apply Global Filters
    if (globalFilters.status.length > 0) {
      result = result.filter(t => globalFilters.status.includes(t.status));
    }
    if (globalFilters.assignee.length > 0) {
      result = result.filter(t => t.assignee?.some(a => globalFilters.assignee.includes(a)));
    }
    if (globalFilters.title.length > 0) {
      result = result.filter(t => t.title?.some(title => globalFilters.title.includes(title)));
    }

    return result;
  }, [tasks, searchQuery, activeSidebarView, globalFilters]);

  const activeList = useMemo(() => lists.find(l => l.id === activeSidebarView) || null, [lists, activeSidebarView]);

  const groupedTasks = useMemo(() => {
    if (!activeList || !activeList.sections) return [];
    
    return activeList.sections.map(section => {
      const sectionTasks = filteredTasks.filter(t => {
        if (t.sectionId === section.id) return true;
        if (!t.sectionId) {
          if (section.id === 'active') return t.status !== TaskStatus.DONE && t.status !== TaskStatus.CANCELLED;
          if (section.id === 'done') return t.status === TaskStatus.DONE || t.status === TaskStatus.CANCELLED;
        }
        return false;
      });

      return {
        ...section,
        tasks: sectionTasks,
        subtitle: section.id === 'active' ? 'בטיפול' : section.id === 'done' ? 'ארכיון פעיל' : '',
        status: section.id === 'active' ? 'פעיל' : section.id === 'done' ? 'סגור' : ''
      };
    });
  }, [filteredTasks, activeList]);

  const activeViewName = useMemo(() => {
    if (activeSidebarView === 'my-tasks') return 'המשימות שלי';
    if (activeSidebarView === 'overdue') return 'באיחור';
    if (activeSidebarView === 'completed') return 'הושלמו';
    return activeList?.name || 'ללא שם';
  }, [activeSidebarView, activeList]);

  const activeTask = useMemo(() => tasks.find(t => t.id === activeTaskId) || null, [tasks, activeTaskId]);

  const titleSuggestions = useMemo(() => {
    const historicalTitles = Array.from(new Set(tasks.flatMap(t => t.title || []).filter(Boolean)));
    return Array.from(new Set([...COMMON_TITLE_SUGGESTIONS, ...historicalTitles]));
  }, [tasks]);

  const assigneeSuggestions = useMemo(() => {
    const historicalAssignees = Array.from(new Set(tasks.flatMap(t => t.assignee || []).filter(Boolean)));
    const userNames = SEED_USERS.map(u => u.name);
    return Array.from(new Set([...COMMON_ASSIGNEE_SUGGESTIONS, ...userNames, ...historicalAssignees]));
  }, [tasks]);

  const value = {
    tasks, lists, statuses, columnLabels, updateColumnLabel, addStatus, renameStatus, deleteStatus, reorderStatus,
    viewType, setViewType, addList, updateList, addSection, deleteSection, reorderSection, updateSectionTitle,
    activeSidebarView, setActiveSidebarView, activeViewName, activeList, searchQuery, setSearchQuery,
    globalFilters, setGlobalFilters,
    filteredTasks, groupedTasks, activeTaskId, setActiveTaskId, activeTask, addTask, duplicateTask,
    updateTask, moveTask, deleteTask, currentUser, users: SEED_USERS, workspace: SEED_WORKSPACES[0],
    titleSuggestions,
    assigneeSuggestions,
    notifications,
    removeNotification: (id: string) => setNotifications(prev => prev.filter(n => n.id !== id))
  };

  return React.createElement(ZenithContext.Provider, { value: value }, children);
}

export function useZenithStore() {
  const context = useContext(ZenithContext);
  if (!context) {
    throw new Error('useZenithStore must be used within a ZenithProvider');
  }
  return context;
}
