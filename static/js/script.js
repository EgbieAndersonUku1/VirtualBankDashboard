import { checkIfHTMLElement } from "./utils.js";
import { notificationManager } from "./notification.js";
import { toggleSpinner, showSpinnerFor } from "./utils.js";

// elements
const dashboardElement       = document.getElementById("virtualbank-dashboard");
const profileDropdownElement = document.getElementById("profile-dropdown");
const notificationDropdownWrapper = document.querySelector(".notification-dropdown")
const spinnerElement              = document.getElementById("spinner");


const run = {
    init: () => {
        validatePageElements();
    }
}

run.init();

notificationManager.setKey("notifications");
notificationManager.add("This is a test and it will be remove. Refresh the page to add more notifications");


// event listeners
dashboardElement.addEventListener("click", handleEventDelegation);
window.addEventListener('scroll', handleHideDropdownOnScroll);


function handleEventDelegation(e) {
    console.log(e.target)
    handleProfileIconClick(e);
    handleNotificationIconClick(e);
    handleMarkAsRedClick(e);
    handleDeleteLinkClick(e);
}



function handleProfileIconClick(e) {

    const PROFILE_ICON_ID = "profile-icon-img";

    if (e.target.id === PROFILE_ICON_ID ) {
        profileDropdownElement.classList.toggle("show");
    }

    // Ensure that if the user clicks outside of the dropdown, it disappears
    if (e.target.id !== PROFILE_ICON_ID && profileDropdownElement.classList.contains("show") ) {
        profileDropdownElement.classList.remove("show");
    }

}


function handleNotificationIconClick(e) {

    const NOTIFICATION_ICON_ID = "notification";
    const NOTIFICATION_BELL_ID = "notification-bell-icon";
    const NOTIFICATION_LINK_ID = "notification-link";
    const TiME_IN_MS           = 100;

    if (e.target.id === NOTIFICATION_ICON_ID  || e.target.id === NOTIFICATION_BELL_ID || e.target.id === NOTIFICATION_LINK_ID ){

        toggleSpinner(spinnerElement);
        setTimeout(() => {
            notificationDropdownWrapper.classList.toggle("show");
            notificationManager.renderNotificationsToUI();
            toggleSpinner(spinnerElement, false)
        }, TiME_IN_MS)
     
    }
}


function handleMarkAsRedClick(e) {
    const MARK_AS_READ_CLASS = "mark-as-read";

    if (e.target.classList.contains(MARK_AS_READ_CLASS)){

        notificationManager.markAsRead(e.target.dataset.id);
    }
}


function handleDeleteLinkClick(e) {
    const DELETE_CLASS = "delete";

    if (e.target.classList.contains(DELETE_CLASS)){
        showSpinnerFor(spinnerElement)
        notificationManager.deleteNotification(e.target.dataset.id);
    }
}

/**
 * Hides the dropdown menu when the user scrolls the page.
 */
function handleHideDropdownOnScroll() {
    const dropdown = document.querySelectorA('.dropdown.show');
    
    if (dropdown) {
        dropdown.classList.remove('show');
    }

    if (notificationDropdownWrapper) {
    
        notificationDropdownWrapper.remove("show");
    }
}












function validatePageElements() {
    checkIfHTMLElement(dashboardElement, "Dashboard element section");
    checkIfHTMLElement(profileDropdownElement, "Dashboard element section");
    checkIfHTMLElement(spinnerElement, "spinner element section");
}