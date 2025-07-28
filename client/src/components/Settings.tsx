import React from 'react';
import { ArrowLeft, Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useApp } from '@/contexts/AppContext';

interface SettingsProps {
  onBack: () => void;
}

export function Settings({ onBack }: SettingsProps) {
  const { preferences, updatePreferences } = useApp();

  const handleLanguageChange = (language: string) => {
    updatePreferences({ language: language as 'en' | 'ur' | 'roman-urdu' | 'hi' });
  };

  const handleTextSizeChange = (size: string) => {
    updatePreferences({ arabicTextSize: size as 'small' | 'medium' | 'large' | 'xl' });
  };

  const handleCalculationMethodChange = (method: string) => {
    updatePreferences({ calculationMethod: method });
  };

  const toggleTheme = () => {
    updatePreferences({ theme: preferences.theme === 'light' ? 'dark' : 'light' });
  };

  const toggleNotifications = () => {
    updatePreferences({ prayerNotifications: !preferences.prayerNotifications });
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
              <h1 className="text-xl font-bold text-gray-900 dark:text-emerald-400">
                Settings
              </h1>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Theme Settings */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Appearance
              </h3>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {preferences.theme === 'dark' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Dark Mode</p>
                    <p className="text-sm text-gray-700 dark:text-gray-400">
                      Toggle between light and dark theme
                    </p>
                  </div>
                </div>
                <Switch
                  checked={preferences.theme === 'dark'}
                  onCheckedChange={toggleTheme}
                />
              </div>
            </CardContent>
          </Card>

          {/* Language Settings */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Language & Translation
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Primary Translation Language
                  </label>
                  <Select value={preferences.language} onValueChange={handleLanguageChange}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
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
                    Arabic Text Size
                  </label>
                  <Select value={preferences.arabicTextSize} onValueChange={handleTextSizeChange}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="small">Small</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="large">Large</SelectItem>
                      <SelectItem value="xl">Extra Large</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Prayer Settings */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Prayer Settings
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Prayer Notifications</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Get notified for prayer times
                    </p>
                  </div>
                  <Switch
                    checked={preferences.prayerNotifications}
                    onCheckedChange={toggleNotifications}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Calculation Method
                  </label>
                  <Select value={preferences.calculationMethod} onValueChange={handleCalculationMethodChange}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">University of Islamic Sciences, Karachi</SelectItem>
                      <SelectItem value="2">Islamic Society of North America</SelectItem>
                      <SelectItem value="3">Muslim World League</SelectItem>
                      <SelectItem value="4">Umm Al-Qura University, Makkah</SelectItem>
                      <SelectItem value="5">Egyptian General Authority of Survey</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* About */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                About
              </h3>
              
              <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex justify-between">
                  <span>Version</span>
                  <span>1.0.0</span>
                </div>
                <div className="flex justify-between">
                  <span>Data Source</span>
                  <span>Quran API</span>
                </div>
                <div className="flex justify-between">
                  <span>Prayer Times</span>
                  <span>AlAdhan API</span>
                </div>
                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-center text-emerald-600 dark:text-emerald-400 font-arabic">
                    جَزَاكَ اللَّهُ خَيْرًا
                  </p>
                  <p className="text-center text-xs mt-1">
                    May Allah reward you with goodness
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
