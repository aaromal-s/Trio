from datetime import datetime
from typing import Optional, List, Dict
from pydantic import BaseModel, ConfigDict

class TelemetrySnapshot(BaseModel):
    id: Optional[int] = None
    timestamp: datetime
    service_name: str
    cpu_utilization: float
    memory_utilization: float
    latency_ms: float
    request_throughput: float
    error_rate: float
    disk_io_percent: float
    network_mbps: float
    is_anomaly: bool
    source: str = "telemetry_agent"

    model_config = ConfigDict(from_attributes=True)

class ServiceMetricsSummary(BaseModel):
    service_name: str
    status: str # "HEALTHY", "DEGRADED", "CRITICAL"
    current_cpu: float
    current_memory: float
    current_latency: float
    current_error_rate: float
    throughput_rps: float
    uptime_percentage: float
    last_updated: datetime
    active_incidents_count: int

class OverviewSummary(BaseModel):
    overall_health: str
    overall_health_score: float # 0 to 100
    active_incidents_p1: int
    active_incidents_total: int
    high_risk_services_count: int
    total_services_monitored: int
    anomaly_detection_rate: float
    mttr_minutes: float
    last_updated: datetime
