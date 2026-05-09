import React from 'react';
import { X, Trash2 } from 'lucide-react';

export default function TransactionModal({
  closeModal, isEdit, handleDelete, // 💡 Props 추가
  type, amount, handleAmountChange, 
  category, setCategory, 
  description, setDescription, 
  handleSaveTransaction, 
  incomeCategories, expenseCategories
}) {
  return (
    <div className="absolute inset-0 bg-black/40 z-50 flex items-center justify-center backdrop-blur-sm">
      <div className="bg-white text-gray-800 w-96 rounded-2xl shadow-2xl p-8 relative animate-in fade-in zoom-in duration-200">
        <button onClick={closeModal} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"><X size={24} /></button>
        
        {/* 💡 제목을 모드에 따라 변경 */}
        <h2 className={`text-2xl font-extrabold mb-8 ${type === '수입' ? 'text-red-500' : 'text-blue-500'}`}>
          {type} 내역 {isEdit ? '수정' : '추가'}
        </h2>
        
        <div className="mb-6">
          <label className="block text-sm font-bold text-gray-500 mb-3">내용</label>
          <input 
            type="text" value={description} onChange={(e) => setDescription(e.target.value)} 
            placeholder="어디에 쓰셨나요?" 
            className="w-full border-b-2 border-gray-200 focus:border-gray-400 outline-none pb-2 text-lg font-medium bg-transparent"
          />
        </div>

        <div className="mb-6">
          <label className="block text-sm font-bold text-gray-500 mb-3">카테고리</label>
          <div className="flex flex-wrap gap-2">
            {(type === '수입' ? incomeCategories : expenseCategories).map((cat) => (
              <button 
                key={cat} onClick={() => setCategory(cat)} 
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                  category === cat ? (type === '수입' ? 'bg-red-500 text-white' : 'bg-blue-500 text-white') : 'bg-gray-100 text-gray-600 hover:bg-gray-100'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
        
        <div className="mb-8">
          <label className="block text-sm font-bold text-gray-500 mb-3">금액</label>
          <div className="relative border-b-2 border-gray-200 focus-within:border-gray-400 transition-all">
            <input 
              type="text" value={amount} onChange={handleAmountChange} 
              placeholder="0" className="w-full text-right text-3xl font-black outline-none pb-2 pr-8 bg-transparent"
            />
            <span className="absolute right-0 bottom-3 text-xl font-bold text-gray-400">원</span>
          </div>
        </div>
        
        <div className="flex gap-3">
          {/* 💡 수정 모드일 때만 삭제 버튼 노출 */}
          {isEdit && (
            <button 
              onClick={handleDelete}
              className="flex-1 bg-gray-100 hover:bg-red-50 text-gray-400 hover:text-red-500 font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2"
            >
              <Trash2 size={20} /> 삭제
            </button>
          )}
          <button 
            onClick={handleSaveTransaction}
            className={`flex-[2] text-white font-black py-4 rounded-xl text-lg shadow-lg transition-all active:scale-95 ${
              type === '수입' ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-500 hover:bg-blue-600'
            }`}
          >
            {isEdit ? '수정하기' : '저장하기'}
          </button>
        </div>
      </div>
    </div>
  );
}