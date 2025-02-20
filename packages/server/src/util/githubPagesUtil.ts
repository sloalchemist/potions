export async function fetchWorldSpecificData(worldID: string, file: string) {
  const response = await fetch(
    `https://potions.gg/world_assets/${worldID}/server/${file}.json`
  );
  if (!response.ok) {
    throw new Error('Failed to fetch world specific data');
  }
  return await response.json();
}
