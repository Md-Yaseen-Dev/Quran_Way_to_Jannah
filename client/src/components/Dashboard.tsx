import React, { useState, useEffect } from 'react';
import { useApp } from '@/contexts/AppContext';
import { SurahCard } from './SurahCard';
import { JuzCard } from './JuzCard';
import { TabNavigation } from './TabNavigation';
import { TabType } from '@/types';
import { Settings, Church, BookOpen, Heart } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { TopicsViewer } from './TopicsViewer';
import { FavoritesViewer } from './FavoritesViewer';

interface Juz {
  number: number;
  name: string;
  startSurah: number;
  startAyah: number;
  endSurah: number;
  endAyah: number;
  totalAyahs: number;
}

interface DashboardProps {
  onNavigate: (page: 'prayer-times' | 'settings' | { type: 'surah-viewer'; surahId: number; scrollToAyah?: number } | { type: 'juz-viewer'; juzNumber: number }) => void;
}

export function Dashboard({ onNavigate }: DashboardProps) {
  const { 
    preferences, 
    updatePreferences, 
    filteredSurahs, 
    loading, 
    error, 
    topics, 
    selectedTopic, 
    setSelectedTopic,
    updateLastRead 
  } = useApp();

  const [juzList, setJuzList] = useState<Juz[]>([]);
  const [juzLoading, setJuzLoading] = useState(false);
  const [juzError, setJuzError] = useState<string | null>(null);

  console.log(filteredSurahs);

  const [activeTab, setActiveTab] = useState<TabType>('surah');
  const [currentView, setCurrentView] = useState<'dashboard' | 'surah' | 'juz' | 'topics' | 'settings' | 'favorites'>('dashboard');
  const [favoriteAyahs, setFavoriteAyahs] = useState<Set<string>>(new Set());

  // Load favorite ayahs from localStorage
  useEffect(() => {
    const savedFavorites = localStorage.getItem('quran-favorite-ayahs');
    if (savedFavorites) {
      try {
        const favorites = JSON.parse(savedFavorites);
        setFavoriteAyahs(new Set(favorites));
      } catch (error) {
        console.error('Error loading favorite ayahs:', error);
      }
    }
  }, []);

  // Load Juz data
  useEffect(() => {
    const loadJuzData = async () => {
      try {
        setJuzLoading(true);
        setJuzError(null);
        const response = await fetch('/data/juz.json');
        if (!response.ok) throw new Error('Failed to load Juz data');
        const data = await response.json();
        setJuzList(data.juz);
      } catch (err) {
        setJuzError(err instanceof Error ? err.message : 'Failed to load Juz data');
      } finally {
        setJuzLoading(false);
      }
    };

    loadJuzData();
  }, []);

  const handleSurahClick = (surah: any) => {
    // Let SurahViewer handle updating lastRead based on actual scroll position
    onNavigate({ type: 'surah-viewer', surahId: surah.number });
  };

  const handleJuzClick = (juz: Juz) => {
    onNavigate({ type: 'juz-viewer', juzNumber: juz.number });
  };

  const handleLanguageChange = (language: string) => {
    updatePreferences({ language: language as 'en' | 'ur' | 'roman-urdu' | 'hi' });
  };

  const handleTopicChange = (topic: string) => {
    setSelectedTopic(topic === 'all' ? null : topic);
  };

  const handleTopicsView = () => {
    setCurrentView('topics');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading Quran data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400 mb-4">Error: {error}</p>
          <p className="text-gray-600 dark:text-gray-400">Please check your internet connection and try again.</p>
        </div>
      </div>
    );
  }

  if (currentView === 'settings') {
    return <Settings />;
  }

  if (currentView === 'topics') {
    return <TopicsViewer onBack={() => setCurrentView('dashboard')} />;
  }

  if (currentView === 'favorites') {
    return (
      <FavoritesViewer 
        onBack={() => setCurrentView('dashboard')}
        favoriteAyahs={favoriteAyahs}
        setFavoriteAyahs={setFavoriteAyahs}
      />
    );
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-emerald-700 dark:text-emerald-400 font-3d">
                Way to Jannah
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setCurrentView('favorites')}
                className="p-2 text-gray-600 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 relative"
              >
                <Heart className="w-5 h-5" />
                {favoriteAyahs.size > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {favoriteAyahs.size}
                  </span>
                )}
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => onNavigate('settings')}
                className="p-2 text-gray-600 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400"
              >
                <Settings className="w-5 h-5" />
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => onNavigate('prayer-times')}
                className="p-2 text-gray-600 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400"
              >
                <Church className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Greeting */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
            Assalamualaikum <span className="text-emerald-600 dark:text-emerald-400">Brother/Sister</span>
          </h2>
          <p className="text-gray-600 dark:text-gray-400">May Allah bless your day with peace and guidance</p>
        </div>

        {/* Last Read Card */}
        {preferences.lastRead && (
          <Card 
            className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white mb-8 shadow-lg cursor-pointer hover:from-emerald-600 hover:to-emerald-700 transition-all duration-200 transform hover:scale-[1.02]"
            onClick={() => onNavigate({ type: 'surah-viewer', surahId: preferences.lastRead!.surah, scrollToAyah: preferences.lastRead!.ayah })}
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Continue Reading</h3>
                  <p className="text-emerald-100 mb-1">Chapter {preferences.lastRead.surah}: {preferences.lastRead.surahName}</p>
                  <p className="text-sm text-emerald-200">Ayah {preferences.lastRead.ayah}</p>
                </div>
                <div className="bg-white/20 rounded-full p-4">
                  <BookOpen className="w-6 h-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Filters */}
        
        {/* <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
        
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Translation
            </label>
            <Select value={preferences.language} onValueChange={handleLanguageChange}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select translation language" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="ur">اردو</SelectItem>
                <SelectItem value="roman-urdu">Roman Urdu</SelectItem>
                <SelectItem value="hi">Hindi</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Filter by Topic
            </label>
            <Select value={selectedTopic || 'all'} onValueChange={handleTopicChange}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select topic" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Topics</SelectItem>
                {topics.map((topic) => (
                  <SelectItem key={topic.id} value={topic.id}>
                    {topic.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
 */}
        {/* Tab Navigation */}
        <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />

        {/* Content based on active tab */}
        {activeTab === 'surah' && (
          <>
            {selectedTopic && (
              <div className="mb-6 p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg border border-emerald-200 dark:border-emerald-800">
                <h3 className="font-semibold text-emerald-800 dark:text-emerald-200 mb-2">
                  {topics.find(t => t.id === selectedTopic)?.name}
                </h3>
                <p className="text-sm text-emerald-700 dark:text-emerald-300">
                  {topics.find(t => t.id === selectedTopic)?.description}
                </p>
              </div>
            )}

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredSurahs.map((surah) => (
                <SurahCard 
                  key={surah.number} 
                  surah={surah} 
                  onClick={() => handleSurahClick(surah)}
                />
              ))}
            </div>
          </>
        )}

        {activeTab === 'para' && (
          <>
            {juzLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto mb-4"></div>
                  <p className="text-gray-600 dark:text-gray-400">Loading Paras...</p>
                </div>
              </div>
            ) : juzError ? (
              <div className="text-center py-12">
                <p className="text-red-600 dark:text-red-400 mb-4">Error: {juzError}</p>
                <p className="text-gray-600 dark:text-gray-400">Please check your internet connection and try again.</p>
              </div>
            ) : (
              <>
                <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">
                    Quran Paras (Juz)
                  </h3>
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    The Quran is divided into 30 sections called Paras or Juz, each containing multiple Surahs or parts of Surahs.
                  </p>
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {juzList.map((juz) => (
                    <JuzCard 
                      key={juz.number} 
                      juz={juz} 
                      onClick={() => handleJuzClick(juz)}
                    />
                  ))}
                </div>
              </>
            )}
          </>
        )}

        {activeTab === 'topics' && (
          <TopicsViewer onBack={() => setCurrentView('dashboard')} />
        )}


        {activeTab !== 'surah' && activeTab !== 'para' && activeTab !== 'topics' && (
          <div className="text-center py-12">
            <div className="text-gray-400 dark:text-gray-600 mb-4">
              <BookOpen className="w-16 h-16 mx-auto mb-4" />
            </div>
            <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-400 mb-2">
              {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} View
            </h3>
            <p className="text-gray-500 dark:text-gray-500">
              This feature will be available in a future update.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}