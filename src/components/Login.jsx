import React from 'react';
import { supabase } from '../supabaseClient';

export default function Login() {
  // 💡 소셜 로그인 호출 함수
  const handleLogin = async (provider) => {
    
    // 카카오일 경우 닉네임만 요청하도록 설정 (스코프)
    const scopes = provider === 'kakao' ? 'profile_nickname' : undefined;

    const { error } = await supabase.auth.signInWithOAuth({
      provider: provider,
      options: {
        redirectTo: window.location.origin,
        scopes: scopes // 💡 핵심! 카카오에게 'profile_nickname'만 달라고 명시적으로 요청합니다.
      }
    });

    if (error) {
      console.error('로그인 에러:', error.message);
      alert('로그인 중 오류가 발생했습니다.');
    }
  };
  return (
    <div className="flex items-center justify-center h-screen bg-gray-50 dark:bg-slate-950 transition-colors px-4">
      <div className="p-10 bg-white dark:bg-slate-900 rounded-[2rem] shadow-2xl border border-gray-100 dark:border-slate-800 text-center max-w-sm w-full animate-in zoom-in duration-300">
        
        <div className="w-20 h-20 bg-blue-500 text-white rounded-3xl flex items-center justify-center text-4xl mx-auto mb-6 shadow-lg shadow-blue-500/30 transform rotate-3">
          💸
        </div>
        
        <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-3 tracking-tight">나만의 가계부</h1>
        <p className="text-gray-500 dark:text-slate-400 mb-10 font-medium">로그인하고 스마트하게 자산을 관리하세요.</p>

        <div className="space-y-3">
          {/* 구글 로그인 버튼 */}
          <button
            onClick={() => handleLogin('google')}
            className="w-full py-3.5 px-4 flex items-center justify-center gap-3 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-2xl text-gray-700 dark:text-white font-bold hover:bg-gray-50 dark:hover:bg-slate-700 transition-all shadow-sm hover:shadow"
          >
            <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5 h-5" />
            구글로 시작하기
          </button>

          {/* 카카오 로그인 버튼 */}
          <button
            onClick={() => handleLogin('kakao')}
            className="w-full py-3.5 px-4 flex items-center justify-center gap-3 bg-[#FEE500] hover:bg-[#FDD800] rounded-2xl text-[#000000] font-bold transition-all shadow-sm hover:shadow"
          >
            <svg viewBox="0 0 32 32" className="w-6 h-6" fill="currentColor">
              <path d="M16 4.64c-6.96 0-12.64 4.48-12.64 10.08 0 3.52 2.32 6.64 5.76 8.48l-1.44 5.44c-0.08 0.32 0.24 0.56 0.56 0.4l5.04-3.36c0.88 0.24 1.76 0.32 2.72 0.32 6.96 0 12.64-4.48 12.64-10.08s-5.68-10.08-12.64-10.08z"></path>
            </svg>
            카카오로 시작하기
          </button>
        </div>
        
      </div>
    </div>
  );
}