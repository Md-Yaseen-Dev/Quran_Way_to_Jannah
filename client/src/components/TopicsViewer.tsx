
import React, { useState, useEffect } from 'react';
import { ArrowLeft, Search, BookOpen, Heart } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { useApp } from '../contexts/AppContext';

interface Topic {
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

interface TopicsData {
  topics: Topic[];
}

interface TopicsViewerProps {
  onBack: () => void;
}

interface SurahData {
  number: number;
  name: string;
  englishName: string;
  numberOfAyahs: number;
  revelationType: string;
}

export function TopicsViewer({ onBack }: TopicsViewerProps) {
  const { preferences } = useApp();
  const [topics, setTopics] = useState<Topic[]>([]);
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [translations, setTranslations] = useState<{ [key: string]: string }>({});
  const [surahs, setSurahs] = useState<SurahData[]>([]);
  const [translationFilter, setTranslationFilter] = useState<string>('all');

  useEffect(() => {
    loadData();
  }, [preferences.language, translationFilter]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load topics
      const topicsResponse = await fetch('/data/topics.json');
      const topicsData: TopicsData = await topicsResponse.json();
      setTopics(topicsData.topics);

      // Load surahs data
      const surahResponse = await fetch('/data/quran.json');
      const surahData = await surahResponse.json();
      setSurahs(surahData.surahs);

      // Load translations based on language preference and translation filter
      let translationFile = getTranslationFile(preferences.language);
      if (translationFilter !== 'all' && translationFilter !== preferences.language) {
        translationFile = getTranslationFile(translationFilter);
      }
      const translationResponse = await fetch(`/data/translations/${translationFile}.json`);
      const translationData = await translationResponse.json();
      setTranslations(translationData);

    } catch (error) {
      console.error('Error loading topics data:', error);
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
      case 'te': return 'telugu';
      default: return 'english';
    }
  };

  const availableTranslations = [
    { code: 'all', name: 'All Languages' },
    { code: 'en', name: 'English' },
    { code: 'ur', name: 'Urdu' },
    { code: 'roman-urdu', name: 'Roman Urdu' },
    { code: 'hi', name: 'Hindi' },
    { code: 'te', name: 'Telugu' }
  ];

  const getSurahName = (surahNumber: number): string => {
    const surah = surahs.find(s => s.number === surahNumber);
    return surah ? surah.englishName : `Surah ${surahNumber}`;
  };

  const getTranslation = (surahNumber: number, ayahNumber: number): string => {
    const key = `${surahNumber}:${ayahNumber}`;
    const surahTranslations = translations[surahNumber.toString()];
    if (surahTranslations && surahTranslations[ayahNumber.toString()]) {
      return surahTranslations[ayahNumber.toString()];
    }
    return "Translation not available";
  };

  const filteredTopics = topics.filter(topic => {
    const matchesSearch = topic.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         topic.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         topic.ayahs.some(ayah => 
                           ayah.text.includes(searchTerm) || 
                           ayah.translation.toLowerCase().includes(searchTerm.toLowerCase())
                         );
    
    if (translationFilter === 'all') {
      return matchesSearch;
    }
    
    // Check if ayahs have translations available for the selected language
    return matchesSearch && topic.ayahs.some(ayah => {
      const surahTranslations = translations[ayah.surah.toString()];
      return surahTranslations && surahTranslations[ayah.ayah.toString()];
    });
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-gray-900 dark:to-gray-800 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">Loading topics...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (selectedTopic) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-gray-900 dark:to-gray-800 p-6">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <Button
              onClick={() => setSelectedTopic(null)}
              variant="ghost"
              size="sm"
              className="text-emerald-600 hover:text-emerald-700 dark:text-emerald-400"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Topics
            </Button>
          </div>

          {/* Topic Header */}
          <Card className="mb-8 border-emerald-200 dark:border-emerald-800">
            <CardHeader className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-t-lg">
              <CardTitle className="text-2xl font-bold flex items-center gap-3">
                <BookOpen className="w-6 h-6" />
                {selectedTopic.name}
              </CardTitle>
              <p className="text-emerald-50 mt-2">{selectedTopic.description}</p>
              <p className="text-emerald-100 text-sm mt-2">
                {selectedTopic.ayahs.length} verses
              </p>
            </CardHeader>
          </Card>

          {/* Ayahs */}
          <div className="space-y-6">
            {selectedTopic.ayahs.map((ayah, index) => (
              <Card key={`${ayah.surah}-${ayah.ayah}`} className="border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  {/* Surah and Ayah reference */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <span className="bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200 px-3 py-1 rounded-full text-sm font-medium">
                        {getSurahName(ayah.surah)} - Verse {ayah.ayah}
                      </span>
                    </div>
                    <Button variant="ghost" size="sm" className="text-gray-500 hover:text-red-500">
                      <Heart className="w-4 h-4" />
                    </Button>
                  </div>

                  {/* Arabic Text */}
                  <div className="mb-6 p-6 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 rounded-xl border border-gray-200 dark:border-gray-600" dir="rtl">
                    <div className="text-2xl leading-loose text-gray-900 dark:text-white font-arabic">
                      {ayah.text}
                      <span className="inline-flex items-center justify-center w-8 h-8 mr-4 ml-2 bg-gradient-to-br from-emerald-600 to-emerald-700 text-white rounded-full text-sm font-bold shadow-lg">
                        {ayah.ayah}
                      </span>
                    </div>
                  </div>

                  {/* Translation */}
                  <div className="text-gray-700 dark:text-gray-300 leading-relaxed text-lg">
                    {getTranslation(ayah.surah, ayah.ayah)}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-gray-900 dark:to-gray-800 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}

        {/* Title and Search */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Quranic Topics
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-2xl mx-auto">
            Explore verses from the Holy Quran organized by important Islamic themes and topics
          </p>
          <div className="mb-6 p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg max-w-2xl mx-auto">
            <div className="flex justify-center items-center gap-6 text-sm">
              <div className="text-center">
                <div className="font-bold text-emerald-700 dark:text-emerald-300">{topics.length}</div>
                <div className="text-emerald-600 dark:text-emerald-400">Topics</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-emerald-700 dark:text-emerald-300">
                  {topics.reduce((total, topic) => total + topic.ayahs.length, 0)}
                </div>
                <div className="text-emerald-600 dark:text-emerald-400">Verses Covered</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-emerald-700 dark:text-emerald-300">{filteredTopics.length}</div>
                <div className="text-emerald-600 dark:text-emerald-400">Showing</div>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 max-w-2xl mx-auto">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                type="text"
                placeholder="Search topics..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600"
              />
            </div>
            <select
              value={translationFilter}
              onChange={(e) => setTranslationFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            >
              {availableTranslations.map(trans => (
                <option key={trans.code} value={trans.code}>
                  {trans.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Topics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTopics.map((topic) => (
            <Card
              key={topic.id}
              className="group hover:shadow-xl transition-all duration-300 cursor-pointer border-gray-200 dark:border-gray-700 hover:border-emerald-300 dark:hover:border-emerald-600"
              onClick={() => setSelectedTopic(topic)}
            >
              <CardHeader className="pb-3">
                <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-emerald-600" />
                  {topic.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed mb-4">
                  {topic.description}
                </p>
                <div className="flex items-center justify-between">
                  <span className="bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200 px-3 py-1 rounded-full text-xs font-medium">
                    {topic.ayahs.length} verses
                  </span>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 p-2"
                  >
                    Explore →
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredTopics.length === 0 && (
          <div className="text-center py-12">
            <BookOpen className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
              No topics found
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Try adjusting your search terms
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
