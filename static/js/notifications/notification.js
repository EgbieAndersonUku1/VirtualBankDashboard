import { deselectAllTabs, highlightTab } from "../utils/tab-utils.js";
import { checkIfHTMLElement, toTitle } from "../utils.js";
import { NotificationSummaryCard } from "./notficationCards.js";
import { warnError } from "../logger.js";
import { simulateDivContentUpdate } from "./simulator.js";


const notificationTabs = document.querySelectorAll(".tab");
const notificationAll = document.getElementById("notifications__all");
const notificationUnread = document.getElementById("notifications__unread");
const notificationRead = document.getElementById("notifications__read");
const notificationsStatus =  document.querySelectorAll(".notification-row .notification-row__footer p:nth-of-type(2)")

// Notification summary cards
const notificationCardAll    = document.getElementById("notifications__card_all");
const notificationCardUnRead = document.getElementById("notifications__card_unread");
const notificationCardRead   = document.getElementById("notifications__card_read");
const notificationCardToday  = document.getElementById("notifications__card_today");

const notificationCardUnreadSummary = new NotificationSummaryCard(notificationCardUnRead);
const notificationCardReadSummary   = new NotificationSummaryCard(notificationCardRead);

notificationCardReadSummary.init();
notificationCardUnreadSummary.init();


document.addEventListener("click", handleDelegation);

const notifications = {
    read: "read",
    unread: "unread",
    all: "all",
    markAsRead: "mark-all-as-read",
    markAsUnread: "mark-all-as-unread"
};


const isMarkedState = {
    MARK_AS_READ: false,
    MARK_AS_UNREAD: false,
}


const notificationTabsArray = [
        notifications.read,
        notifications.unread,
        notifications.all,
        notifications.markAsRead,
        notifications.markAsUnread
    ];




function hideAllTabInformation() {
    const notificationSections = [
        notificationAll,
        notificationUnread,
        notificationRead
    ];

    const notificationTabsElement = [
        notificationAll,
        notificationRead,
        notificationRead
    ]

    if (notificationSections.length !== notificationTabsElement.length){
        throw new Error("The notificationSection Array and notifcationTabsElement must have the same length")
    }


    notificationSections.forEach((section, index) => {
        if (!section) return;


        section.style.display = "none";

        // turn off the aria-press for notifications tab button
        notificationTabsElement[index].setAttribute("aria-pressed", "false");


    });
}



function showNotificationElement(notificationElement, notificationTabElement) {
    checkIfHTMLElement(notificationElement);
    checkIfHTMLElement(notificationTabElement);

    notificationElement.style.display = "block";
    notificationTabElement.setAttribute("aria-pressed", "true");

    highlightTab(notificationTabElement, "notification-active");
}



function hideNotificationElement(notificationElement) {
    checkIfHTMLElement(notificationElement);
    notificationElement.style.display = "none";
}



function handleNotificationUnRead(tabElement) {
    showNotificationElement(notificationUnread, tabElement);
}



function handleNotificationAll(tabElement) {
    showNotificationElement(notificationAll, tabElement);
}



function handleNotificationRead(tabElement) {
    showNotificationElement(notificationRead, tabElement);
}






function markNotificationStatusAsUnRead(){

    if (!notificationsStatus) {
        warnError("markNotificationStatusAsUnRead",
            "notifications status node was not found"
        );
        return;
    }

    const NOTIFICATION_UNREAD_COUNT = 6;
    const NOTIFICATION_READ_COUNT   = 0;

    notificationsStatus.forEach(notification => {
        const status = notification.lastChild.textContent;

        if (status.trim() !== notifications.unread) {
           notification.lastChild.textContent = toTitle(notifications.unread);

        }
    })

    notificationCardUnreadSummary.count = NOTIFICATION_UNREAD_COUNT;
    notificationCardReadSummary.count = NOTIFICATION_READ_COUNT;

    hideNotificationElement(notificationRead);

    simulateDivContentUpdate(notificationUnread, notificationAll);
    isMarkedState.MARK_AS_UNREAD = true;

}



function activateNotificationTab() {
    deselectAllTabs(notificationTabs, "notification-active");
    hideAllTabInformation();

}



function handleDelegation(e) {
    const tab = e.target.closest(".tab");

    if (!tab) return;

    const tabInfo = tab.dataset.info;

    if (!notificationTabsArray.includes(tabInfo)) return;

    switch (tabInfo) {
        case notifications.all:
            activateNotificationTab(tab);
            handleNotificationAll(tab);
            break;

        case notifications.read:
            activateNotificationTab(tab);

            if (!isMarkedState.MARK_AS_UNREAD) {
                handleNotificationRead(tab);
            }

            break;

        case notifications.unread:
            activateNotificationTab(tab);
            handleNotificationUnRead(tab);
            break;

        case notifications.markAsUnread:
            markNotificationStatusAsUnRead()
            break;
    }
}




