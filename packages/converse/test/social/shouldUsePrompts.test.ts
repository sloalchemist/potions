import { shouldUsePrompts } from '../../src/library/social/prompts/shouldUsePrompts';

describe('Ensure LLM is attempted to be used only when set up correctly', () => {
  test('Dev does not specify, should be false', () => {
    expect(shouldUsePrompts()).toBe(false);
  });

  test('Dev opts out, should be false', () => {
    process.env.LLM_FLAG = 'false';
    expect(shouldUsePrompts()).toBe(false);
  });

  test('Dev opts in but has no credentials, should be false', () => {
    process.env.LLM_FLAG = 'true';
    expect(shouldUsePrompts()).toBe(false);
  });

  test('Dev opts in and has credentials, should be true', () => {
    process.env.REDIS_HOST = 'test';
    process.env.REDIS_PORT = 'test';
    process.env.REDIS_PASSWORD = 'test';
    process.env.LLM_FLAG = 'true';
    expect(shouldUsePrompts()).toBe(true);
  });
});
