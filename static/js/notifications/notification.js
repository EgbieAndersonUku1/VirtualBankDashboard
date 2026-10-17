import { deselectAllTabs, highlightTab } from "../utils/tab-utils.js";
import { checkIfHTMLElement } from "../utils.js";
import { NotificationSummaryCard } from "./notficationCards.js";

const notificationTabs = document.querySelectorAll(".tab");
const notificationAll = document.getElementById("notifications__all");
const notificationUnread = document.getElementById("notifications__unread");
const notificationRead = document.getElementById("notifications__read");

// Notification summary cards
const notificationCardAll    = document.getElementById("notifications__card_all");
const notificationCardUnRead = document.getElementById("notifications__card_unread");
const notificationCardRead   = document.getElementById("notifications__card_read");
const notificationCardToday  = document.getElementById("notifications__card_today");


document.addEventListener("click", handleDelegation);

const notifications = {
    read: "read",
    unread: "unread",
    all: "all",
    markAsRead: "mark-all-as-read",
    markAsUnread: "mark-all-as-unread"
};

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



// quick test to see notificationSummaryCard it works  for the individual cards will delete afterwards

const notificationAllSummaryCard     = new NotificationSummaryCard(notificationCardAll);
const notificationUnReadSummaryCard  = new NotificationSummaryCard(notificationCardUnRead);
const notificationReadSummaryCard    = new NotificationSummaryCard(notificationCardRead);
const notificationTodaySummaryCard   = new NotificationSummaryCard(notificationCardToday)


console.log(notificationCardUnRead)

notificationAllSummaryCard.init();
notificationUnReadSummaryCard.init();
notificationReadSummaryCard.init();
notificationTodaySummaryCard.init();


console.log("Notification all card")
console.log("----------------------------------");
console.log(notificationAllSummaryCard.title);
console.log(notificationAllSummaryCard.image);
console.log(notificationAllSummaryCard.notificationCount);
console.log(notificationAllSummaryCard.subtitle);


console.log("Notification unread card")
console.log("----------------------------------");
console.log(notificationUnReadSummaryCard.title);
console.log(notificationUnReadSummaryCard.image);
console.log(notificationUnReadSummaryCard.notificationCount);
console.log(notificationUnReadSummaryCard.subtitle);


console.log("Notification read card")
console.log("----------------------------------");
console.log(notificationReadSummaryCard.title);
console.log(notificationReadSummaryCard.image);
console.log(notificationReadSummaryCard.notificationCount);
console.log(notificationReadSummaryCard.subtitle);



console.log("Notification today card")
console.log(notificationTodaySummaryCard.title);
console.log(notificationTodaySummaryCard.image);
console.log(notificationTodaySummaryCard.notificationCount);
console.log(notificationTodaySummaryCard.subtitle);
