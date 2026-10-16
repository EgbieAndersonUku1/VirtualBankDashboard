import { deselectAllTabs, highlightTab } from "../utils/tab-utils.js";
import { checkIfHTMLElement } from "../utils.js";

const notificationTabs    = document.querySelectorAll(".tab");
const notificationAll     = document.getElementById("notifications__all");
const notificationUnread  = document.getElementById("notifications__unread");
const notificationRead    = document.getElementById("notifications__read");


document.addEventListener("click", handleDelegation);


const notifications = {
    read: "read",
    unread: "unread",
    all: "all",
    markAsRead: "mark-all-as-read",
    markAsUnread: "mark-all-as-unread"
}


function hideAllTabInformation() {
    const notifications = [notificationAll, notificationUnread];

    notifications.forEach(notification => {
        notification.style.display = "none";
        notification.setAttribute("aria-pressed", "false");
    })
}


function showNotificationElement(notificationElement, notificationTabElement) {
    checkIfHTMLElement(notificationElement);
    checkIfHTMLElement(notificationTabElement);

    notificationElement.style.display = "block";
    notificationElement.setAttribute("aria-pressed", true);
    highlightTab(notificationTabElement, "notification-active");

}

function handleNotificationUnRead(tabElement) {
   showNotificationElement(notificationUnread, tabElement);
}


function handleNotificationAll(tabElement) {
    showNotificationElement(notificationAll, tabElement )

}



function handleDelegation(e) {

   const tabInfo =  e.target.dataset.info;

   const notificationsArray = [
        notifications.read,
        notifications.unread,
        notifications.all,
        notifications.markAsRead,
        notifications.markAsUnread
    ];

    if (!notificationsArray.includes(tabInfo)) return;

    const tab = e.target;
    deselectAllTabs(notificationTabs, "notification-active");

    hideAllTabInformation();

    switch(tabInfo) {


        case notifications.unread:
            handleNotificationUnRead(tab);
            break;

        case notifications.all:
            handleNotificationAll(tab);
            break;

   }


}
