import { cards } from "./cardsComponent.js";
import { logError } from "./logger.js";
import { prepareCardData } from "./walletUI.js";
import { notificationManager } from "./notificationManager.js";
import { config } from "./config.js";
import { formatCurrency } from "./utils.js";
import { removeCardBlockStatus, applyCardBlockStatus } from "./cardsComponent.js";



notificationManager.setKey(config.NOTIFICATION_KEY);


function updateCardInPlace(card) {
    const cardElement = document.querySelector(`[data-card-number="${card.cardNumber}"]`);
    if (!cardElement) {
        logError("updateCardInPlace", `No card element found for card number ${card.cardNumber}`);
        return;
    }

    // Update balance
    const balanceElement = cardElement.querySelector(".card-amount .card-amount");
 
    if (balanceElement) {
        balanceElement.textContent = card.cardAmount;
    }

    // update block status
    card.isCardBlocked ?  applyCardBlockStatus(cardElement, card) :  removeCardBlockStatus(cardElement, card)
  

}


export function updateCardSideBar(updatedCards, sendNotification=false) {
    
    if (!Array.isArray(updatedCards)) {
        logError("updateCardSideBar", `Expected an array but got object with type ${typeof updatedCards}`);
        return
    }

    let updated = false;

    // update the card
    for (const card of updatedCards) {

        if (!updated) {
            updated = true;
        }
        const cardData = prepareCardData(card);
        if (sendNotification) {
            notificationManager.add(`Card number #${card.cardNumber} has been updated with ${formatCurrency(card.balance)}`)
        }
        updateCardInPlace(cardData);
    }

    if (updated) {
        config.loadFromCache = false;
    }

}