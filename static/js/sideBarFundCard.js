import { checkIfHTMLElement, formatCurrency } from "./utils.js";
import { parseFormData } from "./formUtils.js";
import { Card } from "./card.js";
import { getSelectedSidebarCardState } from "./sidebarCard.js";
import { logError } from "./logger.js";
import { AlertUtils } from "./alerts.js";
import { renderCardToUI } from "./sidebarCard.js";
import { config } from "./config.js";
import { notificationManager } from "./notificationManager.js";
import { updateCardSideBar } from "./sidebarCardUpdate.js";
import { Wallet } from "./wallet.js";
import { walletDashboard } from "./walletUI.js";


notificationManager.setKey(config.NOTIFICATION_KEY);

const fundMyCardFormElement  = document.getElementById("add-fund-form");
const fundMyCardErrorElement = document.getElementById("fund-my-card-error");


validatePageElements();


export function handleAddFundToCardFormButtonClick(e) {

    const ADD_FUND_BUTTON_ID = "fund-account-btn";

    if (e.target.id === ADD_FUND_BUTTON_ID) {
        if (fundMyCardFormElement.checkValidity()) {

            const formData   = new FormData(fundMyCardFormElement);
            const required   = ["amount"]
            const parsedData = parseFormData(formData, required);

            const resp = handleAddFundingToCard(parsedData);
            if (resp) {
                AlertUtils.showAlert({
                    title: "Card successfully funded",
                    text: "Your card was successfully funded",
                    icon: "success",
                    confirmButtonText: "Great",
                })
            }

            const wallet = Wallet.loadWallet(config.SORT_CODE, config.ACCOUNT_NUMBER);
            walletDashboard.updateTotalCardAmountText(wallet);

        } else {
            fundMyCardFormElement.reportValidity();
        }
    }
}


function handleAddFundingToCard(parsedData) {

    if (!parsedData || typeof parsedData !== "object") {
        logError("handleAddFundingToCard", `Expected an object containing the amount but got object with type ${typeof parsedData} `);
        return;
    }

    if (!parsedData.hasOwnProperty("amount")) {
        logError("handleAddFundingToCard", `Expected a property called "amount" inside the parseData object but it couldn't be found: Object ${parsedData} `);
        return;
    }

    const cardNumber = getSelectedSidebarCardState().lastCardClickeCardNumber;

    if (!cardNumber) {
        logError("handleAddFundingToCard", "Expected a card number, since a card from the sidebar was clicked");
        return;
    }

    const card = Card.getByCardNumber(cardNumber); 

    if (!card) {
        logError("addFundingToCard", "Expected a card object but got nothing");
        return;
    }

    // throws and error if the card is blocked
    try {
       card.addAmount(parsedData.amount);
       toggleErrorMsg(false);
       renderCardToUI(card);
       updateCardSideBar([card])
       notificationManager.add(`Your card has been funded with ${formatCurrency(parsedData.amount)}.`);
       return true;
    } catch (error) {
        updateFundingErrorMsg(error.message);
        toggleErrorMsg(true);
    }
}


function updateFundingErrorMsg(msg) {
    if (!msg || typeof msg !== "object") {
        logError("updateFundingErrorMsg", `Expect a string but got object with object ${msg} with type ${typeof msg}`);
        return;
    }
    fundMyCardErrorElement.textContent = msg;
}


function toggleErrorMsg(show) {
    show ? fundMyCardErrorElement.classList.add("show") : fundMyCardErrorElement.classList.remove("show");
}


function validatePageElements() {
    checkIfHTMLElement(fundMyCardFormElement, "The funding my card form");
    checkIfHTMLElement(fundMyCardErrorElement, "The error message for funding card");
}