const dashboardProfileElement = document.getElementById("dashboard-profile");
const dropdownMenu            = document.getElementById("dashboard__container__dropdown-menu");

const dashboard               = document.getElementById("dashboard")
const connectWalletModal      = document.getElementById("connect-wallet-modal")
const connectWalletBtn        = document.getElementById("connect-wallet-btn");
const connectWalletStepOne    = document.getElementById("connect-wallet-modal__step-one");
const connectWalletStepTwo    = document.getElementById("connect-wallet-modal__step-two");
const connectWalletStepThree  = document.getElementById("connect-wallet-modal__step-three");
const walletOptionChoices     = document.querySelectorAll(".choose-wallet-option");
console.log(walletOptionChoices)




// TODO add one time checker here for one time static element check

dashboardProfileElement.addEventListener("click", handleDropDownMenu);

dashboard.addEventListener("click",  handleDelegation)

console.log(connectWalletModal)

function handleDropDownMenu(e) {
    const profileImg = e.target.closest("img");
    if (profileImg) {
        dropdownMenu.classList.toggle("show")
    } 
}



function handleDelegation(e) {

  WalletWizard.handleWalletConnectionSteps(e)
  

}



/**
 * WalletWizard handles the multi-step connect wallet modal flow.
 * Steps can be navigated dynamically with next/back buttons.
 * It also manages showing/hiding the modal and individual steps.
 */
const WalletWizard = (() => {

    // Private function (not accessible from outside)
    function disableWalletOptionChoices() {
        if (!Array.isArray(walletOptionChoices)) {
            throw new Error(`Expected an array of elements but got object with type ${typeof walletOptionChoices}`);
        }

        walletOptionChoices.forEach((element) => {
            element.classList.remove("choose-wallet-option");
        });
    }

    function selectWalletIdConnect(e) {
        
       // to be added
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
            toggleElement({element: connectWalletModal, show: true});
            this.hideAllSteps();
        },

        closeModal() {
            toggleElement({element: connectWalletModal, show: false});
            this.hideAllSteps();
        },

        showStep(step) {
            toggleElement({element: step, show:true});
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
                toggleElement({element: el, show:false})
            );
        },

        handleWalletConnectionSteps(e) {
            const elementID = e.target.id;

            if (elementID === "modal-close-btn") {
                WalletWizard.closeModal();
                return;
            }

            switch(elementID) {
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
                case "wallet-modal-previous-step2":
                    WalletWizard.previousStep(2);
                    break;
                case "wallet-modal-previous-step1":
                    WalletWizard.previousStep(1);
                    break;
                    
            }

            
        }
    };
})();



function toggleElement({element, cSSSelector = "show", show = true}) {
    if (show) {
        element.classList.add(cSSSelector);
        return;
    }

    element.classList.remove(cSSSelector);
}

