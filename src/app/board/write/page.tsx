'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { PostFormData } from '@/types';

export default function WritePage() {
  const router = useRouter();
  const [formData, setFormData] = useState<PostFormData>({
    title: '',
    content: '',
    nickname: '',
    category: '개인회생'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [images, setImages] = useState<File[]>([]);
  const [imagePreview, setImagePreview] = useState<string[]>([]);

  const bannedWords = [
    "법무사", "변호사", "사무소", "사무실", "로펌", "법률", "법률사무소",
    "씨발", "ㅅㅂ", "개새", "병신", "좆", "엿", "썅", "fuck", "shit"
  ];
  function isNicknameAllowed(nickname) {
    const lowerNickname = nickname.toLowerCase().replace(/\s/g, "");
    return !bannedWords.some(word => lowerNickname.includes(word.toLowerCase()));
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    if (images.length + files.length > 5) {
      alert('이미지는 최대 5개까지 첨부할 수 있습니다.');
      return;
    }

    files.forEach(file => {
      if (file.size > 5 * 1024 * 1024) { // 5MB 제한
        alert('이미지 크기는 5MB 이하여야 합니다.');
        return;
      }

      if (!file.type.startsWith('image/')) {
        alert('이미지 파일만 업로드 가능합니다.');
        return;
      }
    });

    const newImages = [...images, ...files];
    setImages(newImages);

    // 미리보기 생성
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(prev => [...prev, e.target?.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setImagePreview(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.content.trim() || !formData.nickname.trim()) {
      alert('모든 필드를 입력해주세요.');
      return;
    }

    if (!isNicknameAllowed(formData.nickname)) {
      alert('닉네임에 법무사/변호사/사무실 등 홍보성 단어를 사용할 수 없습니다.');
      return;
    }

    setIsSubmitting(true);

    try {
      // 실제로는 API 호출을 통해 서버에 저장
      // 여기서는 로컬 스토리지에 임시 저장
      const newPost = {
        id: Date.now().toString(),
        ...formData,
        createdAt: new Date().toISOString(),
        viewCount: 0,
        commentCount: 0,
        images: imagePreview // 이미지 미리보기 URL 저장
      };

      // 로컬 스토리지에 저장 (실제로는 API 호출)
      const existingPosts = JSON.parse(localStorage.getItem('posts') || '[]');
      existingPosts.unshift(newPost);
      localStorage.setItem('posts', JSON.stringify(existingPosts));

      alert('글이 성공적으로 작성되었습니다!');
    } catch (error) {
      console.error('글 작성 중 오류 발생:', error);
      alert('글 작성 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white py-8">
      <div className="max-w-screen-xl mx-auto px-2 sm:px-4 lg:px-8 flex justify-center">
        <div className="w-full max-w-2xl">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center space-x-4 mb-4">
              {/* 게시판으로 돌아가기 링크 삭제 */}
            </div>
            <h1 className="text-3xl font-bold text-gray-900">글쓰기</h1>
            <p className="text-gray-600 mt-2">
              익명으로 고민을 나누고 조언을 받아보세요
            </p>
          </div>

          {/* Write Form */}
          <div className="bg-white rounded-lg">
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Category Selection */}
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                  말머리 선택 *
                </label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="개인회생">[개인회생]</option>
                  <option value="개인파산">[개인파산]</option>
                  <option value="법인회생">[법인회생]</option>
                  <option value="법인파산">[법인파산]</option>
                  <option value="워크아웃">[워크아웃]</option>
                  <option value="신용회복위원회">[신용회복위원회]</option>
                  <option value="대출">[대출]</option>
                  <option value="신용카드">[신용카드]</option>
                  <option value="신용점수">[신용점수]</option>
                  <option value="회생절차">[회생절차]</option>
                  <option value="상환계획">[상환계획]</option>
                  <option value="법무사상담">[법무사상담]</option>
                  <option value="회생비용">[회생비용]</option>
                  <option value="파산비용">[파산비용]</option>
                  <option value="재산관리">[재산관리]</option>
                  <option value="면책결정">[면책결정]</option>
                  <option value="신용회복">[신용회복]</option>
                  <option value="인가결정">[인가결정]</option>
                  <option value="셀프신청">[셀프신청]</option>
                  <option value="개인신청">[개인신청]</option>
                  <option value="취업">[취업관련]</option>
                </select>
              </div>

              {/* Title */}
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                  제목 *
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="제목을 입력해주세요"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                  maxLength={100}
                />
                <p className="text-sm text-gray-500 mt-1">
                  {formData.title.length}/100
                </p>
              </div>

              {/* Nickname */}
              <div>
                <label htmlFor="nickname" className="block text-sm font-medium text-gray-700 mb-2">
                  닉네임 *
                </label>
                <input
                  type="text"
                  id="nickname"
                  name="nickname"
                  value={formData.nickname}
                  onChange={handleInputChange}
                  placeholder="닉네임을 입력해주세요"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                  maxLength={20}
                />
                <p className="text-sm text-gray-500 mt-1">
                  익명으로 작성되지만, 닉네임은 표시됩니다
                </p>
              </div>

              {/* Content */}
              <div>
                <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
                  내용 *
                </label>
                <textarea
                  id="content"
                  name="content"
                  value={formData.content}
                  onChange={handleInputChange}
                  placeholder="고민이나 질문을 자세히 작성해주세요..."
                  rows={12}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 resize-vertical text-sm"
                  required
                  maxLength={2000}
                />
                <p className="text-sm text-gray-500 mt-1">
                  {formData.content.length}/2000
                </p>
              </div>

              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  이미지 첨부
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-blue-400 transition-colors">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="image-upload"
                  />
                  <label htmlFor="image-upload" className="cursor-pointer">
                    <div className="flex flex-col items-center">
                      <svg className="w-8 h-8 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      <span className="text-sm text-gray-600">클릭하여 이미지 업로드</span>
                      <span className="text-xs text-gray-500 mt-1">최대 5개, 각 5MB 이하</span>
                    </div>
                  </label>
                </div>
                
                {/* Image Preview */}
                {imagePreview.length > 0 && (
                  <div className="mt-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">첨부된 이미지 ({imagePreview.length}/5)</h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {imagePreview.map((preview, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={preview}
                            alt={`첨부 이미지 ${index + 1}`}
                            className="w-full h-32 object-cover rounded-lg border border-gray-200"
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Guidelines */}
              <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                <h3 className="text-sm font-medium text-blue-900 mb-2">글쓰기 가이드라인</h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• 구체적인 상황과 고민을 자세히 설명해주세요</li>
                  <li>• 개인정보나 연락처는 포함하지 마세요</li>
                  <li>• 타인을 비방하거나 욕설을 사용하지 마세요</li>
                  <li>• 법률 자문은 전문가에게 문의하시기 바랍니다</li>
                  <li>• 이미지는 최대 5개까지, 각 5MB 이하로 첨부 가능합니다</li>
                </ul>
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-2">
                {/* 취소 버튼에서 /board 링크 삭제, 단순 버튼으로 변경 */}
                <button
                  type="button"
                  onClick={() => window.history.back()}
                  className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isSubmitting ? '작성 중...' : '글 작성하기'}
                </button>
              </div>
            </form>
          </div>

          {/* Privacy Notice */}
          <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-md p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">개인정보 보호 안내</h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <p>업로드된 이미지에는 개인정보가 포함되지 않도록 주의해주세요. 개인정보가 포함된 이미지는 즉시 삭제됩니다.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 