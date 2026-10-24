from fastapi import APIRouter
from typing import Dict, Any, List

router = APIRouter()

@router.get("/topology", response_model=Dict[str, Any])
def get_service_topology():
    """
    Returns microservices dependency topology graph with live health status,
    dependencies, throughput, and degraded nodes.
    """
    nodes = [
        {"id": "api-gateway", "label": "API Gateway", "type": "gateway", "status": "HEALTHY", "tier": "edge", "rps": 1850, "latency_ms": 28, "cpu": 32, "mem": 48},
        {"id": "auth-service", "label": "Auth Service", "type": "service", "status": "HEALTHY", "tier": "identity", "rps": 920, "latency_ms": 18, "cpu": 24, "mem": 42},
        {"id": "order-service", "label": "Order Service", "type": "service", "status": "WARNING", "tier": "business", "rps": 650, "latency_ms": 310, "cpu": 68, "mem": 64},
        {"id": "payment-processor", "label": "Payment Processor", "type": "service", "status": "DEGRADED", "tier": "business", "rps": 480, "latency_ms": 640, "cpu": 88, "mem": 94},
        {"id": "inventory-service", "label": "Inventory Service", "type": "service", "status": "HEALTHY", "tier": "business", "rps": 520, "latency_ms": 22, "cpu": 28, "mem": 38},
        {"id": "search-indexer", "label": "Search Indexer", "type": "worker", "status": "HEALTHY", "tier": "worker", "rps": 380, "latency_ms": 75, "cpu": 54, "mem": 62},
        {"id": "recommendation-engine", "label": "Recs Engine", "type": "service", "status": "HEALTHY", "tier": "ai", "rps": 290, "latency_ms": 95, "cpu": 45, "mem": 58},
        {"id": "notification-worker", "label": "Notification Worker", "type": "worker", "status": "HEALTHY", "tier": "worker", "rps": 180, "latency_ms": 15, "cpu": 18, "mem": 35},
        {"id": "postgres-cluster", "label": "PostgreSQL Primary", "type": "database", "status": "HEALTHY", "tier": "storage", "connections": 142, "iops": 2400},
        {"id": "redis-cluster", "label": "Redis Cache Tier", "type": "cache", "status": "HEALTHY", "tier": "storage", "hit_rate": 96.4, "memory_mb": 1840},
        {"id": "kafka-cluster", "label": "Kafka Event Bus", "type": "eventbus", "status": "HEALTHY", "tier": "messaging", "lag": 42, "msg_sec": 3200}
    ]
    
    edges = [
        {"from": "api-gateway", "to": "auth-service", "protocol": "gRPC", "healthy": True},
        {"from": "api-gateway", "to": "order-service", "protocol": "HTTP/2", "healthy": False},
        {"from": "api-gateway", "to": "search-indexer", "protocol": "HTTP/2", "healthy": True},
        {"from": "api-gateway", "to": "recommendation-engine", "protocol": "gRPC", "healthy": True},
        {"from": "order-service", "to": "payment-processor", "protocol": "HTTP/2", "healthy": False, "highlight": True},
        {"from": "order-service", "to": "inventory-service", "protocol": "gRPC", "healthy": True},
        {"from": "order-service", "to": "kafka-cluster", "protocol": "KafkaProducer", "healthy": True},
        {"from": "payment-processor", "to": "postgres-cluster", "protocol": "TCP/JDBC", "healthy": False, "highlight": True},
        {"from": "inventory-service", "to": "postgres-cluster", "protocol": "TCP/JDBC", "healthy": True},
        {"from": "search-indexer", "to": "redis-cluster", "protocol": "RESP", "healthy": True},
        {"from": "kafka-cluster", "to": "notification-worker", "protocol": "KafkaConsumer", "healthy": True},
        {"from": "auth-service", "to": "redis-cluster", "protocol": "RESP", "healthy": True}
    ]
    
    return {
        "nodes": nodes,
        "edges": edges,
        "total_nodes": len(nodes),
        "degraded_nodes_count": 1,
        "warning_nodes_count": 1,
        "healthy_nodes_count": len(nodes) - 2
    }
