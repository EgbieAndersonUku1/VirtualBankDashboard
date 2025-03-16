
import { excludeKey } from "./utils.js";
import { generateRandomID } from "./utils.js";
import { checkNumber } from "./utils.js";


CARD_STORAGE_KEY = "cards";


export class Card {
    /**
     * Creates an instance of a Card.
     * @param {string} cardHolderName - The name of the card holder.
     * @param {string} cardNumber - The card number.
     * @param {number} expiryMonth - The expiry month of the card.
     * @param {number} expiryYear - The expiry year of the card.
     */
    constructor(cardHolderName, cardNumber, expiryMonth, expiryYear) {
        this.id              = generateRandomID();  
        this.cardHolderName  = cardHolderName;  
        this.cardNumber      = cardNumber;  
        this.expiryMonth     = expiryMonth;  
        this.expiryYear      = expiryYear;  
        this._isCardBlocked  = false;  
        this._amount         = 0;  
        this._timeStamp      =  new Date().toISOString();  
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

        const userCard           = cardDetails[CARD_STORAGE_KEY][cardNumber];
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

        card.id             = userCard.id;
        card._amount        = userCard.amount;
        card._isCardBlocked = userCard.isCardBlocked;
        card._timeStamp     = userCard.timeStamp;

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
            console.log(storage);

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


