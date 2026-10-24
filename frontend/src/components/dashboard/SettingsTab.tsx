import React, { useState } from 'react';
import {
  User as UserIcon, Lock, Bell, Shield, Save, CheckCircle2,
  AlertCircle, Key, RefreshCw
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { GlassCard } from '../common/GlassCard';
import { Badge } from '../common/Badge';
import { api } from '../../services/api';

export const SettingsTab: React.FC = () => {
  const { user, updateProfile } = useAuth();

  // Profile Form
  const [fullName, setFullName] = useState<string>(user?.full_name || 'Alexander Vance');
  const [department, setDepartment] = useState<string>(user?.department || 'Site Reliability Engineering');
  const [profileSuccess, setProfileSuccess] = useState<string | null>(null);
  const [profileLoading, setProfileLoading] = useState<boolean>(false);

  // Notification Preferences
  const [emailAlerts, setEmailAlerts] = useState<boolean>(user?.notification_email ?? true);
  const [slackAlerts, setSlackAlerts] = useState<boolean>(user?.notification_slack ?? true);
  const [smsAlerts, setSmsAlerts] = useState<boolean>(user?.notification_sms ?? false);
  const [soundAlerts, setSoundAlerts] = useState<boolean>(user?.sound_alerts ?? true);
  const [autoRefreshPref, setAutoRefreshPref] = useState<boolean>(user?.auto_refresh_enabled ?? true);

  // Password Form
  const [currentPassword, setCurrentPassword] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [passwordLoading, setPasswordLoading] = useState<boolean>(false);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileLoading(true);
    setProfileSuccess(null);
    try {
      await updateProfile({
        full_name: fullName,
        department: department,
        notification_email: emailAlerts,
        notification_slack: slackAlerts,
        notification_sms: smsAlerts,
        sound_alerts: soundAlerts,
        auto_refresh_enabled: autoRefreshPref
      });
      setProfileSuccess('Profile preferences updated and persisted successfully.');
      setTimeout(() => setProfileSuccess(null), 4000);
    } catch (err: any) {
      console.error(err);
    } finally {
      setProfileLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(null);

    if (newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match.');
      return;
    }

    setPasswordLoading(true);
    try {
      const res = await api.changePassword(currentPassword, newPassword);
      setPasswordSuccess(res.message || 'Password changed successfully.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPasswordSuccess(null), 4000);
    } catch (err: any) {
      setPasswordError(err.message || 'Failed to change password.');
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      
      {/* Header */}
      <div className="p-4 rounded-xl bg-midnight-900/80 border border-white/[0.08]">
        <h2 className="text-lg font-bold text-white tracking-tight">SRE Operator Profile & Security Settings</h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Manage your verified operator credentials, notification dispatch rules, and password security.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Profile & Notification Form */}
        <GlassCard glow className="space-y-5">
          <div className="flex items-center gap-2 pb-3 border-b border-white/[0.08]">
            <UserIcon className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-bold text-white">Operator Profile & Notifications</h3>
          </div>

          {profileSuccess && (
            <div className="p-3 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{profileSuccess}</span>
            </div>
          )}

          <form onSubmit={handleSaveProfile} className="space-y-4 text-xs font-mono">
            <div>
              <label className="text-slate-400 block mb-1">Email Address (Immutable ID)</label>
              <input
                type="text"
                disabled
                value={user?.email || 'lead@aegisops.ai'}
                className="w-full px-3 py-2 rounded-lg bg-midnight-950/50 border border-white/5 text-slate-400 font-mono text-xs cursor-not-allowed"
              />
            </div>

            <div>
              <label className="text-slate-300 block mb-1">Full Name</label>
              <input
                type="text"
                required
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-midnight-950 border border-white/10 text-white font-sans text-xs focus:outline-none focus:border-brand-blue"
              />
            </div>

            <div>
              <label className="text-slate-300 block mb-1">Engineering Department</label>
              <input
                type="text"
                required
                value={department}
                onChange={e => setDepartment(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-midnight-950 border border-white/10 text-white font-sans text-xs focus:outline-none focus:border-brand-blue"
              />
            </div>

            <div className="pt-2 border-t border-white/[0.06] space-y-2.5 font-sans">
              <span className="text-[11px] font-bold text-slate-300 block uppercase tracking-wider font-mono">
                Dispatch Notification Rules
              </span>

              <label className="flex items-center justify-between p-2 rounded-lg bg-midnight-950 border border-white/5 cursor-pointer">
                <div>
                  <span className="text-white block font-medium">Critical P1 Incident Email Alerts</span>
                  <span className="text-[10px] text-slate-400">Immediate routing to registered inbox</span>
                </div>
                <input
                  type="checkbox"
                  checked={emailAlerts}
                  onChange={e => setEmailAlerts(e.target.checked)}
                  className="rounded bg-slate-800 border-slate-700 text-brand-blue w-4 h-4"
                />
              </label>

              <label className="flex items-center justify-between p-2 rounded-lg bg-midnight-950 border border-white/5 cursor-pointer">
                <div>
                  <span className="text-white block font-medium">Slack Pager Webhook</span>
                  <span className="text-[10px] text-slate-400">Real-time #sre-war-room channel notification</span>
                </div>
                <input
                  type="checkbox"
                  checked={slackAlerts}
                  onChange={e => setSlackAlerts(e.target.checked)}
                  className="rounded bg-slate-800 border-slate-700 text-brand-blue w-4 h-4"
                />
              </label>

              <label className="flex items-center justify-between p-2 rounded-lg bg-midnight-950 border border-white/5 cursor-pointer">
                <div>
                  <span className="text-white block font-medium">Audible Anomaly Tone</span>
                  <span className="text-[10px] text-slate-400">Audio chime on high-risk prediction breach</span>
                </div>
                <input
                  type="checkbox"
                  checked={soundAlerts}
                  onChange={e => setSoundAlerts(e.target.checked)}
                  className="rounded bg-slate-800 border-slate-700 text-brand-blue w-4 h-4"
                />
              </label>
            </div>

            <button
              type="submit"
              disabled={profileLoading}
              className="w-full py-2.5 rounded-lg bg-brand-blue hover:bg-blue-600 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors font-sans"
            >
              {profileLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
              Save Profile Preferences
            </button>
          </form>
        </GlassCard>

        {/* Password Management & Account Security */}
        <div className="space-y-6">
          <GlassCard glow className="space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-white/[0.08]">
              <Lock className="w-4 h-4 text-violet-400" />
              <h3 className="text-sm font-bold text-white">Change Access Password</h3>
            </div>

            {passwordSuccess && (
              <div className="p-3 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{passwordSuccess}</span>
              </div>
            )}

            {passwordError && (
              <div className="p-3 rounded-lg bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{passwordError}</span>
              </div>
            )}

            <form onSubmit={handleChangePassword} className="space-y-3.5 text-xs font-mono">
              <div>
                <label className="text-slate-300 block mb-1">Current Password</label>
                <input
                  type="password"
                  required
                  value={currentPassword}
                  onChange={e => setCurrentPassword(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-midnight-950 border border-white/10 text-white font-sans text-xs focus:outline-none focus:border-brand-blue"
                />
              </div>

              <div>
                <label className="text-slate-300 block mb-1">New Password (min 6 characters)</label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-midnight-950 border border-white/10 text-white font-sans text-xs focus:outline-none focus:border-brand-blue"
                />
              </div>

              <div>
                <label className="text-slate-300 block mb-1">Confirm New Password</label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-midnight-950 border border-white/10 text-white font-sans text-xs focus:outline-none focus:border-brand-blue"
                />
              </div>

              <button
                type="submit"
                disabled={passwordLoading}
                className="w-full py-2.5 rounded-lg bg-midnight-800 hover:bg-midnight-700 text-slate-200 hover:text-white font-bold text-xs flex items-center justify-center gap-2 border border-white/10 transition-colors font-sans"
              >
                {passwordLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Key className="w-3.5 h-3.5" />}
                Update Password Hash
              </button>
            </form>
          </GlassCard>

          {/* SRE Role & Session Token Card */}
          <GlassCard glow className="space-y-3 font-mono text-xs">
            <span className="text-slate-400 font-bold block pb-2 border-b border-white/[0.08]">
              Security Session & RBAC
            </span>
            <div className="space-y-2">
              <div className="flex justify-between items-center text-slate-300">
                <span>Active Role:</span>
                <Badge variant="info">{user?.role?.toUpperCase() || 'ADMIN'}</Badge>
              </div>
              <div className="flex justify-between items-center text-slate-300">
                <span>Password Hashing:</span>
                <span className="text-cyan-300 font-semibold">Bcrypt (Salted, 12 rounds)</span>
              </div>
              <div className="flex justify-between items-center text-slate-300">
                <span>Token Expiry:</span>
                <span className="text-slate-400">24 Hours (HS256)</span>
              </div>
            </div>
          </GlassCard>
        </div>

      </div>

    </div>
  );
};
