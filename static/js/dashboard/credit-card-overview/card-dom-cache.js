import { convertSnakeCaseToCamelCase, sanitizeText } from "../../utils.js";


const cacheElements = {};


/**
 * Converts a snake_case or kebab-case string to camelCase.
 *
 * The function normalises the input by converting it to lowercase,
 * then transforms any character following an underscore (_) or hyphen (-)
 * into its uppercase equivalent.
 *
 * The input is first sanitised using `sanitizeText`, which removes
 * invalid characters (e.g., #, ?) while keeping valid separators
 * like "_" and "-" for predictable camelCase conversion.
 *
 * Examples:
 * "user_name" -> "userName"
 * "user-name" -> "userName"
 * "USER_NAME" -> "userName"
 * "user#name" -> "userName" (invalid character removed)
 *
 * @param {string} value - The string to convert.
 * @returns {string} The camelCase formatted string.
 * @throws {Error} Throws an error if the provided value is not a string.
 */
function createCacheKey(selector) {
    const includeChars = [" ", "-", "_", "__"];

    // Remove invalid characters first, keep "_" and "-" for separators
    return convertSnakeCaseToCamelCase(sanitizeText(selector, false, true, includeChars));
}




/**
 * Retrieves a DOM element from an internal cache, querying the DOM if needed.
 *
 * This function provides a small DOM caching layer to prevent repeated
 * `document.getElementById` or `document.querySelector` calls, which can
 * become expensive when performed frequently.
 *
 * When called, the function will:
 * 1. Generate a cache key based on the provided selector.
 * 2. Check if the element already exists in the cache.
 * 3. If not cached and `queryElementIfNotFound` is true, query the DOM.
 * 4. Store the result in the cache for future lookups.
 *
 * Subsequent calls with the same selector will return the cached reference,
 * which improves performance and ensures consistent element access.
 *
 * @param {string} selector
 * The DOM selector used to retrieve the element.
 * - When `useQuerySelector` is false, this is treated as an element **id**.
 * - When `useQuerySelector` is true, this is treated as a **CSS selector**.
 *
 * @param {boolean} [useQuerySelector=false]
 * Determines how the element should be retrieved from the DOM.
 * - `false` → uses `document.getElementById(selector)`
 * - `true`  → uses `document.querySelector(selector)`
 *
 * This allows the function to support both simple ID lookups and more
 * complex CSS selectors.
 *
 * @param {boolean} [queryElementIfNotFound=true]
 * Controls whether the DOM should be queried if the element is not already
 * present in the cache.
 *
 * - `true`  → query the DOM and store the element in the cache.
 * - `false` → do **not** query the DOM and simply return the cached value
 *             if it exists.
 *
 * This is useful when you only want to access elements that have already
 * been cached without triggering a new DOM lookup.
 *
 * @returns {HTMLElement | null | undefined}
 * Returns the cached DOM element if found. If the element does not exist
 * and `queryElementIfNotFound` is false, the function may return `undefined`.
 */
export function getElementFromCache(selector, useQuerySelector = false, queryElementIfNotFound = true) {

    const key = createCacheKey(selector);

    if (cacheElements[key]) {
        return cacheElements[key];
    }

    if (queryElementIfNotFound) {
        cacheElements[key] =
            !useQuerySelector
                ? document.getElementById(selector)
                : document.querySelector(selector);
    }

    return cacheElements[key];
}


/**
 * Takes a key and a value and saves it to the cache
 * 
 * @param {*} key 
 * @param {*} value 
 * @error {*} Raise an error if the key is not a string
 */
export function saveToCache(key, value) {
    if (typeof key !== "string") {
        throw new Error(`Expected a string but got type = ${typeof key} with value = ${value}`)
    }

    cacheElements[key] = value;
}