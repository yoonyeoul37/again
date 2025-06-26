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
  // ... (생략: 나머지 지역도 광고주용과 동일하게 추가)
];

export default function AdminEditAdPage() {
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
    async function fetchAd() {
      setLoading(true);
      const { data, error } = await supabase.from("ads").select("*").eq("id", adId).single();
      if (error || !data) {
        alert("광고 정보를 불러올 수 없습니다.");
        router.replace("/admin/ads");
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
      image_url: imageUrl
    }).eq("id", adId);
    setIsSubmitting(false);
    if (error) {
      alert("수정 실패: " + error.message);
    } else {
      alert("광고가 성공적으로 수정되었습니다!");
      router.push("/admin/ads");
    }
  };

  if (loading) return <div className="p-8 text-center">로딩 중...</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto py-8 px-4">
        <h1 className="text-2xl font-bold mb-6">관리자 광고 수정</h1>
        <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-xl shadow">
          <div>
            <label className="block text-sm font-medium mb-1">광고주명</label>
            <input type="text" name="advertiser" value={formData.advertiser} onChange={handleInputChange} required className="w-full px-4 py-2 border rounded" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">연락처</label>
            <input type="text" name="phone" value={formData.phone} onChange={handleInputChange} required className="w-full px-4 py-2 border rounded" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">이메일</label>
            <input type="email" name="email" value={formData.email} onChange={handleInputChange} required className="w-full px-4 py-2 border rounded" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">웹사이트</label>
            <input type="text" name="website" value={formData.website} onChange={handleInputChange} className="w-full px-4 py-2 border rounded" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">광고 제목</label>
            <input type="text" name="title" value={formData.title} onChange={handleInputChange} required className="w-full px-4 py-2 border rounded" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">광고 설명</label>
            <textarea name="description" value={formData.description} onChange={handleInputChange} required rows={3} className="w-full px-4 py-2 border rounded" />
          </div>
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1">시작일</label>
              <input type="date" name="startDate" value={formData.startDate} onChange={handleInputChange} required className="w-full px-4 py-2 border rounded" />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1">종료일</label>
              <input type="date" name="endDate" value={formData.endDate} onChange={handleInputChange} required className="w-full px-4 py-2 border rounded" />
            </div>
          </div>
          {/* 광고 타입 선택 */}
          <div>
            <label className="block text-sm font-medium mb-1">광고 타입</label>
            <div className="flex gap-4">
              <label className="flex items-center">
                <input type="radio" name="ad_type" value="major" checked={formData.ad_type === 'major'} onChange={handleAdTypeChange} className="mr-2" />
                대도시 전체
              </label>
              <label className="flex items-center">
                <input type="radio" name="ad_type" value="regional" checked={formData.ad_type === 'regional'} onChange={handleAdTypeChange} className="mr-2" />
                지역 선택
              </label>
            </div>
          </div>
          {/* 대도시 선택 */}
          {formData.ad_type === 'major' && (
            <div>
              <label className="block text-sm font-medium mb-1">대도시</label>
              <select name="major_city" value={formData.major_city} onChange={handleMajorCityChange} className="w-full px-4 py-2 border rounded">
                {majorCities.map(city => (
                  <option key={city.value} value={city.value}>{city.label}</option>
                ))}
              </select>
            </div>
          )}
          {/* 지역 선택 */}
          {formData.ad_type === 'regional' && (
            <div>
              <label className="block text-sm font-medium mb-1">지역(최대 5개)</label>
              <div className="flex flex-wrap gap-2">
                {regions.map(region => (
                  <label key={region.value} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.regions.includes(region.value)}
                      onChange={() => handleRegionToggle(region.value)}
                      className="mr-1"
                    />
                    {region.label}
                  </label>
                ))}
              </div>
            </div>
          )}
          {/* 이미지 업로드 */}
          <div>
            <label className="block text-sm font-medium mb-1">광고 이미지</label>
            <input type="file" accept="image/*" onChange={handleImageChange} className="w-full px-4 py-2 border rounded" />
            {imagePreview && (
              <div className="mt-2">
                <img src={imagePreview} alt="미리보기" className="w-48 h-32 object-cover rounded border" />
              </div>
            )}
          </div>
          <button type="submit" disabled={isSubmitting} className="w-full py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition">
            {isSubmitting ? "수정 중..." : "저장"}
          </button>
        </form>
      </div>
    </div>
  );
} 