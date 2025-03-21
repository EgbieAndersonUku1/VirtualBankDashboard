// This approach employs a straightforward method to test whether the classes work well together. 
// The simplicity lies in the fact that it doesn't rely on any external modules, which helps keep the overhead low. 
// The entire file can be easily executed by navigating (`cd`) to the folder and running the command `node application_test.js`.

// However, the downside is that I had to duplicate all the classes and functions and build a `localStorage` 
// system designed to replicate how `localStorage` functions in the browser, as is not natively available in the 
// Node environment and I couldn't import a node version of the localStorage. I also had to ensure it interacts properly with the other 
// functions before writing the tests. 
// The reason for not using a testing module like `node:test` was simply because I wanted to quickly run the tests 
// and observe their interactions without needing to set anything up. This file contains all the classes and functions needed
// with no imports or installations required, making it easy to run independently.



const CARD_STORAGE_KEY = "cards";
const BANK_ACCOUNT_STORAGE_KEY = "bankAccount";
const WALLET_STORAGE_KEY = "wallet"



// simulates how the LocalStorage since node doesn't allow it 

/**
 * localStorage
 * A simple in-memory storage system that mimics the browser's LocalStorage for Node.js environments.
 * Provides methods to store and retrieve key-value pairs. 
 *
 * Methods:
 * - setItem(key, value): Stores a value under the specified key.
 * - getItem(key): Retrieves the value associated with the specified key.
 */
const localStorage = {
    _IN_MEMORY_DB: {},

    setItem: (key, value) => {
        if (!key || value === undefined) {
            throw new Error("One or more key is missing to set the database")
        }
        try {
            localStorage._IN_MEMORY_DB[key] = value;

        } catch (error) {
            throw new Error(error)
        }
    },

    getItem: (key) => {
        return localStorage._IN_MEMORY_DB[key];
    }
};



function excludeKey(obj, key) {

    if (typeof obj !== 'object' || obj === null) {
        throw new TypeError('Expected an object or array');
    }

    // Handle an array
    if (Array.isArray(obj)) {
        if (typeof key !== 'number' || key < 0 || key >= obj.length) {
            throw new RangeError('Invalid array index');
        }
        return [...obj.slice(0, key), ...obj.slice(key + 1)];
    }

    const { [key]: _, ...rest } = obj;
    return rest;
}




// simulate setLocalStorage since it uses JSON.stringify
// it should behave how it behaves in the db.js file to ensure
// the app will work correctly
function setLocalStorage(key, value) {
    try {

        localStorage.setItem(key, JSON.stringify(value));


    } catch (error) {
        console.error('LocalStorage set error:', error);
    }
}


// simulate getLocageStorage since it uses JSON.parse
// it should behave how it behaves in the db.js file to ensure the app 
// will work correctly
function getLocalStorage(key) {

    try {
        const data = localStorage.getItem(key);

        return data ? JSON.parse(data) : [];
    } catch (error) {
        console.error('LocalStorage get error:', error);
        return [];
    }
}






function generateRandomID(maxDigit = 10000000) {
    if (maxDigit <= 0) {
        throw Error(`The max digit cannot be less or equal to 0. Expected a number higher than 0 but got ${maxDigit}`)
    }
    return Math.ceil(Math.random() * maxDigit);
}




function checkNumber(value) {
    const numberValue = parseFloat(value);

    return {
        isNumber: !isNaN(numberValue) && isFinite(numberValue),
        isInteger: Number.isInteger(numberValue),
        isFloat: !Number.isInteger(numberValue) && !isNaN(numberValue) && isFinite(numberValue)
    };
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


/**
 * Logs errors to the console with a consistent format.
 * @param {string} functionName - The name of the function where the error occurred.
 * @param {Error} error - The error object to log.
 */
function warnError(functionName, error) {
    const timestamp = new Date().toISOString();
    console.warn(`[${timestamp}] Warning in ${functionName}:`, error);
}




class AmountManager {

    /**
     * Constructs a new AmountManager instance.
     * 
     * @param {number} initialAmount - The initial balance to be set. Defaults to 0 if not provided.
     */
    constructor(initialAmount = 0) {
        this._balance = initialAmount;
    }

    /**
     * Adds a specified amount to the current balance.
     * 
     * @param {number} amount - The amount to be added. Must be a positive number.
     * 
     * @throws {TypeError} If the amount is not a valid number (int or float).
     * @throws {Error} If the amount is negative, zero, or null.
     */
    addAmount(amount) {
        this.validateAmount(amount);
        this._balance += amount;
        this._setBalanceToDecimalPlaces();
    }

    /**
     * Deducts a specified amount from the current balance.
     * 
     * @param {number} amount - The amount to be deducted. Must be a positive number and less than or equal to the balance.
     * 
     * @throws {TypeError} If the amount is not a valid number (int or float).
     * @throws {Error} If the amount is negative, zero, null, or greater than the current balance.
     */
    deductAmount(amount) {
        this.validateAmount(amount);
        if (amount > this._balance) {
            throw new Error(`Insufficient funds for this operation. Amount to transfer: ${amount}, balance: ${this._balance}`);
        }
        this._balance -= amount;
        this._setBalanceToDecimalPlaces();
    }

    /**
     * Retrieves the current balance.
     * 
     * @returns {number} The current balance.
     */
    get balance() {
        return this._balance;
    }

    /**
     * Sets the balance to a new value.
     * 
     * @param {number} balance - The new balance to be set.
     */
    set balance(balance) {
        this._balance = balance;
    }

    /**
     * Validates the specified amount to ensure it meets all required conditions.
     * 
     * @param {number} amount - The amount to be validated.
     * 
     * @throws {TypeError} If the amount is not a valid number (int or float).
     * @throws {Error} If the amount is null, negative, or zero.
     * 
     * @returns {boolean} True if the amount is valid.
     */
    validateAmount(amount) {
        if (!amount) {
            throw new Error("The amount cannot be null");
        }

        const amountToCheck = checkNumber(amount);

        if (!amountToCheck.isNumber || (!amountToCheck.isInteger && !amountToCheck.isFloat)) {
            throw new TypeError(`The amount must be a valid number (int or float). Received: ${amount} of type ${typeof amount}.`);
        }

        if (amount <= 0) {
            throw new Error("Amount cannot be a negative value or zero");
        }

        return true;
    }

    /**
     * Sets the balance to two decimal places
     */
    _setBalanceToDecimalPlaces() {
        this._balance = parseFloat((this._balance).toFixed(2))
    }
}



class DataStorage {

    static fromStorage(data, selectedKeys, fallback = {}) {
        let obj;

        if (typeof data === 'string') {
            try {
                obj = JSON.parse(data);
            } catch (error) {
                logError(`Failed to parse JSON data: ${error.message}`)
                return fallback;
            }
        } else if (typeof data === 'object' && data !== null) {
            obj = data;
        } else {
            console.error(`Invalid data type: Expected an object or a JSON string but received ${typeof data}`);
            return fallback;
        }

        if (!Array.isArray(selectedKeys)) {
            throw new TypeError(`The required keys must be an array. Expected an array but got ${typeof selectedKeys}`);
        }

        if (selectedKeys.length === 0) {
            throw new Error("The required keys cannot be an empty array.");
        }

        const selectedProps = {};
        for (const key of selectedKeys) {
            if (obj.hasOwnProperty(key)) {
                selectedProps[key] = obj[key];
            } else {

                warnError("fromStorage", `"${key}" not found in the provided data.`)
            }
        }

        return selectedProps;
    }

    /**
     * Saves data to a specified key within the localStorage under a given name.
     * If the storage key does not exist, it creates a new storage object.
     * 
     * @param {string} storageKey - The primary key to store data under in localStorage.
     * @param {string} saveAs - The name of the sub-key under the storage key where data will be saved.
     * @param {*} data - The data to be saved in localStorage (can be of any type).
     * @returns {boolean} - Returns true if the data is successfully saved, otherwise false.
     */
    static saveData(storageKey, saveAs, data) {

        if (typeof storageKey !== 'string' || storageKey.trim() === '') {
            throw new TypeError("The 'storageKey' must be a non-empty string.");
        }

        if (typeof saveAs !== 'string' || saveAs.trim() === '') {
            throw new TypeError("The 'saveAs' must be a non-empty string.");
        }

        if (data === null || data === undefined) {
            throw new TypeError("The 'data' to save cannot be null or undefined.");
        }


        let storage = getLocalStorage(storageKey);
        if (Array.isArray(storage)) {
            warnError("saveData", `No data found for storage card key: ${storageKey}`);
            warnError("saveData", `Creating a new storage object for key: ${storageKey}`);
            storage = { [storageKey]: {} };
        }

        try {

            storage[storageKey][saveAs] = data;
            setLocalStorage(storageKey, storage);
            return true;

        } catch (error) {
            const errorMsg = `Error occured with key ${storageKey} while trying to save as ${saveAs} for data: ${error}`;
            logError("save", errorMsg);
            return false;
        }
    }
}



class BankAccount extends DataStorage {

    constructor(sortCode, accountNumber, initialBalance = 0) {
        super();
        this.accountNumber = accountNumber;
        this.sortCode = sortCode;
        this.id = generateRandomID();
        this._createdOn = null;
        this._amountManger = new AmountManager(initialBalance);
        this._balance = initialBalance;
    }

    get balance() {
        return this._amountManger.balance;
    }

    set balance(balance) {

        this._amountManger.validateAmount(balance)
        this._amountManger.balance = balance;
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
        return new BankAccount(bankAccount.sortCode, bankAccount.accountNumber, bankAccount.balance)

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
     * @param {*} amount - The amount to be transferred from card to given account.
     * @returns {boolean} - Returns `true` if the transfer is successful, `false` if it fails.
     */
    transferToAccount(card, amount) {

        this._validateCard(card);
        this._amountManger.validateAmount(amount);

        const hasFunds = this._checkIfCardHasAvailableFunds(card, amount);

        if (!hasFunds) {
            logError("BankAccount.transferToAccount", "Transfer couldn't be made because there are insufficient funds in the account");
            throw new Error(`Insufficient funds in Card. Available: ${card.balance}, Requested: ${amount}`);
        }

        try {
            card.deductAmount(amount);
            this._amountManger.addAmount(amount);

            card.save();
            this.save();

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
            throw new Error("Transfer failed: The source and target cards are the same. You cannot transfer to the same card.");
        }

        this._amountManger.validateAmount(amount);
        const hasSufficientFunds = this._checkIfCardHasAvailableFunds(sourceCard, amount);

        if (!hasSufficientFunds) {
            throw new Error(`Insufficient funds. Source card name ${sourceCard.cardHolderName}, sourceCard balance: ${sourceCard.balance}, Attempted transfer amount: ${amount}.`);
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
            throw new Error(`Transfer failed: The card is block. Card blocked: ${card.isBlocked}`);
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
            _balance: this._amountManger.balance,
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



class Card extends DataStorage {
    /**
     * Creates an instance of a Card.
     * @param {string} cardHolderName - The name of the card holder.
     * @param {string} cardNumber - The card number.
     * @param {number} expiryMonth - The expiry month of the card.
     * @param {number} expiryYear - The expiry year of the card.
     */
    constructor(cardHolderName, cardNumber, expiryMonth, expiryYear) {
        super();
        this.id = generateRandomID();
        this.cardHolderName = cardHolderName;
        this.cardNumber = cardNumber;
        this.expiryMonth = expiryMonth;
        this.expiryYear = expiryYear;
        this._isCardBlocked = false;
        this._balance = 0
        this._amountManager = new AmountManager(this._balance);
        this._timeStamp = new Date().toISOString();
    }

    addAmount(amount) {
        this._amountManager.validateAmount(amount);
        this._amountManager.addAmount(amount)

    }

    deductAmount(amount) {

        this._amountManager.validateAmount(amount)
        this._amountManager.deductAmount(amount);

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

        if (!cardHolderName || !cardNumber || !expiryMonth || !expiryYear) {
            throw Error(`One or more of the fields are missing. Cardholder: ${cardHolderName}, ${cardNumber}, ${expiryMonth}, ${expiryYear}`)
        }
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
        card._amountManager.balance = userCard._balance;
        card._isCardBlocked = userCard.isCardBlocked;
        card._timeStamp = userCard.timeStamp;
        card._balance = userCard._balance;

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
     * Getter for the card is blocked. Returns
     * true if the card is block or false otherwise.
     * 
     * @returns {boolean} - Returns true if the card is block or false.
     */
    get isBlocked() {
        return this._isCardBlocked;
    }
    /**
     * Getter for the amount (balance) on the card.
     * @returns {number} - The amount (balance) on the card.
     */
    get balance() {
        return this._amountManager.balance

    }

    /**
     * Setter for the amount (balance) on the card.
     * @param {number} amount - The amount to set on the card.
     * @throws {Error} - Throws an error if the amount is not a number or is negative.
     */
    set balance(amount) {
        this._amountManager.validateAmount(amount);
        this._amountManager.balance = amount;
    }

    /**
     * Helper method to save the card details to local storage.
     * It also ensures that the card details do not exceed the maximum allowed number of cards.
     * @returns {boolean} - Returns true if the card was saved successfully, otherwise false.
     * @throws {Error} - Throws an error if the maximum number of cards is exceeded or if the card already exists.
     */
    save() {

        return this.constructor.saveData(CARD_STORAGE_KEY, this.cardNumber, this.toJson())

    }

    /**
     * Retrieves the card details as an object/json.
     * @returns {Object} - An object containing the card details.
     */
    toJson() {
        return {
            cardHolderName: this.cardHolderName,
            cardNumber: this.cardNumber,
            expiryMonth: this.expiryMonth,
            expiryYear: this.expiryYear,
            isCardBlocked: this._isCardBlocked,
            _balance: this._amountManager.balance,
            timeStamp: this._timeStamp,
            id: this.id,
        };
    }

    /**
     * Converts a JSON string or an already parsed object into a `Card` instance. This method is useful for
     * converting an object that has been stringfy by the JSON method and stored in a localStorage back into a class
     * 
     * This method checks if the provided `data` is a JSON string. If it is, the string is parsed into an object.
     * If the `data` is already an object, it is used directly. The method then assigns selected properties 
     * (e.g., `cardHolderName`, `cardNumber`, `expiryMonth`, etc.) from the `data` to a new instance of the `Card` class.
     * 
     * @param {string|Object} data - The data to be converted. It can either be a JSON string or an already parsed object.
     * @returns {Card|null} A new `Card` instance populated with the selected properties, or `null` if there is an error parsing the data.
     * 
     * @throws {Error} If the JSON parsing fails (when `data` is a string), an error is logged and `null` is returned.
     */
    static fromStorage(data) {

        const keys = ['cardHolderName', 'cardNumber', 'expiryMonth', 'expiryYear', '_isCardBlocked', '_balance', '_timeStamp', 'id'];

        const selectedCardJson = super.fromStorage(data, keys);
        const card = Object.assign(new Card(), selectedCardJson);
        card.balance = selectedCardJson._balance;
        return card;

    }

    refreshBalance() {
        const cardDetails = Card.getByCardNumber(this.cardNumber);
        if (!cardDetails) {
            return;
        }

        this._balance = cardDetails.balance;
        this._amountManager._balance = cardDetails.balance;
    }


}




class Wallet extends DataStorage {


    /**
   * Constructs a new Wallet instance.
   * @param {object | BankAccount}  - An instance of the BankAccount class.
   * @param {number|null} lastTransfer - The last transfer amount made by the wallet (default: null).
   * @param {number|null} lastAmountReceived - The last amount received by the wallet (default: null).
   * @param {number} numberOfCards - The number of cards currently in the wallet (default: 0).
   * @param {string|null} pin - The PIN associated with the wallet (default: null).
   */
    constructor(bankAccount, lastTransfer = null, lastAmountReceived = null, numberOfCards = 0, pin = null) {
        super();
        this._id                    = null;
        this._lastTransfer          = lastTransfer;
        this._lastAmountReceived    = lastAmountReceived;
        this._numberOfCards         = numberOfCards;
        this._totalCards            = 0;
        this._MAXIMUM_CARDS_ALLOWED = 3;
        this._cards                 = {}; // For cache
        this._linkedAccountNumber   = null;
        this.pin                    = pin
        this._walletAmount          = 0;
        this._amountManager         = new AmountManager(this._walletAmount);
        this._bankAccount           = bankAccount;
        this._linkBankAccountToWallet();
    }

    /**
     * Links the user's bank Account to their wallet. If the bank account is not a valid
     * instance of the BankAccount class, an error is thrown otherwise the bank account is
     * linked.
     */
    _linkBankAccountToWallet() {
        if (!(bankAccount instanceof BankAccount)) {
            throw new Error("The bank account is not an instant of the Bank class")
        }
    }

    /**
     * Retrieves the wallet amount.
     * @returns {number} The current wallet amount.
    */
    get walletAmount() {
        return this._walletAmount;
    }

    /**
     * Retrieves the number of virtual cards attached to the wallet.
     * @returns {number} The number of cards in the wallet
    */
    get numOfCardsInWallet() {
        return this._totalCards;
    }

    /**
     * Returns the account
     * @returns {number} The number of cards in the wallet
    */
    get linkedAccountNumber() {
        return this._bankAccount.accountNumber;
    }

     /**
     * set the account number for easy viewing
     * @returns {number} The number of cards in the wallet
    */
    set linkedAccountNumber(accountNumber) {
        this._bankAccount.accountNumber = accountNumber
    }

    /**
     * Converts the Wallet class data to a JSON object.
     * 
     * @returns {Object|null} A JSON object containing the Wallet data, including cards, linked account,
     *                        wallet amount, and associated bank account if available. Returns null if
     *                        the '_bankAccount' field is null.
     */
    toJson() {

        const wallet = {
            lastTransfer: this._lastTransfer,
            lastAmountReceived: this._lastAmountReceived,
            numberOfCards: this._numberOfCards,
            totalCards: this._totalCards,
            MAXIMUM_CARDS_ALLOWED: this._MAXIMUM_CARDS_ALLOWED,
            cards: this._cards,
            linkedAccountNumber: this._linkedAccountNumber,
            id: this._id,
            pin: this.pin,
            _walletAmount: this._amountManager.balance,
        }
        try {
            if (!this._bankAccount) {
                logError("BankAccount.toJson", "The '_bankAccount' field is null");
                return null;
            }
        } catch (error) {
            logError("Wallet.toJson", error);
            throw new Error(error);

        }

        wallet.bankAccount = this._bankAccount.toJson()
        return wallet;
    }

    /**
     * Verifies if a provided pin matches the pin stored in the wallet.
     * 
     * Every transaction requires a valid pin for authentication.
     * 
     * @param {string} pin - The pin to be verified.
     * @returns {boolean} True if the pin matches, otherwise false.
     */
    verifyPin(pin) {
        return pin === this.pin;
    }

    /**
     * Removes a card from the wallet by its card number.
     * 
     * This method checks if the card exists in the wallet before removing it. 
     * If the card is successfully removed, the total card count is updated, 
     * and changes are saved.
     * 
     * @param {string} cardNumber - The card number to be removed.
     * @throws {Error} If the card number is not a valid string.
     */
    removeCard(cardNumber) {
        if (typeof cardNumber !== "string" || !cardNumber.trim()) {
            throw new Error(`Invalid card number. Expected a non-empty string but got ${typeof cardNumber}`);
        }

        if (!this.isCardInWallet(cardNumber)) {
            return;
        }

        this._cards = excludeKey(this._cards, cardNumber);
        this._deductTotalCardsByOne();
        this.save();
    }


    /**
     * Removes all cards from the wallet.
     * 
     * This method clears all cards stored in the wallet, resets the total card count to zero,
     * and saves the changes to persistent storage.
     */
    removeAllCards() {
        this._cards = {}
        this._totalCards = 0;
        this.save()
    }


    /**
    * Updated the total cards count in the wallet.
    */
    _deductTotalCardsByOne() {
        this._totalCards -= 1;
    }

    /**
    * Adds funds to a specific card in the wallet by its card number.
    * 
    * This method verifies the card's existence in the wallet, 
    * updates the card's balance, logs the transaction, and saves the changes.
    * 
    * @param {string} cardNumber - The card number to be funded.
    * @param {number} amount - The amount to fund the card.
    * @returns {Object|boolean} The updated card object if successful, false if the card doesn't exist.
    * @throws {Error} If an unexpected error occurs.
    */
    addFundsToCard(cardNumber, amount) {
        if (!this.isCardInWallet(cardNumber)) {
            return false;
        }

        const cardInWallet = this.getByCardNumber(cardNumber);
        if (!cardInWallet) {
            warnError("addFundstoCard", "Expected a card object but received none");
            return;
        }

        try {
            cardInWallet._amountManager.addAmount(amount);
        } catch (error) {
            logError("Wallet.addFundsToCard", error.message || error);
        }

        this._updateCardTransaction(cardInWallet);
        this.save();
        return cardInWallet; // returned the funded card

    }

    /**
     * Transfers funds from the linked bank account to a specified card in the wallet.
     * 
     * This method attempts to transfer a specified amount from the bank account to the card. 
     * If the transfer is successful, it updates the `lastTransfer` and `walletAmount` fields.
     * 
     * @param {string} cardNumber - The card number where funds should be transferred.
     * @param {number} amount - The amount to transfer to the card.
     * @returns {boolean} - Returns `true` if the transfer was successful, `false` otherwise.
     */
    transferToWallet(cardNumber, amount) {

        const card = this.getByCardNumber(cardNumber);
        const isTransfered = this._bankAccount.transferToAccount(card, amount);

        if (isTransfered) {
            this.lastTransfer = amount;
            this.walletAmount += this._bankAccount.balance;
            return true;
        }
        return false;

    }

    /**
    * Transfers funds between two cards in the wallet.
    *
    * This method allows transferring funds from one card (source) to another card (target)
    * within the wallet. The transfer will only succeed if:
    * - The wallet contains at least two cards.
    * - The source and target cards are different.
    * - Both cards exist in the wallet.
    * - The transfer operation via the bank account is successful.
    * 
    * After a successful transfer, the transaction history of both cards is updated, 
    * and the wallet's state is saved.
    *
    * @param {string} sourceCardNumber - The card number of the card to transfer funds from.
    * @param {string} targetCardNumber - The card number of the card to transfer funds to.
    * @param {number} amount - The amount of funds to be transferred.
    * @returns {boolean} - Returns true if the transfer is successful, otherwise false.
    * @throws {Error} - If the wallet contains less than two cards, if the source and target 
    *                   card numbers are the same, or if one or both cards are invalid.
    */
    transferFundsFromCardToCard(sourceCardNumber, targetCardNumber, amount) {
        const MAXIMUM_CARDS_FOR_TRANSFER = 2;

        if (this.numOfCardsInWallet < MAXIMUM_CARDS_FOR_TRANSFER) {
            const error = `Cannot transfer funds between cards: You have less than ${MAXIMUM_CARDS_FOR_TRANSFER} cards in your wallet.`;
            logError("Wallet.transferFundsFromCardToCard", error);
            throw new Error(error);
        }

        if (sourceCardNumber === targetCardNumber) {
            const error = "Source and target card numbers cannot be the same.";
            logError("Wallet.transferFundsFromCardToCard", error);
            throw new Error(error);
        }

        const transferringCard = this.getByCardNumber(sourceCardNumber);
        const receivingCard = this.getByCardNumber(targetCardNumber);

        if (!transferringCard || !receivingCard) {
            const error = `Invalid card(s) provided: Source (${sourceCardNumber}), Target (${targetCardNumber}).`;
            logError("Wallet.transferFundsFromCardToCard", error);
            throw new Error(error);
        }

        const isTransferSuccess = this._bankAccount.transferFundsBetweenCards(transferringCard, receivingCard, amount);

        if (isTransferSuccess) {
            [transferringCard, receivingCard].forEach(card => this._updateCardTransaction(card));
            this.save();
            return true;
        }

        return false;
    }

    /**
     * Updates the wallet with the given amount providing the amount is valid.
     * 
     * @throws {Error} - Throws several errors:
     *                 - If the amount not a valid integer or float
     *                 - If the amount is less or equal to zero
     *            
     * @param {*} amount The funds to update the to the wallet.
     */
    addFundToWallet(amount) {
        this._amountManager.validateAmount(amount)
        this._walletAmount = amount;
    }

    /**
    * Checks if a card with the given card number exists in the wallet.
    *
    * This method verifies if a card number is present in the wallet. 
    * It returns true if the card exists, otherwise false.
    *
    * @param {string} cardNumber - The card number to check.
    * @returns {boolean} - Returns true if the card is in the wallet, otherwise false.
    * @throws {Error} - If the provided card number is not a valid, non-empty string.
    */
    isCardInWallet(cardNumber) {

        if (typeof cardNumber !== "string" || !cardNumber.trim()) {
            throw new Error("Invalid card number. It must be a non-empty string.");
        }
        return this._cards.hasOwnProperty(cardNumber.trim())
    }

    /**
     * Adds a card to the wallet if it doesn't exceed the maximum allowed capacity 
     * and if the card does not already exist in the wallet.
     *
     * This method checks if the wallet has room for more cards, if the card is not 
     * already added, and if the card number is valid. If all conditions are met, 
     * the card is added to the wallet and returned as an object. If any condition fails, 
     * an error is thrown.
     *
     * @param {string} cardNumber - The card number to add to the wallet.
     * @returns {Object|boolean} - Returns the card object if successfully added to the wallet, 
     *                             or false if the card could not be added.
     * @throws {Error} - Throws an error if:
     *     - The card exceeds the maximum number of cards allowed in the wallet.
     *     - The card is already in the wallet.
     *     - The card number is not a valid string.
     */
    addCardToWallet(cardNumber) {

        if (this._totalCards >= this._MAXIMUM_CARDS_ALLOWED) {
            throw new Error("You can only store a maximum of three cards.");
        }

        if (this.isCardInWallet(cardNumber)) {
            throw new Error("This card is already added to the wallet.");
        }

        const card = Card.getByCardNumber(cardNumber);

        if (card) {
            this._cards[cardNumber] = card.toJson();  // localStorage can't save classes needs to be converted to json and then saved then rebuild when loaded
            this._totalCards += 1;
            this.save();
            return card;
        }
        return false;
    }

    /**
    * Updates the wallet with the latest details of the card after any transaction, 
    * such as transferring funds between virtual cards or to the wallet.
    *
    * This private method ensures that the wallet's records are in sync with the 
    * latest card details, especially after transactions like transfers or modifications.
    * It converts the updated card object to a JSON format and saves it in the wallet.
    *
    * @param {Card} card - The card object that needs to be updated.
    * @throws {Error} - Throws an error if the provided card is not a valid instance of the Card class.
    * 
    * @returns {void} - This method does not return a value.
    */
    _updateCardTransaction(card) {
        if (!card || !(card instanceof Card)) {
            throw new Error("The card cannot be empty and it must be an instance of Card")
        }
        this._cards[card.cardNumber] = card.toJson();

    };


    /**
     * Retrieves the card object associated with the given card number, 
     * provided the card number is a valid, non-empty string.
     *
     * This method checks if the card number is valid, and if so, attempts to 
     * retrieve the corresponding card from the wallet. If the card number is invalid 
     * or the card does not exist, an error is thrown or `null` is returned, respectively.
     *
     * @param {string} cardNumber - The card number to search for.
     * 
     * @throws {Error} - Throws an error if:
     *     - The card number is not a valid string.
     *     - The card number is empty or only contains whitespace.
     * 
     * @returns {Card|null} - Returns the card object if found, or `null` if not found.
     */
    getByCardNumber(cardNumber) {

        if (!cardNumber || typeof cardNumber != "string" || cardNumber.trim() == '') {
            logError("Wallet.getByCardNumber", "The card number is not a valid string.")
            throw Error(`The card number must be a string. Expected a string but got type: ${typeof cardNumber}, ${cardNumber}`);
        }

        if (!this.isCardInWallet(cardNumber)) {
            return null;
        }

        return Card.fromStorage(this._cards[cardNumber]);
    }


    /**
     * A static method that ensures the given card object's data is synchronized with
     * the corresponding data stored in the wallet. It updates the card object in place 
     * with the details from the wallet.
     *
     * This method checks that both the card and the wallet are valid instances, and 
     * then it updates the card's attributes from the wallet's stored data.
     *
     * @param {Card} card - The card object to sync with the wallet's stored data.
     * @param {Wallet} wallet - The wallet instance from which to retrieve the card data.
     * 
     * @throws {Error} - Throws an error if:
     *     - The `card` is not an instance of the `Card` class.
     *     - The `wallet` is not an instance of the `Wallet` class.
     */
    static refreshCardFromWallet(card, wallet) {
        if (!(card instanceof Card)) {
            throw new Error("The card is not instance of the card class");
        }

        if (!(wallet instanceof Wallet)) {
            throw new Error("The wallet is not instance of the wallet class")
        }

        const cardFromStorage = wallet.getByCardNumber(card.cardNumber);
        card.id = cardFromStorage.id;
        card.cardHolderName = cardFromStorage.cardHolderName;
        card.cardNumber = cardFromStorage.cardNumber;
        card.expiryMonth = cardFromStorage.expiryMonth;
        card.expiryYear = cardFromStorage.expiryYear;
        card._amountManager.balance = cardFromStorage._balance;
        card._isCardBlocked = cardFromStorage.isCardBlocked;
        card._balance = cardFromStorage._balance

    }

    /**
     * Returns an array containing all the card objects found in the wallet.
     * If no cards are found, an empty array is returned.
     *
     * @returns {Card[]} An array of Card objects in the wallet, or an empty array if no cards are found.
     */
    getAllCards() {
        const cards = []
        if (!this.numOfCardsInWallet) {
            return cards;
        }

        const cardNumbers = Object.keys(this._cards)

        cardNumbers.forEach((cardNumber) => {
            const cardJson = this._cards[cardNumber];
            const card = Object.assign(new Card, cardJson)
            cards.push(card);
        })

        return cards;

    }


    /**
     * Saves the wallet data to the localStorage.
     * 
     * This method ensures that the wallet has a valid ID and PIN before saving. 
     * If the wallet does not already have an ID or PIN, they will be generated.
     *
     * @returns {Wallet} The wallet instance after it has been saved.
     */
    save() {
        if (!this._id) {
            this._id = generateRandomID();
        }
        if (!this.pin) {
            this.pin = generateRandomID();
        }

        return this.constructor.saveData(WALLET_STORAGE_KEY, this.linkedAccountNumber, this.toJson())
    }

    static loadWallet(accountNumber) {

        if (!accountNumber || typeof accountNumber != "string" || accountNumber.trim() == "") {
            logError("Wallet.loadWallet", `Got an invalid accountNumber. Expected a string but got ${typeof accountNumber}`);
            throw new Error("Invalid account string provided")
        }
        const walletDataStorage = Wallet._getWalletData();

      
        if (!walletDataStorage) {
            warnError("Wallet.loadWallet", "The wallet data was not found");
            console.info("not found")
            return false;
        }

        const userWalletData = walletDataStorage[WALLET_STORAGE_KEY][accountNumber];
        if (!userWalletData || userWalletData === undefined) {
            warnError("Wallet.loadWallet", `Failed to load wallet because your account information couldn't be found ${userWalletData}`);
        }

    
        const requiredKeys = ['sortCode',
            'accountNumber',
            '_lastTransfer',
            '_lastAmountReceived',
            '_totalCards',
            '_bankAccount',
            '_cards',
            '_linkedAccountNumber',
            '_id',
            'pin',
            'walletAmount',
        ];

        const walletJson = super.fromStorage(userWalletData, requiredKeys);
        const wallet = Object.assign(new Wallet, walletJson);
        
        return wallet;

    }

    /**
     * Checks if a user wallet has already been created for a given account number.
     * 
     * This static method determines whether a wallet associated with the specified 
     * account number exists in the system. It returns true if the wallet exists, false if it 
     * does not, and null if the system storage mechanism is not accessible or not initialized.
     * 
     * @param {string} accountNumber - The account number to check for an existing wallet.
     * 
     * @throws {TypeError} - If the account number is not a valid non-empty string.
     * 
     * @returns {boolean | null} - Returns true if the wallet exists, false if it doesn't,
     *                             and null if the storage mechanism is unavailable.
     */
    static doesUserWalletExist(accountNumber) {
        if (!accountNumber || typeof accountNumber != "string" || accountNumber.trim() === '') {
            logError("Wallet.hasUserWallet", `The account number provided is invalid: Got type ${typeof accountNumber} but expected string`);
            throw new TypeError("Invalid string");
        }
        const walletStorage = Wallet._getWalletData();
      
        if (!walletStorage) {
            warnError("Wallet.hasUserWallet", "The wallet storage in the local storage wasn't found");
            return null;
        }
        
        return walletStorage[WALLET_STORAGE_KEY].hasOwnProperty(accountNumber.trim());
    }

    static _getWalletData() {
        return getLocalStorage(WALLET_STORAGE_KEY);
    }

    static createWallet(bankAccount, pin, initialAmount) {
        const wallet = new Wallet(bankAccount);
        wallet.pin = pin;
        wallet._walletAmount = initialAmount;
        wallet.linkedAccountNumber = bankAccount.accountNumber
        wallet.save()
        return wallet
    }


}



// test functions

function createBankAccountTest(sortCode = "400214", accountNo = "01413217", accountHolderName = "Alice Smith") {
    console.log("\n🚀 Starting test: Create Bank Account.");
    console.log("-----------------------------------------------------");

    console.log(`⏳ Creating a new bank account for ${accountHolderName}...`);

    // Attempting to create a bank account
    let bankAccount;
    try {
        bankAccount = BankAccount.createBankAccount(sortCode, accountNo);
    } catch (error) {
        console.log(`❌ Test failed - Error creating bank account: ${error.message}`);
        return;
    }

    // Adding funds to the bank account
    bankAccount.balance = 4000;

    console.log(`⏳ Attempting to save the bank account and credit it with £${bankAccount.balance}...`);
    const isBankAccountSaved = bankAccount.save();

    if (isBankAccountSaved) {
        console.log("✅ Bank account successfully saved.");
        console.log(`✅ Bank account credited with £${bankAccount.balance}`);
    } else {
        console.log("❌ Test failed - Failed to save the bank account.");
    }

    console.log("✅ Test completed.\n");
    console.log("-----------------------------------------------------");

    return bankAccount;
}



function transferBetweenCardsTest(sourceCard, targetCard, amountToTransfer = 100) {
    console.log("\n🚀 Starting test: Transfer Between Cards.");
    console.log("-----------------------------------------------------");

    const SOURCE_CARD_BALANCE = sourceCard.balance;
    const TARGET_CARD_BALANCE = targetCard.balance;

    console.log(`💳 Source Card: ${sourceCard.cardHolderName} - Balance: £${SOURCE_CARD_BALANCE}`);
    console.log(`💳 Target Card: ${targetCard.cardHolderName} - Balance: £${TARGET_CARD_BALANCE}`);
    console.log(`⏳ Attempting to transfer £${amountToTransfer} from ${sourceCard.cardHolderName} to ${targetCard.cardHolderName}...`);

    try {
        const transferResult = bankAccount.transferFundsBetweenCards(sourceCard, targetCard, amountToTransfer);

        if (transferResult) {
            console.log(`✅ Transfer successful. £${amountToTransfer} transferred to ${targetCard.cardHolderName}.`);
        } else {
            console.log(`❌ Transfer failed. Could not transfer £${amountToTransfer} to ${targetCard.cardHolderName}.`);
        }
    } catch (error) {
        console.log(`❌ Test failed due to error: ${error.message}`);
        return;
    }

    console.log("✅ Refreshing balances after transfer...");
    sourceCard.refreshBalance();
    targetCard.refreshBalance();

    console.log(`✅ ${sourceCard.cardHolderName}'s Card - New Balance: £${sourceCard.balance} (Old: £${SOURCE_CARD_BALANCE})`);
    console.log(`✅ ${targetCard.cardHolderName}'s Card - New Balance: £${targetCard.balance} (Old: £${TARGET_CARD_BALANCE})`);
    console.log("✅ Test completed.\n");
    console.log("-----------------------------------------------------");
}



function createAndSaveCardTest(cardHolder, cardNumber, expMonth, expYear, initialBalance) {
    console.log("\n🚀 Starting test: Creating and Saving a Card.");
    console.log("-----------------------------------------------------");

    console.log(`⏳ Creating a new card for ${cardHolder} with card number: ${cardNumber}...`);

    const card = Card.createCard(cardHolder, cardNumber, expMonth, expYear);
    card.balance = initialBalance;

    const isCardSaved = card.save();

    if (isCardSaved) {
        console.log(`✅ Card for ${cardHolder} successfully saved.`);
        console.log(`💳 Card Details - Card Holder: ${cardHolder}, Card Number: ${cardNumber}, Expiry Date: ${expMonth}/${expYear}, Initial Balance: £${card.balance}`);
    } else {
        console.log(`❌ Failed to save ${cardHolder}'s card.`);
    }

    if (card.balance > 0) {
        console.log(`✅ ${cardHolder}'s card credited with £${card.balance}.`);
    } else {
        console.log(`❌ Failed to credit ${cardHolder}'s card.`);
    }

    console.log("✅ Test completed.\n");
    return card;
}



function transferToBankAccountTest(bankAccount, card, amountToTransfer) {
    console.log("\n🚀 Starting test: Transferring funds from card to bank account.");
    console.log("--------------------------------------------------------------");

    const oldAccountBalance = bankAccount.balance;
    console.log(`🏦 Bank Account: ${getCombinedCode(bankAccount.sortCode, bankAccount.accountNumber)} - Balance: £${oldAccountBalance}`);
    console.log(`💳 Card Holder: ${card.cardHolderName} - Card Balance: £${card.balance}`);
    console.log(`💸 Attempting to transfer £${amountToTransfer} to the bank account...\n`);

    try {
        const isTransferSuccessful = bankAccount.transferToAccount(card, amountToTransfer);

        if (isTransferSuccessful) {
            console.log(`✅ Test Passed - Transfer was successful transfered from ${card.cardHolderName}'s to the  the given bank account with acount ${getCombinedCode(bankAccount.sortCode, bankAccount.accountNumber)} .`);
            console.log(`✅ The new account balance is now £${bankAccount.balance} after transfer.`)
        } else {
            console.log("❌ Test Failed - Transfer should not be possible due to insufficient funds.");
        }

    } catch (error) {
        console.log(`✅ Test Passed - Transfer failed as expected: ${error.message}`);
    }

    console.log(`💳 ${card.cardHolderName}'s New Card Balance: £${card.balance}`);
    console.log("✅ Test completed.\n");
}



function createWalletTest(bankAccount, pin, fundsToAdd = 1000) {
    console.log("\n🚀 Starting test: Creating a new wallet and adding funds.");
    console.log("----------------------------------------------------");

    console.log(`💳 Bank Account Holder: ${bankAccount.accountHolder}`);
    console.log(`🏦 Bank Account Number: ${bankAccount.accountNumber}`);
    console.log(`🔐 Using PIN: ${pin}`);

    console.log("\n⏳ Attempting to create a new wallet...");
    const wallet = Wallet.createWallet(bankAccount, pin, 1000);

    if (wallet) {

        console.log(`✅ Wallet successfully created with a balance of.`);
    } else {
        console.log("❌ Wallet creation failed.");
        return null;
    }

    console.log(`\n💸 Adding £${fundsToAdd} to the wallet...`);
    wallet.addFundToWallet(fundsToAdd);

    if (wallet.walletAmount === fundsToAdd) {
        console.log(`✅ Funds successfully added to the wallet. Current balance: £${wallet.walletAmount}`);
    } else {
        console.log(`❌ Failed to add funds to the wallet. Expected balance: £${fundsToAdd}, but got £${wallet.walletAmount}`);
    }

    console.log("✅ Test completed.\n");
    return wallet;
}



function addCardToWalletTest(card, wallet, expectedCardInWallet = 0) {

    const MAXIMUM_CARDS_ALLOWED = 3;
    console.log("\n🚀 Starting test: Adding a card to the wallet.");
    console.log("----------------------------------------------------");
    console.log(`💳 Card Holder: ${card.cardHolderName}`);
    console.log(`🔢 Card Number: ${card.cardNumber}`);
    console.log(`✅ Initial number of cards in wallet: ${wallet.numOfCardsInWallet}`);

    console.log("⏳ Attempting to add the card to the wallet...");

    try {
        wallet.addCardToWallet(card.cardNumber);
        console.log("✅ Card successfully added to the wallet.");
    } catch (error) {
        console.log(`✅ Test Passed: Wallet can only hold ${MAXIMUM_CARDS_ALLOWED} cards at a time. Error thrown: ${error.message}`);
        return;
    }

    // Verify the number of cards in the wallet after addition
    if (wallet.numOfCardsInWallet > MAXIMUM_CARDS_ALLOWED) {
        console.log(`❌ Test Failed: Wallet exceeded the maximum allowed cards of ${MAXIMUM_CARDS_ALLOWED}.`);
        console.log("❌ Error should have been thrown, but this line was reached unexpectedly.");
        return;
    }

    // Check if the actual number of cards matches the expected number
    const isTestPassed = wallet.numOfCardsInWallet === expectedCardInWallet;
    const emojiToUse = isTestPassed ? `✅` : `❌`;

    console.log(`${emojiToUse} ${isTestPassed ? "Test Passed" : "Test Failed"}: Card count in wallet is ${wallet.numOfCardsInWallet}, expected ${expectedCardInWallet}.`);

    if (isTestPassed) {
        console.log(`✅ Test successfully verified: Wallet contains the correct number of cards.`);
    } else {
        console.log(`❌ Test verification failed: Wallet contains ${wallet.numOfCardsInWallet} cards, but expected ${expectedCardInWallet}.`);
    }

    console.log("✅ Test completed.\n");
}


function testDuplicateCardWalletEntryTest(card, wallet) {
    console.log("🚀 Starting test: Preventing duplicate card entry in the wallet.");
    console.log("----------------------------------------------------");

    console.log(`💳 Card Holder: ${card.cardHolderName}`);
    console.log(`🔢 Card Number: ${card.cardNumber}`);
    console.log(`📝 Current Number of Cards in Wallet: ${wallet.numOfCardsInWallet}`);
    console.log("⏳ Attempting to add the same card to the wallet again. This operation should fail.\n");


    try {
        wallet.addCardToWallet(card.cardNumber);
        console.log(`❌ Test Failed: The duplicate card was added successfully. Number of cards in wallet: ${wallet.numOfCardsInWallet}\n`);
    } catch (error) {
        console.log(`✅ Test Passed: Error thrown as expected - ${error.message}\n`);
    }

    console.log("✅ Test completed.\n");

}

function isCardInWalletTest(card, wallet) {

    console.log("🚀 Starting test: Checking if a card is present in the wallet.");
    console.log("----------------------------------------------------");


    console.log("✅ Display card and wallet information");
    console.log(`💳 Card Holder: ${card.cardHolderName}`);
    console.log(`🔍 Checking if the card (Number: ${card.cardNumber}) is present in the wallet...\n`);


    const isCardPresent = wallet.isCardInWallet(card.cardNumber);

    if (isCardPresent) {
        console.log(`✅ Test Successful: The card belonging to ${card.cardHolderName} is present in the wallet.\n`);
    } else {
        console.log(`❌ Test Failed: The card belonging to ${card.cardHolderName} is NOT found in the wallet.\n`);
    }

    console.log("✅ Test completed.\n");


}

function addFundsToCardInWalletTest(card, wallet, amountToAdd) {

    console.log("🚀 Starting test: Adding funds to a card within the wallet.");
    console.log("----------------------------------------------------");

    console.log("✅ Retrieve the card from the wallet and display its current balance before funds are added")
    const cardInWallet = wallet.getByCardNumber(card.cardNumber);
    console.log(`💳 Card Holder: ${cardInWallet.cardHolderName}`);
    console.log(`💰 Current Balance: £${cardInWallet.balance}`);
    console.log(`💵 Amount to Add: £${amountToAdd}`);
    console.log("🔄 Attempting to add funds...");

    const updatedWalletCard = wallet.addFundsToCard(card.cardNumber, amountToAdd);
    const expectedBalance = cardInWallet.balance + amountToAdd;

    if (updatedWalletCard.balance === expectedBalance) {
        console.log(`✅ Test Successful: Funds added successfully.`);
        console.log(`📌 New Balance: £${updatedWalletCard.balance} (Previous: £${cardInWallet.balance})\n`);
    } else {
        console.log(`❌ Test Failed: The funds were not added correctly.`);
        console.log(`📌 Expected Balance: £${expectedBalance}, but got £${updatedWalletCard.balance}\n`);
    }

    console.log("✅ Test completed.\n");
}

function checkIfCardIsUpdatedInWalletTest(card1, card2, wallet) {

    console.log("🚀 Starting test: Checking if card balances are updated in the wallet after a transfer.");
    console.log("----------------------------------------------------");

    console.log("✅ Retrieve cards from the wallet and display their balances before transfer")
    const walletCard1 = wallet.getByCardNumber(card1.cardNumber);
    const walletCard2 = wallet.getByCardNumber(card2.cardNumber);

    const [initialBalanceCard1, initialBalanceCard2] = [walletCard1.balance, walletCard2.balance];
    console.log(`💳 Initial Balances:`);
    console.log(`📌 ${walletCard1.cardHolderName}'s card: £${initialBalanceCard1}`);
    console.log(`📌 ${walletCard2.cardHolderName}'s card: £${initialBalanceCard2}`);


    console.log("🔄 Attempting to transfer £400 from the first card to the second card...");
    const isTransferSuccessful = wallet.transferFundsFromCardToCard(walletCard1.cardNumber, walletCard2.cardNumber, 400);

    if (isTransferSuccessful) {

        Wallet.refreshCardFromWallet(walletCard1, wallet);
        Wallet.refreshCardFromWallet(walletCard2, wallet);

        console.log("✅ Transfer successful! Checking updated balances...");

        console.log(`📌 ${walletCard1.cardHolderName}'s card: New Balance = £${walletCard1.balance} (Previous: £${initialBalanceCard1})`);
        console.log(`📌 ${walletCard2.cardHolderName}'s card: New Balance = £${walletCard2.balance} (Previous: £${initialBalanceCard2})`);
    } else {
        console.log(`❌ Transfer failed! Balances remain unchanged.`);
        console.log(`📌 ${walletCard1.cardHolderName}'s card: £${walletCard1.balance}`);
        console.log(`📌 ${walletCard2.cardHolderName}'s card: £${walletCard2.balance}`);
    }

    console.log("✅ Test completed.");


}

function getAllCardsTest() {

    console.log("🚀 Starting test: Retrieving all cards from the wallet.");
    console.log("----------------------------------------------------");


    const EXPECTED_NUM_OF_CARDS = 3;
    console.log(`📌 Expecting to retrieve a total of ${EXPECTED_NUM_OF_CARDS} cards.`);

    console.log("🔄 Attempting to retrieve all cards...");
    const cards = wallet.getAllCards();

    if (cards.length !== EXPECTED_NUM_OF_CARDS) {
        console.log(`❌ Test Failed: Expected ${EXPECTED_NUM_OF_CARDS} cards, but retrieved ${cards.length} cards.`);
        return;
    }
    console.log(`✅ Test Successful: Retrieved all expected cards (${cards.length}).`);

    const cardHolderNames = cards.map(card => card.cardHolderName).join(", ");
    console.log(`📋 Names of cards retrieved: ${cardHolderNames}`);

    console.log("✅ Test completed.");

}

function removeSingleCardFromWalletTest(card, wallet) {

    console.log("🚀 Starting test: Removing a single card from the wallet.");
    console.log("----------------------------------------------------");

    const initialNumOfCards = wallet.numOfCardsInWallet;
    console.log(`📊 Initial number of cards in wallet: ${initialNumOfCards}`);
    console.log(`💳 Attempting to remove card belonging to: ${card.cardHolderName} (Card Number: ${card.cardNumber})`);

    console.log("🔄 Removing card from the wallet...");
    wallet.removeCard(card.cardNumber);

    if (wallet.numOfCardsInWallet < initialNumOfCards) {
        console.log(`✅ Test Successful: Card removed successfully. Total cards remaining: ${wallet.numOfCardsInWallet}`);
    } else {
        console.log(`❌ Test Failed: Card was not removed. Total cards remaining: ${wallet.numOfCardsInWallet}`);
    }

    console.log("✅ Test completed.");
}



function removeAllCardsFromWalletTest(wallet) {

    console.log("🚀 Starting test: Removing all cards from the wallet.");


    console.log(`📊 Initial number of cards in wallet: ${wallet.numOfCardsInWallet}`);

    console.log("🔄 Attempting to remove all cards from the wallet...");
    wallet.removeAllCards();

    console.log(`📊 Number of cards after removal attempt: ${wallet.numOfCardsInWallet}`);

    if (wallet.numOfCardsInWallet === 0) {
        console.log(`✅ Test Successful: All cards were successfully removed. Total cards remaining: ${wallet.numOfCardsInWallet}`);
    } else {
        console.log(`❌ Test Failed: Not all cards were removed. ${wallet.numOfCardsInWallet} cards remain in the wallet.`);
    }

    console.log("✅ Test completed.");
}


function addSingleCardToWalletAndAttemptTransferTest(bankAccount, pin) {

    console.log("🚀 Starting test: Adding a single card to the wallet and attempting a transfer.");


    const wallet = Wallet.createWallet(bankAccount, pin);
    console.log("✅ Wallet successfully created.");

    const newCard = createAndSaveCardTest("BA", "1234-5478-1010-2011", 12, 2025, 400);
    console.log(`✅ Card successfully created with card number: ${newCard.cardNumber}.`);


    const isCardAdded = wallet.addCardToWallet(newCard.cardNumber);
    if (!isCardAdded) {
        console.log("❌ Test Failed: The card was not added to the wallet. There should be at least one card.");
        return;
    }
    console.log(`✅ Card successfully added to wallet. Total cards in wallet: ${wallet.numOfCardsInWallet}.`);

    if (wallet.numOfCardsInWallet === 1) {
        console.log("🔄 Attempting transfer with only one card in the wallet...");
        try {
            wallet.transferFundsFromCardToCard(newCard, null); // Null to simulate no other card present
            console.log("❌ Test Failed: Transfer shouldn't be possible since there is only one card in the wallet.");
        } catch (error) {
            console.log(`✅ Test Successful: Transfer attempt failed as expected. Error: ${error.message}`);
        }
    } else {
        console.log("❌ Test Failed: Unexpected number of cards in the wallet.");
    }

    console.log("✅ Test completed.");
}


function getValidWalletTest(bankAccount) {

    console.log("🚀 Starting test: Checking if a wallet can be successfully loaded for the provided bank account.");

    const wallet = Wallet.loadWallet(bankAccount.accountNumber);

    if (!wallet) {
        console.error("❌ Test Failed: No wallet found. The wallet could not be retrieved from storage.");
        return;
    }

    if (!(wallet instanceof Wallet)) {
        console.error(`❌ Test Failed: Retrieved object is not an instance of Wallet. Instead, got type: ${typeof wallet}.`);
        return;
    }

    console.log("✅ Test Passed: The wallet was successfully retrieved and is a valid Wallet instance.");
}



console.log("==========================================");
console.log("       Test: Create and Fund Bank Account ");
console.log("==========================================\n");

// Define account details
const bankAccount = createBankAccountTest();
const ACCOUNT_NUMBER = bankAccount.linkedAccountNumber;



console.log("\n\n\n==========================================");
console.log("           Test: Create Cards             ");
console.log("===============================================\n");

// Creating cards for Egbie and Mary Jane
const egbieCard = createAndSaveCardTest("Egbie", "1234-5678-9876-5432", 12, 2028, 500);
const maryJaneCard = createAndSaveCardTest("Mary Jane", "1234-5678-9876-5412", 12, 2028, 200);
const thirdCard = createAndSaveCardTest("TC", "1478-9999-1111-1111", 12, 2029, 500)


console.log("\n\n=========================================================");
console.log("       Test: Funds Transfer to Bank account ");
console.log("=============================================================\n");


// Testing a transfer to the bank account
console.log("\nTesting insufficient funds for transfer...");
console.log("-----------------------------------------------\n");

const oldAccountBalance = bankAccount.balance;
const AMOUNT_TO_MOVE = 600;
transferToBankAccountTest(bankAccount, maryJaneCard, AMOUNT_TO_MOVE)


// Testing sufficient funds for transfer
console.log("\n⏳ Testing sufficient funds for transfer...");
console.log("-----------------------------------------------\n");
console.log(`💳 Mary Jane balance before top up £${maryJaneCard.balance}`);
console.log("✅ Topping up Mary Jane's balance...");
maryJaneCard.addAmount(1000);
console.log(`✅ Mary Jane balance after top up £${maryJaneCard.balance}`);
transferToBankAccountTest(bankAccount, maryJaneCard, AMOUNT_TO_MOVE);


console.log("-----------------------------------------------------");

// --------------------------------------------------------------
// Test: Retrieve Bank Account
// --------------------------------------------------------------
console.log("\n\n==========================================");
console.log("       Test: Retrieve Bank Account ");
console.log("==============================================\n");


console.log("✅ Test: Retrieve Bank Account");
const myAccount = BankAccount.getByAccount(bankAccount.sortCode, bankAccount.accountNumber);
console.log(myAccount ? "✅ Successfully retrieved account" : "❌ Failed to retrieve account");



// --------------------------------------------------------------
// Test: Create Wallet
// --------------------------------------------------------------
console.log("\n==========================================");
console.log("       Test: Create Wallet ");
console.log("==========================================\n");

const wallet = createWalletTest(bankAccount, 1025, 1000);
console.log("-----------------------------------------------");


console.log("\n==========================================");
console.log("        Test: Add Credit Card to Wallet    ");
console.log("==========================================\n");

addCardToWalletTest(egbieCard, wallet, 1);
addCardToWalletTest(maryJaneCard, wallet, 2)
addCardToWalletTest(thirdCard, wallet, 3)


console.log("\n==========================================");
console.log("         Test: Add Duplicate Card         ");
console.log("==========================================\n");
testDuplicateCardWalletEntryTest(egbieCard, wallet);


console.log("\n==========================================");
console.log("         Test: Are cards inside wallet        ");
console.log("==========================================\n");

isCardInWalletTest(egbieCard, wallet);
isCardInWalletTest(maryJaneCard, wallet);
isCardInWalletTest(thirdCard, wallet);

const cardNotInWallet = createAndSaveCardTest("fakeCard", "1478-1478-1788-1010", 12, 2025, 1000);
if (!wallet.isCardInWallet(cardNotInWallet.cardNumber)) {
    console.log("✅ Test Passed. Expected fakeCard not to be in wallet and fake card is not in the wallet.");
} else {
    console.log("❌ Test Failed. FakeCard should not to be in wallet.");
}


console.log("\n===============================================================================");
console.log("          Test: Exceed maximum wallet capacity by adding a fourth Card          ");
console.log("=============================================================================\n");

console.log("Attempting to add a fourth card to the wallet - this should fail as the wallet allows only three cards.\n");
const fourthCard = createAndSaveCardTest("FC", "1394-5678-9876-5432", 12, 2028, 1000);
addCardToWalletTest(fourthCard, wallet, 4)


console.log("\n==========================================");
console.log("     Test Transfer Funds Between Cards       ");
console.log("==========================================\n");
transferBetweenCardsTest(maryJaneCard, egbieCard, 600);


console.log("\n==============================================================================");
console.log("      Test if card in wallet can be updated with Funds ");
console.log("=============================================================================\n");
addFundsToCardInWalletTest(maryJaneCard, wallet, 10000);

console.log("\n==============================================================================");
console.log("      Test if card in wallet is updated after Transfer Funds Between Cards ");
console.log("=============================================================================\n");
checkIfCardIsUpdatedInWalletTest(maryJaneCard, egbieCard, wallet);


console.log("\n==============================================================================");
console.log("      Test if transfer the virtual cards are in sync with the wallet ");
console.log("=============================================================================\n");
checkIfCardIsUpdatedInWalletTest(maryJaneCard, egbieCard, wallet);


console.log("\n==============================================================================");
console.log("      Test if all the cards in wallet can be retrieved ");
console.log("=============================================================================\n");
getAllCardsTest();

console.log("\n==============================================================================");
console.log("      Test if a single card in the  wallet can be removed");
console.log("=============================================================================\n");
removeSingleCardFromWalletTest(maryJaneCard, wallet);


console.log("\n==============================================================================");
console.log("      Test if all the cards in wallet can be removed");
console.log("=============================================================================\n");
removeAllCardsFromWalletTest(wallet);


console.log("\n==============================================================================");
console.log("      Test when a single transfer is made to a card");
console.log("=============================================================================\n");
const pin = 1234;
addSingleCardToWalletAndAttemptTransferTest(bankAccount, pin);

console.log("\n==============================================================================");
console.log("      Test that a valid wallet can be retrieved");
console.log("=============================================================================\n");


getValidWalletTest(bankAccount)

// uncomment to look inside localStorage memory db
// console.log(localStorage._IN_MEMORY_DB)

// uncomment to look see the bank account storage details
// console.log(getLocalStorage(BANK_ACCOUNT_STORAGE_KEY))

// uncooment to look inside the card storage details
// console.log(getLocalStorage(CARD_STORAGE_KEY))

// uncomment to look inside the wallet card storage
// console.log(getLocalStorage(WALLET_STORAGE_KEY))