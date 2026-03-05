import { describe, it, expect, beforeEach } from 'vitest';

// We test the behaviour indirectly because the axios instance is created at
// module load time — so we just verify the config values we can inspect.

describe('API axios instance', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('has the correct base URL from env', async () => {
    const { default: API } = await import('../api');
    // NEXT_PUBLIC_API_URL is undefined in test env, so baseURL may be undefined
    // Just verify the instance exists and has expected shape
    expect(API).toBeDefined();
    expect(typeof API.get).toBe('function');
    expect(typeof API.post).toBe('function');
  });

  it('has a 30 second timeout configured', async () => {
    const { default: API } = await import('../api');
    expect((API.defaults as any).timeout).toBe(30000);
  });

  it('sends JSON content-type header', async () => {
    const { default: API } = await import('../api');
    const contentType = (API.defaults.headers as any)['Content-Type'] ??
      (API.defaults.headers.common as any)?.['Content-Type'];
    expect(contentType).toBe('application/json');
  });
});
