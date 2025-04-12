
import { getSelectedSidebarCardState, renderCardToUI } from "./sidebarCard.js";
import { Card } from "./card.js";
import { logError } from "./logger.js";
import { notificationManager } from "./notificationManager.js";
import { updateCardSideBar } from "./sidebarCardUpdate.js";
import { config } from "./config.js";
import { AlertUtils } from "./alerts.js";


notificationManager.setKey(config.NOTIFICATION_KEY);

const selectedSidebarCard = getSelectedSidebarCardState();


export async function handleTransferBlock(e) {
    
    const BLOCK_BUTTON_ID = "block-card";

    if (e.target.id !== BLOCK_BUTTON_ID) {
        return;
    }

    
    const card = Card.getByCardNumber(selectedSidebarCard.lastCardClickeCardNumber);
   
    if (!card) {
        logError("handleTransferblock", "The card wasn't found");
        return;
    }

    let msg;
   
    if (!card.isBlocked){
            const resp = await AlertUtils.showConfirmationAlert({
                            title: "Are you sure you want to block your virtual card?",
                            icon: "warning",
                            confirmButtonText: "Block",
                            messageToDisplayOnSuccess: "Your card has been successfully blocked.",
                            cancelMessage: "No changes were made. Your card remains active.",
                            denyButtonText: "Cancel"
                        });
        
        if (resp) {
        
            msg = `Your card was blocked on ${new Date().toLocaleString()}.
                        You won’t be able to send or receive money until it’s unblocked.`;
            card.freezeCard();
            renderCardToUI(card);
            updateCardSideBar([card]);
            updateSideBarCardState(card)
            notificationManager.add(msg);
        }
       
    } else {
        const msg = `Your card has been unblocked as of ${new Date().toLocaleString()}.
                     You can now send and receive money again.`;

        card.unfreezeCard();
        AlertUtils.showAlert({
            title: "Card unblocked",
            text: "Your card is now active and ready to use.",
            confirmButtonText: "OK",
            icon: "success"
        });
        updateSideBarCardState(card);
        renderCardToUI(card);
        updateCardSideBar([card]);
        notificationManager.add(msg);
    }
  
    
}


export function updateSideBarCardState(card) {

    selectedSidebarCard[card.cardNumber] = {

        cardNumber: card.cardNumber,
        cardStatus: card.isBlocked ? "blocked" : "active",
        cardType: card.cardType,
        id: card.id,
    }

  
}