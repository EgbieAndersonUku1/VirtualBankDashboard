import { checkIfHTMLElement } from "./utils.js";
import { notificationManager } from "./notificationManager.js";
import { toggleSpinner, showSpinnerFor, toggleScrolling } from "./utils.js";


// elements
const profileDropdownElement      = document.getElementById("profile-dropdown");
const notificationDropdownWrapper = document.querySelector(".notification-dropdown")
const spinnerElement              = document.getElementById("spinner");


const run = {
    init: () => {
        validatePageElements();
    }
}

run.init();

notificationManager.setKey("notifications");



export function handleProfileIconClick(e) {

    const PROFILE_ICON_ID = "profile-icon-img";

    if (e.target.id === PROFILE_ICON_ID ) {
        profileDropdownElement.classList.toggle("show");
    }

    // Ensure that if the user clicks outside of the dropdown, it disappears
    if (e.target.id !== PROFILE_ICON_ID && profileDropdownElement.classList.contains("show") ) {
        profileDropdownElement.classList.remove("show");
    }

}


export function handleNotificationIconClick(e) {

    const NOTIFICATION_ICON_ID = "notification";
    const NOTIFICATION_BELL_ID = "notification-bell-icon";
    const NOTIFICATION_LINK_ID = "notification-link";
    const NOTIFICATION_DIV     = "notification-div";
    const TiME_IN_MS           = 100;
    const id                   = e.target.id;
    
    const isValid = id === NOTIFICATION_ICON_ID  || id === NOTIFICATION_BELL_ID || id === NOTIFICATION_LINK_ID || id === NOTIFICATION_DIV
   
    if (isValid){

        toggleSpinner(spinnerElement);
        toggleDivState(e.target, false);
        
        setTimeout(() => {
            const status = notificationDropdownWrapper.classList.toggle("show");
            if (status) {
                notificationManager.renderNotificationsToUI();
            }
          
            toggleSpinner(spinnerElement, false)
            toggleDivState(e.target, true, false);
        }, TiME_IN_MS)
     
    }
}


function toggleDivState(divElementOrID, show = true, disable = true) {

    let div;
    try {
        checkIfHTMLElement(divElementOrID);
        div = divElementOrID;
    } catch (error) {
        console.warn(error);
        div = document.getElementById(divElementOrID);
    }
    
    if (div) {
        div.style.display       = show ? "block" : "none";
        div.style.pointerEvents = disable ? "none" : "auto";
        div.style.opacity       = disable ? "0.5" : "1";
    }
}

export function handleMarkAsReadClick(e) {
    const MARK_AS_READ_CLASS = "mark-as-read";

    if (e.target.classList.contains(MARK_AS_READ_CLASS)){
        notificationManager.markAsRead(e.target.dataset.id);
    }
}


export function handleMarkAllAsReadClick(e) {
    const MARK_AS_READ_CLASS = "mark-all-as-read-btn";

    if (e.target.classList.contains(MARK_AS_READ_CLASS)){
        showSpinnerFor(spinnerElement);
        notificationManager.markAllAsRead();
    }
}


export function handleMarkAllAsUnReadClick(e) {
    const MARK_AS_UNREAD_CLASS = "mark-all-as-unread-btn";

    if (e.target.classList.contains(MARK_AS_UNREAD_CLASS)){
        showSpinnerFor(spinnerElement);
        notificationManager.markAllAsUnRead();
    }
}



export function handleMarkAsUnreadClick(e) {
    const MARK_AS_UNREAD_CLASS = "mark-as-unread";

    if (e.target.classList.contains(MARK_AS_UNREAD_CLASS)){
        notificationManager.markAsUnRead(e.target.dataset.id);
    }
}


export function handleDeleteAllNotificationsBtnClick(e) {
    const DELETE_ALL_CLASS = "delete-all-notifications-btn";

    if (e.target.classList.contains(DELETE_ALL_CLASS)){
        showSpinnerFor(spinnerElement);
        notificationManager.deleteAllNotifications();
    }
}


export function handleDeleteLinkClick(e) {
    const DELETE_CLASS = "delete";

    if (e.target.classList.contains(DELETE_CLASS)){
        showSpinnerFor(spinnerElement);
        notificationManager.deleteNotification(e.target.dataset.id);
    }
}




// /**
//  * Hides the dropdown menu when the user scrolls the page.
//  */
export function handleHideDropdownOnScroll() {
   // Write the logic for this correct logic removes the toggle bar after
   // user scrolls. This means that the notification bar no longer shows
   // up when the user clicks on it.
   
}





function validatePageElements() {
    checkIfHTMLElement(profileDropdownElement, "Dashboard element section");
    checkIfHTMLElement(spinnerElement, "spinner element section");
}