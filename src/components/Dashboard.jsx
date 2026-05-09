import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export default function Dashboard({ transactions }) {
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth();

  const monthlyData = Array.from({ length: 12 }, (_, i) => ({
    month: i + 1, income: 0, expense: 0
  }));

  let currentMonthIncome = 0; let currentMonthExpense = 0;
  let lastMonthIncome = 0; let lastMonthExpense = 0;

  transactions.forEach(t => {
    const tDate = new Date(t.date);
    const tYear = tDate.getFullYear();
    const tMonth = tDate.getMonth();
    if (tYear === currentYear) {
      if (t.type === '수입') monthlyData[tMonth].income += t.amount;
      else monthlyData[tMonth].expense += t.amount;
    }
    if (tYear === currentYear && tMonth === currentMonth) {
      if (t.type === '수입') currentMonthIncome += t.amount;
      else currentMonthExpense += t.amount;
    } else if ((currentMonth === 0 && tYear === currentYear - 1 && tMonth === 11) || (currentMonth > 0 && tYear === currentYear && tMonth === currentMonth - 1)) {
      if (t.type === '수입') lastMonthIncome += t.amount;
      else lastMonthExpense += t.amount;
    }
  });

  const maxVal = Math.max(...monthlyData.map(d => Math.max(d.income, d.expense)), 100000);
  const expenseDiff = currentMonthExpense - lastMonthExpense;

  return (
    <section className="flex-1 p-10 bg-gray-50 dark:bg-slate-950 overflow-y-auto transition-colors">
      <header className="mb-10">
        <h2 className="text-3xl font-black text-gray-900 dark:text-white">{currentMonth + 1}월 자산 리포트</h2>
        <p className="text-gray-500 dark:text-slate-400 mt-2 font-medium">이번 달 수입과 지출 현황입니다.</p>
      </header>

      <div className="max-w-5xl mx-auto space-y-8">
        <div className="grid grid-cols-2 gap-6">
          {/* 수입 카드 */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-800">
            <h3 className="text-gray-400 font-bold mb-4 flex items-center gap-2">이번 달 총 수입</h3>
            <p className="text-4xl font-black text-gray-900 dark:text-white mb-4">{currentMonthIncome.toLocaleString()}원</p>
          </div>
          {/* 지출 카드 */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-800">
            <h3 className="text-gray-400 font-bold mb-4 flex items-center gap-2">이번 달 총 지출</h3>
            <p className="text-4xl font-black text-gray-900 dark:text-white mb-4">{currentMonthExpense.toLocaleString()}원</p>
            <p className={`text-sm font-bold ${expenseDiff > 0 ? 'text-red-500' : 'text-blue-500'}`}>
              지난달보다 {Math.abs(expenseDiff).toLocaleString()}원 {expenseDiff > 0 ? '더 썼어요 💸' : '덜 썼어요 👏'}
            </p>
          </div>
        </div>

        {/* 연간 추이 막대그래프 */}
        <div className="bg-white dark:bg-slate-900 p-10 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-800">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-8">{currentYear}년 월별 추이</h3>
          <div className="flex items-end justify-between h-72 w-full pt-10 border-b border-gray-100 dark:border-slate-800 gap-2">
            {monthlyData.map((d) => (
              <div key={d.month} className="flex-1 flex flex-col items-center justify-end h-full">
                <div className="flex items-end gap-1">
                  <div style={{ height: `${(d.income / maxVal) * 100}%` }} className="w-3 bg-red-400 dark:bg-red-500/80 rounded-t-sm" />
                  <div style={{ height: `${(d.expense / maxVal) * 100}%` }} className="w-3 bg-blue-400 dark:bg-blue-500/80 rounded-t-sm" />
                </div>
                <span className={`mt-4 text-xs font-bold ${d.month === currentMonth + 1 ? 'text-red-500' : 'text-gray-400'}`}>{d.month}월</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}