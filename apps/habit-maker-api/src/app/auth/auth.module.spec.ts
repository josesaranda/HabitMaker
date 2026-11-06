import {
  REMEMBERED_SESSION_DURATION_MS,
  SHORT_SESSION_DURATION_MS,
} from './session.service';

describe('session lifetimes', () => {
  it('uses finite lifetimes for both regular and remembered sessions', () => {
    expect(SHORT_SESSION_DURATION_MS).toBe(24 * 60 * 60 * 1000);
    expect(REMEMBERED_SESSION_DURATION_MS).toBe(30 * 24 * 60 * 60 * 1000);
  });
});
