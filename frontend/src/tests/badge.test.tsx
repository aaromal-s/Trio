import { describe, it, expect } from 'vitest';
import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import { Badge } from '../components/common/Badge';

describe('Badge Component', () => {
  it('renders children and correct variant class', async () => {
    const container = document.createElement('div');
    const root = createRoot(container);
    await act(async () => {
      root.render(<Badge variant="p1">P1-Critical</Badge>);
    });
    expect(container.textContent).toContain('P1-Critical');
    expect(container.innerHTML).toContain('text-rose-400');
  });

  it('renders pulse animation when pulse is true', async () => {
    const container = document.createElement('div');
    const root = createRoot(container);
    await act(async () => {
      root.render(<Badge variant="nominal" pulse>Healthy</Badge>);
    });
    expect(container.innerHTML).toContain('animate-ping');
  });
});
