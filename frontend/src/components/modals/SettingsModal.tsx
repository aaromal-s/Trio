import React, { useState } from 'react';
import { Settings, X, Server, RefreshCw, Database, Check } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onResetDemo: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  onResetDemo
}) => {
  const [apiUrl, setApiUrl] = useState(import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api');
  const [refreshInterval, setRefreshInterval] = useState('5');
  const [saved, setSaved] = useState(false);

  if (!isOpen) return null;

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-md bg-trio-secondary border border-trio-border rounded-2xl p-6 shadow-2xl relative text-left">
        <div className="flex items-center justify-between pb-4 border-b border-trio-border mb-5">
          <div className="flex items-center gap-2">
            <Settings className="w-4 h-4 text-trio-cyan" />
            <h3 className="text-base font-bold text-white">Platform Settings</h3>
          </div>
          <button onClick={onClose} className="text-trio-muted hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Backend API Endpoint
            </label>
            <div className="relative">
              <Server className="w-4 h-4 text-trio-muted absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={apiUrl}
                onChange={(e) => setApiUrl(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-trio-card border border-trio-border rounded-xl text-xs font-mono text-white focus:outline-none focus:border-trio-cyan"
              />
            </div>
            <p className="text-[10px] text-slate-500 mt-1">
              Connect to local FastAPI instance or cloud deployment.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Auto-Refresh Cadence
            </label>
            <select
              value={refreshInterval}
              onChange={(e) => setRefreshInterval(e.target.value)}
              className="w-full px-3 py-2 bg-trio-card border border-trio-border rounded-xl text-xs text-white focus:outline-none focus:border-trio-cyan"
            >
              <option value="3">3 seconds (High frequency)</option>
              <option value="5">5 seconds (Recommended standard)</option>
              <option value="10">10 seconds (Low bandwidth)</option>
            </select>
          </div>

          <div className="pt-2 border-t border-trio-border">
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Reset Demonstration State
            </label>
            <p className="text-[11px] text-trio-muted mb-2">
              Restore default SWaT synthetic time series and pre-trained TRIO model parameters.
            </p>
            <button
              onClick={() => { onResetDemo(); onClose(); }}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 border border-slate-700 transition-colors"
            >
              Reset to Factory Demo State
            </button>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-6 border-t border-trio-border mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-trio-muted hover:text-white"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 rounded-xl bg-trio-cyan text-black font-semibold text-xs hover:bg-cyan-300 transition-colors flex items-center gap-1.5"
          >
            {saved ? <Check className="w-3.5 h-3.5" /> : null}
            <span>{saved ? 'Saved!' : 'Save Preferences'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

