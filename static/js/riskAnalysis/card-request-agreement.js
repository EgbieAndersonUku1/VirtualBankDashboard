import { getSessionState, removeSavedSession } from "./stateSession.js";
import { AlertUtils } from "../alerts.js";
import { removeFromLocalStorage } from "../db.js";
import { goToNextPage } from "../utils.js";



const agreementForm = document.getElementById("review-agreement-form");


agreementForm?.addEventListener("submit", handleAgreementSubmitForm)


const state = getSessionState();




/**
 * Handles submission of the agreement form.
 *
 * The function does a couple of things validates the form, and checks that
 * both the card request and employment sections have been completed before
 * allowing the application to be submitted. If any required information is
 * missing, an appropriate alert is displayed. 
 * 
 * Once the user acknowledges the submission confirmation, the saved session data 
 * is cleared and the user is redirected to the credit card management page.
 *
 * @async
 * @param {SubmitEvent} e - The form submit event.
 * @returns {Promise<void>}
 */
async function handleAgreementSubmitForm(e) {
   
    e.preventDefault();
  
    if (!agreementForm.reportValidity()) {
        return;
    }

    if (!state.formCompletion.cardRequest) {
       AlertUtils.showAlert({
            title: "Card Request Incomplete",
            text: "Some required information is missing from your card request. Please complete all sections before submitting.",
            icon: "error",
            confirmButtonText: "Ok!"
        });
        return;
    }

    if (!state.formCompletion.employmentRequest) {
        AlertUtils.showAlert({
            title: "Employment Details Incomplete",
            text: "Some required employment information is missing. Please complete all employment details before continuing.",
            icon: "error",
            confirmButtonText: "Ok!"
        });
        return;
    }

    const isClicked = await AlertUtils.showConfirmationAlert({
        title: "Application Submitted",
        text: "Your card request has been submitted successfully. We will review your application and notify you of the outcome shortly.",
        icon: "success",
        confirmButtonText: "Ok!",
        denyButtonText: "Ok1",
        confirmButtonText: "Ok!"
    });

    if (isClicked || !isClicked) {
         removeSavedSession();
         goToNextPage("manage-credit-cards.html")
    }


   



}


