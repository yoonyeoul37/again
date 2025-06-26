'use client';

import { useAuth } from './AuthProvider';

export default function Footer() {
  const { user, isLoading, logout } = useAuth();

  function CopyrightYear() {
    return <>{new Date().getFullYear()}</>;
  }

  // 역할 한글 변환
  const getRoleLabel = (role) => {
    if (role === 'admin') return '관리자';
    if (role === 'advertiser') return '광고주';
    return '일반회원';
  };

  // 디버깅용: 현재 상태 출력
  console.log('Footer - user:', user);
  console.log('Footer - isLoading:', isLoading);
  console.log('Footer - !user:', !user);

  return (
    <footer className="w-full bg-white border-t mt-12 py-8">
      <div className="max-w-screen-xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between text-sm text-gray-500">
        <div className="flex items-center space-x-2 mb-4 md:mb-0">
          <span className="font-bold tracking-wide">© 2025 개인회생파산 커뮤니티</span>
        </div>
        <div className="flex flex-wrap gap-2 items-center">
          <a href="/advertising" className="border border-gray-300 bg-white text-gray-900 px-4 py-2 rounded-lg font-semibold transition-colors flex items-center gap-2 hover:bg-gray-100">
            광고 문의
          </a>
          <a href="/advertiser/join" className="border border-blue-500 bg-white text-blue-700 px-4 py-2 rounded-lg font-semibold transition-colors flex items-center gap-2 hover:bg-blue-50">
            광고주 회원가입
          </a>
          <a href="/login?role=advertiser" className="border border-green-500 bg-white text-green-700 px-4 py-2 rounded-lg font-semibold transition-colors flex items-center gap-2 hover:bg-green-50">
            광고주 로그인
          </a>
          <a href="/admin/dashboard" className="border border-purple-500 bg-white text-purple-700 px-4 py-2 rounded-lg font-semibold transition-colors flex items-center gap-2 hover:bg-purple-50">
            관리자 페이지
          </a>
          <a href="/login?role=admin" className="border border-red-500 bg-white text-red-700 px-4 py-2 rounded-lg font-semibold transition-colors flex items-center gap-2 hover:bg-red-50">
            관리자 로그인
          </a>

          {/* 로그인 상태 표시 및 로그아웃/대시보드 */}
          {!isLoading && user && (
            <>
              <span className="text-xs text-gray-700 bg-gray-100 px-2 py-1 rounded">
                로그인됨: <b>{user.email}</b> ({getRoleLabel(user.role)})
              </span>
              {user.role === 'admin' && (
                <a href="/admin/dashboard" className="border border-gray-300 bg-white text-gray-900 px-4 py-2 rounded-lg font-semibold transition-colors flex items-center gap-2 hover:bg-gray-100">
                  관리자 대시보드
                </a>
              )}
              {user.role === 'advertiser' && (
                <a href="/advertiser/stats" className="border border-gray-300 bg-white text-gray-900 px-4 py-2 rounded-lg font-semibold transition-colors flex items-center gap-2 hover:bg-gray-100">
                  광고주 대시보드
                </a>
              )}
              <button
                onClick={logout}
                className="border border-gray-400 bg-white text-gray-700 px-4 py-2 rounded-lg font-semibold transition-colors flex items-center gap-2 hover:bg-gray-200"
              >
                로그아웃
              </button>
            </>
          )}
          {isLoading && (
            <span className="text-xs text-gray-400">로딩 중...</span>
          )}
        </div>
      </div>
    </footer>
  );
} 