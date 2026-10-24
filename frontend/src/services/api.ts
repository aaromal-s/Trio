import {
  User, TelemetrySnapshot, OverviewSummary, Incident, RiskPrediction,
  ModelEvaluationMetrics, CopilotResponse, TopologyNode, TopologyEdge
} from '../types';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 
  (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1' 
    ? '/api/v1' 
    : 'http://localhost:8000/api/v1');

function getAuthHeader(): Record<string, string> {
  const token = localStorage.getItem('aegisops_token');
  return token ? { 'Authorization': `Bearer ${token}` } : {};
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const headers = {
    'Content-Type': 'application/json',
    ...getAuthHeader(),
    ...(options.headers || {}),
  };

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorDetail = 'Request failed';
    try {
      const errJson = await response.json();
      errorDetail = errJson.detail || errorDetail;
    } catch {
      errorDetail = `HTTP ${response.status}: ${response.statusText}`;
    }
    throw new Error(errorDetail);
  }

  return response.json();
}

export const api = {
  // Auth
  async login(email: string, password: string):Promise<{ access_token: string; user: User }> {
    const res = await request<{ access_token: string; user: User }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    localStorage.setItem('aegisops_token', res.access_token);
    return res;
  },

  async register(data: { email: string; password: string; full_name: string; role?: string; department?: string }): Promise<{ access_token: string; user: User }> {
    const res = await request<{ access_token: string; user: User }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data)
    });
    localStorage.setItem('aegisops_token', res.access_token);
    return res;
  },

  async getMe(): Promise<User> {
    return request<User>('/auth/me');
  },

  async updateProfile(data: Partial<User>): Promise<User> {
    return request<User>('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  },

  async changePassword(currentPassword: string, newPassword: string): Promise<{ status: string; message: string }> {
    return request('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ current_password: currentPassword, new_password: newPassword })
    });
  },

  async resetPassword(email: string): Promise<{ status: string; message: string }> {
    return request('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ email })
    });
  },

  logout() {
    localStorage.removeItem('aegisops_token');
  },

  // Telemetry
  async getLiveTelemetry(): Promise<TelemetrySnapshot[]> {
    return request<TelemetrySnapshot[]>('/telemetry/live');
  },

  async getTelemetryHistory(serviceName: string, points = 24): Promise<TelemetrySnapshot[]> {
    return request<TelemetrySnapshot[]>(`/telemetry/history/${serviceName}?points=${points}`);
  },

  async getOverview(): Promise<OverviewSummary> {
    return request<OverviewSummary>('/telemetry/overview');
  },

  // Predictions & ML
  async predictRisk(input: {
    service_name: string;
    cpu_utilization: number;
    memory_utilization: number;
    latency_ms: number;
    request_throughput: number;
    error_rate: number;
    disk_io_percent?: number;
    network_mbps?: number;
  }): Promise<RiskPrediction> {
    return request<RiskPrediction>('/predictions/predict', {
      method: 'POST',
      body: JSON.stringify(input)
    });
  },

  async getLatestPredictions(): Promise<RiskPrediction[]> {
    return request<RiskPrediction[]>('/predictions/latest');
  },

  async getModelEvaluation(): Promise<ModelEvaluationMetrics> {
    return request<ModelEvaluationMetrics>('/predictions/model-evaluation');
  },

  // Incidents
  async getIncidents(params: { status?: string; severity?: string; search?: string } = {}): Promise<Incident[]> {
    const query = new URLSearchParams();
    if (params.status && params.status !== 'ALL') query.set('status', params.status);
    if (params.severity && params.severity !== 'ALL') query.set('severity', params.severity);
    if (params.search) query.set('search', params.search);
    const qs = query.toString() ? `?${query.toString()}` : '';
    return request<Incident[]>(`/incidents/${qs}`);
  },

  async getIncidentById(id: number): Promise<Incident> {
    return request<Incident>(`/incidents/${id}`);
  },

  async approveIncident(id: number, action: 'APPROVE' | 'REJECT' | 'RESOLVE', reason?: string): Promise<Incident> {
    return request<Incident>(`/incidents/${id}/approve`, {
      method: 'POST',
      body: JSON.stringify({ action, rejection_reason: reason })
    });
  },

  // Copilot Investigation
  async investigate(input: {
    incident_id?: number;
    service_name: string;
    metrics_snapshot?: Record<string, number>;
    recent_logs?: string[];
    query?: string;
  }): Promise<CopilotResponse> {
    return request<CopilotResponse>('/copilot/investigate', {
      method: 'POST',
      body: JSON.stringify(input)
    });
  },

  // Topology
  async getTopology(): Promise<{ nodes: TopologyNode[]; edges: TopologyEdge[]; total_nodes: number; degraded_nodes_count: number }> {
    return request('/infrastructure/topology');
  },

  // Analytics
  async getTrends(): Promise<any> {
    return request('/analytics/trends');
  },

  async getExportData(): Promise<any> {
    return request('/analytics/export');
  },

  // Health
  async checkHealth(): Promise<{ status: string; version: string; database_connected: boolean; ml_model_ready: boolean }> {
    return request('/system/health');
  }
};
