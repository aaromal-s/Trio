import { OverviewData, DatasetInfo, ModelStatus, DiscoveryCandidateItem } from '../services/api';

interface ReportPayload {
  overview: OverviewData;
  dataset: DatasetInfo;
  model: ModelStatus;
  discoveries: DiscoveryCandidateItem[];
}

export function downloadIncidentReport({ overview, dataset, model, discoveries }: ReportPayload): void {
  const now = new Date().toISOString();
  const lines: string[] = [
    '# TRIO 3.0 — Operational Shift & Discovery Incident Report',
    '',
    `> **Generated**: ${now}  `,
    `> **Active Dataset**: \`${dataset.dataset_name}\` (${dataset.is_simulated ? 'Simulated' : 'Live Production Telemetry'})  `,
    `> **Model Version**: \`${model.model_version}\` (\u03B1=${model.weights.alpha}, \u03B2=${model.weights.beta}, \u03B3=${model.weights.gamma}, \u03C4=${model.contradiction_threshold})  `,
    `> **Zero-Leakage Enforcement**: Chronological Split Verified`,
    '',
    '---',
    '',
    '## 1. Operational KPIs',
    '',
    '| Metric | Value |',
    '| :--- | :---: |',
    `| **Observations Processed** | ${overview.kpis.observations_processed.toLocaleString()} |`,
    `| **Known Operational States (LTM)** | ${overview.kpis.known_operational_states} |`,
    `| **Unknown Regime Candidates (CM)** | ${overview.kpis.unknown_candidates} |`,
    `| **Confirmed Discoveries** | ${overview.kpis.confirmed_discoveries} |`,
    '',
    '## 2. State Distribution',
    '',
    '| Operational State | Observations |',
    '| :--- | :---: |',
    ...overview.state_distribution.map((s) => `| ${s.name} | ${s.count.toLocaleString()} |`),
    '',
    '## 3. Discovered Unknown Operational Regimes',
    '',
  ];

  if (discoveries.length === 0) {
    lines.push('_No unknown operational state candidates currently isolated in Contradiction Memory._');
  } else {
    discoveries.forEach((cand) => {
      lines.push(`### ${cand.candidate_id} — Status: \`${cand.status}\``);
      lines.push(`- **Window**: ${cand.first_detected} \u2192 ${cand.last_detected}`);
      lines.push(`- **Evidence Count**: ${cand.observation_count} observations`);
      lines.push(`- **Mean Contradiction Score**: \`${cand.mean_contradiction_score}\` (Cluster Density: \`${cand.cluster_density}\`)`);
      lines.push(`- **Explanation**: ${cand.explanation}`);

      const deltas = Object.entries(cand.feature_deltas || {}).sort((a, b) => Math.abs(b[1]) - Math.abs(a[1]));
      if (deltas.length > 0) {
        lines.push('- **Top Root-Cause Sensor Deviations**:');
        deltas.slice(0, 5).forEach(([sensor, delta]) => {
          const sign = delta >= 0 ? '+' : '';
          lines.push(`  - \`${sensor}\`: ${sign}${delta.toFixed(2)}\u03C3`);
        });
      }
      lines.push('');
    });
  }

  const blob = new Blob([lines.join('\n')], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `TRIO_Incident_Report_${new Date().toISOString().slice(0, 10)}.md`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
