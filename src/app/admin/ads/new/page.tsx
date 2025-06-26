"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';

// 대도시 데이터 (전체 지역 광고)
const majorCities = [
  { value: 'seoul', label: '서울 전체 (25개 구)', monthlyPrice: 110000 },
  { value: 'busan', label: '부산 전체 (16개 구/군)', monthlyPrice: 88000 },
  { value: 'daegu', label: '대구 전체 (8개 구/군)', monthlyPrice: 88000 },
  { value: 'incheon', label: '인천 전체 (10개 구/군)', monthlyPrice: 88000 },
  { value: 'daejeon', label: '대전 전체 (5개 구)', monthlyPrice: 88000 },
  { value: 'gwangju', label: '광주 전체 (5개 구)', monthlyPrice: 88000 },
  { value: 'ulsan', label: '울산 전체 (5개 구/군)', monthlyPrice: 88000 },
  { value: 'sejong', label: '세종특별자치시', monthlyPrice: 88000 }
];

// 중소도시/군 데이터 (최대 5개 선택)
const regions = [
  // 경기도
  { value: 'suwon', label: '수원시', monthlyPrice: 55000, category: '경기도' },
  { value: 'seongnam', label: '성남시', monthlyPrice: 55000, category: '경기도' },
  { value: 'bucheon', label: '부천시', monthlyPrice: 55000, category: '경기도' },
  { value: 'ansan', label: '안산시', monthlyPrice: 55000, category: '경기도' },
  { value: 'anyang', label: '안양시', monthlyPrice: 55000, category: '경기도' },
  { value: 'pyeongtaek', label: '평택시', monthlyPrice: 55000, category: '경기도' },
  { value: 'dongducheon', label: '동두천시', monthlyPrice: 55000, category: '경기도' },
  { value: 'uijeongbu', label: '의정부시', monthlyPrice: 55000, category: '경기도' },
  { value: 'goyang', label: '고양시', monthlyPrice: 55000, category: '경기도' },
  { value: 'gwangmyeong', label: '광명시', monthlyPrice: 55000, category: '경기도' },
  { value: 'gwangju_gyeonggi', label: '광주시', monthlyPrice: 55000, category: '경기도' },
  { value: 'yongin', label: '용인시', monthlyPrice: 55000, category: '경기도' },
  { value: 'paju', label: '파주시', monthlyPrice: 55000, category: '경기도' },
  { value: 'icheon', label: '이천시', monthlyPrice: 55000, category: '경기도' },
  { value: 'anseong', label: '안성시', monthlyPrice: 55000, category: '경기도' },
  { value: 'gimpo', label: '김포시', monthlyPrice: 55000, category: '경기도' },
  { value: 'hwaseong', label: '화성시', monthlyPrice: 55000, category: '경기도' },
  { value: 'yangju', label: '양주시', monthlyPrice: 55000, category: '경기도' },
  { value: 'pocheon', label: '포천시', monthlyPrice: 55000, category: '경기도' },
  { value: 'yeoju', label: '여주시', monthlyPrice: 55000, category: '경기도' },
  { value: 'gapyeong', label: '가평군', monthlyPrice: 55000, category: '경기도' },
  { value: 'yangpyeong', label: '양평군', monthlyPrice: 55000, category: '경기도' },
  { value: 'yeoncheon', label: '연천군', monthlyPrice: 55000, category: '경기도' },
  
  // 강원도
  { value: 'chuncheon', label: '춘천시', monthlyPrice: 55000, category: '강원도' },
  { value: 'wonju', label: '원주시', monthlyPrice: 55000, category: '강원도' },
  { value: 'gangneung', label: '강릉시', monthlyPrice: 55000, category: '강원도' },
  { value: 'donghae', label: '동해시', monthlyPrice: 55000, category: '강원도' },
  { value: 'taebaek', label: '태백시', monthlyPrice: 55000, category: '강원도' },
  { value: 'sokcho', label: '속초시', monthlyPrice: 55000, category: '강원도' },
  { value: 'samcheok', label: '삼척시', monthlyPrice: 55000, category: '강원도' },
  { value: 'hongcheon', label: '홍천군', monthlyPrice: 55000, category: '강원도' },
  { value: 'hoengseong', label: '횡성군', monthlyPrice: 55000, category: '강원도' },
  { value: 'yeongwol', label: '영월군', monthlyPrice: 55000, category: '강원도' },
  { value: 'pyeongchang', label: '평창군', monthlyPrice: 55000, category: '강원도' },
  { value: 'jeongseon', label: '정선군', monthlyPrice: 55000, category: '강원도' },
  { value: 'cheorwon', label: '철원군', monthlyPrice: 55000, category: '강원도' },
  { value: 'hwacheon', label: '화천군', monthlyPrice: 55000, category: '강원도' },
  { value: 'yanggu', label: '양구군', monthlyPrice: 55000, category: '강원도' },
  { value: 'inje', label: '인제군', monthlyPrice: 55000, category: '강원도' },
  { value: 'goseong_gangwon', label: '고성군', monthlyPrice: 55000, category: '강원도' },
  
  // 충청북도
  { value: 'cheongju', label: '청주시', monthlyPrice: 55000, category: '충청북도' },
  { value: 'chungju', label: '충주시', monthlyPrice: 55000, category: '충청북도' },
  { value: 'jecheon', label: '제천시', monthlyPrice: 55000, category: '충청북도' },
  { value: 'boeun', label: '보은군', monthlyPrice: 55000, category: '충청북도' },
  { value: 'okcheon', label: '옥천군', monthlyPrice: 55000, category: '충청북도' },
  { value: 'yeongdong', label: '영동군', monthlyPrice: 55000, category: '충청북도' },
  { value: 'jincheon', label: '진천군', monthlyPrice: 55000, category: '충청북도' },
  { value: 'goesan', label: '괴산군', monthlyPrice: 55000, category: '충청북도' },
  { value: 'eumseong', label: '음성군', monthlyPrice: 55000, category: '충청북도' },
  { value: 'danyang', label: '단양군', monthlyPrice: 55000, category: '충청북도' },
  { value: 'jeungpyeong', label: '증평군', monthlyPrice: 55000, category: '충청북도' },
  
  // 충청남도
  { value: 'cheonan', label: '천안시', monthlyPrice: 55000, category: '충청남도' },
  { value: 'asan', label: '아산시', monthlyPrice: 55000, category: '충청남도' },
  { value: 'seosan', label: '서산시', monthlyPrice: 55000, category: '충청남도' },
  { value: 'nonsan', label: '논산시', monthlyPrice: 55000, category: '충청남도' },
  { value: 'gongju', label: '공주시', monthlyPrice: 55000, category: '충청남도' },
  { value: 'buyeo', label: '부여군', monthlyPrice: 55000, category: '충청남도' },
  { value: 'seocheon', label: '서천군', monthlyPrice: 55000, category: '충청남도' },
  { value: 'cheongyang', label: '청양군', monthlyPrice: 55000, category: '충청남도' },
  { value: 'hongseong', label: '홍성군', monthlyPrice: 55000, category: '충청남도' },
  { value: 'yesan', label: '예산군', monthlyPrice: 55000, category: '충청남도' },
  { value: 'taean', label: '태안군', monthlyPrice: 55000, category: '충청남도' },
  { value: 'geumsan', label: '금산군', monthlyPrice: 55000, category: '충청남도' },
  { value: 'gyeryong', label: '계룡시', monthlyPrice: 55000, category: '충청남도' },
  { value: 'dangjin', label: '당진시', monthlyPrice: 55000, category: '충청남도' },
  
  // 전라북도
  { value: 'jeonju', label: '전주시', monthlyPrice: 55000, category: '전라북도' },
  { value: 'iksan', label: '익산시', monthlyPrice: 55000, category: '전라북도' },
  { value: 'gunsan', label: '군산시', monthlyPrice: 55000, category: '전라북도' },
  { value: 'jeongeup', label: '정읍시', monthlyPrice: 55000, category: '전라북도' },
  { value: 'namwon', label: '남원시', monthlyPrice: 55000, category: '전라북도' },
  { value: 'gimje', label: '김제시', monthlyPrice: 55000, category: '전라북도' },
  { value: 'wanju', label: '완주군', monthlyPrice: 55000, category: '전라북도' },
  { value: 'jinan', label: '진안군', monthlyPrice: 55000, category: '전라북도' },
  { value: 'muju', label: '무주군', monthlyPrice: 55000, category: '전라북도' },
  { value: 'jangsu', label: '장수군', monthlyPrice: 55000, category: '전라북도' },
  { value: 'imsil', label: '임실군', monthlyPrice: 55000, category: '전라북도' },
  { value: 'sunchang', label: '순창군', monthlyPrice: 55000, category: '전라북도' },
  { value: 'gochang', label: '고창군', monthlyPrice: 55000, category: '전라북도' },
  { value: 'buan', label: '부안군', monthlyPrice: 55000, category: '전라북도' },
  
  // 전라남도
  { value: 'mokpo', label: '목포시', monthlyPrice: 55000, category: '전라남도' },
  { value: 'yeosu', label: '여수시', monthlyPrice: 55000, category: '전라남도' },
  { value: 'suncheon', label: '순천시', monthlyPrice: 55000, category: '전라남도' },
  { value: 'naju', label: '나주시', monthlyPrice: 55000, category: '전라남도' },
  { value: 'gwangyang', label: '광양시', monthlyPrice: 55000, category: '전라남도' },
  { value: 'damyang', label: '담양군', monthlyPrice: 55000, category: '전라남도' },
  { value: 'gokseong', label: '곡성군', monthlyPrice: 55000, category: '전라남도' },
  { value: 'gurye', label: '구례군', monthlyPrice: 55000, category: '전라남도' },
  { value: 'goheung', label: '고흥군', monthlyPrice: 55000, category: '전라남도' },
  { value: 'boseong', label: '보성군', monthlyPrice: 55000, category: '전라남도' },
  { value: 'hwasun', label: '화순군', monthlyPrice: 55000, category: '전라남도' },
  { value: 'jangheung', label: '장흥군', monthlyPrice: 55000, category: '전라남도' },
  { value: 'gangjin', label: '강진군', monthlyPrice: 55000, category: '전라남도' },
  { value: 'haenam', label: '해남군', monthlyPrice: 55000, category: '전라남도' },
  { value: 'yeongam', label: '영암군', monthlyPrice: 55000, category: '전라남도' },
  { value: 'muan', label: '무안군', monthlyPrice: 55000, category: '전라남도' },
  { value: 'hampyeong', label: '함평군', monthlyPrice: 55000, category: '전라남도' },
  { value: 'yeonggwang', label: '영광군', monthlyPrice: 55000, category: '전라남도' },
  { value: 'jangseong', label: '장성군', monthlyPrice: 55000, category: '전라남도' },
  { value: 'wando', label: '완도군', monthlyPrice: 55000, category: '전라남도' },
  { value: 'jindo', label: '진도군', monthlyPrice: 55000, category: '전라남도' },
  { value: 'sinan', label: '신안군', monthlyPrice: 55000, category: '전라남도' },
  
  // 경상북도
  { value: 'pohang', label: '포항시', monthlyPrice: 55000, category: '경상북도' },
  { value: 'gumi', label: '구미시', monthlyPrice: 55000, category: '경상북도' },
  { value: 'gyeongju', label: '경주시', monthlyPrice: 55000, category: '경상북도' },
  { value: 'andong', label: '안동시', monthlyPrice: 55000, category: '경상북도' },
  { value: 'gimcheon', label: '김천시', monthlyPrice: 55000, category: '경상북도' },
  { value: 'sangju', label: '상주시', monthlyPrice: 55000, category: '경상북도' },
  { value: 'mungyeong', label: '문경시', monthlyPrice: 55000, category: '경상북도' },
  { value: 'yecheon', label: '예천군', monthlyPrice: 55000, category: '경상북도' },
  { value: 'yeongju', label: '영주시', monthlyPrice: 55000, category: '경상북도' },
  { value: 'bonghwa', label: '봉화군', monthlyPrice: 55000, category: '경상북도' },
  { value: 'uljin', label: '울진군', monthlyPrice: 55000, category: '경상북도' },
  { value: 'ulleung', label: '울릉군', monthlyPrice: 55000, category: '경상북도' },
  { value: 'cheongsong', label: '청송군', monthlyPrice: 55000, category: '경상북도' },
  { value: 'yeongyang', label: '영양군', monthlyPrice: 55000, category: '경상북도' },
  { value: 'yeongdeok', label: '영덕군', monthlyPrice: 55000, category: '경상북도' },
  { value: 'cheongdo', label: '청도군', monthlyPrice: 55000, category: '경상북도' },
  { value: 'seongju', label: '성주군', monthlyPrice: 55000, category: '경상북도' },
  { value: 'chilgok', label: '칠곡군', monthlyPrice: 55000, category: '경상북도' },
  { value: 'goryeong', label: '고령군', monthlyPrice: 55000, category: '경상북도' },
  
  // 경상남도
  { value: 'geochang', label: '거창군', monthlyPrice: 55000, category: '경상남도' },
  { value: 'hapcheon', label: '합천군', monthlyPrice: 55000, category: '경상남도' },
  { value: 'hamyang', label: '함양군', monthlyPrice: 55000, category: '경상남도' },
  { value: 'sancheong', label: '산청군', monthlyPrice: 55000, category: '경상남도' },
  { value: 'namhae', label: '남해군', monthlyPrice: 55000, category: '경상남도' },
  { value: 'hadong', label: '하동군', monthlyPrice: 55000, category: '경상남도' },
  { value: 'sacheon', label: '사천시', monthlyPrice: 55000, category: '경상남도' },
  { value: 'miryang', label: '밀양시', monthlyPrice: 55000, category: '경상남도' },
  { value: 'geoje', label: '거제시', monthlyPrice: 55000, category: '경상남도' },
  { value: 'yangsan', label: '양산시', monthlyPrice: 55000, category: '경상남도' },
  { value: 'tongyeong', label: '통영시', monthlyPrice: 55000, category: '경상남도' },
  { value: 'jinju', label: '진주시', monthlyPrice: 55000, category: '경상남도' },
  { value: 'changwon', label: '창원시', monthlyPrice: 55000, category: '경상남도' },
  
  // 제주도
  { value: 'jeju_city', label: '제주시', monthlyPrice: 55000, category: '제주도' },
  { value: 'seogwipo', label: '서귀포시', monthlyPrice: 55000, category: '제주도' }
];

// 지역 카테고리 목록
const categories = ['경기도', '강원도', '충청북도', '충청남도', '전라북도', '전라남도', '경상북도', '경상남도', '제주도'];

export default function AdminNewAdPage() {
  const router = useRouter();
  const [adType, setAdType] = useState<'major' | 'regional'>('major');
  const [selectedMajorCity, setSelectedMajorCity] = useState('seoul');
  const [selectedRegions, setSelectedRegions] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('경기도');
  const [formData, setFormData] = useState({
    advertiser: '',
    phone: '',
    email: '',
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    image: null as File | null
  });
  const [imagePreview, setImagePreview] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 가격 계산
  const calculatePrice = () => {
    if (adType === 'major') {
      const city = majorCities.find(c => c.value === selectedMajorCity);
      return city?.monthlyPrice || 0;
    } else {
      const selectedRegionData = selectedRegions.map(regionValue => 
        regions.find(r => r.value === regionValue)
      ).filter(Boolean);
      if (selectedRegionData.length === 0) return 0;
      const totalMonthlyPrice = selectedRegionData.reduce((sum, region) => 
        sum + (region?.monthlyPrice || 0), 0
      );
      return Math.round(totalMonthlyPrice / selectedRegionData.length);
    }
  };

  // 계약 기간 계산
  const calculateContractDays = () => {
    if (!formData.startDate || !formData.endDate) return 0;
    const start = new Date(formData.startDate);
    const end = new Date(formData.endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  };

  const monthlyPrice = calculatePrice();
  const contractDays = calculateContractDays();
  const dailyPrice = Math.round(monthlyPrice / 30);
  const totalPrice = dailyPrice * contractDays;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleRegionToggle = (regionValue: string) => {
    setSelectedRegions(prev => {
      if (prev.includes(regionValue)) {
        return prev.filter(r => r !== regionValue);
      } else {
        if (prev.length >= 5) {
          alert('최대 5개 지역까지 선택할 수 있습니다.');
          return prev;
        }
        return [...prev, regionValue];
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
      
      setFormData(prev => ({
        ...prev,
        image: file
      }));

      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (contractDays < 30) {
      alert('광고 계약 기간은 최소 30일(한 달) 이상이어야 합니다.');
      return;
    }
    setIsSubmitting(true);
    try {
      let imageUrl = null;
      if (formData.image) {
        const fileExt = formData.image.name.split('.').pop();
        const fileName = `${Date.now()}.${fileExt}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('ad-images')
          .upload(fileName, formData.image);
        if (uploadError) {
          console.error('이미지 업로드 실패:', uploadError);
          alert('이미지 업로드 실패: ' + uploadError.message);
          setIsSubmitting(false);
          return;
        } else {
          console.log('이미지 업로드 성공:', uploadData);
          const { data: urlData } = supabase.storage
            .from('ad-images')
            .getPublicUrl(fileName);
          imageUrl = urlData.publicUrl;
          console.log('이미지 공개 URL:', imageUrl);
        }
      }

      // 관리자가 광고 등록 (advertiser_id는 null로 설정)
      const { data, error } = await supabase.from('ads').insert([
        {
          advertiser_id: null, // 관리자가 등록한 광고는 advertiser_id를 null로 설정
          advertiser: formData.advertiser,
          phone: formData.phone,
          email: formData.email,
          title: formData.title,
          description: formData.description,
          start_date: formData.startDate,
          end_date: formData.endDate,
          ad_type: adType,
          major_city: adType === 'major' ? selectedMajorCity : null,
          regions: adType === 'regional' ? selectedRegions : null,
          status: 'approved', // 관리자가 등록한 광고는 바로 승인 상태로 설정
          created_at: new Date().toISOString(),
          image_url: imageUrl,
        }
      ]);
      if (error) {
        alert('광고 등록 실패: ' + error.message);
        return;
      }
      alert('광고가 성공적으로 등록되었습니다!');
      router.push('/admin/ads');
    } catch (error) {
      alert('광고 등록 중 오류가 발생했습니다.');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW'
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-gray-50" style={{fontFamily: `'Malgun Gothic', '맑은 고딕', Dotum, '돋움', Arial, Helvetica, sans-serif`}}>
      {/* 헤더 */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-900">관리자 광고 등록</h1>
              <span className="text-sm text-blue-600 bg-blue-50 px-2 py-1 rounded">관리자 등록</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/admin/ads" className="text-gray-600 hover:text-gray-700 text-sm font-medium">
                광고 목록으로
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* 광고주 정보 */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">광고주 정보</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  광고주명 *
                </label>
                <input
                  type="text"
                  name="advertiser"
                  value={formData.advertiser}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="예: 강남법무사"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  연락처 *
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="예: 02-1234-5678"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  이메일 *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="예: contact@law.com"
                />
              </div>
            </div>
          </div>

          {/* 광고 내용 */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">광고 내용</h2>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  광고 제목 *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="예: 강남법무사 무료상담"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  광고 설명 *
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="예: 개인회생, 개인파산 전문 상담"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  광고 이미지
                </label>
                <div className="space-y-4">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <p className="text-sm text-gray-500">
                    권장 크기: 300x200px, 최대 5MB (JPG, PNG)
                  </p>
                  {imagePreview && (
                    <div className="mt-4">
                      <img
                        src={imagePreview}
                        alt="미리보기"
                        className="w-48 h-32 object-cover rounded-lg border border-gray-200"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* 광고 타입 및 지역 선택 */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">광고 타입 및 지역 선택</h2>
            
            {/* 광고 타입 선택 */}
            <div className="mb-6">
              <div className="flex space-x-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="major"
                    checked={adType === 'major'}
                    onChange={(e) => setAdType(e.target.value as 'major' | 'regional')}
                    className="mr-2"
                  />
                  <span className="text-sm font-medium text-gray-700">대도시 전체 지역</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="regional"
                    checked={adType === 'regional'}
                    onChange={(e) => setAdType(e.target.value as 'major' | 'regional')}
                    className="mr-2"
                  />
                  <span className="text-sm font-medium text-gray-700">중소도시/군 선택 (최대 5개)</span>
                </label>
              </div>
            </div>

            {/* 대도시 선택 */}
            {adType === 'major' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  대도시 선택 *
                </label>
                <select
                  value={selectedMajorCity}
                  onChange={(e) => setSelectedMajorCity(e.target.value)}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {majorCities.map(city => (
                    <option key={city.value} value={city.value}>
                      {city.label} - 월 {formatCurrency(city.monthlyPrice)}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* 중소도시/군 선택 */}
            {adType === 'regional' && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <label className="block text-sm font-medium text-gray-700">
                    지역 선택 (최대 5개) *
                  </label>
                  <span className="text-sm text-gray-500">
                    {selectedRegions.length}/5 선택됨
                  </span>
                </div>
                
                {/* 지역 카테고리 탭 */}
                <div className="mb-4">
                  <div className="flex flex-wrap gap-2">
                    {categories.map(category => (
                      <button
                        key={category}
                        type="button"
                        onClick={() => setSelectedCategory(category)}
                        className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                          selectedCategory === category
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {category}
                      </button>
                    ))}
                  </div>
                </div>
                
                {/* 선택된 카테고리의 지역들 */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-96 overflow-y-auto border border-gray-200 rounded-lg p-4">
                  {regions
                    .filter(region => region.category === selectedCategory)
                    .map(region => (
                      <label key={region.value} className="flex items-center p-2 hover:bg-gray-50 rounded cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedRegions.includes(region.value)}
                          onChange={() => handleRegionToggle(region.value)}
                          className="mr-2"
                        />
                        <span className="text-sm text-gray-700">{region.label}</span>
                      </label>
                    ))}
                </div>
                
                {selectedRegions.length > 0 && (
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-800">
                      선택된 지역: {selectedRegions.map(r => regions.find(region => region.value === r)?.label).join(', ')}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 계약 기간 설정 */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">계약 기간 설정</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  계약 시작일 *
                </label>
                <input
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleInputChange}
                  required
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  계약 종료일 *
                </label>
                <input
                  type="date"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleInputChange}
                  required
                  min={formData.startDate || new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  계약 기간
                </label>
                <div className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg">
                  <span className="text-gray-900">
                    {contractDays > 0 ? `${contractDays}일` : '계약 기간을 선택해주세요'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 가격 정보 */}
          <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
            <h2 className="text-lg font-semibold text-blue-900 mb-4">가격 정보</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-700">월 기본 요금:</span>
                <span className="font-medium">{formatCurrency(monthlyPrice)} <span className="text-xs text-gray-500">(부가세 포함)</span></span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-700">일일 요금 (월 요금 ÷ 30일):</span>
                <span className="font-medium">{formatCurrency(dailyPrice)} <span className="text-xs text-gray-500">(부가세 포함)</span></span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-700">계약 기간:</span>
                <span className="font-medium">{contractDays}일</span>
              </div>
              <div className="border-t border-blue-200 pt-3">
                <div className="flex justify-between">
                  <span className="text-lg font-semibold text-blue-900">총 결제 금액:</span>
                  <span className="text-lg font-bold text-blue-900">{formatCurrency(totalPrice)} <span className="text-xs text-gray-500">(부가세 포함)</span></span>
                </div>
              </div>
            </div>
            <div className="mt-4 p-4 bg-blue-100 rounded-lg">
              <p className="text-sm text-blue-800">
                💡 관리자가 등록한 광고는 자동으로 승인 상태로 등록됩니다.
              </p>
            </div>
          </div>

          {/* 제출 버튼 */}
          <div className="flex justify-end space-x-4">
            <Link
              href="/admin/ads"
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              취소
            </Link>
            <button
              type="submit"
              disabled={isSubmitting || (adType === 'regional' && selectedRegions.length === 0)}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? '등록 중...' : '광고 등록'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 