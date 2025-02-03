/**
 * Interface representing a dialog service for sending prompts.
 */
export interface Dialog {
  /**
   * Sends a prompt to the dialog service.
   *
   * @param {string[]} prompt - The prompt to send.
   * @param {(data: string[]) => void} onMessage - Callback function to handle the response data.
   * @param {(error: Error) => void} [onError] - Optional callback function to handle errors.
   * @returns {Promise<void>} A promise that resolves when the prompt is sent.
   */
  sendPrompt: (
    prompt: string[],
    onMessage: (data: string[]) => void,
    onError?: (error: Error) => void
  ) => Promise<void>;
}

/**
 * Initializes the dialog service with the provided dialog implementation.
 *
 * @param dialog - The dialog implementation to initialize.
 */
export function initializeDialog(dialog: Dialog): void {
  dialogService = dialog;
}

export let dialogService: Dialog;
