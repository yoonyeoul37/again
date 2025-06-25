# 데이터베이스 오류 디버깅 가이드

## 현재 상황
광고주 회원가입 시 "Users 테이블 저장 오류: {}" 메시지가 콘솔에 출력되는 문제

## 개선된 디버깅 기능

### 1. 환경 변수 확인
- 페이지 우하단에 환경 변수 상태가 표시됩니다
- Supabase URL과 API 키가 올바르게 설정되었는지 확인 가능

### 2. 상세한 콘솔 로그
이제 다음과 같은 상세한 로그가 출력됩니다:
```
회원가입 프로세스 시작...
폼 데이터: {name: "...", phone: "...", email: "...", password: "..."}
데이터베이스 스키마 확인 시작...
Users 테이블 확인 결과: {error: null, data: [...]}
Advertisers 테이블 확인 결과: {error: null, data: [...]}
스키마 확인 결과: {users: true, advertisers: true}
Supabase Auth 회원가입 시작...
Auth 결과: {error: null, data: {...}}
Auth 성공: {...}
Users 테이블에 데이터 저장 시작...
Users 테이블에 저장할 데이터: {...}
Users 테이블 저장 결과: {error: {...}, data: null}
```

### 3. 연결 상태 확인
- 페이지 로드 시 Supabase 연결을 자동으로 테스트
- 연결 실패 시 명확한 오류 메시지 표시

## 문제 해결 단계

### 1단계: 환경 변수 확인
`.env.local` 파일이 프로젝트 루트에 있는지 확인하고 다음 내용이 포함되어 있는지 확인:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### 2단계: Supabase 프로젝트 설정 확인
1. Supabase 대시보드에서 프로젝트 URL과 API 키 확인
2. Settings > API에서 올바른 값들 확인

### 3단계: 데이터베이스 테이블 생성
Supabase SQL Editor에서 `database-setup.sql` 파일의 내용을 실행

### 4단계: RLS 정책 확인
각 테이블에 대해 Row Level Security가 올바르게 설정되어 있는지 확인

### 5단계: 콘솔 로그 분석
개발자 도구의 콘솔에서 다음을 확인:
- 환경 변수 상태 로그
- 스키마 확인 결과
- 각 단계별 성공/실패 로그
- 구체적인 오류 코드와 메시지

## 일반적인 오류와 해결책

### 오류: "NEXT_PUBLIC_SUPABASE_URL이 설정되지 않았습니다"
**해결책**: `.env.local` 파일에 올바른 Supabase URL 추가

### 오류: "NEXT_PUBLIC_SUPABASE_ANON_KEY가 설정되지 않았습니다"
**해결책**: `.env.local` 파일에 올바른 Supabase API 키 추가

### 오류: "relation 'users' does not exist"
**해결책**: `database-setup.sql` 스크립트 실행

### 오류: "permission denied"
**해결책**: RLS 정책 확인 및 수정

### 오류: "duplicate key value violates unique constraint"
**해결책**: 이미 존재하는 이메일로 가입 시도 - 다른 이메일 사용

## 추가 디버깅 팁

1. **브라우저 새로고침**: 환경 변수 변경 후 반드시 새로고침
2. **개발 서버 재시작**: 환경 변수 변경 후 개발 서버 재시작
3. **캐시 삭제**: 브라우저 캐시 및 Next.js 캐시 삭제
4. **네트워크 탭 확인**: 개발자 도구의 Network 탭에서 Supabase API 호출 확인

## 지원 정보

문제가 지속되면 다음 정보를 수집하여 문의하세요:
- 콘솔 로그 전체
- 환경 변수 상태 (개인정보 제외)
- Supabase 프로젝트 설정 스크린샷
- 발생한 오류 메시지 