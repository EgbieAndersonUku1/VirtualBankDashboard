import { selectElement, toggleSpinner, toTitle } from "../utils.js";
import { warnError } from "../logger.js";
import { parseFormData } from "../formUtils.js";
import { AlertUtils } from "../alerts.js";


const transferSection  = document.getElementById("dashboard-transfer");
const recipientSelects = document.getElementById("recipient")
const addRecipient     = document.getElementById("add-recipient-section")
const findRecipientForm    =  document.getElementById("find-recipient-form");
const transferSchedule    = document.getElementById("bank-transfer-schedule");
const futureScheduleDateContainer = document.getElementById("future-schedule-date");
const addRecipientSpinner = document.getElementById("add-recipient__spinner");
const verifiedUserPanel   = document.getElementById("transfer-to-user");
const verifiedUserName    = document.getElementById("verified-user-name")
const scheduleDateTimeInputField = document.getElementById("future-schedule-date-input")


// todo add one time check if static elements abovie exists before calling them in functions

transferSection.addEventListener("click", handleDelegation);
recipientSelects.addEventListener("change", handleRecipientSelection);
transferSchedule.addEventListener("change", handleTransferScheduleSelection)
findRecipientForm.addEventListener("submit", handleFindRecipientFormSubmission)


function handleDelegation(e) {
 
    handleRecipientSelectionClose(e);
   
   
}


function handleTransferScheduleSelection(e) {
 
   if (e.target.dataset.transferType !== "true") return;

   const selectValue = e.target.value;
   const SCHEDULE_FOR_LATER = "future_date"

   if (selectValue === SCHEDULE_FOR_LATER) {
        //  console.log("I am here")
        scheduleDateTimeInputField.required = true;
        futureScheduleDateContainer.classList.remove("hide");
        return;
   } 

    scheduleDateTimeInputField.required = false;
   futureScheduleDateContainer.classList.add("hide")
  
}


function handleRecipientSelection(e) {
    if (e.target.dataset.recipient !== "true") return;

    toggleFindRecipient()
}




/**
 * Toggle the "Find Recipient" modal in the transfer form.
 *
 * When `show` is true, the modal appears, allowing the user to enter recipient details.
 * When `show` is false, the modal hides. The recipient select field can optionally 
 * reset to its default state depending on user interaction.
 *
 * @param {boolean} show - Whether to display the modal. Defaults to true.
 * @param {boolean} resetSelectOption - Determines if the recipient select field should be reset 
 *                                      when hiding the modal. Defaults to true.
 *
 * Behaviour:
 *   - true: Clears the select field when the modal is closed. Use when the user cancels 
 *           the action to start fresh.
 *   - false: Preserves the current selection. Use when the user has already interacted 
 *            with the field and the selection should be maintained.
 *
 * @returns {void}
 */
function toggleFindRecipient(show = true, resetSelectOption = true) {
    const booleanType = typeof show;

    if (booleanType !== "boolean") {
        warnError("toggleFindRecipient", {
            type: booleanType,
            msg: "Expected a boolean",
            received: `Received a value of ${show}`

        })
        return;
    }
  

    if (show) {
        selectElement(addRecipient, "show");
        return;
    }
   
    addRecipient.classList.remove("show");

    if (resetSelectOption) {
         recipientSelects.value = "";
    }
   
}





/**
 * Handles closing the "Find Recipient" modal when the close button is clicked.
 *
 * This function listens for click events on the modal. If the target element
 * is the designated close button, it hides the modal by calling `toggleFindRecipient(false)`.
 *
 * @param {Event} e - The click event triggered by the user.
 *
 * @returns {void}
 */
function handleRecipientSelectionClose(e) {
    if (e.target.id !== "find-recipient-close-btn") return;
    toggleFindRecipient(false)

}






/**
 * Extracts and parses data from the "Find Recipient" form.
 *
 * This function collects all form fields using FormData and ensures that the
 * required fields are included. The resulting object is filtered and formatted
 * using the `parseFormData` helper function.
 *
 * @returns {Object} parsedFormData - An object containing the validated and parsed form data.
 *
 * Required fields:
 *   - first_name, surname
 *   - sortcode_1 to sortcode_6
 *   - account_digit_1 to account_digit_8
 *
 * Note: Ensure `findRecipientForm` is correctly selected in the DOM before calling.
 */
function getParseFormData() {
      const formData = new FormData(findRecipientForm);
        const requiredFields = [
           "first_name",
           "surname",
           "sortcode_1",
           "sortcode_2",
           "sortcode_3",
           "sortcode_4",
           "sortcode_5",
           "sortcode_6",
           "account_digit_1",
           "account_digit_2",
           "account_digit_3",
           "account_digit_4",
           "account_digit_5",
           "account_digit_6",
           "account_digit_7",
           "account_digit_8",
        
        ];
    
        const parsedFormData = parseFormData(formData, requiredFields);
        return parsedFormData;
}




/**
 * Extracts and formats sort code and account number from form data.
 *
 * This function scans an object containing recipient form data and returns the 
 * sort code and account number within an object
 *
 * @param {Object} data - The form data object, typically returned by `getParseFormData`.
 *
 * @returns {Object} account - An object containing:
 *   - sortCode {string} - Full 6-digit sort code.
 *   - accountNumber {string} - Full 8-digit account number.
 *
 * @throws Will warn if `data` is not an object.
 *
 * Example:
 *   Input: { sortcode_1: "4", sortcode_2: "0", ..., account_digit_1: "1", ... }
 *   Output: { sortCode: "400000", accountNumber: "12345678" }
 */
function getAccountDetailsFromData(data){
    
    if (typeof data !== "object") {
        warnError("getAccountNumberFromData", {
            type: typeof data,
            expected: "Expected an object",
            received: `Value received ${data}`
        });
        return;
    }

    const sortCode      = [];
    const accountNumber = []
    const account       = {}

    for (const [key, value] of Object.entries(data)) {
    
        if (key.startsWith("sort")) {
            sortCode.push(value)
        }
        
        if (key.startsWith("account")) {
            accountNumber.push(value)
        }
    }

    account.sortCode = sortCode.join("");
    account.accountNumber  = accountNumber.join("");
    return account

}





/**
 * Handles the submission of the "Find Recipient" form.
 
 * @param {Event} e - The submit event triggered by the form.
 *
 * @returns {void}
 */
function handleFindRecipientFormSubmission(e) {
    e.preventDefault();
    const MILL_SECONDS = 1000;
    const parsedFormData = getParseFormData();
    const accountDetails = getAccountDetailsFromData(parsedFormData)
    
    toggleSpinner(addRecipientSpinner, true, true)
    setTimeout(() => {
         toggleSpinner(addRecipientSpinner, false, true)
          const isAccountNumberCorrect = isAccountDetailsCorrect(accountDetails);

        //    console.log(isAccountNumberCorrect)
            // Simulated response for testing.
            // When the backend is built it will verify the account via fetch.
            if (isAccountNumberCorrect) {
                AlertUtils.showAlert({
                    title: "Account recipient found",
                    text: "The recipient account was found. You can proceed with the transfer.",
                    icon: "success",
                    confirmButtonText: "OK"
                })
                toggleFindRecipient(false, false);
                showVerifiedUser(parsedFormData.firstName, parsedFormData.surname)
                return
            } else {
                AlertUtils.showAlert({
                    title: "Account recipient not found",
                    text: "No matching account was found. For this simulation the sort code must start with the digits 400.",
                    icon: "error",
                    confirmButtonText: "OK"
                })
            }
    }, MILL_SECONDS)
    

}





/**
 * Verifies whether the given account details are valid.
 *
 * @param {Object} accountDetails - An object containing the account information.
 *   Expected properties:
 *     - sortCode {string} - The 6-digit sort code.
 *     - accountNumber {string} - The 8-digit account number.
 *
 * @returns {boolean} - Returns true if the account details pass validation, false otherwise.
 *
 * Example:
 *   const details = { sortCode: "400123", accountNumber: "12345678" };
 *   isAccountDetailsCorrect(details); // returns true
 */
function isAccountDetailsCorrect(accountDetails) {
    if (typeof accountDetails !== "object") {
        warnError("verifyAccountDetails", {
            type: typeof accountDetails,
            expected: "Expected an object",
            received: `Value received ${accountDetails}`
        });
        return;
    }

    console.log(accountDetails);

    // for now we simulate the authentication respoonse. Later the actually authentication response data will come from the backend
    const isSortCodeValid = accountDetails.sortCode.startsWith("400");
   
    return isSortCodeValid ? true : false;


};





/**
 * Displays the verified user panel with the user's full name.

 *
 * @param {string} firstName - The user's first name.
 * @param {string} surname - The user's surname.
 *
 * @returns {void}
 *
 * Behaviour:
 *   - If either `firstName` or `surname` is missing, the function exits without doing anything.
 *   - If either parameter is not a string, a warning is issued via `warnError` and the panel is not shown.
 *   - Otherwise, the panel is displayed and the name is formatted with proper capitalization.
 *
 * Example:
 *   showVerifiedUser("Doctor", "Who");
 *   // Verified user panel displays: "Doctor Who"
 */
function showVerifiedUser(firstName, surname) {
    // console.log(firstName);
    // console.log(surname)
    if (!(firstName && surname)) return;

    if (typeof firstName !== "string" && typeof surname !== "string") {
        warnError("showVerifiedUser", {
            firstName: firstName,
            surname: surname,
            firstNameType: typeof firstName,
            surnameType: typeof surname,
            expected: "Expected both values to be string"
        })
        return;
    }
    // console.log("I am here")
    selectElement(verifiedUserPanel, "show");
    verifiedUserName.textContent = `${toTitle(firstName)} ${toTitle(surname)}`
    
}