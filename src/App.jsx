import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import CalendarView from './components/CalendarView';
import TransactionModal from './components/TransactionModal';
import 'react-calendar/dist/Calendar.css'; 

export default function App() {
  const [view, setView] = useState('calendar');
  const [date, setDate] = useState(new Date());
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

  useEffect(() => {
    localStorage.setItem("my-account-transactions", JSON.stringify(transactions));
  }, [transactions]); 

  const handleAmountChange = (e) => {
    const value = e.target.value.replace(/[^0-9]/g, "");
    setAmount(value ? Number(value).toLocaleString("ko-KR") : "");
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

  const handleGoToToday = () => {
    const today = new Date();
    setDate(today);
    setActiveStartDate(today);
  };

  const handleSaveTransaction = () => {
    const numericAmount = Number(amount.replace(/,/g, ''));
    if (!numericAmount) return alert("금액을 입력하세요.");
    setTransactions([...transactions, { id: Date.now(), date: date.toLocaleDateString(), type, category, amount: numericAmount }]);
    closeModal();
  };

  return (
    <div className="flex h-screen bg-white text-gray-800 font-sans relative">
      
      {/* 분리된 Sidebar 컴포넌트 */}
      <Sidebar view={view} setView={setView} />

      <main className="flex-1 flex overflow-hidden">
        {view === 'calendar' ? (
          /* 분리된 달력 및 내역 컴포넌트 */
          <CalendarView 
            date={date} setDate={setDate}
            activeStartDate={activeStartDate} setActiveStartDate={setActiveStartDate}
            transactions={transactions}
            handleGoToToday={handleGoToToday}
            openModalWithType={openModalWithType}
          />
        ) : (
          /* 분리된 대시보드 컴포넌트 */
          <Dashboard transactions={transactions} />
        )}
      </main>

      {/* 분리된 모달 컴포넌트 */}
      {isModalOpen && (
        <TransactionModal 
          closeModal={closeModal} type={type}
          amount={amount} handleAmountChange={handleAmountChange}
          category={category} setCategory={setCategory}
          handleSaveTransaction={handleSaveTransaction}
          incomeCategories={incomeCategories} expenseCategories={expenseCategories}
        />
      )}
    </div>
  );
}