export function logistic(x: number, k: number = 1, x0: number = 0): number {
  const logisticValue = 1 / (1 + Math.exp(-k * (x - x0)));

  return logisticValue;
}

export function evaluateUtility(condition: boolean, baseScore: number): number {
  return condition ? baseScore : -Infinity;
}
