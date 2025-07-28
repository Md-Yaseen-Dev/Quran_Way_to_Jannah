import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

interface WelcomeProps {
  onGetStarted: () => void;
}

export function Welcome({ onGetStarted }: WelcomeProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-gray-800 dark:to-gray-900 p-4">
      <div className="text-center max-w-md mx-auto">
        {/* Quran Image */}
        <div className="w-48 h-36 mx-auto mb-8 rounded-2xl shadow-2xl overflow-hidden bg-gradient-to-br from-emerald-100 to-emerald-200 dark:from-emerald-800 dark:to-emerald-900 flex items-center justify-center">
          <div className="text-center">
            <div className="text-4xl text-emerald-600 dark:text-emerald-400 mb-2">📖</div>
            <div className="text-sm text-emerald-700 dark:text-emerald-300 font-arabic">القرآن الكريم</div>
          </div>
        </div>
        
        <h1 className="text-5xl font-bold text-emerald-700 dark:text-emerald-400 mb-3  tracking-tight">
          Way to Jannah
        </h1>
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-2">
          Quran App
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-8 leading-relaxed px-4">
          Learn Quran and recite once everyday to find your way to eternal peace
        </p>
        
        <Button 
          onClick={onGetStarted}
          className="bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-4 px-8 rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center mx-auto gap-2"
        >
          <ArrowRight className="w-5 h-5" />
          Get Started
        </Button>
      </div>
    </div>
  );
}
