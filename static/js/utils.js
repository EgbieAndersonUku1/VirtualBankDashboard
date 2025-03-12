import { specialChars } from "./specialChars.js";

  
export function checkIfHTMLElement(element, elementName = "Unknown") {
    if (!(element instanceof HTMLElement)) {
        console.error(`Could not find the element: '${elementName}'. Ensure the selector is correct.`);
        return false;
    }
    return true;
}


export function generateRandomID(maxDigit=10000000) {
    if (maxDigit <= 0) {
        throw Error(`The max digit cannot be less or equal to 0. Expected a number higher than 0 but got ${maxDigit}`)
    }
    return Math.ceil(Math.random() * maxDigit);
}


/**
 * Toggles the visibility of the spinner.
 * 
 * This function shows or hides the spinner by setting its display property to either 'block' or 'none'.
 * 
 * @param {boolean} [show=true] - A boolean indicating whether to show or hide the spinner.
 *                               If `true`, the spinner is shown; if `false`, it is hidden.
 */
export function toggleSpinner(spinnerElement, show=true, hideScroller=false) {
    if (!checkIfHTMLElement(spinnerElement)) {
        console.error("Missing spinner element");
    }
    spinnerElement.style.display = show ? "block"  : "none";

    if (hideScroller) {
        toggleScrolling(show);
    }
   
}


/**
 * Shows the spinner for a specified duration and then hides it.
 * 
 * This function uses the `toggleSpinner` function to show the spinner immediately,
 * and then hides it after the specified amount of time (default is 500ms).
 * 
 * @param {HTMLElement} spinnerElement - The spinner element to display.
 * @param {number} [timeToDisplay=500] - The duration (in milliseconds) to display the spinner. Defaults to 500ms.
 */
export function showSpinnerFor(spinnerElement, timeToDisplay = 500) {
    toggleSpinner(spinnerElement); 

    setTimeout(() => {
        toggleSpinner(spinnerElement, false);  
    }, timeToDisplay);
}


export function toggleScrolling(disable) {
    document.body.style.overflow = disable ? "hidden" : "auto";
}


export function findByIndex(id, items) {
    if (!Array.isArray(items)) {
        throw new Error(`Expected an array, but got ${typeof items}`);
    }
    
    if (id === undefined || id === null) {
        throw new Error(`Invalid id: ${id}`);
    }
    
    return items.findIndex((item) => item?.id === id);
}


/**
 * Sanitizes the input text based on the specified criteria:
 * - Optionally removes non-numeric characters.
 * - Optionally removes non-alphabet characters.
 * - Optionally ensures that specific special characters are included and valid.
 * - Removes hyphens from the input text.
 *
 * @param {string} text - The input text to be sanitized.
 * @param {boolean} [onlyNumbers=false] - If true, removes all non-numeric characters.
 * @param {boolean} [onlyChars=false] - If true, removes all non-alphabetic characters.
 * @param {Array<string>} [includeChars=[]] - An array of special characters that should be included in the text.
 * @throws {Error} If `includeChars` is not an array or contains invalid characters that are not in the `specialChars` list.
 * @returns {string} - The sanitized version of the input text.
 *
 * @example
 * // Only numbers will remain (non-numeric characters removed)
 * sanitizeText('abc123', true); 
 * // Output: '123'
 *
 * @example
 * // Only alphabetic characters will remain (non-alphabet characters removed)
 * sanitizeText('abc123!@#', false, true);
 * // Output: 'abc'
 *
 * @example
 * // Ensures specific special characters are valid (will remove invalid ones)
 * sanitizeText('@hello!world', false, false, ['!', '@']);
 * // Output: '@hello!world' (if both '!' and '@' are in the valid list of special characters)
 *
 * @example
 * // Removes hyphens from the input
 * sanitizeText('my-name-is', false, false);
 * // Output: 'mynameis'
 */
export function sanitizeText(text, onlyNumbers = false, onlyChars = false, includeChars = []) {
    if (!Array.isArray(includeChars)) {
        throw new Error(`Expected an array but got type ${typeof includeChars}`);
    }

    const INCLUDE_CHARS_ARRAY_LENGTH = includeChars.length;

    if (!Array.isArray(includeChars)) {
        throw new Error(`Expected an array but got ${typeof includeChars}`);
    }

    if (INCLUDE_CHARS_ARRAY_LENGTH > 0) {
        const invalidChar = includeChars.find(char => !specialChars[char]);
        if (invalidChar) {
            throw new Error(`Expected a special character but got ${invalidChar}`);
        }
    }

    if (onlyNumbers) {
        return text.replace(/\D+/g, ""); 
    }

    if (onlyChars) {
        if (INCLUDE_CHARS_ARRAY_LENGTH > 0) {
            return text.replace(/[^A-Za-z]/g, (match) => {
                return includeChars.includes(match) ? match : '';  // Keep if allowed, otherwise remove
            });
        }
     
        return text.replace(/[^A-Za-z]/g, '');
    }

    return text ? text.split("-").join("") : ''; 
}



/**
 * Formats a UK mobile number into the international format: `+44 (prefix) exchangeNumber`.
 * 
 * @param {string} number - The UK mobile number to format.
 * 
 * @throws {Error} If the number is invalid for any of the following reasons:
 *      - The number is not a UK mobile number (i.e., length is not exactly 11 digits after cleaning).
 *      - The number does not start with a `0`.
 *      - The number starts with `08` since valid UK mobile numbers always start with `07`.
 * 
 * @returns {string} A formatted, valid UK mobile number in the form: `+44 (prefix) exchangeNumber`.
 * 
 * @example
 * formatUKMobileNumber("+44 7947 106 747")    // Returns: "+44 (7947) 106747"
 * formatUKMobileNumber("0044 7947 106 747")   // Returns: "+44 (7947) 106747"
 * formatUKMobileNumber("44 07947 106 747")    // Returns: "+44 (7947) 106747"
 * formatUKMobileNumber("+44 (0)7947-106-747") // Returns: "+44 (7947) 106747"
 * formatUKMobileNumber("07947106747")         // Returns: "+44 (7947) 106747"
 * formatUKMobileNumber("447947106747")        // Returns: "+44 (7947) 106747"
 * 
 * @example
 * // Errors:
 * formatUKMobileNumber("0797106747");      // Throws Error: Number must be exactly 11 digits long.
 * formatUKMobileNumber("07971067479255");  // Throws Error: Number must be exactly 11 digits long.
 * formatUKMobileNumber("08971067479255");  // Throws Error: Number must start with '07'.
 */
export function formatUKMobileNumber(number) {
    
    const cleanedNumber  = cleanUKMobileNumber(number);
    const prefix         = cleanedNumber.slice(1, 5);
    const exchangeNumber = cleanedNumber.slice(5);
  
    const formattedMobileNumber = `+44 (${prefix}) ${exchangeNumber}`;
    return formattedMobileNumber;
}



/**
 * Takes a UK mobile number and cleans the number to ensure it follows the correct format.
 * It handles various UK number prefixes and sanitizes the input to return a valid 11-digit number.
 * 
 * @param {string} mobileNumber - The mobile number to clean. Can be in formats like:
 *    - `+44 7947 106 747`
 *    - `0044 7947 106 747`
 *    - `44 07947 106 747`
 *    - `+44 (0)7947-106-747`
 *    - `0044(0)7947106747`
 *    - `07947106747`
 * 
 * @error Throws errors if:
 *    - The number does not start with a `0`.
 *    - The number length is not 11 digits.
 *    - The number starts with 08 since UK mobile numbers always start with `07`
 * 
 * @returns {string} A valid 11-digit UK mobile number.
 * 
 * Example usage:
 * 
 * // valid numbers
 * cleanUKMobileNumber("+44 7947 106 747")   // returns: 07947106747  // valid
 * cleanUKMobileNumber("0044 7947 106 747")  // returns: 07947106747  // valid
 * cleanUKMobileNumber("44 07947 106 747")   // returns: 07947106747  // valid
 * cleanUKMobileNumber("+44 (0)7947-106-747") // returns: 07947106747  // valid
 * cleanUKMobileNumber("07947106747")         // returns 07947106747  // valid
 * cleanUKMobileNumber("447947106747")       // teturns 07947106747  // valid
 * 
 * 
 * throws errors:
 * 
 * cleanUKMobileNumber("0797106747")     -> throws Error because the length is less than 11
 * cleanUKMobileNumber("07971067479255") -> throws Error because the length is greater than 11
 * cleanUKMobileNumber("08971067479255") -> throws Error Valid length but starts with `08` UK mobile numbers start with "07"
 */
export function cleanUKMobileNumber(mobileNumber) {
    
    // Replace various UK prefixes with '0' and handle cases like +44 (0)7 or 0044
   const digitsOnly                 = sanitizeText(mobileNumber, true).replace(/^(?:\+44|44|0044)0?/, "0");
   const VALID_UK_MOBILE_NUM_LENGTH = 11;

   if (!digitsOnly.startsWith("0")) {
       throw new Error("The number is invalid because it doesn't start with a 0");
   }

   if (digitsOnly.length != VALID_UK_MOBILE_NUM_LENGTH ){
       throw new Error(`This not a valid UK mobile number. Expected 11 digits got ${digitsOnly.length} `);
       
   }

   if (!digitsOnly.startsWith("07")) {
    const START_INDEX = 0;
    const END_INDEX   = 2;
    throw new Error(`UK mobile numbers always start with a "07". Expected a prefix of "07" but got ${digitsOnly.slice(START_INDEX, END_INDEX)}`);
    }
   return digitsOnly;
}


export function toTitle(text) {
    if (typeof text != "string") {
        throw new Error(`Expected a string but got text with type ${text} `);
    }

    const title = `${text.charAt(0).toUpperCase()}${text.slice(1).toLowerCase()}`;
    return title;
}