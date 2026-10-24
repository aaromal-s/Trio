import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LiveDataProvider } from './context/LiveDataContext';
import { Header } from './components/common/Header';
import { LandingPage } from './components/landing/LandingPage';
import { DashboardShell } from './components/dashboard/DashboardShell';
import { AuthModal } from './components/auth/AuthModal';

export const AppContent: React.FC = () => {
  const [currentView, setCurrentView] = useState<'landing' | 'dashboard'>('landing');
  const [authModalOpen, setAuthModalOpen] = useState<boolean>(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');
  const [isDemoMode, setIsDemoMode] = useState<boolean>(false);

  const { user } = useAuth();

  const handleOpenAuth = (mode: 'login' | 'register') => {
    setAuthModalMode(mode);
    setAuthModalOpen(true);
  };

  const handleExploreDemo = () => {
    setIsDemoMode(true);
    setCurrentView('dashboard');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-midnight-950 text-slate-100 flex flex-col font-sans">
      <Header
        currentView={currentView}
        setCurrentView={setCurrentView}
        openAuthModal={handleOpenAuth}
        onExploreDemo={handleExploreDemo}
      />

      <main className="flex-1">
        {currentView === 'landing' ? (
          <LandingPage
            onLaunchConsole={() => setCurrentView('dashboard')}
            onExploreDemo={handleExploreDemo}
            openAuthModal={handleOpenAuth}
          />
        ) : (
          <DashboardShell
            isDemoMode={isDemoMode || !user}
            openAuthModal={handleOpenAuth}
            onReturnToLanding={() => setCurrentView('landing')}
          />
        )}
      </main>

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialMode={authModalMode}
      />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <LiveDataProvider>
        <AppContent />
      </LiveDataProvider>
    </AuthProvider>
  );
}
