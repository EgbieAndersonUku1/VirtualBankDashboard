import { sanitizeText } from "../utils.js";
import { AlertUtils } from "../alerts.js";


const connectWalletModal          = document.getElementById("connect-wallet-modal");
const connectWalletStepOne        = document.getElementById("connect-wallet-modal__step-one");
const connectWalletStepThree      = document.getElementById("connect-wallet-modal__step-three");
const connectWalletStepTwo        = document.getElementById("connect-wallet-modal__step-two");
const dashboard                   = document.getElementById("dashboard");
const dashboardProfileElement     = document.getElementById("dashboard-profile");
const dropdownMenu                = document.getElementById("dashboard__container__dropdown-menu");
const linkAccountForm             = document.getElementById("link-wallet-form");
const progressElement             = document.getElementById("walletProgress");
const progressValue               = document.getElementById("walletProgressValue");
const walletAuthForm              = document.getElementById("connect-wallet-form");
const walletAuthInputFieldPanel   = document.getElementById("connect-with-wallet-id");
const walletManualForm            = document.getElementById("manually-verification-wallet-form");
const walletManualFormSection     = document.getElementById("link-wallet-verifcation");
const walletOptionAuthInputFields = document.querySelectorAll("#connect-wallet-auth-id-wrapper input");
const statusWalletDisconnectPanel = document.getElementById("dashboard__status")
const disconnectInputFieldElement = document.getElementById("wallet-disconnect-inputfield");
const disconnectConfirmaionPanel  = document.getElementById("wallet-disconnection-confirmation")

let walletModalStep2Button;

const excludeFields = new Set(["username",  "email", "wallet-disconnect-inputfield"]);
const excludeTypes = new Set(["checkbox", "radio", "password", "email"]);


// Constants for wallet modal element IDs
const WalletWizardIds = {
    AUTH_CANCEL_BTN: "auth-wallet__cancel-btn",
    BACK_ANCHOR: "wallet-modal-connect-back-anchor",
    CANCEL_BTN: "connect-wallet__cancel-btn",
    CONNECT_BTN: "connect-wallet-btn",
    MANUAL_CONNECTION: "select-manual-connection",
    MANUAL_FORM_BACK: "wallet-manually-form-back-step",
    PREVIOUS_STEP1: "wallet-modal-previous-step1",
    PREVIOUS_STEP2: "wallet-modal-previous-step2",
    STEP1_BTN: "connect-wallet-step1-btn",
    STEP2_BTN: "connect-wallet-step2-btn",
    WALLET_ID_CONNECT: "wallet-id-connect"
};



// TODO add one time checker here for one time static element check

dashboardProfileElement.addEventListener("click", handleDropDownMenu);
dashboard.addEventListener("click", handleDelegation);
walletAuthForm.addEventListener("submit", handleWalletAuthForm);



function handleDropDownMenu(e) {
    const profileImg = e.target.closest("img");
    if (profileImg) {
        dropdownMenu.classList.toggle("show")
    }
}




/**
 * WalletWizard handles the multi-step connect wallet modal flow.
 * Steps can be navigated dynamically with next/back buttons.
 * It also manages showing/hiding the modal and individual steps.
 */const WalletWizard = (() => {

     // Cached DOM elements


    /** Hides the wallet authentication input panel. */
    function closeWalletAuthPanel() {
        toggleElement({ element: walletAuthInputFieldPanel, show: false });
    }

    /** Opens the wallet authentication panel and disables step 2 action. */
    function openWalletAuthInputPanel() {
        disableStep2Button();
        toggleElement({ element: walletAuthInputFieldPanel });
    }

    /** Handles wallet ID selection and prepares auth input fields. */
    function selectWalletIdConnect(e) {
        disableStep2Button();
        WalletWizard.handleWalletConnectAuthInputFields(e);
    }

    /**
     * Shows or hides manual wallet connection form.
     * @param {boolean} show Whether to display the manual connection form.
     */
    function selectManualConnection(show = true) {
        if (show) {
            disableStep2Button();
            toggleElement({ element: walletManualFormSection });
            return;
        }

        enableStep2Button();
        toggleElement({ element: walletManualFormSection, show: false });
    }

    // Public object
    return {

        /** Opens the modal and displays step one. */
        goToStepOne() {
            this.openModel();
            this.showStep(connectWalletStepOne);
        },

        /** Navigates to wallet connection step two. */
        goToStepTwo() {
            this.hideAllSteps();
            this.showStep(connectWalletStepTwo);
        },

        /** Navigates to wallet connection step three. */
        goToStepThree() {
            this.hideAllSteps();
            this.showStep(connectWalletStepThree);
        },

        /** Opens the wallet modal and resets steps. */
        openModel() {
            toggleElement({ element: connectWalletModal, show: true });
            this.hideAllSteps();
        },

        /** Closes the wallet modal and clears step visibility. */
        closeModal() {
            toggleElement({ element: connectWalletModal, show: false });
            this.hideAllSteps();
        },

        /**
         * Displays a given wizard step.
         * @param {HTMLElement} step Step element to show.
         */
        showStep(step) {
            toggleElement({ element: step, show: true });
        },

        /**
         * Navigates to the previous step.
         * @param {number} stepNumber Current step number.
         */
        previousStep(stepNumber) {
            if (stepNumber === 2) {
                this.goToStepTwo();
                return;
            }
            this.goToStepOne();
        },

        /** Hides all wizard steps. */
        hideAllSteps() {
            [connectWalletStepOne, connectWalletStepTwo, connectWalletStepThree].forEach(el =>
                toggleElement({ element: el, show: false })
            );
        },

        /**
         * Handles deletion navigation in auth input fields.
         * @param {KeyboardEvent} e Key event.
         */
        handleBackspaceOrDelete(e) {
            if (e.key === "Backspace" || e.key === "Delete") {
                this.handleWalletConnectAuthInputFields(e, true);
            }
        },

        /**
         * Manages auth input field focus and navigation.
         * @param {Event} e Input event.
         * @param {boolean} deleteMode Whether navigation is triggered by deletion.
         */
        handleWalletConnectAuthInputFields(e, deleteMode = false) {

            openWalletAuthInputPanel();
            walletOptionAuthInputFields[0]?.focus();

            if (e && e.target) {
                e.target.value = sanitizeText(e.target.value, true);
            }

            for (let currentIndex = 1; currentIndex < walletOptionAuthInputFields.length; currentIndex++) {
                const previousIndex = currentIndex - 1;
                const lastIndex = walletOptionAuthInputFields.length - 1;

                if (!walletOptionAuthInputFields[previousIndex].value) {
                    return;
                }

                if (!deleteMode) {
                    walletOptionAuthInputFields[currentIndex].focus();
                } else {
                    walletOptionAuthInputFields[previousIndex].focus();
                }

                // Ensure last field clears correctly during deletion.
                if (currentIndex === lastIndex && deleteMode) {
                    walletOptionAuthInputFields[currentIndex].value = "";
                }

                if (currentIndex === lastIndex && !deleteMode) {
                    walletOptionAuthInputFields[currentIndex].focus();
                }
            }
        },

        /**
         * Central event handler for wallet connection UI actions.
         * @param {Event} e Click event.
         */
        handleWalletConnectionSteps(e) {
            const elementID = e.target.id;

            if (elementID === "modal-close-btn") {
                WalletWizard.closeModal();
                return;
            }

             switch (elementID) {
                case WalletWizardIds.CONNECT_BTN:
                    WalletWizard.goToStepOne();
                    break;
                case WalletWizardIds.STEP1_BTN:
                    WalletWizard.goToStepTwo();
                    break;
                case WalletWizardIds.STEP2_BTN:
                    WalletWizard.goToStepThree();
                    break;
                case WalletWizardIds.WALLET_ID_CONNECT:
                    selectWalletIdConnect();
                    break;
                case WalletWizardIds.CANCEL_BTN:
                    WalletWizard.closeModal();
                    break;
                case WalletWizardIds.AUTH_CANCEL_BTN:
                    enableStep2Button();
                    closeWalletAuthPanel();
                    break;
                case WalletWizardIds.PREVIOUS_STEP2:
                    WalletWizard.previousStep(2);
                    break;
                case WalletWizardIds.PREVIOUS_STEP1:
                    WalletWizard.previousStep(1);
                    break;
                case WalletWizardIds.BACK_ANCHOR:
                    enableStep2Button();
                    closeWalletAuthPanel();
                    WalletWizard.previousStep(2);
                    break;
                case WalletWizardIds.MANUAL_CONNECTION:
                    selectManualConnection();
                    break;
                case WalletWizardIds.MANUAL_FORM_BACK:
                    WalletWizard.previousStep(2);
                    selectManualConnection(false);
                    break;
            }
        }
    };
})();







/**
 * Sets up dashboard and wallet form event delegation.
 * - Handles input in dashboard fields for wallet auth.
 * - Handles Backspace/Delete key navigation.
 * - Handles wallet linking and manual form submissions.
 */
dashboard.addEventListener("input", (e) => {
    const target = e.target;

    // Skip excluded types or IDs
    if (excludeTypes.has(target.type) || excludeFields.has(target.id)) return;
    WalletWizard.handleWalletConnectAuthInputFields(e);
    handleDisconnecectionConfirmationButton(e)
});

dashboard.addEventListener("keydown", (e) => {
    WalletWizard.handleBackspaceOrDelete(e);
});


/**
 * Events listeners
 */
linkAccountForm.addEventListener("submit", handleWalletLinkFormSubmission);
walletManualForm.addEventListener("submit", handleManualFormSubmission);




/**
 * Delegates wallet connection UI events to WalletWizard.
 * @param {Event} e Click or submit event.
 */
function handleDelegation(e) {
   
    WalletWizard.handleWalletConnectionSteps(e);
    handleStatusButtonClick(e);

}




/**
 * Updates the wallet connection progress UI.
 * - Sets the CSS progress value
 * - Updates the visible percentage
 * - Handles completion state at 100%
 *
 * @param {number} percent - Progress percentage (0–100)
 */
function setWalletProgress(percent) {
    const completionPercentage = "100%";

    progressElement.style.setProperty("--progress", percent);
    progressValue.textContent = percent + "%";

    if (progressValue.textContent === completionPercentage) {
        const innerProgressBar = document.querySelector(".wallet-progress");

        if (innerProgressBar) {
            innerProgressBar.style.background = "#16A34A";
            showWalletAuthCompletionMsg();
          
        }
    }
}



/**
 * Starts the wallet authentication progress animation.
 * Increments progress until completion is reached.
 */
function startProgress() {
    let progress = 0;
    setWalletProgress(0);
    const MILLI_SECONDS = 25

    const interval = setInterval(() => {
        progress += 1;
        setWalletProgress(progress);

        if (progress >= 100) {
            clearInterval(interval);
        }
    }, MILLI_SECONDS);
}



/**
 * Handles wallet authentication form submission.
 * Prevents default submit behaviour and starts progress flow.
 *
 * @param {Event} e - Form submit event
 */
function handleWalletAuthForm(e) {
    e.preventDefault();
    startProgress();
    removeAuthWalletVerifyBtn();
}


/**
 * Displays the wallet authentication completion message.
 */
function showWalletAuthCompletionMsg() {
    const container = document.getElementById("wallet-auth-completion");
    toggleElement({ element: container, cSSSelector: "hide", show: false });
}


/**
 * Removes the wallet verification button after successful authentication.
 */
function removeAuthWalletVerifyBtn() {
    const btn = document.getElementById("auth-verify-btn");
    btn.style.display = "none";
}



/**
 * Handles the form link confirmation form, the final step before
 * a wallet is linked to the bank account.
 */
async function handleWalletLinkFormSubmission(e) {
    e.preventDefault();

    const confirmed = await AlertUtils.showConfirmationAlert({
        title: "Link wallet to bank account?",
        text: "This will securely link your wallet so funds can move between accounts.",
        confirmButtonText: "Link account",
        messageToDisplayOnSuccess: "The accounts have been linked",
        denyButtonText: "Cancel",
        cancelMessage: "Wallet linking cancelled."
    });

   if (confirmed) {
    WalletWizard.closeModal();
   }

 
}


/**
 * Disables the Step 2 button in the wallet wizard.
 * Sets the button text to "Disabled" and reduces opacity.
 */
function disableStep2Button() {
    if (!walletModalStep2Button) {
        walletModalStep2Button = document.getElementById("connect-wallet-step2-btn");
    }

    walletModalStep2Button.disabled = true;
    walletModalStep2Button.textContent = "Disabled";
    walletModalStep2Button.style.opacity = "0.5";
}


/**
 * Enables the Step 2 button in the wallet wizard.
 * Sets the button text to "Continue" and restores full opacity.
 */
function enableStep2Button() {
    walletModalStep2Button.disabled = false;
    walletModalStep2Button.textContent = "Continue";
    walletModalStep2Button.style.opacity = "1";
}


/**
 * Handles submission of the manual wallet connection form.
 * Shows a success alert, hides the manual form, and enables Step 2 button.
 * @param {Event} e Form submit event.
 */
function handleManualFormSubmission(e) {
    console.log("submit");
    e.preventDefault();

    AlertUtils.showAlert({
        title: "Wallet verified",
        text: "Your wallet credentials have been successfully verified. You can now proceed with linking the wallet",
        icon: "success",
        confirmButtonText: "Continue"
    });

    toggleElement({ element: walletManualFormSection, show: false });
    enableStep2Button();
}


/**
 * Handles clicks on status buttons.
 * Delegates the click to toggleStatusPanel.
 * @param {MouseEvent} e - The click event.
 * @returns {void}
 */
function handleStatusButtonClick(e) {
    toggleStatusPanel(e)
}

/**
 * Handles the confirmation process for disconnecting a wallet.
 * @async
 * @returns {Promise<void>}
 */
async function handleDisconnecectionConfirmationButton() {
    const expectedWord  = "disconnect";

    if (!disconnectInputFieldElement) return;
    if (disconnectInputFieldElement.value.length < expectedWord.length) return;
    if (disconnectInputFieldElement.value.toLowerCase() !== expectedWord) return;

    const confirmed = await AlertUtils.showConfirmationAlert({
        title: "Are you sure you want to disconnect wallet?",
        text: "This action will disconnect your wallet from your bank, and stop all information.",
        confirmButtonText: "Disconnect wallet",
        messageToDisplayOnSuccess: "The wallet has been disconnected",
        denyButtonText: "Cancel Disconnect",
        cancelMessage: "No action taken."
    });

   if (confirmed) {
    closeStatusPanels();
    WalletWizard.closeModal();
   }
}

/**
 * Handles the wallet connection refresh action.
 * Shows a confirmation alert and displays a success message if confirmed.
 * @async
 * @returns {Promise<void>}
 */
async function handleRefreshConnection() {
    const confirmed = await AlertUtils.showConfirmationAlert({
        title: "Refresh wallet connection?",
        text: "This will refresh your current wallet connection.",
        confirmButtonText: "Refresh connection",
        messageToDisplayOnSuccess: "Wallet connection refreshed successfully.",
        denyButtonText: "Cancel",
        cancelMessage: "No changes were made."
    });
}

/**
 * Handles testing the wallet connection.
 * Shows a confirmation alert and displays a success message if confirmed.
 * @async
 * @returns {Promise<void>}
 */
async function handleTestConnection() {
    const confirmed = await AlertUtils.showConfirmationAlert({
        title: "Test wallet connection?",
        text: "This will test if your wallet connection is working properly.",
        confirmButtonText: "Run test",
        messageToDisplayOnSuccess: "Wallet connection is working!",
        denyButtonText: "Cancel",
        cancelMessage: "No changes were made."
    });
}

/**
 * Toggles visibility of various status and confirmation panels
 * based on which button was clicked.
 * @param {MouseEvent} e - The click event.
 * @returns {void}
 */
function toggleStatusPanel(e) {
    console.log(e.target.id)

    if (e.target.id === "disconnect-wallet-status") {
         statusWalletDisconnectPanel.classList.add("show");
         return;
    }

    const buttonID = e.target.closest("button")?.id;
    console.log(buttonID)

    switch(buttonID) {
        case "disconnect-btn":
            disconnectConfirmaionPanel.classList.add("show")
            break;
        case "confirm-disconnect-btn":
            handleDisconnecectionConfirmationButton();
            break;
        case "cancel-disconnect-btn":
            disconnectConfirmaionPanel.classList.remove("show");
            break;
        case "disconnection-modal-close-btn":
            closeConfirmationPanel();
            break;
        case "dashboard-status-modal-close-btn":
            closeStatusPanels();
            break;
        case "refresh-connection-btn":
            handleRefreshConnection();
            break;
        case "test-connection-btn":
            handleTestConnection();
            break;
        case "connect-modal-close-btn":
            WalletWizard.closeModal();
            break;
    }
}


/**
 * Closes all wallet-related status panels and clears input fields.
 * @returns {void}
 */
function closeStatusPanels(){
    toggleElement({element: statusWalletDisconnectPanel, show:false})
    closeConfirmationPanel();
    clearDisconnectInputField();
}


/**
 * Closes the disconnect confirmation panel.
 * @returns {void}
 */
function closeConfirmationPanel() {
    toggleElement({element: disconnectConfirmaionPanel, show:false})
}


/**
 * Clears the input field used for confirming wallet disconnection.
 * @returns {void}
 */
function clearDisconnectInputField() {
     disconnectInputFieldElement.value = "";
}


/**
 * Toggles the visibility of a DOM element.
 * @param {Object} options - Options object.
 * @param {HTMLElement} options.element - The element to toggle.
 * @param {cSSSelector} - The selector for the element
 * @param {boolean} options.show - Whether to show (true) or hide (false) the element.
 * @returns {void}
 */

function toggleElement({ element, cSSSelector = "show", show = true }) {
    if (show) {
        element.classList.add(cSSSelector);
        return;
    }

    element.classList.remove(cSSSelector);
}






