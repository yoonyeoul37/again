'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login, user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const role = searchParams.get('role') || 'user';
  const [showReset, setShowReset] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetMsg, setResetMsg] = useState('');

  // 이미 로그인한 사용자는 역할에 따라 리다이렉션
  useEffect(() => {
    if (user) {
      if (user.role === 'admin') {
        router.push('/admin/dashboard');
      } else if (user.role === 'advertiser') {
        router.push('/advertiser/dashboard');
      } else {
        router.push('/');
      }
    }
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      await login(email, password);
      
      // 로그인 성공 후 역할에 따라 리다이렉션
      // login 함수에서 이미 user 정보를 가져오므로 잠시 대기
      setTimeout(() => {
        if (user?.role === 'admin') {
          router.push('/admin/dashboard');
        } else if (user?.role === 'advertiser') {
          router.push('/advertiser/dashboard');
        } else {
          router.push('/');
        }
      }, 100);
      
    } catch (error) {
      console.error('Login failed:', error);
      alert('로그인에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetMsg('');
    if (!resetEmail) {
      setResetMsg('이메일을 입력하세요.');
      return;
    }
    const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
      redirectTo: window.location.origin + '/login',
    });
    if (error) {
      setResetMsg('비밀번호 재설정 메일 발송 실패: ' + error.message);
    } else {
      setResetMsg('비밀번호 재설정 메일이 발송되었습니다. 메일함을 확인하세요.');
    }
  };

  // 역할에 따른 제목과 설명
  const getRoleInfo = () => {
    switch (role) {
      case 'admin':
        return {
          title: '관리자 로그인',
          description: '관리자 계정으로 로그인하세요',
          testAccount: '테스트 계정: admin@test.com'
        };
      case 'advertiser':
        return {
          title: '광고주 로그인',
          description: '광고주 계정으로 로그인하세요',
          testAccount: '테스트 계정: advertiser@test.com'
        };
      default:
        return {
          title: '로그인',
          description: '계정으로 로그인하세요',
          testAccount: '테스트 계정: admin@test.com (관리자), advertiser@test.com (광고주)'
        };
    }
  };

  const roleInfo = getRoleInfo();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {roleInfo.title}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {roleInfo.description}
          </p>
          <p className="mt-1 text-center text-xs text-gray-500">
            {roleInfo.testAccount}
          </p>
        </div>
        {!showReset ? (
          <>
            <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
              <div className="rounded-md shadow-sm -space-y-px">
                <div>
                  <label htmlFor="email" className="sr-only">
                    이메일
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                    placeholder="이메일"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div>
                  <label htmlFor="password" className="sr-only">
                    비밀번호
                  </label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                    placeholder="비밀번호"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white disabled:opacity-50 ${
                    role === 'admin' 
                      ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500' 
                      : role === 'advertiser'
                      ? 'bg-green-600 hover:bg-green-700 focus:ring-green-500'
                      : 'bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500'
                  }`}
                >
                  {isLoading ? '로그인 중...' : '로그인'}
                </button>
              </div>
            </form>
            <div className="mt-4 text-center">
              <button
                type="button"
                className="text-xs text-blue-600 hover:underline"
                onClick={() => setShowReset(true)}
              >
                비밀번호를 잊으셨나요?
              </button>
            </div>
          </>
        ) : (
          <form className="mt-8 space-y-6" onSubmit={handleResetPassword}>
            <div>
              <label htmlFor="resetEmail" className="block text-sm font-medium text-gray-700 mb-2">
                비밀번호 재설정 이메일 입력
              </label>
              <input
                id="resetEmail"
                name="resetEmail"
                type="email"
                autoComplete="email"
                required
                className="appearance-none rounded relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="이메일"
                value={resetEmail}
                onChange={e => setResetEmail(e.target.value)}
              />
            </div>
            <div>
              <button
                type="submit"
                className="w-full py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700 font-semibold"
              >
                비밀번호 재설정 메일 발송
              </button>
            </div>
            {resetMsg && <div className="text-center text-sm text-red-500">{resetMsg}</div>}
            <div className="mt-2 text-center">
              <button
                type="button"
                className="text-xs text-gray-500 hover:underline"
                onClick={() => setShowReset(false)}
              >
                로그인 화면으로 돌아가기
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
} 