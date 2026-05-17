import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import CalendarView from './components/CalendarView';
import TransactionModal from './components/TransactionModal';
import SettingsView from './components/SettingsView';
import Login from './components/Login';
import { CalendarDays, PieChart, Settings } from 'lucide-react'; 
import { encryptData, decryptData } from './utils/encryption';
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

  // 💡 [핵심 로직] 접속 시 정기 지출이 있는지 확인하고 자동 기록하는 함수
  const checkAndProcessRecurring = async () => {
    const { data: recurring, error } = await supabase
      .from('recurring_transactions')
      .select('*');

    if (error || !recurring || recurring.length === 0) return;

    const today = new Date();
    today.setHours(0, 0, 0, 0); // 시간은 무시하고 날짜만 비교

    const toInsert = [];
    const toUpdate = [];

    recurring.forEach(rt => {
      let processDate = new Date(rt.next_process_date);
      processDate.setHours(0, 0, 0, 0);
      let hasUpdates = false;

      // 기록해야 할 날짜가 오늘보다 작거나 같으면 무한 반복 (앱을 오랫동안 안 켰을 때 밀린 달도 한 번에 처리)
      while (processDate <= today) {
        toInsert.push({
          date: processDate.toLocaleDateString(), 
          type: rt.type,
          category: rt.category,
          description: rt.description,
          amount: rt.amount,
          user_id: session.user.id
        });

        // 다음 달 처리 날짜 계산
        let nextMonth = processDate.getMonth() + 1;
        let year = processDate.getFullYear();
        if (nextMonth > 11) {
          nextMonth = 0;
          year += 1;
        }
        processDate = new Date(year, nextMonth, rt.day_of_month);
        hasUpdates = true;
      }

      if (hasUpdates) {
        // DB에 저장할 날짜 텍스트 (YYYY-MM-DD) 포맷
        const localString = `${processDate.getFullYear()}-${String(processDate.getMonth()+1).padStart(2,'0')}-${String(processDate.getDate()).padStart(2,'0')}`;
        toUpdate.push({ id: rt.id, next_process_date: localString });
      }
    });

    // 1. 내역 추가
    if (toInsert.length > 0) {
      await supabase.from('transactions').insert(toInsert);
    }
    // 2. 정기 내역의 '다음 처리 날짜' 업데이트
    for (const item of toUpdate) {
      await supabase.from('recurring_transactions').update({ next_process_date: item.next_process_date }).eq('id', item.id);
    }
  };

  useEffect(() => {
    if (session) {
      // 💡 정기 지출 검사를 먼저 수행한 뒤, 전체 내역(transactions)을 불러옵니다.
      checkAndProcessRecurring().then(() => fetchTransactions());
    }
  }, [session]);

  const fetchTransactions = async () => {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .order('id', { ascending: true });

    if (error) {
      console.error('데이터 로드 실패:', error);
    } else if (data) {
      // 💡 여기서 암호문을 원래 글자로 풉니다.
      const decryptedData = data.map(t => ({
        ...t,
        category: decryptData(t.category),
        description: decryptData(t.description)
      }));
      setTransactions(decryptedData);
    }
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

    // 💡 여기서 내용과 카테고리를 암호화합니다!
    const transactionData = {
      date: date.toLocaleDateString(),
      type, // '수입', '지출' 자체는 큰 개인정보가 아니므로 놔둠
      category: encryptData(category),
      description: encryptData(description || '내역 없음'),
      amount: numericAmount, // 금액은 숫자 통계를 위해 남겨둠
      user_id: session.user.id
    };

    if (editingTransaction) {
      const { data, error } = await supabase
        .from('transactions')
        .update(transactionData)
        .eq('id', editingTransaction.id)
        .select();
      
      // 화면에 반영할 때는 다시 복호화된 상태로 넣어줍니다.
      if (!error && data) {
        const updated = {
          ...data[0],
          category: decryptData(data[0].category),
          description: decryptData(data[0].description)
        };
        setTransactions(transactions.map(t => t.id === editingTransaction.id ? updated : t));
      }
    } else {
      const { data, error } = await supabase
        .from('transactions')
        .insert([transactionData])
        .select();
      
      if (!error && data) {
        const inserted = {
          ...data[0],
          category: decryptData(data[0].category),
          description: decryptData(data[0].description)
        };
        setTransactions([...transactions, inserted]);
      }
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
    <div className={`flex h-screen font-sans relative transition-colors overflow-hidden pb-16 md:pb-0 ${darkMode ? 'dark bg-slate-950 text-white' : 'bg-white text-gray-800'}`}>
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