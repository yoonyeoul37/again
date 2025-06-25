"use client";
import { useState, useEffect } from 'react';

export default function EnvChecker() {
  const [envStatus, setEnvStatus] = useState<{
    supabaseUrl: boolean;
    supabaseKey: boolean;
    isClient: boolean;
  }>({
    supabaseUrl: false,
    supabaseKey: false,
    isClient: false
  });

  useEffect(() => {
    const checkEnv = () => {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      
      setEnvStatus({
        supabaseUrl: !!supabaseUrl,
        supabaseKey: !!supabaseKey,
        isClient: true
      });

      console.log('환경 변수 상태:', {
        supabaseUrl: supabaseUrl ? '설정됨' : '설정되지 않음',
        supabaseKey: supabaseKey ? '설정됨' : '설정되지 않음',
        supabaseUrlValue: supabaseUrl,
        supabaseKeyValue: supabaseKey ? `${supabaseKey.substring(0, 10)}...` : '없음'
      });
    };

    checkEnv();
  }, []);

  if (!envStatus.isClient) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-gray-800 text-white p-4 rounded-lg text-xs max-w-sm">
      <h3 className="font-bold mb-2">환경 변수 상태</h3>
      <div className="space-y-1">
        <div className={`flex justify-between ${envStatus.supabaseUrl ? 'text-green-400' : 'text-red-400'}`}>
          <span>SUPABASE_URL:</span>
          <span>{envStatus.supabaseUrl ? '✓' : '✗'}</span>
        </div>
        <div className={`flex justify-between ${envStatus.supabaseKey ? 'text-green-400' : 'text-red-400'}`}>
          <span>SUPABASE_KEY:</span>
          <span>{envStatus.supabaseKey ? '✓' : '✗'}</span>
        </div>
      </div>
      {(!envStatus.supabaseUrl || !envStatus.supabaseKey) && (
        <div className="mt-2 text-yellow-400 text-xs">
          .env.local 파일을 확인하세요
        </div>
      )}
    </div>
  );
} 