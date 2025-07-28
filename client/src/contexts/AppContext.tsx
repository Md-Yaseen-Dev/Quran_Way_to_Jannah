import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { UserPreferences, Surah, Translation, Topic, LastRead } from '@/types';

interface AppContextType {
  preferences: UserPreferences;
  updatePreferences: (prefs: Partial<UserPreferences>) => void;
  surahs: Surah[];
  translations: Translation;
  topics: Topic[];
  loading: boolean;
  error: string | null;
  selectedTopic: string | null;
  setSelectedTopic: (topic: string | null) => void;
  filteredSurahs: Surah[];
  updateLastRead: (surah: number, ayah: number, surahName: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const defaultPreferences: UserPreferences = {
  language: 'en',
  theme: 'light',
  arabicTextSize: 'medium',
  prayerNotifications: true,
  calculationMethod: '1',
};

interface AppProviderProps {
  children: ReactNode;
}

export function AppProvider({ children }: AppProviderProps) {
  const [preferences, setPreferences] = useState<UserPreferences>(defaultPreferences);
  const [surahs, setSurahs] = useState<Surah[]>([]);
  const [translations, setTranslations] = useState<Translation>({});
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);

  // Load user preferences from localStorage
  useEffect(() => {
    const savedPrefs = localStorage.getItem('quran-app-preferences');
    if (savedPrefs) {
      try {
        const parsedPrefs = JSON.parse(savedPrefs);
        setPreferences({ ...defaultPreferences, ...parsedPrefs });
      } catch (err) {
        console.error('Error parsing saved preferences:', err);
      }
    }

    // Apply theme
    const savedTheme = localStorage.getItem('quran-app-theme');
    if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.documentElement.classList.add('dark');
      setPreferences(prev => ({ ...prev, theme: 'dark' }));
    }
  }, []);

  // Load Quran data
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // Load Quran data
        const quranResponse = await fetch('/data/quran.json');
        console.log("quranResponse",quranResponse);
        if (!quranResponse.ok) throw new Error('Failed to load Quran data');
        const quranData = await quranResponse.json();
        console.log("quranData",quranData);
        setSurahs(quranData.surahs);

        // Load translation based on selected language
        const translationFile = preferences.language === 'en' ? 'english' : 
                               preferences.language === 'ur' ? 'urdu' :
                               preferences.language === 'roman-urdu' ? 'roman-urdu' : 'hindi';
        const translationResponse = await fetch(`/data/translations/${translationFile}.json`);
        if (!translationResponse.ok) throw new Error('Failed to load translation data');
        const translationData = await translationResponse.json();
        setTranslations(translationData);

        // Load topics
        const topicsResponse = await fetch('/data/topics.json');
        if (!topicsResponse.ok) throw new Error('Failed to load topics data');
        const topicsData = await topicsResponse.json();
        setTopics(topicsData.topics);

      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [preferences.language]);

  const updatePreferences = (newPrefs: Partial<UserPreferences>) => {
    setPreferences(prev => {
      const updated = { ...prev, ...newPrefs };
      localStorage.setItem('quran-app-preferences', JSON.stringify(updated));
      
      // Apply theme changes immediately
      if (newPrefs.theme) {
        if (newPrefs.theme === 'dark') {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
        localStorage.setItem('quran-app-theme', newPrefs.theme);
      }
      
      return updated;
    });
  };

  const updateLastRead = (surah: number, ayah: number, surahName: string) => {
    const lastRead: LastRead = {
      surah,
      ayah,
      surahName,
      timestamp: Date.now(),
    };
    updatePreferences({ lastRead });
  };

  // Filter surahs based on selected topic
  const filteredSurahs = React.useMemo(() => {
    if (!selectedTopic) return surahs;
    
    const topic = topics.find(t => t.id === selectedTopic);
    if (!topic) return surahs;
    
    const relevantSurahs = new Set(topic.ayahs.map(ayah => ayah.surah));
    return surahs.filter(surah => relevantSurahs.has(surah.number));
  }, [surahs, selectedTopic, topics]);

  const value: AppContextType = {
    preferences,
    updatePreferences,
    surahs,
    translations,
    topics,
    loading,
    error,
    selectedTopic,
    setSelectedTopic,
    filteredSurahs,
    updateLastRead,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
