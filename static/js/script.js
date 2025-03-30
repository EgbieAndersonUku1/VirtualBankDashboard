import { handleMobileUserInputField, 
         handleUserFirstNameInputField, 
         handleUserSurnameInputField,
         handleUserEmailInputField,
         handleUserLocationInputField,
         handleUserStateInputField,
         handleUserPostCodeInputField,
         handleProfileBtnClick,
        } from "./profile.js";

import { handleProfileIconClick, 
         handleNotificationIconClick, 
         handleMarkAsReadClick,
         handleMarkAsUnreadClick,
         handleMarkAllAsReadClick,
         handleMarkAllAsUnReadClick,
         handleDeleteLinkClick,
         handleDeleteAllNotificationsBtnClick,
         handleHideDropdownOnScroll,

        } from "./notifications.js";

import { handleWalletPin, 
        handleAddNewCard, 
        handleCardRemovalClick,
         handleRemoveCardButtonClick
         } from "./walletUI.js";

import { handleAddNewCardInputFields, 
        handleNewCardCloseIcon, 
        handleCVCInputField 
       } from "./add-new-card.js";

import { handleRemoveCloseIcon } from "./pin.js";
import { handleFundForm, handleFundCloseDivIconClick, handleFundAmountLength } from "./fund-account.js";
import { handleTransferButtonClick, 
         handleDisableMatchingTransferOption,
         handleCardOptionSelect,
         handleTransferCardClick,
         handleTransferAmount,
       
} from "./transfer-funds.js";



// elements
const dashboardElement       = document.getElementById("virtualbank-dashboard");
const cardNumberInputElement = document.getElementById("card-number");


// event listeners
dashboardElement.addEventListener("click", handleEventDelegation);
dashboardElement.addEventListener("focus", handleEventDelegation);
dashboardElement.addEventListener("blur",  handleEventDelegation);
dashboardElement.addEventListener("input", handleEventDelegation);



function handleEventDelegation(e) {
    handleProfileIconClick(e);
    handleNotificationIconClick(e);
    handleMarkAsReadClick(e);
    handleMarkAsUnreadClick(e);
    handleDeleteLinkClick(e);
    handleDeleteAllNotificationsBtnClick(e);
    handleMarkAllAsReadClick(e);
    handleMarkAllAsUnReadClick(e);
    handleMobileUserInputField(e);
    handleUserFirstNameInputField(e);
    handleUserSurnameInputField(e);
    handleUserEmailInputField(e);
    handleUserLocationInputField(e);
    handleUserStateInputField(e);
    handleUserPostCodeInputField(e);
    handleProfileBtnClick(e);
    handleWalletPin(e);
    handleAddNewCard(e);
    handleAddNewCardInputFields(e);
    handleNewCardCloseIcon(e);
    handleCVCInputField(e);
    handleCardRemovalClick(e);
    handleRemoveCardButtonClick(e);
    handleRemoveCloseIcon(e);
    handleFundForm(e);
    handleFundCloseDivIconClick(e);
    handleFundAmountLength(e);
    handleTransferButtonClick(e);
    handleDisableMatchingTransferOption(e);
    handleCardOptionSelect(e);
    handleTransferCardClick(e);
    handleTransferAmount(e);
  
        
}







