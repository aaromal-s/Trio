import React, { useState } from 'react';
import { Lock, Mail, User as UserIcon, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Modal } from '../common/Modal';
import { AegisLogo } from '../common/AegisLogo';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'register';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'login'
}) => {
  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>(initialMode);
  const { login, register } = useAuth();

  const [email, setEmail] = useState<string>('lead@aegisops.ai');
  const [password, setPassword] = useState<string>('AegisOps@2026');
  const [fullName, setFullName] = useState<string>('Alexander Vance');
  const [role, setRole] = useState<string>('sre_lead');
  
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [forgotSuccess, setForgotSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setForgotSuccess(null);
    setLoading(true);

    try {
      if (mode === 'login') {
        await login(email, password);
        onClose();
      } else if (mode === 'register') {
        await register({ email, password, full_name: fullName, role });
        onClose();
      } else if (mode === 'forgot') {
        const res = await api.resetPassword(email);
        setForgotSuccess(res.message);
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        mode === 'login' ? 'Sign In to Operations Console' :
        mode === 'register' ? 'Register SRE Operator Account' :
        'Reset Access Password'
      }
      subtitle="Enterprise Zero-Trust Authentication Gate"
      maxWidth="md"
    >
      <div className="space-y-4">
        
        {/* Brand Header */}
        <div className="flex items-center justify-center pb-2">
          <AegisLogo variant="horizontal" size="md" showTagline />
        </div>

        {/* Demo Hint Banner */}
        {mode === 'login' && (
          <div className="p-3 rounded-xl bg-brand-blue/15 border border-brand-blue/30 text-xs text-slate-300">
            <span className="font-bold text-cyan-300 block mb-0.5">Demo Operator Credentials:</span>
            <div className="font-mono text-[11px] text-slate-400">
              Email: <span className="text-white">lead@aegisops.ai</span> &bull; Pass: <span className="text-white">AegisOps@2026</span>
            </div>
          </div>
        )}

        {error && (
          <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {forgotSuccess && (
          <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{forgotSuccess}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          {mode === 'register' && (
            <div>
              <label className="text-slate-300 block mb-1 font-medium">Full Name</label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Maya Chen"
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-lg bg-midnight-950 border border-white/10 text-white focus:outline-none focus:border-brand-blue"
                />
              </div>
            </div>
          )}

          <div>
            <label className="text-slate-300 block mb-1 font-medium">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                placeholder="name@aegisops.internal"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-lg bg-midnight-950 border border-white/10 text-white focus:outline-none focus:border-brand-blue"
              />
            </div>
          </div>

          {mode !== 'forgot' && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-slate-300 font-medium">Password</label>
                {mode === 'login' && (
                  <button
                    type="button"
                    onClick={() => setMode('forgot')}
                    className="text-[11px] text-cyan-400 hover:text-cyan-300"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  placeholder="••••••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-lg bg-midnight-950 border border-white/10 text-white focus:outline-none focus:border-brand-blue"
                />
              </div>
            </div>
          )}

          {mode === 'register' && (
            <div>
              <label className="text-slate-300 block mb-1 font-medium">Operator Role</label>
              <select
                value={role}
                onChange={e => setRole(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-midnight-950 border border-white/10 text-white focus:outline-none focus:border-brand-blue"
              >
                <option value="sre_lead">SRE Lead (Full Remediation Approval)</option>
                <option value="engineer">DevOps Engineer</option>
                <option value="viewer">Observability Viewer (Read-only)</option>
              </select>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-2.5 rounded-lg bg-gradient-to-r from-brand-blue to-blue-600 hover:from-blue-500 hover:to-blue-600 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all"
          >
            {loading ? 'Authenticating...' : (
              mode === 'login' ? 'Sign In to Console' :
              mode === 'register' ? 'Create SRE Account' :
              'Send Password Reset Instructions'
            )}
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>

        {/* Switch Mode Links */}
        <div className="text-center pt-2 border-t border-white/[0.08] text-[11px] text-slate-400">
          {mode === 'login' ? (
            <p>
              New SRE team member?{' '}
              <button
                type="button"
                onClick={() => setMode('register')}
                className="text-cyan-400 hover:underline font-semibold"
              >
                Register an account
              </button>
            </p>
          ) : (
            <p>
              Already registered?{' '}
              <button
                type="button"
                onClick={() => setMode('login')}
                className="text-cyan-400 hover:underline font-semibold"
              >
                Sign In
              </button>
            </p>
          )}
        </div>

      </div>
    </Modal>
  );
};
