const { createClient } = require('@supabase/supabase-js');

// Supabase 클라이언트 설정
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('환경 변수가 설정되지 않았습니다.');
  console.log('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl);
  console.log('SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? '설정됨' : '설정되지 않음');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createAdminUser() {
  const adminEmail = 'admin@test.com';
  const adminPassword = 'admin123!';

  try {
    console.log('관리자 계정 생성 시작...');
    
    // 1. Supabase Auth에 사용자 생성
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: adminEmail,
      password: adminPassword,
      email_confirm: true, // 이메일 인증 자동 완료
    });

    if (authError) {
      console.error('Auth 사용자 생성 실패:', authError);
      return;
    }

    console.log('Auth 사용자 생성 성공:', authData.user.id);

    // 2. users 테이블에 관리자 정보 추가
    const { data: userData, error: userError } = await supabase
      .from('users')
      .insert([
        {
          id: authData.user.id,
          email: adminEmail,
          role: 'admin',
          name: '관리자',
          created_at: new Date().toISOString()
        }
      ])
      .select()
      .single();

    if (userError) {
      console.error('users 테이블 생성 실패:', userError);
      return;
    }

    console.log('users 테이블 생성 성공:', userData);
    console.log('\n=== 관리자 계정 생성 완료 ===');
    console.log('이메일:', adminEmail);
    console.log('비밀번호:', adminPassword);
    console.log('역할: 관리자');
    console.log('UID:', authData.user.id);
    console.log('========================\n');

  } catch (error) {
    console.error('관리자 계정 생성 중 오류:', error);
  }
}

// 스크립트 실행
createAdminUser(); 