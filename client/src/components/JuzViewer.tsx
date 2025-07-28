
import React, { useState, useEffect } from 'react';
import { ArrowLeft, Copy, Share, Heart } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { useApp } from '@/contexts/AppContext';

interface Juz {
  number: number;
  name: string;
  startSurah: number;
  startAyah: number;
  endSurah: number;
  endAyah: number;
  totalAyahs: number;
}

interface AyahData {
  number: number;
  arabic: string;
  surahNumber: number;
  surahName: string;
  surahEnglishName: string;
}

interface JuzViewerProps {
  juzNumber: number;
  onBack: () => void;
}

export function JuzViewer({ juzNumber, onBack }: JuzViewerProps) {
  const { surahs, preferences, updatePreferences } = useApp();
  const [juzData, setJuzData] = useState<Juz | null>(null);
  const [ayahs, setAyahs] = useState<AyahData[]>([]);
  const [translations, setTranslations] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [favoriteAyahs, setFavoriteAyahs] = useState<Set<string>>(new Set());

  const languageLabels = {
    en: 'ENGLISH - SAHIH INTERNATIONAL',
    ur: 'اردو - MAUDUDI',
    'roman-urdu': 'ROMAN URDU - MAUDUDI',
    hi: 'HINDI - MAUDUDI'
  };

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

  useEffect(() => {
    const loadJuzData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Load Juz metadata
        const juzResponse = await fetch('/data/juz.json');
        if (!juzResponse.ok) throw new Error('Failed to load Juz data');
        const juzList = await juzResponse.json();
        const currentJuz = juzList.juz.find((j: Juz) => j.number === juzNumber);
        
        if (!currentJuz) throw new Error('Juz not found');
        setJuzData(currentJuz);

        // Load Arabic text
        const arabicResponse = await fetch('/data/arabic-text.json');
        if (!arabicResponse.ok) throw new Error('Failed to load Arabic text');
        const arabicData = await arabicResponse.json();

        // Load translations
        const translationFile = preferences.language === 'en' ? 'english' : 
                              preferences.language === 'ur' ? 'urdu' :
                              preferences.language === 'roman-urdu' ? 'roman-urdu' : 'hindi';

        const translationResponse = await fetch(`/data/translations/${translationFile}.json`);
        if (!translationResponse.ok) throw new Error('Failed to load translation');
        const translationData = await translationResponse.json();

        // Extract ayahs for this Juz
        const juzAyahs: AyahData[] = [];
        const juzTranslations: { [key: string]: string } = {};

        for (let surahNum = currentJuz.startSurah; surahNum <= currentJuz.endSurah; surahNum++) {
          const surahAyahs = arabicData[surahNum.toString()];
          const surahTranslations = translationData[surahNum.toString()];
          const surah = surahs.find(s => s.number === surahNum);
          
          if (surahAyahs && surah) {
            const startAyah = surahNum === currentJuz.startSurah ? currentJuz.startAyah : 1;
            const endAyah = surahNum === currentJuz.endSurah ? currentJuz.endAyah : surahAyahs.length;

            for (let ayahNum = startAyah; ayahNum <= endAyah && ayahNum <= surahAyahs.length; ayahNum++) {
              const ayahData = surahAyahs.find((a: any) => a.number === ayahNum);
              if (ayahData) {
                juzAyahs.push({
                  ...ayahData,
                  surahNumber: surahNum,
                  surahName: surah.name,
                  surahEnglishName: surah.englishName
                });

                const translationKey = `${surahNum}:${ayahNum}`;
                if (surahTranslations && surahTranslations[ayahNum.toString()]) {
                  juzTranslations[translationKey] = surahTranslations[ayahNum.toString()];
                }
              }
            }
          }
        }

        setAyahs(juzAyahs);
        setTranslations(juzTranslations);

      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load Juz data');
      } finally {
        setLoading(false);
      }
    };

    if (juzNumber && surahs.length > 0) {
      loadJuzData();
    }
  }, [juzNumber, preferences.language, surahs]);

  const handleLanguageChange = (language: string) => {
    updatePreferences({ language: language as 'en' | 'ur' | 'roman-urdu' | 'hi' });
  };

  const handleCopyAyah = (ayah: AyahData) => {
    const translationKey = `${ayah.surahNumber}:${ayah.number}`;
    const translation = translations[translationKey];
    if (ayah && translation) {
      const text = `${ayah.arabic}\n\n${translation}\n\n- Quran ${ayah.surahNumber}:${ayah.number}`;
      navigator.clipboard.writeText(text);
    }
  };

  const handleShareAyah = (ayah: AyahData) => {
    const translationKey = `${ayah.surahNumber}:${ayah.number}`;
    const translation = translations[translationKey];
    if (ayah && translation && navigator.share) {
      navigator.share({
        title: `Quran ${ayah.surahNumber}:${ayah.number}`,
        text: `${ayah.arabic}\n\n${translation}`,
      });
    }
  };

  const toggleFavoriteAyah = (surahNumber: number, ayahNumber: number) => {
    const ayahKey = `${surahNumber}:${ayahNumber}`;
    const newFavorites = new Set(favoriteAyahs);

    if (newFavorites.has(ayahKey)) {
      newFavorites.delete(ayahKey);
    } else {
      newFavorites.add(ayahKey);
    }

    setFavoriteAyahs(newFavorites);
    localStorage.setItem('quran-favorite-ayahs', JSON.stringify(Array.from(newFavorites)));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading Para...</p>
        </div>
      </div>
    );
  }

  if (error || !juzData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400 mb-4">Error: {error || 'Para not found'}</p>
          <Button onClick={onBack} variant="outline">Go Back</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-4">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={onBack}
                className="p-2 text-gray-600 dark:text-gray-400 hover:text-emerald-600"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-xl font-bold text-emerald-700 dark:text-emerald-400">
                  Para {juzData.number}
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 font-arabic-quran" dir="rtl">
                  {juzData.name}
                </p>
              </div>
            </div>
            
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
      </header>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Juz Header */}
          <Card className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg">
            <CardContent className="p-8 text-center">
              <h2 className="text-3xl font-bold mb-2">Para {juzData.number}</h2>
              <h3 className="text-xl font-semibold text-emerald-100 mb-4 font-arabic-quran" dir="rtl">
                {juzData.name}
              </h3>
              <p className="text-emerald-200 mb-4">
                {juzData.totalAyahs} ayahs • From {ayahs[0]?.surahEnglishName} to {ayahs[ayahs.length - 1]?.surahEnglishName}
              </p>
              <div className="max-w-md mx-auto p-4 bg-white/15 backdrop-blur-sm rounded-xl border border-white/20">
                <p className="text-sm font-semibold text-white">
                  📖 {languageLabels[preferences.language]}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Ayahs */}
          <div className="space-y-8">
            {ayahs.map((ayah, index) => {
              const translationKey = `${ayah.surahNumber}:${ayah.number}`;
              const isNewSurah = index === 0 || ayahs[index - 1]?.surahNumber !== ayah.surahNumber;
              
              return (
                <div key={`${ayah.surahNumber}-${ayah.number}`}>
                  {/* Surah Header */}
                  {isNewSurah && (
                    <div className="mb-6 space-y-4">
                      <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
                        <CardContent className="p-4 text-center">
                          <h4 className="text-lg font-bold text-blue-800 dark:text-blue-200">
                            {ayah.surahEnglishName}
                          </h4>
                          <p className="text-sm text-blue-600 dark:text-blue-300 font-arabic-quran" dir="rtl">
                            {ayah.surahName}
                          </p>
                        </CardContent>
                      </Card>

                      {/* Bismillah for new Surahs (except At-Tawbah and if not starting from ayah 1) */}
                      {ayah.surahNumber !== 9 && ayah.number === 1 && (
                        <Card className="border-2 border-emerald-200 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-900/20">
                          <CardContent className="p-6">
                            <div 
                              className="font-arabic-quran text-2xl md:text-3xl text-emerald-700 dark:text-emerald-300 text-center"
                              dir="rtl"
                            >
                              بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
                            </div>
                            <p className="text-emerald-600 dark:text-emerald-400 text-sm mt-2 font-medium text-center">
                              In the name of Allah, the Most Gracious, the Most Merciful
                            </p>
                          </CardContent>
                        </Card>
                      )}
                    </div>
                  )}

                  {/* Ayah Content */}
                  <div className="pb-6">
                    <div className="space-y-6">
                      {/* Arabic Text */}
                      <div className="px-6 py-8 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800/50 dark:to-gray-700/30 rounded-xl border border-gray-200 dark:border-gray-600" dir="rtl">
                        <div className="arabic-verse text-gray-900 dark:text-white">
                          {ayah.arabic.split(' ').filter(word => word.trim()).map((word, wordIndex) => (
                            <span 
                              key={wordIndex} 
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
                          {translations[translationKey] || 'Translation not available'}
                        </p>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center justify-between text-sm">
                        <div className="text-emerald-600 dark:text-emerald-400 font-medium">
                          {ayah.surahNumber}:{ayah.number}
                        </div>
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => handleCopyAyah(ayah)}
                            className="text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleShareAyah(ayah)}
                            className="text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                          >
                            <Share className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => toggleFavoriteAyah(ayah.surahNumber, ayah.number)}
                            className={`${
                              favoriteAyahs.has(`${ayah.surahNumber}:${ayah.number}`)
                                ? 'text-red-500 hover:text-red-600'
                                : 'text-gray-400 hover:text-red-500'
                            } transition-colors`}
                          >
                            <Heart 
                              className={`w-4 h-4 ${
                                favoriteAyahs.has(`${ayah.surahNumber}:${ayah.number}`) ? 'fill-current' : ''
                              }`} 
                            />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
