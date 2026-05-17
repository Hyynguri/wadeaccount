import React, { useState, useEffect } from 'react';
import { Moon, Sun, Plus, Trash2, Repeat } from 'lucide-react';
import { supabase } from '../supabaseClient';

export default function SettingsView({ darkMode, setDarkMode }) {
  const [recurringList, setRecurringList] = useState([]);
  const [isAdding, setIsAdding] = useState(false);
  
  const [type, setType] = useState('지출');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('식비');
  const [description, setDescription] = useState('');
  const [dayOfMonth, setDayOfMonth] = useState('1');

  const incomeCategories = ['월급', '용돈', '부수입', '금융소득', '기타'];
  const expenseCategories = ['식비', '교통비', '쇼핑', '문화/여가', '생필품', '기타'];

  useEffect(() => {
    fetchRecurring();
  }, []);

  const fetchRecurring = async () => {
    const { data } = await supabase
      .from('recurring_transactions')
      .select('*')
      .order('day_of_month', { ascending: true });
    if (data) setRecurringList(data);
  };

  const handleAmountChange = (e) => {
    const value = e.target.value.replace(/[^0-9]/g, "");
    setAmount(value ? Number(value).toLocaleString("ko-KR") : "");
  };

  const handleAddRecurring = async () => {
    const numericAmount = Number(amount.replace(/,/g, ''));
    if (!numericAmount) return alert("금액을 입력하세요.");
    
    const day = parseInt(dayOfMonth);
    
    // 💡 다음 번 처리일 계산 로직
    const today = new Date();
    let nextProcessDate = new Date(today.getFullYear(), today.getMonth(), day);
    
    // 오늘 18일인데 설정일이 5일이라면 -> 다음 달 5일로 설정
    // 오늘 2일인데 설정일이 5일이라면 -> 이번 달 5일로 설정
    if (day <= today.getDate()) {
      nextProcessDate.setMonth(nextProcessDate.getMonth() + 1);
    }
    
    // YYYY-MM-DD 형식으로 변환
    const localString = `${nextProcessDate.getFullYear()}-${String(nextProcessDate.getMonth()+1).padStart(2,'0')}-${String(nextProcessDate.getDate()).padStart(2,'0')}`;

    const { data: { user } } = await supabase.auth.getUser();

    const { error } = await supabase.from('recurring_transactions').insert([{
      user_id: user.id,
      type,
      category,
      description: description || '정기 내역',
      amount: numericAmount,
      day_of_month: day,
      next_process_date: localString
    }]);

    if (!error) {
      setIsAdding(false);
      setAmount('');
      setDescription('');
      fetchRecurring();
    } else {
      alert("정기 내역 추가에 실패했습니다.");
    }
  };

  const handleDelete = async (id) => {
    const { error } = await supabase.from('recurring_transactions').delete().eq('id', id);
    if (!error) fetchRecurring();
  };

  return (
    <section className="flex-1 p-5 md:p-10 pb-28 md:pb-10 bg-gray-50 dark:bg-slate-950 overflow-y-auto transition-colors">
      <header className="mb-8 md:mb-10 px-1 md:px-0">
        <h2 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white">설정</h2>
        <p className="text-sm md:text-base text-gray-500 dark:text-slate-400 mt-2 font-medium">앱의 환경을 설정하고 관리하세요.</p>
      </header>

      <div className="max-w-3xl mx-auto space-y-6">
        
        {/* 1. 다크모드 설정 영역 */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gray-100 dark:bg-slate-800 rounded-2xl text-gray-600 dark:text-slate-300">
              {darkMode ? <Moon size={24} /> : <Sun size={24} />}
            </div>
            <div>
              <h4 className="font-bold text-gray-900 dark:text-white text-lg">다크 테마</h4>
              <p className="text-sm text-gray-500 dark:text-slate-400">어두운 화면으로 눈의 피로를 줄여줍니다.</p>
            </div>
          </div>
          
          <button 
            onClick={() => setDarkMode(!darkMode)}
            className={`w-14 h-8 rounded-full p-1 transition-colors duration-300 ${darkMode ? 'bg-blue-600' : 'bg-gray-300'}`}
          >
            <div className={`w-6 h-6 bg-white rounded-full shadow-sm transform transition-transform duration-300 ${darkMode ? 'translate-x-6' : 'translate-x-0'}`} />
          </button>
        </div>

        {/* 2. 정기 지출/수입 관리 영역 */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-800">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-50 dark:bg-blue-900/30 rounded-2xl text-blue-500">
                <Repeat size={24} />
              </div>
              <div>
                <h4 className="font-bold text-gray-900 dark:text-white text-lg">정기 내역 관리</h4>
                <p className="text-xs md:text-sm text-gray-500 dark:text-slate-400">매월 자동으로 기록될 수입/지출을 설정하세요.</p>
              </div>
            </div>
            <button 
              onClick={() => setIsAdding(!isAdding)} 
              className={`p-2 rounded-xl transition-colors ${isAdding ? 'bg-gray-200 text-gray-600 dark:bg-slate-700 dark:text-slate-300' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
            >
              {isAdding ? <Plus size={20} className="rotate-45 transform" /> : <Plus size={20} />}
            </button>
          </div>

          {/* 등록 폼 */}
          {isAdding && (
            <div className="mb-6 p-5 bg-gray-50 dark:bg-slate-950/50 rounded-2xl border border-gray-100 dark:border-slate-800 space-y-4">
              <div className="flex gap-2">
                <button onClick={() => { setType('지출'); setCategory('식비'); }} className={`flex-1 py-2 rounded-xl font-bold text-sm transition-all ${type === '지출' ? 'bg-blue-600 text-white' : 'bg-white dark:bg-slate-800 text-gray-500 dark:text-slate-400 border border-gray-200 dark:border-slate-700'}`}>지출</button>
                <button onClick={() => { setType('수입'); setCategory('월급'); }} className={`flex-1 py-2 rounded-xl font-bold text-sm transition-all ${type === '수입' ? 'bg-red-500 text-white' : 'bg-white dark:bg-slate-800 text-gray-500 dark:text-slate-400 border border-gray-200 dark:border-slate-700'}`}>수입</button>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 dark:text-slate-400 mb-1">매월 (일)</label>
                  <input type="number" min="1" max="31" value={dayOfMonth} onChange={(e) => setDayOfMonth(e.target.value)} className="w-full p-3 rounded-xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white font-bold outline-none focus:border-blue-500 transition-colors" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 dark:text-slate-400 mb-1">분류</label>
                  <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full p-3 rounded-xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white font-bold outline-none focus:border-blue-500 transition-colors">
                    {(type === '수입' ? incomeCategories : expenseCategories).map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 dark:text-slate-400 mb-1">내용</label>
                <input type="text" placeholder="예) 넷플릭스 구독, 관리비" value={description} onChange={(e) => setDescription(e.target.value)} className="w-full p-3 rounded-xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white font-bold outline-none focus:border-blue-500 transition-colors" />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 dark:text-slate-400 mb-1">금액</label>
                <div className="relative">
                  <input type="text" value={amount} onChange={handleAmountChange} placeholder="0" className="w-full p-3 pr-8 rounded-xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white font-black text-lg outline-none focus:border-blue-500 transition-colors" />
                  <span className="absolute right-4 top-1/2 transform -translate-y-1/2 font-bold text-gray-400">원</span>
                </div>
              </div>

              <button onClick={handleAddRecurring} className="w-full py-4 mt-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-black text-lg transition-all shadow-md">
                정기 내역 추가하기
              </button>
            </div>
          )}

          {/* 등록된 리스트 목록 */}
          <div className="space-y-3">
            {recurringList.map(item => (
              <div key={item.id} className="flex justify-between items-center p-4 bg-gray-50 dark:bg-slate-950/50 rounded-2xl border border-transparent dark:border-slate-800/50 hover:border-gray-200 dark:hover:border-slate-700 transition-all">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 flex flex-col items-center justify-center bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 shrink-0">
                    <span className="text-[10px] text-gray-400 font-bold mb-0.5">매월</span>
                    <span className="text-sm font-black text-gray-800 dark:text-slate-200 leading-none">{item.day_of_month}일</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-gray-900 dark:text-slate-100 text-sm md:text-base">{item.description}</span>
                      <span className="text-[10px] text-gray-400 font-bold tracking-tight bg-gray-200 dark:bg-slate-800 px-1.5 py-0.5 rounded-md">{item.category}</span>
                    </div>
                    <span className={`font-black text-sm md:text-base mt-0.5 block ${item.type === '수입' ? 'text-red-500' : 'text-blue-500'}`}>
                      {item.type === '수입' ? '+' : '-'}{item.amount.toLocaleString()}원
                    </span>
                  </div>
                </div>
                <button onClick={() => handleDelete(item.id)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors">
                  <Trash2 size={20} />
                </button>
              </div>
            ))}
            
            {recurringList.length === 0 && !isAdding && (
              <div className="flex flex-col items-center justify-center py-10 opacity-50">
                <p className="text-sm font-bold text-gray-400">등록된 정기 내역이 없습니다.</p>
              </div>
            )}
          </div>
        </div>
        
      </div>
    </section>
  );
}