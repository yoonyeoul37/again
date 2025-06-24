'use client';

import { useEffect, useRef, useState } from 'react';

interface AdSlotProps {
  position: 'sidebar' | 'content' | 'bottom';
  className?: string;
}

export default function AdSlot({ position, className = '' }: AdSlotProps) {
  const adRef = useRef<HTMLDivElement>(null);
  const [isAdSenseLoaded, setIsAdSenseLoaded] = useState(false);
  const [isAdLoaded, setIsAdLoaded] = useState(false);

  useEffect(() => {
    // AdSense가 로드되었는지 확인
    const checkAdSense = () => {
      if (typeof window !== 'undefined' && (window as any).adsbygoogle) {
        setIsAdSenseLoaded(true);
        return true;
      }
      return false;
    };

    // 초기 확인
    if (checkAdSense()) {
      return;
    }

    // AdSense 로드 대기
    const interval = setInterval(() => {
      if (checkAdSense()) {
        clearInterval(interval);
      }
    }, 100);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!isAdSenseLoaded || isAdLoaded) return;

    // DOM이 준비되고 컨테이너가 렌더링된 후에 광고 로드
    const timer = setTimeout(() => {
      if (adRef.current) {
        try {
          // 컨테이너가 보이는지 확인
          const rect = adRef.current.getBoundingClientRect();
          if (rect.width > 0 && rect.height > 0) {
            // 이미 광고가 로드되었는지 확인
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
  }, [isAdSenseLoaded, isAdLoaded]);

  const getAdSize = () => {
    switch (position) {
      case 'sidebar':
        return 'w-full h-96'; // 300x600 또는 300x250
      case 'content':
        return 'w-full h-32'; // 728x90
      case 'bottom':
        return 'w-full h-32'; // 728x90
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
        return 'YOUR_SIDEBAR_AD_SLOT'; // 실제 Ad Slot ID로 교체 필요
      case 'content':
        return 'YOUR_CONTENT_AD_SLOT'; // 실제 Ad Slot ID로 교체 필요
      case 'bottom':
        return 'YOUR_BOTTOM_AD_SLOT'; // 실제 Ad Slot ID로 교체 필요
      default:
        return 'YOUR_DEFAULT_AD_SLOT';
    }
  };

  // 개발 환경에서는 플레이스홀더 표시
  if (process.env.NODE_ENV === 'development' || !isAdSenseLoaded) {
    return (
      <div ref={adRef} className={`${getAdSize()} ${getAdStyle()} ${className}`}>
        <div className="text-gray-500 text-sm">
          <div className="text-center">
            <div className="text-xs text-gray-400 mb-2">광고</div>
            <div className="text-gray-300">
              {position === 'sidebar' && '300x600 광고'}
              {position === 'content' && '728x90 광고'}
              {position === 'bottom' && '728x90 광고'}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div ref={adRef} className={`${getAdSize()} ${getAdStyle()} ${className}`}>
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client="ca-pub-YOUR_PUBLISHER_ID" // 실제 Publisher ID로 교체 필요
        data-ad-slot={getAdSlot()}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
} 