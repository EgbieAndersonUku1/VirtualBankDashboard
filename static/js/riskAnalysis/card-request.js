import { warnError } from "../logger.js";
import { toggleSpinner } from "../utils.js";


const cardRequestForm                  = document.getElementById("card-request-form");
const cardRequestEmploymentContainer   = document.getElementById("card-request-employment-information");
const employmentMessageElement         = document.getElementById("card-request-employment-details-message");
const employmentContainerElement       = document.getElementById("employment-container");
const employmentSpinner                = document.getElementById("employment-details-spinner")


cardRequestForm?.addEventListener("submit", handleCardRequest);

cardRequestEmploymentContainer?.addEventListener("click",  handleDelegation);

// console.log(cardRequestEmploymentContainer)



function goToNextPage(page) {
    location.href =  page;
}





/**
 * Handles the card request form submission and validates user input.
 */
function handleCardRequest(e) {
    e.preventDefault();

    if (!cardRequestForm.reportValidity()) {
        return;
    }

    goToNextPage("employment-details.html")
}



function handleDelegation(e) {
  
  const selectRadioInput = e.target.closest("input[type='radio']")

  if (!selectRadioInput) return;

  handleEmploymentContainer(selectRadioInput);

    
}


function handleEmploymentContainer(radioInputElement) {

    if (!radioInputElement) {
        warnError("handleEmploymentContainer", {
            error: "Received null instead of radio input value"
        });
        return;
    }

    switch(radioInputElement.value.toLowerCase()) {

        case "yes":
           toggleElementHelper(employmentContainerElement);
           toggleElementHelper(employmentMessageElement, false)
           break;
        
        case "no":
           toggleElementHelper(employmentContainerElement, false);
           toggleElementHelper(employmentMessageElement, true)
           break;

    }

}




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