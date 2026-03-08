import { handleBankFundInput, handleBankCardTypes, handleFundAccountBtn, handleToggleAddFundsPanel } from "./bank-panel/bank-account__add-funds.js";

const dashboard = document.getElementById("dashboard");



// TODO add one time checker here for one time static element check
dashboard.addEventListener("click", handleDelegation);
dashboard.addEventListener("change", handleDelegation)



/**
 * Delegates wallet connection UI events to WalletWizard.
 * @param {Event} e Click or submit event.
 */
function handleDelegation(e) {

    handleBankFundInput(e);
    handleBankCardTypes(e);
    handleFundAccountBtn(e);
    handleToggleAddFundsPanel(e);
   


}








