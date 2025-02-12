import 'dotenv/config';

if (!process.env.AUTH_SERVER_URL) {
  throw new Error(
    'Cannot run without auth server url configured. Add path to .env'
  );
}

const authUrl = process.env.AUTH_SERVER_URL;
console.log('Auth-Server URL:', authUrl);

export interface PlayerData {
  current_world_id: number;
  health: number;
  name: string;
  gold: number;
  attack: number;
  appearance: string;
}

export interface WorldData {
  id: number;
  world_id: string;
}


export interface ApiResponse<T> {
  message: string;
  data: T;
}

// Function to get world data

// Function to get world data
export async function getWorldData():
 Promise<ApiResponse<WorldData[]>> {
  const url = new URL(`/worlds/`, authUrl);
  console.log("GET REQUEST URL IS", url);
  try {
    const response = await fetch(url, {
      method: 'GET', // Using GET for getting world data
      headers: {
        'Content-Type': 'application/json'
      }
    });

    console.log("Testing");

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to get world data');
    }


    const result: ApiResponse<WorldData[]> = await response.json();
    console.log(result)
    return result;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to get world data: ${error.message}`);
    }
    throw new Error('An unknown error occurred while getting world data');
  }
}


// Function to update existing character data
export async function updateCharacterData(
  id: number,
  playerData: PlayerData
): Promise<ApiResponse<PlayerData[]>> {
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

    const result: ApiResponse<PlayerData[]> = await response.json();
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
