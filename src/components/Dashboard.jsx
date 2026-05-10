import React, { useState, useEffect } from 'react'; // 💡 useEffect 추가
import { supabase } from '../supabaseClient'; // 💡 supabase 불러오기
import { TrendingUp, TrendingDown, Minus, Edit2, Check, X } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts'; 

export default function Dashboard({ transactions }) {
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth();

  // 💡 상태 관리: 초기값은 일단 100만원으로 두되, DB에서 가져온 값으로 교체됨
  const [targetBudget, setTargetBudget] = useState(1000000);
  const [isEditingBudget, setIsEditingBudget] = useState(false);
  const [tempBudget, setTempBudget] = useState("1,000,000");

  // 💡 1. 컴포넌트 로드 시 해당 월의 예산 가져오기 (Read)
  useEffect(() => {
    fetchBudget();
  }, [currentMonth, currentYear]);

  const fetchBudget = async () => {
    const { data, error } = await supabase
      .from('budgets')
      .select('amount')
      .eq('month', currentMonth + 1)
      .eq('year', currentYear)
      .single(); // 한 건만 가져옴

    if (!error && data) {
      setTargetBudget(data.amount);
      setTempBudget(data.amount.toLocaleString());
    }
  };

  const handleBudgetChange = (e) => {
    const value = e.target.value.replace(/[^0-9]/g, "");
    setTempBudget(value ? Number(value).toLocaleString("ko-KR") : "");
  };

  // 💡 2. 예산 저장 로직 (복잡한 upsert 대신 직관적인 조회 후 업데이트 방식 적용)
  const saveBudget = async () => {
    const newBudgetAmount = Number(tempBudget.replace(/,/g, ''));
    if (newBudgetAmount <= 0) return;

    // ① 먼저 이번 달 예산 데이터가 이미 DB에 있는지 확인합니다.
    const { data: existingData } = await supabase
      .from('budgets')
      .select('id')
      .eq('month', currentMonth + 1)
      .eq('year', currentYear)
      .single();

    let saveError = null;

    if (existingData) {
      // ② 데이터가 이미 있다면 업데이트 (Update)
      const { error } = await supabase
        .from('budgets')
        .update({ amount: newBudgetAmount })
        .eq('id', existingData.id);
      saveError = error;
    } else {
      // ③ 데이터가 없다면 새로 추가 (Insert)
      const { error } = await supabase
        .from('budgets')
        .insert([{ month: currentMonth + 1, year: currentYear, amount: newBudgetAmount }]);
      saveError = error;
    }

    // 결과 처리
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

  // --- 기존 데이터 처리 로직 유지 ---
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
    <section className="flex-1 p-10 bg-gray-50 dark:bg-slate-950 overflow-y-auto transition-colors">
      <header className="mb-10">
        <h2 className="text-3xl font-black text-gray-900 dark:text-white">{currentMonth + 1}월 자산 리포트</h2>
        <p className="text-gray-500 dark:text-slate-400 mt-2 font-medium">이번 달 수입과 지출 현황입니다.</p>
      </header>

      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* 상단 요약 카드 */}
        <div className="grid grid-cols-2 gap-6">
          <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-800">
            <h3 className="text-red-500 font-bold mb-4 flex items-center gap-2">이번 달 총 수입</h3>
            <p className="text-4xl font-black text-gray-900 dark:text-white mb-4">{currentMonthIncome.toLocaleString()}원</p>
            <p className="text-sm font-bold text-red-500">
              지난달보다 {Math.abs(incomeDiff).toLocaleString()}원 {incomeDiff >= 0 ? '더 벌었어요 💰' : '적게 벌었어요 💧'}
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-800">
            <h3 className="text-blue-500 font-bold mb-4 flex items-center gap-2">이번 달 총 지출</h3>
            <p className="text-4xl font-black text-gray-900 dark:text-white mb-4">{currentMonthExpense.toLocaleString()}원</p>
            <p className="text-sm font-bold text-blue-500">
              지난달보다 {Math.abs(expenseDiff).toLocaleString()}원 {expenseDiff <= 0 ? '덜 썼어요 👏' : '더 썼어요 💸'}
            </p>
          </div>
        </div>

        {/* 예산 달성률 (Supabase 연동) */}
        <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-800">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">이번 달 예산 달성률 🎯</h3>
              {isEditingBudget ? (
                <div className="flex items-center gap-2 mt-2">
                  <input
                    type="text"
                    value={tempBudget}
                    onChange={handleBudgetChange}
                    onKeyDown={(e) => e.key === 'Enter' && saveBudget()}
                    autoFocus
                    className="w-48 p-1 text-lg font-bold border-b-2 border-blue-500 bg-transparent outline-none text-gray-800 dark:text-white"
                  />
                  <button onClick={saveBudget} className="p-1 text-blue-500 hover:bg-blue-50 rounded"><Check size={20}/></button>
                  <button onClick={cancelEdit} className="p-1 text-gray-400 hover:bg-gray-50 rounded"><X size={20}/></button>
                </div>
              ) : (
                <div onClick={() => setIsEditingBudget(true)} className="flex items-center gap-2 mt-1 cursor-pointer group">
                  <p className="text-sm text-gray-500 font-medium">목표 예산: {targetBudget.toLocaleString()}원</p>
                  <Edit2 size={14} className="text-gray-300 group-hover:text-blue-500 transition-colors" />
                </div>
              )}
            </div>
            <div className="text-right">
              <span className={`text-3xl font-black ${isOverBudget ? 'text-red-500' : 'text-blue-500'}`}>
                {budgetPercent.toFixed(1)}%
              </span>
            </div>
          </div>
          
          <div className="w-full bg-gray-100 dark:bg-slate-800 rounded-full h-5 overflow-hidden">
            <div
              className={`h-5 rounded-full transition-all duration-1000 ${
                budgetPercent < 50 ? 'bg-green-500' : budgetPercent < 80 ? 'bg-yellow-400' : 'bg-red-500'
              }`}
              style={{ width: `${Math.min(budgetPercent, 100)}%` }}
            ></div>
          </div>
          
          <p className={`text-sm font-bold mt-4 text-right ${isOverBudget ? 'text-red-500' : 'text-green-500'}`}>
            {isOverBudget 
              ? `예산을 ${Math.abs(targetBudget - currentMonthExpense).toLocaleString()}원 초과했어요! 🚨` 
              : `${Math.abs(targetBudget - currentMonthExpense).toLocaleString()}원 더 쓸 수 있어요! 😊`}
          </p>
        </div>

        {/* 원형 차트 & Top 5 랭킹 (기존 유지) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-800">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">카테고리별 지출 비율 📊</h3>
            {pieData.length > 0 ? (
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={70} outerRadius={110} paddingAngle={5} dataKey="value" stroke="none" animationDuration={800}>
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `${value.toLocaleString()}원`} contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontWeight: 'bold' }} />
                    <Legend verticalAlign="bottom" height={36} iconType="circle" />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="flex items-center justify-center h-72 text-gray-400 font-medium bg-gray-50 dark:bg-slate-950/50 rounded-2xl">지출 내역이 없습니다.</div>
            )}
          </div>

          <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-800">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">이번 달 과소비 Top 5 🏆</h3>
            <div className="space-y-4">
              {top5Expenses.length > 0 ? top5Expenses.map((t, i) => (
                <div key={t.id} className="flex justify-between items-center p-4 bg-gray-50 dark:bg-slate-950/50 rounded-2xl border border-gray-100 dark:border-slate-800/50 hover:border-gray-300 dark:hover:border-slate-600 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 flex items-center justify-center bg-white dark:bg-slate-800 rounded-full text-lg shadow-sm border border-gray-100 dark:border-slate-700">
                      {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : <span className="text-gray-500 font-black text-sm">{i + 1}</span>}
                    </div>
                    <div>
                      <p className="font-bold text-gray-800 dark:text-slate-200">{t.description}</p>
                      <p className="text-xs text-gray-500 font-medium mt-0.5">{t.category} • {t.date}</p>
                    </div>
                  </div>
                  <span className="font-bold text-blue-500 text-lg">-{t.amount.toLocaleString()}원</span>
                </div>
              )) : (
                <div className="flex items-center justify-center h-72 text-gray-400 font-medium bg-gray-50 dark:bg-slate-950/50 rounded-2xl">지출 내역이 없습니다.</div>
              )}
            </div>
          </div>
        </div>

        {/* 연간 추이 막대그래프 (기존 유지) */}
        <div className="bg-white dark:bg-slate-900 p-10 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-800">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-8">{currentYear}년 월별 추이</h3>
          <div className="h-80 w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" className="dark:opacity-20" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12, fontWeight: 600 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} tickFormatter={(val) => val === 0 ? '' : `${val / 10000}만`} />
                <Tooltip cursor={{ fill: 'rgba(229, 231, 235, 0.4)' }} formatter={(value) => `${value.toLocaleString()}원`} contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontWeight: 'bold' }} />
                <Legend verticalAlign="top" align="right" iconType="rect" wrapperStyle={{ paddingBottom: '20px' }} />
                <Bar name="수입" dataKey="수입" fill="#ef4444" radius={[4, 4, 0, 0]} barSize={12} />
                <Bar name="지출" dataKey="지출" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={12} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        
      </div>
    </section>
  );
}