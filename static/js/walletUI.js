import { Wallet } from "./wallet.js";
import { BankAccount } from "./bankAccount.js";



import { handlePinShowage, handlePinFormSubmission, handlePinFormClosure } from "./pin.js";

const SORT_CODE       = "400217";
const ACCOUNT_NUMBER  = "00327502";
const INITIAL_BALANCE = 10000
const PIN             = 1025;

const bankAccount     = BankAccount.createBankAccount(SORT_CODE, ACCOUNT_NUMBER, INITIAL_BALANCE);
const wallet          = Wallet.createWallet(bankAccount, PIN);


wallet.save();
bankAccount.save();


export function handleWalletPin(e) {
    handlePinShowage(e);
    handlePinFormSubmission(e, wallet);
    handlePinFormClosure(e);

}

