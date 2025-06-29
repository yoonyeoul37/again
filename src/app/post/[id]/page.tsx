'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';
import AdSlot from '@/components/AdSlot';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faComment } from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '@/components/AuthProvider';

// 구글 애드센스 타입 정의
declare global {
  interface Window {
    adsbygoogle: any[];
  }
}

export default function PostDetailPage() {
  const params = useParams();
  const postId = params.id;
  const { user } = useAuth(); // AuthProvider에서 사용자 정보 가져오기
  
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
  const [userLocation, setUserLocation] = useState<any>(null); // 사용자 위치 정보

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
  const [cheerCount, setCheerCount] = useState(0);
  const [hasUserCheered, setHasUserCheered] = useState(false);

  // 게시글 수정/삭제 관련 state
  const [showPostDeleteModal, setShowPostDeleteModal] = useState(false);
  const [postDeleteForm, setPostDeleteForm] = useState({ password: '' });
  const [isDeleting, setIsDeleting] = useState(false);
  
  // AuthProvider에서 관리자 상태 확인
  
  // 글 작성자 여부 확인 state
  const [isPostOwner, setIsPostOwner] = useState(false);

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

  // 힘내 기능 관련 함수들
  const getCheerCount = (postId) => {
    try {
      const cheersKey = `post_cheers_${postId}`;
      const savedCheers = parseInt(localStorage.getItem(cheersKey) || '0');
      return savedCheers;
    } catch (error) {
      console.error('힘내 수 로드 실패:', error);
      return 0;
    }
  };

  const checkUserCheered = (postId) => {
    try {
      const clickedKey = `post_cheered_${postId}`;
      return localStorage.getItem(clickedKey) === 'true';
    } catch (error) {
      console.error('힘내 클릭 여부 확인 실패:', error);
      return false;
    }
  };

  const handleCheerClick = () => {
    if (hasUserCheered || isCheering) return;

    setIsCheering(true);
    
    try {
      const cheersKey = `post_cheers_${postId}`;
      const clickedKey = `post_cheered_${postId}`;
      
      // 힘내 수 증가
      const newCheerCount = cheerCount + 1;
      setCheerCount(newCheerCount);
      localStorage.setItem(cheersKey, newCheerCount.toString());
      
      // 사용자가 클릭했다고 기록
      setHasUserCheered(true);
      localStorage.setItem(clickedKey, 'true');
      
      console.log('💪 힘내세요 버튼 클릭됨!', { postId, newCheerCount });
      
    } catch (error) {
      console.error('힘내 버튼 처리 실패:', error);
    } finally {
      setTimeout(() => setIsCheering(false), 500);
    }
  };

  // AuthProvider에서 관리자 상태 확인
  const isAdmin = user?.role === 'admin';

  // 전체 댓글 개수 계산 함수 (중첩 댓글 포함)
  const getTotalCommentCount = (comments) => {
    let total = 0;
    comments.forEach(comment => {
      total += 1; // 원댓글
      if (comment.replies && comment.replies.length > 0) {
        total += comment.replies.length; // 모든 답글 포함
      }
    });
    return total;
  };

  // 글 작성자 확인 함수
  const checkPostOwner = (postId) => {
    try {
      const ownedPosts = JSON.parse(localStorage.getItem('ownedPosts') || '[]');
      return ownedPosts.includes(postId.toString());
    } catch (error) {
      console.error('글 소유권 확인 실패:', error);
      return false;
    }
  };

  // 글 소유권 등록 함수 (글 작성 시 호출)
  const registerPostOwnership = (postId) => {
    try {
      const ownedPosts = JSON.parse(localStorage.getItem('ownedPosts') || '[]');
      if (!ownedPosts.includes(postId.toString())) {
        ownedPosts.push(postId.toString());
        localStorage.setItem('ownedPosts', JSON.stringify(ownedPosts));
        console.log('✅ 글 소유권 등록:', postId);
      }
    } catch (error) {
      console.error('글 소유권 등록 실패:', error);
    }
  };

  // 관리자용 댓글 삭제 함수
  const handleAdminDeleteComment = async (commentId, isReply = false, parentId = null) => {
    if (!isAdmin) {
      alert('관리자만 이용할 수 있는 기능입니다.');
      return;
    }

    if (!confirm('정말 이 댓글을 삭제하시겠습니까?')) return;

    try {
      // Supabase에서 삭제 시도
      try {
        const { error } = await supabase
          .from('comments')
          .delete()
          .eq('id', commentId);

        if (!error) {
          console.log('✅ 관리자가 댓글을 삭제했습니다:', commentId);
        }
      } catch (dbError) {
        console.log('DB 삭제 실패:', dbError);
      }

      // 댓글 목록에서 제거
      if (isReply) {
        setComments(prev => prev.map(comment => {
          if (comment.id === parentId) {
            return {
              ...comment,
              replies: comment.replies?.filter(reply => reply.id !== commentId) || []
            };
          }
          return comment;
        }));
      } else {
        setComments(prev => prev.filter(comment => comment.id !== commentId));
      }

      // 게시글의 댓글 개수 업데이트 (관리자 댓글 삭제 시 감소)
      if (post) {
        try {
          const { error: updateError } = await supabase
            .from('posts')
            .update({ 
              comment_count: Math.max(0, (post.comment_count || 0) - 1) 
            })
            .eq('id', postId);

          if (!updateError) {
            // 현재 페이지의 post 상태도 업데이트
            setPost(prev => prev ? ({
              ...prev,
              comment_count: Math.max(0, (prev.comment_count || 0) - 1)
            }) : prev);
            console.log('✅ 게시글 댓글 개수 업데이트 완료 (관리자 댓글 삭제)');
          } else {
            console.log('⚠️ 게시글 댓글 개수 업데이트 실패:', updateError);
          }
        } catch (updateError) {
          console.log('⚠️ 게시글 댓글 개수 업데이트 중 오류:', updateError);
        }
      }

      alert('댓글이 삭제되었습니다.');

    } catch (error) {
      console.error('관리자 댓글 삭제 실패:', error);
      alert('댓글 삭제 중 오류가 발생했습니다.');
    }
  };

  // 관리자용 게시글 삭제 함수
  const handleAdminDeletePost = async () => {
    if (!isAdmin) {
      alert('관리자만 이용할 수 있는 기능입니다.');
      return;
    }

    if (!confirm('정말 이 게시글을 삭제하시겠습니까?')) return;

    try {
      // Supabase에서 게시글 삭제
      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', postId);

      if (!error) {
        alert('게시글이 삭제되었습니다.');
        window.location.href = '/';
      } else {
        throw new Error('게시글 삭제 실패');
      }
    } catch (error) {
      console.error('관리자 게시글 삭제 실패:', error);
      alert('게시글 삭제 중 오류가 발생했습니다.');
    }
  };

  // 일반 사용자 게시글 수정 함수
  const handleEditPost = async () => {
    const password = prompt('게시글을 수정하려면 비밀번호를 입력하세요:');
    if (!password) return;

    try {
      // 게시글에 비밀번호가 설정되지 않은 경우 수정 불가
      if (!post.password) {
        alert('이 게시글은 비밀번호가 설정되지 않아 수정할 수 없습니다.');
        return;
      }

      // 게시글 비밀번호 확인 (실제로는 해시된 비밀번호와 비교해야 함)
      if (post.password !== password) {
        alert('비밀번호가 일치하지 않습니다.');
        return;
      }

      // 수정 페이지로 이동 (실제 구현에서는 수정 페이지를 만들어야 함)
      alert('수정 기능은 준비 중입니다.');
      // window.location.href = `/board/edit/${postId}`;
    } catch (error) {
      console.error('게시글 수정 실패:', error);
      alert('게시글 수정 중 오류가 발생했습니다.');
    }
  };

  // 일반 사용자 게시글 삭제 함수
  const handleDeletePost = async () => {
    const password = prompt('게시글을 삭제하려면 비밀번호를 입력하세요:');
    if (!password) return;

    try {
      // 게시글에 비밀번호가 설정되지 않은 경우 삭제 불가
      if (!post.password) {
        alert('이 게시글은 비밀번호가 설정되지 않아 삭제할 수 없습니다.');
        return;
      }

      // 게시글 비밀번호 확인 (실제로는 해시된 비밀번호와 비교해야 함)
      if (post.password !== password) {
        alert('비밀번호가 일치하지 않습니다.');
        return;
      }

      if (!confirm('정말 이 게시글을 삭제하시겠습니까?')) return;

      // Supabase에서 게시글 삭제
      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', postId);

      if (!error) {
        alert('게시글이 삭제되었습니다.');
        window.location.href = '/';
      } else {
        throw new Error('게시글 삭제 실패');
      }
    } catch (error) {
      console.error('게시글 삭제 실패:', error);
      alert('게시글 삭제 중 오류가 발생했습니다.');
    }
  };

  // 답글 작성 처리 함수
  const handleReplySubmit = async (e, parentId) => {
    e.preventDefault();
    
    // 가능한 모든 키를 확인
    const possibleKeys = [
      `reply_${parentId}`,
      `nested_reply_${parentId}`,
      `${parentId}` // 단순 ID 키도 확인
    ];
    
    let replyForm = null;
    let activeFormKey = null;
    
    // 폼 데이터가 있는 키 찾기
    for (const key of possibleKeys) {
      if (replyForms[key] && replyForms[key].nickname?.trim()) {
        replyForm = replyForms[key];
        activeFormKey = key;
        break;
      }
    }
    
    if (!replyForm || !replyForm.nickname?.trim() || !replyForm.password?.trim() || !replyForm.content?.trim()) {
      alert('모든 필드를 입력해주세요.');
      console.log('폼 데이터 확인:', { replyForms, parentId, possibleKeys });
      return;
    }

    setIsSubmittingReply(prev => ({ ...prev, [activeFormKey]: true }));

    try {
      const newReply = {
        id: Date.now(),
        post_id: postId,
        nickname: replyForm.nickname.trim(),
        password: replyForm.password,
        content: replyForm.content.trim(),
        created_at: new Date().toISOString(),
        parent_id: parentId
      };

      // Supabase에 답글 저장 시도
      try {
        const { data, error } = await supabase
          .from('comments')
          .insert([{
            post_id: postId,
            nickname: newReply.nickname,
            password: newReply.password,
            content: newReply.content,
            parent_id: parentId
          }])
          .select()
          .single();

        if (!error && data) {
          newReply.id = data.id;
          console.log('✅ 답글이 데이터베이스에 저장되었습니다:', data);
        } else {
          throw new Error('DB 저장 실패');
        }
      } catch (dbError) {
        console.log('DB 저장 실패, localStorage에 저장:', dbError);
      }

      // 댓글 목록에서 해당 부모 댓글 찾아서 답글 추가
      setComments(prev => prev.map(comment => {
        if (comment.id === parentId) {
          return {
            ...comment,
            replies: [...(comment.replies || []), newReply]
          };
        }
        return comment;
      }));

      // 게시글의 댓글 개수 업데이트 (답글도 댓글 수에 포함)
      if (post) {
        try {
          const { error: updateError } = await supabase
            .from('posts')
            .update({ 
              comment_count: (post.comment_count || 0) + 1 
            })
            .eq('id', postId);

          if (!updateError) {
            // 현재 페이지의 post 상태도 업데이트
            setPost(prev => prev ? ({
              ...prev,
              comment_count: (prev.comment_count || 0) + 1
            }) : prev);
            console.log('✅ 게시글 댓글 개수 업데이트 완료 (답글 추가)');
          } else {
            console.log('⚠️ 게시글 댓글 개수 업데이트 실패:', updateError);
          }
        } catch (updateError) {
          console.log('⚠️ 게시글 댓글 개수 업데이트 중 오류:', updateError);
        }
      }

      // 답글 폼 초기화 및 숨기기
      setReplyForms(prev => ({ ...prev, [activeFormKey]: { nickname: '', password: '', content: '' } }));
      setShowReplyForm(prev => ({ ...prev, [activeFormKey]: false }));

      alert('답글이 작성되었습니다!');

    } catch (error) {
      console.error('답글 작성 실패:', error);
      alert('답글 작성 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setIsSubmittingReply(prev => ({ ...prev, [activeFormKey]: false }));
    }
  };

  // 댓글 삭제 처리 함수
  const handleDeleteComment = async (commentId, isReply = false, parentId = null) => {
    const password = prompt('댓글을 삭제하려면 비밀번호를 입력하세요:');
    if (!password) return;

    try {
      // 댓글 찾기
      let targetComment = null;
      if (isReply) {
        const parentComment = comments.find(c => c.id === parentId);
        targetComment = parentComment?.replies?.find(r => r.id === commentId);
      } else {
        targetComment = comments.find(c => c.id === commentId);
      }

      if (!targetComment) {
        alert('댓글을 찾을 수 없습니다.');
        return;
      }

      // 비밀번호 확인
      if (targetComment.password !== password) {
        alert('비밀번호가 일치하지 않습니다.');
        return;
      }

      // Supabase에서 삭제 시도
      try {
        const { error } = await supabase
          .from('comments')
          .delete()
          .eq('id', commentId);

        if (error) {
          console.log('DB 삭제 실패:', error);
        } else {
          console.log('✅ 댓글이 데이터베이스에서 삭제되었습니다');
        }
      } catch (dbError) {
        console.log('DB 삭제 실패:', dbError);
      }

      // 댓글 목록에서 제거
      if (isReply) {
        setComments(prev => prev.map(comment => {
          if (comment.id === parentId) {
            return {
              ...comment,
              replies: comment.replies?.filter(reply => reply.id !== commentId) || []
            };
          }
          return comment;
        }));
      } else {
        setComments(prev => prev.filter(comment => comment.id !== commentId));
      }

      // 게시글의 댓글 개수 업데이트 (댓글 삭제 시 감소)
      if (post) {
        try {
          const { error: updateError } = await supabase
            .from('posts')
            .update({ 
              comment_count: Math.max(0, (post.comment_count || 0) - 1) 
            })
            .eq('id', postId);

          if (!updateError) {
            // 현재 페이지의 post 상태도 업데이트
            setPost(prev => prev ? ({
              ...prev,
              comment_count: Math.max(0, (prev.comment_count || 0) - 1)
            }) : prev);
            console.log('✅ 게시글 댓글 개수 업데이트 완료 (댓글 삭제)');
          } else {
            console.log('⚠️ 게시글 댓글 개수 업데이트 실패:', updateError);
          }
        } catch (updateError) {
          console.log('⚠️ 게시글 댓글 개수 업데이트 중 오류:', updateError);
        }
      }

      alert('댓글이 삭제되었습니다.');

    } catch (error) {
      console.error('댓글 삭제 실패:', error);
      alert('댓글 삭제 중 오류가 발생했습니다.');
    }
  };

  // 댓글 수정 처리 함수
  const handleEditComment = async (commentId, isReply = false, parentId = null) => {
    const password = prompt('댓글을 수정하려면 비밀번호를 입력하세요:');
    if (!password) return;

    try {
      // 댓글 찾기
      let targetComment = null;
      if (isReply) {
        const parentComment = comments.find(c => c.id === parentId);
        targetComment = parentComment?.replies?.find(r => r.id === commentId);
      } else {
        targetComment = comments.find(c => c.id === commentId);
      }

      if (!targetComment) {
        alert('댓글을 찾을 수 없습니다.');
        return;
      }

      // 비밀번호 확인
      if (targetComment.password !== password) {
        alert('비밀번호가 일치하지 않습니다.');
        return;
      }

      // 새 내용 입력받기
      const newContent = prompt('새 댓글 내용을 입력하세요:', targetComment.content);
      if (!newContent || newContent.trim() === '') return;

      // Supabase에서 수정 시도
      try {
        const { error } = await supabase
          .from('comments')
          .update({ content: newContent.trim() })
          .eq('id', commentId);

        if (error) {
          console.log('DB 수정 실패:', error);
        } else {
          console.log('✅ 댓글이 데이터베이스에서 수정되었습니다');
        }
      } catch (dbError) {
        console.log('DB 수정 실패:', dbError);
      }

      // 댓글 목록에서 수정
      if (isReply) {
        setComments(prev => prev.map(comment => {
          if (comment.id === parentId) {
            return {
              ...comment,
              replies: comment.replies?.map(reply => 
                reply.id === commentId 
                  ? { ...reply, content: newContent.trim() }
                  : reply
              ) || []
            };
          }
          return comment;
        }));
      } else {
        setComments(prev => prev.map(comment => 
          comment.id === commentId 
            ? { ...comment, content: newContent.trim() }
            : comment
        ));
      }

      alert('댓글이 수정되었습니다.');

    } catch (error) {
      console.error('댓글 수정 실패:', error);
      alert('댓글 수정 중 오류가 발생했습니다.');
    }
  };

  // 댓글 작성 처리 함수
  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    
    if (!commentForm.nickname.trim() || !commentForm.password.trim() || !commentForm.content.trim()) {
      alert('모든 필드를 입력해주세요.');
      return;
    }

    setIsSubmittingComment(true);

    try {
      const newComment = {
        id: Date.now(),
        post_id: postId,
        nickname: commentForm.nickname.trim(),
        password: commentForm.password, // 실제로는 해시 처리해야 함
        content: commentForm.content.trim(),
        created_at: new Date().toISOString(),
        parent_id: null,
        replies: []
      };

      // Supabase에 댓글 저장 시도
      try {
        const { data, error } = await supabase
          .from('comments')
          .insert([{
            post_id: postId,
            nickname: newComment.nickname,
            password: newComment.password,
            content: newComment.content,
            parent_id: null
          }])
          .select()
          .single();

        if (!error && data) {
          newComment.id = data.id;
          console.log('✅ 댓글이 데이터베이스에 저장되었습니다:', data);
        } else {
          throw new Error('DB 저장 실패');
        }
      } catch (dbError) {
        console.log('DB 저장 실패, localStorage에 저장:', dbError);
        
        // localStorage에 백업 저장
        const commentsKey = `comments_${postId}`;
        const existingComments = JSON.parse(localStorage.getItem(commentsKey) || '[]');
        existingComments.push(newComment);
        localStorage.setItem(commentsKey, JSON.stringify(existingComments));
      }

      // 댓글 목록 업데이트
      setComments(prev => [...prev, newComment]);

      // 게시글의 댓글 개수 업데이트
      if (post) {
        try {
          const { error: updateError } = await supabase
            .from('posts')
            .update({ 
              comment_count: (post.comment_count || 0) + 1 
            })
            .eq('id', postId);

          if (!updateError) {
            // 현재 페이지의 post 상태도 업데이트
            setPost(prev => prev ? ({
              ...prev,
              comment_count: (prev.comment_count || 0) + 1
            }) : prev);
            console.log('✅ 게시글 댓글 개수 업데이트 완료');
          } else {
            console.log('⚠️ 게시글 댓글 개수 업데이트 실패:', updateError);
          }
        } catch (updateError) {
          console.log('⚠️ 게시글 댓글 개수 업데이트 중 오류:', updateError);
        }
      }

      // 폼 초기화
      setCommentForm({
        nickname: '',
        password: '',
        content: ''
      });

      alert('댓글이 작성되었습니다!');

    } catch (error) {
      console.error('댓글 작성 실패:', error);
      alert('댓글 작성 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setIsSubmittingComment(false);
    }
  };

  useEffect(() => {
    fetchPost();
    if (userLocation) {
      fetchAds(); // 위치 정보가 있을 때만 광고 가져오기
    }
    fetchRelatedPosts();
    fetchPopularPosts();
    
    // 힘내 관련 초기화
    if (postId) {
      const initialCheerCount = getCheerCount(postId);
      const userCheered = checkUserCheered(postId);
      setCheerCount(initialCheerCount);
      setHasUserCheered(userCheered);
      
      // 글 작성자 확인
      const ownerStatus = checkPostOwner(postId);
      setIsPostOwner(ownerStatus);
    }
  }, [postId, userLocation]); // userLocation 의존성 추가

  // AuthProvider를 사용하므로 별도의 관리자 상태 체크 불필요

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

  // 광고 데이터 가져오기 (지역 기반)
  const fetchAds = async () => {
    if (!userLocation) return; // 위치 정보가 없으면 대기
    
    try {
      const { data: personalAds } = await supabase
        .from('custom_banners')
        .select('*')
        .order('slot_number');

      const { data: adsData, error: adsError } = await supabase
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

      if (!adsError && adsData && adsData.length > 0) {
        // 사용자 지역에 맞는 광고 필터링
        const filteredAds = adsData.filter(ad => {
          // 대도시 광고인 경우
          if (ad.ad_type === 'major' && ad.major_city === userLocation.mappedRegion) {
            return true;
          }
          
          // 지역 광고인 경우
          if (ad.ad_type === 'regional' && ad.regions && ad.regions.includes(userLocation.mappedRegion)) {
            return true;
          }
          
          return false;
        });
        
        console.log(`🎯 상세페이지 사용자 지역(${userLocation.mappedRegion})에 맞는 광고:`, filteredAds.length, '개');
        
        if (filteredAds.length > 0) {
          // 지역 맞춤 광고 중에서 랜덤 선택
          const randomIndex = Math.floor(Math.random() * filteredAds.length);
          const selectedAd = filteredAds[randomIndex];
          sidebarAd = {
            id: selectedAd.id,
            title: selectedAd.title,
            image_url: selectedAd.image_url,
            website: selectedAd.website || '#'
          };
          console.log(`🎲 상세페이지 지역 맞춤 광고 선택: ${randomIndex + 1}/${filteredAds.length} - ${selectedAd.title}`);
        } else {
          // 지역 맞춤 광고가 없으면 전체 광고 중에서 랜덤 선택 (폴백)
          const randomIndex = Math.floor(Math.random() * adsData.length);
          const selectedAd = adsData[randomIndex];
          sidebarAd = {
            id: selectedAd.id,
            title: selectedAd.title,
            image_url: selectedAd.image_url,
            website: selectedAd.website || '#'
          };
          console.log(`🎲 상세페이지 전체 광고에서 랜덤 선택 (폴백): ${randomIndex + 1}/${adsData.length} - ${selectedAd.title}`);
        }
      } else {
        sidebarAd = null;
        console.log('❌ 상세페이지 활성 광고가 없습니다.');
      }

      setAds({
        left: leftAds,
        right: [],
        sidebar: sidebarAd
      });
    } catch (error) {
      console.error('광고 데이터 가져오기 실패:', error);
      setAds({
        left: [],
        right: [],
        sidebar: null
      });
    }
  };

  // 사용자 위치 정보 가져오기 (IP 기반)
  useEffect(() => {
    async function getUserLocation() {
      try {
        const response = await fetch('https://ipapi.co/json/');
        if (response.ok) {
          const locationData = await response.json();
          console.log('🌍 상세페이지 사용자 위치 정보:', locationData);
          
                     // 한국 지역코드 매핑 (메인 페이지와 동일)
           const regionMapping: { [key: string]: string | string[] } = {
             'Seoul': 'seoul',
             'Busan': 'busan', 
             'Daegu': 'daegu',
             'Incheon': 'incheon',
             'Daejeon': 'daejeon',
             'Gwangju': 'gwangju',
             'Ulsan': 'ulsan',
             'Sejong': 'sejong',
             'Gyeonggi-do': ['suwon', 'seongnam', 'bucheon', 'ansan', 'anyang', 'pyeongtaek', 'goyang', 'yongin', 'hwaseong'],
             'Gangwon-do': ['chuncheon', 'wonju', 'gangneung', 'donghae'],
             'Chungcheongbuk-do': ['cheongju', 'chungju', 'jecheon'],
             'Chungcheongnam-do': ['cheonan', 'asan', 'seosan', 'nonsan'],
             'Jeollabuk-do': ['jeonju', 'iksan', 'gunsan', 'jeongeup'],
             'Jeollanam-do': ['mokpo', 'yeosu', 'suncheon', 'naju'],
             'Gyeongsangbuk-do': ['pohang', 'gumi', 'gyeongju', 'andong'],
             'Gyeongsangnam-do': ['changwon', 'jinju', 'tongyeong', 'sacheon'],
             'Jeju-do': ['jeju_city', 'seogwipo']
           };

          let userRegion = null;
          
          if (locationData.region) {
            const regionKey = Object.keys(regionMapping).find(key => 
              locationData.region.includes(key.replace('-do', '').replace('-', ''))
            );
            
            if (regionKey) {
              userRegion = regionMapping[regionKey];
              if (Array.isArray(userRegion)) {
                userRegion = userRegion[0];
              }
            }
          }
          
          if (!userRegion && locationData.city) {
            const cityName = locationData.city.toLowerCase();
            userRegion = Object.values(regionMapping).flat().find(region => 
              cityName.includes(region) || region.includes(cityName)
            );
          }

          setUserLocation({
            ...locationData,
            mappedRegion: userRegion || 'seoul'
          });
          
          console.log(`📍 상세페이지 매핑된 사용자 지역: ${userRegion || 'seoul'}`);
          
        } else {
          setUserLocation({ mappedRegion: 'seoul' });
        }
      } catch (error) {
        console.error('상세페이지 위치 정보 가져오기 실패:', error);
        setUserLocation({ mappedRegion: 'seoul' });
      }
    }
    
    getUserLocation();
  }, []);

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
                        {getTotalCommentCount(comments)}
                      </span>
                    </div>
                  </div>
                </div>
                
                <h1 className="text-2xl font-bold text-gray-900 leading-tight mb-4">{post.title}</h1>
                
                <div className="flex items-center justify-between">
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
                  
                  {/* 수정/삭제 버튼을 메타 정보 영역 우측에 배치 */}
                  <div className="flex items-center gap-2">

                    {isAdmin ? (
                      /* 관리자 전용 버튼들 */
                      <>
                        <button
                          onClick={handleEditPost}
                          className="px-2 py-1 bg-blue-500 hover:bg-blue-600 text-white text-xs rounded transition-colors flex items-center gap-1"
                          title="관리자 전용 수정"
                        >
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                          </svg>
                          관리자 수정
                        </button>
                        <button
                          onClick={handleAdminDeletePost}
                          className="px-2 py-1 bg-red-500 hover:bg-red-600 text-white text-xs rounded transition-colors flex items-center gap-1"
                          title="관리자 전용 삭제"
                        >
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" clipRule="evenodd" />
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                          </svg>
                          관리자 삭제
                        </button>

                      </>
                    ) : isPostOwner ? (
                      /* 글 작성자만 볼 수 있는 수정/삭제 버튼 */
                      <>
                        <button
                          onClick={handleEditPost}
                          className="px-2 py-1 bg-gray-400 hover:bg-gray-500 text-white text-xs rounded transition-colors flex items-center gap-1"
                          title="게시글 수정"
                        >
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                          </svg>
                          소유자 수정
                        </button>
                        <button
                          onClick={handleDeletePost}
                          className="px-2 py-1 bg-red-400 hover:bg-red-500 text-white text-xs rounded transition-colors flex items-center gap-1"
                          title="게시글 삭제"
                        >
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" clipRule="evenodd" />
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                          </svg>
                          소유자 삭제
                        </button>
                      </>
                    ) : (
                      /* 일반 사용자용 수정/삭제 버튼 (비밀번호 확인 필요) */
                      <>
                        <button
                          onClick={handleEditPost}
                          className="px-2 py-1 bg-blue-400 hover:bg-blue-500 text-white text-xs rounded transition-colors flex items-center gap-1"
                          title="게시글 수정"
                        >
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                          </svg>
                          일반 수정
                        </button>
                        <button
                          onClick={handleDeletePost}
                          className="px-2 py-1 bg-red-400 hover:bg-red-500 text-white text-xs rounded transition-colors flex items-center gap-1"
                          title="게시글 삭제"
                        >
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" clipRule="evenodd" />
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                          </svg>
                          일반 삭제
                        </button>
                      </>
                    )}
                  </div>
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
                    onClick={handleCheerClick}
                    disabled={hasUserCheered || isCheering}
                    className={`relative overflow-hidden group flex items-center space-x-2 px-5 py-2.5 rounded-full font-medium transition-all duration-300 transform ${
                      hasUserCheered 
                        ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white cursor-not-allowed' 
                        : isCheering 
                        ? 'bg-gradient-to-r from-yellow-500 to-orange-600 text-white scale-110 animate-pulse' 
                        : 'bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 hover:scale-105 hover:shadow-lg active:scale-95 cursor-pointer'
                    }`}
                  >
                    <span className="relative z-10 text-lg">
                      {hasUserCheered ? '✅' : isCheering ? '🎉' : '💪'}
                    </span>
                    <span className="relative z-10 text-sm">
                      {hasUserCheered ? '힘내줬어요!' : isCheering ? '힘내기!' : '힘내세요'} {cheerCount}
                    </span>
                    {isCheering && (
                      <div className="absolute inset-0 rounded-full bg-white/20 animate-ping"></div>
                    )}
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
                        총 {getTotalCommentCount(comments)}개의 댓글이 있습니다
                      </p>
                    </div>
                  </div>
                </div>

                {/* 댓글 작성 폼 */}
                <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 border-b border-blue-100">
                  <form onSubmit={handleCommentSubmit} className="space-y-4">
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
                            <button 
                              onClick={() => setShowReplyForm(prev => ({ ...prev, [`reply_${comment.id}`]: !prev[`reply_${comment.id}`] }))}
                              className="text-blue-600 hover:text-blue-700 font-medium"
                            >
                              답글
                            </button>
                            <button 
                              onClick={() => handleEditComment(comment.id, false)}
                              className="text-gray-500 hover:text-gray-700"
                            >
                              수정
                            </button>
                            <button 
                              onClick={() => handleDeleteComment(comment.id, false)}
                              className="text-red-500 hover:text-red-700"
                            >
                              삭제
                            </button>
                            {isAdmin && (
                              <button 
                                onClick={() => handleAdminDeleteComment(comment.id, false)}
                                className="text-red-600 hover:text-red-800 font-medium px-2 py-1 bg-red-50 hover:bg-red-100 rounded text-xs"
                                title="관리자 전용 삭제"
                              >
                                🛡️ 삭제
                              </button>
                            )}
                          </div>

                          {/* 답글 작성 폼 */}
                          {showReplyForm[`reply_${comment.id}`] && (
                            <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                              <form onSubmit={(e) => handleReplySubmit(e, comment.id)} className="space-y-3">
                                <div className="grid grid-cols-2 gap-3">
                                  <input
                                    type="text"
                                    placeholder="닉네임"
                                    value={replyForms[`reply_${comment.id}`]?.nickname || ''}
                                    onChange={(e) => setReplyForms(prev => ({
                                      ...prev,
                                      [`reply_${comment.id}`]: { 
                                        nickname: '', 
                                        password: '', 
                                        content: '', 
                                        ...prev[`reply_${comment.id}`], 
                                        nickname: e.target.value 
                                      }
                                    }))}
                                    className="px-3 py-2 border border-blue-200 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                    required
                                  />
                                  <input
                                    type="password"
                                    placeholder="비밀번호"
                                    value={replyForms[`reply_${comment.id}`]?.password || ''}
                                    onChange={(e) => setReplyForms(prev => ({
                                      ...prev,
                                      [`reply_${comment.id}`]: { 
                                        nickname: '', 
                                        password: '', 
                                        content: '', 
                                        ...prev[`reply_${comment.id}`], 
                                        password: e.target.value 
                                      }
                                    }))}
                                    className="px-3 py-2 border border-blue-200 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                    required
                                  />
                                </div>
                                <textarea
                                  placeholder="답글을 작성해주세요..."
                                  value={replyForms[`reply_${comment.id}`]?.content || ''}
                                  onChange={(e) => setReplyForms(prev => ({
                                    ...prev,
                                    [`reply_${comment.id}`]: { 
                                      nickname: '', 
                                      password: '', 
                                      content: '', 
                                      ...prev[`reply_${comment.id}`], 
                                      content: e.target.value 
                                    }
                                  }))}
                                  className="w-full px-3 py-2 border border-blue-200 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm h-20 resize-none"
                                  required
                                />
                                <div className="flex justify-end gap-2">
                                  <button
                                    type="button"
                                    onClick={() => setShowReplyForm(prev => ({ ...prev, [`reply_${comment.id}`]: false }))}
                                    className="px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded text-sm transition-colors"
                                  >
                                    취소
                                  </button>
                                  <button
                                    type="submit"
                                    disabled={isSubmittingReply[`reply_${comment.id}`]}
                                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded text-sm transition-colors"
                                  >
                                    {isSubmittingReply[`reply_${comment.id}`] ? '작성 중...' : '답글 작성'}
                                  </button>
                                </div>
                              </form>
                            </div>
                          )}

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
                                      <button 
                                        onClick={() => setShowReplyForm(prev => ({ ...prev, [`nested_reply_${comment.id}`]: !prev[`nested_reply_${comment.id}`] }))}
                                        className="text-blue-600 hover:text-blue-700 font-medium"
                                      >
                                        답글
                                      </button>
                                      <button 
                                        onClick={() => handleEditComment(reply.id, true, comment.id)}
                                        className="text-gray-500 hover:text-gray-700"
                                      >
                                        수정
                                      </button>
                                      <button 
                                        onClick={() => handleDeleteComment(reply.id, true, comment.id)}
                                        className="text-red-500 hover:text-red-700"
                                      >
                                        삭제
                                      </button>
                                      {isAdmin && (
                                        <button 
                                          onClick={() => handleAdminDeleteComment(reply.id, true, comment.id)}
                                          className="text-red-600 hover:text-red-800 font-medium px-2 py-1 bg-red-50 hover:bg-red-100 rounded text-xs"
                                          title="관리자 전용 삭제"
                                        >
                                          🛡️ 삭제
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              ))}
                              
                              {/* 답글의 답글 작성 폼 (들여쓰기 같은 레벨에 표시) */}
                              {showReplyForm[`nested_reply_${comment.id}`] && (
                                <div className="p-3 bg-blue-50 rounded border border-blue-200">
                                  <form onSubmit={(e) => handleReplySubmit(e, comment.id)} className="space-y-3">
                                    <div className="grid grid-cols-2 gap-3">
                                      <input
                                        type="text"
                                        placeholder="닉네임"
                                        value={replyForms[`nested_reply_${comment.id}`]?.nickname || ''}
                                        onChange={(e) => setReplyForms(prev => ({
                                          ...prev,
                                          [`nested_reply_${comment.id}`]: { 
                                            nickname: '', 
                                            password: '', 
                                            content: '', 
                                            ...prev[`nested_reply_${comment.id}`], 
                                            nickname: e.target.value 
                                          }
                                        }))}
                                        className="px-3 py-2 border border-blue-200 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                        required
                                      />
                                      <input
                                        type="password"
                                        placeholder="비밀번호"
                                        value={replyForms[`nested_reply_${comment.id}`]?.password || ''}
                                        onChange={(e) => setReplyForms(prev => ({
                                          ...prev,
                                          [`nested_reply_${comment.id}`]: { 
                                            nickname: '', 
                                            password: '', 
                                            content: '', 
                                            ...prev[`nested_reply_${comment.id}`], 
                                            password: e.target.value 
                                          }
                                        }))}
                                        className="px-3 py-2 border border-blue-200 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                        required
                                      />
                                    </div>
                                    <textarea
                                      placeholder="답글을 작성해주세요..."
                                      value={replyForms[`nested_reply_${comment.id}`]?.content || ''}
                                      onChange={(e) => setReplyForms(prev => ({
                                        ...prev,
                                        [`nested_reply_${comment.id}`]: { 
                                          nickname: '', 
                                          password: '', 
                                          content: '', 
                                          ...prev[`nested_reply_${comment.id}`], 
                                          content: e.target.value 
                                        }
                                      }))}
                                      className="w-full px-3 py-2 border border-blue-200 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm h-20 resize-none"
                                      required
                                    />
                                    <div className="flex justify-end gap-2">
                                      <button
                                        type="button"
                                        onClick={() => setShowReplyForm(prev => ({ ...prev, [`nested_reply_${comment.id}`]: false }))}
                                        className="px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded text-sm transition-colors"
                                      >
                                        취소
                                      </button>
                                      <button
                                        type="submit"
                                        disabled={isSubmittingReply[`nested_reply_${comment.id}`]}
                                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded text-sm transition-colors"
                                      >
                                        {isSubmittingReply[`nested_reply_${comment.id}`] ? '작성 중...' : '답글 작성'}
                                      </button>
                                    </div>
                                  </form>
                                </div>
                              )}
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
                                {post.comment_count > 0 && (
                                  <span className="flex items-center gap-1 text-blue-600">
                                    <FontAwesomeIcon icon={faComment} className="w-4 h-4" />
                                    {post.comment_count}
                                  </span>
                                )}
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