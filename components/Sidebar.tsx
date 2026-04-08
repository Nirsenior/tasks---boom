
import React, { useState } from 'react';
import { ICONS } from '../constants';
import { List, SidebarView, User } from '../types';

interface SidebarProps {
  activeView: SidebarView;
  onViewChange: (view: SidebarView) => void;
  lists: List[];
  currentUser: User;
  workspaceName: string;
  tasks: any[];
}

export const Sidebar: React.FC<SidebarProps> = ({ activeView, onViewChange, lists, currentUser, workspaceName, tasks }) => {
  const [listsExpanded, setListsExpanded] = useState(true);
  const [viewsExpanded, setViewsExpanded] = useState(true);

  const getNeedsAttentionCount = (listId: string) => {
    return tasks.filter(t => t.listId === listId && !t.archived && t.status !== 'Done' && (
      (t.dueDate && new Date(t.dueDate) < new Date()) || t.assigneeId === currentUser.id
    )).length;
  };

  const NavItem = ({ id, icon: Icon, label, badgeCount, isStarred }: any) => {
    const isActive = activeView === id;
    return (
      <button 
        onClick={() => onViewChange(id)}
        className={`w-full flex items-center px-4 py-1.5 text-sm transition-colors group ${
          isActive ? 'bg-[#1164A3] text-white' : 'hover:bg-[#350D36] text-[#D1D2D3]'
        }`}
      >
        <span className="mr-2 flex items-center justify-center w-4 h-4 opacity-70">
          {isStarred ? <ICONS.Star className="w-3.5 h-3.5 fill-current" /> : <Icon className="w-4 h-4" />}
        </span>
        <span className="flex-grow text-left truncate">{label}</span>
        {badgeCount > 0 && (
          <span className="bg-[#E01E5A] text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold ml-2">
            {badgeCount}
          </span>
        )}
      </button>
    );
  };

  const starredLists = lists.filter(l => l.isStarred);
  const regularLists = lists.filter(l => !l.isStarred);

  return (
    <div className="flex flex-col h-full">
      {/* Workspace Header */}
      <div className="px-4 py-3 flex items-center justify-between hover:bg-[#350D36] cursor-pointer">
        <div className="flex flex-col truncate">
          <h1 className="font-bold text-white text-base leading-tight truncate">{workspaceName}</h1>
          <div className="flex items-center text-xs opacity-70">
            <div className="w-2 h-2 rounded-full bg-green-500 mr-1.5" />
            {currentUser.name}
          </div>
        </div>
        <ICONS.ChevronDown className="w-4 h-4 opacity-50" />
      </div>

      <div className="mt-4 flex-grow overflow-y-auto custom-scrollbar-dark pb-8">
        {/* Fixed Views Section */}
        <div className="mb-6">
          <button 
            onClick={() => setViewsExpanded(!viewsExpanded)}
            className="w-full flex items-center px-4 py-1 text-xs uppercase font-bold tracking-wider opacity-60 hover:opacity-100"
          >
            <ICONS.ChevronDown className={`w-3 h-3 mr-2 transition-transform ${!viewsExpanded ? '-rotate-90' : ''}`} />
            Views
          </button>
          {viewsExpanded && (
            <div className="mt-1">
              <NavItem id="my-tasks" icon={ICONS.UserIcon} label="My Tasks" />
              <NavItem id="due-soon" icon={ICONS.Clock} label="Due Soon" />
              <NavItem id="overdue" icon={ICONS.AlertCircle} label="Overdue" badgeCount={tasks.filter(t => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'Done').length} />
              <NavItem id="completed" icon={ICONS.CheckCircle2} label="Completed" />
            </div>
          )}
        </div>

        {/* Lists Section */}
        <div>
          <button 
            onClick={() => setListsExpanded(!listsExpanded)}
            className="w-full flex items-center px-4 py-1 text-xs uppercase font-bold tracking-wider opacity-60 hover:opacity-100"
          >
            <ICONS.ChevronDown className={`w-3 h-3 mr-2 transition-transform ${!listsExpanded ? '-rotate-90' : ''}`} />
            Lists
          </button>
          
          {listsExpanded && (
            <div className="mt-1">
              {starredLists.map(list => (
                <NavItem 
                  key={list.id} 
                  id={list.id} 
                  icon={list.isPrivate ? ICONS.Lock : ICONS.Hash} 
                  label={list.name} 
                  isStarred={true}
                  badgeCount={getNeedsAttentionCount(list.id)}
                />
              ))}
              {regularLists.map(list => (
                <NavItem 
                  key={list.id} 
                  id={list.id} 
                  icon={list.isPrivate ? ICONS.Lock : ICONS.Hash} 
                  label={list.name} 
                  badgeCount={getNeedsAttentionCount(list.id)}
                />
              ))}
              <button className="w-full flex items-center px-4 py-1.5 text-sm text-[#D1D2D3] opacity-60 hover:bg-[#350D36] hover:opacity-100 group">
                <span className="mr-2 flex items-center justify-center w-4 h-4 border border-dashed border-[#D1D2D3] rounded">
                  <ICONS.Plus className="w-3 h-3" />
                </span>
                Add List
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Footer Settings */}
      <div className="mt-auto border-t border-[#522653] p-4 flex items-center justify-between text-[#D1D2D3] opacity-60">
        <ICONS.Settings className="w-4 h-4 cursor-pointer hover:opacity-100" />
        <div className="flex space-x-3">
          <ICONS.Bell className="w-4 h-4 cursor-pointer hover:opacity-100" />
          <ICONS.Inbox className="w-4 h-4 cursor-pointer hover:opacity-100" />
        </div>
      </div>
    </div>
  );
};
