import React from 'react';
import { X, Trash2 } from 'lucide-react'; // 💡 모던한 아이콘 사용

export default function TransactionModal({
  closeModal,
  isEdit,
  handleDelete,
  type,
  amount,
  handleAmountChange,
  category,
  setCategory,
  description,
  setDescription,
  handleSaveTransaction,
  incomeCategories,
  expenseCategories
}) {
  // 현재 타입(수입/지출)에 맞는 카테고리 목록 선택
  const categories = type === '수입' ? incomeCategories : expenseCategories;

  return (
    // 모달 배경 (어두운 반투명 + 블러 처리)
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      
      {/* 모달 본체 */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden ring-1 ring-gray-200 dark:ring-slate-800 flex flex-col transform transition-all">
        
        {/* 1. 헤더 영역 */}
        <div className="flex justify-between items-center p-6 border-b border-gray-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <h3 className="text-xl font-black text-gray-900 dark:text-white">
              {isEdit ? '내역 수정' : '새 내역 추가'}
            </h3>
            {/* 수입/지출 뱃지 */}
            <span className={`px-3 py-1 rounded-full text-xs font-bold ${
              type === '수입' 
                ? 'bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-400' 
                : 'bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400'
            }`}>
              {type}
            </span>
          </div>
          <button 
            onClick={closeModal}
            className="text-gray-400 hover:text-gray-700 dark:hover:text-slate-300 transition-colors p-1 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800"
          >
            <X size={22} />
          </button>
        </div>

        {/* 2. 입력 폼 영역 */}
        <div className="p-6 space-y-7">
          
          {/* 금액 입력 */}
          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-slate-300 mb-2">금액</label>
            <div className="relative">
              <input
                type="text"
                value={amount}
                onChange={handleAmountChange}
                onKeyDown={(e) => e.key === 'Enter' && handleSaveTransaction(false)} // 엔터 치면 바로 저장
                placeholder="0"
                autoFocus
                className="w-full text-right text-4xl font-black bg-transparent border-b-2 border-gray-200 dark:border-slate-700 focus:border-blue-500 dark:focus:border-blue-500 outline-none py-2 pr-8 text-gray-900 dark:text-white transition-colors"
              />
              <span className="absolute right-0 bottom-3 text-gray-400 font-bold text-lg">원</span>
            </div>
          </div>

          {/* 카테고리 선택 (버튼 형태) */}
          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-slate-300 mb-3">카테고리</label>
            <div className="flex flex-wrap gap-2">
              {categories.map(c => (
                <button
                  key={c}
                  onClick={() => setCategory(c)}
                  className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                    category === c 
                      ? (type === '수입' ? 'bg-red-500 text-white shadow-md' : 'bg-blue-500 text-white shadow-md')
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* 내용(메모) 입력 */}
          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-slate-300 mb-2">내용</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSaveTransaction(false)}
              placeholder="어디에 쓰셨나요?"
              className="w-full bg-gray-50 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-3 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
            />
          </div>
        </div>

        {/* 3. 하단 버튼 영역 */}
        <div className="p-5 bg-gray-50 dark:bg-slate-800/50 border-t border-gray-100 dark:border-slate-800 flex justify-between items-center">
          
          {/* 삭제 버튼 (수정 모드일 때만 보임) */}
          {isEdit ? (
            <button 
              onClick={handleDelete}
              className="px-3 py-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-colors flex items-center gap-2 font-bold text-sm"
            >
              <Trash2 size={18} />
              삭제
            </button>
          ) : (
            <div></div> // 빈 공간 유지용
          )}
          
          <div className="flex gap-2">
            <button 
              onClick={closeModal} 
              className="px-4 py-2.5 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-slate-300 rounded-xl font-bold hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors shadow-sm text-sm"
            >
              취소
            </button>
            
            {/* 💡 신규 추가일 때만 보이는 '저장 후 계속' 버튼 */}
            {!isEdit && (
              <button 
                onClick={() => handleSaveTransaction(true)} // true: 창 유지
                className="px-4 py-2.5 bg-slate-800 dark:bg-slate-700 text-white rounded-xl font-bold hover:bg-slate-700 dark:hover:bg-slate-600 transition-colors shadow-sm text-sm"
              >
                저장 후 계속
              </button>
            )}

            {/* 메인 저장/수정 버튼 (타입에 따라 색상 변경) */}
            <button 
              onClick={() => handleSaveTransaction(false)} // false: 창 닫기
              className={`px-6 py-2.5 text-white rounded-xl font-bold shadow-sm transition-colors text-sm ${
                type === '수입' ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-500 hover:bg-blue-600'
              }`}
            >
              {isEdit ? '수정 완료' : '저장'}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}