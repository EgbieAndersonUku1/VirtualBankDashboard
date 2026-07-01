import { getSessionId } from "../utils.js";
import { setLocalStorage, getLocalStorage, removeSingleItemFromLocalStorage } from "../db.js";

/**
 * Gets the state for the current browser session.
 *
 * The session state is automatically created the first time
 * it is requested and reused for the lifetime of the browser tab.
 *
 * @returns {Object} The session state.
 */
export function getSessionState() {
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
export function saveSessionState(sessionState) {
    const sessionId = getSessionId();
    setLocalStorage(sessionId, sessionState)
}



export function removeSavedSession() {
    const sessionId  = getSessionId();
    const sessionIds = [sessionId,  "cardRequestInformation", "employmentInformation"]

    sessionIds.forEach((sessionId) => {
        removeSingleItemFromLocalStorage(sessionId)
    })

}
  