import { warnError } from "../logger.js";
import { toggleSpinner, toggleRequiredInput, isFormFieldEmpty, toTitle, getSessionId } from "../utils.js";
import { parseFormData } from "../formUtils.js";
import { getLocalStorage, setLocalStorage, removeFromLocalStorage } from "../db.js";


const cardRequestForm                   = document.getElementById("card-request-form");
const employmentRequestForm             = document.getElementById("card-request-employment-form")
const cardRequestEmploymentContainer    = document.getElementById("card-request-employment-information");
const employmentMessageElement          = document.getElementById("card-request-employment-details-message");
const employmentContainerElement        = document.getElementById("employment-container");
const employmentSpinner                 = document.getElementById("employment-details-spinner");
const requiredEmploymentInputFields     = document.querySelectorAll(".required-input");
const personalInformationReviewElements = document.querySelectorAll("#personal-information-review dd");
const deliveryAddressElements           = document.querySelectorAll("#delivery-address-review dd");
const employmentElements                = document.querySelectorAll("#employment-review dd")


// event listeners
cardRequestForm?.addEventListener("submit", handleCardRequest);
employmentRequestForm?.addEventListener("submit", handleCardEmploymentRequest)
cardRequestEmploymentContainer?.addEventListener("click",  handleEmploymentOptions);



// listen when page is loaded
document.addEventListener("DOMContentLoaded", () => {
    // since the are you employed is on `no` by default
    // the required fields must be set to false as well othewise
    // clicking next will result in a focusable error
    toggleRequiredInput({elementsNodeList: requiredEmploymentInputFields, required: false});
    state.employment.employed = false;
    saveSessionState(state)


    populatePersonalInformationReviewData();
    populateEmploymentInformationData();
    
})



/**
 * Gets the state for the current browser session.
 *
 * The session state is automatically created the first time
 * it is requested and reused for the lifetime of the browser tab.
 *
 * @returns {Object} The session state.
 */
function getSessionState() {
    const sessionId = getSessionId();

    let sessionState = getLocalStorage(sessionId) 

    // get Local storage returns an empty array if there is no data
    if (Array.isArray(sessionState)) {
        sessionState = {};
        sessionState.formCompletion = {
                        cardRequest: null,
                        employmentRequest: null,
                        }
        
        sessionState.employment  = {employed: false}
    }


    return sessionState;
}



/**
 * Takes a session state and saves it to the local storage.
 * This function is needed to keep track of the form completion stages
 * 
 * @param {*} sessionState - The state for each stage of the form
 */
function saveSessionState(sessionState) {
    const sessionId = getSessionId();
    setLocalStorage(sessionId, sessionState)
}



/**
 * Takes a page and redirects to that page
 * 
 * @param {*} page - The page to tranverse to
 */
function goToNextPage(page) {
    location.href =  page;
}




const state = getSessionState();




/**
 * A helper function that handles a form submission.
 *
 * Validates the form, processes the
 * required fields together with any optional fields that contain a value, and
 * stores the processed form data using the specified session name.
 * 
 * Note:
 * 
 * This is not intended to be used on its own. It must be called from
 * a form submission and the relevant data passed.
 * 
 *
 * @param {Object} options - Configuration object.
 * @param {SubmitEvent} options.e - The form submission event.
 * @param {HTMLFormElement} options.form - The form being submitted.
 * @param {string[]} options.requiredFields - The names of fields that should always be processed.
 * @param {string[]} options.optionalFields - The names of optional fields to process only when they contain a value. Default empty array.
 * @param {string} options.sessionName - The storage key used to save the processed form data. Default name `session`
 *
 * @returns {void}
 *
 * @example
 * handleFormSubmission({
 *     e,
 *     form,
 *     requiredFields,
 *     optionalFields,
 *     sessionName: "card-request"
 * });
 */
function handleFormSubmission({ e,
                            form,
                            requiredFields,
                            optionalFields = [],
                            sessionName = "session",
                        }) {

    e.preventDefault();

    if (!form.reportValidity()) {
        return;
    }

    if (!Array.isArray(optionalFields)) {
        throw new Error("The optional fields must be an array or an empty array")
    }


    if (typeof sessionName !== "string") {
        throw new Error("The session name parameter must be a string")
    }

    const fieldsToProcess = [...requiredFields];

    optionalFields.forEach((fieldName) => {
        if (!isFormFieldEmpty({ form, fieldName })) {
            fieldsToProcess.push(fieldName);
        }
    });

    const parsedFormData = parseFormData(new FormData(form), fieldsToProcess);

    setLocalStorage(sessionName, parsedFormData);
}





/**
 * Handles the card request form submission and validates user input.
 */
function handleCardRequest(e) {
  
    handleFormSubmission({
        e: e,
        form: cardRequestForm,
        requiredFields: [
            "card-request-full-name",
            "card-request-phone-number",
            "requested-card-account-type",
            "requested-card-category",
            "requested-card-network",
            "card-request-address1",
            "card-request-county",
            "card-request-location",
            "card-request-postcode",
        
        ],

        optionalFields: [
            "card-request-special-request",
            "card-request-address2",

        ],

    sessionName: "cardRequestInformation",

    })
   
    state.formCompletion.cardRequest = true;
    saveSessionState(state);

    goToNextPage("employment-details.html")
}








/**
 * Handles the employments request form submission and validates user input.
 */
function handleCardEmploymentRequest(e) {

    const sessionName = "employmentInformation";


    if (!state.employment.employed ) {

        e.preventDefault();
        setLocalStorage(sessionName, {
           
                employerName: "N/A",
                requestedEmploymentType: "N/A",
                yearsEmployed: "N/A",
                annualSalary: "N/A",
                contractType: "N/A",
                payFrequency: "N/A"
                }
            )
      
    } else {

        handleFormSubmission( {
            e: e,
            form: employmentRequestForm,
            requiredFields: ["employer-name",
                            "requested-employment-type",
                            "years-employed",
                            "annual-salary",
                            "pay-frequency",
                            "contract-type"
                        ],

            sessionName: sessionName

          })

    }

  
    state.formCompletion.employmentRequest = true;
    saveSessionState(state);

    goToNextPage("review-and-confirm.html")
}










/**
 * Handles changes to the employment status radio buttons.
 *
 * Updates the UI based on whether the user is currently employed by
 * showing or hiding the employment details section, displaying the
 * appropriate message, toggling the required state of the employment
 * input fields, and persisting the user's employment status to session
 * storage.
 *
 * @param {Event} e - The change event triggered by selecting an
 * employment status radio button.
 *
 * @returns {void}
 */
function handleEmploymentOptions(e) {

     const radioInputElement = e.target.closest("input[type='radio']")

    if (!radioInputElement) {
        warnError("handleEmploymentContainer", {
            error: "Received null instead of radio input value"
        });
        return;
    }

    switch(radioInputElement.value.toLowerCase()) {

        case "yes":
           toggleElementHelper(employmentContainerElement);
           toggleElementHelper(employmentMessageElement, false);

           toggleRequiredInput({elementsNodeList: requiredEmploymentInputFields, required: true});

           state.employment.employed = true;
           saveSessionState(state)

           break;
        
        case "no":
           toggleElementHelper(employmentContainerElement, false);
           toggleElementHelper(employmentMessageElement, true);
           toggleRequiredInput({elementsNodeList: requiredEmploymentInputFields, required: false});
        
           state.employment.employed = false;
           saveSessionState(state)

           break;

    }

}



/**
 * Shows or hides an element after displaying a loading spinner for a
 * short delay.
 * @param {HTMLElement|null} element - The element to show or hide.
 * @param {boolean} [show=true] - Determines whether the element should
 * be displayed (`true`) or hidden (`false`).
 *
 * @returns {void}
 */
function toggleElementHelper(element, show = true) {
    if (!element) {
        return;
    }

    if (typeof show !== "boolean") {
        warnError("toggleEmploymentHelper");
        return;
    }

    const DELAY_MS = 1000;

    toggleSpinner(employmentSpinner)
    setTimeout(() => {
        toggleSpinner(employmentSpinner, false)
        element.style.display = show ? "block" : "none";
    }, DELAY_MS)

 
}



/**
 * Combines up to two address lines into a single formatted string.
 *
 * Only non-empty address values are included in the returned string.
 * If both addresses are provided, they are separated by a single space.
 *
 * @param {string} [address1] - The first address line.
 * @param {string} [address2] - The second address line.
 *
 * @returns {string} The combined address.
 *
 * @throws {Error} If either address is provided and is not a string.
 */
function combineAddresses(address1, address2) {
    
    const fullAddress = [];

    if ((address1 && typeof address1 !== "string") ||  (address2 && typeof address2 !== "string")) {
       throw new Error("One or more of the address is not type string")
    }

    if (address1) {
        fullAddress.push(address1)
    }

    if (address2) {
        fullAddress.push(address2)
    }

    return fullAddress.join(" ")
}



/**
 * Validates that a collection of DOM elements contains the required number
 * of elements before they are accessed.
 *
 * @param {Iterable<Element>} elements - The collection of DOM elements to validate.
 * @param {number} expectedLength - The minimum number of elements required.
 * @param {string} functionName - The name of the calling function for error logging.
 * @returns {Element[] | null} An array of elements if validation succeeds; otherwise, `null`.
 */
function validateRequiredElements(elements, expectedLength, functionName) {
    
    const nodeElements = Array.from(elements);
    

    if (nodeElements.length <= 0) {
        warnError("populatePersonalInformationReviewData", {
            error: "The element for personal data wasn't found"
        });
        return false;
    }

    if (nodeElements.length < expectedLength) {
        warnError(functionName, {
            error: "The length of node elemnts does not match the expected length",
            expectedLength: expectedLength,
        })

        return false;
    }

    return true;
}




/**
 * Handles the population of the personal information for the UI
 * @returns null
 */
function populatePersonalInformationReviewData() {

  
    const EXPECTED_FIELD_LENGTH = 4

    if (!validateRequiredElements(personalInformationReviewElements, 
                                  EXPECTED_FIELD_LENGTH, 
                                  "personalInformationReviewData"
                                 )) {
        return;
    }

    
    if (!state.formCompletion.cardRequest) {
        return;
    }
    const [fullName, cardType, cardVariant, phoneNumber]        = personalInformationReviewElements;
    const [deliveryAddress, town, postCode, specialInstruction] = deliveryAddressElements;

    const data = getLocalStorage("cardRequestInformation");

    if (!data) return;


    fullName.textContent                =  toTitle(data.cardRequestFullName) || "Not added";
    cardType.textContent                =  toTitle(data.requestedCardAccountType) || "Not added";;
    cardVariant.textContent             =  toTitle(data.requestedCardCategory) || "Not added";;
    phoneNumber.textContent             =  data.cardRequestPhoneNumber || "Not added";
    deliveryAddress.textContent         =  combineAddresses(data.cardRequestAddress1, data.cardRequestAddress2 ?? "");
    town.textContent                    =  data.cardRequestCounty;
    postCode.textContent                =  data.cardRequestPostcode;
    specialInstruction.textContent      =  data.cardRequestSpecialRequest ?? "No special instructions given";

}




/**
 * Handles the population of the employment information in the UI
 * @returns null
 */
function populateEmploymentInformationData() {
    
    const EXPECTED_FIELD_LENGTH = 7;
    if (!validateRequiredElements(employmentElements, 
                                EXPECTED_FIELD_LENGTH, 
                                "populateEmploymentInformationData")) {
        return;
    }

    const [employmentStatus, 
          employmentType, 
          employmentName, 
          yearsEmployed, 
          annualSalary, 
          paymentFrequency,
          contractType
        ] = employmentElements;

   
    if (!state.formCompletion.employmentRequest) {
        return;
    }

    const data = getLocalStorage("employmentInformation");

    if (!data) return;
    
    employmentStatus.textContent = state.employment.employed  ? "Employed" : "Unemployed";
    employmentType.textContent   =  toTitle(data.requestedEmploymentType.split("-").join(" "));
    employmentName.textContent   = toTitle(data.employerName);
    yearsEmployed.textContent    = data.yearsEmployed;
    paymentFrequency.textContent = data.payFrequency;
    contractType.textContent     = data.contractType;
    annualSalary.textContent     = data.annualSalary.split("-").join(" ")
    

}