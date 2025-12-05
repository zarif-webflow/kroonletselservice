/**
 * A generic fetch utility with timeout and retry support.
 *
 * @param fetchCallback - A function that performs the fetch operation. Receives an AbortSignal for timeout handling.
 * @param options - Configuration options for timeout and retries.
 * @param options.timeout - Timeout in milliseconds for each attempt (default: 5000).
 * @param options.retries - Number of retry attempts after the initial failure (default: 3).
 * @returns The Response object if successful, or null if all attempts fail.
 */
export async function fetchWithRetry(
  fetchCallback: (signal: AbortSignal) => Promise<Response>,
  { timeout, retries }: { timeout: number; retries: number }
): Promise<Response | null> {
  const totalAttempts = retries + 1; // Initial attempt + retries

  for (let attempt = 1; attempt <= totalAttempts; attempt++) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetchCallback(controller.signal);
      clearTimeout(timeoutId);
      return response;
    } catch (error: unknown) {
      clearTimeout(timeoutId);

      const isLastAttempt = attempt === totalAttempts;
      const isTimeoutError = error instanceof DOMException && error.name === "AbortError";

      if (isLastAttempt) {
        console.error(`❌ Fetch failed after ${totalAttempts} attempts.`, error);
        return null;
      }

      if (isTimeoutError) {
        console.debug(
          `⏱️ Attempt ${attempt}/${totalAttempts} timed out after ${timeout}ms. Retrying immediately...`
        );
      } else {
        console.debug(
          `⚠️ Attempt ${attempt}/${totalAttempts} failed. Retrying immediately...`,
          error
        );
      }
    }
  }

  return null;
}
