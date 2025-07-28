import React, { useState, useEffect } from 'react';
import { ArrowLeft, Heart, Share, Copy, ChevronDown, BookOpen, Menu, X } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { useApp } from '../contexts/AppContext';
import { Surah, Translation } from '../types';

interface SurahViewerProps {
  surahId: number;
  onBack: () => void;
  onNavigateToSurah: (surahId: number) => void;
  scrollToAyah?: number;
}

interface AyahData {
  number: number;
  arabic: string;
}

interface SurahData {
  [key: string]: AyahData[];
}

export function SurahViewer({ surahId, onBack, onNavigateToSurah, scrollToAyah }: SurahViewerProps) {
  const { surahs, preferences, updatePreferences, updateLastRead } = useApp();
  const [ayahs, setAyahs] = useState<AyahData[]>([]);
  const [translations, setTranslations] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Prevent body scroll when mobile sidebar is open
  useEffect(() => {
    if (isMobileSidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    // Cleanup on unmount
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileSidebarOpen]);

  const currentSurah = surahs.find(s => s.number === surahId);

  const languageLabels = {
    en: 'ENGLISH - SAHIH INTERNATIONAL',
    ur: 'اردو - MAUDUDI',
    'roman-urdu': 'ROMAN URDU - MAUDUDI',
    hi: 'HINDI - MAUDUDI'
  };

  // Load Arabic ayahs and translations
  useEffect(() => {
    const loadSurahData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Load Arabic ayahs from static JSON file
        const arabicResponse = await fetch('/data/arabic-text.json');
        if (!arabicResponse.ok) throw new Error('Failed to load Arabic text data');
        const arabicData = await arabicResponse.json();

        // Get ayahs for the current surah
        const surahAyahs = arabicData[surahId.toString()];
        if (!surahAyahs) throw new Error('Arabic text not found for this Surah');

        setAyahs(surahAyahs);

        // Load translation based on selected language
        let translationData = {};

        // Load from combined translation files for all languages
        const translationFile = preferences.language === 'en' ? 'english' : 
                              preferences.language === 'ur' ? 'urdu' :
                              preferences.language === 'roman-urdu' ? 'roman-urdu' : 'hindi';

        const translationResponse = await fetch(`/data/translations/${translationFile}.json`);
        if (!translationResponse.ok) throw new Error('Failed to load translation data');
        const allTranslations = await translationResponse.json();
        translationData = allTranslations[surahId.toString()] || {};

        setTranslations(translationData);

      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load Surah data');
      } finally {
        setLoading(false);
      }
    };

    if (surahId && currentSurah) {
      loadSurahData();
    }
  }, [surahId, preferences.language, currentSurah]);

  // Scroll to specific ayah if specified
  useEffect(() => {
    if (scrollToAyah && !loading && ayahs.length > 0) {
      const timer = setTimeout(() => {
        const ayahElement = document.getElementById(`ayah-${scrollToAyah}`);
        if (ayahElement) {
          ayahElement.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center' 
          });
          // Add a subtle highlight effect
          ayahElement.classList.add('bg-emerald-50', 'dark:bg-emerald-900/30', 'rounded-lg', 'transition-colors', 'duration-1000');
          setTimeout(() => {
            ayahElement.classList.remove('bg-emerald-50', 'dark:bg-emerald-900/30');
          }, 3000);
        }
      }, 500); // Small delay to ensure rendering is complete
      
      return () => clearTimeout(timer);
    }
  }, [scrollToAyah, loading, ayahs]);

  // Track scroll position and update lastRead
  useEffect(() => {
    if (!currentSurah || loading || ayahs.length === 0) return;

    const handleScroll = () => {
      const ayahElements = ayahs.map(ayah => document.getElementById(`ayah-${ayah.number}`));
      const scrollPosition = window.scrollY + window.innerHeight / 2;

      for (let i = ayahElements.length - 1; i >= 0; i--) {
        const element = ayahElements[i];
        if (element && element.offsetTop <= scrollPosition) {
          const ayahNumber = ayahs[i].number;
          // Only update if it's different from current lastRead
          if (!preferences.lastRead || 
              preferences.lastRead.surah !== surahId || 
              preferences.lastRead.ayah !== ayahNumber) {
            updateLastRead(surahId, ayahNumber, currentSurah.englishName);
          }
          break;
        }
      }
    };

    // Throttle scroll events
    let ticking = false;
    const throttledHandleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', throttledHandleScroll);
    return () => window.removeEventListener('scroll', throttledHandleScroll);
  }, [currentSurah, loading, ayahs, surahId, preferences.lastRead, updateLastRead]);

  const handleLanguageChange = (language: string) => {
    updatePreferences({ language: language as 'en' | 'ur' | 'roman-urdu' | 'hi' });
  };

  const handleCopyAyah = (ayahNumber: number) => {
    const ayah = ayahs.find(a => a.number === ayahNumber);
    const translation = translations[ayahNumber.toString()];
    if (ayah && translation) {
      const text = `${ayah.arabic}\n\n${translation}\n\n- Quran ${surahId}:${ayahNumber}`;
      navigator.clipboard.writeText(text);
    }
  };

  const handleShareAyah = (ayahNumber: number) => {
    const ayah = ayahs.find(a => a.number === ayahNumber);
    const translation = translations[ayahNumber.toString()];
    if (ayah && translation && navigator.share) {
      navigator.share({
        title: `Quran ${surahId}:${ayahNumber}`,
        text: `${ayah.arabic}\n\n${translation}`,
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading Surah...</p>
        </div>
      </div>
    );
  }

  if (error || !currentSurah) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400 mb-4">Error: {error || 'Surah not found'}</p>
          <Button onClick={onBack} variant="outline">Go Back</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-0 px-3 sm:px-4 lg:px-8">
          {/* Mobile Layout */}
          <div className="flex lg:hidden justify-between items-center h-16 gap-2">
            {/* Left side - Back button and title */}
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={onBack}
                className="p-2 text-gray-600 dark:text-gray-400 hover:text-emerald-600 flex-shrink-0"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>

              <div className="min-w-0 flex-1">
                <h1 className="text-base font-bold text-emerald-700 dark:text-emerald-400 truncate">
                  {currentSurah.englishName}
                </h1>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {currentSurah.numberOfAyahs} verses • {currentSurah.revelationType}
                </p>
              </div>
            </div>

            {/* Right side - Language selector and hamburger menu */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <Select value={preferences.language} onValueChange={handleLanguageChange}>
                <SelectTrigger className="w-20 sm:w-24 text-xs sm:text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="ur">اردو</SelectItem>
                  <SelectItem value="roman-urdu">Roman Urdu</SelectItem>
                  <SelectItem value="hi">हिन्दी</SelectItem>
                </SelectContent>
              </Select>

              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setIsMobileSidebarOpen(true)}
                className="p-2 text-gray-600 dark:text-gray-400 hover:text-emerald-600"
              >
                <Menu className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Desktop Layout */}
          <div className="hidden lg:flex justify-between items-center h-20 gap-4 mx-0">
            {/* Left side - Centered title and details */}
            <div className="flex-1">

              <div className='flex gap-4'>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={onBack}
                  className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-emerald-600 border-gray-300 dark:border-gray-600 hover:border-emerald-500"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
              <div className="text-center lg:text-left">

                <h1 className="text-2xl font-bold text-emerald-700 dark:text-emerald-400 mb-1">
                  {currentSurah.englishName}
                </h1>
                <div className="flex items-center justify-center lg:justify-start gap-4 text-sm text-gray-600 dark:text-gray-400">
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
                    {currentSurah.numberOfAyahs} verses
                  </span>
                  <span className="flex items-center gap-1">
                    <span className={`w-2 h-2 rounded-full ${
                      currentSurah.revelationType === 'Mecca' 
                        ? 'bg-yellow-500' 
                        : 'bg-green-500'
                    }`}></span>
                    <span className={`px-2 py-1 rounded-md text-xs font-medium ${
                      currentSurah.revelationType === 'Mecca'
                        ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200'
                        : 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                    }`}>
                      {currentSurah.revelationType}
                    </span>
                  </span>
                  <span className="flex items-center gap-1 font-arabic-quran text-lg" dir="rtl">
                    {currentSurah.arabicName}
                  </span>
                </div>
              </div>
                </div>

            </div>

            {/* Right side - Language selector and back button */}
            <div className="flex items-center gap-4 flex-shrink-0">
              <Select value={preferences.language} onValueChange={handleLanguageChange}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="ur">اردو</SelectItem>
                  <SelectItem value="roman-urdu">Roman Urdu</SelectItem>
                  <SelectItem value="hi">हिन्दी</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </header>

      {/* Desktop Sidebar */}
      <div className="hidden lg:block fixed left-0 top-0 w-80 h-screen bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 z-10">
        <div className="p-4 h-full flex flex-col">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2 pt-4">
            <BookOpen className="w-5 h-5" />
            All Surahs
          </h3>
          <div className="space-y-1 flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-emerald-500 scrollbar-track-gray-200 dark:scrollbar-track-gray-700">
                  {surahs.map((surah) => (
                    <button
                      key={surah.number}
                      onClick={() => {
                        if (surah.number !== surahId) {
                          onNavigateToSurah(surah.number);
                        }
                      }}
                      className={`w-full text-left p-2.5 rounded-lg transition-all duration-200 group ${
                        surah.number === surahId
                          ? 'bg-gradient-to-r from-emerald-100 to-emerald-50 dark:from-emerald-900 dark:to-emerald-800 text-emerald-800 dark:text-emerald-200 border-l-4 border-emerald-500'
                          : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 hover:border-l-4 hover:border-emerald-300'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                          surah.number === surahId
                            ? 'bg-emerald-600 text-white'
                            : 'bg-emerald-500 text-white group-hover:bg-emerald-600'
                        }`}>
                          {surah.number}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`font-medium text-xs truncate ${
                            surah.number === surahId ? 'text-emerald-800 dark:text-emerald-200' : ''
                          }`}>
                            {surah.englishName}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 truncate font-arabic-quran" dir="rtl">
                            {surah.name}
                          </p>
                        </div>
                        {surah.number === surahId && (
                          <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                        )}
                      </div>
                    </button>
                  ))}
          </div>
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      {isMobileSidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black bg-opacity-50"
            onClick={() => setIsMobileSidebarOpen(false)}
          ></div>

          {/* Sidebar */}
          <div className="fixed left-0 top-0 w-72 sm:w-80 h-screen bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transform transition-transform duration-300 ease-in-out">
            <div className="p-4 h-full flex flex-col">
              {/* Header with close button */}
              <div className="flex items-center justify-between mb-4 pt-4">
                <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <BookOpen className="w-5 h-5" />
                  All Surahs
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsMobileSidebarOpen(false)}
                  className="p-2 text-gray-600 dark:text-gray-400 hover:text-emerald-600"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>

              {/* Surah List */}
              <div className="space-y-1 flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-emerald-500 scrollbar-track-gray-200 dark:scrollbar-track-gray-700">
                {surahs.map((surah) => (
                  <button
                    key={surah.number}
                    onClick={() => {
                      if (surah.number !== surahId) {
                        onNavigateToSurah(surah.number);
                      }
                      setIsMobileSidebarOpen(false); // Close sidebar after navigation
                    }}
                    className={`w-full text-left p-2.5 rounded-lg transition-all duration-200 group ${
                      surah.number === surahId
                        ? 'bg-gradient-to-r from-emerald-100 to-emerald-50 dark:from-emerald-900 dark:to-emerald-800 text-emerald-800 dark:text-emerald-200 border-l-4 border-emerald-500'
                        : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 hover:border-l-4 hover:border-emerald-300'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                        surah.number === surahId
                          ? 'bg-emerald-600 text-white'
                          : 'bg-emerald-500 text-white group-hover:bg-emerald-600'
                      }`}>
                        {surah.number}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`font-medium text-xs sm:text-sm truncate ${
                          surah.number === surahId ? 'text-emerald-800 dark:text-emerald-200' : ''
                        }`}>
                          {surah.englishName}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate font-arabic-quran" dir="rtl">
                          {surah.name}
                        </p>
                      </div>
                      {surah.number === surahId && (
                        <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="lg:ml-80">
        <div className="max-w-5xl mx-auto px-3 sm:px-4 lg:px-8 py-4 lg:py-8">
          <div className="space-y-6">
            {/* Surah Header */}
            <Card className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg">
                <CardContent className="p-8 text-center">
                  <div className="mb-4">
                    <h2 className="text-4xl md:text-5xl font-bold mb-3 font-arabic-quran" dir="rtl">
                      {currentSurah.arabicName}
                    </h2>
                    <div className="w-24 h-0.5 bg-white/60 mx-auto mb-4"></div>
                  </div>
                  <h3 className="text-2xl font-bold text-emerald-100 mb-2">{currentSurah.englishName}</h3>
                  <p className="text-lg text-emerald-200 mb-4">
                    {currentSurah.numberOfAyahs} verses • {currentSurah.revelationType}
                  </p>
                  <div className="max-w-md mx-auto p-4 bg-white/15 backdrop-blur-sm rounded-xl border border-white/20">
                    <p className="text-sm font-semibold text-white">
                      📖 {languageLabels[preferences.language]}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Bismillah for Surahs (except At-Tawbah and Al-Fatiha) */}
              {surahId !== 1 && surahId !== 9 && (
                <Card className="border-2 border-emerald-200 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-900/20">
                  <CardContent className="p-8 ">
                    <div 
                      className="font-arabic-quran text-3xl md:text-4xl text-emerald-700 dark:text-emerald-300 arabic-ayah"
                      dir="rtl"
                    >
                      بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
                    </div>
                    <p className="text-emerald-600 dark:text-emerald-400 text-sm mt-2 font-medium" dir='ltr'>
                      In the name of Allah, the Most Gracious, the Most Merciful
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* Ayahs */}
              <div className="space-y-8">
                {ayahs.map((ayah) => (
                  <div key={ayah.number} id={`ayah-${ayah.number}`} className="pb-8">
                    <div className="space-y-6">

                      {/* Arabic Text */}
                      <div className="mb-8 px-6 py-8 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800/50 dark:to-gray-700/30 rounded-xl border border-gray-200 dark:border-gray-600" dir="rtl">
                        <div className="arabic-verse text-gray-900 dark:text-white">
                          {ayah.arabic.split(' ').filter(word => word.trim()).map((word, index) => (
                            <span 
                              key={index} 
                              className="arabic-word hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors duration-200 cursor-pointer"
                            >
                              {word.trim()}
                            </span>
                          ))}
                          <span className="inline-flex items-center justify-center w-8 h-8 mr-4 ml-2 bg-gradient-to-br from-emerald-600 to-emerald-700 dark:from-emerald-500 dark:to-emerald-600 text-white rounded-full text-sm font-bold shadow-lg">
                            {ayah.number}
                          </span>
                        </div>
                      </div>

                      {/* Translation */}
                      <div className="mb-6">
                        <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-lg">
                          {translations[ayah.number.toString()] || 'Translation not available'}
                        </p>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center justify-between text-sm">
                        <div className="text-emerald-600 dark:text-emerald-400 font-medium">
                          {surahId}:{ayah.number}
                        </div>
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => handleCopyAyah(ayah.number)}
                            className="text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleShareAyah(ayah.number)}
                            className="text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                          >
                            <Share className="w-4 h-4" />
                          </button>
                          <button className="text-gray-400 hover:text-red-500 transition-colors">
                            <Heart className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
          </div>
        </div>
      </div>
    </div>
  );
}