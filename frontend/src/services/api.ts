/**
 * TRIO API Service Layer
 * Fully typed client communicating with FastAPI backend with resilient fallbacks.
 */

/**
 * TRIO API Base URL Resolution:
 * Reads VITE_API_BASE_URL (standard) with fallback to VITE_API_URL.
 * Normalizes trailing slashes and ensures the mandatory '/api' prefix is present.
 */
function resolveApiBaseUrl(): string {
  const envUrl = (
    import.meta.env.VITE_API_BASE_URL ||
    import.meta.env.VITE_API_URL ||
    '/api'
  ).trim();

  if (envUrl === '/api') return '/api';

  const stripped = envUrl.replace(/\/+$/, '');
  if (!stripped.endsWith('/api')) {
    return `${stripped}/api`;
  }
  return stripped;
}

export const API_BASE_URL = resolveApiBaseUrl();

export interface OverviewData {
  kpis: {
    observations_processed: number;
    known_operational_states: number;
    unknown_candidates: number;
    confirmed_discoveries: number;
  };
  state_distribution: Array<{ name: string; count: number }>;
  contradiction_trend: Array<{
    index: number;
    timestamp: string;
    contradiction_score: number;
    distance_score: number;
    temporal_score: number;
    anomaly_score: number;
    assigned_state: string;
  }>;
  sensor_trends: Array<{
    timestamp: string;
    FIT101: number;
    DPIT301: number;
    FIT201: number;
    AIT202: number;
    LIT101: number;
  }>;
  tri_memory_activity: {
    stm_utilization: number;
    ltm_prototypes: number;
    cm_accumulated: number;
    cm_average_score: number;
  };
  recent_discoveries: any[];
  system_health: {
    status: string;
    cpu_usage: number;
    memory_mb: number;
    api_latency_ms: number;
    inference_engine: string;
    last_updated: number;
  };
  dataset_name: string;
  is_simulated: boolean;
}

export interface DatasetInfo {
  dataset_name: string;
  is_simulated: boolean;
  disclaimer: string;
  validation: {
    row_count: number;
    column_count: number;
    total_missing: number;
    missing_per_column: Record<string, number>;
    numeric_columns: string[];
    timestamp_column: string | null;
    all_columns: string[];
    is_valid: boolean;
  };
  selected_features: string[];
  actuator_features: string[];
  last_updated: number;
}

export interface ModelStatus {
  is_trained: boolean;
  model_version: string;
  weights: {
    alpha: number;
    beta: number;
    gamma: number;
  };
  contradiction_threshold: number;
  selected_features: string[];
  ltm_prototypes_count: number;
  candidates_count: number;
  dataset_name: string;
}

export interface DiscoveryCandidateItem {
  candidate_id: string;
  first_detected: string;
  last_detected: string;
  observation_count: number;
  mean_contradiction_score: number;
  cluster_density: number;
  status: 'Pending' | 'Under Validation' | 'Confirmed' | 'Rejected';
  explanation: string;
  feature_deltas: Record<string, number>;
  prototype_vector: Record<string, number>;
}

export interface BenchmarkMetric {
  model_name: string;
  ari: number;
  nmi: number;
  precision: number;
  recall: number;
  f1_score: number;
  false_discovery_rate: number;
  detection_delay_timesteps: number;
  runtime_ms: number;
  true_positives: number;
  false_positives: number;
}

export interface UserProfile {
  id: string;
  user_id: string;
  name: string;
  email: string;
  role: string;
  affiliation: string;
  avatar_url?: string;
  account_type?: string;
  account_status?: string;
  force_password_change?: boolean;
  created_at?: string;
}

export interface ActiveSession {
  session_id: string;
  created_at: string;
  expires_in_hours: number;
  is_current: boolean;
}

export const api = {
  // Authentication & Profile
  async login(userId: string, password: string): Promise<{ access_token: string; force_password_change?: boolean; user: UserProfile }> {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: userId, password })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Authentication failed' }));
      throw new Error(err.detail || 'Authentication failed');
    }
    return res.json();
  },

  async register(data: { user_id: string; name: string; email: string; password: string; role?: string; affiliation?: string }): Promise<any> {
    const res = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Registration failed' }));
      throw new Error(err.detail || 'Registration failed');
    }
    return res.json();
  },

  async getProfile(emailOrUserId?: string): Promise<UserProfile> {
    const url = emailOrUserId ? `${API_BASE_URL}/auth/profile?user_id=${encodeURIComponent(emailOrUserId)}` : `${API_BASE_URL}/auth/profile`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch profile');
    return res.json();
  },

  async updateProfile(data: { name: string; affiliation: string; role?: string; email?: string; avatar_url?: string }, emailOrUserId?: string): Promise<any> {
    const url = emailOrUserId ? `${API_BASE_URL}/auth/profile?user_id=${encodeURIComponent(emailOrUserId)}` : `${API_BASE_URL}/auth/profile`;
    const res = await fetch(url, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Failed to update profile' }));
      throw new Error(err.detail || 'Failed to update profile');
    }
    return res.json();
  },

  async updateAvatar(avatarUrl: string, userId?: string): Promise<any> {
    const url = userId ? `${API_BASE_URL}/auth/avatar?user_id=${encodeURIComponent(userId)}` : `${API_BASE_URL}/auth/avatar`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ avatar_url: avatarUrl })
    });
    if (!res.ok) throw new Error('Failed to update avatar');
    return res.json();
  },

  async getSessions(userId?: string): Promise<{ sessions: ActiveSession[]; total_active: number }> {
    const url = userId ? `${API_BASE_URL}/auth/sessions?user_id=${encodeURIComponent(userId)}` : `${API_BASE_URL}/auth/sessions`;
    const token = localStorage.getItem('trio_token') || '';
    const res = await fetch(url, {
      headers: token ? { 'Authorization': `Bearer ${token}` } : {}
    });
    if (!res.ok) throw new Error('Failed to fetch active sessions');
    return res.json();
  },

  async logoutOtherSessions(userId?: string): Promise<any> {
    const url = userId ? `${API_BASE_URL}/auth/logout-other-sessions?user_id=${encodeURIComponent(userId)}` : `${API_BASE_URL}/auth/logout-other-sessions`;
    const token = localStorage.getItem('trio_token') || '';
    const res = await fetch(url, {
      method: 'POST',
      headers: token ? { 'Authorization': `Bearer ${token}` } : {}
    });
    if (!res.ok) throw new Error('Failed to terminate other sessions');
    return res.json();
  },

  async testConnection(): Promise<{ ok: boolean; latencyMs: number; status: string; service: string }> {
    const t0 = performance.now();
    try {
      const res = await fetch(`${API_BASE_URL}/health`, { cache: 'no-cache' });
      const latencyMs = Math.round(performance.now() - t0);
      if (res.ok) {
        const data = await res.json();
        return { ok: true, latencyMs, status: data.status || 'healthy', service: data.service || 'TRIO' };
      }
      return { ok: false, latencyMs, status: `HTTP ${res.status}`, service: 'TRIO' };
    } catch {
      const latencyMs = Math.round(performance.now() - t0);
      return { ok: false, latencyMs, status: 'Connection Refused', service: 'Unavailable' };
    }
  },

  async changePassword(currentPassword: string, newPassword: string, email?: string): Promise<any> {
    const url = email ? `${API_BASE_URL}/auth/change-password?email=${encodeURIComponent(email)}` : `${API_BASE_URL}/auth/change-password`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ current_password: currentPassword, new_password: newPassword })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Failed to change password' }));
      throw new Error(err.detail || 'Failed to change password');
    }
    return res.json();
  },

  async forgotPassword(email: string): Promise<{ status: string; message: string; reset_token?: string }> {
    const res = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    if (!res.ok) throw new Error('Failed to request password recovery');
    return res.json();
  },

  async resetPassword(resetToken: string, newPassword: string): Promise<any> {
    const res = await fetch(`${API_BASE_URL}/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reset_token: resetToken, new_password: newPassword })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Failed to reset password' }));
      throw new Error(err.detail || 'Failed to reset password');
    }
    return res.json();
  },

  // Dashboard & Metrics
  async getOverview(): Promise<OverviewData> {
    const res = await fetch(`${API_BASE_URL}/dashboard/overview`);
    if (!res.ok) throw new Error('Failed to fetch dashboard overview');
    return res.json();
  },

  async getCurrentDataset(): Promise<DatasetInfo> {
    const res = await fetch(`${API_BASE_URL}/datasets/current`);
    if (!res.ok) throw new Error('Failed to fetch dataset info');
    return res.json();
  },

  async getDatasetPreview(limit = 20): Promise<{ total_rows: number; columns: string[]; preview_rows: any[] }> {
    const res = await fetch(`${API_BASE_URL}/datasets/preview?limit=${limit}`);
    if (!res.ok) throw new Error('Failed to fetch dataset preview');
    return res.json();
  },

  async generateSynthetic(nSamples = 1500, seed = 42): Promise<any> {
    const res = await fetch(`${API_BASE_URL}/datasets/generate-synthetic`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ n_samples: nSamples, seed })
    });
    if (!res.ok) throw new Error('Failed to generate synthetic dataset');
    return res.json();
  },

  async uploadCSV(file: File): Promise<any> {
    const formData = new FormData();
    formData.append('file', file);

    const headers: Record<string, string> = {};
    const token = typeof localStorage !== 'undefined'
      ? (localStorage.getItem('trio_token') || localStorage.getItem('token'))
      : null;
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    let res: Response;
    try {
      res = await fetch(`${API_BASE_URL}/datasets/upload-csv`, {
        method: 'POST',
        headers,
        body: formData
      });
    } catch (netErr: any) {
      const isFetchErr = netErr?.name === 'TypeError' || String(netErr?.message || '').toLowerCase().includes('fetch');
      if (isFetchErr) {
        throw new Error(`Unable to connect to TRIO backend at ${API_BASE_URL}. Ensure the backend server is running and accessible.`);
      }
      throw netErr;
    }

    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Upload failed' }));
      const message = typeof err.detail === 'string' 
        ? err.detail 
        : (err.detail?.message || 'Upload failed');
      const errorObj: any = new Error(message);
      if (typeof err.detail === 'object' && err.detail?.diagnostics) {
        errorObj.diagnostics = err.detail.diagnostics;
      }
      throw errorObj;
    }
    return res.json();
  },

  async getSwatInfo(): Promise<any> {
    const res = await fetch(`${API_BASE_URL}/datasets/swat-info`);
    if (!res.ok) throw new Error('Failed to fetch SWaT info');
    return res.json();
  },

  async getModelStatus(): Promise<ModelStatus> {
    const res = await fetch(`${API_BASE_URL}/models/status`);
    if (!res.ok) throw new Error('Failed to fetch model status');
    return res.json();
  },

  async trainModel(params: {
    algorithm?: string;
    feature_cols?: string[];
    train_ratio?: number;
    alpha?: number;
    beta?: number;
    gamma?: number;
    contradiction_threshold?: number;
  }): Promise<any> {
    const res = await fetch(`${API_BASE_URL}/models/train`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Training failed' }));
      throw new Error(err.detail || 'Training failed');
    }
    return res.json();
  },

  async getTrainingHistory(): Promise<{ history: any[] }> {
    const res = await fetch(`${API_BASE_URL}/models/history`);
    if (!res.ok) throw new Error('Failed to fetch training history');
    return res.json();
  },

  async getMemoryStatus(): Promise<any> {
    const res = await fetch(`${API_BASE_URL}/memory/status`);
    if (!res.ok) throw new Error('Failed to fetch memory status');
    return res.json();
  },

  async getStmDetails(): Promise<any> {
    const res = await fetch(`${API_BASE_URL}/memory/stm`);
    if (!res.ok) throw new Error('Failed to fetch STM details');
    return res.json();
  },

  async getLtmDetails(): Promise<any> {
    const res = await fetch(`${API_BASE_URL}/memory/ltm`);
    if (!res.ok) throw new Error('Failed to fetch LTM details');
    return res.json();
  },

  async getCmDetails(limit = 25): Promise<any> {
    const res = await fetch(`${API_BASE_URL}/memory/cm?limit=${limit}`);
    if (!res.ok) throw new Error('Failed to fetch CM details');
    return res.json();
  },

  async getDiscoveries(): Promise<{ counts: any; candidates: DiscoveryCandidateItem[]; explanation: string }> {
    const res = await fetch(`${API_BASE_URL}/discoveries`);
    if (!res.ok) throw new Error('Failed to fetch discoveries');
    return res.json();
  },

  async updateCandidateStatus(candidateId: string, status: string): Promise<any> {
    const res = await fetch(`${API_BASE_URL}/discoveries/${candidateId}/status`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    if (!res.ok) throw new Error('Failed to update candidate status');
    return res.json();
  },

  async getEvaluationBenchmark(): Promise<{ dataset_name: string; is_simulated: boolean; metrics: BenchmarkMetric[]; explanation: any }> {
    const res = await fetch(`${API_BASE_URL}/evaluation/benchmark`);
    if (!res.ok) throw new Error('Failed to fetch evaluation benchmark');
    return res.json();
  },

  getExportCsvUrl(): string {
    return `${API_BASE_URL}/evaluation/export-csv`;
  }
};
