import React from 'react';

export default function Dashboard({ transactions }) {
  const currentYear = new Date().getFullYear();
  const monthlyData = Array.from({ length: 12 }, (_, i) => ({
    month: i + 1,
    income: 0,
    expense: 0
  }));

  transactions.forEach(t => {
    const tDate = new Date(t.date);
    if (tDate.getFullYear() === currentYear) {
      const month = tDate.getMonth();
      if (t.type === '수입') monthlyData[month].income += t.amount;
      else monthlyData[month].expense += t.amount;
    }
  });

  const maxVal = Math.max(...monthlyData.map(d => Math.max(d.income, d.expense)), 100000);

  return (
    <section className="flex-1 p-10 bg-gray-50 overflow-y-auto">
      <header className="mb-10 text-center">
        <h2 className="text-3xl font-black text-gray-900">{currentYear}년 자산 리포트</h2>
        <p className="text-gray-500 mt-2 font-medium">월별 수입과 지출 추이를 확인하세요.</p>
      </header>

      <div className="max-w-5xl mx-auto bg-white p-10 rounded-3xl shadow-xl border border-gray-100">
        <div className="flex items-end justify-between h-80 w-full pt-10 border-b border-gray-200 gap-2">
          {monthlyData.map((d) => (
            <div key={d.month} className="flex-1 flex flex-col items-center group relative h-full justify-end">
              <div className="flex items-end gap-1 w-full justify-center h-full">
                <div 
                  style={{ height: `${(d.income / maxVal) * 100}%` }} 
                  className="w-4 bg-red-400 rounded-t-lg transition-all duration-500 group-hover:bg-red-500"
                  title={`수입: ${d.income.toLocaleString()}원`}
                />
                <div 
                  style={{ height: `${(d.expense / maxVal) * 100}%` }} 
                  className="w-4 bg-blue-400 rounded-t-lg transition-all duration-500 group-hover:bg-blue-500"
                  title={`지출: ${d.expense.toLocaleString()}원`}
                />
              </div>
              <span className="mt-4 text-sm font-bold text-gray-400">{d.month}월</span>
            </div>
          ))}
        </div>
        <div className="mt-10 flex justify-center space-x-10 text-sm font-bold">
          <div className="flex items-center space-x-2"><div className="w-3 h-3 bg-red-400 rounded-full" /> <span>총 수입</span></div>
          <div className="flex items-center space-x-2"><div className="w-3 h-3 bg-blue-400 rounded-full" /> <span>총 지출</span></div>
        </div>
      </div>
    </section>
  );
}