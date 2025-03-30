import { checkIfHTMLElement } from "./utils.js";
import { Wallet } from "./wallet.js";
import { config } from "./config.js";
import { cards } from "./cardsComponent.js";
import { toTitle } from "./utils.js";
import { warnError } from "./logger.js";


const transferFormElement                  = document.getElementById("wallet-transfer-form");
const transferButtonElement                = document.getElementById("wallet-transfer-btn");
const transferFromBankSelectElement        = document.getElementById("transfer-from-bank");
const transferToBankSelectOptionElement    = document.getElementById("transfer-to-bank");
const transferToWalletSelectOptionElement  = document.getElementById("transfer-to-wallet");
const transferFromSelectElement            = document.getElementById("transfer-from");
const transferToSelectElement              = document.getElementById("transfer-to");
const cardsAreaElement                     = document.getElementById("wallet-cards");
const accountTypeLabelElement              = document.getElementById("account-balance-type");
const accountTypeAmountLabelElement        = document.getElementById("transfer-card-fund-amount");



validatePageElements();


export function handleDisableMatchingTransferOption(e) {
   
    const selectValue = e.target.value;
    const BANK_ID     = "bank";
    const WALLET_ID   = "wallet";

    const wallet = Wallet.loadWallet(config.SORT_CODE, config.ACCOUNT_NUMBER);

    if (!wallet) {
        warnError("handleDisableMatchingTransferOption", "The wallet wasn't found")
    }
    if (selectValue === BANK_ID){
        transferToBankSelectOptionElement.disabled   = true;
        transferToWalletSelectOptionElement.disabled = false;
             
    } else if (selectValue === WALLET_ID){
        transferToBankSelectOptionElement.disabled   = false;
        transferToWalletSelectOptionElement.disabled = true;
           
    }  

    if (e.target.matches("#transfer-from")) {
        if (selectValue === BANK_ID){
            displayTransferDetails("Bank Account", wallet.bankAmountBalance);
                 
        } else if (selectValue === WALLET_ID){
            displayTransferDetails("Wallet Account", wallet.walletAmount);
          
        }  
    }
    
}


transferFromSelectElement.addEventListener("change", handleDisableMatchingTransferOption);
transferToSelectElement.addEventListener("change",   handleCardOptionSelect);


export function handleCardOptionSelect(e) {

    const select = e.target;

    if (select.matches("#transfer-to")) {
          const selectValue = e.target.value;
           if (selectValue != "cards") {
            cardsAreaElement.classList.remove("show")
            return
        }
        
         cardsAreaElement.classList.add("show")
         const wallet = Wallet.loadWallet(config.SORT_CODE, config.ACCOUNT_NUMBER);

        const cardsToTransferElement = cards.createCardsToShow(wallet);
        cards.placeCardDivIn(cardsAreaElement, cardsToTransferElement, true);
    }
  

}

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


export function handleTransferFundCardsClick(e) {
    

    const GRAND_PARENT_CLASS_ID = "wallet-cards";
    const CARD_CLASS            = ".bank-card";
  
    const card = e.target.closest(CARD_CLASS);
    
    if (card && card.parentElement.id != GRAND_PARENT_CLASS_ID) {
        return;
    }

    console.log(card)
    // console.log(card)
    // console.log(card)
    // if (card) {
    //     const parentDiv = card.parentElement;
    //     console.log(parentDiv)
    // }
    // if (targetDiv.id != GRAND_PARENT_CLASS_ID) {
    //     return;
    // }

  

}   


function displayTransferDetails(name, amount) {
    accountTypeLabelElement.textContent       = `${toTitle(name)}`;
    accountTypeAmountLabelElement.textContent = `£${amount}`
  
}



function validatePageElements() {
    checkIfHTMLElement(transferFormElement, "The transfer form");
    checkIfHTMLElement(transferButtonElement, "The transfer button form element");
    checkIfHTMLElement(transferFromBankSelectElement, "The transfer from bank option element");
    checkIfHTMLElement(transferToBankSelectOptionElement, "The transfer from bank option element");
    checkIfHTMLElement(cardsAreaElement, "The card area element in the transfer area div")
}
