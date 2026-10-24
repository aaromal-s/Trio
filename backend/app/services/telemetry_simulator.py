import random
import math
from datetime import datetime, timezone, timedelta
from typing import List, Dict, Any
from sqlalchemy.orm import Session
from app.models.telemetry import TelemetryRecord

SERVICES = [
    {"name": "api-gateway", "base_cpu": 32.0, "base_mem": 48.0, "base_lat": 28.0, "base_rps": 1850.0, "base_err": 0.04},
    {"name": "auth-service", "base_cpu": 24.0, "base_mem": 42.0, "base_lat": 18.0, "base_rps": 920.0, "base_err": 0.02},
    {"name": "payment-processor", "base_cpu": 82.0, "base_mem": 91.5, "base_lat": 640.0, "base_rps": 480.0, "base_err": 4.8, "degraded": True},
    {"name": "order-service", "base_cpu": 68.0, "base_mem": 64.0, "base_lat": 310.0, "base_rps": 650.0, "base_err": 1.9, "warning": True},
    {"name": "inventory-service", "base_cpu": 28.0, "base_mem": 38.0, "base_lat": 22.0, "base_rps": 520.0, "base_err": 0.01},
    {"name": "search-indexer", "base_cpu": 54.0, "base_mem": 62.0, "base_lat": 75.0, "base_rps": 380.0, "base_err": 0.08},
    {"name": "recommendation-engine", "base_cpu": 45.0, "base_mem": 58.0, "base_lat": 95.0, "base_rps": 290.0, "base_err": 0.05},
    {"name": "notification-worker", "base_cpu": 18.0, "base_mem": 35.0, "base_lat": 15.0, "base_rps": 180.0, "base_err": 0.01},
]

def generate_current_telemetry_snapshot(service_info: Dict[str, Any], current_time: datetime) -> Dict[str, Any]:
    # Subtle sinusoidal variation + realistic noise
    minute = current_time.minute + (current_time.second / 60.0)
    cycle = math.sin(minute * 0.15)
    
    is_degraded = service_info.get("degraded", False)
    is_warning = service_info.get("warning", False)
    
    if is_degraded:
        # High CPU/Mem and latency spikes
        cpu = min(99.4, service_info["base_cpu"] + random.uniform(-3.0, 6.0) + (cycle * 2.0))
        mem = min(98.8, service_info["base_mem"] + random.uniform(-1.0, 3.0))
        lat = max(200.0, service_info["base_lat"] + random.uniform(-40.0, 90.0))
        rps = max(100.0, service_info["base_rps"] + random.uniform(-30.0, 40.0))
        err = max(1.5, service_info["base_err"] + random.uniform(-0.5, 1.8))
        dio = min(98.0, 78.0 + random.uniform(-5.0, 10.0))
        net = min(800.0, 320.0 + random.uniform(-30.0, 50.0))
        is_anomaly = True
    elif is_warning:
        cpu = min(85.0, service_info["base_cpu"] + random.uniform(-4.0, 7.0))
        mem = min(75.0, service_info["base_mem"] + random.uniform(-2.0, 4.0))
        lat = max(80.0, service_info["base_lat"] + random.uniform(-20.0, 45.0))
        rps = max(200.0, service_info["base_rps"] + random.uniform(-40.0, 60.0))
        err = max(0.5, service_info["base_err"] + random.uniform(-0.2, 0.8))
        dio = min(70.0, 45.0 + random.uniform(-4.0, 8.0))
        net = min(600.0, 240.0 + random.uniform(-20.0, 40.0))
        is_anomaly = random.random() < 0.25
    else:
        cpu = max(5.0, min(70.0, service_info["base_cpu"] + (cycle * 5.0) + random.uniform(-3.0, 3.0)))
        mem = max(15.0, min(72.0, service_info["base_mem"] + random.uniform(-1.5, 1.5)))
        lat = max(8.0, min(120.0, service_info["base_lat"] + random.uniform(-4.0, 6.0)))
        rps = max(50.0, service_info["base_rps"] + (cycle * 50.0) + random.uniform(-20.0, 20.0))
        err = max(0.0, min(1.0, service_info["base_err"] + random.uniform(-0.01, 0.02)))
        dio = max(5.0, min(45.0, 22.0 + random.uniform(-3.0, 4.0)))
        net = max(10.0, min(350.0, 140.0 + random.uniform(-15.0, 20.0)))
        is_anomaly = False

    return {
        "timestamp": current_time.isoformat(),
        "service_name": service_info["name"],
        "cpu_utilization": round(cpu, 2),
        "memory_utilization": round(mem, 2),
        "latency_ms": round(lat, 2),
        "request_throughput": round(rps, 1),
        "error_rate": round(err, 3),
        "disk_io_percent": round(dio, 1),
        "network_mbps": round(net, 1),
        "is_anomaly": is_anomaly,
        "source": "prometheus_agent_v2"
    }

def get_all_services_telemetry(db: Session = None) -> List[Dict[str, Any]]:
    now = datetime.now(timezone.utc)
    snapshots = [generate_current_telemetry_snapshot(s, now) for s in SERVICES]
    
    # Optionally persist latest snapshots into DB if available
    if db:
        try:
            for s in snapshots:
                rec = TelemetryRecord(
                    timestamp=now,
                    service_name=s["service_name"],
                    cpu_utilization=s["cpu_utilization"],
                    memory_utilization=s["memory_utilization"],
                    latency_ms=s["latency_ms"],
                    request_throughput=s["request_throughput"],
                    error_rate=s["error_rate"],
                    disk_io_percent=s["disk_io_percent"],
                    network_mbps=s["network_mbps"],
                    is_anomaly=s["is_anomaly"],
                    source=s["source"]
                )
                db.add(rec)
            db.commit()
        except Exception:
            db.rollback()
            
    return snapshots

def get_telemetry_history(service_name: str, points: int = 24) -> List[Dict[str, Any]]:
    """
    Returns time-series history of telemetry for charts (last 2 hours at 5m points).
    """
    srv = next((s for s in SERVICES if s["name"] == service_name), SERVICES[0])
    now = datetime.now(timezone.utc)
    history = []
    
    for i in range(points - 1, -1, -1):
        t = now - timedelta(minutes=i * 5)
        snap = generate_current_telemetry_snapshot(srv, t)
        snap["formatted_time"] = t.strftime("%H:%M:%S")
        history.append(snap)
        
    return history
