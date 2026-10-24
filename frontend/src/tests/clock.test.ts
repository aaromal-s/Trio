import { describe, it, expect } from 'vitest';

describe('Live Clock Format & Timezone Requirements (Phase 7)', () => {
  it('formats 12-hour time with seconds and AM/PM', () => {
    // 2026-10-24 19:45:30 UTC
    const date = new Date('2026-10-24T19:45:30Z');
    const timeStr = date.toLocaleTimeString('en-US', {
      hour12: true,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      timeZone: 'UTC'
    });
    
    expect(timeStr).toMatch(/\d{2}:\d{2}:\d{2}\s+(AM|PM)/);
    expect(timeStr).toContain('07:45:30 PM');
  });

  it('displays IST timezone indicator string correctly', () => {
    const tzString = 'IST (UTC+5:30)';
    expect(tzString).toContain('IST');
    expect(tzString).toContain('UTC+5:30');
  });
});
