export interface Dialog {
  sendPrompt: (
    prompt: string[],
    onMessage: (data: string[]) => void,
    onError?: (error: Error) => void
  ) => Promise<void>;
}

export function initializeDialog(dialog: Dialog): void {
  dialogService = dialog;
}

export let dialogService: Dialog;
