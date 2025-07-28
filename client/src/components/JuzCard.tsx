
import React from 'react';
import { Card, CardContent } from './ui/card';
import { BookOpen } from 'lucide-react';
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

interface JuzCardProps {
  juz: Juz;
  onClick: () => void;
}

export function JuzCard({ juz, onClick }: JuzCardProps) {
  const { surahs } = useApp();
  
  const startSurah = surahs.find(s => s.number === juz.startSurah);
  const endSurah = surahs.find(s => s.number === juz.endSurah);

  return (
    <Card 
      className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-[1.02] border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
      onClick={onClick}
    >
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center text-white font-bold text-lg shadow-lg">
              {juz.number}
            </div>
            <div>
              <h3 className="font-bold text-lg text-gray-900 dark:text-white">
                Para {juz.number}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 font-arabic-quran" dir="rtl">
                {juz.name}
              </p>
            </div>
          </div>
          <BookOpen className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">Total Ayahs</span>
            <span className="font-medium text-gray-900 dark:text-white">{juz.totalAyahs}</span>
          </div>
          
          <div className="pt-2 border-t border-gray-100 dark:border-gray-700">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              From {startSurah?.englishName} {juz.startAyah} to {endSurah?.englishName} {juz.endAyah}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
