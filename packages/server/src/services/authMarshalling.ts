import { getEnv } from '@rt-potion/common';
import 'dotenv/config';

export interface PlayerData {
  current_world_id: number;
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
  const url = new URL(`/character/${id}`, getEnv('AUTH_SERVER_URL'));
  try {
    const response = await fetch(url, {
      method: 'PUT', // Using PUT for updating existing resources
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getEnv('AUTH_SERVER_SECRET')}` // Using secret from environment variable
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

type GetWorldsResponse = {
  id: string;
  world_id: string;
}[];

export async function getWorlds(): Promise<GetWorldsResponse> {
  const url = new URL('/worlds', getEnv('AUTH_SERVER_URL'));
  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${getEnv('AUTH_SERVER_SECRET')}` // Using secret from environment variable
    }
  });
  return response.json();
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
