import { checkIfHTMLElement } from "./utils.js";


const transferFromElement        = document.getElementById("transfer-progress-transfer-from");
const transferToElement          = document.getElementById("transfer-progress-transfer-to");
const progressElement            = document.getElementById("progress");
const progressStatusElement      = document.getElementById("transfer-progression-status");
const transferWaitingMsgElement  = document.getElementById("transfer-waiting-msg"); 
const transferCloseButtonElement = document.getElementById("transfer-close-btn");
const transferProgressContainer  = document.getElementById("transfer-progress-container");



validatePageElements();


export function transferProgressBar(transferFrom, transferTo, progressStatusMsg, progressBarBy=10) {

    
    if (!transferFrom || !transferTo || !progressStatusMsg) {
        throw new Error(`One or more required values are missing. Missing values: 
            ${!transferFrom ? "transferFrom" : ""} 
            ${!transferTo ? "transferTo" : ""}
            ${!progressBarBy ? "progressBy" : ""}  
            ${!progressStatusMsg ? "progressStatusMsg" : ""}`.trim());
    }

    if (typeof transferFrom !== "string" || typeof transferTo !== "string" || typeof progressStatusMsg !== "string", typeof progressBarBy !== "number") {
        throw new Error(`One or more of the values is not a string element. 
            TransferFrom: ${typeof transferFrom}, 
            TransferTo: ${typeof transferTo}, 

            ProgressStatusMsg: ${typeof progressStatusMsg}`);
    }
    
    
    const TIME_IN_MS = 40;

    let progress = progressBarBy;
    
    setTransferFromName(transferFrom);
    setTransferToName(transferTo);
    toggleSuccessTransferMessage(false);

    const progressInterval = setInterval(() => {

        progress += progressBarBy;
        updateProgressBar(progress);
        updateProgressStatusMsg({progress: progress, msg: progressStatusMsg});
     
        if (progress >= 100) {
            clearInterval(progressInterval);
            toggleSuccessTransferMessage();
        }

    }, TIME_IN_MS);

   return true;

}

function setTransferFromName(name) {
    transferFromElement.textContent = name;

}


function setTransferToName(name) {
    transferToElement.textContent = name;
}


function toggleSuccessTransferMessage(show=true, msg="Transfer Successful ✅") {
    transferWaitingMsgElement.textContent = msg;
    show ? transferWaitingMsgElement.classList.add("show") : transferWaitingMsgElement.classList.remove("show")
}


function updateProgressStatusMsg({ msg = "transferring progress", progress = 0 }) {
    progressStatusElement.textContent = `${msg} ${progress}%`;
    progressStatusElement.classList.add("red");
    progressStatusElement.classList.toggle("green");

    const COMPLETE_PERCENTAGE = 100;

    if (progress < 40) {
        progressElement.style.background = "red";
    } else if (progress < 70) {
        progressElement.style.background = "orange";
    } else if (progress >= 70) {
        progressElement.style.background = "#4caf50"; // green
    }


    if (progress === COMPLETE_PERCENTAGE ){
        progressStatusElement.classList.add("green");
        toggleTransferCloseButton();
    }
}


function updateProgressBar(progress) {
    progressElement.style.width = `${progress}%`;
}

function resetProgressBar() {
    const RESET_VALUE = 0;
    updateProgressBar(RESET_VALUE);
}


export function handleTransferCloseButton(e) {
   
    const CLOSE_BTN_ID = "transfer-close-btn";

    if (e.target.id != CLOSE_BTN_ID) {
        return;
    }  

    transferProgressContainer.classList.remove("show");
    resetProgressBar();
    toggleTransferCloseButton(false);
    toggleSuccessTransferMessage(false);
    
   
}

function toggleTransferCloseButton(show=true) {
    show ? transferCloseButtonElement.classList.add("show") : transferCloseButtonElement.classList.remove("show")
}


function validatePageElements() {
    checkIfHTMLElement(transferFromElement, "Transfer from element");
    checkIfHTMLElement(transferToElement, "Transfer to element");
    checkIfHTMLElement(progressElement, "Progress element");
    checkIfHTMLElement(progressStatusElement, "Completion status");
    checkIfHTMLElement(transferWaitingMsgElement, "The waiting message");
    checkIfHTMLElement(transferProgressContainer, "Transfer progress container");
    checkIfHTMLElement(transferCloseButtonElement, "The button element to close the transaction");
}