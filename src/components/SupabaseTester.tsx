"use client";
import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function SupabaseTester() {
  const [testResults, setTestResults] = useState<any>(null);
  const [isTesting, setIsTesting] = useState(false);

  const runTests = async () => {
    setIsTesting(true);
    const results = {
      envVars: {
        url: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        key: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        urlValue: process.env.NEXT_PUBLIC_SUPABASE_URL,
        keyValue: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 
          `${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.substring(0, 10)}...` : '없음'
      },
      connection: null as any,
      tables: null as any,
      auth: null as any
    };

    try {
      // 연결 테스트
      console.log("연결 테스트 시작...");
      const { data: connData, error: connError } = await supabase
        .from('users')
        .select('count')
        .limit(1);
      
      results.connection = { success: !connError, data: connData, error: connError };

      // 테이블 존재 확인
      console.log("테이블 존재 확인...");
      const { data: usersData, error: usersError } = await supabase
        .from('users')
        .select('*')
        .limit(1);
      
      const { data: advertisersData, error: advertisersError } = await supabase
        .from('advertisers')
        .select('*')
        .limit(1);
      
      results.tables = {
        users: { exists: !usersError, data: usersData, error: usersError },
        advertisers: { exists: !advertisersError, data: advertisersData, error: advertisersError }
      };

      // Auth 테스트
      console.log("Auth 테스트...");
      const { data: authData, error: authError } = await supabase.auth.getSession();
      results.auth = { success: !authError, data: authData, error: authError };

    } catch (error) {
      console.error("테스트 중 오류:", error);
      results.connection = { success: false, error };
    }

    setTestResults(results);
    setIsTesting(false);
    console.log("테스트 결과:", results);
  };

  return (
    <div className="fixed top-4 left-4 bg-white border border-gray-300 rounded-lg p-4 shadow-lg max-w-md">
      <h3 className="font-bold mb-2">Supabase 테스터</h3>
      <button
        onClick={runTests}
        disabled={isTesting}
        className="mb-3 px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 disabled:opacity-50"
      >
        {isTesting ? "테스트 중..." : "테스트 실행"}
      </button>
      
      {testResults && (
        <div className="text-xs space-y-2">
          <div>
            <strong>환경 변수:</strong>
            <div className="ml-2">
              <div>URL: {testResults.envVars.url ? "✓" : "✗"}</div>
              <div>Key: {testResults.envVars.key ? "✓" : "✗"}</div>
            </div>
          </div>
          
          <div>
            <strong>연결:</strong>
            <div className="ml-2">
              {testResults.connection?.success ? "✓ 성공" : "✗ 실패"}
              {testResults.connection?.error && (
                <div className="text-red-500 text-xs">
                  {JSON.stringify(testResults.connection.error, null, 2)}
                </div>
              )}
            </div>
          </div>
          
          <div>
            <strong>테이블:</strong>
            <div className="ml-2">
              <div>Users: {testResults.tables?.users?.exists ? "✓" : "✗"}</div>
              <div>Advertisers: {testResults.tables?.advertisers?.exists ? "✓" : "✗"}</div>
            </div>
          </div>
          
          <div>
            <strong>Auth:</strong>
            <div className="ml-2">
              {testResults.auth?.success ? "✓ 성공" : "✗ 실패"}
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 