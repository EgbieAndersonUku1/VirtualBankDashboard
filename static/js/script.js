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
        handleRemoveCardButtonClick,
        } from "./walletUI.js";

import { handleAddNewCardInputFields, 
       handleNewCardCloseIcon, 
       handleCVCInputField 
      } from "./add-new-card.js";

import { handleRemoveCardWindowCloseIcon } from "./pin.js";
import { handleFundForm, handleFundCloseDivIconClick, handleFundAmountLength } from "./fund-account.js";
import { handleTransferButtonClick, 
        handleDisableMatchingTransferOption,
        handleTransferToSelectOption,
        handleTransferCardClick,
        handleTransferAmountInputField,
        handleTransferCloseIcon,
      
} from "./transfer-funds.js";

import { handleTransferCloseButton } from "./progress.js";
import { handleSidBarCardClick,
        handleCloseCardManagerButton,
        handleSideBarDeleteCard,
        handleAddFundCardButtonClick,
        handleAddCloseButtonIconClick,
        handleTransferAmountButtonClick,
       } from "./sidebarCard.js";

import { handleTransferBlock } from "./sidebarCardBlocking.js";
import { handleAddFundToCardFormButtonClick } from "./sideBarFundCard.js";
import { handleSelectAccountTransferElement, 
        handleSelectCardElement, 
        handleTransferCardFieldsDisplay, 
        handleTransferCardWindowCloseIcon, 
        handleCardTransferInputField, 
        handleCardTransferAmountFormButtonClick 
        } from "./sideBarTransfer-funds.js";
import { handlePageRefresh } from "./showOnRefresh.js";

// elements
const dashboardElement = document.getElementById("virtualbank-dashboard");


// event listeners
dashboardElement.addEventListener("click", handleEventDelegation);
dashboardElement.addEventListener("focus", handleEventDelegation);
dashboardElement.addEventListener("blur",  handleEventDelegation);
dashboardElement.addEventListener("input", handleEventDelegation);


handlePageRefresh();


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
   handleRemoveCardWindowCloseIcon(e);
   handleFundForm(e);
   handleFundCloseDivIconClick(e);
   handleFundAmountLength(e);
   handleTransferButtonClick(e);
   handleDisableMatchingTransferOption(e);
   handleTransferToSelectOption(e);
   handleTransferCardClick(e);
   handleTransferAmountInputField(e);
   handleTransferCloseButton(e);
   handleTransferCloseIcon(e);
   handleSidBarCardClick(e);
   handleCloseCardManagerButton(e);
   handleSideBarDeleteCard(e);
   handleTransferBlock(e);
   handleAddFundCardButtonClick(e);
   handleAddCloseButtonIconClick(e);
   handleAddFundCardButtonClick(e);
   handleAddFundToCardFormButtonClick(e);
   handleSelectAccountTransferElement(e);
   handleTransferAmountButtonClick(e);
   handleSelectCardElement(e);
   handleTransferCardFieldsDisplay(e);
   handleTransferCardWindowCloseIcon(e);
   handleCardTransferInputField(e);
   handleCardTransferAmountFormButtonClick(e);
}
