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

  // 댓글 작성 폼 state
  const [commentForm, setCommentForm] = useState({
    nickname: '',
    password: '',
    content: ''
  });
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  // 답글 관련 state
  const [replyForms, setReplyForms] = useState({}); // 각 댓글별 답글 폼
  const [showReplyForm, setShowReplyForm] = useState({}); // 답글 폼 표시 여부
  const [isSubmittingReply, setIsSubmittingReply] = useState({});

  // 수정/삭제 관련 state
  const [editingComment, setEditingComment] = useState(null); // 수정 중인 댓글 ID
  const [editForm, setEditForm] = useState({ password: '', content: '' }); // 수정 폼
  const [deleteForm, setDeleteForm] = useState({ password: '' }); // 삭제 폼
  const [showDeleteModal, setShowDeleteModal] = useState(null); // 삭제 모달 표시 댓글 ID

  // 추천/힘내 버튼 관련 state
  const [isLiking, setIsLiking] = useState(false);
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

  const popularPosts = [
    { id: 1, title: '개인회생 vs 개인파산 차이점', nickname: '전문가', view_count: 234, comment_count: 12 },
    { id: 2, title: '신용회복위원회 워크아웃 후기', nickname: '경험담', view_count: 189, comment_count: 8 },
    { id: 3, title: '법무사 비용 얼마나 드나요?', nickname: '질문자', view_count: 167, comment_count: 15 },
    { id: 4, title: '회생계획 인가 후 주의사항', nickname: '조언자', view_count: 145, comment_count: 6 },
    { id: 5, title: '면책 결정까지 기간은?', nickname: '궁금이', view_count: 123, comment_count: 9 }
  ];

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

  // 구글 애드센스 배너 컴포넌트
  function AdsenseBanner({ position = 'horizontal' }) {
    const isDev = process.env.NODE_ENV === 'development';
    const adRef = useRef(null);
    const [adLoaded, setAdLoaded] = useState(false);

    useEffect(() => {
      if (isDev) return; // 개발 환경에서는 실행하지 않음
      
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

      const checkAd = () => {
        if (adRef.current) {
          const hasIframe = adRef.current.querySelector('iframe');
          setAdLoaded(!!hasIframe);
        }
      };

      // 짧은 지연 후 광고 로드 시도
      const timer = setTimeout(loadAd, 100);
      const interval = setInterval(checkAd, 500);
      
      return () => {
        clearTimeout(timer);
        clearInterval(interval);
      };
    }, [isDev]);

    // 개발 환경에서는 플레이스홀더만 표시
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
        {/* 광고 더미 (광고가 없을 때만 보임) */}
        {!adLoaded && (
          <div
            style={{
              position: 'absolute',
              left: 0, top: 0, right: 0, bottom: 0,
              background: '#ffffff',
              border: '1px solid #e5e7eb',
              color: '#9ca3af',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '12px',
              zIndex: 1
            }}
          >
            구글 애드센스 광고 준비중...
          </div>
        )}
        {/* 구글 애드센스 광고 */}
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
          data-full-width-responsive="false"
        />
      </div>
    );
  }

  useEffect(() => {
    fetchPost();
    fetchAds();
    fetchRelatedPosts();
  }, [postId]);

  // 추천/힘내요 수 로드
  const loadLikesAndCheers = () => {
    try {
      const likesKey = `post_likes_${postId}`;
      const cheersKey = `post_cheers_${postId}`;
      
      const savedLikes = parseInt(localStorage.getItem(likesKey) || '0');
      const savedCheers = parseInt(localStorage.getItem(cheersKey) || '0');
      
      setPost(prev => prev ? ({
        ...prev,
        likes: (prev.likes || 0) + savedLikes,
        cheers: (prev.cheers || 0) + savedCheers
      }) : null);
      
      console.log(`💾 저장된 데이터 로드: 추천 ${savedLikes}개, 힘내요 ${savedCheers}개`);
    } catch (error) {
      console.error('추천/힘내요 데이터 로드 실패:', error);
    }
  };

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
        // 에러 시 샘플 데이터 사용
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
    
    // 추천/힘내요 데이터 로드
    setTimeout(() => {
      loadLikesAndCheers();
    }, 100);
    
    // 댓글 로딩
    loadCommentsFromStorage();
    setLoading(false);
  };

  // 실제 댓글 데이터 가져오기
  const loadCommentsFromStorage = async () => {
    try {
      console.log('댓글 로딩 시작:', postId);
      
      // 실제 데이터베이스에서 댓글 가져오기 시도
      const { data, error } = await supabase
        .from('comments')
        .select('*')
        .eq('post_id', postId)
        .order('created_at', { ascending: true });
      
      console.log('댓글 데이터:', data);
      console.log('댓글 에러:', error);
      
      if (!error && data) {
        console.log('원본 댓글 상세:', data.map(c => ({ 
          id: c.id, 
          nickname: c.nickname, 
          parent_id: c.parent_id,
          content: c.content.substring(0, 20) + '...'
        })));
        
        // 계층적 구조로 변환 (부모 댓글과 답글 분리)
        const parentComments = data.filter(comment => comment.parent_id === null || comment.parent_id === undefined);
        const allReplies = data.filter(comment => comment.parent_id !== null && comment.parent_id !== undefined);
        
        console.log('부모 댓글:', parentComments.length, parentComments.map(c => c.id));
        console.log('모든 답글:', allReplies.length, allReplies.map(c => ({ id: c.id, parent_id: c.parent_id })));
        
        // 각 원댓글에 대해 관련된 모든 답글 찾기 (답글의 답글 포함)
        const commentsWithReplies = parentComments.map(parent => {
          // 해당 원댓글과 관련된 모든 답글 찾기 (재귀적으로)
          const findAllReplies = (parentId) => {
            const directReplies = allReplies.filter(reply => reply.parent_id === parentId);
            const nestedReplies = directReplies.flatMap(reply => findAllReplies(reply.id));
            return [...directReplies, ...nestedReplies];
          };
          
          const allRelatedReplies = findAllReplies(parent.id);
          // 시간순으로 정렬
          allRelatedReplies.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
          
          return {
            ...parent,
            replies: allRelatedReplies
          };
        });
        
        console.log('변환된 댓글:', commentsWithReplies);
        console.log('각 댓글의 답글 수:', commentsWithReplies.map(c => ({ id: c.id, repliesCount: c.replies.length })));
        
        setComments(commentsWithReplies);
        return commentsWithReplies;
      } else {
        // 댓글 테이블이 없거나 에러 시 localStorage 사용
        console.log('데이터베이스 실패, localStorage 사용');
        const storageKey = `comments_${postId}`;
        const savedComments = localStorage.getItem(storageKey);
        if (savedComments) {
          try {
            const parsedComments = JSON.parse(savedComments);
            console.log('localStorage에서 로딩된 댓글:', parsedComments);
            setComments(parsedComments);
            return parsedComments;
          } catch (e) {
            console.error('localStorage 댓글 데이터 손상, 제거:', e);
            localStorage.removeItem(storageKey);
            // 손상된 데이터 제거 후 샘플 데이터 사용
            console.log('샘플 댓글 사용');
            setComments(sampleComments);
            localStorage.setItem(storageKey, JSON.stringify(sampleComments));
            return sampleComments;
          }
        } else {
          // 저장된 댓글이 없으면 샘플 댓글 사용
          console.log('샘플 댓글 사용');
          setComments(sampleComments);
          localStorage.setItem(storageKey, JSON.stringify(sampleComments));
          return sampleComments;
        }
      }
    } catch (error) {
      console.error('댓글 로딩 실패:', error);
      setComments(sampleComments);
      return sampleComments;
    }
  };



  // 관련 게시글 가져오기
  const fetchRelatedPosts = async () => {
    try {
      console.log('관련 게시글 가져오기 시작');
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .neq('id', postId)
        .order('created_at', { ascending: false })
        .limit(10);
      
      console.log('관련 게시글 결과:', { data, error });
      
      if (!error && data && data.length > 0) {
        console.log(`관련 게시글 ${data.length}개 로드됨`);
        setRelatedPosts(data);
      } else {
        console.log('데이터베이스 실패 또는 데이터 없음, 샘플 데이터 사용');
        // 실제 데이터베이스에서 모든 게시글을 다시 시도
        const { data: allPosts, error: allError } = await supabase
          .from('posts')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(15);
          
        if (!allError && allPosts && allPosts.length > 0) {
          // 현재 게시글 제외한 최신 게시글들
          const filteredPosts = allPosts.filter(post => post.id !== postId).slice(0, 10);
          console.log(`전체 게시글에서 ${filteredPosts.length}개 필터링됨`);
          setRelatedPosts(filteredPosts);
        } else {
          // 최종적으로 샘플 데이터 사용
          console.log('최종 샘플 데이터 사용');
          setRelatedPosts([
            { id: 101, title: '개인회생 vs 개인파산 차이점이 궁금해요', nickname: '질문자', category: '개인회생', created_at: '2024-01-20', view_count: 234, comment_count: 12, isNotice: false },
            { id: 102, title: '신용회복위원회 워크아웃 신청 후기', nickname: '경험담', category: '워크아웃', created_at: '2024-01-19', view_count: 189, comment_count: 8, isNotice: false },
            { id: 103, title: '법무사 비용 얼마나 드나요?', nickname: '준비중', category: '법무사상담', created_at: '2024-01-19', view_count: 167, comment_count: 15, isNotice: false },
            { id: 104, title: '회생계획 인가 후 주의사항들', nickname: '조언자', category: '회생절차', created_at: '2024-01-18', view_count: 145, comment_count: 6, isNotice: false },
            { id: 105, title: '면책 결정까지 기간은 보통 얼마나?', nickname: '궁금이', category: '개인파산', created_at: '2024-01-18', view_count: 123, comment_count: 9, isNotice: false },
            { id: 106, title: '신용점수 회복 방법 공유합니다', nickname: '회복중', category: '신용점수', created_at: '2024-01-17', view_count: 201, comment_count: 18, isNotice: false },
            { id: 107, title: '대출 정리하고 개인회생 신청했어요', nickname: '새출발', category: '대출관련', created_at: '2024-01-17', view_count: 178, comment_count: 11, isNotice: false },
            { id: 108, title: '변호사 vs 법무사 어떤 차이가?', nickname: '고민남', category: '변호사상담', created_at: '2024-01-16', view_count: 156, comment_count: 7, isNotice: false }
          ]);
        }
      }
    } catch (error) {
      console.error('관련 게시글 가져오기 실패:', error);
      setRelatedPosts([]);
    }
  };

  // 광고 데이터 가져오기
  const fetchAds = async () => {
    try {
      // 개인광고 (좌측) 가져오기
      const { data: personalAds, error: personalError } = await supabase
        .from('custom_banners')
        .select('*')
        .order('slot_number');

      // 광고주 광고 (우측) 가져오기
      const { data: adsData, error: adsError } = await supabase
        .from('ads')
        .select('*')
        .eq('status', 'active');

      let leftAds = [];
      let rightAds = [];
      let sidebarAd = null;

      // 개인광고 처리 (좌측 3개)
      if (!personalError && personalAds) {
        leftAds = personalAds.slice(0, 3).map(ad => ({
          id: ad.id,
          title: `개인광고 ${ad.slot_number}`,
          image_url: ad.image_url,
          website: ad.link || '#'
        }));
      }

      // 광고주 광고 처리 (우측 사이드바)
      if (!adsError && adsData) {
        // 우측 사이드바용 광고 (광고주들의 광고 중에서)
        sidebarAd = adsData[0] ? {
          id: adsData[0].id,
          title: adsData[0].title,
          image_url: adsData[0].image_url,
          website: adsData[0].website || '#'
        } : null;
      }

      setAds({
        left: leftAds,
        right: rightAds,
        sidebar: sidebarAd
      });
    } catch (error) {
      console.error('광고 데이터 가져오기 실패:', error);
      // 기본 샘플 데이터 사용
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

  // 댓글 입력 핸들러
  const handleCommentChange = (e) => {
    const { name, value } = e.target;
    setCommentForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // 댓글 등록 함수
  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    
    if (!commentForm.nickname.trim()) {
      alert('닉네임을 입력해주세요.');
      return;
    }
    if (!commentForm.password.trim()) {
      alert('비밀번호를 입력해주세요.');
      return;
    }
    if (!commentForm.content.trim()) {
      alert('댓글 내용을 입력해주세요.');
      return;
    }

    setIsSubmittingComment(true);
    console.log('댓글 등록 시작:', commentForm);

    try {
      // 새 댓글 객체 미리 생성
      const newComment = {
        id: Date.now(), // 임시 ID
        nickname: commentForm.nickname,
        content: commentForm.content,
        created_at: new Date().toISOString(),
        password: commentForm.password,
        parent_id: null,
        replies: []
      };

      // 즉시 UI 업데이트 (사용자 경험 개선)
      const immediateUpdatedComments = [...comments, newComment];
      setComments(immediateUpdatedComments);
      console.log('즉시 UI 업데이트:', immediateUpdatedComments);

      // 실제 데이터베이스에 댓글 저장
      const { data, error } = await supabase
        .from('comments')
        .insert([{
          post_id: postId,
          nickname: commentForm.nickname,
          content: commentForm.content,
          password: commentForm.password,
          created_at: new Date().toISOString(),
          parent_id: null
        }])
        .select();

      console.log('댓글 등록 결과:', { data, error });

      if (!error && data) {
        console.log('댓글 등록 성공, 최신 댓글 로딩');
        // 성공적으로 저장되면 댓글 목록 새로고침 (실제 ID로 업데이트)
        await loadCommentsFromStorage();
        
        // 게시글 댓글 수 업데이트
        await supabase
          .from('posts')
          .update({ comment_count: (post?.comment_count || 0) + 1 })
          .eq('id', postId);
        
        setPost(prev => prev ? ({
          ...prev,
          comment_count: prev.comment_count + 1
        }) : null);
        
      } else {
        console.log('댓글 등록 실패, localStorage 사용');
        // 데이터베이스 저장 실패 시 로컬 저장 사용
        // localStorage에 저장
        try {
          const storageKey = `comments_${postId}`;
          const jsonString = JSON.stringify(immediateUpdatedComments);
          localStorage.setItem(storageKey, jsonString);
          console.log('댓글 localStorage 저장 성공');
        } catch (storageError) {
          console.error('댓글 localStorage 저장 실패:', storageError);
          // localStorage 용량 초과 등의 문제 시 기존 데이터 정리
          try {
            const keys = Object.keys(localStorage);
            keys.filter(key => key.startsWith('comments_')).forEach(key => {
              if (key !== `comments_${postId}`) {
                localStorage.removeItem(key);
              }
            });
            localStorage.setItem(`comments_${postId}`, JSON.stringify(immediateUpdatedComments));
          } catch (e) {
            console.error('localStorage 정리 후에도 저장 실패:', e);
          }
        }
        
        // 게시글 댓글 수 업데이트
        setPost(prev => prev ? ({
          ...prev,
          comment_count: prev.comment_count + 1
        }) : null);
      }

      // 폼 초기화
      setCommentForm({
        nickname: '',
        password: '',
        content: ''
      });

      alert('댓글이 등록되었습니다.');

    } catch (error) {
      console.error('댓글 등록 실패:', error);
      // 에러 발생 시 UI를 원래 상태로 복원
      await loadCommentsFromStorage();
      alert('댓글 등록에 실패했습니다.');
    } finally {
      setIsSubmittingComment(false);
    }
  };

  // 답글 폼 토글
  const toggleReplyForm = (commentId) => {
    setShowReplyForm(prev => ({
      ...prev,
      [commentId]: !prev[commentId]
    }));
    
    // 답글 폼 초기화
    if (!showReplyForm[commentId]) {
      setReplyForms(prev => ({
        ...prev,
        [commentId]: { nickname: '', password: '', content: '' }
      }));
    }
  };

  // 답글 입력 핸들러
  const handleReplyChange = (commentId, e) => {
    const { name, value } = e.target;
    setReplyForms(prev => ({
      ...prev,
      [commentId]: {
        ...prev[commentId],
        [name]: value
      }
    }));
  };

  // 답글 등록 함수
  const handleReplySubmit = async (commentId, e) => {
    e.preventDefault();
    
    const replyForm = replyForms[commentId];
    if (!replyForm?.nickname?.trim()) {
      alert('닉네임을 입력해주세요.');
      return;
    }
    if (!replyForm?.password?.trim()) {
      alert('비밀번호를 입력해주세요.');
      return;
    }
    if (!replyForm?.content?.trim()) {
      alert('답글 내용을 입력해주세요.');
      return;
    }

    setIsSubmittingReply(prev => ({ ...prev, [commentId]: true }));
    console.log('답글 등록 시작:', commentId, replyForm);

    try {
      // 새 답글 객체 미리 생성
      const newReply = {
        id: Date.now(), // 임시 ID
        nickname: replyForm.nickname,
        content: replyForm.content,
        created_at: new Date().toISOString(),
        parent_id: commentId
      };

      // 즉시 UI 업데이트 (사용자 경험 개선)
      const immediateUpdatedComments = comments.map(comment => {
        // 해당 댓글이나 그 답글에 새 답글이 달리는 경우
        if (comment.id === commentId || (comment.replies && comment.replies.some(r => r.id === commentId))) {
          return { ...comment, replies: [...(comment.replies || []), newReply] };
        }
        return comment;
      });
      setComments(immediateUpdatedComments);
      console.log('답글 즉시 UI 업데이트:', immediateUpdatedComments);

      // 실제 데이터베이스에 답글 저장
      const { data, error } = await supabase
        .from('comments')
        .insert([{
          post_id: postId,
          nickname: replyForm.nickname,
          content: replyForm.content,
          password: replyForm.password,
          created_at: new Date().toISOString(),
          parent_id: commentId
        }])
        .select();

      console.log('답글 등록 결과:', { data, error });

      if (!error && data) {
        console.log('답글 등록 성공, 최신 댓글 로딩');
        // 성공적으로 저장되면 댓글 목록 새로고침 (실제 ID로 업데이트)
        await loadCommentsFromStorage();
        
        // 게시글 댓글 수 업데이트 (답글도 댓글 수에 포함)
        await supabase
          .from('posts')
          .update({ comment_count: (post?.comment_count || 0) + 1 })
          .eq('id', postId);
        
        setPost(prev => prev ? ({
          ...prev,
          comment_count: prev.comment_count + 1
        }) : null);
        
      } else {
        console.log('답글 등록 실패, localStorage 사용');
        // 데이터베이스 저장 실패 시 로컬 저장 사용
        // localStorage에 저장
        try {
          const storageKey = `comments_${postId}`;
          localStorage.setItem(storageKey, JSON.stringify(immediateUpdatedComments));
        } catch (storageError) {
          console.error('답글 localStorage 저장 실패:', storageError);
        }

        // 게시글 댓글 수 업데이트 (답글도 댓글 수에 포함)
        setPost(prev => prev ? ({
          ...prev,
          comment_count: prev.comment_count + 1
        }) : null);
      }

      // 답글 폼 초기화 및 숨기기
      setReplyForms(prev => ({
        ...prev,
        [commentId]: { nickname: '', password: '', content: '' }
      }));
      setShowReplyForm(prev => ({ ...prev, [commentId]: false }));

      alert('답글이 등록되었습니다.');

    } catch (error) {
      console.error('답글 등록 실패:', error);
      // 에러 발생 시 UI를 원래 상태로 복원
      await loadCommentsFromStorage();
      alert('답글 등록에 실패했습니다.');
    } finally {
      setIsSubmittingReply(prev => ({ ...prev, [commentId]: false }));
    }
  };

  // 댓글 수정 시작
  const startEdit = (comment) => {
    setEditingComment(comment.id);
    setEditForm({ password: '', content: comment.content });
  };

  // 댓글 수정 취소
  const cancelEdit = () => {
    setEditingComment(null);
    setEditForm({ password: '', content: '' });
  };

  // 댓글 수정 제출
  const handleEditSubmit = async (commentId, e) => {
    e.preventDefault();
    
    if (!editForm.password.trim()) {
      alert('비밀번호를 입력해주세요.');
      return;
    }
    if (!editForm.content.trim()) {
      alert('댓글 내용을 입력해주세요.');
      return;
    }

    try {
      // 실제 데이터베이스에서 수정
      const { data, error } = await supabase
        .from('comments')
        .update({ 
          content: editForm.content,
          updated_at: new Date().toISOString()
        })
        .eq('id', commentId)
        .eq('password', editForm.password)
        .select();

      if (!error && data && data.length > 0) {
        // 성공적으로 수정되면 댓글 목록 새로고침
        await loadCommentsFromStorage();
        cancelEdit();
        alert('댓글이 수정되었습니다.');
      } else {
        // 데이터베이스 수정 실패 시 로컬 저장소 사용
        const updateLocalComments = (comments) => {
          return comments.map(comment => {
            if (comment.id === commentId) {
              return { ...comment, content: editForm.content };
            }
            if (comment.replies) {
              return {
                ...comment,
                replies: comment.replies.map(reply => 
                  reply.id === commentId ? { ...reply, content: editForm.content } : reply
                )
              };
            }
            return comment;
          });
        };

        const updatedComments = updateLocalComments(comments);
        setComments(updatedComments);
        
        try {
          const storageKey = `comments_${postId}`;
          localStorage.setItem(storageKey, JSON.stringify(updatedComments));
        } catch (error) {
          console.error('댓글 수정 저장 실패:', error);
        }
        
        cancelEdit();
        alert('댓글이 수정되었습니다.');
      }
    } catch (error) {
      console.error('댓글 수정 실패:', error);
      alert('댓글 수정에 실패했습니다.');
    }
  };

  // 삭제 모달 표시
  const showDeleteConfirm = (commentId) => {
    setShowDeleteModal(commentId);
    setDeleteForm({ password: '' });
  };

  // 삭제 모달 닫기
  const closeDeleteModal = () => {
    setShowDeleteModal(null);
    setDeleteForm({ password: '' });
  };

  // 댓글 삭제
  const handleDeleteSubmit = async (commentId, e) => {
    e.preventDefault();
    
    if (!deleteForm.password.trim()) {
      alert('비밀번호를 입력해주세요.');
      return;
    }

    try {
      // 실제 데이터베이스에서 삭제
      const { data, error } = await supabase
        .from('comments')
        .delete()
        .eq('id', commentId)
        .eq('password', deleteForm.password);

      if (!error) {
        // 성공적으로 삭제되면 댓글 목록 새로고침
        await loadCommentsFromStorage();
        
        // 게시글 댓글 수 감소
        await supabase
          .from('posts')
          .update({ comment_count: Math.max(0, (post?.comment_count || 1) - 1) })
          .eq('id', postId);
        
        setPost(prev => prev ? ({
          ...prev,
          comment_count: Math.max(0, prev.comment_count - 1)
        }) : null);
        
        closeDeleteModal();
        alert('댓글이 삭제되었습니다.');
      } else {
        // 데이터베이스 삭제 실패 시 로컬 저장소 사용
        const deleteLocalComment = (comments) => {
          return comments.reduce((acc, comment) => {
            if (comment.id === commentId) {
              return acc; // 해당 댓글 제거
            }
            if (comment.replies) {
              return [...acc, {
                ...comment,
                replies: comment.replies.filter(reply => reply.id !== commentId)
              }];
            }
            return [...acc, comment];
          }, []);
        };

        const updatedComments = deleteLocalComment(comments);
        setComments(updatedComments);
        
        try {
          const storageKey = `comments_${postId}`;
          localStorage.setItem(storageKey, JSON.stringify(updatedComments));
        } catch (error) {
          console.error('댓글 삭제 저장 실패:', error);
        }
        
        // 댓글 수 감소
        setPost(prev => prev ? ({
          ...prev,
          comment_count: Math.max(0, prev.comment_count - 1)
        }) : null);
        
        closeDeleteModal();
        alert('댓글이 삭제되었습니다.');
      }
    } catch (error) {
      console.error('댓글 삭제 실패:', error);
      alert('댓글 삭제에 실패했습니다.');
    }
  };

  // 추천 버튼 클릭 여부 확인
  const hasUserLiked = () => {
    try {
      const clickedKey = `post_liked_${postId}`;
      return localStorage.getItem(clickedKey) === 'true';
    } catch (error) {
      return false;
    }
  };

  // 추천 수 가져오기
  const getLikeCount = () => {
    try {
      const likesKey = `post_likes_${postId}`;
      return parseInt(localStorage.getItem(likesKey) || '0');
    } catch (error) {
      return 0;
    }
  };

  // 추천(좋아요) 버튼 클릭 핸들러
  const handleLikeClick = async () => {
    // 이미 클릭했는지 확인
    if (hasUserLiked()) {
      alert('이미 추천을 누르셨습니다.');
      return;
    }

    setIsLiking(true);
    
    try {
      // localStorage에서 현재 클릭 수 가져오기
      const storageKey = `post_likes_${postId}`;
      const clickedKey = `post_liked_${postId}`;
      const currentClicks = parseInt(localStorage.getItem(storageKey) || '0');
      const newClicks = currentClicks + 1;
      
      // localStorage에 저장
      localStorage.setItem(storageKey, newClicks.toString());
      localStorage.setItem(clickedKey, 'true'); // 클릭 여부 저장
      
      // 즉시 UI 업데이트
      setPost(prev => prev ? ({
        ...prev,
        likes: newClicks
      }) : null);
      
      console.log(`👍 추천 +1 (총 클릭: ${newClicks}번)`);
      
    } catch (error) {
      console.error('추천 처리 실패:', error);
    } finally {
      setIsLiking(false);
    }
  };

  // 힘내 버튼 클릭 여부 확인
  const hasUserCheered = () => {
    try {
      const clickedKey = `post_cheered_${postId}`;
      return localStorage.getItem(clickedKey) === 'true';
    } catch (error) {
      return false;
    }
  };

  // 힘내 수 가져오기
  const getCheerCount = () => {
    try {
      const cheersKey = `post_cheers_${postId}`;
      return parseInt(localStorage.getItem(cheersKey) || '0');
    } catch (error) {
      return 0;
    }
  };

  // 힘내요 버튼 클릭 핸들러
  const handleCheerClick = async () => {
    // 이미 클릭했는지 확인
    if (hasUserCheered()) {
      alert('이미 힘내요를 누르셨습니다.');
      return;
    }

    setIsCheering(true);
    
    try {
      // localStorage에서 현재 클릭 수 가져오기
      const storageKey = `post_cheers_${postId}`;
      const clickedKey = `post_cheered_${postId}`;
      const currentClicks = parseInt(localStorage.getItem(storageKey) || '0');
      const newClicks = currentClicks + 1;
      
      // localStorage에 저장
      localStorage.setItem(storageKey, newClicks.toString());
      localStorage.setItem(clickedKey, 'true'); // 클릭 여부 저장
      
      // 즉시 UI 업데이트
      setPost(prev => prev ? ({
        ...prev,
        cheers: newClicks
      }) : null);
      
      console.log(`💪 힘내요 +1 (총 클릭: ${newClicks}번)`);
      
    } catch (error) {
      console.error('힘내요 처리 실패:', error);
    } finally {
      setIsCheering(false);
    }
  };

  // 작성자 권한 확인
  const canEditPost = () => {
    // 개발용: Ctrl+Shift+E로 작성자 권한 토글
    try {
      const authorKey = `post_author_${postId}`;
      const savedAuthor = localStorage.getItem(authorKey);
      
      // 임시로 키보드 단축키로 작성자 권한 설정 가능
      if (savedAuthor === 'temp_author') {
        return true;
      }
      
      // 실제 작성자 확인 (현재는 localStorage 기반)
      const currentUser = localStorage.getItem('current_user');
      
      if (!savedAuthor && post) {
        // 게시글 작성 시 저장된 정보가 있는지 확인
        const writerKey = `post_writer_${post.nickname}`;
        return localStorage.getItem(writerKey) === 'true';
      }
      
      return savedAuthor === currentUser;
    } catch (error) {
      return false;
    }
  };

  // 작성자 권한 설정 (개발용)
  useEffect(() => {
    const handleKeyPress = (e) => {
      // Ctrl + Shift + E 를 눌러 작성자 권한 토글
      if (e.ctrlKey && e.shiftKey && e.key === 'E') {
        const authorKey = `post_author_${postId}`;
        const currentAuthor = localStorage.getItem(authorKey);
        
        if (currentAuthor === 'temp_author') {
          localStorage.removeItem(authorKey);
          console.log('✏️ 작성자 권한 해제됨');
          alert('작성자 권한이 해제되었습니다.');
        } else {
          localStorage.setItem(authorKey, 'temp_author');
          console.log('✏️ 작성자 권한 설정됨');
          alert('작성자 권한이 설정되었습니다.');
        }
        // 페이지 새로고침으로 버튼 상태 업데이트
        window.location.reload();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [postId]);

  // 관리자 권한 확인
  const isAdmin = () => {
    try {
      const adminKey = 'user_role';
      return localStorage.getItem(adminKey) === 'admin';
    } catch (error) {
      return false;
    }
  };

  // 관리자 권한 설정 (개발용 - 키보드 단축키)
  useEffect(() => {
    const handleKeyPress = (e) => {
      // Ctrl + Shift + A 를 눌러 관리자 권한 토글
      if (e.ctrlKey && e.shiftKey && e.key === 'A') {
        const currentRole = localStorage.getItem('user_role');
        if (currentRole === 'admin') {
          localStorage.removeItem('user_role');
          console.log('👤 관리자 권한 해제됨');
          alert('관리자 권한이 해제되었습니다.');
        } else {
          localStorage.setItem('user_role', 'admin');
          console.log('🛡️ 관리자 권한 설정됨');
          alert('관리자 권한이 설정되었습니다.');
        }
        // 페이지 새로고침으로 버튼 상태 업데이트
        window.location.reload();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  // 게시글 수정 핸들러
  const handleEditPost = () => {
    // 수정 페이지로 이동
    window.location.href = `/board/edit/${postId}`;
  };

  // 게시글 삭제 핸들러 (작성자)
  const handleDeletePost = () => {
    setShowPostDeleteModal(true);
  };

  // 관리자 삭제 핸들러
  const handleAdminDelete = () => {
    if (confirm('관리자 권한으로 이 게시글을 삭제하시겠습니까?')) {
      handlePostDelete(true);
    }
  };

  // 게시글 삭제 실행
  const handlePostDelete = async (isAdminDelete = false) => {
    if (!isAdminDelete && !postDeleteForm.password.trim()) {
      alert('비밀번호를 입력해주세요.');
      return;
    }

    setIsDeleting(true);

    try {
      // 관련 댓글들 먼저 삭제
      const { error: commentsError } = await supabase
        .from('comments')
        .delete()
        .eq('post_id', postId);

      if (commentsError) {
        console.warn('댓글 삭제 실패:', commentsError);
      }

      // 게시글 삭제 (관리자는 비밀번호 확인 없이 삭제)
      let deleteQuery = supabase
        .from('posts')
        .delete()
        .eq('id', postId);

      if (!isAdminDelete) {
        deleteQuery = deleteQuery.eq('password', postDeleteForm.password);
      }

      const { error, data } = await deleteQuery.select();

      if (!error && data && data.length > 0) {
        // localStorage에서 관련 데이터 모두 제거
        const authorKey = `post_author_${postId}`;
        const likesKey = `post_likes_${postId}`;
        const cheersKey = `post_cheers_${postId}`;
        const likedKey = `post_liked_${postId}`;
        const cheeredKey = `post_cheered_${postId}`;
        const commentsKey = `comments_${postId}`;
        
        localStorage.removeItem(authorKey);
        localStorage.removeItem(likesKey);
        localStorage.removeItem(cheersKey);
        localStorage.removeItem(likedKey);
        localStorage.removeItem(cheeredKey);
        localStorage.removeItem(commentsKey);
        
        alert('게시글이 삭제되었습니다.');
        window.location.href = '/';
      } else if (!error && (!data || data.length === 0)) {
        alert('비밀번호가 일치하지 않습니다.');
      } else {
        // 데이터베이스 삭제 실패 시 localStorage에서 제거
        const postKey = `post_${postId}`;
        localStorage.removeItem(postKey);
        
        alert('게시글이 삭제되었습니다.');
        window.location.href = '/';
      }
    } catch (error) {
      console.error('게시글 삭제 실패:', error);
      alert('게시글 삭제에 실패했습니다.');
    } finally {
      setIsDeleting(false);
      setShowPostDeleteModal(false);
    }
  };

  // 게시글 삭제 모달 닫기
  const closePostDeleteModal = () => {
    setShowPostDeleteModal(false);
    setPostDeleteForm({ password: '' });
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
          <Link 
            href="/" 
            className="text-white flex items-center gap-3"
            onClick={() => {
              console.log('🏠 힘내톡톡 로고 클릭 - 메인 페이지로 이동');
              // 메인 페이지로 이동 시 카테고리와 페이지 초기화
              setTimeout(() => {
                window.location.href = '/';
              }, 100);
            }}
          >
            <div className="text-2xl">🌟</div>
            <div>
              <div className="text-lg font-bold">힘내톡톡</div>
              <div className="text-xs text-gray-300">💡 신용회복, 개인회생, 재도전 정보 공유</div>
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

      {/* 상단 구글 애드센스 광고 (글내용 너비와 동일) */}
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
          
                     {/* 좌측 광고 (광고가 있을 때만 표시) */}
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
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
              <div className="p-6">
                {/* 게시글 헤더 */}
                <div className="mb-4 pb-4 border-b border-gray-100">
                  <div className="flex items-center justify-between mb-3">
                    <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                      {post.category}
                    </span>
                    <div className="flex items-center text-sm text-gray-500 space-x-4">
                      <span>조회 {post.view_count}</span>
                      <span>댓글 {comments.reduce((total, comment) => total + 1 + (comment.replies?.length || 0), 0)}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mb-3">
                    <h1 className="text-2xl font-bold text-gray-900">{post.title}</h1>
                    
                    {/* 수정/삭제 버튼 영역 */}
                    <div className="flex items-center space-x-2">
                      {/* 작성자 본인 버튼 */}
                      {canEditPost() && (
                        <>
                          <button
                            onClick={handleEditPost}
                            className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                          >
                            ✏️ 수정
                          </button>
                          <button
                            onClick={handleDeletePost}
                            className="px-3 py-1 text-xs bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                          >
                            🗑️ 삭제
                          </button>
                        </>
                      )}
                      
                      {/* 관리자 삭제 버튼 */}
                      {isAdmin() && !canEditPost() && (
                        <button
                          onClick={handleAdminDelete}
                          className="px-3 py-1 text-xs bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                        >
                          🛡️ 관리자 삭제
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <span className="font-medium">{post.nickname}</span>
                    <span className="mx-2">•</span>
                    <span>{post.created_at}</span>
                  </div>
                </div>

                {/* 게시글 본문 */}
                <div className="prose max-w-none">
                  <div className="text-gray-800 leading-relaxed whitespace-pre-line">
                    {post.content}
                  </div>
                </div>

                {/* 게시글 하단 */}
                <div className="mt-6 pt-4 border-t border-gray-100">
                  {/* 힘내세요 버튼 - 중앙 정렬 */}
                  <div className="flex justify-center mb-4">
                    <button 
                      onClick={handleCheerClick}
                      disabled={isCheering || hasUserCheered()}
                      className={`relative overflow-hidden group flex items-center space-x-2 px-5 py-2.5 rounded-full font-medium transition-all duration-300 transform ${
                        hasUserCheered() 
                          ? 'bg-gradient-to-r from-orange-400 to-pink-500 text-white shadow-md cursor-not-allowed' 
                          : 'bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 hover:scale-105 hover:shadow-lg active:scale-95'
                      } ${isCheering ? 'animate-pulse' : ''}`}
                    >
                      {/* 배경 애니메이션 효과 */}
                      <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      
                      {/* 아이콘과 텍스트 */}
                      <span className="relative z-10 text-lg">
                        {hasUserCheered() ? '🌟' : '💪'}
                      </span>
                      <span className="relative z-10 text-sm">
                        {hasUserCheered() ? `응원완료 ${getCheerCount()}` : `힘내세요 ${getCheerCount()}`}
                      </span>
                      
                      {/* 버튼 활성화 시 반짝이 효과 */}
                      {hasUserCheered() && (
                        <div className="absolute inset-0 animate-ping bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full opacity-15"></div>
                      )}
                    </button>
                  </div>
                  
                  {/* 공유 버튼 - 우측 하단 */}
                  <div className="flex justify-end">
                    <button className="text-gray-500 hover:text-gray-700 text-sm transition-colors">
                      <span>📤 공유</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* 댓글 섹션 */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  댓글 {comments.length + comments.reduce((total, comment) => total + (comment.replies?.length || 0), 0)}개
                  <span className="text-sm text-gray-500 ml-2">
                    (원댓글 {comments.length}개 + 답글 {comments.reduce((total, comment) => total + (comment.replies?.length || 0), 0)}개)
                  </span>
                </h3>
                
                {/* 디버깅용 - 필요시에만 활성화 */}
                {false && process.env.NODE_ENV === 'development' && (
                  <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded text-sm">
                    <strong>디버깅 정보:</strong>
                    <br />- 댓글 배열 길이: {comments.length}
                    <br />- PostID: {postId}
                    <br />- 댓글 데이터: {JSON.stringify(comments.map(c => ({ id: c.id, nickname: c.nickname, repliesCount: c.replies?.length || 0 })))}
                  </div>
                )}

                {/* 댓글 작성 폼 */}
                <form onSubmit={handleCommentSubmit} className="mb-6 p-4 bg-gray-50 rounded-lg">
                  <div className="flex space-x-3 mb-3">
                    <input
                      type="text"
                      name="nickname"
                      placeholder="닉네임"
                      value={commentForm.nickname}
                      onChange={handleCommentChange}
                      className="px-3 py-2 border border-gray-300 rounded-lg text-sm w-32"
                      required
                    />
                    <input
                      type="password"
                      name="password"
                      placeholder="비밀번호"
                      value={commentForm.password}
                      onChange={handleCommentChange}
                      className="px-3 py-2 border border-gray-300 rounded-lg text-sm w-32"
                      required
                    />
                  </div>
                  <textarea
                    name="content"
                    placeholder="댓글을 입력해주세요..."
                    value={commentForm.content}
                    onChange={handleCommentChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm resize-none mb-3"
                    required
                  />
                  <div className="flex justify-end">
                    <button 
                      type="submit" 
                      disabled={isSubmittingComment}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {isSubmittingComment ? '등록 중...' : '댓글 작성'}
                    </button>
                  </div>
                </form>

                {/* 댓글 삭제 확인 모달 */}
                {showDeleteModal && (
                  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-96">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">댓글 삭제</h3>
                      <p className="text-gray-600 mb-4">댓글을 삭제하시겠습니까? 삭제된 댓글은 복구할 수 없습니다.</p>
                      <form onSubmit={(e) => handleDeleteSubmit(showDeleteModal, e)}>
                        <input
                          type="password"
                          placeholder="비밀번호를 입력해주세요"
                          value={deleteForm.password}
                          onChange={(e) => setDeleteForm(prev => ({ ...prev, password: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm mb-4"
                          required
                          autoFocus
                        />
                        <div className="flex justify-end space-x-3">
                          <button
                            type="button"
                            onClick={closeDeleteModal}
                            className="px-4 py-2 text-gray-600 hover:text-gray-800"
                          >
                            취소
                          </button>
                          <button
                            type="submit"
                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                          >
                            삭제
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                )}

                {/* 게시글 삭제 확인 모달 */}
                {showPostDeleteModal && (
                  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-96">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">게시글 삭제</h3>
                      <p className="text-gray-600 mb-4">게시글을 삭제하시겠습니까? 삭제된 게시글은 복구할 수 없습니다.</p>
                      <form onSubmit={(e) => { e.preventDefault(); handlePostDelete(); }}>
                        <input
                          type="password"
                          placeholder="게시글 작성 시 입력한 비밀번호"
                          value={postDeleteForm.password}
                          onChange={(e) => setPostDeleteForm(prev => ({ ...prev, password: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm mb-4"
                          required
                          autoFocus
                        />
                        <div className="flex justify-end space-x-3">
                          <button
                            type="button"
                            onClick={closePostDeleteModal}
                            className="px-4 py-2 text-gray-600 hover:text-gray-800"
                            disabled={isDeleting}
                          >
                            취소
                          </button>
                          <button
                            type="submit"
                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                            disabled={isDeleting}
                          >
                            {isDeleting ? '삭제 중...' : '삭제'}
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                )}

                {/* 댓글 목록 */}
                <div className="space-y-4">
                  {comments.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <p>아직 댓글이 없습니다.</p>
                      <p className="text-sm mt-1">첫 번째 댓글을 작성해보세요!</p>
                    </div>
                  ) : (
                    comments.map((comment) => (
                    <div key={comment.id} className="space-y-4">
                      {/* 원댓글 */}
                      <div className="p-4 border border-gray-100 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-3">
                            <span className="font-medium text-gray-700">{comment.nickname}</span>
                            <span className="text-xs text-gray-500">{comment.created_at}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <button 
                              onClick={() => toggleReplyForm(comment.id)}
                              className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                            >
                              답글
                            </button>
                            <button 
                              onClick={() => startEdit(comment)}
                              className="text-xs text-gray-500 hover:text-gray-700"
                            >
                              수정
                            </button>
                            <button 
                              onClick={() => showDeleteConfirm(comment.id)}
                              className="text-xs text-gray-500 hover:text-gray-700"
                            >
                              삭제
                            </button>
                          </div>
                        </div>
                        
                        {/* 수정 모드 */}
                        {editingComment === comment.id ? (
                          <form onSubmit={(e) => handleEditSubmit(comment.id, e)} className="space-y-3">
                            <input
                              type="password"
                              placeholder="비밀번호"
                              value={editForm.password}
                              onChange={(e) => setEditForm(prev => ({ ...prev, password: e.target.value }))}
                              className="px-3 py-2 border border-gray-300 rounded-lg text-sm w-32"
                              required
                            />
                            <textarea
                              value={editForm.content}
                              onChange={(e) => setEditForm(prev => ({ ...prev, content: e.target.value }))}
                              rows={3}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm resize-none"
                              required
                            />
                            <div className="flex justify-end space-x-2">
                              <button
                                type="button"
                                onClick={cancelEdit}
                                className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
                              >
                                취소
                              </button>
                              <button
                                type="submit"
                                className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                              >
                                수정
                              </button>
                            </div>
                          </form>
                        ) : (
                          <p className="text-gray-800 leading-relaxed">{comment.content}</p>
                        )}

                        {/* 답글 폼 */}
                        {showReplyForm[comment.id] && (
                          <form 
                            onSubmit={(e) => handleReplySubmit(comment.id, e)} 
                            className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200"
                          >
                            <div className="flex space-x-2 mb-2">
                              <input
                                type="text"
                                name="nickname"
                                placeholder="닉네임"
                                value={replyForms[comment.id]?.nickname || ''}
                                onChange={(e) => handleReplyChange(comment.id, e)}
                                className="px-2 py-1 border border-gray-300 rounded text-xs w-24"
                                required
                              />
                              <input
                                type="password"
                                name="password"
                                placeholder="비밀번호"
                                value={replyForms[comment.id]?.password || ''}
                                onChange={(e) => handleReplyChange(comment.id, e)}
                                className="px-2 py-1 border border-gray-300 rounded text-xs w-24"
                                required
                              />
                            </div>
                            <textarea
                              name="content"
                              placeholder="답글을 입력해주세요..."
                              value={replyForms[comment.id]?.content || ''}
                              onChange={(e) => handleReplyChange(comment.id, e)}
                              rows={2}
                              className="w-full px-2 py-1 border border-gray-300 rounded text-xs resize-none mb-2"
                              required
                            />
                            <div className="flex justify-end space-x-2">
                              <button
                                type="button"
                                onClick={() => toggleReplyForm(comment.id)}
                                className="px-3 py-1 text-xs text-gray-600 hover:text-gray-800"
                              >
                                취소
                              </button>
                              <button
                                type="submit"
                                disabled={isSubmittingReply[comment.id]}
                                className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 disabled:opacity-50"
                              >
                                {isSubmittingReply[comment.id] ? '등록 중...' : '답글 등록'}
                              </button>
                            </div>
                          </form>
                        )}
                      </div>

                      {/* 답글 목록 */}
                      {comment.replies && comment.replies.length > 0 && (
                        <div className="ml-8 space-y-3">
                          {comment.replies.map((reply) => {
                            // 답글이 달린 대상 찾기
                            const replyTarget = reply.parent_id === comment.id 
                              ? comment 
                              : comment.replies.find(r => r.id === reply.parent_id);
                            
                            return (
                              <div key={reply.id} className="space-y-3">
                                <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                                  <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center space-x-3">
                                      <span className="text-sm text-blue-600">↳</span>
                                      <span className="font-medium text-gray-700 text-sm">{reply.nickname}</span>
                                      {replyTarget && reply.parent_id !== comment.id && (
                                        <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
                                          @{replyTarget.nickname}
                                        </span>
                                      )}
                                      <span className="text-xs text-gray-500">{reply.created_at}</span>
                                    </div>
                                  <div className="flex items-center space-x-2">
                                    <button 
                                      onClick={() => toggleReplyForm(reply.id)}
                                      className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                                    >
                                      답글
                                    </button>
                                    <button 
                                      onClick={() => startEdit(reply)}
                                      className="text-xs text-gray-500 hover:text-gray-700"
                                    >
                                      수정
                                    </button>
                                    <button 
                                      onClick={() => showDeleteConfirm(reply.id)}
                                      className="text-xs text-gray-500 hover:text-gray-700"
                                    >
                                      삭제
                                    </button>
                                  </div>
                                </div>
                                
                                {/* 수정 모드 */}
                                {editingComment === reply.id ? (
                                  <form onSubmit={(e) => handleEditSubmit(reply.id, e)} className="space-y-2 mt-2">
                                    <input
                                      type="password"
                                      placeholder="비밀번호"
                                      value={editForm.password}
                                      onChange={(e) => setEditForm(prev => ({ ...prev, password: e.target.value }))}
                                      className="px-2 py-1 border border-gray-300 rounded text-xs w-24"
                                      required
                                    />
                                    <textarea
                                      value={editForm.content}
                                      onChange={(e) => setEditForm(prev => ({ ...prev, content: e.target.value }))}
                                      rows={2}
                                      className="w-full px-2 py-1 border border-gray-300 rounded text-xs resize-none"
                                      required
                                    />
                                    <div className="flex justify-end space-x-2">
                                      <button
                                        type="button"
                                        onClick={cancelEdit}
                                        className="px-2 py-1 text-xs text-gray-600 hover:text-gray-800"
                                      >
                                        취소
                                      </button>
                                      <button
                                        type="submit"
                                        className="px-2 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700"
                                      >
                                        수정
                                      </button>
                                    </div>
                                  </form>
                                ) : (
                                  <p className="text-gray-800 leading-relaxed text-sm">{reply.content}</p>
                                )}

                                {/* 답글의 답글 폼 */}
                                {showReplyForm[reply.id] && (
                                  <form 
                                    onSubmit={(e) => handleReplySubmit(reply.id, e)} 
                                    className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200"
                                  >
                                    <div className="flex space-x-2 mb-2">
                                      <input
                                        type="text"
                                        name="nickname"
                                        placeholder="닉네임"
                                        value={replyForms[reply.id]?.nickname || ''}
                                        onChange={(e) => handleReplyChange(reply.id, e)}
                                        className="px-2 py-1 border border-gray-300 rounded text-xs w-24"
                                        required
                                      />
                                      <input
                                        type="password"
                                        name="password"
                                        placeholder="비밀번호"
                                        value={replyForms[reply.id]?.password || ''}
                                        onChange={(e) => handleReplyChange(reply.id, e)}
                                        className="px-2 py-1 border border-gray-300 rounded text-xs w-24"
                                        required
                                      />
                                    </div>
                                    <textarea
                                      name="content"
                                      placeholder="답글을 입력해주세요..."
                                      value={replyForms[reply.id]?.content || ''}
                                      onChange={(e) => handleReplyChange(reply.id, e)}
                                      rows={2}
                                      className="w-full px-2 py-1 border border-gray-300 rounded text-xs resize-none mb-2"
                                      required
                                    />
                                    <div className="flex justify-end space-x-2">
                                      <button
                                        type="button"
                                        onClick={() => toggleReplyForm(reply.id)}
                                        className="px-3 py-1 text-xs text-gray-600 hover:text-gray-800"
                                      >
                                        취소
                                      </button>
                                      <button
                                        type="submit"
                                        disabled={isSubmittingReply[reply.id]}
                                        className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 disabled:opacity-50"
                                      >
                                        {isSubmittingReply[reply.id] ? '등록 중...' : '답글 등록'}
                                      </button>
                                    </div>
                                  </form>
                                )}
                              </div>
                            </div>
                          );
                          })}
                        </div>
                      )}
                    </div>
                  ))
                  )}
                </div>
              </div>
            </div>

            {/* 하단 구글 애드센스 광고 (댓글 바로 아래) */}
            <div className="mt-4">
              <AdsenseBanner position="horizontal" />
            </div>

            {/* 관련 게시글 리스트 */}
            <div className="mt-6">
              <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                {/* 헤더 */}
                <div className="bg-gray-800 px-4 py-3">
                  <h2 className="text-lg font-bold text-white">💡 다른 글도 확인해보세요</h2>
                </div>
                
                {/* 테이블 헤더 */}
                <div className="relative bg-gray-50 px-4 py-2">
                  <div className="flex items-center">
                    <div className="w-16 text-center text-sm font-medium text-gray-600">번호</div>
                    <div className="w-20 text-center text-sm font-medium text-gray-600">분류</div>
                    <div className="flex-1 text-left text-sm font-medium text-gray-600">제목</div>
                    <div className="w-24 text-center text-sm font-medium text-gray-600">닉네임</div>
                    <div className="w-20 text-center text-sm font-medium text-gray-600">날짜</div>
                    <div className="w-16 text-center text-sm font-medium text-gray-600">조회</div>
                    <div className="w-16 text-center text-sm font-medium text-gray-600">댓글</div>
                  </div>
                </div>

                {/* 게시글 목록 */}
                {relatedPosts.map((post, idx) => (
                  <div key={post.id} className={`relative px-4 py-3 hover:bg-gray-100 transition-colors ${
                    idx % 2 === 0 ? 'bg-gray-50' : 'bg-white'
                  }`}>
                    <div className="flex items-center">
                      <div className="w-16 text-center text-sm text-gray-500">{idx + 1}</div>
                      <div className="w-20 text-center">
                        <span className="px-2 py-1 bg-blue-100 text-blue-600 rounded text-xs">
                          {post.category}
                        </span>
                      </div>
                      <div className="flex-1 text-left">
                        <Link 
                          href={`/post/${post.id}`}
                          className="text-sm text-gray-900 hover:text-blue-600 font-medium"
                        >
                          {post.title}
                          {post.comment_count > 0 && (
                            <span className="text-xs text-blue-600 ml-1">
                              [{post.comment_count}]
                            </span>
                          )}
                        </Link>
                      </div>
                      <div className="w-24 text-center text-sm text-gray-600">{post.nickname}</div>
                      <div className="w-20 text-center text-sm text-gray-500">{post.created_at.slice(5, 10)}</div>
                      <div className="w-16 text-center text-sm text-gray-500">{post.view_count}</div>
                      <div className="w-16 text-center text-sm text-orange-600 font-medium">
                        {post.comment_count}
                      </div>
                    </div>
                  </div>
                ))}

                {/* 더보기 버튼 */}
                <div className="bg-gray-50 px-4 py-3 text-center border-t">
                  <Link 
                    href="/"
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                  >
                    전체 게시글 보기 →
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* 우측 영역 */}
          <div className="col-span-3">
            <div className="sticky top-6 space-y-6">
              {/* 실시간 인기글 */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="p-4 border-b border-gray-100">
                  <h3 className="font-semibold text-gray-900 flex items-center">
                    <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                    실시간 인기글
                  </h3>
                </div>
                <div className="p-4">
                  <div className="space-y-3">
                    {popularPosts.map((post, index) => (
                      <div key={post.id} className="group cursor-pointer">
                        <div className="flex items-start space-x-3">
                          <span className={`flex-shrink-0 w-5 h-5 rounded text-xs font-bold flex items-center justify-center ${
                            index < 3 ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-600'
                          }`}>
                            {index + 1}
                          </span>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2">
                              {post.title}
                            </p>
                            <div className="flex items-center text-xs text-gray-500 mt-1 space-x-2">
                              <span>{post.nickname}</span>
                              <span>•</span>
                              <span>조회 {post.view_count}</span>
                              <span>•</span>
                              <span>댓글 {post.comment_count}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

                             {/* 우측 내부 광고 1개 (광고주 광고, 메인과 동일 크기) */}
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

      {/* 개발용 단축키 안내 (개발 환경에서만 표시) */}
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