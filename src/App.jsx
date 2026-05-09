import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css'; 
import { Home, Calendar as CalendarIcon, PieChart, Settings, X, Plus, Minus } from 'lucide-react';

function App() {
  const [date, setDate] = useState(new Date());
  // 💡 달력 화면 이동을 제어하기 위한 상태 추가
  const [activeStartDate, setActiveStartDate] = useState(new Date());
  
  const [isModalOpen, setIsModalOpen] = useState(false); 
  const [type, setType] = useState('지출'); 
  const [amount, setAmount] = useState(''); 
  const [category, setCategory] = useState('식비');
  
  const expenseCategories = ['식비', '교통비', '쇼핑', '문화/여가', '생필품', '기타'];
  const incomeCategories = ['월급', '용돈', '부수입', '금융소득', '기타'];
  
  const [transactions, setTransactions] = useState(() => {
    const saved = localStorage.getItem("my-account-transactions");
    return saved ? JSON.parse(saved) : []; 
  });

  const handleAmountChange = (e) => {
    const value = e.target.value;
    const numOnly = value.replace(/[^0-9]/g, "");
    if (!numOnly) { setAmount(""); return; }
    setAmount(Number(numOnly).toLocaleString("ko-KR"));
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setAmount('');
  };

  const openModalWithType = (e, selectedType) => {
    e.stopPropagation(); 
    setType(selectedType);
    setCategory(selectedType === '수입' ? incomeCategories[0] : expenseCategories[0]);
    setIsModalOpen(true);
  };

  // 💡 Today 버튼 클릭 핸들러: 날짜 선택 + 달력 화면 이동
  const handleGoToToday = () => {
    const today = new Date();
    setDate(today);
    setActiveStartDate(today); // 달력 화면을 오늘 날짜가 있는 달로 강제 이동
  };

  const renderTileContent = ({ date: tileDate, view }) => {
    if (view !== 'month') return null;

    const isSelected = tileDate.toLocaleDateString() === date.toLocaleDateString();
    const dayTransactions = transactions.filter(
     (t) => t.date === tileDate.toLocaleDateString()
    );

    const totalIncome = dayTransactions
      .filter(t => t.type === '수입')
      .reduce((sum, t) => sum + t.amount, 0);
    const totalExpense = dayTransactions
      .filter(t => t.type === '지출')
      .reduce((sum, t) => sum + t.amount, 0);

    return (
      <div className="w-full h-full relative text-[10px]">
        {isSelected ? (
          // 💡 버튼 크기를 w-8 h-8로, 아이콘을 size 18로 소폭 축소
          <div className="absolute inset-0 flex items-center justify-center gap-2 bg-white/90 z-10 animate-in fade-in duration-200">
            <button
              onClick={(e) => openModalWithType(e, '수입')}
              className="w-8 h-8 rounded-full bg-red-500 text-white flex items-center justify-center shadow-md hover:bg-red-600 transition-all hover:scale-110"
            >
              <Plus size={18} strokeWidth={4} />
            </button>
            <button
              onClick={(e) => openModalWithType(e, '지출')}
              className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center shadow-md hover:bg-blue-600 transition-all hover:scale-110"
            >
              <Minus size={18} strokeWidth={4} />
            </button>
          </div>
        ) : (
          <div className="absolute top-2 right-2 flex flex-col items-end space-y-0.5 pointer-events-none">
            {totalIncome > 0 && (
              <span className="text-red-500 font-black text-[12px]">
                {totalIncome.toLocaleString()}
              </span>
            )}
            {totalExpense > 0 && (
              <span className="text-blue-500 font-black text-[12px]">
                {totalExpense.toLocaleString()}
              </span>
            )}
          </div>
        )}
      </div>
    );
  };

  useEffect(() => {
    localStorage.setItem("my-account-transactions", JSON.stringify(transactions));
  }, [transactions]); 

  const selectedDateTransactions = transactions.filter(
    (t) => t.date === date.toLocaleDateString()
  );
  const selectedIncomes = selectedDateTransactions.filter(t => t.type === '수입');
  const selectedExpenses = selectedDateTransactions.filter(t => t.type === '지출');
  
  const dayTotalIncome = selectedIncomes.reduce((sum, t) => sum + t.amount, 0);
  const dayTotalExpense = selectedExpenses.reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="flex h-screen bg-white text-gray-800">
      <aside className="w-[15%] bg-gray-50 p-6 flex flex-col border-r border-gray-200">
        <h1 className="text-xl font-bold mb-10 text-gray-900">내 가계부</h1>
        <nav className="space-y-6">
          <div className="flex items-center space-x-3 text-gray-500 hover:text-red-500 font-medium cursor-pointer"><Home size={20} /> <span>대시보드</span></div>
          <div className="flex items-center space-x-3 text-red-500 font-bold cursor-pointer"><CalendarIcon size={20} /> <span>달력</span></div>
          <div className="flex items-center space-x-3 text-gray-500 hover:text-red-500 font-medium cursor-pointer"><PieChart size={20} /> <span>통계</span></div>
        </nav>
      </aside>

      <section className="w-[60%] flex flex-col p-6 border-r border-gray-200">
        <header className="mb-6 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">가계부 달력</h2>
          {/* 💡 Today 버튼 클릭 핸들러 변경 */}
          <button onClick={handleGoToToday} className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-semibold hover:bg-gray-50 shadow-sm transition-colors">Today</button>
        </header>
        
        <div className="flex-1 bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100">
           <Calendar 
             onChange={setDate} 
             value={date} 
             // 💡 달력 화면 이동을 제어하는 prop들 추가
             activeStartDate={activeStartDate}
             onActiveStartDateChange={({ activeStartDate }) => setActiveStartDate(activeStartDate)}
             className="w-full h-full border-none" 
             calendarType="gregory" 
             formatDay={(locale, date) => date.toLocaleString("en", {day: "numeric"})}
             tileContent={renderTileContent}
           />
        </div>
      </section>

      <section className="w-[25%] bg-gray-50 flex flex-col p-6 overflow-hidden">
        <h3 className="text-xl font-bold mb-8 text-gray-900 border-b border-gray-200 pb-3">
          {date.toLocaleDateString()}
        </h3>
        
        <div className="flex-1 overflow-y-auto space-y-8 pr-2">
          <div>
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-lg font-black text-red-500">수입</h4>
              <span className="text-sm font-bold bg-red-50 text-red-600 px-3 py-1 rounded-full">
                {dayTotalIncome.toLocaleString()}원
              </span>
            </div>
            {selectedIncomes.length > 0 ? (
              <ul className="space-y-2">
                {selectedIncomes.map((t) => (
                  <li key={t.id} className="bg-white p-3 rounded-xl shadow-sm border border-red-100 flex justify-between items-center">
                    <span className="text-sm font-bold text-gray-700">{t.category}</span>
                    <span className="font-bold text-red-500">+{t.amount.toLocaleString()}원</span>
                  </li>
                ))}
              </ul>
            ) : ( <p className="text-xs text-gray-400 text-center py-4">수입 내역이 없습니다.</p> )}
          </div>

          <div>
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-lg font-black text-blue-500">지출</h4>
              <span className="text-sm font-bold bg-blue-50 text-blue-600 px-3 py-1 rounded-full">
                {dayTotalExpense.toLocaleString()}원
              </span>
            </div>
            {selectedExpenses.length > 0 ? (
              <ul className="space-y-2">
                {selectedExpenses.map((t) => (
                  <li key={t.id} className="bg-white p-3 rounded-xl shadow-sm border border-blue-100 flex justify-between items-center">
                    <span className="text-sm font-bold text-gray-700">{t.category}</span>
                    <span className="font-bold text-blue-500">-{t.amount.toLocaleString()}원</span>
                  </li>
                ))}
              </ul>
            ) : ( <p className="text-xs text-gray-400 text-center py-4">지출 내역이 없습니다.</p> )}
          </div>
        </div>
      </section>

      {isModalOpen && (
        <div className="absolute inset-0 bg-black/40 z-50 flex items-center justify-center backdrop-blur-sm">
          <div className="bg-white text-gray-800 w-96 rounded-2xl shadow-2xl p-8 relative animate-in fade-in zoom-in duration-200">
            <button onClick={closeModal} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"><X size={24} /></button>

            <h2 className={`text-2xl font-extrabold mb-8 ${type === '수입' ? 'text-red-500' : 'text-blue-500'}`}>
              {type} 내역 추가
            </h2>

            <div className="mb-6">
              <label className="block text-sm font-bold text-gray-500 mb-3">카테고리</label>
              <div className="flex flex-wrap gap-2">
                {(type === '수입' ? incomeCategories : expenseCategories).map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setCategory(cat)}
                    className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                      category === cat
                        ? (type === '수입' ? 'bg-red-500 text-white' : 'bg-blue-500 text-white')
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-8">
              <label className="block text-sm font-bold text-gray-500 mb-3">금액</label>
              <div className="relative border-b-2 border-gray-200 focus-within:border-gray-400 transition-all">
                <input
                  type="text"
                  value={amount}
                  onChange={handleAmountChange}
                  placeholder="0"
                  className="w-full text-right text-3xl font-black outline-none pb-2 pr-8 bg-transparent"
                  autoFocus
                />
                <span className="absolute right-0 bottom-3 text-xl font-bold text-gray-400">원</span>
              </div>
            </div>

            <button 
              onClick={() => {
                const numericAmount = Number(amount.replace(/,/g, ''));
                if (!numericAmount) return alert("금액을 입력하세요.");
                setTransactions([...transactions, { id: Date.now(), date: date.toLocaleDateString(), type, category, amount: numericAmount }]);
                closeModal();
              }}
              className={`w-full text-white font-black py-4 rounded-xl text-lg shadow-lg transition-all active:scale-95 ${
                type === '수입' ? 'bg-red-500 hover:bg-red-600 shadow-red-100' : 'bg-blue-500 hover:bg-blue-600 shadow-blue-100'
              }`}
            >
              {type} 저장하기
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;