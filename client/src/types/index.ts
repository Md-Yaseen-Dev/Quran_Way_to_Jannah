export interface Surah {
  number: number;
  name: string;
  englishName: string;
  arabicName: string;
  numberOfAyahs: number;
  revelationType: 'Mecca' | 'Madina';
  ayahs?: Ayah[];
}

export interface Ayah {
  number: number;
  text: string;
  numberInSurah: number;
  juz: number;
  manzil: number;
  page: number;
  ruku: number;
  hizbQuarter: number;
  sajda?: boolean;
}

export interface Translation {
  [key: string]: {
    [ayahNumber: string]: string;
  };
}

export interface Topic {
  id: string;
  name: string;
  description: string;
  ayahs: Array<{
    surah: number;
    ayah: number;
    text: string;
    translation: string;
  }>;
}

export interface PrayerTime {
  name: string;
  time: string;
  arabicName: string;
  description: string;
}

export interface PrayerTimesResponse {
  Fajr: string;
  Dhuhr: string;
  Asr: string;
  Maghrib: string;
  Isha: string;
  Sunrise: string;
  Sunset: string;
}

export interface LastRead {
  surah: number;
  ayah: number;
  surahName: string;
  timestamp: number;
}

export interface UserPreferences {
  language: 'en' | 'ur' | 'roman-urdu' | 'hi';
  theme: 'light' | 'dark';
  arabicTextSize: 'small' | 'medium' | 'large' | 'xl';
  prayerNotifications: boolean;
  calculationMethod: string;
  lastRead?: LastRead;
}

export type TabType = 'surah' | 'para' | 'topics' | 'hizb';
