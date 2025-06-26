"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/components/AuthProvider";
import Link from "next/link";

// 대도시 데이터
const majorCities = [
  { value: 'seoul', label: '서울 전체 (25개 구)' },
  { value: 'busan', label: '부산 전체 (16개 구/군)' },
  { value: 'daegu', label: '대구 전체 (8개 구/군)' },
  { value: 'incheon', label: '인천 전체 (10개 구/군)' },
  { value: 'daejeon', label: '대전 전체 (5개 구)' },
  { value: 'gwangju', label: '광주 전체 (5개 구)' },
  { value: 'ulsan', label: '울산 전체 (5개 구/군)' },
  { value: 'sejong', label: '세종특별자치시' }
];

// 중소도시/군 데이터 (최대 5개 선택)
const regions = [
  { value: 'suwon', label: '수원시' }, { value: 'seongnam', label: '성남시' }, { value: 'bucheon', label: '부천시' },
  { value: 'ansan', label: '안산시' }, { value: 'anyang', label: '안양시' }, { value: 'pyeongtaek', label: '평택시' },
  { value: 'dongducheon', label: '동두천시' }, { value: 'uijeongbu', label: '의정부시' }, { value: 'goyang', label: '고양시' },
  { value: 'gwangmyeong', label: '광명시' }, { value: 'gwangju_gyeonggi', label: '광주시' }, { value: 'yongin', label: '용인시' },
  { value: 'paju', label: '파주시' }, { value: 'icheon', label: '이천시' }, { value: 'anseong', label: '안성시' },
  { value: 'gimpo', label: '김포시' }, { value: 'hwaseong', label: '화성시' }, { value: 'yangju', label: '양주시' },
  { value: 'pocheon', label: '포천시' }, { value: 'yeoju', label: '여주시' }, { value: 'gapyeong', label: '가평군' },
  { value: 'yangpyeong', label: '양평군' }, { value: 'yeoncheon', label: '연천군' },
  // ... (생략: 나머지 지역도 관리자용과 동일하게 추가)
];

export default function EditAdPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const adId = params.id as string;
  const [formData, setFormData] = useState({
    advertiser: "",
    phone: "",
    email: "",
    website: "",
    title: "",
    description: "",
    startDate: "",
    endDate: "",
    ad_type: "major",
    major_city: "seoul",
    regions: [],
    image_url: "",
    image: null as File | null
  });
  const [imagePreview, setImagePreview] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isLoading && (!user || user.role !== "advertiser")) {
      router.replace("/");
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    async function fetchAd() {
      setLoading(true);
      const { data, error } = await supabase.from("ads").select("*").eq("id", adId).single();
      if (error || !data) {
        alert("광고 정보를 불러올 수 없습니다.");
        router.replace("/advertiser/ads");
        return;
      }
      setFormData({
        advertiser: data.advertiser || "",
        phone: data.phone || "",
        email: data.email || "",
        website: data.website || "",
        title: data.title || "",
        description: data.description || "",
        startDate: data.start_date || "",
        endDate: data.end_date || "",
        ad_type: data.ad_type || "major",
        major_city: data.major_city || "seoul",
        regions: data.regions || [],
        image_url: data.image_url || "",
        image: null
      });
      setImagePreview(data.image_url || "");
      setLoading(false);
    }
    if (adId) fetchAd();
  }, [adId, router]);

  const handleInputChange = (e: any) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAdTypeChange = (e: any) => {
    const value = e.target.value;
    setFormData((prev) => ({ ...prev, ad_type: value }));
  };

  const handleMajorCityChange = (e: any) => {
    setFormData((prev) => ({ ...prev, major_city: e.target.value }));
  };

  const handleRegionToggle = (regionValue: string) => {
    setFormData((prev) => {
      const regionsArr = prev.regions as string[];
      if (regionsArr.includes(regionValue)) {
        return { ...prev, regions: regionsArr.filter(r => r !== regionValue) };
      } else {
        if (regionsArr.length >= 5) {
          alert('최대 5개 지역까지 선택할 수 있습니다.');
          return prev;
        }
        return { ...prev, regions: [...regionsArr, regionValue] };
      }
    });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('이미지 파일 크기는 5MB 이하여야 합니다.');
        return;
      }
      setFormData(prev => ({ ...prev, image: file }));
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setIsSubmitting(true);
    let imageUrl = formData.image_url;
    if (formData.image) {
      const fileExt = formData.image.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('ad-images')
        .upload(fileName, formData.image);
      if (uploadError) {
        alert('이미지 업로드 실패: ' + uploadError.message);
        setIsSubmitting(false);
        return;
      } else {
        const { data: urlData } = supabase.storage
          .from('ad-images')
          .getPublicUrl(fileName);
        imageUrl = urlData.publicUrl;
      }
    }
    const { error } = await supabase.from("ads").update({
      advertiser: formData.advertiser,
      phone: formData.phone,
      email: formData.email,
      website: formData.website,
      title: formData.title,
      description: formData.description,
      start_date: formData.startDate,
      end_date: formData.endDate,
      ad_type: formData.ad_type,
      major_city: formData.ad_type === "major" ? formData.major_city : null,
      regions: formData.ad_type === "regional" ? formData.regions : null,
      image_url: imageUrl,
    }).eq("id", adId);
    setIsSubmitting(false);
    if (error) {
      alert("수정 실패: " + error.message);
    } else {
      alert("광고가 성공적으로 수정되었습니다!");
      router.push("/advertiser/ads");
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600 font-medium">광고 정보를 불러오는 중...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50" style={{fontFamily: `'Malgun Gothic', '맑은 고딕', Dotum, '돋움', Arial, Helvetica, sans-serif`}}>
      {/* 헤더 */}
      <div className="bg-white/80 backdrop-blur-sm shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                광고 수정
              </h1>
            </div>
            <Link
              href="/advertiser/ads"
              className="px-4 py-2 text-gray-600 hover:text-gray-900 font-medium transition-colors flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              목록으로
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* 기본 정보 섹션 */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-3">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                기본 정보
              </h2>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    광고주명
                  </label>
                  <input 
                    type="text" 
                    name="advertiser" 
                    value={formData.advertiser} 
                    onChange={handleInputChange} 
                    required 
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-gray-400" 
                    placeholder="회사명을 입력하세요"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    연락처
                  </label>
                  <input 
                    type="text" 
                    name="phone" 
                    value={formData.phone} 
                    onChange={handleInputChange} 
                    required 
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-gray-400" 
                    placeholder="010-1234-5678"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <svg className="w-4 h-4 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    이메일
                  </label>
                  <input 
                    type="email" 
                    name="email" 
                    value={formData.email} 
                    onChange={handleInputChange} 
                    required 
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-gray-400" 
                    placeholder="example@company.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <svg className="w-4 h-4 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9" />
                    </svg>
                    웹사이트
                  </label>
                  <input 
                    type="url" 
                    name="website" 
                    value={formData.website} 
                    onChange={handleInputChange} 
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-gray-400" 
                    placeholder="https://www.company.com"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 광고 내용 섹션 */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-green-600 to-teal-600 px-6 py-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-3">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                광고 내용
              </h2>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                  광고 제목
                </label>
                <input 
                  type="text" 
                  name="title" 
                  value={formData.title} 
                  onChange={handleInputChange} 
                  required 
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 hover:border-gray-400" 
                  placeholder="광고 제목을 입력하세요"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <svg className="w-4 h-4 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  광고 설명
                </label>
                <textarea 
                  name="description" 
                  value={formData.description} 
                  onChange={handleInputChange} 
                  required 
                  rows={4} 
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 hover:border-gray-400 resize-none" 
                  placeholder="광고에 대한 상세한 설명을 입력하세요"
                />
              </div>
            </div>
          </div>

          {/* 계약 기간 섹션 */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-orange-600 to-red-600 px-6 py-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-3">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                계약 기간
              </h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <svg className="w-4 h-4 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    시작일
                  </label>
                  <input 
                    type="date" 
                    name="startDate" 
                    value={formData.startDate} 
                    onChange={handleInputChange} 
                    required 
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 hover:border-gray-400" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    종료일
                  </label>
                  <input 
                    type="date" 
                    name="endDate" 
                    value={formData.endDate} 
                    onChange={handleInputChange} 
                    required 
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 hover:border-gray-400" 
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 광고 타입 및 지역 선택 섹션 */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-3">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                광고 지역
              </h2>
            </div>
            <div className="p-6 space-y-6">
              {/* 광고 타입 선택 */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-4">광고 타입</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <label className={`relative cursor-pointer rounded-xl border-2 p-4 transition-all duration-200 ${formData.ad_type === 'major' ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 hover:border-gray-300'}`}>
                    <input 
                      type="radio" 
                      name="ad_type" 
                      value="major" 
                      checked={formData.ad_type === 'major'} 
                      onChange={handleAdTypeChange} 
                      className="sr-only" 
                    />
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${formData.ad_type === 'major' ? 'border-indigo-500' : 'border-gray-300'}`}>
                        {formData.ad_type === 'major' && <div className="w-2.5 h-2.5 bg-indigo-500 rounded-full"></div>}
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">대도시 전체</div>
                        <div className="text-sm text-gray-500">전체 도시에 광고 표시</div>
                      </div>
                    </div>
                  </label>
                  <label className={`relative cursor-pointer rounded-xl border-2 p-4 transition-all duration-200 ${formData.ad_type === 'regional' ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 hover:border-gray-300'}`}>
                    <input 
                      type="radio" 
                      name="ad_type" 
                      value="regional" 
                      checked={formData.ad_type === 'regional'} 
                      onChange={handleAdTypeChange} 
                      className="sr-only" 
                    />
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${formData.ad_type === 'regional' ? 'border-indigo-500' : 'border-gray-300'}`}>
                        {formData.ad_type === 'regional' && <div className="w-2.5 h-2.5 bg-indigo-500 rounded-full"></div>}
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">지역 선택</div>
                        <div className="text-sm text-gray-500">원하는 지역만 선택</div>
                      </div>
                    </div>
                  </label>
                </div>
              </div>

              {/* 대도시 선택 */}
              {formData.ad_type === 'major' && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">대도시 선택</label>
                  <select 
                    name="major_city" 
                    value={formData.major_city} 
                    onChange={handleMajorCityChange} 
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 hover:border-gray-400"
                  >
                    {majorCities.map(city => (
                      <option key={city.value} value={city.value}>{city.label}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* 지역 선택 */}
              {formData.ad_type === 'regional' && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">지역 선택 (최대 5개)</label>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {regions.map(region => (
                      <label key={region.value} className="flex items-center p-3 rounded-lg border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 transition-all duration-200 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.regions.includes(region.value)}
                          onChange={() => handleRegionToggle(region.value)}
                          className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                        />
                        <span className="ml-2 text-sm font-medium text-gray-700">{region.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 이미지 업로드 섹션 */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-pink-600 to-rose-600 px-6 py-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-3">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                광고 이미지
              </h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <svg className="w-4 h-4 text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    이미지 업로드
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-pink-400 transition-colors duration-200">
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleImageChange} 
                      className="hidden" 
                      id="image-upload"
                    />
                    <label htmlFor="image-upload" className="cursor-pointer">
                      <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      <p className="text-gray-600 font-medium">클릭하여 이미지 선택</p>
                      <p className="text-gray-500 text-sm mt-1">PNG, JPG, GIF 파일 (최대 5MB)</p>
                    </label>
                  </div>
                </div>
                {imagePreview && (
                  <div className="mt-4">
                    <label className="block text-sm font-semibold text-gray-700 mb-3">미리보기</label>
                    <div className="relative inline-block">
                      <img 
                        src={imagePreview} 
                        alt="미리보기" 
                        className="w-64 h-40 object-cover rounded-xl border-2 border-gray-200 shadow-lg" 
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 저장 버튼 */}
          <div className="flex gap-4">
            <button 
              type="submit" 
              disabled={isSubmitting} 
              className="flex-1 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-bold text-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  수정 중...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  광고 수정 완료
                </>
              )}
            </button>
            <Link
              href="/advertiser/ads"
              className="px-8 py-4 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-all duration-200 flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              취소
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
} 