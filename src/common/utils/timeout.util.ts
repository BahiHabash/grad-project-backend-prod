/**
 * Races a promise against a timeout. If the timeout fires first, the promise
 * is abandoned and an Error is thrown.
 *
 * @param promise - The promise to race.
 * @param ms - Timeout duration in milliseconds.
 * @param label - Human-readable label for the error message.
 * @returns The resolved value of the promise.
 * @throws Error if the timeout is reached before the promise resolves.
 */
export async function withTimeout<T>(
  promise: Promise<T>,
  ms: number,
  label: string,
): Promise<T> {
  let timeoutHandle: NodeJS.Timeout | null = null;

  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutHandle = setTimeout(() => {
      reject(new Error(`${label} timed out after ${ms}ms.`));
    }, ms);
  });

  try {
    return await Promise.race([promise, timeoutPromise]);
  } finally {
    if (timeoutHandle) {
      clearTimeout(timeoutHandle);
    }
  }
}
