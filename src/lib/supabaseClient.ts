import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// 환경 변수 검증
if (!supabaseUrl) {
  console.error('NEXT_PUBLIC_SUPABASE_URL이 설정되지 않았습니다.');
  throw new Error('NEXT_PUBLIC_SUPABASE_URL이 설정되지 않았습니다.');
}

if (!supabaseAnonKey) {
  console.error('NEXT_PUBLIC_SUPABASE_ANON_KEY가 설정되지 않았습니다.');
  throw new Error('NEXT_PUBLIC_SUPABASE_ANON_KEY가 설정되지 않았습니다.');
}

console.log('Supabase 설정 확인:');
console.log('- URL:', supabaseUrl ? '설정됨' : '설정되지 않음');
console.log('- Anon Key:', supabaseAnonKey ? '설정됨' : '설정되지 않음');

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

// Supabase 연결 테스트 함수
export const testSupabaseConnection = async () => {
  try {
    const { data, error } = await supabase.from('users').select('count').limit(1);
    if (error) {
      console.error('Supabase 연결 테스트 실패:', error);
      return { success: false, error };
    }
    console.log('Supabase 연결 테스트 성공');
    return { success: true, data };
  } catch (err) {
    console.error('Supabase 연결 테스트 중 예외 발생:', err);
    return { success: false, error: err };
  }
}; 