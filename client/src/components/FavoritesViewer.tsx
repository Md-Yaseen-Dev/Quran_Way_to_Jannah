
import React, { useState, useEffect } from 'react';
import { ArrowLeft, Heart, Copy, Share, BookOpen } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { useApp } from '../contexts/AppContext';

interface SurahData {
  number: number;
  name: string;
  englishName: string;
  numberOfAyahs: number;
  revelationType: string;
}

interface FavoritesViewerProps {
  onBack: () => void;
  favoriteAyahs: Set<string>;
  setFavoriteAyahs: (favorites: Set<string>) => void;
}

export function FavoritesViewer({ onBack, favoriteAyahs, setFavoriteAyahs }: FavoritesViewerProps) {
  const { preferences, surahs } = useApp();
  const [translations, setTranslations] = useState<{ [key: string]: string }>({});
  const [arabicText, setArabicText] = useState<{ [key: string]: Array<{ number: number; arabic: string }> }>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [preferences.language]);

  const loadData = async () => {
    try {
      setLoading(true);

      // Load Arabic text
      const arabicResponse = await fetch('/data/arabic-text.json');
      const arabicData = await arabicResponse.json();
      setArabicText(arabicData);

      // Load translations
      const translationFile = getTranslationFile(preferences.language);
      const translationResponse = await fetch(`/data/translations/${translationFile}.json`);
      const translationData = await translationResponse.json();
      setTranslations(translationData);

    } catch (error) {
      console.error('Error loading favorites data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTranslationFile = (language: string): string => {
    switch (language) {
      case 'en': return 'english';
      case 'ur': return 'urdu';
      case 'roman-urdu': return 'roman-urdu';
      case 'hi': return 'hindi';
      default: return 'english';
    }
  };

  const getSurahName = (surahNumber: number): string => {
    const surah = surahs.find(s => s.number === surahNumber);
    return surah ? surah.englishName : `Surah ${surahNumber}`;
  };

  const getTranslation = (surahNumber: number, ayahNumber: number): string => {
    const surahTranslations = translations[surahNumber.toString()];
    if (surahTranslations && surahTranslations[ayahNumber.toString()]) {
      return surahTranslations[ayahNumber.toString()];
    }
    return "Translation not available";
  };

  const getCompleteArabicText = (surahNumber: number, ayahNumber: number): string => {
    const surahArabic = arabicText[surahNumber.toString()];
    if (surahArabic) {
      const ayah = surahArabic.find(a => a.number === ayahNumber);
      if (ayah) {
        return ayah.arabic;
      }
    }
    return "Arabic text not available";
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

  const handleCopyAyah = (surahNumber: number, ayahNumber: number) => {
    const arabicText = getCompleteArabicText(surahNumber, ayahNumber);
    const translation = getTranslation(surahNumber, ayahNumber);
    const surahName = getSurahName(surahNumber);

    const text = `${arabicText}\n\n${translation}\n\n- ${surahName} ${surahNumber}:${ayahNumber}`;

    navigator.clipboard.writeText(text).then(() => {
      console.log('Ayah copied to clipboard');
    }).catch(err => {
      console.error('Failed to copy ayah:', err);
    });
  };

  const handleShareAyah = (surahNumber: number, ayahNumber: number) => {
    const arabicText = getCompleteArabicText(surahNumber, ayahNumber);
    const translation = getTranslation(surahNumber, ayahNumber);
    const surahName = getSurahName(surahNumber);

    const shareText = `${arabicText}\n\n${translation}\n\n- ${surahName} ${surahNumber}:${ayahNumber}`;

    if (navigator.share) {
      navigator.share({
        title: `Quran ${surahNumber}:${ayahNumber}`,
        text: shareText,
      }).catch(err => {
        console.error('Error sharing:', err);
      });
    } else {
      navigator.clipboard.writeText(shareText).then(() => {
        alert('Ayah copied to clipboard (sharing not supported on this device)');
      }).catch(err => {
        console.error('Failed to copy ayah:', err);
      });
    }
  };

  const favoriteAyahsArray = Array.from(favoriteAyahs);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-gray-900 dark:to-gray-800 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">Loading favorites...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Button
                onClick={onBack}
                variant="ghost"
                size="sm"
                className="p-2 text-gray-600 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 mr-4"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <h1 className="text-xl font-bold text-emerald-700 dark:text-emerald-400 font-3d">
                Favorite Ayahs
              </h1>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-6">
        <div className="mb-8">
          <Card className="bg-gradient-to-r from-red-500 to-pink-600 text-white shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl font-bold flex items-center gap-3">
                <Heart className="w-6 h-6 fill-current" />
                My Favorite Ayahs
              </CardTitle>
              <p className="text-red-100 mt-2">
                {favoriteAyahsArray.length} verses saved
              </p>
            </CardHeader>
          </Card>
        </div>

        {favoriteAyahsArray.length === 0 ? (
          <div className="text-center py-12">
            <Heart className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
              No favorite ayahs yet
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Start adding ayahs to your favorites by clicking the heart icon next to any verse
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {favoriteAyahsArray.map(ayahKey => {
              const [surahNumber, ayahNumber] = ayahKey.split(':').map(Number);
              return (
                <Card key={ayahKey} className="border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    {/* Surah and Ayah reference */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <span className="bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200 px-3 py-1 rounded-full text-sm font-medium">
                          {getSurahName(surahNumber)} - Verse {ayahNumber}
                        </span>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-red-500 hover:text-red-600 transition-colors duration-200"
                        onClick={() => toggleFavoriteAyah(surahNumber, ayahNumber)}
                      >
                        <Heart className="w-4 h-4 fill-current" />
                      </Button>
                    </div>

                    {/* Arabic Text */}
                    <div className="mb-6 p-6 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 rounded-xl border border-gray-200 dark:border-gray-600" dir="rtl">
                      <div className="text-2xl leading-loose text-gray-900 dark:text-white font-arabic">
                        {getCompleteArabicText(surahNumber, ayahNumber)}
                        <span className="inline-flex items-center justify-center w-8 h-8 mr-4 ml-2 bg-gradient-to-br from-emerald-600 to-emerald-700 text-white rounded-full text-sm font-bold shadow-lg">
                          {ayahNumber}
                        </span>
                      </div>
                    </div>

                    {/* Translation */}
                    <div className="text-gray-700 dark:text-gray-300 leading-relaxed text-lg mb-4">
                      {getTranslation(surahNumber, ayahNumber)}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center justify-between text-sm border-t border-gray-200 dark:border-gray-600 pt-4">
                      <div className="text-emerald-600 dark:text-emerald-400 font-medium">
                        {getSurahName(surahNumber)} {surahNumber}:{ayahNumber}
                      </div>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => handleCopyAyah(surahNumber, ayahNumber)}
                          className="text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors duration-200 p-1"
                          title="Copy Ayah"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleShareAyah(surahNumber, ayahNumber)}
                          className="text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors duration-200 p-1"
                          title="Share Ayah"
                        >
                          <Share className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => toggleFavoriteAyah(surahNumber, ayahNumber)}
                          className="text-red-500 hover:text-red-600 transition-colors duration-200 p-1"
                          title="Remove from favorites"
                        >
                          <Heart className="w-4 h-4 fill-current" />
                        </button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
