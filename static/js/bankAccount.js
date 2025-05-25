import { getLocalStorage } from "./db.js";
import { getCombinedCode, generateRandomID, checkNumber } from './utils.js';
import { logError } from "./logger.js";
import { Card } from "./card.js";
import { DataStorage } from "./baseDataStorage.js";
import { AmountManager } from "./baseAmountManager.js";
import { config } from "./config.js";
import { formatCurrency } from "./utils.js";


const BANK_ACCOUNT_STORAGE_KEY = config.BANK_ACCOUNT_STORAGE_KEY;


/*
 * Class: BankAccount
 * Manages bank account operations including fund transfers and balance updates.
 */
export class BankAccount extends DataStorage {

    constructor(sortCode, accountNumber, initialBalance = 0) {
        super();
        this.accountNumber  = accountNumber;
        this.sortCode       = sortCode;
        this.id             = generateRandomID();
        this._createdOn     = null;
        this._amountManager = new AmountManager(initialBalance);
        this._balance       = initialBalance;

        this.deductAmount   = this.deductAmount.bind(this);
        this.addAmount      = this.addAmount.bind(this);
    }

    get balance() {
        return this._amountManager.balance
    }

    set balance(balance) {
        this._amountManager.validateAmount(balance)
        this._amountManager.balance = balance;
    }

    addAmount(amount) {
        this._amountManager.addAmount(amount);
        return this.save();
    }

    deductAmount(amount) {
        this._amountManager.deductAmount(amount);
        return this.save();
    }
    
    static getByAccount(sortCode, accountNumber) {

        if (!sortCode || !accountNumber) {
            const errorMsg = `Sort code and account are missing. Got sort code ${sortCode}, Account ${accountNumber}`;
            logError('Bank.getByAccount', errorMsg)
            throw new Error("Sort code and account number must be provided.");
        }

        const fullAccountNumber = getCombinedCode(sortCode, accountNumber);

        const bankAccounts = getLocalStorage(BANK_ACCOUNT_STORAGE_KEY);


        if (Array.isArray(bankAccounts) || typeof bankAccounts !== "object") {
            logError("getByCardNumber", `Expected an object but got type ${typeof bankAccounts}`);
            return null;
        }

        const bankAccount = bankAccounts[BANK_ACCOUNT_STORAGE_KEY][fullAccountNumber];
        return new BankAccount(bankAccount.sortCode, bankAccount.accountNumber, parseFloat(bankAccount._balance).toFixed(2))

    }

    /**
     * Transfers a specified amount from the bank to a wallet.
     * 
     * This method validates the amount, deducts it from the bank and funds the wallet.
     * .
     * 
     * @param {*} amount - The amount to transfer from bank to wallet.
     * @param {*} wallet - The wallet to receive the funds.
     * @returns {boolean} - Always returns `true`, regardless of success or failure.
     * 
     * @throws {Error} if the amount is invalid or if deducting fails.
     * @throws {TypeError} - If this `wallet` instance doesn't contain `addFundsToWallet`
     * a TypeError is raised.
     */
    transferFromBankToWallet(amount, wallet) {

        this._amountManager.validateAmount(amount);

        this.deductAmount(amount);
        
        try {
            wallet.addFundsToWallet(amount);
        } catch (error) {
            logError("Wallet.transferFromBankToWallet", error.message);
            throw new Error(error.message);
        }
       
        return true;
    }

    /**
     * Transfers a specified amount from a card to a given bank account.
     * 
     * This method ensures the card is valid, verifies that the amount
     * to be transferred is a valid number (either integer or float), and checks that
     * the sender card has sufficient funds. If all conditions are met, it transfers
     * the amount to the bank account.
     * 
     * @throws {Error} if card is null or not an instance of the Card class.
     * @throws {TypeError} if the amount is not a valid number (int or float).
     * @throws {Error} if the card does not have enough funds to complete the transfer.
     * 
     * @param {*} card - The card from which the amount will be transferred.
     * 0@param {*} amount - The amount to be transferred from card to given account.
     * @param {}
     * @returns {boolean} - Returns `true` if the transfer is successful, `false` if it fails.
     */
    transferFromCardToAccount(card, amount) {

        this._validateCard(card);
        this._amountManager.validateAmount(amount);

        const hasFunds = this._checkIfCardHasAvailableFunds(card, amount);
    
        if (!hasFunds) {
            logError("BankAccount.transferFromCardToAccount", "Transfer couldn't be made because there are insufficient funds in the account");
            throw new Error(`Insufficient Funds: Your card has a balance of ${formatCurrency(card.balance)}, but you tried to transfer ${formatCurrency(amount)}.`);

        }

        try {
            card.deductAmount(amount);
            this._amountManager.addAmount(amount);

            card.save();
            this.save();

            return true;

        } catch (error) {
            const errorMsg = `Error transferring funds: ${error.message}`;
            logError("transferFromCardToAccount", errorMsg);
            throw new Error(errorMsg)
    
        }
    }


    /**
     * Transfers a specified amount from a card to a wallet.
     * 
     * This method ensures the card is valid, verifies that the amount
     * to be transferred is a valid number (either integer or float), and checks that
     * the sender card has sufficient funds. If all conditions are met, it transfers
     * the amount to the users wallet and deducts from the bank.
     * 
     * @throws {Error} if card is null or not an instance of the Card class.
     * @throws {TypeError} if the amount is not a valid number (int or float).
     * @throws {Error} if the card does not have enough funds to complete the transfer.
     * 
     * @param {*} card - The card from which the amount will be transferred.
     * @param {*} amount - The amount to be transferred from card to given account.
     * @param {*} wallet - The Wallet to transfer the funds to.
     * @returns {boolean} - Returns `true` if the transfer is successful, `false` if it fails.
     */
    transferFromCardToWallet(card, amount, wallet) {
        
        this._validateCard(card);
        this._amountManager.validateAmount(amount);

        const hasFunds = this._checkIfCardHasAvailableFunds(card, amount);
    
        if (!hasFunds) {
            logError("BankAccount.transferFromCardToAccount", "Transfer couldn't be made because there are insufficient funds in the account");
            throw new Error(`Insufficient Funds: Your card has a balance of ${formatCurrency(card.balance)}, but you tried to transfer ${formatCurrency(amount)}.`);

        }

        try {
            card.deductAmount(amount);
            wallet.addFundsToWallet(amount);
            wallet.save();
            card.save();
            return true;
        } catch (error) {
            const errorMsg = `Error transferring funds: ${error.message}`;
            logError("transferFromCardToWallet", errorMsg);
            throw new Error(error.message);
           
        }

    }
    
    /**
     * Transfers a specified amount from the given wallet to the current account.
     * 
     * This method adds the amount to the current instance and deducts it from the wallet.
     * 
     * @param {*} amount - The amount to be transferred.
     * @param {*} wallet - The Wallet to deduct the funds from.
     * @throws {TypeError} - If the  wallet instance doesn't contain the `deductFundsFromWallet` raises an error
     * @returns {void}
     */
    transferFromWalletToBank(amount, wallet)  {

        try {
            this.addAmount(amount);   
            wallet.deductFundsFromWallet(amount);
            return
        } catch (error) {
            logError("transferFromWalletToBank", error.message)
        }
    }

    /**
     * Transfers money between two card instances.
     * 
     * @throws {Error} if sourceCard or targetCard is null or not an instance of the Card class.
     * @throws {TypeError} if the amount is not a valid number (integer or float).
     * @throws {Error} if sourceCard does not have enough funds to transfer the specified amount.
     * 
     * @param {Card} sourceCard - The card initiating the transfer.
     * @param {Card} targetCard - The card receiving the money.
     * @param {number|string} amount - The amount to be transferred to targetCard.
     * @returns {boolean} - Returns true if the transfer was successful, false otherwise.
     */
    transferFundsBetweenCards(sourceCard, targetCard, amount) {

        if (!sourceCard || !targetCard) {
            throw new Error("Transfer failed: Both source and target cards must be provided.");
        }

        [sourceCard, targetCard].forEach(card => this._validateCard(card));

        if (sourceCard.cardNumber === targetCard.cardNumber) {
            throw new Error("Invalid Transfer: You cannot transfer funds to the same card. Please select a different recipient.");
        }

        this._amountManager.validateAmount(amount);
        const hasSufficientFunds = this._checkIfCardHasAvailableFunds(sourceCard, amount);

        if (!hasSufficientFunds) {
            throw new Error(`Insufficient Funds: Source balance is ${formatCurrency(sourceCard.balance)}. Attempted transfer amount is ${formatCurrency(amount)}.`);
        }

        try {
            sourceCard.deductAmount(amount);
            targetCard.addAmount(amount);

            sourceCard.save();
            targetCard.save();

            return true;
        } catch (error) {
            const errorMsg = `Error during transfer: ${error.message}`;
            logError("transferFundsBetweenCards", errorMsg);
            return false;
        }
    }

    _validateCard(card) {
        if (!card) {
            throw new Error("Card null.");
        }

        if (!(card instanceof Card)) {
            throw new Error(`Card must be instances of the Card class. Received ${typeof card}`);
        }

        if (card.isBlocked) {
          throw new Error("Card Blocked: This card is currently blocked and cannot be used for transactions.");

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
        return card.balance >= amount && (card.balance - amount) >= 0;
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

    toJson() {
        return {
            sortCode: this.sortCode,
            accountNumber: this.accountNumber,
            _balance: this._amountManager.balance,
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

        const saveAs = getCombinedCode(this.sortCode, this.accountNumber)
        this.constructor.saveData(BANK_ACCOUNT_STORAGE_KEY, saveAs, this.toJson());

        return true;
    }

    /**
     * Converts a JSON string or an already parsed object into a `bank` instance. This method is useful for
     * converting an object that has been stringfy by the JSON method and stored in a localStorage back into a class
     * 
     * This method checks if the provided `data` is a JSON string. If it is, the string is parsed into an object.
     * If the `data` is already an object, it is used directly. The method then assigns selected properties 
     * (e.g., ccountNumber", "sortCode", "_balance", "id", "_createdOn`, etc.) from the `data` to a new instance of the `Card` class.
     * 
     * @param {string|Object} data - The data to be converted. It can either be a JSON string or an already parsed object.
     * @returns {Card|null} A new `Card` instance populated with the selected properties, or `null` if there is an error parsing the data.
     * 
     * @throws {Error} If the JSON parsing fails (when `data` is a string), an error is logged and `null` is returned.
     */
    static fromStorage(data) {
        const keys = ["accountNumber", "sortCode", "_balance", "id", "_createdOn"]
        const bankAccountJson = super.fromStorage(data, keys);
        const bankAccount = Object.assign(new BankAccount(), bankAccountJson);
        bankAccount._amountManager.balance = bankAccountJson.balance;
        return bankAccount;

    }
}