"use client";
import { useState, useEffect } from "react";
import { supabase, testSupabaseConnection } from "@/lib/supabaseClient";
import EnvChecker from "@/components/EnvChecker";
import SupabaseTester from "@/components/SupabaseTester";
import Link from 'next/link';

export default function AdvertiserJoinPage() {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    password: ""
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'failed'>('checking');

  // 컴포넌트 마운트 시 Supabase 연결 테스트
  useEffect(() => {
    const checkConnection = async () => {
      try {
        const result = await testSupabaseConnection();
        if (result.success) {
          setConnectionStatus('connected');
        } else {
          setConnectionStatus('failed');
          console.error('Supabase 연결 실패:', result.error);
        }
      } catch (error) {
        setConnectionStatus('failed');
        console.error('연결 테스트 중 오류:', error);
      }
    };

    checkConnection();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // 데이터베이스 스키마 확인 함수
  const checkDatabaseSchema = async () => {
    try {
      console.log("데이터베이스 스키마 확인 시작...");
      
      // users 테이블 확인
      const { error: usersError, data: usersData } = await supabase
        .from('users')
        .select('*')
        .limit(1);
      
      console.log("Users 테이블 확인 결과:", { error: usersError, data: usersData });
      
      if (usersError) {
        console.error("Users 테이블 접근 오류:", usersError);
        return { users: false, advertisers: false, usersError };
      }

      // advertisers 테이블 확인
      const { error: advertisersError, data: advertisersData } = await supabase
        .from('advertisers')
        .select('*')
        .limit(1);
      
      console.log("Advertisers 테이블 확인 결과:", { error: advertisersError, data: advertisersData });
      
      if (advertisersError) {
        console.error("Advertisers 테이블 접근 오류:", advertisersError);
        return { users: true, advertisers: false, advertisersError };
      }

      return { users: true, advertisers: true };
    } catch (error) {
      console.error("스키마 확인 중 오류:", error);
      return { users: false, advertisers: false, error };
    }
  };

  // Supabase 연결 및 테이블 접근 테스트 함수
  const testSupabaseAccess = async () => {
    console.log("=== Supabase 접근 테스트 시작 ===");
    
    try {
      // 1. 기본 연결 테스트
      console.log("1. 기본 연결 테스트...");
      const { data: testData, error: testError } = await supabase
        .from('users')
        .select('count')
        .limit(1);
      
      console.log("기본 연결 테스트 결과:", { data: testData, error: testError });
      
      // 2. 테이블 구조 확인
      console.log("2. 테이블 구조 확인...");
      const { data: structureData, error: structureError } = await supabase
        .from('users')
        .select('*')
        .limit(0);
      
      console.log("테이블 구조 확인 결과:", { data: structureData, error: structureError });
      
      // 3. RLS 정책 테스트
      console.log("3. RLS 정책 테스트...");
      const { data: rlsData, error: rlsError } = await supabase
        .from('users')
        .select('email, role')
        .limit(1);
      
      console.log("RLS 정책 테스트 결과:", { data: rlsData, error: rlsError });
      
      return {
        basicConnection: !testError,
        tableStructure: !structureError,
        rlsPolicy: !rlsError,
        errors: { testError, structureError, rlsError }
      };
      
    } catch (error) {
      console.error("Supabase 접근 테스트 중 예외:", error);
      return {
        basicConnection: false,
        tableStructure: false,
        rlsPolicy: false,
        error
      };
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    
    if (connectionStatus === 'failed') {
      setMessage("데이터베이스 연결에 실패했습니다. 페이지를 새로고침하거나 관리자에게 문의하세요.");
      return;
    }
    
    if (form.password.length < 6) {
      setMessage("비밀번호는 6자 이상 입력해야 합니다.");
      return;
    }
    
    setLoading(true);
    
    try {
      console.log("회원가입 프로세스 시작...");
      console.log("폼 데이터:", form);
      
      // Supabase 접근 테스트
      const accessTest = await testSupabaseAccess();
      console.log("Supabase 접근 테스트 결과:", accessTest);
      
      // 데이터베이스 스키마 확인
      const schemaCheck = await checkDatabaseSchema();
      console.log("스키마 확인 결과:", schemaCheck);
      
      if (!schemaCheck.users || !schemaCheck.advertisers) {
        const errorMsg = !schemaCheck.users ? "users 테이블이 존재하지 않습니다." : "advertisers 테이블이 존재하지 않습니다.";
        setMessage(`데이터베이스 테이블이 설정되지 않았습니다: ${errorMsg} 관리자에게 문의하세요.`);
        setLoading(false);
        return;
      }

      // 1. Supabase Auth 회원가입
      console.log("Supabase Auth 회원가입 시작...");
      const { error: authError, data: authData } = await supabase.auth.signUp({
        email: form.email,
        password: form.password
      });
      
      console.log("Auth 결과:", { error: authError, data: authData });
      
      if (authError) {
        console.error("Auth 오류:", authError);
        if (authError.message.includes("6 characters")) {
          setMessage("비밀번호는 6자 이상 입력해야 합니다.");
        } else if (authError.message.includes("already registered")) {
          setMessage("이미 가입된 이메일입니다.");
        } else {
          setMessage(`회원가입 중 오류가 발생했습니다: ${authError.message}`);
        }
        setLoading(false);
        return;
      }

      console.log("Auth 성공:", authData);

      // 2. users 테이블에 row 추가
      const userId = authData.user?.id || authData.session?.user?.id;
      if (userId) {
        const { error: userInsertError } = await supabase
          .from('users')
          .insert([
            {
              id: userId,
              email: form.email,
              role: 'advertiser'
            }
          ]);
        if (userInsertError) {
          setMessage('users 테이블 추가 실패: ' + userInsertError.message);
          setLoading(false);
          return;
        }
      }

      // 3. advertisers 테이블에 row 추가
      const { error: advInsertError } = await supabase
        .from('advertisers')
        .insert([
          {
            name: form.name,
            phone: form.phone,
            email: form.email,
            status: 'pending'
          }
        ]);
      if (advInsertError) {
        setMessage('advertisers 테이블 추가 실패: ' + advInsertError.message);
        setLoading(false);
        return;
      }

      // 4. 이메일 인증 안내 메시지
      setMessage("회원가입이 완료되었습니다! 이메일로 전송된 인증 링크를 클릭해 인증을 완료해 주세요. 인증 후 로그인하실 수 있습니다.");
      setForm({ name: "", phone: "", email: "", password: "" });
      setLoading(false);
      return;

    } catch (error) {
      console.error("예상치 못한 오류:", error);
      setMessage("예상치 못한 오류가 발생했습니다. 다시 시도해주세요.");
      setLoading(false);
    }
  };

  // 연결 상태에 따른 UI 표시
  if (connectionStatus === 'checking') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>데이터베이스 연결을 확인하는 중...</p>
        </div>
      </div>
    );
  }

  if (connectionStatus === 'failed') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-6 text-red-600">연결 오류</h1>
          <p className="text-red-500 mb-4">데이터베이스에 연결할 수 없습니다.</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            페이지 새로고침
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-8">
      <h1 className="text-2xl font-bold mb-6">광고주 회원가입</h1>
      <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4 bg-white p-8 rounded shadow">
        <input
          type="text"
          name="name"
          value={form.name}
          onChange={handleChange}
          placeholder="광고주명"
          required
          className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="text"
          name="phone"
          value={form.phone}
          onChange={handleChange}
          placeholder="연락처"
          required
          className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="email"
          name="email"
          value={form.email}
          onChange={handleChange}
          placeholder="이메일"
          required
          className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="password"
          name="password"
          value={form.password}
          onChange={handleChange}
          placeholder="비밀번호 (6자 이상)"
          required
          className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          {loading ? "가입 중..." : "광고주 회원가입"}
        </button>
        {message && <div className="text-center text-sm text-red-500 mt-2">{message}</div>}
      </form>
      <div className="mt-4">
        이미 계정이 있으신가요?{' '}
        <Link href="/login" className="text-blue-600 hover:underline">
          로그인
        </Link>
      </div>
      <EnvChecker />
      <SupabaseTester />
    </div>
  );
} 