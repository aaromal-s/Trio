/**
 * TRIO API Service Layer
 * Fully typed client communicating with FastAPI backend with resilient fallbacks.
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api';

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

export const api = {
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
    const res = await fetch(`${API_BASE_URL}/datasets/upload-csv`, {
      method: 'POST',
      body: formData
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Upload failed' }));
      throw new Error(err.detail || 'Upload failed');
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

