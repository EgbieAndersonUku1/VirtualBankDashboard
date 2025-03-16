// For testing purposes - will be removed.
// Node.js doesn't support `localStorage` in the backend,
// so I recreated an `inMemoryStorage` to mimic `localStorage` and all related functions,
// such as `setLocalStorage` and `getLocalStorage` and brought in functions that use it generateRandomID, excludeKey.
// These functions now interact with `inMemoryStorage` instead.
// This file will be deleted once I have tested the other classes: `BankAccount`, `Card`, and the controller `Wallet`.

// simulates how the methods will be used in the frontend

const inMemoryStorage = {}

CARD_STORAGE_KEY = "cards";
CARD_STORAGE_KEY = "cards";

function generateRandomID(maxDigit = 10000000) {
    if (maxDigit <= 0) {
        throw Error(`The max digit cannot be less or equal to 0. Expected a number higher than 0 but got ${maxDigit}`)
    }
    return Math.ceil(Math.random() * maxDigit);
}

// simulates how the setLocalStorage works
function setLocalStorage(key, value) {
    try {
        inMemoryStorage[key] = value;
    } catch (error) {
        console.error('LocalStorage set error:', error);
    }
}


// simulates how the getLocalStorage works includes return []
function getLocalStorage(key) {
    try {
        const data = inMemoryStorage[key];
        if (data?.length === 0) {
            return []
        }
        return data

    } catch (error) {
        console.error('LocalStorage get error:', error);
        return [];
    }
}


function getCombinedCode(a, b) {
    if (typeof a !== 'string' || typeof b !== 'string') {
        throw new TypeError('Both inputs must be strings.');
    }

    if (!a.trim() || !b.trim()) {
        throw new Error('Inputs cannot be empty or whitespace only.');
    }

    return `${a} ${b}`;
}

/**
 * Logs errors to the console with a consistent format.
 * @param {string} functionName - The name of the function where the error occurred.
 * @param {Error} error - The error object to log.
 */
function logError(functionName, error) {
    const timestamp = new Date().toISOString();
    console.error(`[${timestamp}] Error in ${functionName}:`, error);
}



function checkNumber(value) {
    const numberValue = parseFloat(value);

    return {
        isNumber: !isNaN(numberValue) && isFinite(numberValue),
        isInteger: Number.isInteger(numberValue),
        isFloat: !Number.isInteger(numberValue) && !isNaN(numberValue) && isFinite(numberValue)
    };
}




const BANK_ACCOUNT_STORAGE_KEY = "bankAccount";

// manually import card for testing since node cannot import outside a module.



class Card {
    /**
     * Creates an instance of a Card.
     * @param {string} cardHolderName - The name of the card holder.
     * @param {string} cardNumber - The card number.
     * @param {number} expiryMonth - The expiry month of the card.
     * @param {number} expiryYear - The expiry year of the card.
     */
    constructor(cardHolderName, cardNumber, expiryMonth, expiryYear) {
        this.id = generateRandomID();
        this.cardHolderName = cardHolderName;
        this.cardNumber = cardNumber;
        this.expiryMonth = expiryMonth;
        this.expiryYear = expiryYear;
        this._isCardBlocked = false;
        this._amount = 0;
        this._timeStamp = new Date().toISOString();
    }

    /**
     * Creates and saves a new card instance.
     * @param {string} cardHolderName - The name of the card holder.
     * @param {string} cardNumber - The card number.
     * @param {number} expiryMonth - The expiry month of the card.
     * @param {number} expiryYear - The expiry year of the card.
     * @returns {Card} - The newly created and saved card.
     */
    static createCard(cardHolderName, cardNumber, expiryMonth, expiryYear) {

        if (Card._doesCardExists(cardNumber)) {
            throw new Error("Card already exists.");
        }
        const card = new Card(cardHolderName, cardNumber, expiryMonth, expiryYear);
        card.save();
        return card;
    }

    static _doesCardExists(cardNumber) {
        const storage = getLocalStorage(CARD_STORAGE_KEY);

        if (typeof storage !== "object") {
            return false;
        }
        return storage[CARD_STORAGE_KEY]?.hasOwnProperty(cardNumber);
    }

    static deleteCard(cardNumber) {
        const cardDetails = getLocalStorage(CARD_STORAGE_KEY);
        if (Array.isArray(cardDetails) || typeof cardDetails !== "object") {
            logError("deleteCard", `Expected an object but got type ${typeof cardDetails}`);
            return null;
        }

        const userCard = cardDetails[CARD_STORAGE_KEY][cardNumber];
        const updatedCardDetails = excludeKey(userCard, cardNumber);
        setLocalStorage(CARD_STORAGE_KEY, updatedCardDetails);
        return true;

    }


    /**
     * Retrieves a card by its card number.
     * @param {string} cardNumber - The card number to search for.
     * @returns {Card|null} - The card instance, or null if not found.
     */
    static getByCardNumber(cardNumber) {
        const cardDetails = getLocalStorage(CARD_STORAGE_KEY);

        if (Array.isArray(cardDetails) || typeof cardDetails !== "object") {
            logError("getByCardNumber", `Expected an object but got type ${cardDetails}`);
            return null;
        }

        const userCard = cardDetails[CARD_STORAGE_KEY][cardNumber];
        if (!userCard) {
            return null;
        }

        const card = new Card(
            userCard.cardHolderName,
            userCard.cardNumber,
            userCard.expiryMonth,
            userCard.expiryYear
        );

        card.id = userCard.id;
        card._amount = userCard.amount;
        card._isCardBlocked = userCard.isCardBlocked;
        card._timeStamp = userCard.timeStamp;

        return card;
    }

    /**
     * Freezes the card, making it blocked for any future transactions.
     * This also saves the updated card state to local storage.
     */
    freezeCard() {

        if (!this._isCardBlocked) {
            this._isCardBlocked = true;
            this.save();
        }

    }

    /**
     * Unfreezes the card, allowing future transactions.
     * This also saves the updated card state to local storage.
     */
    unfreezeCard() {
        if (this._isCardBlocked) {
            this._isCardBlocked = false;
            this.save();
        }

    }

    /**
     * Getter for the amount (balance) on the card.
     * @returns {number} - The amount (balance) on the card.
     */
    get amount() {
        return this._amount;
    }

    /**
     * Setter for the amount (balance) on the card.
     * @param {number} amount - The amount to set on the card.
     * @throws {Error} - Throws an error if the amount is not a number or is negative.
     */
    set amount(amount) {
        if (typeof amount !== "number") {
            throw new Error(`Expected an integer or float but got ${typeof amount}`);
        }
        if (amount < 0) {
            throw new Error(`Cannot set a negative value. Got ${amount}`);
        }
        this._amount = amount;
    }

    /**
     * Helper method to save the card details to local storage.
     * It also ensures that the card details do not exceed the maximum allowed number of cards.
     * @returns {boolean} - Returns true if the card was saved successfully, otherwise false.
     * @throws {Error} - Throws an error if the maximum number of cards is exceeded or if the card already exists.
     */
    save() {
        const MAXIMUM_CARDS_ALLOWED = 3;

        if (this._timeStamp === null) {
            this._timeStamp = new Date().toISOString();
        }

        try {
            let storage = getLocalStorage(CARD_STORAGE_KEY);

            if (!storage || typeof storage !== 'object') {
                storage = { [CARD_STORAGE_KEY]: {} };
            }

            if (Object.keys(storage[CARD_STORAGE_KEY]).length >= MAXIMUM_CARDS_ALLOWED) {
                throw new Error("You can only store a maximum of three cards.");
            }

            storage[CARD_STORAGE_KEY][this.cardNumber] = this.getCardDetails();
            setLocalStorage(CARD_STORAGE_KEY, storage);
            return true;

        } catch (error) {
            logError("save", error);
            return false;
        }
    }

    /**
     * Retrieves the card details as an object.
     * @returns {Object} - An object containing the card details.
     */
    getCardDetails() {
        return {
            cardHolderName: this.cardHolderName,
            cardNumber: this.cardNumber,
            expiryMonth: this.expiryMonth,
            expiryYear: this.expiryYear,
            isCardBlocked: this._isCardBlocked,
            amount: this._amount,
            timeStamp: this._timeStamp,
            id: this.id,
        };
    }
}


/*
 * Class: BankAccount
 * Manages bank account operations including fund transfers and balance updates.
 */
class BankAccount {

    constructor(sortCode, accountNumber, balance = 0) {
        this.accountNumber = accountNumber;
        this.sortCode = sortCode;
        this._balance = balance;
        this.id = generateRandomID();
        this._createdOn = null;
    }

    get balance() {
        return this._balance
    }

    set balance(balance) {

        if (!amountCheck.isNumber || (!amountCheck.isInteger && !amountCheck.isFloat)) {
            throw new TypeError(`The amount must be a valid number (int or float). Received: ${amount} of type ${typeof amount}.`);
        }
        if (balance < 0) {
            throw new Error(`Cannot set a negative value. Got ${balance}`);
        }
        this._balance = balance;
    }

    static getByAccount(sortCode, accountNumber) {
        const fullAccountNumber = getCombinedCode(sortCode, accountNumber);

        const bankAccounts = getLocalStorage(BANK_ACCOUNT_STORAGE_KEY, fullAccountNumber);

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
     * @param {*} card1 - The card from which the amount will be transferred.
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
            card.amount  -= amount; // Deduct from card
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


// Testing purpose - Remove afterward - simply test to see if things are working accordingly 
// later will right proper tests

const ACCOUNT_NUMBER = getCombinedCode("400217", "01413217");

// Creating a bank account for Alice
console.log("Creating a new card for Alice Smith...");
const bankAccount = BankAccount.createBankAccount("400217", "01413217", 2028);

// Add funds to bank account
const isSaved = bankAccount.save();
console.log(isSaved ? "Bank successfully saved." : "Failed to save the bank details.");
console.log(bankAccount.balance ? `Bank has been credited with ${bankAccount.balance}` : "Failed to credit bank account");
console.log("-----------------------------------------------------");

// Creating cards for testing
console.log("Creating a new card for Egbie...");
const egbieCard = Card.createCard("Egbie", "1234-5678-9876-5432", 12, 2028);
egbieCard.amount = 500;
const isCardSaved = egbieCard.save();
console.log(isCardSaved ? "Card successfully saved." : "Failed to save the card.");
console.log(egbieCard.amount ? "Card has been credited with 500" : "Failed to credit card");
console.log("-----------------------------------------------------");

console.log("Creating a new card for Mary Jane...");
const maryJaneCard = Card.createCard("Mary Jane", "1234-5678-9876-5412", 12, 2028);
maryJaneCard.amount = 200;
const isCard2Saved = maryJaneCard.save();
console.log(isCard2Saved ? "Card 2 successfully saved." : "Failed to save the card.");
console.log(maryJaneCard.amount ? "Card 2 has been credited with 200" : "Failed to credit card");
console.log("-----------------------------------------------------");

// Testing if bank account can transfer amount 
const EGBIE_BALANCE = egbieCard.amount;
const MARY_JANE_BALANCE = maryJaneCard.amount;

const AMOUNT_TO_TRANSFER = 400;
console.log(`Egbie's card has £${EGBIE_BALANCE} and Mary Jane's card has £${MARY_JANE_BALANCE}`);
console.log(`Beginning transfer of £${AMOUNT_TO_TRANSFER} ....`);

const transferResult = bankAccount.transferAmountToAnotherCard(egbieCard, maryJaneCard, AMOUNT_TO_TRANSFER);
console.log(transferResult ? "Transfer successful." : "Transfer failed.");

console.log("New balance after the transfer:");
console.log(`Egbie's card has <new balance: £${egbieCard.amount}, old balance: £${EGBIE_BALANCE}>`);
console.log(`Mary Jane's card has <new balance: £${maryJaneCard.amount}, old balance: £${MARY_JANE_BALANCE}>`);
console.log("-----------------------------------------------------");

// Testing transfer back to account
console.log("Account balance...");
const oldBalance = bankAccount.balance;
console.log(`The current account balance for ${ACCOUNT_NUMBER} is £${oldBalance}`);
console.log("Transferring to account from Mary Jane's card...");

const MARY_JANE_OLD_BALANCE = maryJaneCard.amount;
const transferToAccountResult = bankAccount.transferToAccount(maryJaneCard, 600);
console.log(transferToAccountResult ? "Transfer to account successful." : "Transfer to account failed.");
console.log(`Mary Jane's card has <new balance: £${maryJaneCard.amount}, old balance: £${MARY_JANE_OLD_BALANCE}>`);

console.log(`The new account balance is £${bankAccount.balance}`);
