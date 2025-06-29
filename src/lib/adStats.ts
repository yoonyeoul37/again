import { supabase } from './supabaseClient';

// 광고 노출 기록
export async function recordImpression(adId: number, pageUrl: string) {
  try {
    const { data, error } = await supabase
      .from('ad_impressions')
      .insert({
        ad_id: adId,
        page_url: pageUrl,
        user_agent: navigator.userAgent
      })
      .select()
      .single();

    if (error) {
      console.error('Impression 기록 실패:', JSON.stringify(error));
      return null;
    }

    return data;
  } catch (error) {
    console.error('Impression 기록 중 오류:', error);
    return null;
  }
}

// 광고 클릭 기록
export async function recordClick(adId: number, impressionId?: number) {
  try {
    const { data, error } = await supabase
      .from('ad_clicks')
      .insert({
        ad_id: adId,
        impression_id: impressionId,
        user_ip: 'client_ip',
        user_agent: navigator.userAgent
      })
      .select()
      .single();

    if (error) {
      console.error('Click 기록 실패:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Click 기록 중 오류:', error);
    return null;
  }
}

// 일일 통계 가져오기 (광고주용)
export async function getAdStats(adId: number, startDate?: string, endDate?: string) {
  try {
    let query = supabase
      .from('ad_stats_daily')
      .select('*')
      .eq('ad_id', adId)
      .order('date', { ascending: false });

    if (startDate) {
      query = query.gte('date', startDate);
    }
    if (endDate) {
      query = query.lte('date', endDate);
    }

    const { data, error } = await query;

    if (error) {
      console.error('통계 조회 실패:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('통계 조회 중 오류:', error);
    return [];
  }
}

// 모든 광고 통계 가져오기 (관리자용)
export async function getAllAdStats(startDate?: string, endDate?: string) {
  try {
    let query = supabase
      .from('ad_stats_daily')
      .select(`
        *,
        ads (
          id,
          title,
          advertiser_id,
          profiles!ads_advertiser_id_fkey (
            company_name
          )
        )
      `)
      .order('date', { ascending: false });

    if (startDate) {
      query = query.gte('date', startDate);
    }
    if (endDate) {
      query = query.lte('date', endDate);
    }

    const { data, error } = await query;

    if (error) {
      console.error('전체 통계 조회 실패:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('전체 통계 조회 중 오류:', error);
    return [];
  }
} 