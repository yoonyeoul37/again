'use client';

import { useEffect, useRef, useState } from 'react';

interface AdSlotProps {
  position: 'sidebar' | 'content' | 'bottom';
  className?: string;
  ad?: {
    image_url?: string;
    title?: string;
    phone?: string;
    website?: string;
  };
}

const isDev = process.env.NODE_ENV === 'development';

export default function AdSlot({ position, className = '', ad }: AdSlotProps) {
  // getAdSize, getAdStyle 등 유틸 함수 선언
  const getAdSize = () => {
    switch (position) {
      case 'sidebar':
        return 'w-full h-96';
      case 'content':
        return 'w-full h-32';
      case 'bottom':
        return 'w-full h-32';
      default:
        return 'w-full h-32';
    }
  };
  const getAdStyle = () => {
    switch (position) {
      case 'sidebar':
        return 'bg-gray-100 border border-gray-200 rounded-lg flex items-center justify-center';
      case 'content':
        return 'bg-gray-50 border border-gray-200 rounded-lg flex items-center justify-center my-4';
      case 'bottom':
        return 'bg-gray-50 border border-gray-200 rounded-lg flex items-center justify-center mt-8';
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
      default:
        return 'YOUR_DEFAULT_AD_SLOT';
    }
  };

  // 모든 훅은 return문보다 위에!
  const adRef = useRef<HTMLDivElement>(null);
  const [isAdSenseLoaded, setIsAdSenseLoaded] = useState(false);
  const [isAdLoaded, setIsAdLoaded] = useState(false);

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
      <div ref={adRef} className={`${getAdSize()} ${getAdStyle()} ${className}`}>
        <a href={ad.website || '#'} target="_blank" rel="noopener noreferrer" className="block w-full h-full">
          {ad.image_url ? (
            <div
              className="w-full h-full bg-cover bg-center relative rounded-xl"
              style={{ backgroundImage: `url('${ad.image_url}')` }}
            >
              {/* 텍스트/전화번호 오버레이 완전 제거 */}
            </div>
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">내부 광고</div>
          )}
        </a>
      </div>
    );
  }

  if (isDev) {
    // 개발환경에서는 adsbygoogle 태그 자체를 렌더링하지 않음
    return null;
  }

  // 운영환경에서만 adsbygoogle 태그 렌더링
  return (
    <div ref={adRef} className={`${getAdSize()} ${getAdStyle()} ${className}`}>
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