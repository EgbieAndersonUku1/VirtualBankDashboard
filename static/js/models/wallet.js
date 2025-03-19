import { Card } from "./card.js";
import { BankAccount } from "./bankAccount.js";
import { DataStorage } from "../base/baseDataStorage.js";


export class Wallet extends DataStorage {


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
}