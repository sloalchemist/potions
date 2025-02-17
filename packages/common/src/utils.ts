export function getEnv(name: string) {
  let value = process.env[name];
  if (!value) {
    throw new Error(`Environment variable ${name} is not set.`);
  }

  return value;
}
