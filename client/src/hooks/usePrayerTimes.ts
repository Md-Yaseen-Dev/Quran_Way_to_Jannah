import { useQuery } from '@tanstack/react-query';
import { PrayerTimesResponse, PrayerTime } from '@/types';

interface PrayerTimesApiResponse {
  data: {
    timings: PrayerTimesResponse;
    date: {
      readable: string;
      hijri: {
        date: string;
        month: {
          en: string;
          ar: string;
        };
        year: string;
      };
    };
    meta: {
      latitude: number;
      longitude: number;
      timezone: string;
      method: {
        id: number;
        name: string;
      };
      latitudeAdjustmentMethod: string;
      midnightMode: string;
      school: string;
      offset: {
        [key: string]: number;
      };
    };
  };
  code: number;
  status: string;
}

export function usePrayerTimes(latitude: number | null, longitude: number | null, method: string = '1') {
  return useQuery({
    queryKey: ['prayer-times', latitude, longitude, method],
    queryFn: async (): Promise<{ prayerTimes: PrayerTime[]; location: string; date: string; hijriDate: string } | null> => {
      if (!latitude || !longitude) return null;

      // Fetch prayer times from local JSON file
      const response = await fetch('/data/prayerTimes.json');
      if (!response.ok) throw new Error('Failed to fetch prayer times');
      const data = await response.json();
      return {
        prayerTimes: data.prayerTimes,
        location: data.location,
        date: data.date,
        hijriDate: data.hijriDate,
      };

    },
    enabled: !!latitude && !!longitude,
    staleTime: 1000 * 60 * 60, // 1 hour
    refetchInterval: 1000 * 60 * 60, // Refetch every hour
  });
}
