export async function fetchWorldSpecificData(file: string) {
  const response = await fetch(`https://potions.gg/world_assets/villager-world/server/${file}.json`);
  if (!response.ok) {
    throw new Error('Failed to fetch world specific data');
  }
  return await response.json();
}