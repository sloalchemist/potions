import 'dotenv/config';

if (!process.env.AUTH_SERVER_URL) {
  throw new Error(
    'Cannot run without auth server url configured. Add path to .env'
  );
}

const authUrl = process.env.AUTH_SERVER_URL;
console.log('Auth-Server URL:', authUrl);

export interface PlayerData {
  health: number;
  name: string;
  gold: number;
  attack: number;
  appearance: string;
}

export interface ApiResponse {
  message: string;
  data: PlayerData[];
}

// Function to update existing character data
export async function updateCharacterData(
  id: number,
  playerData: PlayerData
): Promise<ApiResponse> {
  const url = new URL(`/character/${id}`, authUrl);
  try {
    const response = await fetch(url, {
      method: 'PUT', // Using PUT for updating existing resources
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(playerData)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to update character data');
    }

    const result: ApiResponse = await response.json();
    return result;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to update character data: ${error.message}`);
    }
    throw new Error('An unknown error occurred while updating character data');
  }
}

// Example usage:
/*
try {
  // Update existing character data
  const playerData: PlayerData = {
    health: 100,
    name: "Hero",
    gold: 500,
    appearance: "warrior"
  };

  const result = await updateCharacterData("player123", playerData);
  console.log(result.message);  // "Player data upserted successfully."
  console.log(result.data);     // Updated player data array
} catch (error) {
  console.error(error);
}
*/
