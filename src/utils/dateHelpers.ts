/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Format string date to short Japanese date like "6/15 (月)"
export const formatJapaneseDateWithDay = (dateStr: string): string => {
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  const days = ['日', '月', '火', '水', '木', '金', '土'];
  const month = d.getMonth() + 1;
  const date = d.getDate();
  const day = days[d.getDay()];
  return `${month}/${date} (${day})`;
};

// Format ISO string date to "6月15日 17:30"
export const formatTimestamp = (isoStr: string): string => {
  const d = new Date(isoStr);
  if (isNaN(d.getTime())) return isoStr;
  const month = d.getMonth() + 1;
  const date = d.getDate();
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `${month}月${date}日 ${hours}:${minutes}`;
};

// Generate an array of YYYY-MM-DD dates between start and end
export const getDatesInRange = (startStr: string, endStr: string): string[] => {
  const start = new Date(startStr);
  const end = new Date(endStr);
  const dates: string[] = [];
  
  if (isNaN(start.getTime()) || isNaN(end.getTime())) return [];
  
  // Guard max 60 days to prevent infinite loops or UI explosion
  let current = new Date(start);
  let count = 0;
  while (current <= end && count < 60) {
    dates.push(current.toISOString().split('T')[0]);
    current.setDate(current.getDate() + 1);
    count++;
  }
  return dates;
};

// Calculate number of calendar days between two dates inclusive
export const getDaysCount = (startStr: string, endStr: string): number => {
  const start = new Date(startStr);
  const end = new Date(endStr);
  if (isNaN(start.getTime()) || isNaN(end.getTime())) return 1;
  const diffTime = Math.abs(end.getTime() - start.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  return diffDays;
};

// Check if a date is today
export const isTodayStr = (dateStr: string): boolean => {
  const today = new Date().toISOString().split('T')[0];
  return dateStr === today;
};

// Get modern localized relative time in Japanese
export const relativeTimeJapanese = (isoStr: string): string => {
  const d = new Date(isoStr);
  if (isNaN(d.getTime())) return isoStr;
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return 'たった今';
  if (diffMins < 60) return `${diffMins}分前`;
  if (diffHours < 24) return `${diffHours}時間前`;
  if (diffDays === 1) return '昨日';
  return `${diffDays}日前`;
};
