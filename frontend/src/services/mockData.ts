import { OverviewData, DatasetInfo, ModelStatus, DiscoveryCandidateItem, BenchmarkMetric } from './api';

export const mockOverviewData: OverviewData = {
  kpis: {
    observations_processed: 1500,
    known_operational_states: 3,
    unknown_candidates: 2,
    confirmed_discoveries: 1
  },
  state_distribution: [
    { name: "KNOWN_STATE_A (Normal Inflow)", count: 520 },
    { name: "KNOWN_STATE_B (High Dosing)", count: 480 },
    { name: "KNOWN_STATE_C (Filtration)", count: 280 },
    { name: "CONTRADICTION_FLAGGED (Novel)", count: 220 }
  ],
  contradiction_trend: Array.from({ length: 60 }, (_, i) => {
    const isUnk = i >= 40 && i <= 52;
    return {
      index: i * 25,
      timestamp: `12:${String(Math.floor(i / 2)).padStart(2, '0')}:${String((i % 2) * 30).padStart(2, '0')}`,
      contradiction_score: isUnk ? 0.78 + Math.random() * 0.12 : 0.18 + Math.random() * 0.15,
      distance_score: isUnk ? 0.82 : 0.15,
      temporal_score: isUnk ? 0.65 : 0.12,
      anomaly_score: isUnk ? 0.88 : 0.22,
      assigned_state: isUnk ? "CONTRADICTION_FLAGGED" : "KNOWN_STATE_A"
    };
  }),
  sensor_trends: Array.from({ length: 40 }, (_, i) => {
    const isUnk = i >= 26 && i <= 34;
    return {
      timestamp: `12:${String(Math.floor(i * 1.5)).padStart(2, '0')}:00`,
      FIT101: isUnk ? 1.35 : 2.5 + Math.sin(i * 0.4) * 0.3,
      DPIT301: isUnk ? 0.48 : 0.25 + Math.sin(i * 0.5) * 0.02,
      FIT201: isUnk ? 2.05 : 1.0 + Math.cos(i * 0.3) * 0.15,
      AIT202: isUnk ? 6.85 : 7.3 + Math.sin(i * 0.2) * 0.1,
      LIT101: 800 + Math.cos(i * 0.2) * 120
    };
  }),
  tri_memory_activity: {
    stm_utilization: 100,
    ltm_prototypes: 3,
    cm_accumulated: 185,
    cm_average_score: 0.74
  },
  recent_discoveries: [
    {
      candidate_id: "CAND-2026-001",
      first_detected: "2026-11-08T12:28:45",
      last_detected: "2026-11-08T12:45:10",
      observation_count: 198,
      mean_contradiction_score: 0.8142,
      cluster_density: 1.48,
      status: "Confirmed",
      explanation: "Persistent DPIT301 differential pressure surge (+88% std) combined with severe FIT101 flow drop (-42% std) over 198 consecutive timesteps."
    }
  ],
  system_health: {
    status: "ONLINE",
    cpu_usage: 12.8,
    memory_mb: 184.2,
    api_latency_ms: 11.5,
    inference_engine: "TRIO Unsupervised Core",
    last_updated: Date.now() / 1000
  },
  dataset_name: "Synthetic Industrial Water Treatment (SWaT-Sim)",
  is_simulated: true
};

export const mockDatasetInfo: DatasetInfo = {
  dataset_name: "Synthetic Industrial Water Treatment (SWaT-Sim)",
  is_simulated: true,
  disclaimer: "SIMULATED DEMO DATA — NOT REAL FACTORY DATA",
  validation: {
    row_count: 1500,
    column_count: 12,
    total_missing: 0,
    missing_per_column: { FIT101: 0, LIT101: 0, DPIT301: 0, FIT201: 0, AIT202: 0, AIT402: 0 },
    numeric_columns: ["FIT101", "LIT101", "MV101", "P101", "DPIT301", "FIT201", "AIT202", "AIT402"],
    timestamp_column: "timestamp",
    all_columns: ["timestamp", "FIT101", "LIT101", "MV101", "P101", "DPIT301", "FIT201", "AIT202", "AIT402", "ground_truth_state", "is_unknown", "is_anomaly"],
    is_valid: true
  },
  selected_features: ["FIT101", "LIT101", "DPIT301", "FIT201", "AIT202", "AIT402"],
  actuator_features: ["MV101", "P101"],
  last_updated: Date.now() / 1000
};

export const mockModelStatus: ModelStatus = {
  is_trained: true,
  model_version: "v20261108.1200",
  weights: {
    alpha: 0.45,
    beta: 0.30,
    gamma: 0.25
  },
  contradiction_threshold: 0.48,
  selected_features: ["FIT101", "LIT101", "DPIT301", "FIT201", "AIT202", "AIT402"],
  ltm_prototypes_count: 3,
  candidates_count: 2,
  dataset_name: "Synthetic Industrial Water Treatment (SWaT-Sim)"
};

export const mockDiscoveries: DiscoveryCandidateItem[] = [
  {
    candidate_id: "CAND-2026-001",
    first_detected: "2026-11-08T08:52:30",
    last_detected: "2026-11-08T09:08:45",
    observation_count: 198,
    mean_contradiction_score: 0.8245,
    cluster_density: 1.54,
    status: "Confirmed",
    explanation: "TRIO detected 198 sustained observations forming a dense cluster (density 1.54). Key sensor shifts: DPIT301 (+2.45 std), FIT201 (+1.82 std), FIT101 (-2.10 std). Characteristic of stage-2 secondary pump cavitation and filter blockage.",
    feature_deltas: {
      DPIT301: 2.45,
      FIT201: 1.82,
      AIT402: 1.34,
      FIT101: -2.10,
      AIT202: -0.68,
      LIT101: -0.25
    },
    prototype_vector: {
      FIT101: 1.35,
      LIT101: 785.4,
      DPIT301: 0.48,
      FIT201: 2.05,
      AIT202: 6.85,
      AIT402: 338.2
    }
  },
  {
    candidate_id: "CAND-2026-002",
    first_detected: "2026-11-08T08:18:10",
    last_detected: "2026-11-08T08:24:20",
    observation_count: 24,
    mean_contradiction_score: 0.6312,
    cluster_density: 0.92,
    status: "Under Validation",
    explanation: "TRIO identified 24 coherent observations showing moderate drift in conductivity (AIT402) and chemical feed (FIT201). Currently accumulating evidence across successive sliding windows.",
    feature_deltas: {
      AIT402: 0.88,
      FIT201: 0.74,
      DPIT301: 0.32,
      FIT101: -0.42,
      AIT202: 0.15,
      LIT101: 0.08
    },
    prototype_vector: {
      FIT101: 2.12,
      LIT101: 820.0,
      DPIT301: 0.28,
      FIT201: 1.45,
      AIT202: 7.22,
      AIT402: 295.0
    }
  }
];

export const mockBenchmarks: BenchmarkMetric[] = [
  {
    model_name: "TRIO (Proposed)",
    ari: 0.8842,
    nmi: 0.8265,
    precision: 0.9412,
    recall: 0.9650,
    f1_score: 0.9529,
    false_discovery_rate: 0.0588,
    detection_delay_timesteps: 4,
    runtime_ms: 18.4,
    true_positives: 193,
    false_positives: 12
  },
  {
    model_name: "K-Means",
    ari: 0.5410,
    nmi: 0.5120,
    precision: 0.6250,
    recall: 0.7500,
    f1_score: 0.6818,
    false_discovery_rate: 0.3750,
    detection_delay_timesteps: 16,
    runtime_ms: 14.2,
    true_positives: 150,
    false_positives: 90
  },
  {
    model_name: "DBSCAN",
    ari: 0.6925,
    nmi: 0.6480,
    precision: 0.7840,
    recall: 0.8400,
    f1_score: 0.8110,
    false_discovery_rate: 0.2160,
    detection_delay_timesteps: 12,
    runtime_ms: 45.6,
    true_positives: 168,
    false_positives: 46
  },
  {
    model_name: "Isolation Forest",
    ari: 0.6150,
    nmi: 0.5820,
    precision: 0.7120,
    recall: 0.8850,
    f1_score: 0.7891,
    false_discovery_rate: 0.2880,
    detection_delay_timesteps: 8,
    runtime_ms: 22.8,
    true_positives: 177,
    false_positives: 72
  }
];

