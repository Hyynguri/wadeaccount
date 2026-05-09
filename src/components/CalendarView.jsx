import React from 'react';
import Calendar from 'react-calendar';
import { Plus, Minus } from 'lucide-react';

export default function CalendarView({
  date, setDate, activeStartDate, setActiveStartDate, 
  transactions, handleGoToToday, openModalWithType
}) {
  
  const renderTileContent = ({ date: tileDate, view: calView }) => {
    if (calView !== 'month') return null;
    const isSelected = tileDate.toLocaleDateString() === date.toLocaleDateString();
    const dayTransactions = transactions.filter(t => t.date === tileDate.toLocaleDateString());
    const totalIncome = dayTransactions.filter(t => t.type === '수입').reduce((sum, t) => sum + t.amount, 0);
    const totalExpense = dayTransactions.filter(t => t.type === '지출').reduce((sum, t) => sum + t.amount, 0);

    return (
      <div className="w-full h-full relative text-[10px]">
        {isSelected ? (
          <div className="absolute inset-0 flex items-center justify-center gap-2 bg-white/90 z-10">
            <button onClick={(e) => openModalWithType(e, '수입')} className="w-8 h-8 rounded-full bg-red-500 text-white flex items-center justify-center shadow-md"><Plus size={18} strokeWidth={4} /></button>
            <button onClick={(e) => openModalWithType(e, '지출')} className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center shadow-md"><Minus size={18} strokeWidth={4} /></button>
          </div>
        ) : (
          <div className="absolute top-2 right-2 flex flex-col items-end space-y-0.5 pointer-events-none">
            {totalIncome > 0 && <span className="text-red-500 font-black text-[12px]">{totalIncome.toLocaleString()}</span>}
            {totalExpense > 0 && <span className="text-blue-500 font-black text-[12px]">{totalExpense.toLocaleString()}</span>}
          </div>
        )}
      </div>
    );
  };

  const selectedDateTransactions = transactions.filter(t => t.date === date.toLocaleDateString());
  const selectedIncomes = selectedDateTransactions.filter(t => t.type === '수입');
  const selectedExpenses = selectedDateTransactions.filter(t => t.type === '지출');

  return (
    <>
      <section className="w-[70%] flex flex-col p-6 border-r border-gray-200 overflow-hidden">
        <header className="mb-6 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">가계부 달력</h2>
          <button onClick={handleGoToToday} className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-semibold hover:bg-gray-50">Today</button>
        </header>
        <div className="flex-1 bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100">
          <Calendar 
            onChange={setDate} value={date} activeStartDate={activeStartDate}
            onActiveStartDateChange={({ activeStartDate: nextDate }) => setActiveStartDate(nextDate)}
            className="w-full h-full border-none" calendarType="gregory"
            formatDay={(locale, d) => d.toLocaleString("en", {day: "numeric"})}
            tileContent={renderTileContent}
          />
        </div>
      </section>

      <section className="w-[30%] bg-gray-50 flex flex-col p-6 overflow-hidden">
        <h3 className="text-xl font-bold mb-8 text-gray-900 border-b border-gray-200 pb-3">{date.toLocaleDateString()}</h3>
        <div className="flex-1 overflow-y-auto space-y-8 pr-2">
          <div>
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-lg font-black text-red-500">수입</h4>
              <span className="text-sm font-bold bg-red-50 text-red-600 px-3 py-1 rounded-full">{selectedIncomes.reduce((s,t)=>s+t.amount,0).toLocaleString()}원</span>
            </div>
            <ul className="space-y-2">
              {selectedIncomes.map(t => (
                <li key={t.id} className="bg-white p-3 rounded-xl shadow-sm border border-red-100 flex justify-between items-center">
                  <span className="text-sm font-bold text-gray-700">{t.category}</span>
                  <span className="font-bold text-red-500">+{t.amount.toLocaleString()}원</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-lg font-black text-blue-500">지출</h4>
              <span className="text-sm font-bold bg-blue-50 text-blue-600 px-3 py-1 rounded-full">{selectedExpenses.reduce((s,t)=>s+t.amount,0).toLocaleString()}원</span>
            </div>
            <ul className="space-y-2">
              {selectedExpenses.map(t => (
                <li key={t.id} className="bg-white p-3 rounded-xl shadow-sm border border-blue-100 flex justify-between items-center">
                  <span className="text-sm font-bold text-gray-700">{t.category}</span>
                  <span className="font-bold text-blue-500">-{t.amount.toLocaleString()}원</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </>
  );
}