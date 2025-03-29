import { checkIfHTMLElement } from "./utils.js";


const transferFormElement           = document.getElementById("wallet-transfer-form");
const transferButtonElement         = document.getElementById("wallet-transfer-btn");
const transferFromBankSelectElement = document.getElementById("transfer-from-bank");
const transferToBankSelectOptionElement   = document.getElementById("transfer-to-bank");
const transferToWalletSelectOptionElement   = document.getElementById("transfer-to-wallet");
const transferFromSelectElement     = document.getElementById("transfer-from")


validatePageElements();


export function handleDisableMatchingTransferOption(e) {
   
    const selectValue = e.target.value.trim();

    if (selectValue === "bank"){
        transferToBankSelectOptionElement.disabled   = true;
        transferToWalletSelectOptionElement.disabled = false;
             
    } else if (selectValue === "wallet"){
        transferToBankSelectOptionElement.disabled   = false;
        transferToWalletSelectOptionElement.disabled = true;
      
    }
}


transferFromSelectElement.addEventListener("change", handleDisableMatchingTransferOption);



export function handleTransferButtonClick(e) {
    const BUTTON_ID = "wallet-transfer-btn";
    if (e.target.id != BUTTON_ID) {
        return;
    }

   

    if (transferFormElement.checkValidity()) {

    } else {
        transferFormElement.reportValidity();
    }
    
}


function validatePageElements() {
    checkIfHTMLElement(transferFormElement, "The transfer form");
    checkIfHTMLElement(transferButtonElement, "The transfer button form element");
    checkIfHTMLElement(transferFromBankSelectElement, "The transfer from bank option element");
    checkIfHTMLElement(transferToBankSelectOptionElement, "The transfer from bank option element");
}
