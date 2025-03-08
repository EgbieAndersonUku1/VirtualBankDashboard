import { setLocalStorage, removeFromLocalStorage, getLocalStorage } from "./db.js"
import { generateRandomID, checkIfHTMLElement, findByIndex } from "./utils.js"


const notificationElement = document.getElementById("notification");
const notificationDropdownWrapper = document.querySelector(".notification-dropdown .wrapper")
const noNotificationDiv           = document.getElementById("no-notification")

validatePageElements();



/**
 * Manages user notifications, including storing, retrieving, and rendering notifications.
 * Notifications are stored in local storage and displayed in the UI.
 *
 * Methods:
 * - setKey(notificationKey): Sets the key used for local storage.
 * - add(notification): Adds a new notification.
 * - getNotifications(unread=true): Retrieves notifications (filtered by unread status).
 * - markAsRead(id): Marks a notification as read.
 * - deleteNotification(id): Deletes a notification.
 * - renderNotificationsToUI(): Renders notifications in the UI.
 * - updateNotificationBadgeIcon(count): Updates the notification badge.
 *
 * Private Methods:
 * - _createNotification(notification): Creates a notification object.
 * - _save(): Saves notifications to local storage.
 * - _filterNotificationByUnread(unread): Filters notifications by unread status.
 * - _createSingleNotificationDiv(notification): Creates a notification UI element.
 * - _createAnchorTag(className, datasetID): Creates an anchor element.
 * - _createSmallTag(smallTagClassList, textContent, dataset): Creates a small element.
 */
export const notificationManager = {

    _NOTIFICATION_KEY: null,
    _notifications: null,  // create a cache

     /**
     * Adds a new notification to local storage.
     * @param {string} notification - The notification message to add.
     * @throws {Error} If the notification key is not set.
     */
    add: (notification) => {

        if (notificationManager._NOTIFICATION_KEY === null) {
            throw new Error("The notification key is not set. Please set before carrying on.");
        }

        let notificationsArray = getLocalStorage(notificationManager._NOTIFICATION_KEY);

        if (!notificationsArray || !Array.isArray(notificationsArray)) {
            notificationsArray = []; 
        } 
        
        const notificationObject = notificationManager._createNotification(notification);
          
        notificationsArray.push(notificationObject);
        notificationManager._notifications = notificationsArray;
        notificationManager._save();

    },

    /**
     * Creates a notification object.
     * @param {string} notification - The notification message.
     * @returns {Object} A notification object with an ID, message, and unread status.
     */
    _createNotification: (notification) => {
        const notificationObject = {
            id: generateRandomID(),
            notification: notification,
            unread: true,
        };

        return notificationObject;
    },

    /**
     * Saves the current notifications to local storage and updates the notification badge.
     * @returns {boolean} True if saved successfully, otherwise false.
     */
    _save:() => {
        try {

            setLocalStorage(notificationManager._NOTIFICATION_KEY, notificationManager._notifications);
            
            const unreadNotifications = notificationManager.getNotifications();

            notificationManager.updateNotificationBadgeIcon(unreadNotifications.length);
            
            return true;

        } catch (error) {
            console.error(error);
            return false;
        }
    },

    /**
     * Sets the notification key used for local storage.
     * @param {string} [notificationKey="notification"] - The key for storing notifications.
     */
    setKey: (notificationKey = "notification") => {  
        notificationManager._NOTIFICATION_KEY = notificationKey;
    },

     /**
     * Retrieves notifications from local storage if the cache is null.
     * @param {boolean} [unread=true] - Whether to retrieve only unread notifications.
     * @returns {Array} List of notifications.
     */
    getNotifications: (unread = true) => {
        if (notificationManager._notifications === null) { 
            try {
                const notificationsArray = getLocalStorage(notificationManager._NOTIFICATION_KEY) || [];
                if (!Array.isArray(notificationsArray)) {
                    throw new Error(`Expected an array but got ${typeof notificationsArray}`);
                }
                notificationManager._notifications = notificationsArray;
            } catch (error) {
                console.error(error.message);
                return [];
            }
        }
    
        return notificationManager._filterNotificationByUnread(unread);
    },
    
    /**
     * Filters notifications by unread status.
     * @param {boolean} unread - Whether to return only unread notifications.
     * @returns {Array} Filtered list of notifications.
     */
    _filterNotificationByUnread: (unread=true) => {
        return notificationManager._notifications.filter((notification) => notification.unread === unread);
    },


    /**
     * Updates the notification badge icon with the count of unread notifications.
     * @param {number} count - The number of unread notifications.
     * @throws {Error} If count is not an integer.
     */
    updateNotificationBadgeIcon: (count=0) => {
        if (!Number.isInteger(count)) {
            throw new Error(`The count parameter must be a number. Expected integer but got ${typeof count} `);
        }

        notificationElement.textContent = count;
        notificationElement.dataset.count  = count;
    },


    /**
     * Marks a notification as read by its ID. (To be implemented)
     * @param {string} id - The notification ID.
     */
    markAsRead: (id) => {

        const NOT_FOUND      = -1;
        const notificationId = findByIndex(parseInt(id), notificationManager._notifications);
        
        if (notificationId === NOT_FOUND) {
            console.warn(`Notification with ID ${id} not found.`);
            return NOT_FOUND;
        }
        
        notificationManager._notifications[notificationId].unread =  false;
        notificationManager._save();
        notificationManager.renderNotificationsToUI();
        return true;
       
    },

    /**
     * Deletes a notification by its ID. (To be implemented)
     * @param {string} id - The notification ID.
     */
    deleteNotification: (id) => {
        const NOT_FOUND      = -1;
        const notificationId = findByIndex(parseInt(id), notificationManager._notifications);

        if (notificationId === NOT_FOUND) {
            console.warn(`Notification with ID ${id} not found.`);
            return NOT_FOUND;
        }
        
        notificationManager._notifications = notificationManager._notifications.filter((notification) => notification.id != id)
        notificationManager._save();
        notificationManager.renderNotificationsToUI();
        return true;
    },

    /**
     * Renders notifications in the UI.
     */
    renderNotificationsToUI: () => {
     
        if (!notificationManager._notifications) {
            notificationManager.getNotifications();   
        }

        if (notificationManager._notifications.length === 0) {
            noNotificationDiv.style.display = "block";
            notificationDropdownWrapper.style.display = "none"
            return;

        }

        noNotificationDiv.style.display = "none";
        const fragment = document.createDocumentFragment();
        
        notificationManager._notifications.forEach(( notification ) => {
            const notificationDiv = notificationManager._createSingleNotificationDiv(notification);
            fragment.appendChild(notificationDiv)
        })

        notificationDropdownWrapper.textContent = "";
        notificationDropdownWrapper.appendChild(fragment);


    },

    /**
     * Creates a notification element for the UI.
     * @param {Object} notification - Notification object.
     * @returns {HTMLElement} Notification div element.
     */
    _createSingleNotificationDiv: (notification) => {

        const mainNotificationDiv   = document.createElement("div");
        mainNotificationDiv.id      = notification.id;
        mainNotificationDiv.classList.add("notification-msg", "lightbox-display");

        // id anchor
        const notifcationIDAnchorTag         = notificationManager._createAnchorTag("notification-id");
        const notificationIDSmallTag         = notificationManager._createSmallTag(["steel-blue"], `#${notification.id}`);
        
        // notification message
        const notificationAlertAnchorTag     = notificationManager._createAnchorTag("notification-alert");
        const notificationAlertSmallTag      = notificationManager._createSmallTag([], `${notification.notification}`);

        // mark as red link
        const notificationMarkAsRedAnchorTag = notificationManager._createAnchorTag(["mark-as-read", "action"], notification.id);
        const isReadTextContent              = notification.unread === true ? "mark as read": "read";
        const isReadClass                    = notification.unread === true ? "red" : "green";
        const notificationMarkAsRedSmallTag  = notificationManager._createSmallTag([isReadClass, "mark-as-read"], isReadTextContent, notification.id);        

        // mark as delete link
        const notificationDeleteAnchorTag    = notificationManager._createAnchorTag(["delete", "action"], notification.id);
        const notificationDeleteSmallTag     = notificationManager._createSmallTag(["red", "delete"], "delete", notification.id); 

        // append small tags to anchor tags
        notifcationIDAnchorTag.appendChild(notificationIDSmallTag);
        notificationAlertAnchorTag.appendChild(notificationAlertSmallTag);
        notificationMarkAsRedAnchorTag.appendChild(notificationMarkAsRedSmallTag);
        notificationDeleteAnchorTag.appendChild(notificationDeleteSmallTag);
        
        // append anchor tags to notification divs
        mainNotificationDiv.appendChild(notifcationIDAnchorTag);
        mainNotificationDiv.appendChild(notificationAlertAnchorTag);
        mainNotificationDiv.appendChild(notificationMarkAsRedAnchorTag);
        mainNotificationDiv.appendChild(notificationDeleteAnchorTag);

        return mainNotificationDiv;
        

    },

    /**
     * Creates an anchor tag.
     * @param {string|Array} className - CSS class names.
     * @param {string|null} datasetID - Optional dataset ID.
     * @returns {HTMLAnchorElement} Created anchor element.
     */
    _createAnchorTag: (className, datasetID  = null) => {
        const anchorTag  = document.createElement("a");
        anchorTag.href   = "#";

        if (datasetID !== null) {
            anchorTag.dataset.id = datasetID;
        }
       
        anchorTag.className  = className;
        return anchorTag;

    },

    /**
     * Creates a small tag.
     * @param {Array} smallTagClassList - List of CSS class names.
     * @param {string} textContent - Text content of the small tag.
     * @param {string} dataset - Optional dataset ID.
     * @returns {HTMLElement} Created small tag element.
     */
    _createSmallTag: (smallTagClassList=[], textContent='', dataset='') => {
        
        if (!Array.isArray(smallTagClassList)) {
            throw new Error(`Expected a list of class names but got type ${typeof smallTagClassList}, ${smallTagClassList}`);
            
        }
       
        const smallTag       = document.createElement("small");
        smallTag.dataset.id  = dataset ?? dataset;
        smallTag.textContent = textContent;
        smallTag.classList.add(...smallTagClassList);
        
        return smallTag;
    },
    
    
}


/**
 * Validates required page elements.
 */
function validatePageElements() {
    checkIfHTMLElement(notificationElement, "The notification badge");
    checkIfHTMLElement(notificationDropdownWrapper, "The dropdown container");
    checkIfHTMLElement(noNotificationDiv, "The empty notifcation div");
}