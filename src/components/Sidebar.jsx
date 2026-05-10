import React from 'react';
import { CalendarDays, LayoutDashboard, Settings, LogOut, Wallet } from 'lucide-react'; // 💡 필요한 아이콘 모두 포함!

export default function Sidebar({ view, setView, handleLogout }) {
  // 사이드바 메뉴 항목들
  const menuItems = [
    { id: 'calendar', icon: CalendarDays, label: '달력' },
    { id: 'dashboard', icon: LayoutDashboard, label: '대시보드' },
    { id: 'settings', icon: Settings, label: '설정' },
  ];

  return (
    <aside className="w-64 bg-white dark:bg-slate-900 border-r border-gray-100 dark:border-slate-800 flex flex-col transition-colors">
      
      {/* 1. 상단 로고 영역 */}
      <div className="p-6 flex items-center gap-3 border-b border-gray-100 dark:border-slate-800">
        <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-500/30 transform rotate-3">
          <Wallet size={24} />
        </div>
        <h1 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">가계부</h1>
      </div>

      {/* 2. 네비게이션 메뉴 영역 */}
      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => setView(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-bold ${
                view === item.id
                  ? 'bg-slate-800 text-white dark:bg-blue-500 dark:text-white shadow-md'
                  : 'text-gray-500 hover:bg-gray-50 dark:text-slate-400 dark:hover:bg-slate-800/50'
              }`}
            >
              <Icon size={20} />
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* 3. 하단 로그아웃 버튼 영역 */}
      <div className="p-6 border-t border-gray-100 dark:border-slate-800 mt-auto">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 text-gray-500 hover:text-red-500 hover:bg-red-50 dark:text-slate-400 dark:hover:text-red-400 dark:hover:bg-red-500/10 rounded-xl transition-all font-bold"
        >
          <LogOut size={20} />
          로그아웃
        </button>
      </div>
      
    </aside>
  );
}