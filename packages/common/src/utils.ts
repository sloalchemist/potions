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

export async function fetchWorldSpecificData(worldID: string, packageName: string, file: string) {
  const response = await fetch(
    `https://potions.gg/world_assets/${worldID}/${packageName}/${file}.json`
  );
  if (!response.ok) {
    throw new Error('Failed to fetch world specific data');
  }
  return await response.json();
}