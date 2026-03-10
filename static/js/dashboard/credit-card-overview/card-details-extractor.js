
import { getElementFromCache, saveToCache } from "./card-dom-cache.js";
import { checkIfHTMLElement } from "../../utils.js";



/**
 * @typedef {Object} CardDetails
 * @property {string} cardId
 * @property {string} bankName
 * @property {string} cardBrand
 * @property {string} cardAmount
 * @property {string} cardType
 * @property {string} cardNumber
 * @property {string} expiryMonth
 * @property {string} expiryYear
 * @property {string} cardName
 * @property {string} issueDate
 * @property {string} cardCreationDate
 * @property {string} cardCVC
 */

/**
 * Extracts card details from a bank card from the DOM element and cache it for easy retrieval.
 *
 * @param {HTMLElement} bankCardElement - The DOM element representing a bank card.
 * @returns {CardDetails}
 * @dependecies
 *   - saveToCache
 */
export function getCardDetailsFromElement(bankCardElement) {

    const cardId     = bankCardElement.dataset.cardId;

    if (!checkIfHTMLElement(bankCardElement, "bank card element")) return;

    let bankCardDetails = getElementFromCache(cardId, false, false);

    if (bankCardDetails === undefined) {

            const bankName   = bankCardElement.querySelector(".card-head-info h3")?.textContent;
            const amount     = bankCardElement.querySelector(".bank-card-amount")?.textContent;
            const cardType   = bankCardElement.querySelector(".card-type")?.textContent.trim();
            const cardNumber = bankCardElement.querySelector(".card-number")?.textContent;
            const cardName   = bankCardElement.querySelector(".card-name")?.textContent;
            const expiryDate = bankCardElement.querySelector(".card-expiry-date")?.textContent;

            const [month, year] = expiryDate.split("Expiry date: ");
            console.log(`No card details found for card with number ${cardNumber}, populate cache with card the following card details to avoid multiple DOM queries`);

            bankCardDetails =  {
                    cardId: cardId,
                    bankName: bankName,
                    cardBrand: bankCardElement.dataset.cardBrand,
                    cardAmount: amount,
                    cardType: cardType,
                    cardNumber: cardNumber,
                    expiryMonth: month,
                    expiryYear: year,
                    cardName: cardName,
                    issueDate: bankCardElement.dataset.issued,
                    cardCreationDate: bankCardElement.dataset.creationDate,
                    cardCVC: bankCardElement.dataset.cvc,
                    isActive: bankCardElement.dataset.isActive === "true"
            }

            saveToCache(cardId, bankCardDetails);

    } else {
        console.log("Pulling card details from cache")
    }


    return {
        cardId: bankCardDetails.cardId,
        bankName: bankCardDetails.bankName,
        cardBrand: bankCardDetails.cardBrand,
        cardAmount: bankCardDetails.cardAmount,
        cardType: bankCardDetails.cardType,
        cardNumber: bankCardDetails.cardNumber,
        expiryMonth: bankCardDetails.expiryMonth,
        expiryYear: bankCardDetails.expiryYear,
        cardName: bankCardDetails.cardName,
        issueDate: bankCardDetails.issued,
        cardCreationDate: bankCardDetails.creationDate,
        cardCVC: bankCardDetails.cvc,
        isActive: bankCardDetails.isActive
    };

   
}