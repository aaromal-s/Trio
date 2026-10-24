import { describe, it, expect } from 'vitest';
import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import { MetricCard } from '../components/common/MetricCard';

describe('MetricCard Component', () => {
  it('renders metric title and formatted value', async () => {
    const container = document.createElement('div');
    const root = createRoot(container);
    await act(async () => {
      root.render(
        <MetricCard
          title="Verified ML Accuracy"
          value="99.89%"
          subtitle="Random Forest held-out test split"
        />
      );
    });
    expect(container.textContent).toContain('Verified ML Accuracy');
    expect(container.textContent).toContain('99.89%');
    expect(container.textContent).toContain('Random Forest held-out test split');
  });

  it('renders trend badge when provided', async () => {
    const container = document.createElement('div');
    const root = createRoot(container);
    await act(async () => {
      root.render(
        <MetricCard
          title="MTTR"
          value="12.4m"
          trend={{ value: "-45% reduction", isPositive: true }}
        />
      );
    });
    expect(container.textContent).toContain('-45% reduction');
    expect(container.innerHTML).toContain('text-emerald-400');
  });
});
