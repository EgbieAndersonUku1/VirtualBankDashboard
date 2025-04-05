import { BankAccount } from "./bankAccount.js";
import { Wallet } from "./wallet.js";
import { parseFormData } from "./formUtils.js";
import { config } from "./config.js";

import { checkIfHTMLElement, toTitle } from "./utils.js";
import { warnError } from "./logger.js";
import { walletDashboard } from "./walletUI.js";
import { AlertUtils } from "./alerts.js";
import { notificationManager } from "./notificationManager.js";
import { handleInputFieldValueLength } from "./utils.js";


const fundFormElement   = document.getElementById("fund-form");
const fundDivCloseIcon  = document.getElementById("fund-close-icon");
const fundDivElement    = document.getElementById("fund");


validatePageElements()

notificationManager.setKey(config.NOTIFICATION_KEY);

fundFormElement.addEventListener("sumbit", handleFundForm);


export function handleFundForm(e) {
    e.preventDefault(); 
    
    if (e.target.id != "fund-account-btn") {
      return;
    }

    const formData       = new FormData(fundFormElement);
    const requiredFields = ["fund_account_type", "amount"]

    if (fundFormElement.checkValidity()) {

        const parsedData = parseFormData(formData, requiredFields);
        const isFunded   = chooseAccountTypeAndFund(parsedData.fundAccountType, parsedData.amount);
        const accountTypeMapping = {"bank-account": "bank Account",
                                    "wallet": "wallet",
                                    }
        
        const account = accountTypeMapping[parsedData.fundAccountType];

        if (isFunded) {
            showFundingSuccessAlert(account, parsedData.amount)
            return true;
        }
        showFundingFailureAlert(account, parsedData.amount);
        return false;
        
    } else {
        fundFormElement.reportValidity()
    }
   
}


export function handleFundDiv() {
    fundDivElement.classList.toggle("show");
}


export function handleFundCloseDivIconClick(e) {
    const FUND_ID = "fund-close-icon";

    if (e.target.id != FUND_ID) {
        return;

    }
    fundDivElement.classList.remove("show")

}


export function chooseAccountTypeAndFund(accountType, amount) {
   const wallet = Wallet.loadWallet(config.SORT_CODE, config.ACCOUNT_NUMBER);

   if (!wallet) {
        warnError("chooseAccountTypeAndFund", "The wallet was not found");
        return false;
      }


   switch(accountType.toLowerCase().trim()) {
       
       case "wallet":
           wallet.addFundsToWallet(amount);
           walletDashboard.updateWalletAccountBalanceText(wallet);
           break;
        
        case "bank-account":
            const bankAccount = BankAccount.getByAccount(config.SORT_CODE, config.ACCOUNT_NUMBER);
            bankAccount.addAmount(amount);
            walletDashboard.updateBankAccountBalanceText(wallet);
            break;

   }
   
    // tells the app that an update has been made
    // and that when the user selects either bank or a wallet
    // it should load from the localStorage and not from the cache
    if (!config.isFundsUpdated) {
        config.isFundsUpdated = true;
    }
   
    return true
   
}


/**
 * Displays a success alert when an account is successfully funded.
 * @param {string} account - The name of the funded account.
 */
function showFundingSuccessAlert(account, amount) {
    AlertUtils.showAlert({
        title: `${toTitle(account)} was successfully funded`,
        text: `Funds have been successfully added to ${account}.`,
        icon: "success",
        confirmButtonText: "Great"
    });

    notificationManager.add(`Your ${account} was successfully funded with an amount of £${amount}`);
}


/**
 * Displays an error alert when funding an account fails.
 * @param {string} account - The name of the account that failed to receive funds.
 */
function showFundingFailureAlert(account, amount) {
    AlertUtils.showAlert({
        title: `Failed to fund ${account}`,
        text: `We were unable to add funds to ${account}.`,
        icon: "error",
        confirmButtonText: "OK!"
    });
    notificationManager.add(`We could not fund your ${account} with the amount of £${amount}`);
}



export function handleFundAmountLength(e) {
    const FUND_ID = "fund-amount";
    if (e.target.id != FUND_ID) {
        return
     
    }

    handleInputFieldValueLength({e:e, convertToFloat:true})

}

function validatePageElements() {
    checkIfHTMLElement(fundFormElement, "The fund form element");
    checkIfHTMLElement(fundDivCloseIcon, "Add fund div close icon");
   
}
