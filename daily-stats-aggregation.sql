-- 일일 통계 집계 함수
CREATE OR REPLACE FUNCTION aggregate_daily_stats(target_date DATE DEFAULT CURRENT_DATE)
RETURNS void AS $$
BEGIN
  -- 해당 날짜의 기존 통계 삭제
  DELETE FROM ad_stats_daily WHERE date = target_date;
  
  -- 새로운 통계 집계 및 삽입
  INSERT INTO ad_stats_daily (ad_id, date, impressions, clicks, ctr)
  SELECT 
    ad_id,
    target_date,
    COUNT(DISTINCT i.id) as impressions,
    COUNT(DISTINCT c.id) as clicks,
    CASE 
      WHEN COUNT(DISTINCT i.id) > 0 
      THEN ROUND(COUNT(DISTINCT c.id)::DECIMAL / COUNT(DISTINCT i.id)::DECIMAL, 4)
      ELSE 0 
    END as ctr
  FROM (
    SELECT DISTINCT ad_id 
    FROM ad_impressions 
    WHERE DATE(created_at) = target_date
    UNION
    SELECT DISTINCT ad_id 
    FROM ad_clicks 
    WHERE DATE(created_at) = target_date
  ) active_ads
  LEFT JOIN ad_impressions i ON active_ads.ad_id = i.ad_id AND DATE(i.created_at) = target_date
  LEFT JOIN ad_clicks c ON active_ads.ad_id = c.ad_id AND DATE(c.created_at) = target_date
  GROUP BY active_ads.ad_id;
  
  -- updated_at 필드 업데이트
  UPDATE ad_stats_daily 
  SET updated_at = NOW() 
  WHERE date = target_date;
END;
$$ LANGUAGE plpgsql;

-- 매일 자동 실행을 위한 cron job 설정 (Supabase에서 제공하는 경우)
-- SELECT cron.schedule('daily-stats-aggregation', '0 1 * * *', 'SELECT aggregate_daily_stats();'); 