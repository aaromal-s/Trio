# TRIO: Comprehensive University Viva Defense & Oral Examination Guide

**Project Title:** Contradiction-Guided Tri-Memory Unsupervised Learning for Unknown Operational-State Discovery  
**Author/Candidate Reference:** University Evaluation Defense  
**System Architecture:** TRIO (Short-Term Memory + Long-Term Memory + Contradiction Memory)  

---

### Q1: What is TRIO in simple terms?
**Answer:**  
TRIO is an intelligent AI/ML industrial discovery platform designed for complex cyber-physical processes (such as water treatment plants, chemical reactors, and electrical grids). Unlike standard tools that only sound alarms when numbers spike, TRIO learns what normal operations look like, remembers historical operating states, isolates contradictory patterns, and discovers previously unknown operating states without needing labeled training examples.

---

### Q2: What exact research problem does TRIO solve?
**Answer:**  
Industrial environments continuously drift, experience maintenance changes, or encounter novel physical regimes (such as secondary pump cavitation or membrane fouling) that were never present in initial training datasets.  
Conventional anomaly detection algorithms fail because:
1. They classify *every* deviation as an isolated fault, triggering thousands of nuisance alarms (**alarm fatigue**).
2. They cannot tell the difference between a random 1-second electrical glitch and a sustained, coherent new operational mode.  
TRIO solves this by clustering sustained contradictory observations into characterized, explainable unknown operational states.

---

### Q3: Why did you choose unsupervised learning over supervised learning?
**Answer:**  
By definition, an "unknown operational state" is something the plant has never seen before. Therefore, it is impossible to have ground-truth training labels for novel events before they occur. Supervised models (like Random Forests or Neural Network classifiers) can only classify categories they were explicitly trained on. Unsupervised learning allows TRIO to model normal baseline distribution and discover emerging regimes organically.

---

### Q4: What is Short-Term Memory (STM) and what is its role?
**Answer:**  
STM is an active sliding FIFO observation window (typically 30 observations). It maintains running moving averages ($\mu$) and temporal velocity vectors ($\Delta v$).  
Its role is twofold:
1. It computes the **Temporal Inconsistency Factor ($T$)** to measure how sharply an incoming reading deviates from local momentum.
2. It smooths out transient high-frequency sensor jitter, ensuring single-point spikes don't trigger state discovery.

---

### Q5: What is Long-Term Memory (LTM) and how is it populated?
**Answer:**  
LTM stores verified prototypes of known operational regimes learned during baseline training. Populated via unsupervised clustering (e.g., K-Means/Gaussian clustering on training data), each prototype consists of:
- Multivariate centroid coordinates ($\mu_k$)
- 95th-percentile dispersion radius ($R_k$)
- Historical observation frequency  
When new data arrives, TRIO calculates the **Prototype Distance ($D$)** as the minimum Euclidean distance to any known LTM prototype.

---

### Q6: What is Contradiction Memory (CM) and why is it the core innovation?
**Answer:**  
Contradiction Memory is the pivotal innovation of TRIO. Rather than instantly raising an emergency alarm when an observation deviates ($C \ge \tau$), TRIO diverts the contradictory observation into Contradiction Memory.  
CM accumulates evidence over time and applies **DBSCAN density clustering**. If contradictory points dissolve, they are dismissed as transient noise. If they form a tight, persistent cluster in feature space, TRIO promotes them into an unknown-state candidate.

---

### Q7: How is the Contradiction Score calculated? Explain the formula.
**Answer:**  
The contradiction score $C$ is a normalized composite metric defined as:
$$C = \alpha \cdot D + \beta \cdot T + \gamma \cdot A$$
- **$D$ (Prototype Distance):** Normalized distance to the nearest known LTM prototype.
- **$T$ (Temporal Inconsistency):** Normalized deviation from the STM sliding window moving average.
- **$A$ (Anomaly Score):** Statistical density score from an unsupervised isolation forest baseline.
- **Weights:** Initialized to $\alpha = 0.45$, $\beta = 0.30$, $\gamma = 0.25$, satisfying $\alpha + \beta + \gamma = 1.0$.
- **Interpretation:** An observation is considered contradictory when it differs from learned operating patterns, conflicts with recent temporal momentum, or appears statistically sparse.

---

### Q8: What qualifies as an "Unknown Operational State"?
**Answer:**  
An unknown operational state is NOT a single bad data point. It is a **statistically coherent, multi-sensor regime** that:
1. Deviates significantly from all known LTM prototypes ($D > 0.8$).
2. Maintains internal geometric cohesion (high cluster density in feature space).
3. Demonstrates temporal persistence across multiple successive observation windows (e.g., lasting at least 15+ consecutive timesteps).

---

### Q9: Why use DBSCAN instead of K-Means for the candidate discovery stage?
**Answer:**  
DBSCAN (Density-Based Spatial Clustering of Applications with Noise) was specifically selected because:
1. **Unknown $k$:** You cannot know in advance how many novel states will occur; DBSCAN discovers the number of clusters automatically.
2. **Arbitrary Geometry:** Novel physical operating regimes often follow non-spherical, curved manifolds in multi-sensor space. K-Means assumes spherical clusters, whereas DBSCAN finds arbitrary shapes.
3. **Robust Outlier Rejection:** Isolated single-point spikes are classified as noise (label $-1$), naturally preventing false alarms.

---

### Q10: What is the fundamental difference between Anomaly Detection and Unknown-State Discovery?
**Answer:**  
- **Anomaly Detection:** Asks *"Is this single observation abnormal?"* Result: A binary alarm (normal vs. anomalous). Treats persistent pump cavitation and a loose wire identically.
- **Unknown-State Discovery:** Asks *"Has the physical system transitioned into a stable, previously unobserved operating regime, what is its mathematical centroid, which sensors are driving the shift, and how does it compare to baseline?"* Result: An explainable, persistent operational candidate with feature delta vectors.

---

### Q11: Why is the SWaT (Secure Water Treatment) dataset used as the benchmark?
**Answer:**  
SWaT, developed by iTrust at Singapore University of Technology and Design (SUTD), is the world's most widely recognized physical cyber-physical testbed dataset. It models a complete six-stage purification plant with 51 physical sensors (flow, level, pressure, pH, conductivity) and motorized valves/pumps. It provides the ideal testbed for evaluating complex multi-stage physical transitions and cyber-physical deviations.

---

### Q12: How do you evaluate the model if it is unsupervised?
**Answer:**  
During training, TRIO strictly adheres to chronological splitting without shuffling ($70\%$ train, $30\%$ test). Scalers and models are fitted **exclusively on baseline training data**, with zero future leakage.  
Ground-truth labels are **never** shown to the learning algorithm; they are used strictly at post-inference evaluation time to compute standardized benchmarking metrics:
- Adjusted Rand Index (ARI)
- Normalized Mutual Information (NMI)
- Precision, Recall, and F1-Score
- False Discovery Rate (FDR)
- Detection Delay (timesteps from onset to discovery)

---

### Q13: What is the primary academic research contribution of this project?
**Answer:**  
1. **Tri-Memory Triangulation:** Separating immediate momentum (STM), historical stability (LTM), and divergent evidence (CM) into distinct cooperating subsystems.
2. **Transparent Contradiction Scoring:** Replacing opaque black-box deep autoencoders with an explainable, configurable formulation ($C = \alpha D + \beta T + \gamma A$).
3. **Elimination of Data Leakage:** A rigorous, chronological pipeline suitable for real-time streaming industrial deployments.
4. **Explainable Discoveries:** Automated generation of plain-English sensor shift explanations alongside scaled feature delta vectors.

---

### Q14: What are the current limitations of the platform?
**Answer:**  
1. **Persistence Lag:** Because TRIO requires evidence to accumulate before confirming a candidate, there is a small detection delay (typically 3–8 timesteps). It is not designed to replace millisecond-level hardware circuit breakers.
2. **Hyperparameter Sensitivity:** The density threshold ($\epsilon$) and minimum samples ($MinPts$) in DBSCAN must be calibrated to the noise level of the target sensor testbed.

---

### Q15: What future enhancements could be added to TRIO?
**Answer:**  
1. **Continuous Memory Assimilation:** Automatically promoting `Confirmed` discovery candidates into new LTM prototypes with operator approval, enabling lifelong continuous learning.
2. **Federated Industrial Learning:** Enabling multiple water plants or regional power sub-stations to share Contradiction Memory prototypes without sharing proprietary raw sensor telemetry.
3. **Edge Microcontroller Deployment:** Porting the Tri-Memory scoring loop to C/Rust for execution directly on embedded RTU/PLC industrial controllers.

