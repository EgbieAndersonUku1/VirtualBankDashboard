import { deselectAllTabs, highlightTab } from "../utils/tab-utils.js";
import { checkIfHTMLElement } from "../utils.js";

const notificationTabs = document.querySelectorAll(".tab");
const notificationAll = document.getElementById("notifications__all");
const notificationUnread = document.getElementById("notifications__unread");
const notificationRead = document.getElementById("notifications__read");

document.addEventListener("click", handleDelegation);

const notifications = {
    read: "read",
    unread: "unread",
    all: "all",
    markAsRead: "mark-all-as-read",
    markAsUnread: "mark-all-as-unread"
};


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


function handleNotificationUnRead(tabElement) {
    showNotificationElement(notificationUnread, tabElement);
}


function handleNotificationAll(tabElement) {
    showNotificationElement(notificationAll, tabElement);
}


function handleNotificationRead(tabElement) {
    showNotificationElement(notificationRead, tabElement);
}


function handleDelegation(e) {
    const tab = e.target.closest(".tab");

    if (!tab) return;

    const tabInfo = tab.dataset.info;

    const notificationTabsArray = [
        notifications.read,
        notifications.unread,
        notifications.all,
        notifications.markAsRead,
        notifications.markAsUnread
    ];

    if (!notificationTabsArray.includes(tabInfo)) return;

    deselectAllTabs(notificationTabs, "notification-active");
    hideAllTabInformation();

    switch (tabInfo) {
        case notifications.all:
            handleNotificationAll(tab);
            break;

        case notifications.read:
            handleNotificationRead(tab);
            break;

        case notifications.unread:
            handleNotificationUnRead(tab);
            break;
    }
}
