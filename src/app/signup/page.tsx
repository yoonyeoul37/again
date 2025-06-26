"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import Link from 'next/link';

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<'user' | 'admin' | 'advertiser'>('user');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (password !== confirmPassword) {
      setError('비밀번호가 일치하지 않습니다.');
      return;
    }

    if (password.length < 6) {
      setError('비밀번호는 최소 6자 이상이어야 합니다.');
      return;
    }

    setIsLoading(true);

    try {
      console.log('회원가입 시도:', { email, role, name });

      // 1. Supabase Auth에 사용자 생성
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            role
          }
        }
      });

      if (authError) {
        console.error('Auth 회원가입 실패:', authError);
        setError(`회원가입 실패: ${authError.message}`);
        return;
      }

      if (authData.user) {
        console.log('Auth 회원가입 성공:', authData.user.id);

        // 2. users 테이블에 사용자 정보 추가
        const { error: userError } = await supabase
          .from('users')
          .insert([
            {
              id: authData.user.id,
              email,
              role,
              created_at: new Date().toISOString()
            }
          ]);

        if (userError) {
          console.error('users 테이블 생성 실패:', userError);
          setError(`사용자 정보 저장 실패: ${userError.message}`);
          return;
        }

        // 3. 광고주인 경우 advertisers 테이블에도 추가
        if (role === 'advertiser') {
          const { error: advertiserError } = await supabase
            .from('advertisers')
            .insert([
              {
                id: authData.user.id,
                email,
                name,
                phone: '',
                company_name: '',
                created_at: new Date().toISOString()
              }
            ]);

          if (advertiserError) {
            console.error('advertisers 테이블 생성 실패:', advertiserError);
            // 광고주 테이블 생성 실패는 경고만 표시
            console.warn('광고주 정보 저장 실패:', advertiserError.message);
          }
        }

        setSuccess(`회원가입이 완료되었습니다! 이메일 인증 후 로그인해주세요.`);
        console.log('회원가입 완료:', { email, role, uid: authData.user.id });

        // 3초 후 로그인 페이지로 이동
        setTimeout(() => {
          router.push('/login');
        }, 3000);
      }
    } catch (error) {
      console.error('회원가입 중 오류:', error);
      setError('회원가입 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            회원가입
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            계정을 생성하여 서비스를 이용하세요
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                이름 *
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                className="appearance-none rounded relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="홍길동"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                이메일 *
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none rounded relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="example@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
                계정 유형 *
              </label>
              <select
                id="role"
                name="role"
                required
                className="appearance-none rounded relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                value={role}
                onChange={(e) => setRole(e.target.value as 'user' | 'admin' | 'advertiser')}
              >
                <option value="user">일반회원</option>
                <option value="advertiser">광고주</option>
                <option value="admin">관리자</option>
              </select>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                비밀번호 *
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                className="appearance-none rounded relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="최소 6자 이상"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                비밀번호 확인 *
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                className="appearance-none rounded relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="비밀번호를 다시 입력하세요"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          </div>

          {error && (
            <div className="text-red-600 text-sm text-center bg-red-50 p-3 rounded">
              {error}
            </div>
          )}

          {success && (
            <div className="text-green-600 text-sm text-center bg-green-50 p-3 rounded">
              {success}
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {isLoading ? '회원가입 중...' : '회원가입'}
            </button>
          </div>

          <div className="text-center">
            <Link href="/login" className="text-sm text-indigo-600 hover:text-indigo-500">
              이미 계정이 있으신가요? 로그인하기
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
} 