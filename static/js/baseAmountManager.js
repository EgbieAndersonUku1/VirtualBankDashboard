/**
 * The AmountManager class is responsible for managing and validating monetary transactions 
 * across the Card, Balance, and Wallet classes. It serves as a composite class that provides 
 * methods for adding, deducting, and validating amounts within the system. 
 * All operations involving money (e.g., deposits, withdrawals, transfers) are handled by this class.
 */
export class AmountManager {

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
    }

    /**
     * Retrieves the current balance.
     * 
     * @returns {number} The current balance.
     */
    get balance() {
        this._setBalanceToDecimalPlaces();
        return this._balance;
    }

    /**
     * Sets the balance to a new value.
     * 
     * @param {number} balance - The new balance to be set.
     */
    set balance(balance) {
        this._balance = balance;
        this._setBalanceToDecimalPlaces();
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