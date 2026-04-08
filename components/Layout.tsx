
import React from 'react';

interface LayoutProps {
  bi: React.ReactNode;
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ bi, children }) => {
  return (
    <div className="flex h-screen w-full bg-[#0d1117] text-slate-200 overflow-hidden" dir="rtl">
      {/* Main Content Area */}
      <div className="flex-grow flex flex-col min-w-0">
        {/* Top Navbar - Cleaned version */}
        <nav className="h-14 border-b border-[#30363d] flex items-center justify-between px-8 bg-[#0d1117] flex-shrink-0 z-50">
          <div className="flex items-center">
            {/* Removed Logo and Nav Links as per scribble */}
          </div>
          
          <div className="flex items-center space-x-5 space-x-reverse">
            <div className="flex items-center px-3 py-1 bg-[#161b22] border border-[#30363d] rounded text-xs text-slate-400">
               <span className="ml-2 w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
               מערכת פעילה
            </div>
            <div className="w-9 h-9 rounded-full bg-slate-700 flex items-center justify-center overflow-hidden border border-[#30363d] cursor-pointer hover:border-slate-500 transition-all">
               <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Jordan" alt="avatar" />
            </div>
          </div>
        </nav>

        <div className="flex-grow overflow-auto custom-scrollbar">
          {/* BI Section */}
          {bi}
          
          {/* Content Wrapper */}
          <div className="p-8 max-w-[1600px] mx-auto">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};
