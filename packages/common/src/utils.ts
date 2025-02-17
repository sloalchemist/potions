export function getEnv(name: string) {
  let value = process.env[name];
  if (!value) {
    if (process.env.NODE_ENV !== 'test') {
      return `Environment variable ${name} is not set.`;
    }
    throw new Error(`Environment variable ${name} is not set.`);
  }

  return value;
}
