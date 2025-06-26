'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function TestPage() {
  const [testResults, setTestResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const addResult = (title: string, result: any) => {
    setTestResults(prev => [...prev, { title, result, timestamp: new Date().toLocaleTimeString() }]);
  };

  const testDatabase = async () => {
    setIsLoading(true);
    setTestResults([]);

    try {
      // 1. Supabase 연결 테스트
      addResult('1. Supabase 연결 테스트', '시작...');
      
      // 2. users 테이블 존재 확인
      addResult('2. users 테이블 조회 테스트', '시작...');
      const { data: usersData, error: usersError } = await supabase
        .from('users')
        .select('*')
        .limit(1);
      
      if (usersError) {
        addResult('users 테이블 조회 실패', {
          code: usersError.code,
          message: usersError.message,
          details: usersError.details
        });
      } else {
        addResult('users 테이블 조회 성공', usersData);
      }

      // 3. advertisers 테이블 존재 확인
      addResult('3. advertisers 테이블 조회 테스트', '시작...');
      const { data: advertisersData, error: advertisersError } = await supabase
        .from('advertisers')
        .select('*')
        .limit(1);
      
      if (advertisersError) {
        addResult('advertisers 테이블 조회 실패', {
          code: advertisersError.code,
          message: advertisersError.message,
          details: advertisersError.details
        });
      } else {
        addResult('advertisers 테이블 조회 성공', advertisersData);
      }

      // 4. ads 테이블 존재 확인
      addResult('4. ads 테이블 조회 테스트', '시작...');
      const { data: adsData, error: adsError } = await supabase
        .from('ads')
        .select('*')
        .limit(1);
      
      if (adsError) {
        addResult('ads 테이블 조회 실패', {
          code: adsError.code,
          message: adsError.message,
          details: adsError.details
        });
      } else {
        addResult('ads 테이블 조회 성공', adsData);
      }

      // 5. 인증 상태 확인
      addResult('5. 인증 상태 확인', '시작...');
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        addResult('세션 조회 실패', sessionError);
      } else {
        addResult('세션 상태', {
          isLoggedIn: !!session,
          user: session?.user ? {
            id: session.user.id,
            email: session.user.email
          } : null
        });
      }

    } catch (error) {
      addResult('테스트 중 예외 발생', error);
    } finally {
      setIsLoading(false);
    }
  };

  const createTestUser = async () => {
    setIsLoading(true);
    
    try {
      addResult('테스트 사용자 생성', '시작...');
      
      const { data, error } = await supabase.auth.signUp({
        email: 'test@example.com',
        password: 'test123!'
      });

      if (error) {
        addResult('테스트 사용자 생성 실패', error);
      } else {
        addResult('테스트 사용자 생성 성공', {
          user: data.user ? {
            id: data.user.id,
            email: data.user.email
          } : null
        });
      }
    } catch (error) {
      addResult('테스트 사용자 생성 중 예외', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">데이터베이스 테스트</h1>
        
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex gap-4 mb-6">
            <button
              onClick={testDatabase}
              disabled={isLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {isLoading ? '테스트 중...' : '데이터베이스 테스트'}
            </button>
            
            <button
              onClick={createTestUser}
              disabled={isLoading}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
            >
              {isLoading ? '생성 중...' : '테스트 사용자 생성'}
            </button>
          </div>

          <div className="space-y-4">
            {testResults.map((result, index) => (
              <div key={index} className="border border-gray-200 rounded p-4">
                <h3 className="font-semibold text-gray-900 mb-2">
                  {result.title} ({result.timestamp})
                </h3>
                <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto">
                  {JSON.stringify(result.result, null, 2)}
                </pre>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-yellow-900 mb-4">문제 해결 가이드</h2>
          <div className="text-sm text-yellow-800 space-y-2">
            <p>1. <strong>테이블이 없는 경우:</strong> Supabase 대시보드 → SQL Editor에서 테이블 생성</p>
            <p>2. <strong>권한 문제:</strong> RLS 정책 확인 및 수정</p>
            <p>3. <strong>환경 변수:</strong> .env.local 파일에서 Supabase 설정 확인</p>
          </div>
        </div>
      </div>
    </div>
  );
} 