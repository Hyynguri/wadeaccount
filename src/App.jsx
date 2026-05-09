import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import CalendarView from './components/CalendarView';
import TransactionModal from './components/TransactionModal';
import SettingsView from './components/SettingsView'; // 💡 추가
import 'react-calendar/dist/Calendar.css'; 
import './App.css';

export default function App() {
  const [view, setView] = useState('calendar');
  
  // 💡 다크 모드 상태 (초기값은 로컬스토리지에서 가져옴)
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('wade-dark-mode') === 'true';
  });

  const [date, setDate] = useState(new Date());
  const [activeStartDate, setActiveStartDate] = useState(new Date());
  const [isModalOpen, setIsModalOpen] = useState(false); 
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [type, setType] = useState('지출'); 
  const [amount, setAmount] = useState(''); 
  const [category, setCategory] = useState('식비');
  const [description, setDescription] = useState('');
  
  const [transactions, setTransactions] = useState(() => {
    const saved = localStorage.getItem("my-account-transactions");
    return saved ? JSON.parse(saved) : []; 
  });

  // 💡 다크 모드 변경 시 클래스 및 로컬스토리지 적용
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('wade-dark-mode', darkMode);
  }, [darkMode]);

  // (기타 핸들러 함수들 - 이전과 동일)
  useEffect(() => {
    localStorage.setItem("my-account-transactions", JSON.stringify(transactions));
  }, [transactions]); 

  const handleAmountChange = (e) => {
    const value = e.target.value.replace(/[^0-9]/g, "");
    setAmount(value ? Number(value).toLocaleString("ko-KR") : "");
  };

  const handleSaveTransaction = () => {
    const numericAmount = Number(amount.replace(/,/g, ''));
    if (!numericAmount) return alert("금액을 입력하세요.");
    if (editingTransaction) {
      setTransactions(transactions.map(t => t.id === editingTransaction.id ? { ...t, type, category, description, amount: numericAmount } : t));
    } else {
      setTransactions([...transactions, { id: Date.now(), date: date.toLocaleDateString(), type, category, description: description || '내역 없음', amount: numericAmount }]);
    }
    closeModal();
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingTransaction(null);
    setAmount('');
    setDescription('');
  };

  return (
    // 💡 다크 모드 클래스 적용을 위해 dark 클래스 조건부 부여
    <div className={`flex h-screen font-sans relative transition-colors ${darkMode ? 'dark bg-slate-950 text-white' : 'bg-white text-gray-800'}`}>
      
      <Sidebar view={view} setView={setView} />

      <main className="flex-1 flex overflow-hidden">
        {view === 'calendar' && (
          <CalendarView 
            date={date} setDate={setDate}
            activeStartDate={activeStartDate} setActiveStartDate={setActiveStartDate}
            transactions={transactions}
            handleGoToToday={() => { setDate(new Date()); setActiveStartDate(new Date()); }}
            openModalWithType={(e, t) => { e.stopPropagation(); setType(t); setCategory(t === '수입' ? '월급' : '식비'); setIsModalOpen(true); }}
            openEditModal={(t) => { setEditingTransaction(t); setType(t.type); setCategory(t.category); setDescription(t.description); setAmount(t.amount.toLocaleString()); setIsModalOpen(true); }}
          />
        )}
        {view === 'dashboard' && <Dashboard transactions={transactions} />}
        
        {/* 💡 설정 뷰 연결 */}
        {view === 'settings' && <SettingsView darkMode={darkMode} setDarkMode={setDarkMode} />}
      </main>

      {isModalOpen && (
        <TransactionModal 
          closeModal={closeModal} isEdit={!!editingTransaction}
          handleDelete={() => { setTransactions(transactions.filter(t => t.id !== editingTransaction.id)); closeModal(); }}
          type={type} amount={amount} handleAmountChange={handleAmountChange}
          category={category} setCategory={setCategory}
          description={description} setDescription={setDescription}
          handleSaveTransaction={handleSaveTransaction}
          incomeCategories={['월급', '용돈', '부수입', '금융소득', '기타']}
          expenseCategories={['식비', '교통비', '쇼핑', '문화/여가', '생필품', '기타']}
        />
      )}
    </div>
  );
} 