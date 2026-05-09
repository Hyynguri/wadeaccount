import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css'; 
import { Home, Calendar as CalendarIcon, PieChart, Settings , X} 
from 'lucide-react';

function App() {
  const [date, setDate] = useState(new Date());
  const [isModalOpen, setIsModalOpen] = useState(false); 
  const [type, setType] = useState('지출'); 
  const [amount, setAmount] = useState(''); 

  
  const [category, setCategory] = useState('식비'); // 선택된 카테고리 상태
  
  // 수입/지출에 따른 카테고리 목록 리스트
  const expenseCategories = ['식비', '교통비', '쇼핑', '문화/여가', '생필품', '기타'];
  const incomeCategories = ['월급', '용돈', '부수입', '금융소득', '기타'];
  // 전체 가계부 내역을 저장하는 배열
  const [transactions, setTransactions] = useState(() => {
  const saved = localStorage.getItem("my-account-transactions");
  return saved ? JSON.parse(saved) : []; // 데이터가 있으면 불러오고, 없으면 빈 배열
  });


  const handleAmountChange = (e) => {
    const value = e.target.value;
    // 1. 입력된 값에서 숫자(0-9)가 아닌 문자는 모두 빈 문자열로 치환(제거)합니다.
    const numOnly = value.replace(/[^0-9]/g, "");
    
    // 2. 다 지워져서 빈 칸이 되면 상태도 비워줍니다.
    if (!numOnly) {
      setAmount("");
      return;
    }
    
    // 3. 숫자로 변환 후, toLocaleString을 사용해 콤마를 찍어줍니다.
    setAmount(Number(numOnly).toLocaleString("ko-KR"));
  };

  // 모달을 닫을 때 입력했던 내용 초기화
  const closeModal = () => {
    setIsModalOpen(false);
    setAmount('');
    setType('지출');
    setCategory('식비');
  };

  // 달력의 각 날짜 칸 안에 내역을 그려주는 함수
  const renderTileContent = ({ date, view }) => {
    if (view !== 'month') return null;

    // 전체 내역 중, 현재 달력 칸의 날짜와 일치하는 내역만 필터링
    const dayTransactions = transactions.filter(
     (t) => t.date === date.toLocaleDateString()
    );
    return (
      <div className="flex flex-col mt-1 space-y-1 w-full text-[11px] px-1">
        {dayTransactions.map((t) => (
         <div 
            key={t.id} 
            className={`truncate px-1 py-0.5 rounded-sm font-semibold ${
            t.type === '수입' ? 'bg-red-50 text-red-500' : 'bg-blue-50 text-blue-500'
            }`}
          > 
            {t.type === '수입' ? '+' : '-'}{t.amount.toLocaleString()}
          </div>
        ))}
      </div>
    );
  };
  useEffect(() => {
    localStorage.setItem("my-account-transactions", JSON.stringify(transactions));
  }, [transactions]); // transactions 배열이 변경될 때마다 실행
  return (
    // 1. 전체 화면: 좌/우 가로 배치 (flex-row)
    <div className="flex h-screen bg-gray-900 text-white">
      
      {/* 2. 왼쪽 사이드바 (스케치의 파란색 영역, 너비 20%) */}
      <aside className="w-1/5 bg-slate-800 p-6 hidden md:flex flex-col border-r border-slate-700">
        <h1 className="text-2xl font-bold mb-10 text-white">내 가계부</h1>
        <nav className="space-y-6">
          <a href="#" className="flex items-center space-x-3 text-slate-400 hover:text-white font-medium">
            <Home size={20} /> <span>대시보드</span>
          </a>
          <a href="#" className="flex items-center space-x-3 text-blue-400 font-medium">
            <CalendarIcon size={20} /> <span>달력</span>
          </a>
          <a href="#" className="flex items-center space-x-3 text-slate-400 hover:text-white font-medium">
            <PieChart size={20} /> <span>통계</span>
          </a>
          <a href="#" className="flex items-center space-x-3 text-slate-400 hover:text-white font-medium">
            <Settings size={20} /> <span>설정</span>
          </a>
        </nav>
      </aside>

      {/* 3. 오른쪽 메인 영역 (너비 80%, 세로로 분할하기 위해 flex-col 적용) */}
      <main className="w-4/5 flex flex-col h-screen overflow-hidden text-gray-800">
        
        {/* 3-1. 우측 상단: 달력 영역 (스케치의 주황색 영역 느낌, 높이 비율 약 60%) */}
        {/* overflow-y-auto를 없애고 flex flex-col을 추가하여 내부가 꽉 차게 만듭니다 */}
        <div className="flex-[6] bg-orange-50 p-6 flex flex-col border-b border-gray-300">
          <header className="mb-4 flex justify-between items-center">
            <div className="flex items-center space-x-4">
            <h2 className="text-2xl font-bold text-gray-800">가계부 달력</h2>

            {/* '오늘'로 돌아가는 버튼 추가 */}
              <button 
                onClick={() => setDate(new Date())} 
                className="px-4 py-1.5 bg-white border border-gray-300 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-100 shadow-sm transition-colors"
              >
                Today
              </button>
            </div>


          </header>
          
          {/* 달력을 감싸는 흰색 박스 */}
          <div className="bg-white p-4 rounded-xl shadow-sm flex-1 flex flex-col">
             <Calendar 
               onChange={setDate} 
               value={date} 
               onClickDay={() => setIsModalOpen(true)}
               className="w-full h-full border-none font-sans" 
               // 1. 일요일부터 시작하도록 설정
               calendarType="gregory" 
               // 2. "1일", "2일" 대신 숫자만 나오게 포맷팅
               formatDay={(locale, date) => date.toLocaleString("en", {day: "numeric"})} 
               // 3. 요일을 "SUN", "MON" 등 영문 짧은 포맷으로 변경
               formatShortWeekday={(locale, date) => ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'][date.getDay()]}
               // 4. 일요일(0)인 경우 텍스트를 빨간색으로 만드는 클래스 추가
               tileClassName={({ date, view }) => 
                 view === 'month' && date.getDay() === 0 ? 'text-red-500' : ''
               }
               /* === 추가된 속성: 10년 단위 이동 버튼 숨기기 === */
               prev2Label={null} // << 버튼 숨김
               next2Label={null} // >> 버튼 숨김

               tileContent={renderTileContent}
             />
          </div>
        </div>

        {/* 3-2. 우측 하단: 상세 내역 확인 부분 (스케치의 보라색 영역 느낌, 높이 비율 약 40%) */}
        <div className="flex-[4] bg-purple-50 p-6 overflow-y-auto">
          <h3 className="text-xl font-bold mb-4 text-purple-900 border-b border-purple-200 pb-2">
            {date.toLocaleDateString()} 상세 내역
          </h3>
          
          {/* 내역 리스트가 들어갈 자리 */}
          <div className="bg-white p-6 rounded-xl shadow-sm h-full flex flex-col items-center justify-center text-gray-400 border border-purple-100">
             <p>선택하신 날짜의 수입/지출 내역이 여기에 표시됩니다.</p>
          </div>
        </div>

      </main>

      {/* === 💡 3. 모달(Modal) 창 === */}
      {/* isModalOpen이 true일 때만 화면에 그려집니다 (조건부 렌더링) */}
      {isModalOpen && (
        <div className="absolute inset-0 bg-black/50 z-50 flex items-center justify-center backdrop-blur-sm">
          <div className="bg-white text-gray-800 w-96 rounded-2xl shadow-2xl p-6 relative animate-in fade-in zoom-in duration-200">
            
            {/* 닫기 버튼 */}
            <button onClick={closeModal} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
              <X size={24} />
            </button>

            {/* 모달 제목 (선택한 날짜 표시) */}
            <h2 className="text-xl font-bold mb-6">
              {date.getMonth() + 1}월 {date.getDate()}일 내역 추가
            </h2>

            {/* 수입/지출 선택 토글 */}
            {/* 1. 수입/지출 선택 토글의 onClick 부분 수정 */}
            <div className="flex bg-gray-100 p-1 rounded-lg mb-6">
              <button
                // 👇 지출로 바꿀 때 카테고리를 '식비'로 초기화
                onClick={() => { setType('지출'); setCategory(expenseCategories[0]); }} 
                className={`flex-1 py-2 rounded-md text-sm font-bold transition-colors ${
                  type === '지출' ? 'bg-white text-red-500 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                지출
              </button>
              <button
                // 👇 수입으로 바꿀 때 카테고리를 '월급'으로 초기화
                onClick={() => { setType('수입'); setCategory(incomeCategories[0]); }} 
                className={`flex-1 py-2 rounded-md text-sm font-bold transition-colors ${
                  type === '수입' ? 'bg-white text-blue-500 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                수입
              </button>
            </div>

          {/* 👇 === 여기서부터 추가 (카테고리 선택 영역) === 👇 */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-600 mb-2">카테고리</label>
              <div className="flex flex-wrap gap-2">
                {/* 현재 'type'이 지출이면 지출 리스트, 수입이면 수입 리스트를 보여줌 */}
                {(type === '지출' ? expenseCategories : incomeCategories).map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setCategory(cat)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                      category === cat
                        ? (type === '지출' ? 'bg-red-500 text-white' : 'bg-blue-500 text-white')
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
            {/* 👆 === 여기까지 추가 === 👆 */}

            {/* 금액 입력 창 */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-600 mb-2">금액</label>
              <div className="relative">
                <input
                  type="text"
                  value={amount}
                  onChange={handleAmountChange}
                  placeholder="0"
                  className="w-full text-right text-2xl font-bold border-b-2 border-gray-300 focus:border-orange-500 outline-none pb-1 pr-6 transition-colors"
                />
                <span className="absolute right-0 bottom-2 text-gray-500 font-bold">원</span>
              </div>
            </div>

            {/* 2. 저장 버튼 알림 수정 */}
            <button 
              onClick={() => {
                // 1. 입력된 금액에서 콤마(,)를 제거하고 순수 숫자로 변환
                const numericAmount = Number(amount.replace(/,/g, ''));
                
                // 2. 방어 로직: 금액이 없거나 0원이면 저장 불가
                if (!numericAmount || numericAmount <= 0) {
                  alert("금액을 정확히 입력해 주세요.");
                  return;
                }

                // 3. 새로운 내역 객체 생성
                const newTransaction = {
                  id: Date.now(), // 고유 ID (현재 시간 사용)
                  date: date.toLocaleDateString(), // 선택된 날짜
                  type: type, // '수입' 또는 '지출'
                  category: category, // 선택된 카테고리
                  amount: numericAmount, // 숫자형 금액
                };

                // 4. 기존 배열에 새 내역을 추가하여 상태 업데이트
                setTransactions([...transactions, newTransaction]);
                
                // 5. 모달 닫기
                closeModal();
              }}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-xl transition-colors"
            >
              Save
            </button>
            
          </div>
        </div>
      )}
    </div>
  );
}

export default App;