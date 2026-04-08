
import React, { useState } from 'react';
import { Layout } from './components/Layout';
import { TaskSprintContainer } from './components/TaskSprintContainer';
import { TaskDetailsDrawer } from './components/TaskDetailsDrawer';
import { TaskBoardView } from './components/TaskBoardView';
import { DashboardBI } from './components/DashboardBI';
import { TaskFilterSidebar } from './components/TaskFilterSidebar';
import { useZenithStore, ZenithProvider } from './store';
import { ICONS } from './constants';

// Fixed type error by adding optional key property to the component props definition
const NotificationToast = ({ note, onRemove }: { note: any, onRemove: (id: string) => void, key?: any }) => (
  <div className="bg-[#1c2128] border border-blue-500/50 shadow-2xl rounded-2xl p-4 w-80 animate-in slide-in-from-left duration-500 flex items-start space-x-4 space-x-reverse relative overflow-hidden group">
    <div className="absolute top-0 right-0 bottom-0 w-1 bg-blue-500"></div>
    <div className="p-2 bg-blue-500/10 rounded-xl text-blue-400">
       <ICONS.Bell className="w-5 h-5" />
    </div>
    <div className="flex-grow">
      <div className="flex items-center justify-between mb-1">
        <h4 className="text-[13px] font-black text-white">התראה נשלחה למערכת חיצונית</h4>
        <button onClick={() => onRemove(note.id)} className="text-slate-500 hover:text-white transition-colors">
          <ICONS.X className="w-3.5 h-3.5" />
        </button>
      </div>
      <p className="text-[12px] text-slate-400 leading-snug">
        המשתמש <span className="font-bold text-blue-400">{note.userName}</span> תויג בהנחיה: <span className="italic">"{note.taskTitle}"</span>
      </p>
    </div>
    {/* Progress Bar for timeout */}
    <div className="absolute bottom-0 left-0 h-0.5 bg-blue-500/30 w-full overflow-hidden">
       <div className="h-full bg-blue-500 animate-[shrink_5s_linear_forwards] origin-right"></div>
    </div>
    <style>{`
      @keyframes shrink {
        from { width: 100%; }
        to { width: 0%; }
      }
    `}</style>
  </div>
);

// Removed React.FC to avoid issues with mandatory children in some TypeScript configurations
const AppContent = () => {
  const store = useZenithStore();
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const handleCreateNewTask = () => {
    const newTask = store.addTask({ title: [], description: '', assignee: [] });
    store.setActiveTaskId(newTask.id);
  };

  const handleCloseDrawer = () => {
    store.setActiveTaskId(null);
  };

  const handleDeleteTask = (id: string) => {
    store.deleteTask(id);
    store.setActiveTaskId(null);
  };

  const hasActiveFilters = 
    store.globalFilters.status.length > 0 || 
    store.globalFilters.assignee.length > 0 || 
    store.globalFilters.title.length > 0;

  return (
    <Layout
      bi={<DashboardBI tasks={store.filteredTasks} />}
    >
      {/* Toast Notification Container */}
      <div className="fixed bottom-8 left-8 z-[2000] flex flex-col space-y-4">
        {store.notifications.map((note: any) => (
          <NotificationToast key={note.id} note={note} onRemove={store.removeNotification} />
        ))}
      </div>

      {/* Background Overlay for Drawer */}
      {store.activeTaskId && (
        <div 
          className="fixed inset-0 bg-black/70 backdrop-blur-[6px] z-[90] animate-in fade-in duration-300"
          onClick={handleCloseDrawer}
        />
      )}

      {/* Global Filter Sidebar */}
      <TaskFilterSidebar 
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        tasks={store.tasks}
        filters={store.globalFilters}
        onFilterChange={store.setGlobalFilters}
      />

      {/* Task Sidebar/Drawer */}
      <TaskDetailsDrawer 
        task={store.activeTask}
        users={store.users}
        onClose={handleCloseDrawer}
        onUpdate={store.updateTask}
        onDelete={handleDeleteTask}
      />

      <div className="w-full">
        {/* View Switcher Controls */}
        <div className="flex items-center justify-between mb-8">
           <div className="flex bg-[#161b22] p-1 rounded-xl border border-[#30363d] shadow-inner">
              <button 
                onClick={() => store.setViewType('list')}
                className={`flex items-center space-x-2 space-x-reverse px-5 py-2 rounded-lg text-sm font-bold transition-all ${store.viewType === 'list' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
              >
                <ICONS.LayoutList className="w-4 h-4" />
                <span>תצוגת רשימה</span>
              </button>
              <button 
                onClick={() => store.setViewType('board')}
                className={`flex items-center space-x-2 space-x-reverse px-5 py-2 rounded-lg text-sm font-bold transition-all ${store.viewType === 'board' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
              >
                <ICONS.LayoutGrid className="w-4 h-4" />
                <span>תצוגת עמדות (לוח)</span>
              </button>
           </div>
           
           <div className="flex items-center space-x-3 space-x-reverse">
              {/* Filter Toggle Button */}
              <button 
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className={`p-2 rounded-xl border transition-all flex items-center space-x-2 space-x-reverse ${
                  hasActiveFilters 
                    ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-900/20' 
                    : 'bg-[#0d1117] border-[#30363d] text-slate-400 hover:border-slate-500 hover:text-white'
                }`}
                title="סינון הנחיות"
              >
                <ICONS.Filter className="w-4 h-4" />
                <span className="text-sm font-bold">סינון</span>
                {hasActiveFilters && (
                  <span className="text-[10px] font-black px-1.5 py-0.5 bg-white/20 rounded-full leading-none">
                    {store.globalFilters.status.length + store.globalFilters.assignee.length + store.globalFilters.title.length}
                  </span>
                )}
              </button>

              <div className="relative group">
                <ICONS.Search className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input 
                  type="text"
                  placeholder="חיפוש כללי..."
                  value={store.searchQuery}
                  onChange={(e) => store.setSearchQuery(e.target.value)}
                  className="pr-10 pl-4 py-2 bg-[#0d1117] border border-[#30363d] rounded-xl text-sm w-64 focus:border-blue-500 outline-none transition-all shadow-sm"
                />
              </div>

              <button 
                onClick={handleCreateNewTask}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-5 rounded-xl shadow-lg shadow-blue-900/20 flex items-center space-x-2 space-x-reverse transition-all active:scale-95"
              >
                <ICONS.Plus className="w-4 h-4" />
                <span>הנחיה חדשה</span>
              </button>
           </div>
        </div>

        {store.viewType === 'list' ? (
          /* List Groups (Drawers/Sections) */
          <div className="space-y-10 pb-20">
            {store.groupedTasks.map(group => (
              <TaskSprintContainer 
                key={group.id}
                id={group.id}
                title={group.title}
                subtitle={group.subtitle}
                status={group.status}
                tasks={group.tasks}
                users={store.users}
                onSelectTask={store.setActiveTaskId}
                onAddTask={(title, sId) => store.addTask({ title, sectionId: sId })}
                onUpdateTitle={(newTitle) => store.updateSectionTitle(store.activeSidebarView, group.id, newTitle)}
                onUpdateTask={store.updateTask}
                isOpen={true}
              />
            ))}

            {/* Add Section Button (Jira-style) */}
            <div className="pt-4">
              <button 
                onClick={() => store.addSection(store.activeSidebarView)}
                className="w-full py-5 border-2 border-dashed border-[#30363d] rounded-2xl text-slate-500 hover:text-blue-400 hover:border-blue-500/50 hover:bg-blue-500/5 transition-all flex items-center justify-center space-x-3 space-x-reverse group shadow-sm"
              >
                <div className="p-1.5 rounded-lg bg-[#30363d] group-hover:bg-blue-500/20 transition-colors">
                  <ICONS.Plus className="w-5 h-5" />
                </div>
                <span className="font-bold text-[15px]">הוספת מגירה (Section) חדשה</span>
              </button>
            </div>
          </div>
        ) : (
          /* Board View */
          <TaskBoardView 
            tasks={store.filteredTasks}
            users={store.users}
            onUpdateTask={store.updateTask}
            onSelectTask={store.setActiveTaskId}
          />
        )}

        {store.filteredTasks.length === 0 && (
          <div className="flex flex-col items-center justify-center py-32 bg-[#161b22]/30 border-2 border-dashed border-[#30363d] rounded-3xl mt-6">
            <div className="w-20 h-20 bg-[#0d1117] rounded-3xl flex items-center justify-center mb-6 shadow-2xl border border-[#30363d]">
              <ICONS.Inbox className="w-10 h-10 text-slate-700" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">אין כאן הנחיות עדיין</h3>
            <p className="text-slate-400 text-center max-w-sm">
              מרחב העבודה ריק. הוספה מהירה בתוך המגירות.
            </p>
          </div>
        )}
      </div>
    </Layout>
  );
};

// Removed React.FC to avoid issues with mandatory children in some TypeScript configurations
const App = () => {
  return (
    <ZenithProvider>
      <AppContent />
    </ZenithProvider>
  );
};

export default App;
