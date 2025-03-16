import { getLocalStorage, setLocalStorage } from "./db.js";
import { getFullName as getCombinedCode, generateRandomID, checkNumber } from './utils.js';
import { logError } from "./logger.js";
import { Card } from "./card.js";


const BANK_ACCOUNT_STORAGE_KEY = "bankAccount";


/*
 * Class: BankAccount
 * Manages bank account operations including fund transfers and balance updates.
 */
export class BankAccount {

    constructor(sortCode, accountNumber, balance = 0) {
        this.accountNumber = accountNumber;
        this.sortCode      = sortCode;
        this._balance      = balance;
        this.id            = generateRandomID();
        this._createdOn    = null;
    }

    get balance() {
        return this._balance
    }

    set balance(balance) {
        if (!checkNumber(balance).isFloat || !checkNumber(balance).isNumber) {
            throw new Error(`Expected an integer or float but got ${typeof balance}`);
        }
        if (balance < 0) {
            throw new Error(`Cannot set a negative value. Got ${balance}`);
        }
        this._balance = balance;
    }

    static getByAccount(sortCode, accountNumber) {

        const fullAccountNumber = getCombinedCode(sortCode, accountNumber);
        const bankAccounts      = getLocalStorage(BANK_ACCOUNT_STORAGE_KEY, fullAccountNumber);

        if (Array.isArray(bankAccounts) || typeof bankAccounts !== "object") {
            logError("getByCardNumber", `Expected an object but got type ${typeof bankAccounts}`);
            return null;
        }

        const bankAccount = bankAccounts[BANK_ACCOUNT_STORAGE_KEY][fullAccountNumber];
        return new BankAccount(bankAccount.sortCode, bankAccount.accountNumber, bankAccount.balance)

    }

    /**
     * Transfers a specified amount from one card to the a given bank account.
     * 
     * This method ensures the card has ae valid instances, verifies that the amount
     * to be transferred is a valid number (either integer or float), and checks that
     * the sender card has sufficient funds. If all conditions are met, it transfers
     * the amount to the bank account.
     * 
     * @throws {Error} if card is null or not an instance of the Card class.
     * @throws {TypeError} if the amount is not a valid number (int or float).
     * @throws {Error} if card1does not have enough funds to complete the transfer.
     * 
     * @param {*} card - The card from which the amount will be transferred.
     * @param {*} amount - The amount to be transferred from card to given account.
     * @returns {boolean} - Returns `true` if the transfer is successful, `false` if it fails.
     */
    transferToAccount(card, amount) {
        if (!card) {
            throw new Error("Card null.");
        }

        if (!amount) {
            throw new Error("The amount cannot be null");
        }

        const amountCheck = checkNumber(amount);

        if (!amountCheck.isNumber || (!amountCheck.isInteger && !amountCheck.isFloat)) {
            throw new TypeError(`The amount must be a valid number (int or float). Received: ${amount} of type ${typeof amount}.`);
        }

        if (!(card instanceof Card)) {
            throw new Error(`Card must be instances of the Card class. Received ${typeof card}`);
        }

        const hasFunds = this._checkIfCardHasAvailableFunds(card, amount);

        if (!hasFunds) {
            throw new Error(`Insufficient funds in Card . Available: ${card.amount}, Requested: ${amount}`);
        }

        try {
            card.amount  -= amount;  // Deduct from card
            this._balance += amount  // Add to the request bank account

            card.save();
            this.save()

            return true;

        } catch (error) {
            const errorMsg = `Error transferring funds: ${error.message}`;
            logError("transferToAccount", errorMsg);
            return false;
        }
    }

    /**
     * Transfers money between two card instances.
     * 
     * @throws {Error} if card1 or card2 is null or not an instance of the Card class.
     * @throws {TypeError} if the amount is not a valid number (integer or float).
     * @throws {Error} if card1 does not have enough funds to transfer the specified amount.
     * 
     * @param {Card} card1 - The card initiating the transfer.
     * @param {Card} card2 - The card receiving the money.
     * @param {number|string} amount - The amount to be transferred to card2.
     * @returns {boolean} - Returns true if the transfer was successful, false otherwise.
     */
    transferAmountToAnotherCard(card1, card2, amount) {
        if (!card1 || !card2) {
            throw new Error("Both card1 and card2 must be provided.");
        }

        if (!(card1 instanceof Card) || !(card2 instanceof Card)) {
            throw new Error("Both card1 and card2 must be instances of the Card class.");
        }

        const amountCheck = checkNumber(amount);

        if (!amountCheck.isNumber) {
            throw new TypeError(`Invalid amount. Expected a number but got ${amount} (type: ${typeof amount}).`);
        }

        if (!this._checkIfCardHasAvailableFunds(card1, amount)) {
            throw new Error(`Insufficient funds. Card1 balance: ${card1.amount}, Attempted transfer amount: ${amount}.`);
        }

        try {
            card1.amount -= amount;  // Deducting the amount from card1
            card2.amount += amount;  // Adding the amount to card2

            card1.save();
            card2.save();

            return true;
        } catch (error) {
            const errorMsg = `Error during transfer: ${error.message}`;
            logError("transferAmountToAnotherCard", errorMsg);
            return false;
        }
    }

     /**
     * Checks if a card has sufficient funds for a transaction.
     * 
     * @param {Card} card - The card to check.
     * @param {number} amount - The amount to check against the card's balance.
     * @returns {boolean} - Returns true if the card has enough funds, otherwise false.
     */
     _checkIfCardHasAvailableFunds(card, amount) {
        return card.amount >= amount && (card.amount - amount) >= 0;
    }

    static createBankAccount(sortCode, accountNumber, balance) {

        const SORT_CODE_LENGTH = 6;
        const ACCOUNT_NUMBER_LENGTH = 8

        if (!sortCode || !accountNumber) {
            throw new Error("The sort code number or account number cannot be 0")
        }
        if (typeof sortCode != "string" || typeof accountNumber != "string") {
            throw new TypeError(`The sort code or account number must be a string. Expected string but got Sort code : ${typeof sortCode} and Account : ${typeof accountNumber}`)
        }

        if (!checkNumber(sortCode).isNumber || !checkNumber(accountNumber).isNumber) {
            throw new TypeError(`The sort code and account number must be an integer not a float. Expected an int but got sort code: ${sortCode}, Acc: ${accountNumber}`)
        }

        if (sortCode.length < SORT_CODE_LENGTH || accountNumber < ACCOUNT_NUMBER_LENGTH) {
            throw new Error(`Sort code must 6 digits and account number must be 8 digits but got: Sort code : ${sortCode.length} and Account : ${accountNumber.length} `)
        }

        const bankAccount = new BankAccount(sortCode, accountNumber, balance);
        bankAccount.save();
        return bankAccount;

    }

    getBankDetails() {
        return {
            sortCode: this.sortCode,
            accountNumber: this.accountNumber,
            balance: this.balance,
            id: this.id,
            createdOn: this._createdOn,
        };
    }

    /**
       * Method to save the bank details to local storage.
        * @returns {boolean} - Returns true if the bank was saved successfully, otherwise false.
    */
    save() {

        if (this._createdOn === null) {
            this._createdOn = new Date().toISOString();
        }

        try {
            let storage = getLocalStorage(BANK_ACCOUNT_STORAGE_KEY)

            if (!storage || typeof storage !== 'object') {
                storage = { [BANK_ACCOUNT_STORAGE_KEY]: {} };
            }

            storage[BANK_ACCOUNT_STORAGE_KEY][getCombinedCode(this.sortCode, this.accountNumber)] = this.getBankDetails();
            setLocalStorage(BANK_ACCOUNT_STORAGE_KEY, storage);
            return true;

        } catch (error) {
            logError("save", error);
            return false;
        }
    }


}