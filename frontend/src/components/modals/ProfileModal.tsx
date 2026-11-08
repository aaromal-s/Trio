import React from 'react';
import { User, X, Shield, Award, Calendar, CheckCircle2 } from 'lucide-react';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  email: string;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  email
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-md bg-trio-secondary border border-trio-border rounded-2xl p-6 shadow-2xl relative text-left">
        <div className="flex items-center justify-between pb-4 border-b border-trio-border mb-5">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-trio-purple" />
            <h3 className="text-base font-bold text-white">Evaluator Profile</h3>
          </div>
          <button onClick={onClose} className="text-trio-muted hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center gap-4 mb-6">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-trio-cyan to-trio-purple flex items-center justify-center text-xl font-bold text-black shadow-glow-cyan/30">
            {email ? email.charAt(0).toUpperCase() : 'E'}
          </div>
          <div>
            <h4 className="text-sm font-bold text-white truncate max-w-[240px]">{email || 'Evaluator Guest'}</h4>
            <span className="text-[10px] font-mono uppercase tracking-wider text-trio-cyan font-bold">
              Principal Research Evaluator
            </span>
            <div className="text-xs text-trio-muted mt-0.5">
              University AI/ML Defense Committee
            </div>
          </div>
        </div>

        <div className="space-y-2.5 font-mono text-xs bg-slate-900/60 p-4 rounded-xl border border-slate-800">
          <div className="flex justify-between">
            <span className="text-slate-400">Access Level:</span>
            <span className="text-trio-green font-bold">Full Analytical Access</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Affiliation:</span>
            <span className="text-slate-200">Department of Computer Science</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Session Mode:</span>
            <span className="text-trio-cyan">Evaluator Interactive Sandbox</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Evaluation Date:</span>
            <span className="text-slate-300">2026-11-08</span>
          </div>
        </div>

        <div className="pt-6 border-t border-trio-border mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white transition-colors"
          >
            Close Profile
          </button>
        </div>
      </div>
    </div>
  );
};

