import { checkIfHTMLElement } from "./utils.js";


const transferProgressContainer = document.getElementById("transfer-progress-container");
const transferProgressHeader    = document.getElementById("transfer-progress-header");
// const transferProgressImage     = document.getElementById("transfer-progress-img");
const transferFromElement       = document.getElementById("transfer-progress-transfer-from");
const transferToElement         = document.getElementById("transfer-progress-transfer-to");
const progressElement           = document.getElementById("progress");
const progressStatus            = document.getElementById("transfer-progression-status");
const transferMsgStatus         = document.getElementById("transfer-msg-status");
const transferWaitingMsg        = document.getElementById("transfer-waiting-msg"); 



validatePageElements();


export function transferProgressBar(transferFrom, transferTo, progressStatusMsg) {

    
    if (!transferFrom || !transferTo || !progressStatusMsg) {
        throw new Error(`One or more required values are missing. Missing values: 
            ${!transferFrom ? "transferFrom" : ""} 
            ${!transferTo ? "transferTo" : ""} 
            ${!progressStatusMsg ? "progressStatusMsg" : ""}`.trim());
    }

    if (typeof transferFrom !== "string" || typeof transferTo !== "string" || typeof progressStatusMsg !== "string") {
        throw new Error(`One or more of the values is not a string element. 
            TransferFrom: ${typeof transferFrom}, 
            TransferTo: ${typeof transferTo}, 
            ProgressStatusMsg: ${typeof progressStatusMsg}`);
    }
    
    
    const TIME_IN_MS = 400;

    let progress = 10;
    
    setTransferFromName(transferFrom);
    setTransferToName(transferTo);

    const progressInterval = setInterval(() => {
        progress += 10
        updateProgressBar(progress);
        updateProgressStatusMsg({progress: progress, msg: progressStatusMsg});
     
        console.log(progress);

        if (progress >= 100) {
            clearInterval(progressInterval);
            showSuccessTransferMessage();
    
            // show message to go here
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


function showSuccessTransferMessage(msg="Transfer Successful ✅") {
    transferWaitingMsg.textContent = msg;
}


function updateProgressStatusMsg({ msg = "transferring progress", progress = 0 }) {
    progressStatus.textContent = `${msg} ${progress}%`;
    
    if (progress < 40) {
        progressElement.style.background = "red";
    } else if (progress < 70) {
        progressElement.style.background = "orange";
    } else if (progress >= 70) {
        progressElement.style.background = "#4caf50"; 
    }
}


function updateProgressBar(progress) {
    progressElement.style.width = `${progress}%`;
    
}




function validatePageElements() {
    checkIfHTMLElement(transferProgressContainer, "Transfer progress container");
    checkIfHTMLElement(transferProgressHeader, "Transfer progress header");
    // checkIfHTMLElement(transferProgressImage, "Transfer progress image");
    checkIfHTMLElement(transferFromElement, "Transfer from element");
    checkIfHTMLElement(transferToElement, "Transfer to element");
    checkIfHTMLElement(progressElement, "Progress element");
    checkIfHTMLElement(progressStatus, "Completion status");
    // checkIfHTMLElement(transferMsgStatus, "Transfer message status");
    checkIfHTMLElement(transferWaitingMsg, "The waiting message");
}