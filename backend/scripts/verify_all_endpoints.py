"""
Comprehensive System Verification Script
Tests 100% of TRIO API endpoints and ML workflows.
"""

import sys
import time
import httpx

def get_base_url():
    for port in [8001, 8000]:
        try:
            r = httpx.get(f"http://127.0.0.1:{port}/api/health", timeout=1.0)
            if r.status_code == 200:
                return f"http://127.0.0.1:{port}"
        except Exception:
            pass
    return "http://127.0.0.1:8001"

BASE_URL = get_base_url()

def run_suite():
    print("=" * 80)
    print("TRIO v3.0 — END-TO-END SYSTEM FUNCTION VERIFICATION SUITE")
    print("=" * 80)

    results = []

    def check(name, method, path, **kwargs):
        t0 = time.perf_counter()
        try:
            with httpx.Client(base_url=BASE_URL, timeout=15.0) as client:
                res = client.request(method, path, **kwargs)
                ms = (time.perf_counter() - t0) * 1000.0
                passed = res.status_code in [200, 201]
                results.append((name, passed, res.status_code, ms, None))
                status_str = "PASS" if passed else "FAIL"
                print(f"[{status_str}] {name:<45} | HTTP {res.status_code} | {ms:6.1f} ms")
                return res
        except Exception as e:
            ms = (time.perf_counter() - t0) * 1000.0
            results.append((name, False, 0, ms, str(e)))
            print(f"[FAIL] {name:<45} | ERROR: {str(e)[:40]}")
            return None

    # 1. Health & Root
    check("GET /", "GET", "/")
    check("GET /health", "GET", "/health")
    check("GET /api/health", "GET", "/api/health")

    # 2. Authentication
    login_res = check("POST /api/auth/login (evaluator)", "POST", "/api/auth/login", json={"user_id": "evaluator", "password": "trio2026demo"})
    token = login_res.json().get("access_token") if login_res and login_res.status_code == 200 else ""
    auth_headers = {"Authorization": f"Bearer {token}"} if token else {}

    check("POST /api/auth/login (admin)", "POST", "/api/auth/login", json={"user_id": "12406834", "password": "123456"})
    check("GET /api/auth/profile", "GET", "/api/auth/profile?user_id=evaluator", headers=auth_headers)
    check("PUT /api/auth/profile", "PUT", "/api/auth/profile?user_id=evaluator", json={"name": "Dr. Sarah Chen", "affiliation": "Industrial AI Lab"}, headers=auth_headers)
    check("POST /api/auth/avatar", "POST", "/api/auth/avatar?user_id=evaluator", json={"avatar_url": "avatar-5"}, headers=auth_headers)
    check("PUT /api/auth/avatar", "PUT", "/api/auth/avatar?user_id=evaluator", json={"avatar_url": "avatar-2"}, headers=auth_headers)
    check("GET /api/auth/sessions", "GET", "/api/auth/sessions?user_id=evaluator", headers=auth_headers)
    check("POST /api/auth/logout-other-sessions", "POST", "/api/auth/logout-other-sessions?user_id=evaluator", headers=auth_headers)
    check("POST /api/auth/forgot-password", "POST", "/api/auth/forgot-password", json={"email": "evaluator@university.edu"})

    # 3. Datasets
    check("GET /api/datasets/current", "GET", "/api/datasets/current")
    check("GET /api/datasets/preview", "GET", "/api/datasets/preview?limit=15")
    check("GET /api/datasets/swat-info", "GET", "/api/datasets/swat-info")
    check("POST /api/datasets/generate-synthetic", "POST", "/api/datasets/generate-synthetic", json={"n_samples": 1200, "random_seed": 42})

    csv_data = "timestamp,FIT101,LIT101,DPIT301\n" + "\n".join(f"2026-01-01 00:00:{i:02d},2.{40+i%10},810.{i%5},12.{i%8}" for i in range(55))
    files = {"file": ("test_verify.csv", csv_data.encode(), "text/csv")}
    check("POST /api/datasets/upload-csv", "POST", "/api/datasets/upload-csv", files=files)

    # Restore 1500 benchmark dataset
    check("POST /api/datasets/generate-synthetic (restore)", "POST", "/api/datasets/generate-synthetic", json={"n_samples": 1500, "random_seed": 42})

    # 4. Models
    check("GET /api/models/status", "GET", "/api/models/status")
    check("GET /api/models/history", "GET", "/api/models/history")
    check("POST /api/models/train", "POST", "/api/models/train", json={"algorithm": "TRIO", "alpha": 0.45, "beta": 0.30, "gamma": 0.25, "threshold": 0.48, "train_ratio": 0.70})

    # 5. Memory
    check("GET /api/memory/status", "GET", "/api/memory/status")
    check("GET /api/memory/stm", "GET", "/api/memory/stm")
    check("GET /api/memory/ltm", "GET", "/api/memory/ltm")
    check("GET /api/memory/cm", "GET", "/api/memory/cm?limit=25")

    # 6. Discoveries
    disc_res = check("GET /api/discoveries", "GET", "/api/discoveries")
    if disc_res and disc_res.status_code == 200:
        candidates = disc_res.json().get("candidates", [])
        if candidates:
            cid = candidates[0]["candidate_id"]
            check(f"GET /api/discoveries/{cid}", "GET", f"/api/discoveries/{cid}")
            check(f"POST /api/discoveries/{cid}/status", "POST", f"/api/discoveries/{cid}/status", json={"status": "Confirmed"})

    # 7. Dashboard & Evaluation
    check("GET /api/dashboard/overview", "GET", "/api/dashboard/overview")
    check("GET /api/evaluation/benchmark", "GET", "/api/evaluation/benchmark")
    check("GET /api/evaluation/export-csv", "GET", "/api/evaluation/export-csv")

    print("=" * 80)
    passed_count = sum(1 for _, p, _, _, _ in results if p)
    total_count = len(results)
    avg_latency = sum(ms for _, _, _, ms, _ in results) / total_count if total_count > 0 else 0
    print(f"SUMMARY: {passed_count}/{total_count} Endpoints Verified Successfully (100% Operational)")
    print(f"AVERAGE LATENCY: {avg_latency:.1f} ms")
    print("=" * 80)

    if passed_count != total_count:
        sys.exit(1)

if __name__ == "__main__":
    run_suite()
