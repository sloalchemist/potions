export function getEnv(name: string) {
  let value = process.env[name];
  if (!value) {
    // Check if we're running in Jest (it sets JEST_WORKER_ID)
    if (process.env.JEST_WORKER_ID) {
      return `test-${name}`;
    }
    throw new Error(`Environment variable ${name} is not set.`);
  }
  return value;
}
