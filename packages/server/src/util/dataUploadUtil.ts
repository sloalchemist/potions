export function shouldUploadDB(now: number, lastUpdated: number) {
  const tenMinutes = 600000;
  return now - lastUpdated >= tenMinutes;
}
