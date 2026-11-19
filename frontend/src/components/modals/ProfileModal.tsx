import React, { useState, useEffect } from 'react';
import { 
  User, 
  X, 
  Lock, 
  CheckCircle2, 
  AlertCircle, 
  Edit3, 
  Save, 
  KeyRound, 
  Camera, 
  ShieldCheck, 
  Laptop, 
  LogOut, 
  Eye, 
  EyeOff, 
  Building,
  BadgeCheck
} from 'lucide-react';
import { api, UserProfile, ActiveSession } from '../../services/api';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  email: string;
  onProfileUpdated?: (updated: UserProfile) => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  email,
  onProfileUpdated
}) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'sessions'>('profile');
  const [profile, setProfile] = useState<UserProfile>({
    id: 'USR-001',
    user_id: 'evaluator',
    name: 'Dr. Sarah Chen',
    email: email || 'evaluator@university.edu',
    role: 'Principal AI/ML Evaluator',
    affiliation: 'Department of Computer Science & Automation',
    avatar_url: '',
    account_type: 'Evaluator',
    account_status: 'Active',
    created_at: '2026-11-01T10:00:00'
  });

  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editAffiliation, setEditAffiliation] = useState('');
  const [editRole, setEditRole] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState('');

  // Password change states
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileError, setProfileError] = useState('');

  // Active sessions
  const [sessions, setSessions] = useState<ActiveSession[]>([]);
  const [sessionsLoading, setSessionsLoading] = useState(false);
  const [sessionMsg, setSessionMsg] = useState('');

  const PRESET_AVATARS = [
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80',
  ];

  const loadProfile = React.useCallback(() => {
    api.getProfile(email).then((p) => {
      setProfile(p);
      setEditName(p.name);
      setEditEmail(p.email);
      setEditAffiliation(p.affiliation);
      setEditRole(p.role);
      setSelectedAvatar(p.avatar_url || '');
    }).catch(() => {});
  }, [email]);

  const loadSessions = React.useCallback(() => {
    setSessionsLoading(true);
    api.getSessions(email)
      .then((res) => setSessions(res.sessions || []))
      .catch(() => {})
      .finally(() => setSessionsLoading(false));
  }, [email]);

  useEffect(() => {
    if (isOpen) {
      loadProfile();
      loadSessions();
    }
  }, [isOpen, loadProfile, loadSessions]);

  if (!isOpen) return null;

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileError('');
    setProfileSuccess('');

    try {
      const res = await api.updateProfile({
        name: editName,
        email: editEmail,
        affiliation: editAffiliation,
        role: editRole,
        avatar_url: selectedAvatar
      }, email);
      setProfile(res.user);
      setIsEditing(false);
      setProfileSuccess('Profile details successfully updated and saved.');
      if (onProfileUpdated) onProfileUpdated(res.user);
    } catch (err: any) {
      setProfileError(err.message || 'Failed to update profile.');
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('New password and confirmation do not match.');
      return;
    }

    setPasswordLoading(true);
    try {
      await api.changePassword(currentPassword, newPassword, email);
      setPasswordSuccess('Password successfully updated and re-hashed with Argon2id.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setPasswordError(err.message || 'Failed to change password.');
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleLogoutOtherSessions = async () => {
    setSessionMsg('');
    try {
      await api.logoutOtherSessions(email);
      setSessionMsg('All other active sessions have been terminated.');
      loadSessions();
    } catch {
      setSessionMsg('Failed to terminate other sessions.');
    }
  };

  // Password strength computation
  const computePasswordStrength = (pass: string) => {
    if (!pass) return { score: 0, label: 'None', color: 'bg-slate-700' };
    let score = 0;
    if (pass.length >= 6) score += 25;
    if (pass.length >= 10) score += 25;
    if (/[A-Z]/.test(pass) && /[a-z]/.test(pass)) score += 25;
    if (/[0-9]/.test(pass) || /[^A-Za-z0-9]/.test(pass)) score += 25;

    if (score <= 25) return { score, label: 'Weak', color: 'bg-rose-500' };
    if (score <= 50) return { score, label: 'Fair', color: 'bg-amber-500' };
    if (score <= 75) return { score, label: 'Good', color: 'bg-cyan-500' };
    return { score: 100, label: 'Strong', color: 'bg-emerald-500' };
  };

  const passStrength = computePasswordStrength(newPassword);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="w-full max-w-2xl bg-[#0c1322] border border-slate-800 rounded-2xl shadow-2xl relative text-left overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header Banner */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-950/60 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <User className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Account &amp; Evaluator Profile</h3>
              <p className="text-[11px] text-slate-400">Enterprise authentication and research credentials</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="px-6 border-b border-slate-800/80 flex gap-6 bg-[#070b12]/50">
          <button
            onClick={() => setActiveTab('profile')}
            className={`py-3 text-xs font-semibold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'profile'
                ? 'border-cyan-400 text-cyan-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Profile Details</span>
          </button>
          <button
            onClick={() => setActiveTab('security')}
            className={`py-3 text-xs font-semibold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'security'
                ? 'border-cyan-400 text-cyan-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Security &amp; Password</span>
          </button>
          <button
            onClick={() => setActiveTab('sessions')}
            className={`py-3 text-xs font-semibold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'sessions'
                ? 'border-cyan-400 text-cyan-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Laptop className="w-3.5 h-3.5" />
            <span>Active Sessions ({sessions.length})</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {profileSuccess && (
            <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-xs text-emerald-300 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{profileSuccess}</span>
              </div>
              <button onClick={() => setProfileSuccess('')} className="text-emerald-400 hover:text-white">&times;</button>
            </div>
          )}

          {profileError && (
            <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-500/40 text-xs text-rose-300 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{profileError}</span>
              </div>
              <button onClick={() => setProfileError('')} className="text-rose-400 hover:text-white">&times;</button>
            </div>
          )}

          {/* TAB 1: PROFILE DETAILS */}
          {activeTab === 'profile' && (
            <div className="space-y-6">
              {/* Profile Avatar & Primary Badges */}
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 p-4 rounded-xl bg-slate-900/60 border border-slate-800">
                <div className="relative group">
                  <div className="w-20 h-20 rounded-2xl overflow-hidden bg-slate-800 border-2 border-cyan-500/40 flex items-center justify-center shadow-lg">
                    {selectedAvatar ? (
                      <img src={selectedAvatar} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-10 h-10 text-cyan-400" />
                    )}
                  </div>
                  {isEditing && (
                    <div className="absolute inset-0 bg-black/60 rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                      <Camera className="w-5 h-5 text-white" />
                    </div>
                  )}
                </div>

                <div className="flex-1 text-center sm:text-left space-y-1">
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                    <h4 className="text-base font-bold text-white">{profile.name}</h4>
                    <span className="px-2 py-0.5 rounded-full bg-cyan-950/80 border border-cyan-500/40 text-[10px] font-mono text-cyan-400 flex items-center gap-1">
                      <BadgeCheck className="w-3 h-3" />
                      {profile.account_type || 'Evaluator'}
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-[10px] font-mono text-emerald-400">
                      {profile.account_status || 'Active'}
                    </span>
                  </div>

                  <p className="text-xs text-slate-400">{profile.role}</p>
                  <p className="text-xs text-slate-400 flex items-center justify-center sm:justify-start gap-1">
                    <Building className="w-3 h-3 text-slate-500" />
                    <span>{profile.affiliation}</span>
                  </p>

                  <div className="pt-1 flex flex-wrap items-center justify-center sm:justify-start gap-4 text-[11px] text-slate-500 font-mono">
                    <span>User ID: <strong className="text-slate-300 font-normal">{profile.user_id}</strong></span>
                    <span>Internal Ref: <strong className="text-slate-300 font-normal">{profile.id}</strong></span>
                  </div>
                </div>

                {!isEditing ? (
                  <button
                    onClick={() => {
                      setIsEditing(true);
                      setEditName(profile.name);
                      setEditEmail(profile.email);
                      setEditAffiliation(profile.affiliation);
                      setEditRole(profile.role);
                    }}
                    className="px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-750 text-xs text-slate-200 flex items-center gap-1.5 transition-all self-center sm:self-start"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit Profile</span>
                  </button>
                ) : (
                  <div className="flex gap-2 self-center sm:self-start">
                    <button
                      onClick={() => setIsEditing(false)}
                      className="px-3 py-1.5 rounded-lg border border-slate-700 text-xs text-slate-400 hover:text-white"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>

              {/* Avatar Selector in Edit Mode */}
              {isEditing && (
                <div className="p-3.5 rounded-xl bg-slate-900/40 border border-slate-800">
                  <label className="block text-xs font-semibold text-slate-300 mb-2">
                    Choose Preset Avatar or Enter URL:
                  </label>
                  <div className="flex items-center gap-3 mb-3">
                    {PRESET_AVATARS.map((url, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setSelectedAvatar(url)}
                        className={`w-11 h-11 rounded-xl overflow-hidden border-2 transition-all ${
                          selectedAvatar === url ? 'border-cyan-400 scale-105' : 'border-slate-700 opacity-60 hover:opacity-100'
                        }`}
                      >
                        <img src={url} alt={`Preset ${idx}`} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                  <input
                    type="url"
                    value={selectedAvatar}
                    onChange={(e) => setSelectedAvatar(e.target.value)}
                    placeholder="Or paste custom image URL (https://...)"
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 font-mono"
                  />
                </div>
              )}

              {/* Editable Fields Form */}
              {isEditing ? (
                <form onSubmit={handleSaveProfile} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">Full Name</label>
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        required
                        className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 focus:border-cyan-400 text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">Email Address</label>
                      <input
                        type="email"
                        value={editEmail}
                        onChange={(e) => setEditEmail(e.target.value)}
                        required
                        className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 focus:border-cyan-400 text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">Professional Designation / Role</label>
                      <input
                        type="text"
                        value={editRole}
                        onChange={(e) => setEditRole(e.target.value)}
                        required
                        className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 focus:border-cyan-400 text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">Organization / Affiliation</label>
                      <input
                        type="text"
                        value={editAffiliation}
                        onChange={(e) => setEditAffiliation(e.target.value)}
                        required
                        className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 focus:border-cyan-400 text-xs text-white"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="px-4 py-2 rounded-xl border border-slate-700 text-xs text-slate-300 hover:text-white"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs transition-all flex items-center gap-1.5"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>Save Changes</span>
                    </button>
                  </div>
                </form>
              ) : (
                /* Read-Only Account Metadata Grid */
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="p-3.5 rounded-xl bg-slate-900/40 border border-slate-800">
                    <span className="text-slate-500 block mb-1">Verified Email</span>
                    <span className="font-mono text-slate-200">{profile.email}</span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-slate-900/40 border border-slate-800">
                    <span className="text-slate-500 block mb-1">User Identifier</span>
                    <span className="font-mono text-cyan-400">{profile.user_id}</span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-slate-900/40 border border-slate-800">
                    <span className="text-slate-500 block mb-1">Member Since</span>
                    <span className="font-mono text-slate-300">
                      {profile.created_at ? new Date(profile.created_at).toLocaleDateString() : 'November 2026'}
                    </span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-slate-900/40 border border-slate-800">
                    <span className="text-slate-500 block mb-1">Authentication Standard</span>
                    <span className="text-purple-300 font-mono">Argon2id (64MB memory cost)</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: SECURITY & PASSWORD */}
          {activeTab === 'security' && (
            <div className="space-y-5">
              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-4">
                <div className="flex items-center gap-2 text-xs font-bold text-white">
                  <KeyRound className="w-4 h-4 text-cyan-400" />
                  <span>Update Account Password</span>
                </div>

                {passwordSuccess && (
                  <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-xs text-emerald-300 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>{passwordSuccess}</span>
                  </div>
                )}

                {passwordError && (
                  <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-500/40 text-xs text-rose-300 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                    <span>{passwordError}</span>
                  </div>
                )}

                <form onSubmit={handleChangePassword} className="space-y-3.5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Current Password</label>
                    <div className="relative">
                      <input
                        type={showCurrentPass ? 'text' : 'password'}
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        required
                        placeholder="Enter current password"
                        className="w-full px-3 py-2 pr-10 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPass(!showCurrentPass)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-300"
                      >
                        {showCurrentPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">New Password (Min 6 chars)</label>
                    <div className="relative">
                      <input
                        type={showNewPass ? 'text' : 'password'}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                        placeholder="Enter new strong password"
                        className="w-full px-3 py-2 pr-10 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPass(!showNewPass)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-300"
                      >
                        {showNewPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>

                    {/* Password Strength Indicator */}
                    {newPassword && (
                      <div className="mt-2 space-y-1">
                        <div className="flex items-center justify-between text-[10px] text-slate-400">
                          <span>Password Strength:</span>
                          <span className="font-semibold text-white">{passStrength.label}</span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                          <div 
                            className={`h-full transition-all duration-300 ${passStrength.color}`} 
                            style={{ width: `${passStrength.score}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Confirm New Password</label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      placeholder="Re-enter new password"
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
                    />
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={passwordLoading}
                      className="w-full py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs transition-all flex items-center justify-center gap-2"
                    >
                      {passwordLoading ? 'Encrypting & Saving...' : 'Save New Password'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* TAB 3: ACTIVE SESSIONS */}
          {activeTab === 'sessions' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <div>
                  <h4 className="text-xs font-bold text-white">Active Device Sessions</h4>
                  <p className="text-[11px] text-slate-400">Manage authenticated tokens and multi-device access</p>
                </div>
                <button
                  onClick={handleLogoutOtherSessions}
                  className="px-3 py-1.5 rounded-lg border border-rose-500/30 bg-rose-950/40 hover:bg-rose-900/50 text-rose-300 text-xs font-medium flex items-center gap-1.5 transition-all"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Terminate Other Sessions</span>
                </button>
              </div>

              {sessionMsg && (
                <div className="p-3 rounded-xl bg-cyan-950/60 border border-cyan-500/40 text-xs text-cyan-300">
                  {sessionMsg}
                </div>
              )}

              {sessionsLoading ? (
                <div className="py-8 text-center text-xs text-slate-500 animate-pulse">
                  Loading active sessions...
                </div>
              ) : sessions.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-500">
                  No active session records found.
                </div>
              ) : (
                <div className="space-y-2.5">
                  {sessions.map((sess, idx) => (
                    <div 
                      key={idx}
                      className={`p-3.5 rounded-xl border flex items-center justify-between text-xs ${
                        sess.is_current 
                          ? 'bg-cyan-950/30 border-cyan-500/40 text-cyan-300' 
                          : 'bg-slate-900/40 border-slate-800 text-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${sess.is_current ? 'bg-cyan-500/20 text-cyan-400' : 'bg-slate-800 text-slate-400'}`}>
                          <Laptop className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-medium">{sess.session_id}</span>
                            {sess.is_current && (
                              <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-[10px] font-mono">Current Device</span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-500">
                            Logged in: {sess.created_at} &bull; Expires in {sess.expires_in_hours}h
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-900/60 border-t border-slate-800 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-1.5 text-[11px]">
            <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
            <span>Zero plaintext credential exposure &bull; Argon2id salted</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg border border-slate-700 hover:border-slate-600 bg-slate-800 text-slate-200 text-xs font-semibold"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
