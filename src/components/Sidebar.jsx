import React from 'react';
import { Home, Calendar as CalendarIcon, BarChart3, Settings } from 'lucide-react';

export default function Sidebar({ view, setView }) {
  return (
    // 💡 기본 bg-white로 수정하여 밝게 만들었습니다.
    <aside className="w-[15%] bg-white dark:bg-slate-900 p-6 flex flex-col border-r border-gray-100 dark:border-slate-800 transition-colors">
      <h1 className="text-xl font-black mb-10 text-gray-900 dark:text-white tracking-tight italic">💰 WADE</h1>
      <nav className="space-y-2 flex-1">
        <button 
          onClick={() => setView('dashboard')}
          className={`w-full flex items-center space-x-3 p-3 rounded-xl transition-all ${
            view === 'dashboard' ? 'bg-red-500 text-white shadow-lg' : 'text-gray-500 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-800'
          }`}
        >
          <BarChart3 size={20} /> <span className="font-bold">대시보드</span>
        </button>
        <button 
          onClick={() => setView('calendar')}
          className={`w-full flex items-center space-x-3 p-3 rounded-xl transition-all ${
            view === 'calendar' ? 'bg-red-500 text-white shadow-lg' : 'text-gray-500 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-800'
          }`}
        >
          <CalendarIcon size={20} /> <span className="font-bold">가계부 달력</span>
        </button>
      </nav>
      
      <nav className="pt-6 border-t border-gray-100 dark:border-slate-800">
        <button 
          onClick={() => setView('settings')}
          className={`w-full flex items-center space-x-3 p-3 rounded-xl transition-all ${
            view === 'settings' ? 'bg-slate-800 dark:bg-slate-700 text-white shadow-lg' : 'text-gray-500 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-800'
          }`}
        >
          <Settings size={20} /> <span className="font-bold">설정</span>
        </button>
      </nav>
    </aside>
  );
}