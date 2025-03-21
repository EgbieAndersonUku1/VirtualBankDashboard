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

import { handleWalletPin } from "./walletUI.js";

// elements
const dashboardElement  = document.getElementById("virtualbank-dashboard");


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
        
}







