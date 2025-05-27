import { Card } from "./card.js";
import { BankAccount } from "./bankAccount.js";
import { DataStorage } from "./baseDataStorage.js";
import { AmountManager } from "./baseAmountManager.js";
import { checkNumber, generateRandomID, excludeKey, formatCurrency } from "./utils.js";
import { logError, warnError } from "./logger.js";
import { getLocalStorage } from "./db.js";
import { config } from "./config.js";


const WALLET_STORAGE_KEY = config.WALLET_STORAGE_KEY;


export class Wallet extends DataStorage {


    /**
   * Constructs a new Wallet instance.
   * @param {object | BankAccount}  - An instance of the BankAccount class.
   * @param {number|null} lastTransfer - The last transfer amount made by the wallet (default: null).
   * @param {number|null} lastAmountReceived - The last amount received by the wallet (default: null).
   * @param {string|null} pin - The PIN associated with the wallet (default: null).
   */
    constructor(bankAccount = null, lastTransfer = null, lastAmountReceived = null, pin = null) {
        super();
        this._id                    = null;
        this._lastTransfer          = lastTransfer;
        this._lastAmountReceived    = lastAmountReceived;
        this._totalCards            = 0;
        this._MAXIMUM_CARDS_ALLOWED = 3;
        this._cards                 = {}; // For cache
        this._pin                   = pin
        this._walletAmount          = 0;
        this._amountManager         = new AmountManager(this._walletAmount);
        this._bankAccount           = bankAccount;
        this._cardNumbers           = {};
        this.deductFundsFromWallet  = this.deductFundsFromWallet.bind(this);
        this._manageFundsToWallet   = this._manageFundsToWallet.bind(this);

        this._validateBankAccountLinkage();
    }

    static loadWallet(sortCode, accountNumber) {

        if (!accountNumber || typeof accountNumber != "string" || accountNumber.trim() == "") {
            logError("Wallet.loadWallet", `Got an invalid accountNumber. Expected a string but got ${typeof accountNumber}`);
            throw new Error("Invalid account string provided");
        }

        const walletDataStorage = Wallet._getDataFromLocalStorage();

        if (!walletDataStorage) {
            warnError("Wallet.loadWallet", "The wallet data was not found");
            console.info("not found")
            return false;
        }

        let userWalletData;

        try {
            userWalletData = walletDataStorage[accountNumber];
        } catch (error) {
            warnError("Wallet.loadWallet", error.message)
            return null;
        }

        if (!userWalletData || userWalletData === undefined) {
            warnError("Wallet.loadWallet", `Failed to load wallet because your account information couldn't be found ${userWalletData}`);
            return null;
        }

        const requiredKeys = [
            'lastTransfer',
            'lastAmountReceived',
            'totalCards',
            'bankAccount',
            'id',
            'pin',
            'walletAmount',
            'cardNumbers',
        ];

        const walletJson    = super.fromStorage(userWalletData, requiredKeys);
        const wallet        = Object.assign(new Wallet, walletJson);
        wallet._cardNumbers = walletJson.cardNumbers;
        wallet.bankAccount  = BankAccount.getByAccount(sortCode, accountNumber);
        wallet._totalCards  = walletJson.totalCards;
        wallet.walletAmount = parseFloat(walletJson.walletAmount).toFixed(2) || 0;

        wallet._populateCardsIntoWallet();

        if (!wallet._bankAccount) {
            warnError("Wallet.loadWallet", "The bank account wasn't loaded into the wallet.")
        }
        return wallet;
    }

    /**
     * Takes a bank account instance, a pin and initial amount and creates a 
     * new wallet for the user.
     * 
     * @param {*} bankAccount : The bank account to link to the wallet
     * @param {*} pin : The pin that will be used to verify any given transaction
     * @param {*} initialAmount - The initial amount to add to wallet
     * @returns {Wallet} returns a wallet instance
    */
    static createWallet(bankAccount, pin, initialAmount) {

        if (!(bankAccount instanceof BankAccount)) {
            throw new Error("The bank account is not an instance of the BankAccount class.")
        }

        const wallet         = new Wallet(bankAccount);
        wallet.pin           = pin;
        wallet._walletAmount = initialAmount
        wallet.save();
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
        const walletStorage = Wallet._getDataFromLocalStorage();

        if (!walletStorage) {
            warnError("Wallet.hasUserWallet", "The wallet storage in the local storage wasn't found");
            return null;
        }

        return walletStorage.hasOwnProperty(accountNumber.trim());
    }

    /**
     * Retrieves the entire data belong to the wallet.
     * 
     * @returns {object} - Returns the entire data belong to the wallet
    */
    static _getDataFromLocalStorage() {
        const walletData = getLocalStorage(WALLET_STORAGE_KEY)
        if (walletData) {
            return walletData[WALLET_STORAGE_KEY]
        }
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

        const cardFromStorage       = wallet.getByCardNumber(card.cardNumber);
        card.id                     = cardFromStorage.id;
        card.cardHolderName         = cardFromStorage.cardHolderName;
        card.cardNumber             = cardFromStorage.cardNumber;
        card.expiryMonth            = cardFromStorage.expiryMonth;
        card.expiryYear             = cardFromStorage.expiryYear;
        card.cvc                    = cardFromStorage.cvc;
        card.cardType               = cardFromStorage.cardType;
        card.cardOption             = cardFromStorage.cardOption;
        card._amountManager.balance = cardFromStorage._balance;
        card._isCardBlocked         = cardFromStorage.isCardBlocked;
        card._balance               = cardFromStorage._balance

    }

    /**
     * Returns the total card amount for all the cards contained
     * in the wallet. For example if there are three cards
     *   - card 1: 100
     *   - card 2: 150
     *   - card 3: 50
     * 
     * Then total return will be 300
     */
    getCardsTotal() {
        return parseFloat(
            Object.values(this.getAllCards())
                  .reduce((sum, card) => sum + parseFloat(card.balance), 0)
                  .toFixed(2)
          );
          
    }


    /**
     * Returns an array containing all the card objects found in the wallet.
     * If no cards are found, an empty array is returned.
     *
     * @returns {Card[]} An array of Card objects in the wallet, or an empty array if no cards are found.
     */
    getAllCards() {
        return this._cards;
    }

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

        return this._cards[cardNumber];
    }

    getBalanceFromAccountType(accountType) {
        this._validateAccountType("wallet.getBalanceFromAccountType", accountType);
        return accountType === "bank" ? this.bankAmountBalance : this.walletAmount;
    }

    /**
     * Retrieves the wallet amount.
     * @returns {number} The current wallet amount.
    */
    get walletAmount() {
        return this._walletAmount;
    }

    /**
     * Returns the bank balance amount
     */
    get bankAmountBalance() {
        return parseFloat(this.bankAccount.balance).toFixed(2);
    }

    /**
     * Retrieves the number of virtual cards attached to the wallet.
     * @returns {number} The number of cards in the wallet
    */
    get numOfCardsInWallet() {
        return this._totalCards;
    }

    /**
     * Returns the bank account attached to the wallet.
     */
    get bankAccount() {
        // ensure that the latest bank details is returned e.g balance.
        return BankAccount.getByAccount(this._bankAccount.sortCode,
            this._bankAccount.accountNumber,
            this._bankAccount.balance);

    }

    get pin() {
        return this._pin
    }

    /**
     * Return the maximum amount of cards allowed in the wallet.
     */
    get maximumCardsAllow() {
        return this._MAXIMUM_CARDS_ALLOWED;
    }

    /**
     * Set the bank account to wallet
     */
    set bankAccount(bankAccount) {
        this._bankAccount = bankAccount;
    }

    set pin(pin) {
        if (!checkNumber(pin).isNumber) {
            logError("Wallet.SetPin", `The pin must be an integer. Expected a number but got type ${typeof pin}`);
            throw new Error("The pin is not an intege")
        }
        this._pin = pin;
    }

    /**
     * Sets a wallet amount to the wallet
    */
    set walletAmount(walletAmount) {

        if (walletAmount != 0) {
            this._amountManager.validateAmount(walletAmount)
        }

        this._walletAmount = walletAmount
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

        const saveAs = this._bankAccount.accountNumber;

        return this.constructor.saveData(WALLET_STORAGE_KEY, saveAs, this.toJson())
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
            totalCards: this._totalCards,
            MAXIMUM_CARDS_ALLOWED: this._MAXIMUM_CARDS_ALLOWED,
            cards: this._cards,
            id: this._id,
            pin: this.pin,
            walletAmount: this.walletAmount,
            cardNumbers: this._cardNumbers,
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

        wallet.bankAccount = this._bankAccount;
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
        return pin === this._pin.toString().trim();
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

        this._updateCardInWallet(cardInWallet);
        this.save();
        return cardInWallet; // returned the funded card

    }

    /**
      * Checks if a transfer is possible based on the account type and the amount.
      * The function ensures that the account type is valid (either "bank" or "wallet") and 
      * verifies if the transfer amount is available in the selected account.
      * 
      * @param {string} accountType The type of account ("bank" or "wallet") to transfer from.
      * @param {number} amount The amount to transfer.
      * 
      * @returns {boolean} Returns `true` if the transfer is possible (balance is sufficient), otherwise `false`.
      *                    if an error is thrown returns null
      * 
      * @throws {Error} Throws an error if the `accountType` is invalid or the balance is insufficient.
     */
    canTransfer(accountType, amount) {

        this._validateAmountType("wallet.canTransfer", amount)

        try {
            this._validateAccountType("wallet.canTransfer", accountType);
        } catch (error) {
            warnError("wallet.canTransfer", error.message);
            return false
        }

        amount = parseFloat(amount).toFixed(2);
        const balance = this.getBalanceFromAccountType(accountType);

        if (!balance) {
            logError("wallet.canTransfer", `The balance did not yield an expected result. Got ${balance} with type ${typeof balance}`);
            throw new Error(`The balance did not return a correct balance. Expected a balance but got ${balance} with type ${typeof balance}`);
        }
        return parseFloat(balance - amount).toFixed(2) >= 0;
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
            const error = `Transfer Unavailable: To transfer funds between cards, you must have at least ${MAXIMUM_CARDS_FOR_TRANSFER} cards in your wallet.`;
            logError("Wallet.transferFundsFromCardToCard", error);
            throw new Error(error);
          
          
        }

        const transferringCard = this.getByCardNumber(sourceCardNumber);
        const receivingCard    = this.getByCardNumber(targetCardNumber);

        if (!transferringCard || !receivingCard) {
            const error = `Invalid card(s) provided: Source (${sourceCardNumber}), Target (${targetCardNumber}).`;
            logError("Wallet.transferFundsFromCardToCard", error);
            throw new Error(error);
        }

        const isTransferSuccess = this._bankAccount.transferFundsBetweenCards(transferringCard, receivingCard, amount);

        if (isTransferSuccess) {
            [transferringCard, receivingCard].forEach(card => this._updateCardInWallet(card));
            return this.save();
        }

        return false;
    }

    /**
     * Transfers a specified amount from the user's wallet to their linked bank account.
     *
     * This function:
     * - Validates the type of the provided amount.
     * - Adds the amount to the user's linked bank account.
     * - Deducts the same amount from the wallet balance.
     * - Returns `true` if the operation is successful, otherwise logs the error and returns `false`.
     *
     * @param {*} amount - The amount to transfer. Expected to be a valid number.
     * @returns {boolean} Returns `true` if the transfer is successful, otherwise `false`.
     *
     * @example
     * wallet.transferFromWalletToBank(100);
     * // → true if successful
     */
    transferFromWalletToBank(amount) {
       
        this._validateAmountType("transferFromWalletToBank", amount);
        return this._bankAccount.transferFromWalletToBank(amount, this);
       
    }

    /**
     * Transfers a specified amount from the user's bank to their linked wallet.
     *
     * This function:
     * - Validates the type of the provided amount.
     * - Adds the amount to the user's linked wallet.
     * - Deducts the same amount from the bank balance.
     * - Returns `true` if the operation is successful, otherwise logs the error and returns `false`.
     *
     * @param {*} amount - The amount to transfer. Expected to be a valid number.
     * @returns {boolean} Returns `true` if the transfer is successful, otherwise `false`.
     *
     * @example
     * wallet.transferFromBankToWallet(100);
     * // → true if successful
     */
    transferFromBankToWallet(amount) {
        this._validateAmountType("transferFromWalletToBank", amount);
        return this._bankAccount.transferFromBankToWallet(amount, this);  // this = wallet instance
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

        const card         = this.getByCardNumber(cardNumber);
        const isTransfered = this._bankAccount.transferFromCardToWallet(card, amount, this);

        if (isTransfered) {
            this.lastTransfer = amount;
            return true;
        }
        return false;
    }


    /**
     * Transfers a specified amount of money to multiple allocated cards.
     * 
     * This method first verifies that the source account (e.g., wallet or bank)
     * has sufficient funds to cover the `totalAmount`. If funds are available,
     * the method proceeds with the transaction.
     * 
     * Here’s how it operates:
     * - Validates all inputs (card array, amounts, account type).
     * - Prepares and attempts to save card updates in bulk.
     * - If successful, deducts the appropriate amount from the source account.
     * - If not all cards are updated, only the amount corresponding to the successfully
     *   updated cards is deducted.
     * 
     * @param {*} cardNumberArray - An array containing the card numbers to update with the given amount.
     * @param {*} totalAmount - The total amount being transferred across all cards.
     * @param {*} amountPerCard - The individual amount each card should receive.
     * @param {*} sourceAccount - The source account (e.g., 'wallet' or 'bank') from which to deduct funds.
     * 
     * @throws {TypeError}
     *      - If `cardNumberArray` is not a valid array.
     *      - If `totalAmount` or `amountPerCard` are not valid numbers.
     * 
     * @returns {object} `object` Returns an object containing two flags
     *                      1. isSaved: A flag that determines if the cards saved
     *                      2. CardsSave: An array containing the cards saved. This can be used to updated the frontend.
    */
    transferAmountToMultipleCards(cardNumberArray, totalAmount, amountPerCard, sourceAccount) {

        if (!Array.isArray(cardNumberArray)) {
            logError("wallet.transferAmountToMultipleCards", `The cardNumber must be an array. Expected an array but got type ${typeof cardNumberArray}`);
            throw new TypeError(`Expected an array but got an object with type ${typeof cardNumberArray}`)
        }

        this._validateAmountType("wallet.transferAmountToMultipleCards", totalAmount);
        this._validateAmountType("wallet.transferAmountToMultipleCards", amountPerCard);
        this._validateAccountType("wallet.transferAmountToMultipleCards", sourceAccount);

        const cardsToSave = this._prepareCardsForBulkSave(cardNumberArray, amountPerCard);
        const [numOfCardsSaved, isSaved] = this._bulkSave(cardsToSave);

        if (!isSaved) {
            logError("transferAmountToMultipleCards", "Something went wrong, and the cards weren't saved");
            return false;
        }

        const resp = this._chooseAccountAndUpdateBalance(sourceAccount, numOfCardsSaved, cardsToSave.length, totalAmount, amountPerCard);

        return {
            isSaved: resp,
            cardsSaved: cardsToSave
        };

    }

    /**
     * Prepares card objects for bulk saving by applying the transfer amount to each.
     *
     * This method works in conjunction with `transferAmountToMultipleCards`. It loops through
     * the provided card numbers, retrieves each card, updates it with the transfer amount,
     * and returns an array of modified cards ready to be saved.
     *
     * @param {string[]} cardNumbers - An array of card numbers to be updated.
     * @param {number} transferAmount - The amount to apply to each card.
     * @returns {Card[]} An array of card instances with the updated amount applied.
     */
    _prepareCardsForBulkSave(cardNumbers, transferAmount) {
        const updatedCards = [];

        cardNumbers.forEach((cardNumber) => {
            const card = Card.getByCardNumber(cardNumber);

            if (card) {
                if (card.isBlocked) {
                    console.log(`No funds were added to the card with number #${card.cardNumber} because it was blocked`);
                    return;
                }
                card.addAmount(transferAmount);
                updatedCards.push(card);
                this._updateCardInWallet(card);
            } else {
                logError(
                    "_prepareCardsForBulkSave",
                    `Card with number #${cardNumber} not found. Skipping.`
                );
            }
        });

        return updatedCards;
    }

     /**
     * Saves a list of updated card objects to localStorage.
     *
     * Used alongside `transferAmountToMultipleCards`, this method attempts to persist each updated
     * card in the provided list. It tracks how many cards were successfully saved and returns both
     * the count and a success flag.
     *
     * @param {Card[]} cardsToSave - An array of updated Card instances to be saved.
     * @returns {[number, boolean]} A tuple containing the number of cards successfully saved and
     *                              a boolean indicating overall save success.
     */
    _bulkSave(cardsToSave) {
        let savedCount = 0;

        cardsToSave.forEach((card) => {
            const success = card.save();

            if (!success) {
                logError(
                    "wallet.transferAmountToMultipleCards",
                    `Card #${card.cardNumber} failed to save with amount ${formatCurrency(card.amount)}.`
                );
            } else {
                savedCount++;
            }
        });

        if (savedCount === 0) {
            warnError("wallet.transferAmountToMultipleCards", "No cards were successfully saved.");
            return [savedCount, false];
        }

        return [savedCount, true];
    }

    /**
     * Used in conjuction with `transferAmountToMultipleCards` and it 
     * updates the balance of the specified source account after a card funding operation.
     *
     * This method is called after cards are successfully updated and saved. It compares the
     * number of cards saved with the total intended and deducts the appropriate amount from
     * the source account (e.g., wallet or bank). This ensures that only the amount actually
     * funded to cards is removed from the user's account.
     *
     * @param {string} sourceAccount - The account type to deduct from (e.g., "wallet", "bank").
     * @param {number} numOfCardsSaved - The number of cards successfully updated and saved.
     * @param {number} totalCards - The total number of intended cards to update.
     * @param {number} totalAmount - The total amount initially intended to be transferred.
     * @param {number} amountPerCard - The individual amount intended for each card.
     * 
     * @returns {boolean} True if balance update was successful, false otherwise.
     */
    _chooseAccountAndUpdateBalance(account, numOfSaveCards, expectedNumOfCards, totalAmount, amountPerCard) {
        if (account === "wallet") {
            return this._handleWalletBalanceUpdate(numOfSaveCards, expectedNumOfCards, totalAmount, amountPerCard);
        }
        return this._handleBankBalanceUpdate(numOfSaveCards, expectedNumOfCards, totalAmount, amountPerCard);
    }

    /**
     * Handles the balance deduction from the wallet after a successful card funding operation.
     *
     * This method is invoked when a transfer is initiated from the wallet to multiple cards. It ensures
     * that the funds are correctly deducted from the wallet after updating the cards. The amount deducted
     * is based on the number of cards successfully updated and the intended transfer amount per card.
     *
     * @param {number} numOfSavedCards - The number of cards successfully updated and saved.
     * @param {number} expectedNumOfCards - The total number of intended cards to update.
     * @param {number} totalAmount - The total amount initially intended to be transferred.
     * @param {number} amountPerCard - The individual amount intended for each card.
     * 
     * @returns {boolean} True if balance update was successful, false otherwise.
     */
    _handleWalletBalanceUpdate(numOfSavedCards, expectedNumOfCards, totalAmount, amountPerCard) {
        return this._processBalanceDeduction(numOfSavedCards, expectedNumOfCards, totalAmount, amountPerCard, this.deductFundsFromWallet);
    }


     /**
     * Handles the balance deduction from the bank after a successful card funding operation.
     *
     * This method is invoked when a transfer is initiated from the bank to multiple cards. It ensures
     * that the funds are correctly deducted from the bank after updating the cards. The amount deducted
     * is based on the number of cards successfully updated and the intended transfer amount per card.
     *
     * @param {number} numOfSavedCards - The number of cards successfully updated and saved.
     * @param {number} expectedNumOfCards - The total number of intended cards to update.
     * @param {number} totalAmount - The total amount initially intended to be transferred.
     * @param {number} amountPerCard - The individual amount intended for each card.
     * 
     * @returns {boolean} True if balance update was successful, false otherwise.
     */
    _handleBankBalanceUpdate(numOfSavedCards, expectedNumOfCards, totalAmount, amountPerCard) {
        const deductFunc = this._bankAccount.deductAmount;
        this._processBalanceDeduction(numOfSavedCards, expectedNumOfCards, totalAmount, amountPerCard, deductFunc);
        return true;
    }

   /**
     * An abstract method responsible for processing the deduction of funds from a wallet or bank account.
     * This method determines the deduction based on the number of successfully saved cards and the intended
     * transfer amount per card.
     *
     * The function takes in the following parameters:
     * - `numOfSavedCards`: the number of cards successfully updated and saved.
     * - `expectedNumOfCards`: the total number of cards intended for update, regardless of whether they were saved.
     * - `totalAmount`: the total amount initially intended to be transferred.
     * - `amountPerCard`: the individual amount intended for each card.
     * - `deductFunc`: a function to handle the deduction, which belongs to either the wallet or bank account class.
     *
     * The deduction is based on the number of cards that were successfully updated, and if all cards are saved,
     * the full amount is deducted. If not all cards were saved, only the proportionate amount is deducted.
     *
     * @param {number} numOfSavedCards - The number of cards that were successfully updated and saved.
     * @param {number} expectedNumOfCards - The total number of cards intended for update.
     * @param {number} totalAmount - The total amount initially intended to be transferred.
     * @param {number} amountPerCard - The individual amount intended for each card.
     * @param {Function} deductFunc - The function responsible for deducting the funds from either wallet or bank account.
     * @returns {boolean} Returns `true` if the deduction was successful.
     * @throws {Error} Throws an error if the `deductFunc` is not a valid function.
     */
    _processBalanceDeduction(numOfSavedCards, expectedNumOfCards, totalAmount, amountPerCard, deductFunc) {

        if (typeof deductFunc !== "function") {
            throw new Error("Invalid deduction function provided.");
        }

        // If the number of saved cards matches the expected number, it means 
        // all cards were successfully saved and the total amount should be deducted.
        if (numOfSavedCards === expectedNumOfCards) {
            deductFunc(totalAmount);
            return true;
        }

        // If not all cards were saved, deduct only the amount that was transferred.
        const amountToSave = amountPerCard * numOfSavedCards;
        deductFunc(amountToSave);
        return true;

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
     * Updates the wallet by adding a given amount to the wallet providing the amount is valid.
     * 
     * @throws {Error} - Throws several errors:
     *                 - If the amount not a valid integer or float
     *                 - If the amount is less or equal to zero
     *            
     * @param {*} amount The funds to update the to the wallet.
     */
    addFundsToWallet(amount) {
        return this._manageFundsToWallet(amount);
    }

    /**
     * Updates the wallet by deducting a given amount from it providing the amount is valid.
     * 
     * @throws {Error} - Throws several errors:
     *                 - If the amount not a valid integer or float
     *                 - If the amount is less or equal to zero
     *            
     * @param {*} amount The funds to deduct from the wallet.
     */
    deductFundsFromWallet(amount) {
        return this._manageFundsToWallet(amount, false)
    }

    _manageFundsToWallet(amount, add = true) {
        this._amountManager.validateAmount(amount);
     
        if (add) {
            this._walletAmount = (parseFloat(this._walletAmount) + parseFloat(amount)).toFixed(2);
        } else {
            this._walletAmount = (parseFloat(this._walletAmount) - parseFloat(amount)).toFixed(2);
        }

        return this.save();
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

        if (typeof cardNumber != "string") {
            throw new Error(`Expected a card number in form of a string but got card number with type ${typeof cardNumber}`);
        }

        if (this.numOfCardsInWallet >= this._MAXIMUM_CARDS_ALLOWED) {
            throw new Error("You can only store a maximum of three cards.");
        }

        if (this.isCardInWallet(cardNumber)) {
            throw new Error("This card is already added to the wallet.");
        }

        const card = Card.getByCardNumber(cardNumber);
        if (!card) {
            warnError("addCardToWallet", "Failed to add card to the wallet");
            return false;
        }

        this._cards[cardNumber] = card;
        this._totalCards        += 1;
        this._cardNumbers[card.cardNumber] = { added: true, flaggedForRemoval: false, id: card.id }; // reference to card added
        this.save();
        return card;

    }

    /**
     * Removes a card from the wallet by its card number.
     * 
     * This method checks if the card exists in the wallet before removing it. 
     * If the card is successfully removed, the total card count is updated.
     * 
     * By default, the change is saved immediately. However, you can disable 
     * saving by setting `save` to `false`, which is useful when performing 
     * multiple deletions.
     * 
     * Note, this only removes the card from the wallet not from the localStorage.
     * To remove the card from the localStorage as well as the wallet call the
     * method `removeCardCompletely`
     * 
     * @param {string} cardNumber - The card number to be removed.
     * @param {boolean} [save=true] - Whether to save changes immediately.
     * @throws {Error} If the card number is not a valid string.
     */
    removeCardInWallet(cardNumber, save = true) {
        if (typeof cardNumber !== "string" || !cardNumber.trim()) {
            throw new Error(`Invalid card number. Expected a non-empty string but got ${typeof cardNumber}`);
        }

        if (!this.isCardInWallet(cardNumber)) {
            return;
        }

        this._cards      = excludeKey(this._cards, cardNumber);
        this._cardNumbers = excludeKey(this._cardNumbers, cardNumber);

        this._deductTotalCardsByOne();

        if (save) {
            this.save();
        }
        return true;

    }

    /**
     * Removes all cards from the wallet.
     * 
     * This method clears all cards stored in the wallet, resets the total card count to zero,
     * and saves the changes to persistent storage.
     * 
     * Note, this only removes the cards from the wallet not from the localStorage.
     * To remove the card from the localStorage as well as the wallet call the
     * method `removeCardCompletely`
     */
    removeAllCardsInWallet() {
        this._cards      = {};
        this._totalCards = 0;
        this.save()
    }

    /**
     * Removes a card completely from both the wallet and persistent storage.
     *
     * This method ensures the card is removed from the in-memory wallet (e.g. UI state)
     * and from the persistent store (e.g. localStorage or database).
     * 
     * Developers should use this method instead of calling `removeCard` and `Card.deleteCard` separately,
     * to ensure consistency and prevent orphaned data.
     *
     * @param {string} cardNumber - The unique identifier of the card to remove.
     */
    removeCardCompletely(cardNumber) {
         
        try {
            Card.deleteCard(cardNumber);   
        } catch (error) {
            throw new Error(error.message);
        }
        
        // only delete the virtual wallet copy if the actually card was successfully deleted by the Card class
        this.removeCardInWallet(cardNumber);         
    }

    /**
     * Checks if the given card number exists in the user's wallet. 
     * If the card exists, it is toggled between being marked or unmarked for removal, and `true` is returned. 
     * If the card does not exist, a warning is logged, and `false` is returned.
     *
     * @param {string} cardNumber - The card number to mark for removal.
     * @returns {boolean} - `true` if the card exists and its removal status is toggled, otherwise `false`.
     */
    markCardForRemoval(cardNumber) {
        if (!cardNumber || typeof cardNumber != "string") {
            warnError("markCardForRemoval", `The card was not marked for removal because it is not a string. Expected string but type ${cardNumber}`);
            return false;
        }

        cardNumber = cardNumber.trim();

        if (!this.isCardInWallet(cardNumber)) {
            warnError("markCardForRemoval", `The card was not marked for removal because it was not found in the wallet`);
            return false;
        }

        if (!this._cardNumbers[cardNumber].hasOwnProperty("flaggedForRemoval")) {

            this._cardNumbers[cardNumber] = {
                added: true,
                flaggedForRemoval: true,
                id: this._cards[cardNumber].id,
            }

        } else {
            this._cardNumbers[cardNumber].flaggedForRemoval = this._cardNumbers[cardNumber].flaggedForRemoval ? false : true;
        }

        this.save();
        return true;

    }

    /**
     * Removes all cards marked for deletion and returns the card numbers
     * @returns {[true, [string]]} - True and the card numbers removed
     */
    removeAllCardsMarkedForRemoval() {
        const cardNumberKeysCopy = Object.keys(this._cardNumbers); // Copy only the keys not the type object
        const removalCardIds = [];
        for (const cardNumber of cardNumberKeysCopy) {
            if (this._cardNumbers[cardNumber]?.flaggedForRemoval) {
                removalCardIds.push(this._cardNumbers[cardNumber]?.id?.toString().trim());
                this.removeCardInWallet(cardNumber, false);        // false = Disable the ability to save it on every removal.
            }
        }

        this.save();
        return [true, removalCardIds];
    }

    _validateAccountType(methodCalledFrom, accountType) {

        if (!accountType || typeof accountType != "string") {
            logError(methodCalledFrom, `The account type must be a string. Expected a wallet/bank string but got ${accountType}`);
            throw new TypeError(`Expected a string but got an object with type ${typeof accountType}`);
        }

        accountType = accountType.toLowerCase().trim()
        if (accountType && !(accountType != "bank" || accountType != "wallet")) {
            logError(methodCalledFrom, `The expected value must be either "bank" or "wallet" but got ${accountType}`);
            throw new Error(`The expected value must be either "bank" or "wallet" but got ${accountType}`)
        }
    }

    _validateAmountType(methodCalledFrom, amount) {

        if (amount === null || amount === NaN) {
            warnError(methodCalledFrom, "Got a value of null");
            throw new Error("The value received was null")
        }

        const amountToCheck = checkNumber(amount);
   
        if (!(amountToCheck.isNumber || amountToCheck.isInteger || amountToCheck.isFloat)) {
            logError(methodCalledFrom, `The amount must be an integer/float. Expected a number but got ${typeof amount}`);
            throw new TypeError(`Expected a number but got an object with type ${amount}`);
        }
    }

    /**
    * Validates the bank account linkage to the user's wallet.
    * If the bank account is null, the function exits silently.
    * If the bank account is not an instance of the BankAccount class, an error is thrown.
    */
    _validateBankAccountLinkage() {
        if (this._bankAccount == null) {
            return;
        }

        if (!(this._bankAccount instanceof BankAccount)) {
            throw new Error("The bank account is not an instance of the BankAccount class");
        }
    }

    /**
    * Updated the total cards count in the wallet.
    */
    _deductTotalCardsByOne() {
        this._totalCards -= 1;
    }

    /**
     * Populates the wallet with Card objects based on the existing card numbers.
     * Each card number is fetched and converted into a Card object using `Card.getByCardNumber`.
     * 
     * This method assumes that `_cards` contains a mapping of card numbers.
     */
    _populateCardsIntoWallet() {
        if (this._cards) {
            if (!this._cardNumbers) {
                return;
            }
            Object.keys(this._cardNumbers).forEach(cardNumber => {
                this._cards[cardNumber] = Card.getByCardNumber(cardNumber);
            });
        }
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
    _updateCardInWallet(card) {
        if (!card || !(card instanceof Card)) {
            throw new Error("The card cannot be empty and it must be an instance of Card")
        }
        this._cards[card.cardNumber] = card;

    };
}


