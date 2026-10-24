import { describe, it, expect } from 'vitest';
import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import { AegisLogo } from '../components/common/AegisLogo';

describe('AegisLogo Component', () => {
  it('renders horizontal brand logo with wordmark and badge', async () => {
    const container = document.createElement('div');
    const root = createRoot(container);
    await act(async () => {
      root.render(<AegisLogo variant="horizontal" size="md" />);
    });
    expect(container.textContent).toContain('AEGISOPS');
    expect(container.textContent).toContain('AI');
    expect(container.querySelector('svg')).not.toBeNull();
  });

  it('renders icon-only variant with aria-label', async () => {
    const container = document.createElement('div');
    const root = createRoot(container);
    await act(async () => {
      root.render(<AegisLogo variant="icon" size="sm" />);
    });
    const iconWrapper = container.querySelector('[aria-label="AegisOps AI Icon"]');
    expect(iconWrapper).not.toBeNull();
    expect(container.querySelector('svg')).not.toBeNull();
  });

  it('renders tagline when showTagline is true', async () => {
    const container = document.createElement('div');
    const root = createRoot(container);
    await act(async () => {
      root.render(<AegisLogo variant="horizontal" showTagline={true} />);
    });
    expect(container.textContent).toContain('Autonomous Cloud Intelligence');
  });
});
