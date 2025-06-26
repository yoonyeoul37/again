const { createClient } = require('@supabase/supabase-js');

// Supabase 클라이언트 설정
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('환경 변수가 설정되지 않았습니다.');
  console.log('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl);
  console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY:', supabaseAnonKey ? '설정됨' : '설정되지 않음');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testDatabase() {
  try {
    console.log('데이터베이스 연결 테스트 시작...');
    
    // 1. users 테이블 존재 확인
    console.log('\n1. users 테이블 테스트...');
    const { data: usersData, error: usersError } = await supabase
      .from('users')
      .select('*')
      .limit(1);
    
    if (usersError) {
      console.error('users 테이블 조회 실패:', usersError);
    } else {
      console.log('users 테이블 조회 성공:', usersData);
    }
    
    // 2. advertisers 테이블 존재 확인
    console.log('\n2. advertisers 테이블 테스트...');
    const { data: advertisersData, error: advertisersError } = await supabase
      .from('advertisers')
      .select('*')
      .limit(1);
    
    if (advertisersError) {
      console.error('advertisers 테이블 조회 실패:', advertisersError);
    } else {
      console.log('advertisers 테이블 조회 성공:', advertisersData);
    }
    
    // 3. ads 테이블 존재 확인
    console.log('\n3. ads 테이블 테스트...');
    const { data: adsData, error: adsError } = await supabase
      .from('ads')
      .select('*')
      .limit(1);
    
    if (adsError) {
      console.error('ads 테이블 조회 실패:', adsError);
    } else {
      console.log('ads 테이블 조회 성공:', adsData);
    }
    
    // 4. 현재 인증 상태 확인
    console.log('\n4. 인증 상태 확인...');
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('세션 조회 실패:', sessionError);
    } else {
      console.log('세션 상태:', session ? '로그인됨' : '로그인 안됨');
      if (session?.user) {
        console.log('사용자 ID:', session.user.id);
        console.log('사용자 이메일:', session.user.email);
      }
    }
    
  } catch (error) {
    console.error('데이터베이스 테스트 중 오류:', error);
  }
}

// 스크립트 실행
testDatabase(); 