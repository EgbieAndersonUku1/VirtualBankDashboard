import { warnError, logError } from "../logger.js";
import { selectElement, toggleSpinner } from "../utils.js";

const hiddenInputFields = document.querySelectorAll(".profile-input-hidden-field");
const dashboard         = document.getElementById("dashboard");


// hidden form values
// checks if hiddenInputFieds are all nodelist
document.addEventListener("DOMContentLoaded", () => {
    
    if (!(hiddenInputFields instanceof NodeList)) {

        logError("updateHiddenInputField", {
            result: "The hidden input fields is not a node list",
            hiddenInputFields: hiddenInputFields,
            typeOfFields: typeof hiddenInputFields,
            
        })
        return;
    };
})




// TODO add one time checker here for one time static element check
dashboard.addEventListener("click", handleDelegation);
dashboard.addEventListener("change", handleDelegation)




// This cache stores references to input, spinner, and label elements for each field.
//
// Although these elements exist in the DOM on page load, they are initially hidden.
// Without caching, we would need to repeatedly query the DOM every time the user
// clicks "Edit", which is inefficient and unnecessary.
//
// Instead, the first time an "Edit" action occurs, we locate the relevant elements
// and store them in this cache using their associated ID. Now on subsquent clicks are then
// retrieve the elements directly from memory rather than querying the DOM again.
//
// This improves performance and keeps the logic cleaner by avoiding repeated DOM lookups.
const cacheHiddenInputElements = {
    inputElements: {},

    getInputElementById(id) {
        const data = this.inputElements[id];
        return data === undefined ? null : data;

    },

    setInputElementToCache(element, spinnerElement, fieldLabelElement,  id) {
        this.inputElements[id] = {
            element: element,
            spinnerElement: spinnerElement,
            labelElement: fieldLabelElement
        }
    },

}




/**
 * Delegates wallet connection UI events to WalletWizard.
 * @param {Event} e Click or submit event.
 */
function handleDelegation(e) {

   const EXPECTED_CLASS_SELECTOR  = "profile_edit";
   const EDIT = "edit";
   const SAVE = "save"

   if (!e.target.classList.contains(EXPECTED_CLASS_SELECTOR)) return false;
  
    const linkTextContent = e.target.textContent.toLowerCase().trim();
    switch(linkTextContent) {

        case EDIT:
            handleEditClick(e);
            break;
        case SAVE:
            handleSaveClick(e);
            break;
    }
   
}




/**
 * Handles the "Edit" click event for a profile field.
 *
 * This function retrieves the associated input/select element, spinner,
 * and label for the clicked field. It first attempts to fetch these elements
 * from the cache. If they are not cached, it queries the DOM, stores them
 * in the cache, and then retrieves them.
 *
 * Once the required elements are available, it passes them to
 * `showhiddenStats` to toggle the UI into edit mode.
 *
 * @param {Event} e - The click event triggered by the "Edit" link.
 *
 * @returns {void} Early returns if required elements cannot be found.
 *
 * Workflow:
 * 1. Extract the field ID from the clicked element.
 * 2. Attempt to retrieve cached DOM references for that field.
 * 3. If not cached:
 *    - Query the DOM for input/select, spinner, and label elements.
 *    - Store them in the cache for future use.
 * 4. Pass the retrieved elements to the UI handler.
 */
function handleEditClick(e) {

  const inputFieldId = parseIdFromEvent(e);
  let data           = cacheHiddenInputElements.getInputElementById(inputFieldId);


  if (data === null) {

    console.log("Not found, getting and storing elements to cache");

    const parent         = e.target.parentElement;
    const element        = parent.querySelector("input") || parent.querySelector("select");
    const spinnerElement = parent.querySelector('[data-spinner="true"]');
    const fieldLabel     = parent.querySelector(".profile-p-label-value");
    

    if (!element || !spinnerElement || !fieldLabel) return;

    cacheHiddenInputElements.setInputElementToCache(element, spinnerElement, fieldLabel, inputFieldId);

    data = cacheHiddenInputElements.getInputElementById(inputFieldId);
 

  } else {
    
    console.log("Retrieving elementts from cache...");

  }
  
   const link = e.target;
   showhiddenStats(data, link);


}





/**
 * Toggles a profile field into "edit mode" with a loading spinner effect.
 *
 * This function simulates a short loading state by displaying a spinner,
 * then reveals the input/select element while hiding the label. It also
 * updates the "Edit" link to a "Save" state.
 *
 * @param {Object} data - Cached DOM references for the field.
 * @param {HTMLElement} data.element - The input or select element to show.
 * @param {HTMLElement} data.spinnerElement - The spinner element to toggle.
 * @param {HTMLElement} data.labelElement - The label element to hide.
 * @param {HTMLElement} link - The clicked "Edit" link element.
 *
 * @returns {void}
 */
function showhiddenStats(data, link) {

    const MILLI_SECONDS = 1000;

    toggleSpinner(data.spinnerElement, true);

    setTimeout(() => {

        toggleElement(data.element);
        toggleElement(data.labelElement, false);
        toggleSpinner(data.spinnerElement, false, false);
        handleLink.changeEditLinkToSave(link);

    }, MILLI_SECONDS);

 
}



/**
 * Extracts the input field ID from a click event.
 *
 * This function reads the `data-input-id` attribute from the event target,
 * which is expected to be the element that triggered the event (e.g. an
 * "Edit" link). 
 *
 * @param {Event} e - The event object triggered by user interaction.
 *
 * @returns {string|undefined} The value of `data-input-id` if present,
 * otherwise undefined. Returns early if the event is invalid.
 */
function parseIdFromEvent(e) {
    if (!(e && e.target)) {
        warnError("parseIdFromEvent", {
            expected: "Expected an event",
            received: e,
            type: typeof e,
        })
        return;
    }
    return e.target.dataset?.inputId;
}











/**
 * Toggles a CSS class on an element to control its visibility/state.
 *
 * When `show` is true, the provided CSS class is added to the element
 * (via `selectElement`). When false, the class is removed directly.
 *
 * @param {HTMLElement} element - The DOM element to modify.
 * @param {boolean} [show=true] - Determines whether to add or remove the class.
 * @param {string} [cssSelector="show"] - The CSS class to toggle.
 *
 * @returns {void} Returns early if `show` is not a boolean.
 *
 * Behaviour:
 * 1. Validates that `show` is a boolean.
 * 2. If true, applies the CSS class using `selectElement`.
 * 3. If false, removes the CSS class from the element.
 *
 * Note:
 * - This function assumes `selectElement` is responsible for adding the class.
 * - The default "show" class should control visibility via CSS and must be in the css file.
 */
function toggleElement(element, show = true, cssSelector = "show") {
    
    if (!(typeof show === "boolean")) return;


    if (show) {
        selectElement(element, cssSelector);
        return;
    }
   
    element.classList.remove(cssSelector);
 
}





/**
 * Handles the link by changing the link to either edit or save when it is clicked.
 * If the link is edit, it changes to save and vice versa.
 */
const handleLink = {
    setLinkText(link, text) {
        const isValid = this._validateLink(link, "setLinkText");
        if (!isValid) return false;

        link.textContent = text;
    },

    changeEditLinkToSave(link) {
        this.setLinkText(link, "Save");
    },

    changeSaveLinkToEdit(link) {
        this.setLinkText(link, "Edit");
    },

    _validateLink(link, caller) {
        if (!(link instanceof HTMLAnchorElement)) {
            warnError(caller, {
                link: link,
                typeOfLink: typeof link,
                expected: "Expected an anchor link",
            });
            return false;
        }
        return true;
    }
};





/**
 * Handles the "Save" click event for a profile field.
 *
 * This function updates the visible label with the value from the input/select
 * element, then transitions the UI back to "view mode". 
 *
 * @param {Event} e - The click event triggered by the "Save" link.
 *
 * @returns {void}
 *
 * Note:
 * - Assumes the field has already been cached during the edit phase.
 * - This function currently simulates saving; no backend request is made.
 */
function handleSaveClick(e) {
   const id = parseIdFromEvent(e);

   const data = cacheHiddenInputElements.getInputElementById(id)
   data.labelElement.textContent = data.element.value;


   const MILLI_SECONDS = 1000;
   
   toggleSpinner(data.spinnerElement, true)

   setTimeout(() => {
     toggleElement(data.element, false);
     toggleElement(data.labelElement, true);
     handleLink.changeSaveLinkToEdit(e.target);
      toggleSpinner(data.spinnerElement, false)

   }, MILLI_SECONDS)
  



}






