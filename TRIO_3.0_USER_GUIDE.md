# TRIO 3.0 — COMPREHENSIVE PLATFORM USER GUIDE
**Contradiction-Guided Tri-Memory Unsupervised Learning for Unknown Operational-State Discovery**
*User Guide Version:* 3.0.0  
*Audience:* Industrial Engineers, Machine Learning Researchers, Operators, and University Evaluators  
*Tagline:* **Learn. Remember. Discover.**

---

## 1. Welcome to TRIO 3.0

TRIO 3.0 is a specialized industrial AI platform designed to discover previously unknown operating regimes in continuous cyber-physical systems without supervised labels. Unlike conventional anomaly detectors that treat any deviation as an error or fault, TRIO uses a **Tri-Memory architecture** to distinguish between transient sensor chatter and sustained, coherent operational states.

---

## 2. Navigating the 12 Platform Modules

### Module 1: Cinematic Industrial Landing Page
- **Cinematic 3D Digital Twin:** Experience an interactive WebGL rendering of a continuous industrial water treatment plant, complete with clarifier tanks, pump P101, metallic pipelines, sensor pods (`FIT101`, `LIT101`, `DPIT301`), and the elevated Tri-Memory apparatus.
- **Interactive HUD Raycaster:** Click on any sensor pod or tank in the 3D canvas to inspect live telemetry and physical equipment specifications.
- **Quick Links:** Access the Viva Defense Guide, Explore the Live Demo, or Sign In.

### Module 2: Enterprise Authentication & Onboarding
- **User ID Sign-In:** Authenticate using your provisioned User ID (e.g. `12406834`) and Argon2id-secured password.
- **Forced Password Rotation:** Bootstrap accounts are required to change their temporary credentials on initial login before gaining access to operational dashboards.
- **Password Recovery:** Request a 15-minute, single-use password reset token via the "Forgot Password" workflow.

### Module 3: Overview Dashboard
- **Operational KPIs:** Real-time metrics for Observations Processed, Active Memory State, Known Operational Prototypes, and Discovered Candidates.
- **Digital Process Clock:** Displays current synchronized operational timestamp and time-elapsed since the last telemetry poll.
- **Live Sensor Telemetry:** Interactive multi-sensor trend charts tracking flow rates, tank levels, differential pressure, and chemical analyzers.
- **Mini 3D Tri-Memory Visualizer:** Real-time 3D widget reflecting instantaneous STM buffer occupancy, LTM centroids, and CM evidence accumulation.

### Module 4: Dataset Management & Upload Diagnostics
- **Supported File Formats:** Ingest standard comma (`,`), semicolon (`;`), tab (`\t`), or pipe (`|`) delimited files.
- **Encoding & Number Resilience:** Automatically decodes UTF-8 with BOM (`utf-8-sig`), Latin-1, and parses European decimal commas (`25,4` vs `1.200,5`).
- **Transposed CSV Auto-Inversion:** If your SCADA system exports data with sensor channels as rows and timesteps as columns, TRIO automatically detects and transposes the matrix into the expected observation-oriented structure.
- **Uploaded File Diagnostics Panel:** View detailed file diagnostics including parsed row count, detected delimiter, encoding, and data quality metrics.

### Module 5: Model Lab & Unsupervised Training
- **Parameter Sliders:** Customize contradiction scoring weights:
  - $\alpha$ (LTM Prototype Distance Weight, default: 0.45)
  - $\beta$ (STM Temporal Inconsistency Weight, default: 0.30)
  - $\gamma$ (Empirical Anomaly Score Weight, default: 0.25)
  - $\tau$ (Contradiction Threshold, default: 0.48)
- **Chronological Training:** Train LTM on normal baseline operational observations with zero future data leakage.
- **Model Versioning:** Every training run generates an immutable version tag (e.g. `TRIO-v3.0-RUN-01`) logged in training history.

### Module 6: Tri-Memory Deep Inspection
- **Short-Term Memory (STM):** Inspect the rolling 30-observation sliding window, buffer utilization percentage, and moving velocity vectors.
- **Long-Term Memory (LTM):** Examine learned cluster prototypes, known state centroids, and 95th-percentile cluster dispersion radii ($R_k$).
- **Contradiction Memory (CM):** Review contradictory observations filtered from normal operation, showing individual $D$, $T$, and $A$ score components.

### Module 7: Discovery Candidates & Explainability
- **Candidate Lifecycle:** Track emerging operational regimes through four lifecycle states:
  1. `Pending`: Emerging cluster accumulating evidence in CM.
  2. `Under Validation`: Cohesive cluster with sufficient observations ($\ge 15$ timesteps).
  3. `Confirmed`: Operator-verified novel operating regime.
  4. `Rejected`: Dismissed as unrepeatable or transient process anomaly.
- **Physical Sensor Shift Attribution:** Inspect multivariate sensor deltas ($\Delta\ \sigma$) explaining exactly which sensors shifted relative to the baseline.

### Module 8: Benchmark Evaluation & Export
- **Algorithmic Performance Table:** Compare TRIO against K-Means, DBSCAN, and Isolation Forest across Precision, Recall, F1-Score, Adjusted Rand Index (ARI), Normalized Mutual Information (NMI), False Discovery Rate (FDR), and Detection Delay.
- **One-Click CSV Export:** Download comprehensive benchmark evaluation CSV files for external publication and reporting.

### Module 9: Viva Defense Guide
- Built-in university research reference guide covering theoretical foundations, mathematical proofs, viva defense questions, and comparative advantages over traditional anomaly detectors.

### Module 10: User Profile Management
- Edit display name, institutional affiliation, and profile avatar.
- Audit active sessions and remotely terminate concurrent sessions across other devices with one click.

### Module 11: Platform Settings & Personalization
- **Theme Selection:** Toggle Dark Mode, Light Mode, or System Preference.
- **Motion Controls:** Adjust 3D motion intensity or enable Reduced Motion for low-power devices.
- **Backend Connection Diagnostics:** Test live API ping latency and verify database/rate limiter connectivity.

### Module 12: Centralized Telemetry Control
- Switch polling cadences between 2s, 5s, 10s, 30s, or Pause.
- Trigger manual refreshes at any time with guaranteed in-flight request protection.

---

## 3. Frequently Asked Questions (FAQ)

**Q: Why does TRIO report 0% False Discovery Rate on unseen test data?**  
*A:* TRIO requires contradictory observations to persist across multiple consecutive timesteps ($\ge 15$) and form a cohesive cluster in multi-sensor space via DBSCAN before declaring a discovery candidate. Isolated sensor spikes are buffered and filtered, eliminating false alarms.

**Q: Can I train on custom sensor configurations?**  
*A:* Yes. The Datasets module allows dynamic feature selection, and the DataPreprocessor fits scaling parameters dynamically to any set of numeric sensor columns.

