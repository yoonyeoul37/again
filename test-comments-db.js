const { createClient } = require('@supabase/supabase-js');

// Supabase 설정
const supabaseUrl = 'https://uqvhxgzwqvbkfuagsqow.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVxdmh4Z3p3cXZia2Z1YWdzcW93Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzU3MDU1NTAsImV4cCI6MjA1MTI4MTU1MH0.xhT-0kQJkKGJ6_gJwfWpNwQ5h-MWQdOEwdI6V_sGOqU';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testCommentsTable() {
  console.log('🔍 댓글 테이블 상태 확인 중...\n');

  try {
    // 1. comments 테이블 존재 여부 확인
    console.log('1. comments 테이블 조회 시도...');
    const { data: comments, error: commentsError } = await supabase
      .from('comments')
      .select('*')
      .limit(1);
    
    if (commentsError) {
      console.error('❌ comments 테이블 오류:', commentsError);
      console.log('\n💡 해결방법: Supabase에서 comments-table-setup.sql을 실행해야 합니다.');
    } else {
      console.log('✅ comments 테이블 존재함');
      console.log('댓글 데이터:', comments);
    }

    // 2. posts 테이블 존재 여부 확인
    console.log('\n2. posts 테이블 조회 시도...');
    const { data: posts, error: postsError } = await supabase
      .from('posts')
      .select('*')
      .limit(1);
    
    if (postsError) {
      console.error('❌ posts 테이블 오류:', postsError);
      console.log('\n💡 해결방법: Supabase에서 comments-table-setup.sql을 실행해야 합니다.');
    } else {
      console.log('✅ posts 테이블 존재함');
      console.log('게시글 데이터:', posts);
    }

    // 3. 테스트 데이터 삽입 시도
    if (!commentsError && !postsError) {
      console.log('\n3. 테스트 게시글 생성 시도...');
      
      const { data: newPost, error: insertPostError } = await supabase
        .from('posts')
        .insert([
          {
            title: '테스트 게시글',
            content: '댓글 테스트용 게시글입니다.',
            nickname: '테스터',
            password: '1234',
            category: '개인회생'
          }
        ])
        .select();

      if (insertPostError) {
        console.error('❌ 게시글 생성 실패:', insertPostError);
      } else {
        console.log('✅ 테스트 게시글 생성 성공:', newPost[0].id);
        
        // 4. 테스트 댓글 생성
        console.log('\n4. 테스트 댓글 생성 시도...');
        const { data: newComment, error: insertCommentError } = await supabase
          .from('comments')
          .insert([
            {
              post_id: newPost[0].id,
              nickname: '댓글러',
              password: '1234',
              content: '테스트 댓글입니다.'
            }
          ])
          .select();

        if (insertCommentError) {
          console.error('❌ 댓글 생성 실패:', insertCommentError);
        } else {
          console.log('✅ 테스트 댓글 생성 성공:', newComment);
        }
      }
    }

  } catch (error) {
    console.error('❌ 전체 테스트 실패:', error);
  }
}

testCommentsTable(); 