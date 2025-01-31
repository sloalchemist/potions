import { Speaker } from '../speaker/speaker';
import { Belief } from '../memories/memoryService';
import { SpeechAct } from '../speech/speechAct';
import { current_date } from '../fantasyDate';

/**
 * Cleans the response by removing unnecessary text and formatting.
 * @param {string} response - The response text to clean.
 * @param {string} name - The name to extract content after.
 * @returns {string} The cleaned response.
 */
export function cleanResponse(response: string, name: string): string {
  return stripTextBetweenParentheses(
    trimQuotes(
      extractContentAfterColon(
        collapseWhitespace(removeTextAfterNewline(response)),
        name
      )
    )
  );
}

/**
 * Removes text after the first newline character in the input string.
 * @param {string} input - The input string.
 * @returns {string} The string with text after the first newline removed.
 */
export function removeTextAfterNewline(input: string): string {
  // Find the index of the first newline character
  const newlineIndex = input.indexOf('\n');

  if (newlineIndex !== -1) {
    // Extract everything before the newline character
    return input.slice(0, newlineIndex).trim();
  }

  // If no newline is found, return the input trimmed
  return input.trim();
}

/**
 * Strips text between parentheses, including the parentheses, from the input string.
 * @param {string} input - The input string.
 * @returns {string} The string with text between parentheses removed.
 */
export function stripTextBetweenParentheses(input: string): string {
  // Regular expression to match any text between parentheses, including the parentheses
  return input.replace(/\s*\([^)]*\)/g, '').trim();
}

/**
 * Collapses all whitespace characters (spaces, tabs, newlines, etc.) into a single space.
 * @param {string} input - The input string.
 * @returns {string} The string with collapsed whitespace.
 */
export function collapseWhitespace(input: string): string {
  // Replace all whitespace characters (spaces, tabs, newlines, etc.) with a single space
  return input.replace(/\s+/g, ' ').trim();
}

/**
 * Trims quotes from the input string.
 * If the input contains content between double quotes, it returns the content inside the quotes.
 * Otherwise, it removes any lone quotes and trims the input.
 * @param {string} input - The input string.
 * @returns {string} The string with quotes trimmed.
 */
export function trimQuotes(input: string): string {
  // Regular expression to match content between double quotes
  const regex = /"([^"]*)"/;
  const match = input.match(regex);

  if (match && match[1]) {
    // If content inside quotes is found, return it after trimming spaces
    return match[1].trim();
  }

  // If no content inside quotes is found, remove any lone quotes and trim the input
  return input.replace(/"/g, '').trim();
}

/**
 * Extracts content after the first colon if the text before the colon matches the provided name.
 * If no colon is found, returns the input trimmed.
 * @param {string} input - The input string.
 * @param {string} name - The name to match before the colon.
 * @returns {string} The extracted content after the colon or the trimmed input.
 */
export function extractContentAfterColon(input: string, name: string): string {
  // Find the index of the first colon
  const colonIndex = input.indexOf(':');

  if (colonIndex !== -1) {
    // Extract everything before the colon
    const beforeColon = input.slice(0, colonIndex).trim();

    // If the text before the colon matches the provided name, remove it and return the rest
    if (beforeColon === name) {
      // Extract everything after the first colon, trim leading/trailing spaces
      return input.slice(colonIndex + 1).trim();
    } else {
      // Keep the colon as part of the text
      return input.trim();
    }
  }

  // If no colon is found, return the input trimmed
  return input.trim();
}

/**
 * Summarizes the conversation between two speakers.
 * @param {Speaker} subject - The subject speaker.
 * @param {Speaker} other - The other speaker.
 * @returns {string} The prompt for summarizing the conversation.
 * @throws Will throw an error if the subject does not have a conversation.
 */
export function summarizeConversation(
  subject: Speaker,
  other: Speaker
): string {
  if (subject.conversation == null) {
    throw new Error('Mob does not have a conversation');
  }

  const gameState = buildGameState(subject, other, []);

  const prompt = `Conversation:
${subject.conversation.getChats()}

Task:
* Summarize the conversation in 3-4 sentences.
* The summary should be from the potentially biased perspective of ${subject.name}.
* Focus on the key ideas and emotional undertones.
* Ensure the summary is clear and retains context for potential use in future interactions.

${gameState}

${subject.name}'s Summary:`;

  return prompt;
}

/**
 * Builds the game state for the conversation context.
 * @param {Speaker} subject - The subject speaker.
 * @param {Speaker} otherPlayer - The other player in the conversation.
 * @param {Belief[]} context - The context of the conversation, including related memories and relationships.
 * @returns {string} The game state as a string.
 * @throws Will throw an error if the subject does not have a conversation.
 */
function buildGameState(
  subject: Speaker,
  otherPlayer: Speaker,
  context: Belief[]
): string {
  if (subject.conversation == null) {
    throw new Error('Mob does not have a conversation');
  }

  let gameState =
    //buildGameState(world, subject) +
    `Context:
      - This is a game in the style of 90s Super Nintendo RPGs, such as The Legend of Zelda or Final Fantasy.
      - Setting: We are in the land of Elyndra near the Silverclaw tribe. ${current_date().date_description}
      `;
  const conversationSummary =
    subject.relationships.conversationSummaryWith(otherPlayer);

  // Add known common ground.
  if (conversationSummary !== '') {
    gameState += `
        Previous conversation:
        ${conversationSummary}
        `;
  }
  const specialRelationship =
    subject.relationships.specialRelationshipWith(subject);
  if (specialRelationship) {
    context.push(specialRelationship);
  }

  context.push(subject.description());
  context.push(otherPlayer.description());

  if (context.length > 0) {
    gameState += `
Related Memories:
`;
    for (const memory of context) {
      gameState += `- ${memory.name}: ${memory.description}
            `;
    }
  }

  return gameState;
}

/**
 * Builds a prompt for generating speech for an NPC.
 * @param {Speaker} subject - The NPC speaker.
 * @param {Speaker} otherPlayer - The other player involved in the conversation.
 * @param {SpeechAct} speechAct - The speech act to be generated.
 * @returns {string} The generated prompt.
 */
export function buildPromptForSpeech(
  subject: Speaker,
  otherPlayer: Speaker,
  speechAct: SpeechAct
): string {
  if (subject.conversation == null) {
    throw new Error('Mob does not have a conversation');
  }
  const context: Belief[] = [];
  context.push(...speechAct.getContext());
  const gameState = buildGameState(subject, otherPlayer, context);

  const option = speechAct.getPrompt();

  let task = `Task:
    - As ${subject.name} write a message to ${otherPlayer.name}. ${subject.personality.description()}.
    - Limit the response to 25 words or less. Ensure your message has no newlines and contains only the dialog.
    `;
  if (option != '') {
    task += `- The message should ${option}
        `;
  }

  const prompt = `[INST]
    ${gameState}

    ${task}
    Conversation:
    
    ${subject.conversation.getChats()}    
    ${subject.name}: [/INST]`;
  return prompt;
}

/**
 * Builds prompts for multiple responses in a conversation.
 * @param {Speaker} subject - The subject speaker.
 * @param {Speaker} otherPlayer - The other player in the conversation.
 * @param {SpeechAct[]} responses - The array of speech acts to generate prompts for.
 * @returns {string[]} An array of generated prompts.
 * @throws Will throw an error if the subject does not have a conversation or if no responses are provided.
 */
export function buildPromptsForResponses(
  subject: Speaker,
  otherPlayer: Speaker,
  responses: SpeechAct[]
): string[] {
  if (subject.conversation == null) {
    throw new Error('Mob does not have a conversation');
  }

  if (responses.length == 0) {
    throw new Error('No responses provided');
  }

  const prompts: string[] = [];
  for (let i = 0; i < responses.length; i++) {
    prompts.push(buildPromptForSpeech(subject, otherPlayer, responses[i]));
  }

  return prompts;
}

/**
 * Parses a single response by cleaning it.
 * @param {string} data - The response data to be cleaned.
 * @param {string} name - The name to be used in the cleaning process.
 * @returns {string} The cleaned response.
 */
export function parseResponse(data: string, name: string): string {
  return cleanResponse(data, name);
}

/**
 * Parses multiple responses by cleaning each one.
 * @param {string[]} response - The array of response data to be cleaned.
 * @param {string} name - The name to be used in the cleaning process.
 * @returns {string[]} An array of cleaned responses.
 */
export function parseMultiResponse(response: string[], name: string): string[] {
  return response.map((res) => cleanResponse(res, name));
}
