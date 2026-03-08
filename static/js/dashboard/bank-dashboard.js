import { handleBankFundInput, handleBankCardTypes, handleFundAccountBtn, handleToggleAddFundsPanel } from "./bank-panel/bank-account__add-funds.js";
import { handleToggleViewBankTransactionPanel } from "./bank-panel/bank-account_view-transactions.js";

const dashboard = document.getElementById("dashboard");

// TODO add one time checker here for one time static element check
dashboard.addEventListener("click", handleDelegation);
dashboard.addEventListener("change", handleDelegation)



/**
 * Delegates wallet connection UI events to WalletWizard.
 * @param {Event} event Click or submit event.
 */
function handleDelegation(event) {

    // handles add funds for the bank account panel
    handleBankFundInput(event);
    handleBankCardTypes(event);
    handleFundAccountBtn(event);
    handleToggleAddFundsPanel(event);

    // handles view transactions for the bank account panel
    handleToggleViewBankTransactionPanel(event)


}








