import React, { useState } from 'react';
import {
  LayoutDashboard, Activity, AlertTriangle, ShieldAlert, Sparkles,
  Layers, BarChart3, Settings, ShieldCheck, HelpCircle, Eye, LogIn, X, Info
} from 'lucide-react';
import { OverviewTab } from './OverviewTab';
import { LiveMonitoringTab } from './LiveMonitoringTab';
import { PredictiveRiskTab } from './PredictiveRiskTab';
import { IncidentManagementTab } from './IncidentManagementTab';
import { CopilotTab } from './CopilotTab';
import { InfrastructureTab } from './InfrastructureTab';
import { AnalyticsTab } from './AnalyticsTab';
import { SettingsTab } from './SettingsTab';
import { useLiveData } from '../../context/LiveDataContext';
import { useAuth } from '../../context/AuthContext';
import { GuidedTourModal } from '../common/GuidedTourModal';

interface DashboardShellProps {
  isDemoMode?: boolean;
  openAuthModal?: (mode: 'login' | 'register') => void;
  onReturnToLanding?: () => void;
}

export const DashboardShell: React.FC<DashboardShellProps> = ({
  isDemoMode = false,
  openAuthModal,
  onReturnToLanding
}) => {
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [selectedIncidentId, setSelectedIncidentId] = useState<number | null>(null);
  const [selectedServiceForCopilot, setSelectedServiceForCopilot] = useState<string | null>(null);
  const [showTour, setShowTour] = useState<boolean>(false);
  const [demoBannerDismissed, setDemoBannerDismissed] = useState<boolean>(false);

  const { overview } = useLiveData();
  const { user } = useAuth();

  const handleSelectIncidentFromOtherTabs = (id: number) => {
    setSelectedIncidentId(id);
    setActiveTab('incidents');
  };

  const handleInvestigateFromOtherTabs = (serviceName: string) => {
    setSelectedServiceForCopilot(serviceName);
    setActiveTab('copilot');
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'monitoring', label: 'Live Monitoring', icon: Activity },
    { id: 'predictions', label: 'Predictive Risk (+30m)', icon: AlertTriangle },
    { 
      id: 'incidents', 
      label: 'Incident Management', 
      icon: ShieldAlert,
      badge: overview?.active_incidents_total ? String(overview.active_incidents_total) : undefined
    },
    { id: 'copilot', label: 'AI Investigation Copilot', icon: Sparkles },
    { id: 'infrastructure', label: 'Infrastructure Topology', icon: Layers },
    { id: 'analytics', label: 'Analytics & Reports', icon: BarChart3 },
    { id: 'settings', label: 'User Settings', icon: Settings },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Exploration Demo Mode Banner (when unauthenticated or demo mode is active) */}
      {(isDemoMode || !user) && !demoBannerDismissed && (
        <div className="p-3.5 sm:p-4 rounded-xl bg-midnight-900/90 border border-brand-blue/30 backdrop-blur-md shadow-glow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-start sm:items-center gap-2.5">
            <div className="p-1 rounded-lg bg-cyan-500/20 text-cyan-400 shrink-0">
              <Eye className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-white tracking-wide">
                EXPLORATION DEMO MODE
              </span>
              <span className="text-slate-400 block sm:inline sm:ml-2">
                Viewing demonstration microservice telemetry and pre-trained ML models. Sign in with Lead credentials (<code className="text-cyan-300 font-mono">lead@aegisops.ai</code>) to execute production approvals.
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setShowTour(true)}
              className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-slate-200 font-semibold text-[11px] flex items-center gap-1.5 transition-colors"
            >
              <HelpCircle className="w-3.5 h-3.5 text-cyan-400" />
              Quick Tour
            </button>
            {openAuthModal && (
              <button
                onClick={() => openAuthModal('login')}
                className="px-3.5 py-1.5 rounded-lg bg-brand-blue hover:bg-blue-600 text-white font-semibold text-[11px] shadow-sm flex items-center gap-1.5 transition-all"
              >
                <LogIn className="w-3.5 h-3.5" />
                Sign In
              </button>
            )}
            <button
              onClick={() => setDemoBannerDismissed(true)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
              aria-label="Dismiss banner"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Sub-tab Navigation Bar with Quick Tour Action */}
      <div className="flex items-center justify-between gap-3 pb-1 border-b border-white/[0.08]">
        <div className="flex items-center gap-1 overflow-x-auto scrollbar-none py-1">
          {tabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-brand-blue text-white shadow-glow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full font-mono ${
                    isActive ? 'bg-white/20 text-white' : 'bg-rose-500/20 text-rose-300'
                  }`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Guided Tour Trigger Button */}
        <button
          onClick={() => setShowTour(true)}
          className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl bg-midnight-900 border border-white/10 hover:border-cyan-400/40 text-xs font-semibold text-slate-300 hover:text-white transition-colors shrink-0"
          title="Start interactive console walkthrough"
        >
          <HelpCircle className="w-3.5 h-3.5 text-cyan-400" />
          <span>Interactive Tour</span>
        </button>
      </div>

      {/* Tab Panels */}
      <div>
        {activeTab === 'overview' && (
          <OverviewTab
            onSelectTab={setActiveTab}
            onSelectIncident={handleSelectIncidentFromOtherTabs}
          />
        )}

        {activeTab === 'monitoring' && (
          <LiveMonitoringTab
            onInvestigate={handleInvestigateFromOtherTabs}
          />
        )}

        {activeTab === 'predictions' && (
          <PredictiveRiskTab />
        )}

        {activeTab === 'incidents' && (
          <IncidentManagementTab
            onInvestigateIncident={(id) => {
              setSelectedIncidentId(id);
              setActiveTab('copilot');
            }}
            selectedIncidentId={selectedIncidentId}
          />
        )}

        {activeTab === 'copilot' && (
          <CopilotTab
            initialIncidentId={selectedIncidentId}
            initialService={selectedServiceForCopilot}
          />
        )}

        {activeTab === 'infrastructure' && (
          <InfrastructureTab
            onInvestigateNode={handleInvestigateFromOtherTabs}
          />
        )}

        {activeTab === 'analytics' && (
          <AnalyticsTab />
        )}

        {activeTab === 'settings' && (
          <SettingsTab />
        )}
      </div>

      {/* Guided Tour Modal */}
      <GuidedTourModal
        isOpen={showTour}
        onClose={() => setShowTour(false)}
        onNavigateTab={(tabId) => setActiveTab(tabId)}
      />

    </div>
  );
};
