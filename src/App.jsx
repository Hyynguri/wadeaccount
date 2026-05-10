import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import CalendarView from './components/CalendarView';
import TransactionModal from './components/TransactionModal';
import SettingsView from './components/SettingsView';
import Login from './components/Login'; // 💡 로그인 컴포넌트 추가
import 'react-calendar/dist/Calendar.css';
import './App.css';

export default function App() {
  // 1. 인증 및 세션 상태
  const [session, setSession] = useState(null);

  // 2. UI 및 환경 상태
  const [view, setView] = useState('calendar');
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('wade-dark-mode') === 'true';
  });

  // 3. 데이터 및 모달 상태
  const [transactions, setTransactions] = useState([]);
  const [date, setDate] = useState(new Date());
  const [activeStartDate, setActiveStartDate] = useState(new Date());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  
  // 4. 입력 필드 상태
  const [type, setType] = useState('지출');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('식비');
  const [description, setDescription] = useState('');

  // 💡 [Auth] 세션 감시 및 유지
useEffect(() => {
    console.log("👀 앱 실행됨: 세션 확인 시작...");
    
    // 현재 세션 확인
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      console.log("초기 세션 상태:", session);
      if (error) console.error("세션 가져오기 에러:", error);
      setSession(session);
    });

    // 로그인/로그아웃 상태 변경 감지
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("🔥 인증 이벤트 발생:", event, session);
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // 💡 [Data] 로그인 시 데이터 불러오기
  useEffect(() => {
    if (session) {
      fetchTransactions();
    }
  }, [session]);

  const fetchTransactions = async () => {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .order('id', { ascending: true });
    
    if (error) {
      console.error('데이터 로드 실패:', error);
    } else {
      setTransactions(data || []);
    }
  };

  // 💡 [UI] 다크 모드 적용
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('wade-dark-mode', darkMode);
  }, [darkMode]);

  const handleAmountChange = (e) => {
    const value = e.target.value.replace(/[^0-9]/g, "");
    setAmount(value ? Number(value).toLocaleString("ko-KR") : "");
  };

  // 💡 [CRUD] 저장 및 수정 (keepOpen 매개변수 추가)
  const handleSaveTransaction = async (keepOpen = false) => {
    const numericAmount = Number(amount.replace(/,/g, ''));
    if (!numericAmount) return alert("금액을 입력하세요.");

    const transactionData = {
      date: date.toLocaleDateString(),
      type,
      category,
      description: description || '내역 없음',
      amount: numericAmount,
      user_id: session.user.id // 💡 로그인 유저 ID 저장 (RLS용)
    };

    if (editingTransaction) {
      // 수정 (Update)
      const { data, error } = await supabase
        .from('transactions')
        .update(transactionData)
        .eq('id', editingTransaction.id)
        .select();

      if (!error && data) {
        setTransactions(transactions.map(t => t.id === editingTransaction.id ? data[0] : t));
      }
    } else {
      // 신규 추가 (Create)
      const { data, error } = await supabase
        .from('transactions')
        .insert([transactionData])
        .select();

      if (!error && data) {
        setTransactions([...transactions, data[0]]);
      }
    }

    if (keepOpen) {
      // 💡 "저장 후 계속" 일 때: 금액과 내용만 초기화
      setAmount('');
      setDescription('');
    } else {
      closeModal();
    }
  };

  const handleDeleteTransaction = async () => {
    if (!editingTransaction) return;

    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', editingTransaction.id);

    if (!error) {
      setTransactions(transactions.filter(t => t.id !== editingTransaction.id));
      closeModal();
    } else {
      alert("삭제 중 오류가 발생했습니다.");
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingTransaction(null);
    setAmount('');
    setDescription('');
  };

  // 🚪 [Gatekeeper] 로그인이 안 되어 있으면 로그인 화면만 보여줌
  if (!session) {
    return <Login />;
  }

  return (
    <div className={`flex h-screen font-sans relative transition-colors ${darkMode ? 'dark bg-slate-950 text-white' : 'bg-white text-gray-800'}`}>
      
      {/* 로그아웃 기능을 사이드바 등에 전달할 수 있음 */}
      <Sidebar view={view} setView={setView} handleLogout={handleLogout} />

      <main className="flex-1 flex overflow-hidden">
        {view === 'calendar' && (
          <CalendarView 
            date={date} setDate={setDate}
            activeStartDate={activeStartDate} setActiveStartDate={setActiveStartDate}
            transactions={transactions}
            handleGoToToday={() => { setDate(new Date()); setActiveStartDate(new Date()); }}
            openModalWithType={(e, t) => { 
              e.stopPropagation(); 
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

      {isModalOpen && (
        <TransactionModal 
          closeModal={closeModal} 
          isEdit={!!editingTransaction}
          handleDelete={handleDeleteTransaction}
          type={type} 
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