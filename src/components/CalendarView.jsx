import React, { useState, useRef } from 'react';
import Calendar from 'react-calendar';
import { Plus } from 'lucide-react';

export default function CalendarView({
  date, setDate, activeStartDate, setActiveStartDate, 
  transactions, handleGoToToday, openModalWithType, openEditModal
}) {
  const [isPanelOpen, setIsPanelOpen] = useState(false); 
  const [isDragging, setIsDragging] = useState(false);
  
  const [touchStartX, setTouchStartX] = useState(0);
  const [touchStartY, setTouchStartY] = useState(0);
  const [dragOffsetX, setDragOffsetX] = useState(0);
  const [dragOffsetY, setDragOffsetY] = useState(0);
  const [dragAxis, setDragAxis] = useState(null); 
  const [dragTarget, setDragTarget] = useState(null);

  const [calAnimTarget, setCalAnimTarget] = useState(null);
  const [panelAnimTarget, setPanelAnimTarget] = useState(null);

  const HANDLE_HEIGHT = 24;
  const isWheelScrolling = useRef(false);

  const triggerSlide = (direction, target) => {
    if (target === 'calendar') {
      if (calAnimTarget !== null) return;
      setCalAnimTarget(direction === 1 ? 2 : 0);
      
      setTimeout(() => {
        const currentActive = activeStartDate || new Date(date.getFullYear(), date.getMonth(), 1);
        setActiveStartDate(new Date(currentActive.getFullYear(), currentActive.getMonth() + direction, 1));
        setCalAnimTarget(null);
      }, 300);
    } else {
      if (panelAnimTarget !== null) return;
      setPanelAnimTarget(direction === 1 ? 2 : 0);
      
      setTimeout(() => {
        const newDate = new Date(date);
        newDate.setDate(newDate.getDate() + direction);
        setDate(newDate);
        
        const currentMonth = activeStartDate ? activeStartDate.getMonth() : new Date().getMonth();
        if (newDate.getMonth() !== currentMonth) {
          setActiveStartDate(new Date(newDate.getFullYear(), newDate.getMonth(), 1));
        }
        setPanelAnimTarget(null);
      }, 300);
    }
  };

  const handleTouchStart = (e) => {
    if (calAnimTarget !== null || panelAnimTarget !== null) return; 
    setTouchStartX(e.touches[0].clientX);
    setTouchStartY(e.touches[0].clientY);
    setIsDragging(true);
    setDragOffsetX(0);
    setDragOffsetY(0);
    setDragAxis(null);
    setDragTarget(e?.target?.closest?.('.calendar-container') ? 'calendar' : 'panel');
  };

  const handleTouchMove = (e) => {
    if (!isDragging) return;
    const dx = e.touches[0].clientX - touchStartX;
    const dy = e.touches[0].clientY - touchStartY;

    if (!dragAxis && (Math.abs(dx) > 10 || Math.abs(dy) > 10)) {
      setDragAxis(Math.abs(dx) > Math.abs(dy) ? 'x' : 'y');
    }

    if (dragAxis === 'x') {
      setDragOffsetX(dx);
    } else if (dragAxis === 'y') {
      if (isPanelOpen && e.target.closest('.transaction-list')) {
        setIsDragging(false); 
        return;
      }
      let delta = dy;
      if (isPanelOpen) delta = Math.max(0, delta); 
      else delta = Math.min(0, delta); 
      setDragOffsetY(delta);
    }
  };

  const handleTouchEnd = (e) => {
    if (!isDragging) return;
    setIsDragging(false);

    if (dragAxis === 'x') {
      if (dragOffsetX > 50) triggerSlide(-1, dragTarget);
      else if (dragOffsetX < -50) triggerSlide(1, dragTarget);
    } else if (dragAxis === 'y') {
      if (Math.abs(dragOffsetY) < 10) {
        if (e?.target?.closest?.('.drag-handle')) setIsPanelOpen(!isPanelOpen);
      } else {
        if (!isPanelOpen && dragOffsetY < -40) setIsPanelOpen(true);
        else if (isPanelOpen && dragOffsetY > 40) setIsPanelOpen(false);
      }
    }
    setDragOffsetX(0);
    setDragOffsetY(0);
    setDragAxis(null);
  };

  const handleWheel = (e) => {
    if (e.target.closest('.transaction-list') && Math.abs(e.deltaY) > Math.abs(e.deltaX)) return;
    if (isWheelScrolling.current || calAnimTarget !== null || panelAnimTarget !== null) return;

    if (Math.abs(e.deltaX) > 20) {
      triggerSlide(e.deltaX > 20 ? 1 : -1, 'panel');
    } else if (Math.abs(e.deltaY) > 20 && e.target.closest('.calendar-container')) {
      triggerSlide(e.deltaY > 20 ? 1 : -1, 'calendar');
    }
    
    isWheelScrolling.current = true;
    setTimeout(() => { isWheelScrolling.current = false; }, 500);
  };

  const getCalendarStyle = () => {
    if (window.innerWidth >= 768) return {};
    const wh = window.innerHeight || 800;
    const closedHeightPx = wh - HANDLE_HEIGHT; 
    const openHeightPx = wh * 0.53;

    if (!isDragging || dragAxis === 'x') {
      return { height: isPanelOpen ? `${openHeightPx}px` : `${closedHeightPx}px`, transition: 'height 0.4s cubic-bezier(0.32, 0.72, 0, 1)' };
    }
    const baseHeightPx = isPanelOpen ? openHeightPx : closedHeightPx;
    let dynamicHeightPx = baseHeightPx + dragOffsetY; 
    dynamicHeightPx = Math.max(openHeightPx, Math.min(closedHeightPx, dynamicHeightPx));
    return { height: `${dynamicHeightPx}px`, transition: 'none' };
  };

  const getPanelStyle = () => {
    if (window.innerWidth >= 768) return {};
    if (!isDragging || dragAxis === 'x') {
      return { transform: isPanelOpen ? 'translateY(0)' : `translateY(calc(100% - ${HANDLE_HEIGHT}px))`, transition: 'transform 0.4s cubic-bezier(0.32, 0.72, 0, 1)' };
    }
    const offset = isPanelOpen ? `${dragOffsetY}px` : `calc(100% - ${HANDLE_HEIGHT}px - ${Math.abs(dragOffsetY)}px)`;
    return { transform: `translateY(${offset})`, transition: 'none' };
  };

  const getTrackStyle = (type) => {
    const isCal = type === 'calendar';
    const animTarget = isCal ? calAnimTarget : panelAnimTarget;
    const isThisTarget = dragTarget === type;

    if (animTarget !== null) {
      return { transform: `translateX(-${animTarget * 33.333}%)`, transition: 'transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)' };
    }
    if (isDragging && dragAxis === 'x' && isThisTarget) {
      return { transform: `translateX(calc(-33.333% + ${dragOffsetX}px))`, transition: 'none' };
    }
    return { transform: 'translateX(-33.333%)', transition: 'none' };
  };

  const currentMonthDate = activeStartDate || new Date(date.getFullYear(), date.getMonth(), 1);
  const prevMonthDate = new Date(currentMonthDate.getFullYear(), currentMonthDate.getMonth() - 1, 1);
  const nextMonthDate = new Date(currentMonthDate.getFullYear(), currentMonthDate.getMonth() + 1, 1);

  const prevDayDate = new Date(date); prevDayDate.setDate(date.getDate() - 1);
  const nextDayDate = new Date(date); nextDayDate.setDate(date.getDate() + 1);

  const hideCalendarText = window.innerWidth < 768 && (isPanelOpen || (dragAxis === 'y' && dragOffsetY < -5));

  const renderCalendar = (targetDate, keyIndex) => (
    <div key={keyIndex} className={`w-1/3 h-full flex flex-col shrink-0 ${keyIndex !== 'curr' ? 'pointer-events-none' : ''}`}>
      <Calendar 
        onChange={(d) => { setDate(d); if(window.innerWidth < 768) setIsPanelOpen(true); }}
        value={date}
        activeStartDate={targetDate}
        onActiveStartDateChange={({ activeStartDate }) => setActiveStartDate(activeStartDate)} 
        formatDay={(locale, d) => d.getDate()}
        calendarType="gregory"
        maxDetail="month" 
        minDetail="year"
        prevLabel={null} nextLabel={null} prev2Label={null} next2Label={null}
        navigationLabel={({ date: navDate }) => `${navDate.getMonth() + 1}월`}
        className="w-full h-full border-none react-calendar-mobile-fix"
        tileContent={({ date: tileDate, view }) => {
          if (view !== 'month') return null;
          const dayTx = transactions.filter(t => t.date === tileDate.toLocaleDateString());
          const income = dayTx.filter(t => t.type === '수입').reduce((s, t) => s + t.amount, 0);
          const expense = dayTx.filter(t => t.type === '지출').reduce((s, t) => s + t.amount, 0);
          return (
            <div className={`flex flex-col items-end w-full font-black leading-tight transition-all duration-300 ease-in-out overflow-hidden pr-1
              ${hideCalendarText ? 'max-h-0 opacity-0 mt-0' : 'max-h-[30px] opacity-100 mt-1 text-[8px] md:text-[10px]'}`}
            >
              {income > 0 && <div className="text-red-500">+{income.toLocaleString()}</div>}
              {expense > 0 && <div className="text-blue-500">-{expense.toLocaleString()}</div>}
            </div>
          );
        }}
      />
    </div>
  );

  const renderTransactionList = (targetDate, keyIndex) => {
    const dayTx = transactions.filter(t => t.date === targetDate.toLocaleDateString());
    return (
      <div key={keyIndex} className={`w-1/3 h-full shrink-0 flex flex-col overflow-y-auto min-h-0 px-6 pb-28 md:pb-8 pt-2 md:pt-8 ${keyIndex !== 'curr' ? 'pointer-events-none' : ''}`}>
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg md:text-xl font-extrabold dark:text-white">
            {targetDate.toLocaleDateString('ko-KR', { month: 'long', day: 'numeric', weekday: 'short' })}
          </h3>
          <span className="px-3 py-1 bg-white dark:bg-slate-800 rounded-full text-xs font-black text-blue-500 shadow-sm border border-blue-100 dark:border-slate-700">
            {dayTx.length}건
          </span>
        </div>
        <div className="space-y-3">
          {dayTx.map(t => (
            <div key={t.id} onClick={() => openEditModal(t)} 
                 className="bg-white dark:bg-slate-800 p-4 rounded-3xl flex justify-between items-center shadow-sm border border-transparent active:scale-95 transition-all cursor-pointer">
              <div className="flex flex-col">
                <span className="font-bold text-gray-800 dark:text-slate-200 text-sm">{t.description}</span>
                <span className="text-[10px] text-gray-400 font-bold mt-1 tracking-tight">{t.category}</span>
              </div>
              <span className={`font-black text-sm ${t.type === '수입' ? 'text-red-500' : 'text-blue-500'}`}>
                {t.type === '수입' ? '+' : '-'}{t.amount.toLocaleString()}원
              </span>
            </div>
          ))}
          {dayTx.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 opacity-30">
              <p className="text-sm font-bold text-gray-400">거래 내역이 없습니다.</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div 
      className="flex flex-col md:flex-row w-full h-[100dvh] bg-white dark:bg-slate-950 overflow-hidden relative select-none"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
      onWheel={handleWheel}
    >
      {/* 💡 라이브러리 하이라이트 CSS 스타일 전면 개편 */}
      <style>{`
        .react-calendar-mobile-fix {
          display: flex !important; flex-direction: column !important; height: 100% !important; width: 100% !important;
        }
        .react-calendar-mobile-fix .react-calendar__viewContainer {
          display: flex !important; flex-direction: column !important; flex: 1 1 auto !important; height: 100% !important;
        }
        
        .react-calendar-mobile-fix .react-calendar__month-view,
        .react-calendar-mobile-fix .react-calendar__year-view,
        .react-calendar-mobile-fix .react-calendar__month-view > div,
        .react-calendar-mobile-fix .react-calendar__year-view > div,
        .react-calendar-mobile-fix .react-calendar__month-view > div > div,
        .react-calendar-mobile-fix .react-calendar__year-view > div > div {
          display: flex !important; flex-direction: column !important; flex: 1 1 auto !important; height: 100% !important; width: 100% !important;
        }

        /* 📅 월간 뷰 날짜 타일 공통 레이아웃 설정 */
        .react-calendar-mobile-fix .react-calendar__month-view__days__day {
          display: flex !important;
          flex-direction: column !important;
          align-items: flex-end !important;
          justify-content: flex-start !important;
          padding: 8px 12px 4px 8px !important;
          background: transparent !important;
          border-radius: 16px !important;
          transition: all 0.2s ease !important;
          color: #1e293b !important;
          border: 2px solid transparent !important; /* 기본 테두리 투명하게 확보 */
        }
        .dark .react-calendar-mobile-fix .react-calendar__month-view__days__day {
          color: #f1f5f9 !important;
        }

        /* 다른 달의 날짜 투명도 조절 */
        .react-calendar-mobile-fix .react-calendar__month-view__days__day--neighboringMonth {
          opacity: 0.25 !important;
        }

        /* 날짜 기본 밑줄 해제 */
        .react-calendar-mobile-fix .react-calendar__month-view__days__day abbr {
          text-decoration: none !important;
          font-weight: 700 !important;
        }

        /* 🚫 [핵심 버그 픽스] 터치 후 남는 포커스/호버 좀비 잔상 완벽 차단 */
        .react-calendar-mobile-fix .react-calendar__tile:enabled:hover,
        .react-calendar-mobile-fix .react-calendar__tile:enabled:focus,
        .react-calendar-mobile-fix .react-calendar__tile:active,
        .react-calendar-mobile-fix .react-calendar__tile:focus,
        .react-calendar-mobile-fix .react-calendar__tile:hover {
          background: transparent !important;
        }

        /* 📍 1. 오늘 날짜 스타일: 꽉 찬 배경 제거 ➡️ '상단 오늘 버튼'과 동일한 파란색 Squircle 테두리로 교체 */
        .react-calendar-mobile-fix .react-calendar__tile--now {
          background: transparent !important;
          border: 2px solid #3b82f6 !important;
          color: #3b82f6 !important;
        }
        .dark .react-calendar-mobile-fix .react-calendar__tile--now {
          border-color: #60a5fa !important;
          color: #60a5fa !important;
        }
        
        /* 오늘 날짜 타일의 포커스 잔상도 강제 차단 */
        .react-calendar-mobile-fix .react-calendar__tile--now:enabled:hover,
        .react-calendar-mobile-fix .react-calendar__tile--now:enabled:focus,
        .react-calendar-mobile-fix .react-calendar__tile--now:hover,
        .react-calendar-mobile-fix .react-calendar__tile--now:focus {
          background: transparent !important;
        }

        /* 📍 2. 현재 선택된 날짜(Active) 하이라이트: 오직 이것만 배경색을 가질 수 있음 */
        .react-calendar-mobile-fix .react-calendar__tile--active,
        .react-calendar-mobile-fix .react-calendar__tile--active:enabled:hover,
        .react-calendar-mobile-fix .react-calendar__tile--active:enabled:focus,
        .react-calendar-mobile-fix .react-calendar__tile--active:hover,
        .react-calendar-mobile-fix .react-calendar__tile--active:focus {
          background: #3b82f6 !important;
          color: white !important;
          box-shadow: 0 4px 14px rgba(59, 130, 246, 0.3) !important;
          border-color: transparent !important;
        }
        .dark .react-calendar-mobile-fix .react-calendar__tile--active,
        .dark .react-calendar-mobile-fix .react-calendar__tile--active:enabled:hover,
        .dark .react-calendar-mobile-fix .react-calendar__tile--active:enabled:focus,
        .dark .react-calendar-mobile-fix .react-calendar__tile--active:hover,
        .dark .react-calendar-mobile-fix .react-calendar__tile--active:focus {
          background: #2563eb !important;
          color: white !important;
          box-shadow: 0 4px 14px rgba(37, 99, 235, 0.4) !important;
          border-color: transparent !important;
        }
        
        .react-calendar-mobile-fix .react-calendar__tile--active abbr {
          color: white !important;
        }

        /* 3x4 연도별 선택창 레이아웃 */
        .react-calendar-mobile-fix .react-calendar__year-view .react-calendar__year-view__months {
          display: grid !important;
          grid-template-columns: repeat(3, 1fr) !important;
          grid-template-rows: repeat(4, 1fr) !important;
          height: 100% !important;
          width: 100% !important;
          gap: 12px !important;
          padding: 12px !important;
        }

        .react-calendar-mobile-fix .react-calendar__year-view .react-calendar__year-view__months .react-calendar__tile {
          flex: none !important; 
          max-width: none !important;
          height: 100% !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          font-size: 1.1rem !important;
          font-weight: 800 !important;
          border-radius: 16px !important;
          background: #f8fafc !important;
          border: none !important;
        }
        .dark .react-calendar-mobile-fix .react-calendar__year-view .react-calendar__year-view__months .react-calendar__tile { 
          background: #1e293b !important; color: white !important; 
        }
      `}</style>
      
      {/* 📅 달력 섹션 */}
      <section 
        className={`w-full md:flex-1 pt-4 px-4 flex flex-col shrink-0 relative z-20 transition-all duration-300
          ${window.innerWidth < 768 ? (isPanelOpen ? 'pb-4' : 'pb-16') : 'pb-8'}
        `}
        style={getCalendarStyle()} 
      >
        <header className="py-2 mb-1 px-2 flex justify-between items-center shrink-0">
          <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">가계부 달력</h2>
          
          <button 
            onClick={handleGoToToday} 
            className="w-10 h-10 flex items-center justify-center bg-transparent border-2 border-gray-200 dark:border-slate-700 rounded-[12px] active:scale-95 transition-all z-10 relative text-gray-800 dark:text-white hover:border-blue-500 hover:text-blue-600 dark:hover:border-blue-400 dark:hover:text-blue-400"
            title="오늘 날짜로 이동"
          >
            <span className="font-extrabold text-lg leading-none mt-[2px]">
              {new Date().getDate()}
            </span>
          </button>
        </header>
        
        <div className="calendar-container flex-1 w-full rounded-3xl border border-gray-100 dark:border-slate-800 shadow-xl overflow-hidden bg-white dark:bg-slate-900 min-h-0 relative z-0">
          <div className="w-[300%] h-full flex flex-nowrap will-change-transform" style={getTrackStyle('calendar')}>
            {renderCalendar(prevMonthDate, 'prev')}
            {renderCalendar(currentMonthDate, 'curr')}
            {renderCalendar(nextMonthDate, 'next')}
          </div>
        </div>
      </section>

      {/* 🧾 우측 상세 내역 패널 */}
      <section 
        className="flex-1 w-full bg-gray-50 dark:bg-slate-900 z-30 flex flex-col min-h-0 md:static md:w-[420px] md:h-full md:border-l md:border-gray-200 dark:md:border-slate-800 md:flex-none rounded-t-[40px] md:rounded-none shadow-[0_-15px_30px_rgba(0,0,0,0.1)] md:shadow-none"
        style={getPanelStyle()}
      >
        <div className="drag-handle w-full h-6 shrink-0 cursor-row-resize md:hidden touch-none relative z-10" />

        <div className={`transaction-list flex-1 w-full overflow-hidden min-h-0 relative z-10 ${!isPanelOpen && dragAxis !== 'y' && window.innerWidth < 768 ? 'hidden' : 'block'}`}>
          <div className="w-[300%] h-full flex flex-nowrap will-change-transform" style={getTrackStyle('panel')}>
            {renderTransactionList(prevDayDate, 'prev')}
            {renderTransactionList(date, 'curr')}
            {renderTransactionList(nextDayDate, 'next')}
          </div>
        </div>

        <div className="hidden md:block p-6 bg-white dark:bg-slate-900 border-t dark:border-slate-800">
           <button onClick={(e) => openModalWithType(e, '지출')} className="w-full py-4 bg-blue-600 text-white rounded-3xl font-black hover:bg-blue-700 transition-all shadow-xl">
             내역 추가
           </button>
        </div>
      </section>

      {/* ➕ 플로팅 버튼 */}
      <button 
        onClick={(e) => openModalWithType(e, '지출')}
        className={`fixed right-6 w-14 h-14 bg-blue-600 text-white rounded-full flex md:hidden items-center justify-center shadow-2xl z-40 transition-all duration-300 transform
          ${!isPanelOpen ? 'bottom-[-100px] opacity-0 scale-50' : 'bottom-24 opacity-100 scale-100'}`}
      >
        <Plus size={28} strokeWidth={4} />
      </button>
    </div>
  );
}