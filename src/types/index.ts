export interface Post {
  id: string;
  title: string;
  content: string;
  nickname: string;
  category: '개인회생' | '법인회생' | '법인파산' | '워크아웃' | '신용회복위원회' | '대출' | '신용카드' | '신용점수' | '회생절차' | '상환계획' | '법무사상담' | '회생비용' | '파산비용' | '재산관리' | '면책결정' | '신용회복' | '인가결정' | '셀프신청' | '개인신청' | '취업';
  createdAt: string;
  viewCount: number;
  commentCount: number;
  likes: number;
  images?: string[];
  isNotice?: boolean;
}

export interface Comment {
  id: string;
  postId: string;
  content: string;
  nickname: string;
  createdAt: string;
  parentId: string | null;
}

export interface PostFormData {
  title: string;
  content: string;
  nickname: string;
  category: '개인회생' | '법인회생' | '법인파산' | '워크아웃' | '신용점수' | '회생절차' | '상환계획' | '법무사상담' | '회생비용' | '파산비용' | '재산관리' | '면책결정' | '신용회복' | '인가결정' | '셀프신청' | '개인신청' | '취업';
  password: string;
}

export interface CommentFormData {
  content: string;
  nickname: string;
  parentId: string | null;
  password: string;
}

export interface Ad {
  id: string;
  position: 'content' | 'sidebar' | 'bottom';
  code: string; // 광고 코드(HTML 등)
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  email: string;
  role: 'user' | 'admin' | 'advertiser';
  name?: string;
}

export interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

export interface News {
  id: string;
  title: string;
  summary: string;
  source: string;
  date: string;
  category: '개인회생' | '개인파산' | '법인회생' | '법인파산' | '워크아웃' | '신용회복위원회' | '대출' | '신용카드' | '신용점수';
  url: string;
} 