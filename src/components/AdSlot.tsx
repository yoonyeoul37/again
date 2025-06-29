'use client';

import { useEffect, useRef, useState } from 'react';
import { recordImpression, recordClick } from '@/lib/adStats';

interface AdSlotProps {
  position: 'sidebar' | 'content' | 'bottom' | 'top';
  className?: string;
  style?: React.CSSProperties;
  ad?: {
    id?: number;
    image_url?: string;
    title?: string;
    phone?: string;
    website?: string;
  };
}

const isDev = process.env.NODE_ENV === 'development';

export default function AdSlot({ position, className = '', style, ad }: AdSlotProps) {
  // getAdSize, getAdStyle 등 유틸 함수 선언
  const getAdSize = () => {
    switch (position) {
      case 'sidebar':
        return 'w-full h-full';
      case 'content':
        return 'w-full h-28';
      case 'bottom':
        return 'w-full h-20';
      case 'top':
        return 'w-full h-full';
      default:
        return 'w-full h-28';
    }
  };
  const getAdStyle = () => {
    switch (position) {
      case 'sidebar':
        return 'bg-gray-100 border border-gray-200 rounded-lg flex items-center justify-center';
      case 'content':
        return 'bg-gray-50 border border-gray-200 rounded-lg flex items-center justify-center';
      case 'bottom':
        return 'bg-gray-50 border border-gray-200 rounded-lg flex items-center justify-center mt-8';
      case 'top':
        return 'bg-gray-100 border border-gray-200 rounded-lg flex items-center justify-center';
      default:
        return 'bg-gray-50 border border-gray-200 rounded-lg flex items-center justify-center';
    }
  };
  const getAdSlot = () => {
    switch (position) {
      case 'sidebar':
        return 'YOUR_SIDEBAR_AD_SLOT';
      case 'content':
        return 'YOUR_CONTENT_AD_SLOT';
      case 'bottom':
        return 'YOUR_BOTTOM_AD_SLOT';
      case 'top':
        return 'YOUR_TOP_AD_SLOT';
      default:
        return 'YOUR_DEFAULT_AD_SLOT';
    }
  };

  // 모든 훅은 return문보다 위에!
  const adRef = useRef<HTMLDivElement>(null);
  const [isAdSenseLoaded, setIsAdSenseLoaded] = useState(false);
  const [isAdLoaded, setIsAdLoaded] = useState(false);
  const [impressionRecorded, setImpressionRecorded] = useState(false);

  // 광고 노출 기록
  useEffect(() => {
    // id가 uuid(36자, 하이픈 포함)일 때만 기록
    if (ad?.id && typeof ad.id === 'string' && ad.id.length === 36 && ad.id.includes('-') && !impressionRecorded) {
      const pageUrl = window.location.href;
      console.log('광고 노출 기록:', ad.id, pageUrl);
      recordImpression(ad.id, pageUrl);
      setImpressionRecorded(true);
    }
  }, [ad?.id, impressionRecorded]);

  // 광고 클릭 핸들러
  const handleAdClick = async () => {
    if (ad?.id) {
      console.log('광고 클릭 기록:', ad.id);
      await recordClick(ad.id);
    }
  };

  useEffect(() => {
    if (isDev || ad) return; // 개발환경 또는 내부광고면 adsbygoogle 실행 X
    if (!isAdSenseLoaded || isAdLoaded) return;
    const timer = setTimeout(() => {
      if (adRef.current) {
        try {
          const rect = adRef.current.getBoundingClientRect();
          if (rect.width > 0 && rect.height > 0) {
            const insElement = adRef.current.querySelector('ins.adsbygoogle');
            if (insElement && !insElement.hasAttribute('data-ad-status')) {
              (window as any).adsbygoogle.push({});
              setIsAdLoaded(true);
            }
          }
        } catch (error) {
          console.error('AdSense error:', error);
        }
      }
    }, 100);
    return () => clearTimeout(timer);
  }, [isAdSenseLoaded, isAdLoaded, ad]);

  useEffect(() => {
    if (isDev || ad) return;
    const checkAdSense = () => {
      if (typeof window !== 'undefined' && (window as any).adsbygoogle) {
        setIsAdSenseLoaded(true);
        return true;
      }
      return false;
    };
    if (checkAdSense()) {
      return;
    }
    const interval = setInterval(() => {
      if (checkAdSense()) {
        clearInterval(interval);
      }
    }, 100);
    return () => clearInterval(interval);
  }, [ad]);

  // 조건부 return은 훅 호출 이후에만!
  if (ad) {
    return (
      <div ref={adRef} className={`${getAdSize()} ${getAdStyle()} ${className}`} style={style}>
        <a 
          href={ad.website || '#'} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="block w-full h-full"
          onClick={handleAdClick}
        >
          {ad.image_url ? (
            <img
              src={ad.image_url}
              alt={ad.title || '광고 이미지'}
              className="w-full h-full object-cover rounded-lg shadow-sm"
              onError={(e) => {
                // 이미지 로드 실패 시 대체 콘텐츠 표시
                e.currentTarget.style.display = 'none';
                const parent = e.currentTarget.parentElement;
                if (parent) {
                  parent.innerHTML = `
                    <div class="w-full h-full flex flex-col items-center justify-center text-gray-600 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg">
                      <div class="text-lg font-bold mb-2">📢</div>
                      <div class="text-sm font-medium text-center">${ad.title || '광고'}</div>
                      <div class="text-xs text-gray-500 mt-1">클릭하여 상세보기</div>
                    </div>
                  `;
                }
              }}
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-gray-600 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg">
              <div className="text-lg font-bold mb-2">📢</div>
              <div className="text-sm font-medium text-center">{ad.title || '광고'}</div>
              <div className="text-xs text-gray-500 mt-1">클릭하여 상세보기</div>
            </div>
          )}
        </a>
      </div>
    );
  }

  if (isDev) {
    // 개발환경에서는 플레이스홀더 광고 표시
    return (
      <div ref={adRef} className={`${getAdSize()} ${getAdStyle()} ${className}`} style={style}>
        <div className="w-full h-full flex flex-col items-center justify-center text-gray-500 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg border-2 border-dashed border-gray-300">
          <div className="text-sm font-medium mb-1">광고 영역</div>
          <div className="text-xs opacity-75">{position}</div>
        </div>
      </div>
    );
  }

  // 운영환경에서만 adsbygoogle 태그 렌더링
  return (
    <div ref={adRef} className={`${getAdSize()} ${getAdStyle()} ${className}`} style={style}>
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client="ca-pub-YOUR_PUBLISHER_ID"
        data-ad-slot={getAdSlot()}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
}