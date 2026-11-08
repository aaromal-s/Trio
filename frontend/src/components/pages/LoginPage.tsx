import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { TrioLogo } from '../brand/TrioLogo';
import { 
  Eye, 
  EyeOff, 
  Lock, 
  Mail, 
  ArrowRight, 
  Sparkles, 
  ShieldCheck, 
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

interface LoginPageProps {
  onLoginSuccess: (email: string) => void;
  onEnterGuestDemo: () => void;
  onBackToLanding: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  onLoginSuccess,
  onEnterGuestDemo,
  onBackToLanding
}) => {
  const [email, setEmail] = useState('evaluator@university.edu');
  const [password, setPassword] = useState('trio2026demo');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!email || !email.includes('@')) {
      setErrorMsg('Please enter a valid university or corporate email.');
      return;
    }
    if (!password || password.length < 6) {
      setErrorMsg('Password must be at least 6 characters.');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      onLoginSuccess(email);
    }, 700);
  };

  return (
    <div className="min-h-screen bg-trio-bg flex flex-col justify-center items-center px-4 relative overflow-hidden select-none">
      {/* Background radial gradients */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-gradient-to-tr from-trio-cyan/15 via-trio-purple/15 to-transparent blur-[140px] pointer-events-none" />

      {/* Back button */}
      <button
        onClick={onBackToLanding}
        className="absolute top-6 left-6 text-xs text-trio-muted hover:text-white transition-colors flex items-center gap-1.5"
      >
        <span>&larr; Back to Landing Page</span>
      </button>

      {/* Login Card */}
      <motion.div
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md p-8 rounded-2xl bg-trio-secondary/90 backdrop-blur-2xl border border-trio-border shadow-2xl relative z-10"
      >
        {/* Logo and Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="mb-4">
            <TrioLogo size="lg" showText={false} />
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            Sign In to TRIO Platform
          </h2>
          <p className="text-xs text-trio-muted mt-1.5">
            Contradiction-Guided Tri-Memory AI Discovery Suite
          </p>
        </div>

        {/* Demo Mode Notice Banner */}
        <div className="mb-6 p-3 rounded-xl bg-cyan-950/40 border border-trio-cyan/30 flex items-start gap-2.5 text-left">
          <Sparkles className="w-4 h-4 text-trio-cyan shrink-0 mt-0.5" />
          <div className="text-[11px] text-cyan-200 leading-relaxed">
            <strong className="text-white font-semibold">Evaluation Mode:</strong> Credentials are pre-filled for university evaluators and professors. Or click <em>Instant Guest Demo</em> below.
          </div>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 rounded-lg bg-rose-950/60 border border-rose-500/40 flex items-center gap-2 text-xs text-rose-300">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5 text-left">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-trio-muted absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-trio-card border border-trio-border rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-trio-cyan focus:ring-1 focus:ring-trio-cyan transition-all"
                placeholder="name@university.edu"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5 text-left">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-trio-muted absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-10 py-2.5 bg-trio-card border border-trio-border rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-trio-cyan focus:ring-1 focus:ring-trio-cyan transition-all"
                placeholder="&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-trio-muted hover:text-white"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-trio-muted pt-1">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="rounded border-slate-700 bg-slate-800 text-trio-cyan focus:ring-0 w-3.5 h-3.5"
              />
              <span>Remember session</span>
            </label>
            <span className="text-[11px] text-slate-500">Evaluator Sandbox</span>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 px-4 rounded-xl bg-trio-cyan text-black font-semibold text-xs hover:bg-cyan-300 shadow-glow-cyan transition-all flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
          >
            {isLoading ? (
              <span className="inline-block w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span>Sign In to Workspace</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </form>

        {/* Guest Demo Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-trio-border/80" />
          </div>
          <div className="relative flex justify-center text-[10px] uppercase tracking-wider">
            <span className="bg-trio-secondary px-3 text-trio-muted">
              Or Explore Instantly
            </span>
          </div>
        </div>

        {/* Instant Guest Demo Button */}
        <button
          onClick={onEnterGuestDemo}
          className="w-full py-2.5 px-4 rounded-xl bg-trio-card text-white font-medium text-xs border border-trio-border hover:border-purple-500/50 hover:bg-slate-800/80 transition-all flex items-center justify-center gap-2"
        >
          <Sparkles className="w-3.5 h-3.5 text-purple-400" />
          <span>Launch Instant Guest Demo (No Sign-In Required)</span>
        </button>

        {/* Footer Note */}
        <div className="mt-6 text-center text-[10px] text-slate-500 flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-3 h-3 text-trio-green" />
          <span>Safe University Evaluation Sandbox &bull; No sensitive cookies stored</span>
        </div>
      </motion.div>
    </div>
  );
};

