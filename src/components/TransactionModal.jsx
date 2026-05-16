import React from 'react';
import { X, Trash2 } from 'lucide-react';

export default function TransactionModal({
  closeModal, isEdit, handleDelete,
  type, setType, // 💡 수입/지출 상태 및 변경 함수
  amount, handleAmountChange,
  category, setCategory,
  description, setDescription,
  handleSaveTransaction,
  incomeCategories, expenseCategories
}) {
  const currentCategories = type === '수입' ? incomeCategories : expenseCategories;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-end md:items-center justify-center z-50 p-0 md:p-4 animate-fade-in">
      <div className="bg-white dark:bg-slate-900 w-full md:max-w-md rounded-t-[32px] md:rounded-3xl p-6 shadow-2xl flex flex-col max-h-[90vh] md:max-h-none overflow-y-auto animate-slide-up">
        
        {/* 헤더 */}
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
            {isEdit ? '내역 수정하기' : '새로운 내역 추가'}
          </h3>
          <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
            <X size={24} />
          </button>
        </div>

        {/* 💡 수입 / 지출 탭 버튼 */}
        <div className="flex bg-gray-100 dark:bg-slate-800 p-1 rounded-xl mb-6">
          <button
            type="button"
            onClick={() => {
              setType('수입');
              setCategory(incomeCategories[0]); 
            }}
            className={`flex-1 py-2.5 text-center text-sm font-black rounded-lg transition-all ${
              type === '수입'
                ? 'bg-red-500 text-white shadow-md'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'
            }`}
          >
            수입
          </button>
          <button
            type="button"
            onClick={() => {
              setType('지출');
              setCategory(expenseCategories[0]); 
            }}
            className={`flex-1 py-2.5 text-center text-sm font-black rounded-lg transition-all ${
              type === '지출'
                ? 'bg-blue-500 text-white shadow-md'
                : 'text-gray-400 dark:text-gray-400 hover:text-gray-700'
            }`}
          >
            지출
          </button>
        </div>

        {/* 금액 입력 */}
        <div className="mb-4">
          <label className="block text-xs font-bold text-gray-400 dark:text-gray-500 uppercase mb-2">금액</label>
          <input
            type="text"
            value={amount}
            onChange={handleAmountChange}
            placeholder="0"
            className="w-full px-4 py-3 border border-gray-200 dark:border-slate-700 rounded-xl bg-transparent font-extrabold text-xl text-gray-900 dark:text-white focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* 내용 입력 */}
        <div className="mb-4">
          <label className="block text-xs font-bold text-gray-400 dark:text-gray-500 uppercase mb-2">내용</label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="어디에 쓰셨나요?"
            className="w-full px-4 py-3 border border-gray-200 dark:border-slate-700 rounded-xl bg-transparent text-sm text-gray-900 dark:text-white focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* 카테고리 선택 */}
        <div className="mb-6">
          <label className="block text-xs font-bold text-gray-400 dark:text-gray-500 uppercase mb-2">카테고리</label>
          <div className="grid grid-cols-3 gap-2">
            {currentCategories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategory(cat)}
                className={`py-2.5 text-xs font-bold rounded-xl border transition-all ${
                  category === cat
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 font-black'
                    : 'border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* 하단 버튼 제어 */}
        <div className="flex gap-2 mt-auto">
          {isEdit && (
            <button
              type="button"
              onClick={handleDelete}
              className="px-4 py-3 bg-red-50 dark:bg-red-950/20 text-red-500 rounded-xl hover:bg-red-100 transition-colors flex items-center justify-center"
            >
              <Trash2 size={20} />
            </button>
          )}
          <button
            type="button"
            onClick={() => handleSaveTransaction(false)}
            className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors shadow-lg"
          >
            {isEdit ? '수정 완료' : '저장하기'}
          </button>
        </div>
      </div>
    </div>
  );
}