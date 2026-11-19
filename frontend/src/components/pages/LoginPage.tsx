import React, { useState, useEffect } from 'react';
import { 
  Eye, 
  EyeOff, 
  Lock, 
  User, 
  Mail, 
  ArrowRight, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle, 
  KeyRound, 
  ArrowLeft
} from 'lucide-react';
import { api } from '../../services/api';
import { TrioLogo } from '../brand/TrioLogo';

interface LoginPageProps {
  onLoginSuccess: (identifier: string) => void;
  onEnterGuestDemo: () => void;
  onBackToLanding: () => void;
  initialResetToken?: string;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  onLoginSuccess,
  onEnterGuestDemo,
  onBackToLanding,
  initialResetToken = ''
}) => {
  const isProd = import.meta.env.PROD;
  const [userId, setUserId] = useState(isProd ? '' : '12406834');
  const [password, setPassword] = useState(isProd ? '' : '123456');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Forced First-Login Password Change Modal
  const [requireForceChange, setRequireForceChange] = useState(false);
  const [forceNewPass, setForceNewPass] = useState('');
  const [forceConfirmPass, setForceConfirmPass] = useState('');
  const [forceError, setForceError] = useState('');
  const [forceLoading, setForceLoading] = useState(false);
  const [pendingUserId, setPendingUserId] = useState('');

  // Forgot Password / Recovery States
  const [isForgotMode, setIsForgotMode] = useState(Boolean(initialResetToken));
  const [recoveryEmail, setRecoveryEmail] = useState(isProd ? '' : 'evaluator@university.edu');
  const [recoveryToken, setRecoveryToken] = useState(initialResetToken);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [recoveryStep, setRecoveryStep] = useState<'request' | 'reset'>(
    initialResetToken ? 'reset' : 'request'
  );
  const [recoveryMsg, setRecoveryMsg] = useState('');
  const [recoveryError, setRecoveryError] = useState('');
  const [recoveryLoading, setRecoveryLoading] = useState(false);

  useEffect(() => {
    if (initialResetToken) {
      setIsForgotMode(true);
      setRecoveryToken(initialResetToken);
      setRecoveryStep('reset');
    }
  }, [initialResetToken]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const trimmedUser = userId.trim();
    if (!trimmedUser || trimmedUser.length < 3) {
      setErrorMsg('User ID must be at least 3 characters.');
      return;
    }
    if (!password || password.length < 6) {
      setErrorMsg('Password must be at least 6 characters.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await api.login(trimmedUser, password);
      setIsLoading(false);

      if (rememberMe) {
        localStorage.setItem('trio_token', res.access_token);
        localStorage.setItem('trio_user_id', res.user.user_id);
      }

      // Check if temporary bootstrap account must change password
      if (res.force_password_change) {
        setPendingUserId(res.user.user_id);
        setRequireForceChange(true);
        return;
      }

      setIsSuccess(true);
      setTimeout(() => {
        onLoginSuccess(res.user.user_id);
      }, 500);
    } catch (err: any) {
      setIsLoading(false);
      setErrorMsg(err.message || 'Authentication failed. Please verify credentials.');
    }
  };

  const handleForcePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setForceError('');

    if (forceNewPass.length < 6) {
      setForceError('New password must be at least 6 characters.');
      return;
    }
    if (forceNewPass !== forceConfirmPass) {
      setForceError('New passwords do not match.');
      return;
    }

    setForceLoading(true);
    try {
      await api.changePassword(password, forceNewPass, pendingUserId);
      setForceLoading(false);
      setRequireForceChange(false);
      setIsSuccess(true);
      setTimeout(() => {
        onLoginSuccess(pendingUserId);
      }, 500);
    } catch (err: any) {
      setForceLoading(false);
      setForceError(err.message || 'Password update failed.');
    }
  };

  const handleRequestResetToken = async (e: React.FormEvent) => {
    e.preventDefault();
    setRecoveryError('');
    setRecoveryMsg('');

    if (!recoveryEmail || !recoveryEmail.includes('@')) {
      setRecoveryError('Please provide a valid registered email address.');
      return;
    }

    setRecoveryLoading(true);
    try {
      const res = await api.forgotPassword(recoveryEmail);
      setRecoveryLoading(false);
      setRecoveryMsg(res.message);
      if (res.reset_token) {
        setRecoveryToken(res.reset_token);
        setRecoveryStep('reset');
      }
    } catch (err: any) {
      setRecoveryLoading(false);
      setRecoveryError(err.message || 'Could not process password recovery.');
    }
  };

  const handleExecuteReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setRecoveryError('');
    setRecoveryMsg('');

    if (!recoveryToken) {
      setRecoveryError('Recovery token is required.');
      return;
    }
    if (newPassword.length < 6) {
      setRecoveryError('New password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setRecoveryError('Passwords do not match.');
      return;
    }

    setRecoveryLoading(true);
    try {
      const res = await api.resetPassword(recoveryToken, newPassword);
      setRecoveryLoading(false);
      setRecoveryMsg(res.message);
      setTimeout(() => {
        setIsForgotMode(false);
        setPassword(newPassword);
        setRecoveryStep('request');
      }, 1200);
    } catch (err: any) {
      setRecoveryLoading(false);
      setRecoveryError(err.message || 'Password reset failed.');
    }
  };

  const setDemoCredentials = (u: string, p: string) => {
    setUserId(u);
    setPassword(p);
    setErrorMsg('');
  };

  return (
    <div className="min-h-screen bg-trio-bg text-slate-100 flex flex-col justify-between relative overflow-hidden font-sans select-none">
      {/* Top Header */}
      <header className="relative z-20 px-6 py-4 flex items-center justify-between border-b border-trio-border/60 bg-trio-bg/80 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <TrioLogo size="sm" subtitle="Enterprise Platform" />
        </div>

        <button
          onClick={onBackToLanding}
          className="text-xs text-slate-400 hover:text-white flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-800 hover:border-slate-700 bg-slate-900/60 transition-all"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Platform Overview</span>
        </button>
      </header>

      {/* Center Auth Card */}
      <main className="relative z-20 flex-1 flex items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-md bg-trio-card/90 border border-trio-border rounded-2xl shadow-2xl backdrop-blur-xl p-6 sm:p-8 relative">
          {/* Logo & Headline */}
          <div className="flex flex-col items-center text-center mb-6">
            <TrioLogo size="md" showText={false} className="mb-3" />
            <h1 className="text-xl font-bold tracking-tight text-white">
              {isForgotMode ? 'Credential Recovery' : 'Sign In to TRIO'}
            </h1>
            <p className="text-xs text-trio-muted mt-1 max-w-xs">
              {isForgotMode 
                ? 'Reset your credentials with secure single-use token verification' 
                : 'Enterprise industrial telemetry discovery & operational regime intelligence'}
            </p>
          </div>

          {/* Quick Demo Credentials Autofill Banner */}
          {!isForgotMode && (
            <div className="mb-5 p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-left">
              <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400 block mb-1.5">
                Quick Demo Credentials (Click to Autofill)
              </span>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setDemoCredentials('12406834', '123456')}
                  className="px-2.5 py-1 rounded-md bg-slate-900 hover:bg-slate-800 border border-slate-700 text-[11px] font-mono text-cyan-400 flex items-center gap-1.5 transition-colors"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                  Admin: 12406834
                </button>
                <button
                  type="button"
                  onClick={() => setDemoCredentials('evaluator', 'trio2026demo')}
                  className="px-2.5 py-1 rounded-md bg-slate-900 hover:bg-slate-800 border border-slate-700 text-[11px] font-mono text-purple-400 flex items-center gap-1.5 transition-colors"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                  Evaluator: evaluator
                </button>
              </div>
            </div>
          )}

          {/* Alerts */}
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-500/40 text-xs text-rose-300 flex items-center gap-2 mb-4">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {isSuccess && (
            <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-xs text-emerald-300 flex items-center gap-2 mb-4">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Authentication verified. Loading workspace...</span>
            </div>
          )}

          {/* Regular Login Form */}
          {!isForgotMode ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  User ID / Operator Identifier
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={userId}
                    onChange={(e) => setUserId(e.target.value)}
                    required
                    disabled={isLoading || isSuccess}
                    placeholder="e.g. 12406834 or evaluator"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-950/70 border border-slate-700/80 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 text-xs text-white placeholder-slate-500 transition-all font-mono"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-slate-300">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setIsForgotMode(true);
                      setErrorMsg('');
                    }}
                    className="text-[11px] text-cyan-400 hover:text-cyan-300 transition-colors"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={isLoading || isSuccess}
                    placeholder="Enter account password"
                    className="w-full pl-9 pr-10 py-2.5 rounded-xl bg-slate-950/70 border border-slate-700/80 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 text-xs text-white placeholder-slate-500 transition-all font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-300"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-400">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded border-slate-700 bg-slate-900 text-cyan-500 focus:ring-0 w-3.5 h-3.5"
                  />
                  <span>Keep session active</span>
                </label>
              </div>

              <button
                type="submit"
                disabled={isLoading || isSuccess}
                className="w-full py-2.5 px-4 rounded-xl bg-trio-cyan text-black hover:bg-cyan-300 font-semibold text-xs transition-all flex items-center justify-center gap-2 disabled:opacity-50 mt-2 shadow-sm"
              >
                {isLoading ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                    <span>Verifying Argon2id Hash...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In to Console</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                <span className="text-slate-500 font-mono">Secured by Argon2id</span>
                <button
                  type="button"
                  onClick={onEnterGuestDemo}
                  className="text-cyan-400 hover:text-cyan-300 font-medium"
                >
                  Direct Sandbox Access &rarr;
                </button>
              </div>
            </form>
          ) : (
            /* Forgot Password Flow */
            <div className="space-y-4">
              {recoveryMsg && (
                <div className="p-3 rounded-xl bg-cyan-950/60 border border-cyan-500/40 text-xs text-cyan-300 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                  <span className="break-all">{recoveryMsg}</span>
                </div>
              )}

              {recoveryError && (
                <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-500/40 text-xs text-rose-300 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>{recoveryError}</span>
                </div>
              )}

              {recoveryStep === 'request' ? (
                <form onSubmit={handleRequestResetToken} className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Registered Email Address
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                        <Mail className="w-4 h-4" />
                      </div>
                      <input
                        type="email"
                        value={recoveryEmail}
                        onChange={(e) => setRecoveryEmail(e.target.value)}
                        required
                        placeholder="operator@plant.internal"
                        className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-700 focus:border-cyan-400 text-xs text-white"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={recoveryLoading}
                    className="w-full py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs transition-all flex items-center justify-center gap-2"
                  >
                    {recoveryLoading ? 'Generating Token...' : 'Generate 15-Minute Recovery Token'}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleExecuteReset} className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Reset Token
                    </label>
                    <input
                      type="text"
                      value={recoveryToken}
                      onChange={(e) => setRecoveryToken(e.target.value)}
                      required
                      placeholder="Paste recovery token"
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 focus:border-cyan-400 text-xs text-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      New Password (Min 6 chars)
                    </label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      placeholder="Enter new password"
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 focus:border-cyan-400 text-xs text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      placeholder="Confirm new password"
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 focus:border-cyan-400 text-xs text-white"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={recoveryLoading}
                    className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-all flex items-center justify-center gap-2"
                  >
                    {recoveryLoading ? 'Updating Credentials...' : 'Save New Password & Continue'}
                  </button>
                </form>
              )}

              <button
                type="button"
                onClick={() => {
                  setIsForgotMode(false);
                  setRecoveryError('');
                  setRecoveryMsg('');
                }}
                className="w-full text-center text-xs text-slate-400 hover:text-white pt-2"
              >
                &larr; Back to sign in
              </button>
            </div>
          )}
        </div>
      </main>

      {/* Force First Login Password Change Modal */}
      {requireForceChange && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-md bg-trio-card border border-amber-500/40 rounded-2xl p-6 shadow-2xl relative text-left">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-800 mb-4">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <KeyRound className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">First Login: Password Update Required</h3>
                <p className="text-[11px] text-slate-400">Initial bootstrap administrator credentials must be rotated.</p>
              </div>
            </div>

            {forceError && (
              <div className="p-2.5 rounded-lg bg-rose-950/60 border border-rose-500/40 text-xs text-rose-300 flex items-center gap-2 mb-3">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{forceError}</span>
              </div>
            )}

            <form onSubmit={handleForcePasswordChange} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  New Secure Password
                </label>
                <input
                  type="password"
                  value={forceNewPass}
                  onChange={(e) => setForceNewPass(e.target.value)}
                  required
                  placeholder="Minimum 6 characters"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 focus:border-amber-400 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={forceConfirmPass}
                  onChange={(e) => setForceConfirmPass(e.target.value)}
                  required
                  placeholder="Re-enter password"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 focus:border-amber-400 text-xs text-white"
                />
              </div>

              <button
                type="submit"
                disabled={forceLoading}
                className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-all flex items-center justify-center gap-2 mt-4"
              >
                {forceLoading ? 'Securing Account...' : 'Set Password & Enter Dashboard'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Bottom Footer */}
      <footer className="relative z-20 px-6 py-4 text-center border-t border-trio-border/60 bg-trio-bg/80 backdrop-blur-md text-[11px] text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
          <span>Argon2id Salted Cryptographic Hashing &bull; Sliding-Window Rate Limiting</span>
        </div>
        <div>
          <span>&copy; 2026 TRIO AI Platform &bull; Production Ready</span>
        </div>
      </footer>
    </div>
  );
};
export default LoginPage;