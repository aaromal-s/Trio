import React, { useState, useEffect, useRef, useCallback } from 'react';
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

import { 
  api, 
  OverviewData, 
  DatasetInfo, 
  ModelStatus, 
  DiscoveryCandidateItem 
} from './services/api';

import { 
  mockOverviewData, 
  mockDatasetInfo, 
  mockModelStatus, 
  mockDiscoveries 
} from './services/mockData';

export function App() {
  // Navigation: 'landing' | 'login' | 'overview' | 'datasets' | 'models' | 'memory' | 'discoveries' | 'evaluation'
  const [currentView, setCurrentView] = useState<string>('landing');
  const [userEmail, setUserEmail] = useState<string>('evaluator@university.edu');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true);

  // Core Data States
  const [overviewData, setOverviewData] = useState<OverviewData>(mockOverviewData);
  const [datasetInfo, setDatasetInfo] = useState<DatasetInfo>(mockDatasetInfo);
  const [modelStatus, setModelStatus] = useState<ModelStatus>(mockModelStatus);
  const [discoveries, setDiscoveries] = useState<DiscoveryCandidateItem[]>(mockDiscoveries);

  // Auto-refresh states (5s timer)
  const [autoRefresh, setAutoRefresh] = useState<boolean>(true);
  const [lastUpdated, setLastUpdated] = useState<number>(Date.now() / 1000);
  const refreshTimerRef = useRef<any>(null);

  // Modals
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isProfileOpen, setIsProfileOpen] = useState<boolean>(false);
  const [isVivaOpen, setIsVivaOpen] = useState<boolean>(false);

  // Primary Data Fetching
  const fetchAllData = useCallback(async () => {
    try {
      const [overviewRes, datasetRes, modelRes, discoveriesRes] = await Promise.all([
        api.getOverview().catch(() => null),
        api.getCurrentDataset().catch(() => null),
        api.getModelStatus().catch(() => null),
        api.getDiscoveries().catch(() => null)
      ]);

      if (overviewRes) setOverviewData(overviewRes);
      if (datasetRes) setDatasetInfo(datasetRes);
      if (modelRes) setModelStatus(modelRes);
      if (discoveriesRes && discoveriesRes.candidates) setDiscoveries(discoveriesRes.candidates);

      setLastUpdated(Date.now() / 1000);
    } catch (e) {
      console.warn("Using offline demo fallback data:", e);
    }
  }, []);

  // Initial Load
  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  // Safe 5-second auto-refresh effect with cleanup
  useEffect(() => {
    if (refreshTimerRef.current) {
      clearInterval(refreshTimerRef.current);
      refreshTimerRef.current = null;
    }

    if (autoRefresh && currentView !== 'landing' && currentView !== 'login') {
      refreshTimerRef.current = setInterval(() => {
        fetchAllData();
      }, 5000);
    }

    return () => {
      if (refreshTimerRef.current) {
        clearInterval(refreshTimerRef.current);
      }
    };
  }, [autoRefresh, currentView, fetchAllData]);

  const handleToggleAutoRefresh = () => {
    setAutoRefresh(prev => !prev);
  };

  const handleManualRefresh = () => {
    fetchAllData();
  };

  const handleResetDemo = async () => {
    try {
      await api.generateSynthetic(1500, 42);
      fetchAllData();
    } catch (e) {
      console.error(e);
    }
  };

  // Render Landing Page
  if (currentView === 'landing') {
    return (
      <>
        <LandingPage
          onEnterDemo={() => setCurrentView('overview')}
          onOpenLogin={() => setCurrentView('login')}
          onOpenViva={() => setIsVivaOpen(true)}
        />
        <VivaGuideModal isOpen={isVivaOpen} onClose={() => setIsVivaOpen(false)} />
      </>
    );
  }

  // Render Login Page
  if (currentView === 'login') {
    return (
      <>
        <LoginPage
          onLoginSuccess={(email) => {
            setUserEmail(email);
            setIsAuthenticated(true);
            setCurrentView('overview');
          }}
          onEnterGuestDemo={() => {
            setUserEmail('guest.evaluator@university.edu');
            setIsAuthenticated(true);
            setCurrentView('overview');
          }}
          onBackToLanding={() => setCurrentView('landing')}
        />
        <VivaGuideModal isOpen={isVivaOpen} onClose={() => setIsVivaOpen(false)} />
      </>
    );
  }

  // Render Main Dashboard Shell
  return (
    <div className="min-h-screen bg-trio-bg text-trio-text flex flex-col selection:bg-trio-cyan selection:text-black">
      {/* Top Navbar */}
      <Navbar
        currentView={currentView}
        onNavigate={setCurrentView}
        datasetName={datasetInfo.dataset_name}
        isSimulated={datasetInfo.is_simulated}
        modelTrained={modelStatus.is_trained}
        modelVersion={modelStatus.model_version}
        autoRefresh={autoRefresh}
        onToggleAutoRefresh={handleToggleAutoRefresh}
        lastUpdated={lastUpdated}
        onManualRefresh={handleManualRefresh}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenProfile={() => setIsProfileOpen(true)}
        onOpenViva={() => setIsVivaOpen(true)}
        onLogout={() => setCurrentView('login')}
        userEmail={userEmail}
      />

      {/* Main Container with Sidebar + Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Fixed Left Sidebar */}
        <Sidebar
          currentView={currentView}
          onNavigate={setCurrentView}
          candidateCount={discoveries.length}
        />

        {/* Content Viewport */}
        <main className="flex-1 overflow-y-auto p-6 sm:p-8 max-w-7xl mx-auto w-full">
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
      />

      <ProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        email={userEmail}
      />

      <VivaGuideModal
        isOpen={isVivaOpen}
        onClose={() => setIsVivaOpen(false)}
      />
    </div>
  );
}

export default App;
