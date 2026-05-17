import React, { useState, useEffect } from 'react'; 
import { supabase } from '../supabaseClient'; 
import { TrendingUp, TrendingDown, Minus, Edit2, Check, X } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts'; 

export default function Dashboard({ transactions }) {
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth();

  const [targetBudget, setTargetBudget] = useState(1000000);
  const [isEditingBudget, setIsEditingBudget] = useState(false);
  const [tempBudget, setTempBudget] = useState("1,000,000");

  useEffect(() => {
    fetchBudget();
  }, [currentMonth, currentYear]);

  const fetchBudget = async () => {
    const { data, error } = await supabase
      .from('budgets')
      .select('amount')
      .eq('month', currentMonth + 1)
      .eq('year', currentYear)
      .single(); 

    if (!error && data) {
      setTargetBudget(data.amount);
      setTempBudget(data.amount.toLocaleString());
    }
  };

  const handleBudgetChange = (e) => {
    const value = e.target.value.replace(/[^0-9]/g, "");
    setTempBudget(value ? Number(value).toLocaleString("ko-KR") : "");
  };

  const saveBudget = async () => {
    const newBudgetAmount = Number(tempBudget.replace(/,/g, ''));
    if (newBudgetAmount <= 0) return;

    const { data: existingData } = await supabase
      .from('budgets')
      .select('id')
      .eq('month', currentMonth + 1)
      .eq('year', currentYear)
      .single();

    let saveError = null;

    if (existingData) {
      const { error } = await supabase
        .from('budgets')
        .update({ amount: newBudgetAmount })
        .eq('id', existingData.id);
      saveError = error;
    } else {
      const { error } = await supabase
        .from('budgets')
        .insert([{ month: currentMonth + 1, year: currentYear, amount: newBudgetAmount }]);
      saveError = error;
    }

    if (!saveError) {
      setTargetBudget(newBudgetAmount);
      setIsEditingBudget(false);
    } else {
      console.error("예산 저장 실패:", saveError);
      alert("예산 저장에 실패했습니다. F12 콘솔창의 에러 메시지를 확인해주세요!");
    }
  };

  const cancelEdit = () => {
    setTempBudget(targetBudget.toLocaleString());
    setIsEditingBudget(false);
  };

  const monthlyData = Array.from({ length: 12 }, (_, i) => ({
    name: `${i + 1}월`, 수입: 0, 지출: 0
  }));

  let currentMonthIncome = 0; let currentMonthExpense = 0;
  let lastMonthIncome = 0; let lastMonthExpense = 0;

  transactions.forEach(t => {
    const tDate = new Date(t.date);
    const tYear = tDate.getFullYear();
    const tMonth = tDate.getMonth();
    
    if (tYear === currentYear) {
      if (t.type === '수입') monthlyData[tMonth].수입 += t.amount;
      else monthlyData[tMonth].지출 += t.amount;
    }
    
    if (tYear === currentYear && tMonth === currentMonth) {
      if (t.type === '수입') currentMonthIncome += t.amount;
      else currentMonthExpense += t.amount;
    } else if (
      (currentMonth === 0 && tYear === currentYear - 1 && tMonth === 11) || 
      (currentMonth > 0 && tYear === currentYear && tMonth === currentMonth - 1)
    ) {
      if (t.type === '수입') lastMonthIncome += t.amount;
      else lastMonthExpense += t.amount;
    }
  });

  const incomeDiff = currentMonthIncome - lastMonthIncome;
  const expenseDiff = currentMonthExpense - lastMonthExpense;

  const budgetPercent = (currentMonthExpense / targetBudget) * 100;
  const isOverBudget = currentMonthExpense > targetBudget;

  const expensesByCategory = transactions
    .filter(t => {
      const d = new Date(t.date);
      return t.type === '지출' && d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    })
    .reduce((acc, curr) => {
      acc[curr.category] = (acc[curr.category] || 0) + curr.amount;
      return acc;
    }, {});

  const pieData = Object.keys(expensesByCategory)
    .map(key => ({ name: key, value: expensesByCategory[key] }))
    .sort((a, b) => b.value - a.value);

  const top5Expenses = transactions
    .filter(t => {
      const d = new Date(t.date);
      return t.type === '지출' && d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    })
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 5);

  const COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#6b7280'];

  return (
    /* 💡 1. 모바일 환경을 위한 여백 조정: 모바일은 p-5, 하단 탭바를 위해 pb-24 확보 / 데스크탑은 p-10 */
    <section className="flex-1 p-5 md:p-10 pb-28 md:pb-10 bg-gray-50 dark:bg-slate-950 overflow-y-auto overflow-x-hidden transition-colors relative">
      
      {/* 가로 스와이프 시 스크롤바 숨김 처리 CSS */}
      <style>{`
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      <header className="mb-6 md:mb-10 px-1 md:px-0">
        <h2 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white">{currentMonth + 1}월 자산 리포트</h2>
        <p className="text-sm md:text-base text-gray-500 dark:text-slate-400 mt-2 font-medium">이번 달 수입과 지출 현황입니다.</p>
      </header>

      <div className="max-w-5xl mx-auto space-y-6 md:space-y-8">
        
        {/* 💡 2. 수입/지출 카드: 모바일에서는 넷플릭스처럼 가로 스와이프(Carousel), 데스크탑에서는 Grid */}
        <div className="flex md:grid md:grid-cols-2 gap-4 md:gap-6 overflow-x-auto snap-x snap-mandatory hide-scrollbar -mx-5 px-5 md:mx-0 md:px-0 pb-2 md:pb-0">
          <div className="min-w-[85%] md:min-w-0 snap-center shrink-0 bg-white dark:bg-slate-900 p-6 md:p-8 rounded-[28px] shadow-sm border border-gray-100 dark:border-slate-800">
            <h3 className="text-red-500 font-bold mb-3 md:mb-4 flex items-center gap-2 text-sm md:text-base">이번 달 총 수입</h3>
            <p className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white mb-3 md:mb-4 tracking-tight">{currentMonthIncome.toLocaleString()}원</p>
            <p className="text-xs md:text-sm font-bold text-red-500">
              지난달보다 {Math.abs(incomeDiff).toLocaleString()}원 {incomeDiff >= 0 ? '더 벌었어요 💰' : '적게 벌었어요 💧'}
            </p>
          </div>

          <div className="min-w-[85%] md:min-w-0 snap-center shrink-0 bg-white dark:bg-slate-900 p-6 md:p-8 rounded-[28px] shadow-sm border border-gray-100 dark:border-slate-800">
            <h3 className="text-blue-500 font-bold mb-3 md:mb-4 flex items-center gap-2 text-sm md:text-base">이번 달 총 지출</h3>
            <p className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white mb-3 md:mb-4 tracking-tight">{currentMonthExpense.toLocaleString()}원</p>
            <p className="text-xs md:text-sm font-bold text-blue-500">
              지난달보다 {Math.abs(expenseDiff).toLocaleString()}원 {expenseDiff <= 0 ? '덜 썼어요 👏' : '더 썼어요 💸'}
            </p>
          </div>
        </div>

        {/* 💡 3. 예산 달성률 카드: 터치 친화적인 입력 폼으로 변경 */}
        <div className="bg-white dark:bg-slate-900 p-6 md:p-8 rounded-[28px] shadow-sm border border-gray-100 dark:border-slate-800">
          <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-6 md:mb-4 gap-4 md:gap-0">
            <div>
              <h3 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white">이번 달 예산 달성률 🎯</h3>
              {isEditingBudget ? (
                <div className="flex items-center gap-2 mt-3 bg-gray-50 dark:bg-slate-800 p-2 pl-4 rounded-2xl w-full md:w-auto shadow-inner border border-gray-100 dark:border-slate-700">
                  <input
                    type="text"
                    value={tempBudget}
                    onChange={handleBudgetChange}
                    onKeyDown={(e) => e.key === 'Enter' && saveBudget()}
                    autoFocus
                    className="flex-1 md:w-40 text-lg font-black bg-transparent outline-none text-gray-800 dark:text-white"
                  />
                  <button onClick={saveBudget} className="p-2 md:p-1 text-white bg-blue-500 hover:bg-blue-600 rounded-xl shadow-sm"><Check size={20}/></button>
                  <button onClick={cancelEdit} className="p-2 md:p-1 text-gray-500 bg-gray-200 dark:bg-slate-700 hover:bg-gray-300 rounded-xl"><X size={20}/></button>
                </div>
              ) : (
                <div onClick={() => setIsEditingBudget(true)} className="flex items-center gap-2 mt-2 cursor-pointer group p-2 -ml-2 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors w-fit">
                  <p className="text-sm text-gray-500 font-bold">목표 예산: {targetBudget.toLocaleString()}원</p>
                  <Edit2 size={16} className="text-gray-400 group-hover:text-blue-500 transition-colors" />
                </div>
              )}
            </div>
            <div className="text-right flex-shrink-0 self-end md:self-auto">
              <span className={`text-4xl md:text-3xl font-black ${isOverBudget ? 'text-red-500' : 'text-blue-500'}`}>
                {budgetPercent.toFixed(1)}%
              </span>
            </div>
          </div>
          
          <div className="w-full bg-gray-100 dark:bg-slate-800 rounded-full h-4 overflow-hidden relative">
            <div
              className={`h-full rounded-full transition-all duration-1000 ${
                budgetPercent < 50 ? 'bg-green-500' : budgetPercent < 80 ? 'bg-yellow-400' : 'bg-red-500'
              }`}
              style={{ width: `${Math.min(budgetPercent, 100)}%` }}
            ></div>
          </div>
          
          <p className={`text-xs md:text-sm font-bold mt-4 text-right ${isOverBudget ? 'text-red-500' : 'text-green-500'}`}>
            {isOverBudget 
              ? `예산을 ${Math.abs(targetBudget - currentMonthExpense).toLocaleString()}원 초과했어요! 🚨` 
              : `${Math.abs(targetBudget - currentMonthExpense).toLocaleString()}원 더 쓸 수 있어요! 😊`}
          </p>
        </div>

        {/* 원형 차트 & Top 5 랭킹 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-slate-900 p-6 md:p-8 rounded-[28px] shadow-sm border border-gray-100 dark:border-slate-800">
            <h3 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white mb-4 md:mb-6">카테고리별 지출 비율 📊</h3>
            {pieData.length > 0 ? (
              <div className="h-64 md:h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius="60%" outerRadius="90%" paddingAngle={5} dataKey="value" stroke="none" animationDuration={800}>
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `${value.toLocaleString()}원`} contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontWeight: 'bold' }} />
                    <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px', fontWeight: 'bold' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="flex items-center justify-center h-64 md:h-72 text-sm text-gray-400 font-bold bg-gray-50 dark:bg-slate-950/50 rounded-2xl">지출 내역이 없습니다.</div>
            )}
          </div>

          <div className="bg-white dark:bg-slate-900 p-6 md:p-8 rounded-[28px] shadow-sm border border-gray-100 dark:border-slate-800">
            <h3 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white mb-4 md:mb-6">이번 달 과소비 Top 5 🏆</h3>
            <div className="space-y-3">
              {top5Expenses.length > 0 ? top5Expenses.map((t, i) => (
                <div key={t.id} className="flex justify-between items-center p-3 md:p-4 bg-gray-50 dark:bg-slate-950/50 rounded-2xl border border-transparent dark:border-slate-800/50">
                  <div className="flex items-center gap-3 md:gap-4">
                    <div className="w-10 h-10 flex items-center justify-center bg-white dark:bg-slate-800 rounded-full text-lg shadow-sm font-black border border-gray-100 dark:border-slate-700 shrink-0">
                      {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : <span className="text-gray-400 text-sm">{i + 1}</span>}
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-gray-800 dark:text-slate-200 text-sm md:text-base truncate">{t.description}</p>
                      <p className="text-[10px] md:text-xs text-gray-400 font-bold mt-0.5">{t.category}</p>
                    </div>
                  </div>
                  <span className="font-black text-blue-500 text-sm md:text-lg shrink-0 pl-2">-{t.amount.toLocaleString()}원</span>
                </div>
              )) : (
                <div className="flex items-center justify-center h-48 md:h-72 text-sm text-gray-400 font-bold bg-gray-50 dark:bg-slate-950/50 rounded-2xl">지출 내역이 없습니다.</div>
              )}
            </div>
          </div>
        </div>

        {/* 연간 추이 막대그래프 */}
        <div className="bg-white dark:bg-slate-900 p-6 md:p-10 rounded-[28px] shadow-sm border border-gray-100 dark:border-slate-800">
          <h3 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white mb-6 md:mb-8">{currentYear}년 월별 추이</h3>
          <div className="h-64 md:h-80 w-full mt-4 -ml-2 md:ml-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" className="dark:opacity-20" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 10, fontWeight: 700 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 10, fontWeight: 600 }} tickFormatter={(val) => val === 0 ? '' : `${val / 10000}만`} />
                <Tooltip cursor={{ fill: 'rgba(229, 231, 235, 0.4)' }} formatter={(value) => `${value.toLocaleString()}원`} contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontWeight: 'bold' }} />
                <Legend verticalAlign="top" align="right" iconType="rect" wrapperStyle={{ paddingBottom: '20px', fontSize: '12px', fontWeight: 'bold' }} />
                <Bar name="수입" dataKey="수입" fill="#ef4444" radius={[4, 4, 0, 0]} barSize={10} />
                <Bar name="지출" dataKey="지출" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={10} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        
      </div>
    </section>
  );
}