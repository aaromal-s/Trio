import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { LandingPage } from './components/pages/LandingPage';
import { LoginPage } from './components/pages/LoginPage';
import { OverviewPage } from './components/pages/OverviewPage';
import { DatasetsPage } from './components/pages/DatasetsPage';
import { ModelLabPage } from './components/pages/ModelLabPage';
import { TriMemoryPage } from './components/pages/TriMemoryPage';
import { DiscoveriesPage } from './components/pages/DiscoveriesPage';
import { EvaluationPage } from './components/pages/EvaluationPage';
import { SettingsModal } from './components/modals/SettingsModal';
import { ProfileModal } from './components/modals/ProfileModal';
import { VivaGuideModal } from './components/modals/VivaGuideModal';
import { TelemetryProvider, useTelemetry } from './context/TelemetryContext';

import { 
  api, 
  OverviewData, 
  DatasetInfo, 
  ModelStatus, 
  DiscoveryCandidateItem,
  UserProfile
} from './services/api';

import { 
  mockOverviewData, 
  mockDatasetInfo, 
  mockModelStatus, 
  mockDiscoveries 
} from './services/mockData';

function AppContent() {
  const { 
    intervalSec, 
    isPaused, 
    isFetching, 
    lastUpdated, 
    fetchError,
    setIntervalSec, 
    setIsPaused, 
    togglePaused, 
    triggerManualRefresh, 
    setPollCallback, 
    setEnabled 
  } = useTelemetry();

  // Navigation: 'landing' | 'login' | 'overview' | 'datasets' | 'models' | 'memory' | 'discoveries' | 'evaluation'
  const [resetToken] = useState<string>(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('token') || '';
  });

  const [currentView, setCurrentView] = useState<string>(() => {
    const path = window.location.pathname;
    const params = new URLSearchParams(window.location.search);
    if (path.includes('reset-password') || params.get('token')) {
      return 'login';
    }
    if (path.includes('login')) {
      return 'login';
    }
    return 'landing';
  });

  const [userEmail, setUserEmail] = useState<string>('evaluator@university.edu');
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  // Theme Management: 'dark' | 'light'
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    return (localStorage.getItem('trio_theme') as 'dark' | 'light') || 'dark';
  });

  // Mobile drawer state
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

  // Core Data States
  const [overviewData, setOverviewData] = useState<OverviewData>(mockOverviewData);
  const [datasetInfo, setDatasetInfo] = useState<DatasetInfo>(mockDatasetInfo);
  const [modelStatus, setModelStatus] = useState<ModelStatus>(mockModelStatus);
  const [discoveries, setDiscoveries] = useState<DiscoveryCandidateItem[]>(mockDiscoveries);

  // Modals
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isProfileOpen, setIsProfileOpen] = useState<boolean>(false);
  const [isVivaOpen, setIsVivaOpen] = useState<boolean>(false);

  // Apply Theme class to document root
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'light') {
      root.classList.add('light');
    } else {
      root.classList.remove('light');
    }
    localStorage.setItem('trio_theme', theme);
  }, [theme]);

  // Primary Data Fetching
  const fetchAllData = useCallback(async () => {
    try {
      const [overviewRes, datasetRes, modelRes, discoveriesRes, profileRes] = await Promise.all([
        api.getOverview().catch(() => null),
        api.getCurrentDataset().catch(() => null),
        api.getModelStatus().catch(() => null),
        api.getDiscoveries().catch(() => null),
        api.getProfile(userEmail).catch(() => null)
      ]);

      if (overviewRes) setOverviewData(overviewRes);
      if (datasetRes) setDatasetInfo(datasetRes);
      if (modelRes) setModelStatus(modelRes);
      if (discoveriesRes && discoveriesRes.candidates) setDiscoveries(discoveriesRes.candidates);
      if (profileRes) setUserProfile(profileRes);
    } catch (e) {
      console.warn("Using offline demo fallback data:", e);
    }
  }, [userEmail]);

  // Register poll callback with central TelemetryContext
  useEffect(() => {
    setPollCallback(fetchAllData);
  }, [setPollCallback, fetchAllData]);

  // Enable/disable central polling based on active view
  useEffect(() => {
    const isDashboard = currentView !== 'landing' && currentView !== 'login';
    setEnabled(isDashboard);
  }, [currentView, setEnabled]);

  // Initial Load on mount
  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  const handleResetDemo = async () => {
    try {
      await api.generateSynthetic(1500, 42);
      await triggerManualRefresh();
    } catch (e) {
      console.error(e);
    }
  };

  // Render Landing Page
  if (currentView === 'landing') {
    return (
      <div className={theme === 'light' ? 'light' : ''}>
        <LandingPage
          onEnterDemo={() => setCurrentView('overview')}
          onOpenLogin={() => setCurrentView('login')}
          onOpenViva={() => setIsVivaOpen(true)}
        />
        <VivaGuideModal isOpen={isVivaOpen} onClose={() => setIsVivaOpen(false)} />
      </div>
    );
  }

  // Render Login Page
  if (currentView === 'login') {
    return (
      <div className={theme === 'light' ? 'light' : ''}>
        <LoginPage
          initialResetToken={resetToken}
          onLoginSuccess={(identifier) => {
            setUserEmail(identifier);
            setCurrentView('overview');
          }}
          onEnterGuestDemo={() => {
            setUserEmail('guest');
            setCurrentView('overview');
          }}
          onBackToLanding={() => setCurrentView('landing')}
        />
        <VivaGuideModal isOpen={isVivaOpen} onClose={() => setIsVivaOpen(false)} />
      </div>
    );
  }

  // Render Main Dashboard Shell
  return (
    <div className={`min-h-screen bg-trio-bg text-trio-text flex flex-col selection:bg-trio-cyan selection:text-black ${theme === 'light' ? 'light' : ''}`}>
      {/* Top Navbar with Centralized Telemetry Status */}
      <Navbar
        currentView={currentView}
        onNavigate={setCurrentView}
        datasetName={datasetInfo.dataset_name}
        isSimulated={datasetInfo.is_simulated}
        modelTrained={modelStatus.is_trained}
        modelVersion={modelStatus.model_version}
        autoRefresh={!isPaused}
        onToggleAutoRefresh={togglePaused}
        lastUpdated={lastUpdated}
        onManualRefresh={triggerManualRefresh}
        refreshInterval={intervalSec}
        isFetching={isFetching}
        fetchError={fetchError}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenProfile={() => setIsProfileOpen(true)}
        onOpenViva={() => setIsVivaOpen(true)}
        onLogout={() => setCurrentView('login')}
        userEmail={userProfile?.email || userEmail}
        currentTheme={theme}
        onToggleTheme={() => setTheme(prev => prev === 'dark' ? 'light' : 'dark')}
        onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        isMobileMenuOpen={isMobileMenuOpen}
      />

      {/* Main Container with Sidebar + Content */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Responsive Left Sidebar */}
        <Sidebar
          currentView={currentView}
          onNavigate={setCurrentView}
          candidateCount={discoveries.length}
          isOpenMobile={isMobileMenuOpen}
          onCloseMobile={() => setIsMobileMenuOpen(false)}
        />

        {/* Content Viewport */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          {currentView === 'overview' && (
            <OverviewPage
              data={overviewData}
              onNavigate={setCurrentView}
            />
          )}

          {currentView === 'datasets' && (
            <DatasetsPage
              datasetInfo={datasetInfo}
              onRefreshDataset={fetchAllData}
              onSelectFeatures={(features) => {
                setModelStatus(prev => ({ ...prev, selected_features: features }));
              }}
            />
          )}

          {currentView === 'models' && (
            <ModelLabPage
              modelStatus={modelStatus}
              onTrainingComplete={fetchAllData}
              availableFeatures={datasetInfo.validation.numeric_columns}
            />
          )}

          {currentView === 'memory' && (
            <TriMemoryPage />
          )}

          {currentView === 'discoveries' && (
            <DiscoveriesPage
              candidates={discoveries}
              onRefresh={fetchAllData}
            />
          )}

          {currentView === 'evaluation' && (
            <EvaluationPage
              datasetName={datasetInfo.dataset_name}
              isSimulated={datasetInfo.is_simulated}
            />
          )}
        </main>
      </div>

      {/* Modals */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onResetDemo={handleResetDemo}
        currentTheme={theme}
        onThemeChange={(newTheme) => setTheme(newTheme)}
        refreshInterval={intervalSec}
        onRefreshIntervalChange={(sec) => {
          if (sec === 0) {
            setIsPaused(true);
          } else {
            setIntervalSec(sec);
            setIsPaused(false);
          }
        }}
        isPollingPaused={isPaused}
        onTogglePollingPaused={setIsPaused}
      />

      <ProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        email={userEmail}
        onProfileUpdated={(updated) => {
          setUserProfile(updated);
          setUserEmail(updated.email);
        }}
      />

      <VivaGuideModal
        isOpen={isVivaOpen}
        onClose={() => setIsVivaOpen(false)}
      />
    </div>
  );
}

export function App() {
  return (
    <TelemetryProvider>
      <AppContent />
    </TelemetryProvider>
  );
}

export default App;
