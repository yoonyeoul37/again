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

async function createAdvertiserUser() {
  const advertiserEmail = 'advertiser@test.com';
  const advertiserPassword = 'advertiser123!';

  try {
    console.log('광고주 계정 생성 시작...');
    
    // 1. Supabase Auth에 사용자 생성
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: advertiserEmail,
      password: advertiserPassword,
      email_confirm: true, // 이메일 인증 자동 완료
    });

    if (authError) {
      console.error('Auth 사용자 생성 실패:', authError);
      return;
    }

    console.log('Auth 사용자 생성 성공:', authData.user.id);

    // 2. users 테이블에 광고주 정보 추가
    const { data: userData, error: userError } = await supabase
      .from('users')
      .insert([
        {
          id: authData.user.id,
          email: advertiserEmail,
          role: 'advertiser',
          name: '테스트 광고주',
          created_at: new Date().toISOString()
        }
      ])
      .select()
      .single();

    if (userError) {
      console.error('users 테이블 생성 실패:', userError);
      return;
    }

    // 3. advertisers 테이블에도 추가
    const { data: advertiserData, error: advertiserError } = await supabase
      .from('advertisers')
      .insert([
        {
          id: authData.user.id,
          email: advertiserEmail,
          name: '테스트 광고주',
          phone: '02-1234-5678',
          company_name: '테스트 광고회사',
          created_at: new Date().toISOString()
        }
      ])
      .select()
      .single();

    if (advertiserError) {
      console.error('advertisers 테이블 생성 실패:', advertiserError);
      return;
    }

    console.log('users 테이블 생성 성공:', userData);
    console.log('advertisers 테이블 생성 성공:', advertiserData);
    console.log('\n=== 광고주 계정 생성 완료 ===');
    console.log('이메일:', advertiserEmail);
    console.log('비밀번호:', advertiserPassword);
    console.log('역할: 광고주');
    console.log('UID:', authData.user.id);
    console.log('========================\n');

  } catch (error) {
    console.error('광고주 계정 생성 중 오류:', error);
  }
}

// 스크립트 실행
createAdvertiserUser(); 