
// Object of valid top-level domains (TLDs) for quick O(1) lookups
const validTLDs = {
  'com': true, 'org': true, 'net': true, 'info': true, 'biz': true, 'name': true, 'pro': true,
  'gov': true, 'edu': true, 'mil': true, 'int': true, 'aero': true, 'coop': true, 'museum': true,
  'uk': true, 'us': true, 'ca': true, 'au': true, 'in': true, 'de': true, 'fr': true, 'cn': true,
  'jp': true, 'br': true, 'za': true, 'рф': true, '中国': true, 'مصر': true, 'भारत': true, 'السعودية': true,
  'tech': true, 'ai': true, 'app': true, 'dev': true, 'cloud': true, 'shop': true, 'travel': true,
  'hotel': true, 'doctor': true, 'law': true, 'photography': true, 'blog': true, 'xyz': true,
  'site': true, 'online': true, 'store': true, 'space': true, 'local': true, 'test': true,
  'example': true, 'onion': true, 'bit': true
};


/**
 * Checks if the given email address is valid using a regular expression.
 *
 * The function normalizes the input email address by converting it to lowercase and trimming spaces.
 * It then tests the email format against a regular expression pattern that matches valid email formats.
 *
 * @param {string} emailAddress - The email address to validate.
 * @returns {boolean} - Returns true if the email is valid, false otherwise.
 * 
 * @throws {Error} - Throws an error if the input is not a string or is empty.
 * @throws {Error} - Throws an error if the email has invalid email format.
 *  @throws {Error} - Throws an error if the email has an invalid TLD (top level domain).
 *
 * Example Usage:
 * 
 * // Valid email addresses
 * console.log(isValidEmail("user@example.com")); // true
 * console.log(isValidEmail("JOHN.DOE@domain.co.uk")); // true
 * 
 * // Invalid email addresses
 * console.log(isValidEmail("user@.com")); //  throws an invalid format error
 * console.log(isValidEmail("invalid-email")); // throws an invalid format error
 * console.log(isValidEmail("user@example")); // throws an invalid format error
 * 
 * // invalid top level domain e.g ".pet" 
 * console.log(isValidEmail("user@example.pet")); // throws an invalid tld error
 */
export function isValidEmail(emailAddress) {
  if (typeof emailAddress !== "string" || !emailAddress) {
    throw new Error(`Expected a string but got type ${typeof emailAddress}`);
  }

  let email = normalizeEmail(emailAddress);

  // Email regex pattern for validation
  const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  const isEmailFormatValid = emailPattern.test(email);

  if (!isEmailFormatValid) {
    throw new Error("The email address has an invalid format");
  }

  const emailParts = email.split("@")
  const domain     = emailParts[1]; 
  
   // Split the domain by dots and get the last part as the TLD
   const domainParts    = domain.split(".");
   const topLevelDomain = domainParts[domainParts.length - 1];

  const isTLDValid =  !!validTLDs[topLevelDomain];

  if (!isTLDValid) {
    throw new Error(`The top level domain provided is invalid - top level domain provided: ${topLevelDomain}`)
  }

  return true;
}



/**
 * Normalizes an email address by converting it to lowercase and removing any leading/trailing spaces.
 *
 * @param {string} email - The email address to normalize.
 * @returns {string} - The normalized email address.
 * 
 * @throws {Error} - Throws an error if the input is not a string or is empty.
 */
export function normalizeEmail(email) {
  if (!email || typeof email !== "string") {
    throw new Error(`The email entered cannot be empty and must be a string. Expected an email but got ${email} with type ${typeof email}`);
  }
  return email.toLowerCase().trim();  
}


