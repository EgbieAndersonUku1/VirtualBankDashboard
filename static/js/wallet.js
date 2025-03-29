import { Card } from "./card.js";
import { BankAccount } from "./bankAccount.js";
import { DataStorage } from "./baseDataStorage.js";
import { AmountManager } from "./baseAmountManager.js";
import { checkNumber, generateRandomID, excludeKey } from "./utils.js";
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
   * @param {number} numberOfCards - The number of cards currently in the wallet (default: 0).
   * @param {string|null} pin - The PIN associated with the wallet (default: null).
   */
    constructor(bankAccount=null, lastTransfer = null, lastAmountReceived = null, numberOfCards = 0, pin = null) {
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

        this._validateBankAccountLinkage();
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
     * Sets a wallet amount to the wallet
     */
    set walletAmount(walletAmount) {

        if (walletAmount != 0) {
            this._amountManager.validateAmount(walletAmount)
        }
       
        this._walletAmount = walletAmount
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

    /**
     * Set the bank account to wallet
     */
    set bankAccount(bankAccount) {
        this._bankAccount = bankAccount;
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

    set pin(pin) {
        if (!checkNumber(pin).isNumber) {
            logError("Wallet.SetPin", `The pin must be an integer. Expected a number but got type ${typeof pin}`);
            throw new Error("The pin is not an intege")
        }
        this._pin = pin;
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
     * Removes a card from the wallet by its card number.
     * 
     * This method checks if the card exists in the wallet before removing it. 
     * If the card is successfully removed, the total card count is updated.
     * 
     * By default, the change is saved immediately. However, you can disable 
     * saving by setting `save` to `false`, which is useful when performing 
     * multiple deletions.
     * 
     * @param {string} cardNumber - The card number to be removed.
     * @param {boolean} [save=true] - Whether to save changes immediately.
     * @throws {Error} If the card number is not a valid string.
     */
    removeCard(cardNumber, save=true) {
        if (typeof cardNumber !== "string" || !cardNumber.trim()) {
            throw new Error(`Invalid card number. Expected a non-empty string but got ${typeof cardNumber}`);
        }

        if (!this.isCardInWallet(cardNumber)) {
            return;
        }

        this._cards        = excludeKey(this._cards, cardNumber);
        this._cardNumbers  = excludeKey(this._cardNumbers, cardNumber);

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
        this._walletAmount = (parseFloat(this._walletAmount) + parseFloat(amount)).toFixed(2);
        this.save();
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
        this._cardNumbers[card.cardNumber] = { added: true, flaggedForRemoval: false, id: card.id}; // reference to card added
        this.save();
        return card;
        
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
        this._cards[card.cardNumber] = card;

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

        return this._cards[cardNumber];
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
     * Returns an array containing all the card objects found in the wallet.
     * If no cards are found, an empty array is returned.
     *
     * @returns {Card[]} An array of Card objects in the wallet, or an empty array if no cards are found.
     */
    getAllCards() {
        return this._cards;
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

        return this.constructor.saveData(WALLET_STORAGE_KEY, saveAs , this.toJson())
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


        const walletJson      = super.fromStorage(userWalletData, requiredKeys);
        const wallet          = Object.assign(new Wallet, walletJson);
        wallet._cardNumbers   = walletJson.cardNumbers;
        wallet.bankAccount    = BankAccount.getByAccount(sortCode, accountNumber);
        wallet._totalCards    = walletJson.totalCards;

        wallet.walletAmount   = parseFloat(walletJson.walletAmount).toFixed(2) || 0;

        wallet._populateCardsIntoWallet();

        if (!wallet._bankAccount) {
            warnError("Wallet.loadWallet", "The bank account wasn't loaded into the wallet.")
        }

        return wallet;

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
     * Checks if the given card number exists in the user's wallet. 
     * If the card exists, it is toggled between being marked or unmarked for removal, and `true` is returned. 
     * If the card does not exist, a warning is logged, and `false` is returned.
     *
     * @param {string} cardNumber - The card number to mark for removal.
     * @returns {boolean} - `true` if the card exists and its removal status is toggled, otherwise `false`.
     */
      markCardForRemoval(cardNumber) {
        if (!cardNumber || typeof cardNumber != "string" ) {
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
        const removalCardIds =   [];
        for (const cardNumber of cardNumberKeysCopy) {
            if (this._cardNumbers[cardNumber]?.flaggedForRemoval) {
                removalCardIds.push(this._cardNumbers[cardNumber]?.id?.toString().trim());
                this.removeCard(cardNumber, false);        // false = Disable the ability to save it on every removal.
            }
        }
    
        this.save();
        return [true, removalCardIds];
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

}


