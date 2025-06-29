export interface Post {
  id: string;
  title: string;
  content: string;
  nickname: string;
  category: string;
  created_at: string;
  view_count: number;
  comment_count: number;
  likes: number;
  images?: string | string[];
  isNotice?: boolean;
  password?: string;
}

export interface Comment {
  id: string;
  post_id: string;
  content: string;
  nickname: string;
  created_at: string;
  parent_id: string | null;
  password?: string;
  replies?: Comment[];
  isEditing?: boolean;
}

export interface PostFormData {
  title: string;
  content: string;
  nickname: string;
  category: string;
  password: string;
}

export interface CommentFormData {
  content: string;
  nickname: string;
  password: string;
  parent_id?: string | null;
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