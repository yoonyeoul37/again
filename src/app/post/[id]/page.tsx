'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';
import AdSlot from '@/components/AdSlot';

// 구글 애드센스 타입 정의
declare global {
  interface Window {
    adsbygoogle: any[];
  }
}

export default function PostDetailPage() {
  const params = useParams();
  const postId = params.id;
  
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ads, setAds] = useState({
    left: [],
    right: [],
    sidebar: null
  });
  const [relatedPosts, setRelatedPosts] = useState([]);
  const [popularPosts, setPopularPosts] = useState([]);

  // 댓글 작성 폼 state
  const [commentForm, setCommentForm] = useState({
    nickname: '',
    password: '',
    content: ''
  });
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  // 답글 관련 state
  const [replyForms, setReplyForms] = useState({});
  const [showReplyForm, setShowReplyForm] = useState({});
  const [isSubmittingReply, setIsSubmittingReply] = useState({});

  // 수정/삭제 관련 state
  const [editingComment, setEditingComment] = useState(null);
  const [editForm, setEditForm] = useState({ password: '', content: '' });
  const [deleteForm, setDeleteForm] = useState({ password: '' });
  const [showDeleteModal, setShowDeleteModal] = useState(null);

  // 힘내 버튼 관련 state
  const [isCheering, setIsCheering] = useState(false);

  // 게시글 수정/삭제 관련 state
  const [showPostDeleteModal, setShowPostDeleteModal] = useState(false);
  const [postDeleteForm, setPostDeleteForm] = useState({ password: '' });
  const [isDeleting, setIsDeleting] = useState(false);

  // 샘플 데이터
  const samplePost = {
    id: postId,
    title: '개인회생 신청 후 생활비는 어떻게 관리하나요?',
    content: `개인회생을 신청한 후 생활비 관리에 대해 궁금한 점이 많습니다.

현재 월 소득이 300만원 정도이고, 부채가 1억 정도 됩니다. 개인회생을 신청하면 생활비는 어떻게 책정되나요?

또한 회생계획 기간 동안 추가 대출이나 신용카드 사용이 가능한지도 궁금합니다.

경험 있으신 분들의 조언 부탁드립니다.`,
    nickname: '고민중인사람',
    created_at: '2024-01-15',
    view_count: 156,
    comment_count: 8,
    category: '개인회생',
    likes: 5,
    cheers: 12
  };

  const sampleComments = [
    {
      id: 1,
      nickname: '경험자1',
      content: '저도 비슷한 상황이었는데, 생활비는 법원에서 최저생계비 기준으로 정해줍니다. 가족 수에 따라 다르니 법무사와 상담받아보세요.',
      created_at: '2024-01-16',
      parent_id: null,
      replies: [
        {
          id: 3,
          nickname: '고민중인사람',
          content: '답변 감사합니다! 법무사 상담 예약해보겠습니다.',
          created_at: '2024-01-16',
          parent_id: 1
        }
      ]
    },
    {
      id: 2,
      nickname: '법무사김',
      content: '개인회생 기간 중에는 신용카드 사용이 제한됩니다. 하지만 생활에 필요한 최소한의 금액은 사용 가능해요.',
      created_at: '2024-01-16',
      parent_id: null,
      replies: []
    }
  ];

  const samplePopularPosts = [
    { id: 1, title: '개인회생 vs 개인파산 차이점', nickname: '전문가', view_count: 234, comment_count: 12 },
    { id: 2, title: '신용회복위원회 워크아웃 후기', nickname: '경험담', view_count: 189, comment_count: 8 },
    { id: 3, title: '법무사 비용 얼마나 드나요?', nickname: '질문자', view_count: 167, comment_count: 15 },
    { id: 4, title: '회생계획 인가 후 주의사항', nickname: '조언자', view_count: 145, comment_count: 6 },
    { id: 5, title: '면책 결정까지 기간은?', nickname: '궁금이', view_count: 123, comment_count: 9 }
  ];

  const sampleRelatedPosts = [
    { id: 101, title: '개인회생 vs 개인파산 차이점이 궁금해요', nickname: '질문자', category: '개인회생', created_at: '2024-01-20', view_count: 234, comment_count: 12 },
    { id: 102, title: '신용회복위원회 워크아웃 신청 후기', nickname: '경험담', category: '워크아웃', created_at: '2024-01-19', view_count: 189, comment_count: 8 },
    { id: 103, title: '법무사 비용 얼마나 드나요?', nickname: '준비중', category: '법무사상담', created_at: '2024-01-19', view_count: 167, comment_count: 15 },
    { id: 104, title: '회생계획 인가 후 주의사항들', nickname: '조언자', category: '회생절차', created_at: '2024-01-18', view_count: 145, comment_count: 6 },
    { id: 105, title: '면책 결정까지 기간은 보통 얼마나?', nickname: '궁금이', category: '개인파산', created_at: '2024-01-18', view_count: 123, comment_count: 9 }
  ];

  // 구글 애드센스 배너 컴포넌트
  function AdsenseBanner({ position = 'horizontal' }) {
    const isDev = process.env.NODE_ENV === 'development';
    const adRef = useRef(null);
    const [adLoaded, setAdLoaded] = useState(false);

    useEffect(() => {
      if (isDev) return;
      
      const loadAd = () => {
        try {
          if (typeof window !== 'undefined' && window.adsbygoogle && adRef.current) {
            const adElement = adRef.current.querySelector('.adsbygoogle:not([data-adsbygoogle-status])');
            if (adElement) {
              (window.adsbygoogle = window.adsbygoogle || []).push({});
            }
          }
        } catch (error) {
          console.error('AdSense 로딩 에러:', error);
        }
      };

      const timer = setTimeout(loadAd, 100);
      return () => clearTimeout(timer);
    }, [isDev]);

    if (isDev) {
      return (
        <div className="w-full flex items-center justify-center" style={{ 
          position: 'relative', 
          height: position === 'horizontal' ? '180px' : '200px',
          minHeight: position === 'horizontal' ? '180px' : '200px' 
        }}>
          <div className="w-full h-full flex flex-col items-center justify-center text-gray-500 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg border-2 border-dashed border-gray-300">
            <div className="text-lg font-bold mb-2">📢</div>
            <div className="text-sm font-medium mb-1">구글 애드센스 광고</div>
            <div className="text-xs opacity-75">{position === 'horizontal' ? '가로형 180px' : '정사각형 200px'} 배너</div>
          </div>
        </div>
      );
    }

    return (
      <div className="w-full flex items-center justify-center" style={{ 
        position: 'relative', 
        height: position === 'horizontal' ? '180px' : '200px',
        minHeight: position === 'horizontal' ? '180px' : '200px' 
      }}>
        <ins
          ref={adRef}
          className="adsbygoogle"
          style={{ 
            display: 'block', 
            width: '100%', 
            height: position === 'horizontal' ? '180px' : '200px',
            minHeight: position === 'horizontal' ? '180px' : '200px'
          }}
          data-ad-client="ca-pub-XXXXXXXXXXXXXXXX"
          data-ad-slot="YOUR_SLOT_ID"
          data-ad-format={position === 'horizontal' ? 'horizontal' : 'rectangle'}
        />
      </div>
    );
  }

  useEffect(() => {
    fetchPost();
    fetchAds();
    fetchRelatedPosts();
    fetchPopularPosts();
  }, [postId]);

  // 실제 게시글 데이터 가져오기
  const fetchPost = async () => {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .eq('id', postId)
        .single();
      
      if (error) {
        console.error('게시글 가져오기 실패:', error);
        setPost(samplePost);
      } else {
        setPost(data);
        // 조회수 증가
        await supabase
          .from('posts')
          .update({ view_count: (data.view_count || 0) + 1 })
          .eq('id', postId);
      }
    } catch (error) {
      console.error('게시글 가져오기 중 오류:', error);
      setPost(samplePost);
    }
    
    // 댓글 로딩
    loadCommentsFromStorage();
    setLoading(false);
  };

  // 댓글 데이터 가져오기
  const loadCommentsFromStorage = async () => {
    try {
      const { data, error } = await supabase
        .from('comments')
        .select('*')
        .eq('post_id', postId)
        .order('created_at', { ascending: true });
      
      if (!error && data) {
        const parentComments = data.filter(comment => comment.parent_id === null);
        const allReplies = data.filter(comment => comment.parent_id !== null);
        
        const commentsWithReplies = parentComments.map(parent => {
          const findAllReplies = (parentId) => {
            const directReplies = allReplies.filter(reply => reply.parent_id === parentId);
            const nestedReplies = directReplies.flatMap(reply => findAllReplies(reply.id));
            return [...directReplies, ...nestedReplies];
          };
          
          const allRelatedReplies = findAllReplies(parent.id);
          allRelatedReplies.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
          
          return {
            ...parent,
            replies: allRelatedReplies
          };
        });
        
        setComments(commentsWithReplies);
      } else {
        setComments(sampleComments);
      }
    } catch (error) {
      console.error('댓글 로딩 실패:', error);
      setComments(sampleComments);
    }
  };

  // 관련 게시글 가져오기
  const fetchRelatedPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .neq('id', postId)
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (!error && data && data.length > 0) {
        setRelatedPosts(data);
      } else {
        setRelatedPosts(sampleRelatedPosts);
      }
    } catch (error) {
      console.error('관련 게시글 가져오기 실패:', error);
      setRelatedPosts(sampleRelatedPosts);
    }
  };

  // 실시간 인기글 가져오기
  const fetchPopularPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .neq('id', postId)
        .order('view_count', { ascending: false })
        .limit(5);
      
      if (!error && data && data.length > 0) {
        setPopularPosts(data);
      } else {
        setPopularPosts(samplePopularPosts);
      }
    } catch (error) {
      console.error('실시간 인기글 가져오기 실패:', error);
      setPopularPosts(samplePopularPosts);
    }
  };

  // 광고 데이터 가져오기
  const fetchAds = async () => {
    try {
      const { data: personalAds } = await supabase
        .from('custom_banners')
        .select('*')
        .order('slot_number');

      const { data: adsData } = await supabase
        .from('ads')
        .select('*')
        .eq('status', 'active');

      let leftAds = [];
      let sidebarAd = null;

      if (personalAds) {
        leftAds = personalAds.slice(0, 3).map(ad => ({
          id: ad.id,
          title: `개인광고 ${ad.slot_number}`,
          image_url: ad.image_url,
          website: ad.link || '#'
        }));
      }

      if (adsData) {
        sidebarAd = adsData[0] ? {
          id: adsData[0].id,
          title: adsData[0].title,
          image_url: adsData[0].image_url,
          website: adsData[0].website || '#'
        } : null;
      }

      setAds({
        left: leftAds,
        right: [],
        sidebar: sidebarAd
      });
    } catch (error) {
      console.error('광고 데이터 가져오기 실패:', error);
      setAds({
        left: [
          { id: 1, title: '강남법무사 무료상담', image_url: '/001.jpg', website: 'https://example.com' },
          { id: 2, title: '개인회생 전문', image_url: '/001.jpg', website: 'https://example.com' },
          { id: 3, title: '24시간 상담가능', image_url: '/001.jpg', website: 'https://example.com' }
        ],
        right: [],
        sidebar: { id: 6, title: '우측 메인 광고', image_url: '/001.jpg', website: 'https://example.com' }
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-lg text-gray-600">로딩 중...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* 헤더 */}
      <header className="bg-gray-800 shadow-lg h-20">
        <div className="max-w-7xl mx-auto px-4 h-full flex items-center justify-between">
          <Link href="/" className="text-white flex items-center gap-3">
            <div className="text-2xl"></div>
            <div>
              <div className="text-2xl font-bold">개인회생119</div>
              <div className="text-xs text-gray-300">개인·법인회생파산 정보공유</div>
            </div>
          </Link>
          
          <nav className="flex items-center space-x-6">
            <Link href="/qa" className="text-white/80 hover:text-white text-sm transition-colors">
              Q&A
            </Link>
            <Link href="/news" className="text-white/80 hover:text-white text-sm transition-colors">
              뉴스
            </Link>
            <Link href="/rules" className="text-white/80 hover:text-white text-sm transition-colors">
              이용수칙
            </Link>
          </nav>
        </div>
      </header>

      {/* 상단 구글 애드센스 광고 */}
      <div className="w-full bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="grid grid-cols-12 gap-6">
            <div className="col-span-2"></div>
            <div className="col-span-7">
              <AdsenseBanner position="horizontal" />
            </div>
            <div className="col-span-3"></div>
          </div>
        </div>
      </div>

      {/* 메인 컨텐츠 영역 */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-12 gap-6">
          
          {/* 좌측 광고 */}
          <div className="col-span-2">
            <div className="sticky top-6 space-y-4">
              {ads.left
                .filter(ad => ad && ad.image_url)
                .map((ad, index) => (
                  <AdSlot 
                    key={ad.id || index}
                    position="sidebar" 
                    ad={ad}
                    className="w-full"
                    style={{ height: '180px' }}
                  />
                ))}
            </div>
          </div>

          {/* 중앙 컨텐츠 */}
          <div className="col-span-7">
            {/* 게시글 내용 */}
            <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-lg border border-gray-100 mb-8 overflow-hidden">
              {/* 게시글 헤더 */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-5 border-b border-blue-100">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className={`px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-2 shadow-sm ${
                      post.category?.includes('개인회생') ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' :
                      post.category?.includes('개인파산') ? 'bg-red-100 text-red-700 border border-red-200' :
                      post.category?.includes('법인회생') ? 'bg-blue-100 text-blue-700 border border-blue-200' :
                      post.category?.includes('법인파산') ? 'bg-orange-100 text-orange-700 border border-orange-200' :
                      post.category?.includes('질문') ? 'bg-purple-100 text-purple-700 border border-purple-200' :
                      'bg-gray-100 text-gray-700 border border-gray-200'
                    }`}>
                      {post.category?.includes('개인회생') && (
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                        </svg>
                      )}
                      {post.category?.includes('개인파산') && (
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                      )}
                      {post.category?.includes('법인') && (
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm2 5a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                        </svg>
                      )}
                      {post.category?.includes('질문') && (
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 5v8a2 2 0 01-2 2h-5l-5 4v-4H4a2 2 0 01-2-2V5a2 2 0 012-2h12a2 2 0 012 2zM7 8H5v2h2V8zm2 0h2v2H9V8zm6 0h-2v2h2V8z" clipRule="evenodd" />
                        </svg>
                      )}
                      {post.category}
                    </span>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                          <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                        </svg>
                        {post.view_count}
                      </span>
                      <span className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 5v8a2 2 0 01-2 2h-5l-5 4v-4H4a2 2 0 01-2-2V5a2 2 0 012-2h12a2 2 0 012 2zM7 8H5v2h2V8zm2 0h2v2H9V8zm6 0h-2v2h2V8z" clipRule="evenodd" />
                        </svg>
                        {comments.reduce((total, comment) => total + 1 + (comment.replies?.length || 0), 0)}
                      </span>
                    </div>
                  </div>
                </div>
                
                <h1 className="text-2xl font-bold text-gray-900 leading-tight mb-3">{post.title}</h1>
                
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span className="flex items-center gap-2">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                    </svg>
                    <span className="font-medium text-gray-800">{post.nickname}</span>
                  </span>
                  <span className="flex items-center gap-2">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                    </svg>
                    {post.created_at}
                  </span>
                </div>
              </div>

              {/* 게시글 본문 */}
              <div className="p-6">
                <div className="prose max-w-none">
                  <div className="text-gray-800 leading-relaxed whitespace-pre-line text-base">
                    {post.content}
                  </div>
                </div>
              </div>

              {/* 게시글 하단 - 힘내세요 버튼 */}
              <div className="mt-6 pt-4 border-t border-gray-100">
                <div className="flex justify-center mb-4">
                  <button 
                    className={`relative overflow-hidden group flex items-center space-x-2 px-5 py-2.5 rounded-full font-medium transition-all duration-300 transform bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 hover:scale-105 hover:shadow-lg active:scale-95`}
                  >
                    <span className="relative z-10 text-lg">💪</span>
                    <span className="relative z-10 text-sm">힘내세요 {post.cheers || 0}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* 댓글 섹션 */}
            <div className="mt-8">
              <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                {/* 댓글 헤더 */}
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 5v8a2 2 0 01-2 2h-5l-5 4v-4H4a2 2 0 01-2-2V5a2 2 0 012-2h12a2 2 0 012 2zM7 8H5v2h2V8zm2 0h2v2H9V8zm6 0h-2v2h2V8z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-white">댓글</h2>
                      <p className="text-blue-100 text-sm">
                        총 {comments.reduce((total, comment) => total + 1 + (comment.replies?.length || 0), 0)}개의 댓글이 있습니다
                      </p>
                    </div>
                  </div>
                </div>

                {/* 댓글 작성 폼 */}
                <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 border-b border-blue-100">
                  <form onSubmit={(e) => {
                    e.preventDefault();
                    // 댓글 작성 로직
                    console.log('댓글 작성:', commentForm);
                  }} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <input
                        type="text"
                        placeholder="닉네임"
                        value={commentForm.nickname}
                        onChange={(e) => setCommentForm(prev => ({ ...prev, nickname: e.target.value }))}
                        className="px-4 py-3 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        required
                      />
                      <input
                        type="password"
                        placeholder="비밀번호"
                        value={commentForm.password}
                        onChange={(e) => setCommentForm(prev => ({ ...prev, password: e.target.value }))}
                        className="px-4 py-3 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        required
                      />
                    </div>
                    <textarea
                      placeholder="댓글을 작성해주세요..."
                      value={commentForm.content}
                      onChange={(e) => setCommentForm(prev => ({ ...prev, content: e.target.value }))}
                      className="w-full px-4 py-3 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all h-24 resize-none"
                      required
                    />
                    <div className="flex justify-end">
                      <button
                        type="submit"
                        disabled={isSubmittingComment}
                        className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg transition-colors font-medium flex items-center gap-2"
                      >
                        {isSubmittingComment ? (
                          <>
                            <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25" />
                              <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" className="opacity-75" />
                            </svg>
                            작성 중...
                          </>
                        ) : (
                          <>
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                            </svg>
                            댓글 작성
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </div>

                {/* 댓글 리스트 */}
                <div className="divide-y divide-gray-100">
                  {comments.map((comment) => (
                    <div key={comment.id} className="p-6">
                      {/* 원댓글 */}
                      <div className="flex gap-4">
                        <div className="flex-shrink-0">
                          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                            </svg>
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="font-semibold text-gray-900">{comment.nickname}</span>
                            <span className="text-sm text-gray-500">{comment.created_at}</span>
                          </div>
                          <div className="text-gray-800 leading-relaxed mb-3 whitespace-pre-line">
                            {comment.content}
                          </div>
                          <div className="flex items-center gap-3 text-sm">
                            <button className="text-blue-600 hover:text-blue-700 font-medium">
                              답글
                            </button>
                            <button className="text-gray-500 hover:text-gray-700">
                              수정
                            </button>
                            <button className="text-red-500 hover:text-red-700">
                              삭제
                            </button>
                          </div>

                          {/* 답글 리스트 */}
                          {comment.replies && comment.replies.length > 0 && (
                            <div className="mt-4 pl-6 border-l-2 border-blue-100 space-y-4">
                              {comment.replies.map((reply) => (
                                <div key={reply.id} className="flex gap-3">
                                  <div className="flex-shrink-0">
                                    <div className="w-8 h-8 bg-gradient-to-r from-gray-400 to-gray-500 rounded-full flex items-center justify-center">
                                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                      </svg>
                                    </div>
                                  </div>
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                      <span className="font-medium text-gray-900">{reply.nickname}</span>
                                      <span className="text-xs text-gray-500">{reply.created_at}</span>
                                    </div>
                                    <div className="text-gray-700 leading-relaxed mb-2 whitespace-pre-line text-sm">
                                      {reply.content}
                                    </div>
                                    <div className="flex items-center gap-3 text-xs">
                                      <button className="text-blue-600 hover:text-blue-700 font-medium">
                                        답글
                                      </button>
                                      <button className="text-gray-500 hover:text-gray-700">
                                        수정
                                      </button>
                                      <button className="text-red-500 hover:text-red-700">
                                        삭제
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* 댓글이 없을 때 */}
                  {comments.length === 0 && (
                    <div className="p-12 text-center">
                      <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full flex items-center justify-center">
                        <svg className="w-8 h-8 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 5v8a2 2 0 01-2 2h-5l-5 4v-4H4a2 2 0 01-2-2V5a2 2 0 012-2h12a2 2 0 012 2zM7 8H5v2h2V8zm2 0h2v2H9V8zm6 0h-2v2h2V8z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <p className="text-gray-500 text-lg mb-2">아직 댓글이 없습니다</p>
                      <p className="text-gray-400 text-sm">첫 번째 댓글을 작성해보세요!</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* 관련 게시글 리스트 */}
            <div className="mt-8">
              <div className="bg-gradient-to-br from-slate-50 to-gray-50 rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                <div className="bg-gradient-to-r from-gray-800 to-gray-700 px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <h2 className="text-lg font-bold text-white">다른 글도 확인해보세요</h2>
                  </div>
                </div>
                
                <div className="p-6 space-y-3">
                  {relatedPosts.map((post, idx) => {
                    const getCategoryColor = (category) => {
                      if (category?.includes('개인회생')) return 'bg-emerald-100 text-emerald-700 border-emerald-200';
                      if (category?.includes('개인파산')) return 'bg-red-100 text-red-700 border-red-200';
                      if (category?.includes('법인회생')) return 'bg-blue-100 text-blue-700 border-blue-200';
                      if (category?.includes('법인파산')) return 'bg-orange-100 text-orange-700 border-orange-200';
                      if (category?.includes('질문')) return 'bg-purple-100 text-purple-700 border-purple-200';
                      return 'bg-gray-100 text-gray-700 border-gray-200';
                    };

                    return (
                      <div key={post.id} className="group">
                        <Link href={`/post/${post.id}`} className="block">
                          <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 hover:border-gray-200">
                            <div className="flex items-center gap-3 mb-3">
                              <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs font-medium min-w-[1.5rem] text-center">
                                {idx + 1}
                              </span>
                              <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getCategoryColor(post.category)}`}>
                                {post.category}
                              </span>
                              <div className="ml-auto text-xs text-gray-500 flex items-center gap-1">
                                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                                </svg>
                                {post.created_at ? post.created_at.slice(5, 10) : '01-01'}
                              </div>
                            </div>
                            
                            <h3 className="text-base font-semibold text-gray-900 group-hover:text-blue-600 transition-colors leading-6 mb-3">
                              {post.title}
                              {post.comment_count > 0 && (
                                <span className="text-sm text-blue-600 ml-2 font-medium">
                                  💬 {post.comment_count}
                                </span>
                              )}
                            </h3>
                            
                            <div className="flex items-center justify-between text-sm text-gray-600">
                              <div className="flex items-center gap-4">
                                <span className="flex items-center gap-1">
                                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                  </svg>
                                  {post.nickname}
                                </span>
                                <span className="flex items-center gap-1">
                                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                                    <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                                  </svg>
                                  {post.view_count}
                                </span>
                              </div>
                            </div>
                          </div>
                        </Link>
                      </div>
                    );
                  })}
                </div>

                <div className="bg-gradient-to-r from-gray-50 to-slate-50 px-6 py-4 border-t border-gray-200">
                  <div className="text-center">
                    <Link 
                      href="/"
                      className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all duration-200 text-sm font-semibold shadow-sm hover:shadow-md"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM4.332 8.027a6.012 6.012 0 011.912-2.706C6.512 5.73 6.974 6 7.5 6A1.5 1.5 0 019 7.5V8a2 2 0 004 0 2 2 0 011.523-1.943A5.977 5.977 0 0116 10c0 .34-.028.675-.083 1H15a2 2 0 00-2 2v2.197A5.973 5.973 0 0110 16v-2a2 2 0 00-2-2 2 2 0 01-2-2 2 2 0 00-1.668-1.973z" clipRule="evenodd" />
                      </svg>
                      전체 게시글 보기
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 우측 영역 */}
          <div className="col-span-3">
            <div className="sticky top-6 space-y-6">
              {/* 실시간 인기글 */}
              <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-xl shadow-sm border border-orange-100 overflow-hidden">
                <div className="bg-gradient-to-r from-orange-500 to-red-500 px-4 py-3">
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd" />
                    </svg>
                    <h3 className="font-bold text-white text-sm">실시간 인기</h3>
                  </div>
                </div>
                <div className="p-4">
                  <div className="space-y-3">
                    {popularPosts.map((post, index) => (
                      <Link key={post.id} href={`/post/${post.id}`} className="group block">
                        <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-white/70 transition-all duration-200 hover:shadow-sm">
                          <div className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-200 group-hover:scale-110 ${
                            index === 0 ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white shadow-md' :
                            index === 1 ? 'bg-gradient-to-r from-gray-300 to-gray-400 text-white shadow-md' :
                            index === 2 ? 'bg-gradient-to-r from-amber-600 to-yellow-600 text-white shadow-md' :
                            'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-600'
                          }`}>
                            {index + 1}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 group-hover:text-orange-600 transition-colors line-clamp-2 leading-5">
                              {post.title}
                            </p>
                            <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                              <span className="flex items-center gap-1">
                                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                  <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                                  <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                                </svg>
                                {post.view_count}
                              </span>
                              <span className="flex items-center gap-1">
                                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z" clipRule="evenodd" />
                                </svg>
                                {post.nickname}
                              </span>
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>

              {/* 우측 내부 광고 */}
              <div className="w-full flex items-center justify-center" style={{ aspectRatio: '1/1', position: 'relative', minHeight: '200px' }}>
                <AdSlot 
                  position="sidebar" 
                  ad={ads.right[0] || ads.sidebar}
                  className="w-full h-full"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 개발용 단축키 안내 */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed bottom-4 right-4 bg-gray-800 text-white text-xs p-3 rounded-lg shadow-lg max-w-xs z-50">
          <div className="font-semibold mb-1">개발용 단축키</div>
          <div>Ctrl+Shift+A: 관리자 권한</div>
          <div>Ctrl+Shift+E: 작성자 권한</div>
        </div>
      )}
    </div>
  );
} 