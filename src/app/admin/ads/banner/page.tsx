"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/components/AuthProvider";

interface Banner {
  id?: number;
  image_url: string;
  link: string;
  slot_number: number;
}

export default function AdminBannerAdPage() {
  const { user } = useAuth();
  const [banners, setBanners] = useState<Banner[]>([
    { image_url: "", link: "", slot_number: 1 },
    { image_url: "", link: "", slot_number: 2 },
  ]);
  const [uploading, setUploading] = useState([false, false]);
  const [message, setMessage] = useState("");

  // DB에서 불러오기
  useEffect(() => {
    async function fetchBanners() {
      const { data, error } = await supabase
        .from("custom_banners")
        .select("id, image_url, link, slot_number")
        .order("slot_number");
      if (data) {
        const arr = [
          data.find((b: Banner) => b.slot_number === 1) || { image_url: "", link: "", slot_number: 1 },
          data.find((b: Banner) => b.slot_number === 2) || { image_url: "", link: "", slot_number: 2 },
        ];
        setBanners(arr);
      }
    }
    fetchBanners();
  }, []);

  // 이미지 업로드
  const handleImageChange = async (idx: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(u => u.map((v, i) => (i === idx ? true : v)));
    const fileExt = file.name.split('.').pop();
    const fileName = `banner_${idx + 1}_${Date.now()}.${fileExt}`;
    const { data, error } = await supabase.storage.from("banners").upload(fileName, file, { upsert: true });
    if (error) {
      setMessage("이미지 업로드 실패: " + error.message);
      setUploading(u => u.map((v, i) => (i === idx ? false : v)));
      return;
    }
    const url = supabase.storage.from("banners").getPublicUrl(fileName).data.publicUrl;
    const newBanners = [...banners];
    newBanners[idx].image_url = url;
    setBanners(newBanners);
    setUploading(u => u.map((v, i) => (i === idx ? false : v)));
  };

  // 링크 입력
  const handleLinkChange = (idx: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const newBanners = [...banners];
    newBanners[idx].link = e.target.value;
    setBanners(newBanners);
  };

  // 저장
  const handleSave = async () => {
    setMessage("");
    console.log('user:', user);
    console.log('owner_email:', user?.email);
    console.log('banners:', JSON.stringify(banners, null, 2));
    let savedCount = 0;
    for (let i = 0; i < 2; i++) {
      // 이미지가 없는 배너는 저장 시도하지 않음
      if (!banners[i].image_url || banners[i].image_url === "EMPTY") {
        continue;
      }
      if (!user?.email) {
        setMessage("로그인 정보가 없습니다.");
        return;
      }
      const { data, error } = await supabase
        .from("custom_banners")
        .upsert({
          image_url: banners[i].image_url,
          link: banners[i].link || "", // 링크가 없어도 빈 값 허용
          slot_number: i + 1,
          owner_email: user.email,
        }, { onConflict: "slot_number" });
      if (error) {
        setMessage("저장 실패: " + error.message);
        return;
      }
      savedCount++;
    }
    if (savedCount > 0) {
      setMessage("저장되었습니다!");
    } else {
      setMessage("저장할 배너가 없습니다. 이미지를 업로드하세요.");
    }
  };

  // 삭제 함수 추가
  const handleDelete = async (idx: number) => {
    if (!user?.email) {
      setMessage("로그인 정보가 없습니다.");
      return;
    }
    const { error } = await supabase
      .from("custom_banners")
      .delete()
      .eq("slot_number", idx + 1)
      .eq("owner_email", user.email);
    if (error) {
      setMessage("삭제 실패: " + error.message);
      return;
    }
    // UI에서 해당 배너 비우기
    const newBanners = [...banners];
    newBanners[idx] = { image_url: "", link: "", slot_number: idx + 1 };
    setBanners(newBanners);
    setMessage("삭제되었습니다!");
  };

  return (
    <div className="max-w-xl mx-auto py-12">
      <h1 className="text-2xl font-bold mb-8">광고 배너 관리 (최대 2개)</h1>
      {[0, 1].map(idx => (
        <div key={idx} className="mb-8 p-6 bg-white rounded-xl shadow border border-gray-200">
          <h2 className="text-lg font-semibold mb-4 flex items-center">배너 {idx + 1}
            {/* 삭제 버튼 */}
            {banners[idx].image_url && (
              <button
                onClick={() => handleDelete(idx)}
                className="ml-3 px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-xs"
              >
                삭제
              </button>
            )}
          </h2>
          <div className="mb-3">
            <label className="block text-sm font-medium mb-1">이미지 업로드</label>
            <input type="file" accept="image/*" onChange={e => handleImageChange(idx, e)} disabled={uploading[idx]} />
            {banners[idx].image_url && (
              <div className="mt-2">
                <img src={banners[idx].image_url} alt={`배너${idx+1} 미리보기`} className="w-60 h-20 object-contain rounded border" />
              </div>
            )}
          </div>
          <div className="mb-3">
            <label className="block text-sm font-medium mb-1">광고 링크(URL)</label>
            <input type="text" value={banners[idx].link} onChange={e => handleLinkChange(idx, e)} className="w-full px-3 py-2 border rounded" placeholder="https://your-website.com" />
          </div>
        </div>
      ))}
      <button onClick={handleSave} className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700">저장</button>
      {message && <div className="mt-4 text-green-600 font-semibold">{message}</div>}
    </div>
  );
} 