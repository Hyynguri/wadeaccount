import React from 'react';
import { Home, Calendar as CalendarIcon, BarChart3 } from 'lucide-react';

export default function Sidebar({ view, setView }) {
  return (
    <aside className="w-[15%] bg-gray-50 p-6 flex flex-col border-r border-gray-200">
      <h1 className="text-xl font-bold mb-10 text-gray-900 tracking-tight">💰 wade account</h1>
      <nav className="space-y-4">
        <button 
          onClick={() => setView('dashboard')}
          className={`w-full flex items-center space-x-3 p-3 rounded-xl transition-all ${
            view === 'dashboard' ? 'bg-red-500 text-white shadow-lg' : 'text-gray-500 hover:bg-gray-100'
          }`}
        >
          <BarChart3 size={20} /> <span className="font-bold">대시보드</span>
        </button>
        <button 
          onClick={() => setView('calendar')}
          className={`w-full flex items-center space-x-3 p-3 rounded-xl transition-all ${
            view === 'calendar' ? 'bg-red-500 text-white shadow-lg' : 'text-gray-500 hover:bg-gray-100'
          }`}
        >
          <CalendarIcon size={20} /> <span className="font-bold">가계부 달력</span>
        </button>
      </nav>
    </aside>
  );
}