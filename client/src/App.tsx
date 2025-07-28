import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "../src/components/ui/toaster";
import { TooltipProvider } from "../src/components/ui/tooltip";
import { AppProvider } from "../src/contexts/AppContext";
import { Welcome } from "../src/components/Welcome";
import { Dashboard } from "../src/components/Dashboard";
import { PrayerTimes } from "../src/components/PrayerTimes";
import { Settings } from "../src/components/Settings";
import { SurahViewer } from "../src/components/SurahViewer";
import { JuzViewer } from "../src/components/JuzViewer";
import NotFound from "../src/pages/not-found"
import { useState } from "react";
import React from "react";

type Page = 'welcome' | 'dashboard' | 'prayer-times' | 'settings' | { type: 'surah-viewer'; surahId: number; scrollToAyah?: number } | { type: 'juz-viewer'; juzNumber: number };

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('welcome');

  const handleGetStarted = () => {
    setCurrentPage('dashboard');
  };

  const handleNavigate = (page: 'prayer-times' | 'settings' | { type: 'surah-viewer'; surahId: number; scrollToAyah?: number } | { type: 'juz-viewer'; juzNumber: number }) => {
    setCurrentPage(page);
  };

  const handleBack = () => {
    setCurrentPage('dashboard');
  };

  const renderCurrentPage = () => {
    if (typeof currentPage === 'string') {
      switch (currentPage) {
        case 'welcome':
          return <Welcome onGetStarted={handleGetStarted} />;
        case 'dashboard':
          return <Dashboard onNavigate={handleNavigate} />;
        case 'prayer-times':
          return <PrayerTimes onBack={handleBack} />;
        case 'settings':
          return <Settings onBack={handleBack} />;
        default:
          return <Welcome onGetStarted={handleGetStarted} />;
      }
    } else if (currentPage?.type === 'surah-viewer') {
      return (
        <SurahViewer 
          surahId={currentPage.surahId} 
          onBack={handleBack}
          onNavigateToSurah={(surahId) => setCurrentPage({ type: 'surah-viewer', surahId })}
          scrollToAyah={currentPage.scrollToAyah}
        />
      );
    } else if (currentPage?.type === 'juz-viewer') {
      return (
        <JuzViewer 
          juzNumber={currentPage.juzNumber} 
          onBack={handleBack}
        />
      );
    }
    return <Welcome onGetStarted={handleGetStarted} />;
  };

  return (
    <QueryClientProvider client={queryClient}>
      <AppProvider>
        <TooltipProvider>
          <Toaster />
          {renderCurrentPage()}
        </TooltipProvider>
      </AppProvider>
    </QueryClientProvider>
  );
}

export default App;
