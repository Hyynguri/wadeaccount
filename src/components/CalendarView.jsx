import React from 'react';
import Calendar from 'react-calendar';
import { Plus, Minus } from 'lucide-react';

export default function CalendarView({
  date, setDate, activeStartDate, setActiveStartDate, 
  transactions, handleGoToToday, openModalWithType, openEditModal
}) {
  
const renderTileContent = ({ date: tileDate, view }) => {
    if (view !== 'month') return null;
    const isSelected = tileDate.toLocaleDateString() === date.toLocaleDateString();
    const dayTransactions = transactions.filter(t => t.date === tileDate.toLocaleDateString());
    const totalIncome = dayTransactions.filter(t => t.type === '수입').reduce((s, t) => s + t.amount, 0);
    const totalExpense = dayTransactions.filter(t => t.type === '지출').reduce((s, t) => s + t.amount, 0);

    return (
      <div className="w-full h-full relative">
        {isSelected ? (
          // 💡 여기 className을 수정합니다! (배경색 조정 및 backdrop-blur-sm 추가)
          <div className="absolute inset-0 flex items-center justify-center gap-3 bg-white/90 dark:bg-slate-800/90 backdrop-blur-[2px] z-10 animate-in fade-in duration-200">
            <button onClick={(e) => openModalWithType(e, '수입')} className="w-8 h-8 rounded-full bg-red-500 text-white flex items-center justify-center shadow-lg hover:scale-110 transition-transform"><Plus size={18} strokeWidth={4} /></button>
            <button onClick={(e) => openModalWithType(e, '지출')} className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center shadow-lg hover:scale-110 transition-transform"><Minus size={18} strokeWidth={4} /></button>
          </div>
        ) : (
          <div className="absolute top-2 right-2 flex flex-col items-end space-y-0.5 pointer-events-none">
            {totalIncome > 0 && <span className="text-red-500 font-black text-[11px] leading-none">{totalIncome.toLocaleString()}</span>}
            {totalExpense > 0 && <span className="text-blue-500 font-black text-[11px] leading-none">{totalExpense.toLocaleString()}</span>}
          </div>
        )}
      </div>
    );
  };

  const selectedDateTransactions = transactions.filter(t => t.date === date.toLocaleDateString());

  return (
    <>
      {/* 💡 달력 섹션 다크 모드 */}
      <section className="w-[70%] flex flex-col p-6 border-r border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-950 transition-colors">
        <header className="mb-6 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">가계부 달력</h2>
          <button onClick={handleGoToToday} className="px-4 py-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg text-sm font-semibold text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors">Today</button>
        </header>
        <div className="flex-1 rounded-xl overflow-hidden shadow-sm border border-gray-100 dark:border-slate-800">
          <Calendar 
            onChange={setDate} value={date} activeStartDate={activeStartDate}
            onActiveStartDateChange={({ activeStartDate }) => setActiveStartDate(activeStartDate)}
            className="w-full h-full" calendarType="gregory"
            formatDay={(l, d) => d.toLocaleString("en", {day: "numeric"})}
            tileContent={renderTileContent}
          />
        </div>
      </section>

      {/* 💡 우측 상세 패널 다크 모드 */}
      <section className="w-[30%] bg-gray-50 dark:bg-slate-900 flex flex-col p-6 overflow-hidden transition-colors">
        <h3 className="text-xl font-bold mb-8 text-gray-900 dark:text-white border-b border-gray-200 dark:border-slate-800 pb-3">{date.toLocaleDateString()}</h3>
        <div className="flex-1 overflow-y-auto space-y-4">
          {selectedDateTransactions.map(t => (
            <div 
              key={t.id} onClick={() => openEditModal(t)}
              className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 flex justify-between items-center cursor-pointer hover:border-gray-300 dark:hover:border-slate-500 transition-all"
            >
              <div>
                <p className="text-sm font-bold text-gray-800 dark:text-slate-200">{t.description}</p>
                <p className="text-xs text-gray-400 font-bold">{t.category}</p>
              </div>
              <span className={`font-bold ${t.type === '수입' ? 'text-red-500' : 'text-blue-500'}`}>
                {t.type === '수입' ? '+' : '-'}{t.amount.toLocaleString()}원
              </span>
            </div>
          ))}
          {selectedDateTransactions.length === 0 && <p className="text-center text-gray-400 mt-20">내역이 없습니다.</p>}
        </div>
      </section>
    </>
  );
}