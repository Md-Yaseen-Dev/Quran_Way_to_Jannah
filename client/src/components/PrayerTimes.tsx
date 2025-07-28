import React from 'react';
import { ArrowLeft, Compass } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useGeolocation } from '@/hooks/useGeolocation';
import { usePrayerTimes } from '@/hooks/usePrayerTimes';
import { useApp } from '@/contexts/AppContext';

interface PrayerTimesProps {
  onBack: () => void;
}

export function PrayerTimes({ onBack }: PrayerTimesProps) {
  const { preferences } = useApp();
  const { latitude, longitude, error: geoError, loading: geoLoading } = useGeolocation();
  const { data: prayerData, isLoading: prayerLoading, error: prayerError } = usePrayerTimes(
    latitude, 
    longitude, 
    preferences.calculationMethod
  );

  const isLoading = geoLoading || prayerLoading;
  const error = geoError || (prayerError instanceof Error ? prayerError.message : null);

  const getCurrentPrayerStatus = (time: string) => {
    const now = new Date();
    const prayerTime = new Date();
    const [hours, minutes] = time.split(':');
    prayerTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
    
    const diffMs = prayerTime.getTime() - now.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    if (diffMs < 0) {
      return 'passed';
    } else if (diffHours === 0 && diffMinutes < 30) {
      return 'next';
    }
    return 'upcoming';
  };

  const formatTimeRemaining = (time: string) => {
    const now = new Date();
    const prayerTime = new Date();
    const [hours, minutes] = time.split(':');
    prayerTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
    
    const diffMs = prayerTime.getTime() - now.getTime();
    
    if (diffMs < 0) {
      const pastMs = Math.abs(diffMs);
      const pastHours = Math.floor(pastMs / (1000 * 60 * 60));
      return `${pastHours} hours ago`;
    }
    
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    if (diffHours === 0) {
      return `in ${diffMinutes} min`;
    }
    return `in ${diffHours}h ${diffMinutes}m`;
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={onBack}
                className="p-2 text-gray-600 dark:text-gray-400 hover:text-emerald-600"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <h1 className="text-xl font-bold text-emerald-700 dark:text-emerald-400">
                Prayer Times
              </h1>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isLoading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">
              {geoLoading ? 'Getting your location...' : 'Fetching prayer times...'}
            </p>
          </div>
        )}

        {error && (
          <div className="text-center py-12">
            <div className="text-red-500 mb-4">
              <p className="font-semibold mb-2">Unable to get prayer times</p>
              <p className="text-sm">{error}</p>
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Please enable location access and try again.
            </p>
          </div>
        )}

        {prayerData && !isLoading && !error && (
          <>
            {/* Date and Location */}
            <div className="mb-8 text-center">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
                Prayer Times for Today
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-1">
                {prayerData.date}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-500">
                {prayerData.hijriDate} (Hijri)
              </p>
            </div>

            {/* Prayer Times Cards */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-8">
              {prayerData.prayerTimes.map((prayer) => {
                const status = getCurrentPrayerStatus(prayer.time);
                const isNext = status === 'next';
                
                return (
                  <Card 
                    key={prayer.name}
                    className={
                      isNext 
                        ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg' 
                        : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700'
                    }
                  >
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className={`font-semibold text-lg ${isNext ? 'text-white' : 'text-gray-900 dark:text-white'}`}>
                            {prayer.name}
                          </h3>
                          <p className={`text-sm ${isNext ? 'text-emerald-100' : 'text-gray-600 dark:text-gray-400'}`}>
                            {prayer.description}
                          </p>
                          <p className={`text-sm font-arabic ${isNext ? 'text-emerald-100' : 'text-emerald-600 dark:text-emerald-400'}`}>
                            {prayer.arabicName}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className={`text-2xl font-bold ${isNext ? 'text-white' : 'text-emerald-600 dark:text-emerald-400'}`}>
                            {prayer.time}
                          </p>
                          <p className={`text-xs ${isNext ? 'text-emerald-200' : 'text-gray-500 dark:text-gray-400'}`}>
                            {isNext ? 'Next prayer' : formatTimeRemaining(prayer.time)}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Qibla Direction */}
            <Card className="text-center">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Qibla Direction
                </h3>
                <div className="w-32 h-32 mx-auto bg-emerald-100 dark:bg-emerald-900 rounded-full flex items-center justify-center mb-4">
                  <Compass className="w-12 h-12 text-emerald-600 dark:text-emerald-400" style={{ transform: 'rotate(45deg)' }} />
                </div>
                <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mb-2">
                  Calculating...
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Qibla direction will be calculated based on your location
                </p>
              </CardContent>
            </Card>
          </>
        )}
      </main>
    </div>
  );
}
