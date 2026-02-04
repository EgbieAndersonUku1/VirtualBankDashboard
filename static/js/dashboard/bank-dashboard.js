import { sanitizeText } from "../utils.js";
import { AlertUtils } from "../alerts.js";


const dashboardProfileElement = document.getElementById("dashboard-profile");
const dropdownMenu = document.getElementById("dashboard__container__dropdown-menu");

const dashboard = document.getElementById("dashboard")
const connectWalletModal = document.getElementById("connect-wallet-modal")
const connectWalletStepOne = document.getElementById("connect-wallet-modal__step-one");
const connectWalletStepTwo = document.getElementById("connect-wallet-modal__step-two");
const connectWalletStepThree = document.getElementById("connect-wallet-modal__step-three");
const walletOptionChoices = document.querySelectorAll(".choose-wallet-option");
const walletOptionAuthInputFields = document.querySelectorAll("#connect-wallet-auth-id-wrapper input")
const walletAuthInputFieldPanel = document.getElementById("connect-with-wallet-id")
const progressElement = document.getElementById("walletProgress");
const progressValue = document.getElementById("walletProgressValue");
const walletAuthForm = document.getElementById("connect-wallet-form");
const linkAccountForm = document.getElementById("link-wallet-form");
let walletModalStep2Button;



// console.log(walletOptionAuthInputFields)



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
 */
const WalletWizard = (() => {

    // Private function (not accessible from outside)
    function disableWalletOptionChoices() {
        if (!Array.from(walletOptionChoices)) {
            throw new Error(`Expected an array of elements but got object with type ${typeof walletOptionChoices}`);
        }

        walletOptionChoices.forEach((element) => {
            element.classList.remove("choose-wallet-option");
        });
    }

    function closeWalletAuthPanel() {
        toggleElement({element: walletAuthInputFieldPanel, show: false})


    }
    function openWalletAuthInputPanel() {
        disableStep2Button();
        toggleElement({ element: walletAuthInputFieldPanel })

    }

    function disableStep2Button() {
        if (!walletModalStep2Button) {
            walletModalStep2Button = document.getElementById("connect-wallet-step2-btn")
        }


        walletModalStep2Button.disabled = true
        walletModalStep2Button.textContent = "Disabled";
        walletModalStep2Button.style.opacity = "0.5";


    }

    function enableStep2Button() {
        walletModalStep2Button.disabled = false;
        walletModalStep2Button.textContent = "Continue";
        walletModalStep2Button.style.opacity = "1";

    }

    function selectWalletIdConnect(e) {
        
            disableStep2Button();
            WalletWizard.handleWalletConnectAuthInputFields(e)
        
        
    }


    // Public object
    return {
        goToStepOne() {
            this.openModel();
            this.showStep(connectWalletStepOne);
        },

        goToStepTwo() {
            this.hideAllSteps();
            this.showStep(connectWalletStepTwo);


        },

        goToStepThree() {
            this.hideAllSteps();
            this.showStep(connectWalletStepThree);
        },

        openModel() {
            toggleElement({ element: connectWalletModal, show: true });
            this.hideAllSteps();
        },

        closeModal() {
            toggleElement({ element: connectWalletModal, show: false });
            this.hideAllSteps();
        },

        showStep(step) {
            toggleElement({ element: step, show: true });
        },

        previousStep(stepNumber) {
            if (stepNumber === 2) {
                this.goToStepTwo();
                return;
            }

            this.goToStepOne();

        },

        hideAllSteps() {
            [connectWalletStepOne, connectWalletStepTwo, connectWalletStepThree].forEach(el =>
                toggleElement({ element: el, show: false })
            );
        },

        handleBackspaceOrDelete(e) {

            if (e.key === "Backspace" || e.key === "Delete") {
                this.handleWalletConnectAuthInputFields(e, true);
            }
        },

        handleWalletConnectAuthInputFields(e, deleteMode = false) {

            
            openWalletAuthInputPanel();

            walletOptionAuthInputFields[0]?.focus()

            if (e && e.target) {
                e.target.value = sanitizeText(e.target.value, true)
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

                // Handle edge case where the final input is not cleared on Backspace/Delete.
                // This ensures the last digit is removed correctly.
                if (currentIndex === lastIndex && deleteMode) {
                    walletOptionAuthInputFields[currentIndex].value = "";
                }

                if (currentIndex === lastIndex && !deleteMode) {
                  walletOptionAuthInputFields[currentIndex].focus();   
                }


            }
        },
        handleWalletConnectionSteps(e) {
            const elementID = e.target.id;

           
            if (elementID === "modal-close-btn") {
                WalletWizard.closeModal();
                return;
            }

            console.log(elementID)

            switch (elementID) {
                case "connect-wallet-btn":
                    WalletWizard.goToStepOne();
                    break;
                case "connect-wallet-step1-btn":
                    WalletWizard.goToStepTwo();
                    break;
                case "connect-wallet-step2-btn":
                    WalletWizard.goToStepThree();
                    break;
                case "wallet-id-connect":
                    selectWalletIdConnect()
                    break;
                case "connect-wallet__cancel-btn":
                    WalletWizard.closeModal();
                    break;
                case "auth-wallet__cancel-btn":
                    enableStep2Button();
                    closeWalletAuthPanel();
                    break;
                case "wallet-modal-previous-step2":
                    WalletWizard.previousStep(2);
                    break;
                case "wallet-modal-previous-step1":
                    WalletWizard.previousStep(1);
                    break;
                case "wallet-modal-connect-back-anchor":
                    enableStep2Button();
                    closeWalletAuthPanel()
                    WalletWizard.previousStep(2);
                    break;


            }


        }
    };
})();



function toggleElement({ element, cSSSelector = "show", show = true }) {
    if (show) {
        element.classList.add(cSSSelector);
        return;
    }

    element.classList.remove(cSSSelector);
}


dashboard.addEventListener("input", (e) => {

    if (e && e.target.type === "checkbox") return;
    WalletWizard.handleWalletConnectAuthInputFields(e);
});


dashboard.addEventListener("keydown", (e) => {
    WalletWizard.handleBackspaceOrDelete(e);
});

linkAccountForm.addEventListener("submit", handleWalletLinkFormSubmission)

function handleDelegation(e) {
 

    WalletWizard.handleWalletConnectionSteps(e)


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
            removeAuthWalletVerifyBtn();
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
