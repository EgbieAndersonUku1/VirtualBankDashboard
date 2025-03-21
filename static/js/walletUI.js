import { Wallet } from "./wallet.js";
import { BankAccount } from "./bankAccount.js";

import { handlePinShowage, handlePinFormSubmission, handlePinFormClosure } from "./pin.js";
import { logError } from "./logger.js";

const SORT_CODE       = "400217";
const ACCOUNT_NUMBER  = "00327502";
const INITIAL_BALANCE = 10000
const PIN             = 1025;


let bankAccount;
let wallet;


document.addEventListener("DOMContentLoaded", handleInitialSetup);


function handleInitialSetup() {
    
    console.log("Attempting to retrieve bank account information from localStorage...");
    bankAccount = BankAccount.getByAccount(SORT_CODE, ACCOUNT_NUMBER);
    
    if (!bankAccount) {
        console.log("Retrieval failed - Bank account not found. Creating a new bank account...");
        bankAccount = BankAccount.createBankAccount(SORT_CODE, ACCOUNT_NUMBER, INITIAL_BALANCE);
    } else {
        console.log("Bank account successfully retrieved from localStorage.");
    }

    if (bankAccount) {
        console.log("Bank account successfully loaded into the system.");
        console.log("Attempting to retrieve linked wallet from localStorage...");
        wallet = Wallet.loadWallet(bankAccount.accountNumber);
        
        if (!wallet) {
            console.log("Retrieval failed - Wallet not found. Creating a new wallet...");
            wallet = Wallet.createWallet(bankAccount, PIN, INITIAL_BALANCE);
        } else {
            console.log("Wallet successfully retrieved from localStorage and loaded into the system.");
        }
    }

    if (!wallet || !bankAccount) {
        logError("handleInitialSetup", "Failed to load the bank account and wallet.");
        return;
    }

    console.log("Wallet and bank account successfully loaded.");
}



export function handleWalletPin(e) {
    handlePinShowage(e);
    handlePinFormSubmission(e, wallet);
    handlePinFormClosure(e);

}

