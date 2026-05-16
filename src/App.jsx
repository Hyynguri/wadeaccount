import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import CalendarView from './components/CalendarView';
import TransactionModal from './components/TransactionModal';
import SettingsView from './components/SettingsView';
import Login from './components/Login';
import { CalendarDays, PieChart, Settings } from 'lucide-react'; // 💡 하단 탭용 아이콘 추가
import 'react-calendar/dist/Calendar.css';
import './App.css';

export default function App() {
  const [session, setSession] = useState(null);
  const [view, setView] = useState('calendar');
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('wade-dark-mode') === 'true';
  });

  const [transactions, setTransactions] = useState([]);
  const [date, setDate] = useState(new Date());
  const [activeStartDate, setActiveStartDate] = useState(new Date());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  
  const [type, setType] = useState('지출');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('식비');
  const [description, setDescription] = useState('');

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) console.error("세션 가져오기 에러:", error);
      setSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (session) fetchTransactions();
  }, [session]);

  const fetchTransactions = async () => {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .order('id', { ascending: true });
    
    if (error) console.error('데이터 로드 실패:', error);
    else setTransactions(data || []);
  };

  useEffect(() => {
    if (darkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
    localStorage.setItem('wade-dark-mode', darkMode);
  }, [darkMode]);

  const handleAmountChange = (e) => {
    const value = e.target.value.replace(/[^0-9]/g, "");
    setAmount(value ? Number(value).toLocaleString("ko-KR") : "");
  };

  const handleSaveTransaction = async (keepOpen = false) => {
    const numericAmount = Number(amount.replace(/,/g, ''));
    if (!numericAmount) return alert("금액을 입력하세요.");

    const transactionData = {
      date: date.toLocaleDateString(),
      type,
      category,
      description: description || '내역 없음',
      amount: numericAmount,
      user_id: session.user.id
    };

    if (editingTransaction) {
      const { data, error } = await supabase
        .from('transactions')
        .update(transactionData)
        .eq('id', editingTransaction.id)
        .select();
      if (!error && data) setTransactions(transactions.map(t => t.id === editingTransaction.id ? data[0] : t));
    } else {
      const { data, error } = await supabase
        .from('transactions')
        .insert([transactionData])
        .select();
      if (!error && data) setTransactions([...transactions, data[0]]);
    }

    if (keepOpen) {
      setAmount('');
      setDescription('');
    } else {
      closeModal();
    }
  };

  const handleDeleteTransaction = async () => {
    if (!editingTransaction) return;
    const { error } = await supabase.from('transactions').delete().eq('id', editingTransaction.id);
    if (!error) {
      setTransactions(transactions.filter(t => t.id !== editingTransaction.id));
      closeModal();
    } else alert("삭제 중 오류가 발생했습니다.");
  };

  const handleLogout = async () => await supabase.auth.signOut();

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingTransaction(null);
    setAmount('');
    setDescription('');
  };

  if (!session) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-white text-gray-800">
        <Login />
      </div>
    );
  }

  return (
    // 💡 모바일에서는 하단 탭 공간(pb-16)을 확보하고, 데스크탑에서는 0(md:pb-0)으로 설정
    <div className={`flex h-screen font-sans relative transition-colors overflow-hidden pb-16 md:pb-0 ${darkMode ? 'dark bg-slate-950 text-white' : 'bg-white text-gray-800'}`}>
      
      {/* 💡 데스크탑용 사이드바 (모바일에서는 숨김: hidden md:flex) */}
      <div className="hidden md:flex md:shrink-0">
        <Sidebar view={view} setView={setView} handleLogout={handleLogout} />
      </div>

      <main className="flex-1 w-full h-full flex overflow-hidden">
        {view === 'calendar' && (
          <CalendarView 
            date={date} setDate={setDate}
            activeStartDate={activeStartDate} setActiveStartDate={setActiveStartDate}
            transactions={transactions}
            handleGoToToday={() => { setDate(new Date()); setActiveStartDate(new Date()); }}
            openModalWithType={(e, t) => { 
              if(e) e.stopPropagation(); 
              setType(t); 
              setCategory(t === '수입' ? '월급' : '식비'); 
              setIsModalOpen(true); 
            }}
            openEditModal={(t) => { 
              setEditingTransaction(t); 
              setType(t.type); 
              setCategory(t.category); 
              setDescription(t.description); 
              setAmount(t.amount.toLocaleString()); 
              setIsModalOpen(true); 
            }}
          />
        )}
        {view === 'dashboard' && <Dashboard transactions={transactions} />}
        {view === 'settings' && <SettingsView darkMode={darkMode} setDarkMode={setDarkMode} />}
      </main>

      {/* 💡 모바일용 하단 탭 (데스크탑에서는 숨김: md:hidden) */}
      <div className="fixed bottom-0 left-0 w-full h-16 bg-white dark:bg-slate-900 border-t border-gray-200 dark:border-slate-800 flex justify-around items-center md:hidden z-50 transition-colors">
        <button onClick={() => setView('calendar')} className={`flex flex-col items-center flex-1 ${view === 'calendar' ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400 dark:text-gray-500'}`}>
          <CalendarDays className="w-6 h-6 mb-1" />
          <span className="text-[10px] font-medium">달력</span>
        </button>
        <button onClick={() => setView('dashboard')} className={`flex flex-col items-center flex-1 ${view === 'dashboard' ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400 dark:text-gray-500'}`}>
          <PieChart className="w-6 h-6 mb-1" />
          <span className="text-[10px] font-medium">통계</span>
        </button>
        <button onClick={() => setView('settings')} className={`flex flex-col items-center flex-1 ${view === 'settings' ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400 dark:text-gray-500'}`}>
          <Settings className="w-6 h-6 mb-1" />
          <span className="text-[10px] font-medium">설정</span>
        </button>
      </div>

      {isModalOpen && (
        <TransactionModal 
          closeModal={closeModal} 
          isEdit={!!editingTransaction}
          handleDelete={handleDeleteTransaction}
          type={type} 
          setType={setType}
          amount={amount} 
          handleAmountChange={handleAmountChange}
          category={category} 
          setCategory={setCategory}
          description={description} 
          setDescription={setDescription}
          handleSaveTransaction={handleSaveTransaction}
          incomeCategories={['월급', '용돈', '부수입', '금융소득', '기타']}
          expenseCategories={['식비', '교통비', '쇼핑', '문화/여가', '생필품', '기타']}
        />
      )}
    </div>
  );
}
