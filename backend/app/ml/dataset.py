import numpy as np
from datetime import datetime, timedelta, timezone
from typing import Tuple, Dict, Any

def generate_telemetry_dataset(
    n_samples: int = 5000, 
    incident_ratio: float = 0.16, 
    random_seed: int = 42
) -> Tuple[np.ndarray, np.ndarray, list, Dict[str, Any]]:
    """
    Generates a reproducible, high-fidelity operational telemetry dataset for SRE incident prediction.
    Features:
    0: cpu_utilization (%) [0-100]
    1: memory_utilization (%) [0-100]
    2: latency_p99_ms [10-5000]
    3: request_throughput_rps [50-4000]
    4: error_rate_percent [0-100]
    5: disk_io_percent [0-100]
    6: network_mbps [10-1000]
    7: cpu_latency_interaction (derived)
    8: error_throughput_ratio (derived)
    9: resource_strain_index (derived)
    """
    rng = np.random.RandomState(random_seed)
    
    n_incidents = int(n_samples * incident_ratio)
    n_nominal = n_samples - n_incidents
    
    # --- 1. Nominal Operational Samples with boundary overlap ---
    # In real systems, normal traffic occasionally has batch bursts (e.g. cron jobs causing high CPU or disk without incident)
    cpu_nom = rng.normal(loc=44.0, scale=18.0, size=n_nominal).clip(5.0, 96.0)
    mem_nom = rng.normal(loc=55.0, scale=14.0, size=n_nominal).clip(15.0, 92.0)
    lat_nom = rng.exponential(scale=55.0, size=n_nominal).clip(8.0, 850.0) + 15.0
    rps_nom = rng.normal(loc=950.0, scale=350.0, size=n_nominal).clip(100.0, 3800.0)
    err_nom = rng.exponential(scale=0.35, size=n_nominal).clip(0.0, 4.5)
    dio_nom = rng.normal(loc=30.0, scale=16.0, size=n_nominal).clip(2.0, 90.0)
    net_nom = rng.normal(loc=220.0, scale=90.0, size=n_nominal).clip(20.0, 850.0)
    y_nom = np.zeros(n_nominal, dtype=int)
    
    # --- 2. Incident Samples with subtle early degradation and overlap ---
    nA = int(n_incidents * 0.35)
    nB = int(n_incidents * 0.35)
    nC = n_incidents - nA - nB
    
    # Mode A (Memory Leak / Thrashing)
    cpu_A = rng.normal(loc=78.0, scale=12.0, size=nA).clip(45.0, 99.5)
    mem_A = rng.normal(loc=89.0, scale=7.0, size=nA).clip(68.0, 99.8)
    lat_A = rng.normal(loc=520.0, scale=240.0, size=nA).clip(120.0, 2200.0)
    rps_A = rng.normal(loc=720.0, scale=250.0, size=nA).clip(100.0, 1800.0)
    err_A = rng.normal(loc=3.8, scale=2.5, size=nA).clip(0.5, 20.0)
    dio_A = rng.normal(loc=75.0, scale=15.0, size=nA).clip(30.0, 99.0)
    net_A = rng.normal(loc=220.0, scale=90.0, size=nA).clip(40.0, 700.0)
    
    # Mode B (Thread Pool & Latency Cascade)
    cpu_B = rng.normal(loc=88.0, scale=8.0, size=nB).clip(60.0, 99.9)
    mem_B = rng.normal(loc=72.0, scale=14.0, size=nB).clip(40.0, 95.0)
    lat_B = rng.normal(loc=1100.0, scale=400.0, size=nB).clip(300.0, 4200.0)
    rps_B = rng.normal(loc=2100.0, scale=600.0, size=nB).clip(800.0, 4000.0)
    err_B = rng.normal(loc=6.5, scale=4.0, size=nB).clip(1.2, 35.0)
    dio_B = rng.normal(loc=52.0, scale=20.0, size=nB).clip(15.0, 92.0)
    net_B = rng.normal(loc=680.0, scale=180.0, size=nB).clip(250.0, 990.0)
    
    # Mode C (Service Error / Cascading Timeouts)
    cpu_C = rng.normal(loc=58.0, scale=20.0, size=nC).clip(20.0, 95.0)
    mem_C = rng.normal(loc=64.0, scale=16.0, size=nC).clip(25.0, 92.0)
    lat_C = rng.normal(loc=650.0, scale=280.0, size=nC).clip(180.0, 2900.0)
    rps_C = rng.normal(loc=1050.0, scale=450.0, size=nC).clip(150.0, 2800.0)
    err_C = rng.normal(loc=18.0, scale=8.0, size=nC).clip(4.0, 65.0)
    dio_C = rng.normal(loc=40.0, scale=18.0, size=nC).clip(10.0, 85.0)
    net_C = rng.normal(loc=230.0, scale=90.0, size=nC).clip(40.0, 650.0)
    
    cpu_inc = np.concatenate([cpu_A, cpu_B, cpu_C])
    mem_inc = np.concatenate([mem_A, mem_B, mem_C])
    lat_inc = np.concatenate([lat_A, lat_B, lat_C])
    rps_inc = np.concatenate([rps_A, rps_B, rps_C])
    err_inc = np.concatenate([err_A, err_B, err_C])
    dio_inc = np.concatenate([dio_A, dio_B, dio_C])
    net_inc = np.concatenate([net_A, net_B, net_C])
    y_inc = np.ones(n_incidents, dtype=int)
    
    # Combine
    cpu = np.concatenate([cpu_nom, cpu_inc])
    mem = np.concatenate([mem_nom, mem_inc])
    lat = np.concatenate([lat_nom, lat_inc])
    rps = np.concatenate([rps_nom, rps_inc])
    err = np.concatenate([err_nom, err_inc])
    dio = np.concatenate([dio_nom, dio_inc])
    net = np.concatenate([net_nom, net_inc])
    y = np.concatenate([y_nom, y_inc])
    
    # Add subtle stochastic noise on measurement sensors (+/- 3%)
    noise = rng.normal(0, 1.0, size=n_samples)
    cpu = (cpu + noise * 0.8).clip(0.0, 100.0)
    mem = (mem + noise * 0.6).clip(0.0, 100.0)
    lat = (lat + noise * 2.5).clip(5.0, 5000.0)
    err = (err + (noise * 0.05)).clip(0.0, 100.0)
    
    # Feature Engineering (interaction terms)
    cpu_lat = (cpu * (lat / 100.0)).clip(0.0, 5000.0)
    err_rps = ((err / 100.0) * rps).clip(0.0, 2000.0)
    strain = ((cpu * 0.4) + (mem * 0.4) + (dio * 0.2)).clip(0.0, 100.0)
    
    X = np.column_stack([
        cpu, mem, lat, rps, err, dio, net,
        cpu_lat, err_rps, strain
    ])
    
    feature_names = [
        "cpu_utilization",
        "memory_utilization",
        "latency_p99_ms",
        "request_throughput_rps",
        "error_rate_percent",
        "disk_io_percent",
        "network_mbps",
        "cpu_latency_interaction",
        "error_throughput_impact",
        "resource_strain_index"
    ]
    
    # Shuffle synchronously with seed
    indices = np.arange(n_samples)
    rng.shuffle(indices)
    X = X[indices]
    y = y[indices]
    
    metadata = {
        "n_samples": n_samples,
        "n_incidents": n_incidents,
        "n_nominal": n_nominal,
        "incident_rate": float(n_incidents / n_samples),
        "feature_count": len(feature_names),
        "random_seed": random_seed,
        "dataset_provenance": "High-fidelity synthetic enterprise microservices telemetry based on real-world SRE failure topologies (memory leak, thread pool exhaustion, cascading downstream timeout).",
        "generated_at": datetime.now(timezone.utc).isoformat()
    }
    
    return X, y, feature_names, metadata
