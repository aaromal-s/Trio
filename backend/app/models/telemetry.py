from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime
from app.core.database import Base

class TelemetryRecord(Base):
    __tablename__ = "telemetry_records"

    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime, default=lambda: datetime.now(timezone.utc), index=True)
    service_name = Column(String, index=True, nullable=False)
    
    cpu_utilization = Column(Float, nullable=False) # percentage (0 - 100)
    memory_utilization = Column(Float, nullable=False) # percentage (0 - 100)
    latency_ms = Column(Float, nullable=False) # p95/p99 milliseconds
    request_throughput = Column(Float, nullable=False) # requests per second (RPS)
    error_rate = Column(Float, nullable=False) # percentage (0 - 100)
    disk_io_percent = Column(Float, default=25.0)
    network_mbps = Column(Float, default=120.0)
    
    is_anomaly = Column(Boolean, default=False)
    source = Column(String, default="prometheus_agent")
