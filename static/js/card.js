
import { excludeKey } from "./utils.js";
import { generateRandomID } from "./utils.js";
import { DataStorage } from "./baseDataStorage.js";


const CARD_STORAGE_KEY = "cards";


/*
 * Class: Card
 * Manages card operations including adding and deducting amount.
 */
export class Card extends DataStorage {
    /**
     * Creates an instance of a Card.
     * @param {string} cardHolderName - The name of the card holder.
     * @param {string} cardNumber - The card number.
     * @param {number} expiryMonth - The expiry month of the card.
     * @param {number} expiryYear - The expiry year of the card.
     * @param {number} cvc        - The security code at the back of the card 
     */
    constructor(cardHolderName, cardNumber, expiryMonth, expiryYear, cvc) {
        super();
        this.id             = generateRandomID();
        this.cardHolderName = cardHolderName;
        this.cardNumber     = cardNumber;
        this.expiryMonth    = expiryMonth;
        this.expiryYear     = expiryYear;
        this.cvc            = cvc;
        this._isCardBlocked = false;
        this._balance       = 0
        this._amountManager = new AmountManager(this._balance);
        this._timeStamp     = new Date().toISOString();
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
     * @param {number} cvc        - The security code for the back of the card
     * @returns {Card} - The newly created and saved card.
     */
    static createCard(cardHolderName, cardNumber, expiryMonth, expiryYear, cvc) {

        if (!cardHolderName || !cardNumber || !expiryMonth || !expiryYear) {
            throw Error(`One or more of the fields are missing. Cardholder: ${cardHolderName}, ${cardNumber}, ${expiryMonth}, ${expiryYear}, ${cvc}`);
        }
        if (Card._doesCardExists(cardNumber)) {
            throw new Error("Card already exists.");
        }
        const card = new Card(cardHolderName, cardNumber, expiryMonth, expiryYear, cvc);
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
            userCard.expiryYear,
            userCard.cvc,
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

        const keys = ['cardHolderName', 'cardNumber', 'expiryMonth', 'expiryYear', 'cvc', '_isCardBlocked', '_balance', '_timeStamp', 'id'];

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

        this._balance                = cardDetails.balance;
        this._amountManager._balance = cardDetails.balance;
    }


}