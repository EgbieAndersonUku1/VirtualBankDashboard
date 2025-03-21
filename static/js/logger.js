/**
 * Logs errors to the console with a consistent format.
 * @param {string} functionName - The name of the function where the error occurred.
 * @param {Error} error - The error object to log.
 */
export function logError(functionName, error)  {
    const timestamp = new Date().toISOString();
    console.error(`[${timestamp}] Error in ${functionName}:`, error);
}