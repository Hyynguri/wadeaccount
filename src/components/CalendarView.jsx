import React, { useState } from 'react';
import Calendar from 'react-calendar';
import { Plus, Minus, ChevronLeft, ChevronRight } from 'lucide-react';

export default function CalendarView({
  date, setDate, activeStartDate, setActiveStartDate, 
  transactions, handleGoToToday, openModalWithType, openEditModal
}) {
  
  const [dragStartX, setDragStartX] = useState(0);
  
  // 💡 방향만 저장하도록 단순화
  const [slideDirection, setSlideDirection] = useState('animate-slide-left');

  // 💡 월 변경 시 방향 상태를 먼저 바꾸고 날짜를 업데이트합니다.
  const changeMonth = (offset) => {
    setSlideDirection(offset > 0 ? 'animate-slide-left' : 'animate-slide-right');
    setActiveStartDate(prev => new Date(prev.getFullYear(), prev.getMonth() + offset, 1));
  };

  const handlePointerDown = (e) => setDragStartX(e.clientX || (e.touches && e.touches[0].clientX));
  
  const handlePointerUp = (e) => {
    if (!dragStartX) return;
    const endX = e.clientX || (e.changedTouches && e.changedTouches[0].clientX);
    const distance = dragStartX - endX;
    
    if (distance > 50) changeMonth(1); 
    else if (distance < -50) changeMonth(-1); 
    
    setDragStartX(0);
  };

  // 💡 마우스 휠에 스로틀(딜레이) 기능을 넣어 너무 빠르게 여러 달이 넘어가는 것 방지
  let wheelTimeout;
  const handleWheel = (e) => {
    if (wheelTimeout) return;
    wheelTimeout = setTimeout(() => wheelTimeout = null, 300); // 0.3초 딜레이
    
    if (e.deltaY > 30) changeMonth(1);
    else if (e.deltaY < -30) changeMonth(-1);
  };

  const renderTileContent = ({ date: tileDate, view }) => {
    if (view !== 'month') return null;
    const isSelected = tileDate.toLocaleDateString() === date.toLocaleDateString();
    const dayTransactions = transactions.filter(t => t.date === tileDate.toLocaleDateString());
    const totalIncome = dayTransactions.filter(t => t.type === '수입').reduce((s, t) => s + t.amount, 0);
    const totalExpense = dayTransactions.filter(t => t.type === '지출').reduce((s, t) => s + t.amount, 0);

    return (
      <div className="w-full h-full relative">
        {isSelected ? (
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
      <section className="w-[70%] flex flex-col p-6 border-r border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-950 transition-colors">
        <header className="mb-6 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">가계부 달력</h2>
          <button onClick={() => { setSlideDirection('animate-slide-left'); handleGoToToday(); }} 
            className="px-4 py-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg text-sm font-semibold text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors shadow-sm">
            오늘
          </button>
        </header>
        
        {/* 달력 컨테이너 (스크롤 및 스와이프 감지) */}
        <div 
          className="flex-1 rounded-xl overflow-hidden shadow-sm border border-gray-100 dark:border-slate-800 touch-pan-y cursor-grab active:cursor-grabbing flex flex-col bg-white dark:bg-transparent"
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
          onWheel={handleWheel}
        >
          {/* 💡 핵심: key={activeStartDate.getTime()} 를 부여해 월이 바뀔 때마다 이 div가 새로 생성되면서 애니메이션이 100% 실행되게 합니다 */}
          <div key={activeStartDate.getTime()} className={`w-full h-full flex-1 ${slideDirection}`}>
            <Calendar 
              onChange={setDate} value={date} activeStartDate={activeStartDate}
              onActiveStartDateChange={({ action, activeStartDate }) => {
                if(action === 'next' || action === 'next2') changeMonth(1);
                else if(action === 'prev' || action === 'prev2') changeMonth(-1);
                else setActiveStartDate(activeStartDate);
              }}
              className="w-full h-full border-none" calendarType="gregory"
              formatDay={(l, d) => d.toLocaleString("en", {day: "numeric"})}
              tileContent={renderTileContent}
              prev2Label={null} next2Label={null}
              prevLabel={<ChevronLeft className="w-6 h-6 mx-auto text-gray-400 hover:text-gray-800 dark:hover:text-white transition-colors" />}
              nextLabel={<ChevronRight className="w-6 h-6 mx-auto text-gray-400 hover:text-gray-800 dark:hover:text-white transition-colors" />}
              formatMonthYear={(locale, date) => `${date.getFullYear()}년 ${date.getMonth() + 1}월`} 
            />
          </div>
        </div>
      </section>

      {/* 우측 상세 내역 섹션 */}
      <section className="w-[30%] bg-gray-50 dark:bg-slate-900 flex flex-col p-6 overflow-hidden transition-colors">
        <h3 className="text-xl font-bold mb-8 text-gray-900 dark:text-white border-b border-gray-200 dark:border-slate-800 pb-3">{date.toLocaleDateString()}</h3>
        <div className="flex-1 overflow-y-auto space-y-4 pr-1">
          {selectedDateTransactions.map(t => (
            <div 
              key={t.id} onClick={() => openEditModal(t)}
              className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 flex justify-between items-center cursor-pointer hover:border-gray-300 dark:hover:border-slate-500 transition-all hover:shadow-md"
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
          {selectedDateTransactions.length === 0 && (
            <div className="flex flex-col items-center justify-center h-40 opacity-50">
              <p className="text-center text-gray-400 font-medium">내역이 없습니다.</p>
            </div>
          )}
        </div>
      </section>
    </>
  );
}