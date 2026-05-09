import React from 'react';
import { Moon, Sun } from 'lucide-react';

export default function SettingsView({ darkMode, setDarkMode }) {
  return (
    <section className="flex-1 p-10 bg-gray-50 dark:bg-slate-950 overflow-y-auto transition-colors">
      <header className="mb-10">
        <h2 className="text-3xl font-black text-gray-900 dark:text-white">설정</h2>
        <p className="text-gray-500 dark:text-slate-400 mt-2 font-medium">앱의 환경 설정을 관리하세요.</p>
      </header>

      <div className="max-w-3xl mx-auto space-y-6">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gray-100 dark:bg-slate-800 rounded-2xl text-gray-600 dark:text-slate-300">
              {darkMode ? <Moon size={24} /> : <Sun size={24} />}
            </div>
            <div>
              <h4 className="font-bold text-gray-900 dark:text-white text-lg">다크 테마</h4>
              <p className="text-sm text-gray-500 dark:text-slate-400">어두운 화면으로 눈의 피로를 줄여줍니다.</p>
            </div>
          </div>
          
          {/* 토글 스위치 */}
          <button 
            onClick={() => setDarkMode(!darkMode)}
            className={`w-14 h-8 rounded-full p-1 transition-colors duration-300 ${darkMode ? 'bg-blue-600' : 'bg-gray-300'}`}
          >
            <div className={`w-6 h-6 bg-white rounded-full shadow-sm transform transition-transform duration-300 ${darkMode ? 'translate-x-6' : 'translate-x-0'}`} />
          </button>
        </div>
      </div>
    </section>
  );
}