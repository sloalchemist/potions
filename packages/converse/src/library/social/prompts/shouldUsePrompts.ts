import * as dotenv from 'dotenv';

// A helper function to determine if prompts and LLM should be used
export function shouldUsePrompts(): boolean {
  dotenv.config();
  if (process.env.LLM_FLAG == 'true') {
    // The user wants to use the LLM
    if (
      process.env.REDIS_HOST &&
      process.env.REDIS_PORT &&
      process.env.REDIS_PASSWORD
    ) {
      // The user has redis credentials, try the LLM
      return true;
    } else {
      // The user wants to use LLM, but has bad credentials. Let them know
      console.log(
        'WARNING! Missing redis credentials required for LLM use. Continuing with LLM disabled.'
      );
      return false;
    }
  }
  return false;
}
