export interface User {
  id: number;
  email: string;
  full_name: string;
  role: string;
  department: string;
  is_active: boolean;
  notification_email: boolean;
  notification_slack: boolean;
  notification_sms: boolean;
  sound_alerts: boolean;
  auto_refresh_enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface TelemetrySnapshot {
  timestamp: string;
  service_name: string;
  cpu_utilization: number;
  memory_utilization: number;
  latency_ms: number;
  request_throughput: number;
  error_rate: number;
  disk_io_percent: number;
  network_mbps: number;
  is_anomaly: boolean;
  source: string;
  formatted_time?: string;
}

export interface OverviewSummary {
  overall_health: 'OPTIMAL' | 'OPERATIONAL' | 'DEGRADED';
  overall_health_score: number;
  active_incidents_p1: number;
  active_incidents_total: number;
  high_risk_services_count: number;
  total_services_monitored: number;
  anomaly_detection_rate: number;
  mttr_minutes: number;
  last_updated: string;
}

export interface Incident {
  id: number;
  title: string;
  service_name: string;
  severity: 'P1-Critical' | 'P2-High' | 'P3-Medium' | 'P4-Low';
  status: 'DETECTED' | 'INVESTIGATING' | 'MITIGATING' | 'RESOLVED';
  cpu_usage: number;
  memory_usage: number;
  latency_p99: number;
  error_rate: number;
  description: string;
  root_cause_candidate: string;
  approval_status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'EXECUTED';
  approved_by?: string | null;
  approved_at?: string | null;
  rejection_reason?: string | null;
  evidence_data?: Array<{
    category: 'FACT' | 'INFERENCE' | 'HYPOTHESIS';
    statement: string;
    confidence: number;
    data_source: string;
  }>;
  timeline_events?: Array<{
    timestamp: string;
    phase: string;
    message: string;
    author: string;
  }>;
  recommended_remediation?: {
    summary: string;
    risk_level: string;
    actions: Array<{
      step?: number;
      action: string;
      command?: string;
      requires_approval?: boolean;
    }>;
    rollback_procedure?: string;
  };
  execution_result?: {
    status: string;
    dispatched_at: string;
    execution_id: string;
    logs: string[];
  } | null;
  detected_at: string;
  resolved_at?: string | null;
}

export interface RiskPrediction {
  id?: number;
  service_name: string;
  risk_score: number;
  severity: 'CRITICAL' | 'HIGH' | 'ELEVATED' | 'NOMINAL';
  horizon_minutes: number;
  confidence: number;
  anomaly_detected: boolean;
  anomaly_score: number;
  feature_importances: Record<string, number>;
  telemetry_input: {
    cpu_utilization: number;
    memory_utilization: number;
    latency_ms: number;
    request_throughput: number;
    error_rate: number;
    disk_io_percent: number;
    network_mbps: number;
  };
  model_version: string;
  timestamp: string;
}

export interface ModelEvaluationMetrics {
  model_name: string;
  model_version: string;
  algorithm: string;
  accuracy: number;
  precision: number;
  recall: number;
  f1_score: number;
  roc_auc: number;
  pr_auc: number;
  false_positive_rate: number;
  false_negative_rate: number;
  confusion_matrix: {
    true_negatives: number;
    false_positives: number;
    false_negatives: number;
    true_positives: number;
  };
  baselines: {
    dummy_stratified: { accuracy: number; f1_score: number };
    heuristic_rule: { accuracy: number; f1_score: number };
  };
  evaluation_counts: {
    train_samples: number;
    val_samples: number;
    test_samples: number;
    total_samples: number;
  };
  feature_importances: Record<string, number>;
  dataset_metadata: {
    n_samples: number;
    incident_rate: number;
    dataset_provenance: string;
    generated_at: string;
  };
  evaluated_at: string;
  verified_truth: boolean;
}

export interface EvidenceItem {
  category: 'FACT' | 'INFERENCE' | 'HYPOTHESIS';
  statement: string;
  confidence: number;
  data_source: string;
}

export interface DiagnosticCheck {
  name: string;
  description: string;
  target: string;
  command_snippet: string;
  estimated_duration_sec: number;
}

export interface CopilotResponse {
  incident_id?: number | null;
  service_name: string;
  investigation_summary: string;
  evidence_breakdown: EvidenceItem[];
  candidate_root_causes: Array<{
    cause: string;
    probability: number;
    impact_surface: string[];
  }>;
  recommended_diagnostics: DiagnosticCheck[];
  proposed_remediation: {
    summary: string;
    actions: Array<{
      action_id: string;
      type: string;
      description: string;
      risk_level: string;
      estimated_impact: string;
    }>;
    risk_level: string;
    requires_human_approval: boolean;
    rollback_procedure: string;
  };
  confidence_limitations: string;
  timestamp: string;
}

export interface TopologyNode {
  id: string;
  label: string;
  type: 'gateway' | 'service' | 'worker' | 'database' | 'cache' | 'eventbus';
  status: 'HEALTHY' | 'WARNING' | 'DEGRADED';
  tier: string;
  rps?: number;
  latency_ms?: number;
  cpu?: number;
  mem?: number;
  connections?: number;
  iops?: number;
  hit_rate?: number;
}

export interface TopologyEdge {
  from: string;
  to: string;
  protocol: string;
  healthy: boolean;
  highlight?: boolean;
}
