import React from 'react';
import { Surah } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface SurahCardProps {
  surah: Surah;
  onClick: () => void;
}

export function SurahCard({ surah, onClick }: SurahCardProps) {
  return (
    <Card 
      className="cursor-pointer hover:shadow-md transition-shadow duration-200 border border-gray-200 dark:border-gray-700 hover:border-emerald-300 dark:hover:border-emerald-600"
      onClick={onClick}
    >
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900 rounded-full flex items-center justify-center">
              <span className="text-emerald-700 dark:text-emerald-300 font-semibold text-sm">
                {surah.number}
              </span>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">
                {surah.englishName}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {surah.numberOfAyahs} verses
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xl font-arabic text-emerald-700 dark:text-emerald-400 mb-1">
              {surah.arabicName}
            </p>
            <Badge 
              variant={surah.revelationType === 'Mecca' ? 'default' : 'secondary'}
              className={
                surah.revelationType === 'Mecca' 
                  ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200' 
                  : 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
              }
            >
              {surah.revelationType}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
