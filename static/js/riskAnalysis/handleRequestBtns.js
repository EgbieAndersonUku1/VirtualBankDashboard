import { getFormattedDateTime } from "../utils.js";
import { APPLICATION_DECISION, ApplicationDecision } from "./application-decision.js";
import {buildConfirmationDialogConfig, hasRequestAlreadyBeenProcessed, runConfirmationPrompt} from "./confirmation-service.js";
import { updateTable } from "./table.js";
import accountDetails from "./account/accountDetails.js";
import cardRequestInformation, { cardType, cardVariant } from "./account/cardRequestDetails.js";
import { cardStatus } from "./account/cardRequestDetails.js";


// ===== Request Actions 
const approveRequestBtn       = document.getElementById("approve-request-btn");
const rejectRequestBtn        = document.getElementById("reject-request-btn");
const requestVerificationBtn  = document.getElementById("request-verification-btn");
const placeOnHoldBtn          = document.getElementById("request-place-on-hold");

// ===== Status / Overview 
const currentStatusOverivew   = document.getElementById("current-status");

// ===== Cards / Counters 
const approvalCard            = document.getElementById("card-request-approved-card");
const rejectCard              = document.getElementById("card-request-reject-card");
const underReviewCard         = document.getElementById("card-request-under-review");


// event listeners
approveRequestBtn.addEventListener("click", handleApproveRequestButton);
placeOnHoldBtn.addEventListener("click", handlePlaceOnHoldButton)
rejectRequestBtn.addEventListener("click", handleRejectRequestButton);
requestVerificationBtn.addEventListener("click", handleRequestVerifciationButton);




/**
 * =========================================================
 * REQUEST DECISION SYSTEM
 * =========================================================
 *
 * This module controls the full request workflow including:

 * - Decision handling (approve, reject, manual review, hold)
 * - Confirmation dialog messaging
 * - Tracking processed request state
 * - Mapping risk outcomes to UI status updates
 *
 * Key components:
 *
 * - statusClassMap: maps risk outcomes to UI states
 * - processedRequestsState: tracks already handled actions
 * - dialogConfigs: defines confirmation UI messages per action
 *
 * Note:
 * Business logic is handled in processRequestDecision().
 * This file primarily defines configuration + UI wiring.
 *
 * =========================================================
 */



export const statusClassMap = {
    [cardStatus.APPROVED]: "approved",
    [cardStatus.UNDER_REVIEW]: "review",
    [cardStatus.REJECTED]: "rejected",
    [cardStatus.PENDING]: "pending",
    [cardStatus.WITHDRAWN]: "withdrawn",
    [APPLICATION_DECISION.APPROVE]: "approved",
    [APPLICATION_DECISION.UNDER_REVIEW]: "review",
    [APPLICATION_DECISION.MANUAL_REVIEW]: "review",
    [APPLICATION_DECISION.REJECT]: "rejected",
};



const processedRequestsState = {
    approved: false,
    rejected: false,
    placeOnHold: false,
    requestVerification: false,

}


const dialogConfigs = { 

    approve : {

        missingDataMessage: `Risk analysis has not been run yet.
                            Proceeding without it may reduce confidence in this decision.
                            Continue anyway and approve this request anyway?`,
        warningDecision: APPLICATION_DECISION.REJECT,
        warningMessage: `
                        Risk analysis returned a rejected decision based on user information.
                        Are you sure you want to approve this request?
         `,
        defaultMessage: "Are you sure you want to approve this request?"
    },

    reject: {
        
        missingDataMessage: `Risk analysis has not been run yet.
                            Proceeding without it may reduce confidence in this decision.
                            Continue anyway and reject this request anyway?`,

        warningDecision: APPLICATION_DECISION.APPROVE,
        warningMessage: `
            The risk analysis passed successfully.
            Are you sure you want to reject this request despite the positive result?
        `,
        defaultMessage: "Are you sure you want to reject this request?"
    },

     requestVerification: {

        missingDataMessage: `
            Risk analysis has not been run yet.
            Requesting additional verification without it may reduce confidence.
            Proceed anyway?
        `,

        warningDecision: APPLICATION_DECISION.MANUAL_REVIEW,
        warningMessage: `
            Risk analysis has already been completed.
            You are about to request additional verification based on its results.
            Continue?
        `,

        defaultMessage: `
            Are you sure you want to request additional verification from the user?
        `
    },

    placeOnHold: {
        missingDataMessage: `
            Risk analysis has not been run yet.
            Are you sure you want to place this request on hold without additional verification?
        `,

        warningDecision: APPLICATION_DECISION.MANUAL_REVIEW,
        warningMessage: `
            Risk analysis has already been completed.
            You are about to place this request on hold based on its results.
            Continue?
        `,

        defaultMessage: `
            Are you sure you want to place this request on hold?
        `
    }

}




/**
 * Updates the pending status in the UI. This status is depends on
 * the button the user clicks
 * 
 * @param {*} status - The status to update the button with
 */
function updateCurrentStatus(status) {

    currentStatusOverivew.classList.remove("status--pending", "status", "status--approved")

    switch (status) {
        case APPLICATION_DECISION.APPROVE:
            currentStatusOverivew.textContent = "Approved";
            currentStatusOverivew.classList.add("status",  "status--approved");
            break;
        case APPLICATION_DECISION.REJECT:
            currentStatusOverivew.textContent = "Rejected";
            currentStatusOverivew.classList.add("status",  "status--rejected");
            break;
        case APPLICATION_DECISION.MANUAL_REVIEW:
            currentStatusOverivew.textContent = "Under review";
            currentStatusOverivew.classList.add("status",  "status--review");
            break;
    }
}



/**
 * Handles a request decision as a single command.
 *
 * Flow:
 * - Rejects already processed requests
 * - Prompts user confirmation
 * - Applies decision updates
 * - Executes success callback
 *
 * @param {Object} command
 * @param {string} command.decision - The application decision (APPROVE, REJECT, etc.)
 * @param {Object} command.dialogConfig - UI dialog configuration
 * @param {boolean} command.isAlreadyProcessed - Whether request is already processed
 * @param {Function} command.onSuccess - Callback executed after successful processing
 *
 * @returns {Promise<{status: 'processed' | 'skipped' | 'cancelled'}>}
 */
async function processRequestDecision(command) {

    const {decision, dialogConfig, isAlreadyProcessed, onSuccess } = command;

    if (hasRequestAlreadyBeenProcessed(isAlreadyProcessed)) {
        return { status: "skipped" };
    }

    const { promptQuestion, icon } = buildConfirmationDialogConfig(dialogConfig);

    const confirmation = await runConfirmationPrompt({ promptQuestion, icon });

    if (!confirmation) {
        return { status: "cancelled" };
    }

    updateCurrentStatus(decision);

    const {date, time } = getFormattedDateTime()

    updateTable({ status: statusClassMap[decision], 
                 fullName: cardRequestInformation?.fullName, 
                 accountNumber: accountDetails.accountNumber,
                 cardType: cardRequestInformation.cardType,
                 cardVariant: cardRequestInformation.cardVariant,
                 date: date,
                 time: time
                })

    if (typeof onSuccess !== "function") {
        throw new TypeError(
            `Expected onSuccess to be a function, got ${typeof onSuccess}`
        );
    }

    onSuccess();

    return { status: "processed" };
}




function incrementRequestCount(element) {
      element.textContent = Number(element.textContent || 0) + 1;

}




/**
 * Handles the approve request button for the UI
 * @param {*} e : The event
 * @returns 
 */
async function handleApproveRequestButton(e) {

   return await processRequestDecision({ decision: APPLICATION_DECISION.APPROVE,
                                         dialogConfig: dialogConfigs.approve,
                                         isAlreadyProcessed: processedRequestsState.approved,
                                                 onSuccess: () => {
                                                    processedRequestsState.approved = true;
                                                    incrementRequestCount(approvalCard);
                                                }
                                            });

 

}



/**
 * Handles the reject request button for the UI
 * @param {*} e : The event
 * @returns 
 */
async function handleRejectRequestButton(e) {
    
    return await processRequestDecision({decision: APPLICATION_DECISION.REJECT,
                                                 dialogConfig: dialogConfigs.reject,
                                                 isAlreadyProcessed: processedRequestsState.rejected,
                                                 onSuccess: () => {
                                                    processedRequestsState.rejected = true;
                                                    incrementRequestCount(rejectCard);
                                                }
                                            });

  
}


/**
 * Handles the request extra verification button for the UI
 * @param {*} e : The event
 * @returns 
 */
async function handleRequestVerifciationButton(e) {

    return await processRequestDecision({decision: APPLICATION_DECISION.MANUAL_REVIEW,
                                                 dialogConfig: dialogConfigs.requestVerification,
                                                 isAlreadyProcessed: processedRequestsState.requestVerification,
                                                 onSuccess: () => {
                                                    processedRequestsState.requestVerification = true;
                                                    incrementRequestCount(underReviewCard);
                                                }
    });

   
}




/**
 * Handles the place on hold button for the UI
 * @param {*} e : The event
 * @returns 
 */
async function handlePlaceOnHoldButton(e) {
    return await processRequestDecision({decision: APPLICATION_DECISION.MANUAL_REVIEW,
                                                 dialogConfig: dialogConfigs.placeOnHold,
                                                 isAlreadyProcessed: processedRequestsState.placeOnHold,
                                                 onSuccess: () => {
                                                    processedRequestsState.placeOnHold = true;
                                                    incrementRequestCount(underReviewCard);
                                                }
    });
}

