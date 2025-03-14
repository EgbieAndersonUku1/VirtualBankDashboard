import { setLocalStorage, getLocalStorage } from "./db.js"
import { generateRandomID, checkIfHTMLElement, findByIndex } from "./utils.js"
import { logError } from "./logger.js";


const notificationElement         = document.getElementById("notification");
const notificationDropdownWrapper = document.querySelector(".notification-dropdown .wrapper");
const noNotificationDiv           = document.getElementById("no-notification");
const notificationBtns            = document.getElementById("notification-btns");

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
 * - markAsUnread(id): Marks a notification as unread
 * - deleteNotification(id): Deletes a notification.
 * - renderNotificationsToUI(): Renders notifications in the UI.
 * - updateNotificationBadgeIcon(count): Updates the notification badge.
 * - markAllAsRead(): Marks all notification as read
 * - markAllAsUnread(): Marks all notification as unread
 * - deleteAllNotifications(): Deletes all notifications
 * - getNumOfUnreadMessage(): Returns the number of unread notifications
 * - getNumOfReadMessage(): Returns the number of read notifications
 * - renderUnReadMessagesCount(): Renders the number of unread messages as number in the UI page
 * 
 * Private Methods:
 * - _createNotification(notification): Creates a notification object.
 * - _save(): Saves notifications to local storage.
 * - _filterNotificationByReadStatus(unread): Filters notifications by read status default unread status.
 * - _createSingleNotificationDiv(notification): Creates a notification UI element.
 * - _createAnchorTag(className, datasetID): Creates an anchor element.
 * - _createSmallTag(smallTagClassList, textContent, dataset): Creates a small element.
 * - _getNotificationIndexOrWarn(id): Checks for a given notification index based on the id
 * - _ensureNotificationsLoaded(): Ensures that the notifications are fully loaded
 * - _createNotificationsFragment(): Creates a DocumentFragment containing all notifications.
 * - _isNoNotifications(): Checks if there are no notifications available.
 * - _handleNoNotifications(): Handles the scenario where there are no notifications to display
 * -  _toggleNotificationDropdown(show): toggles a notification dropdown div  
 * - _updateReadCount():  Updates the unread and read message count.
 */
export const notificationManager = {

    _NOTIFICATION_KEY: null,
    _notifications: null,  // create a cache
    _NOT_FOUND: -1,
    _UNREAD: 0,
    _READ: 0,

    /**
     * Sets the notification key used for local storage.
     * @param {string} [notificationKey="notification"] - The key for storing notifications.
     */
     setKey: (notificationKey = "notification") => {  
        notificationManager._NOTIFICATION_KEY = notificationKey;
    },


     /**
     * Adds a new notification to local storage.
     * @param {string} notification - The notification message to add.
     * @sdthrows {Error} If the notification key is not set.
     */
    add: (notification) => {

        if (notificationManager._NOTIFICATION_KEY === null) {
            const error = "The notification key is not set. Please set before carrying on.";
            throw new Error(error);
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
     * Retrieves notifications from local storage if the cache is null.
     * @param {boolean} [unread=true] - Whether to retrieve only unread notifications.
     * @returns {Array} List of notifications.
     */
    getNotifications: (unread = true) => {
        if (notificationManager._notifications === null) { 
            try {
                const notificationsArray           = getLocalStorage(notificationManager._NOTIFICATION_KEY) || [];
                notificationManager._notifications = notificationsArray;
            } catch (error) {
                logError("getNotifications", error);
                return [];
            }
        }
    
        return notificationManager._filterNotificationByReadStatus(unread);
    },
    
    /**
     * Filters notifications by read status.
     * @param {boolean} unread - Whether to return only unread notifications.
     * @returns {Array} Filtered list of notifications.
     */
    _filterNotificationByReadStatus: (unread=true) => {
        return notificationManager._notifications.filter((notification) => notification.unread === unread);
    },

    /**
     * Updates the notification badge icon with the count of unread notifications.
     * @param {number} count - The number of unread notifications.
     * @throws {Error} If count is not an integer.
     */
    updateNotificationBadgeIcon: (count=0) => {

        if (!Number.isInteger(count)) {
            const error = `The count parameter must be a number. Expected integer but got ${typeof count} `;
            throw new Error(error);
        }

        notificationElement.textContent    = count;
        notificationElement.dataset.count  = count;
    },

    /**
     * Marks all notification as read 
     */
      markAllAsRead: () => {

        notificationManager._ensureNotificationsLoaded();

        notificationManager._notifications.forEach((notifcation) => {
            if (notifcation.unread) {
                notifcation.unread = false;
            }
           
        })
        notificationManager._save();
        notificationManager.renderNotificationsToUI();

     },

    /**
     * Marks a notification as read by its ID.
     * @param {string} id - The notification ID.
     */
    markAsRead: (id) => {
       return notificationManager._setReadStatus(id, false);
    },


    /**
     * Marks all notification as unread 
     */
      markAllAsUnRead: () => {
       
        notificationManager._ensureNotificationsLoaded();

        notificationManager._notifications.forEach((notifcation) => {
            if (!notifcation.unread) {
                notifcation.unread = true;
            }
          
        })
        notificationManager._save();
        notificationManager.renderNotificationsToUI();

     },

    /**
     * Marks a notification as read by its ID. (To be implemented)
     * @param {string} id - The notification ID.
     */
    markAsUnRead: (id) => {
        return notificationManager._setReadStatus(id, true);
    },

    /**
     * A helper method that changes the status of a notification to either read or unread.
     * @param {*} id - The notification ID.
     * @param {*} unReadSatus - A boolean value to set the notification to. A boolean value of `true` means the notification is unread
     *                          and `false` means the notification is read.
     * @returns 
     */
    _setReadStatus: (id, unReadSatus) => {
        if (typeof unReadSatus != "boolean") {
            const error = `Expected a boolean value of either true or false but got unexpected value ${typeof unReadSatus}`;
            throw new Error(error);
        }

        const notificationIndex = notificationManager._getNotificationIndexOrWarn(id);

        if (notificationIndex === notificationManager._NOT_FOUND) {
            return notificationIndex; // -1
        };
        
        notificationManager._notifications[notificationIndex].unread = unReadSatus;
        notificationManager._save();
        notificationManager.renderNotificationsToUI();
        return true;
    },

    /**
     * Deletes a notification by its ID.
     * @param {string} id - The notification ID.
     */
    deleteNotification: (id) => {
       
        const notificationIndex = notificationManager._getNotificationIndexOrWarn(id);

        if (notificationIndex === notificationManager._NOT_FOUND) {
            return notificationIndex; // -1
        };
        
        notificationManager._notifications = notificationManager._notifications.filter((notification) => notification.id != id)
        notificationManager._save();
        notificationManager.renderNotificationsToUI();
        return true;
    },

     /**
     * Deletes all notifications
     */
     deleteAllNotifications: () => {

        const ZERO_NOTIFICATIONS           = 0;
        notificationManager._notifications = [];
        notificationManager._save();
        notificationManager.updateNotificationBadgeIcon(ZERO_NOTIFICATIONS);
        notificationManager.renderNotificationsToUI();
        return true;
    },

    /**
    * Renders the notifications to the UI by either displaying the notifications
    * or showing a "no notifications" message if there are none.
    */
    renderNotificationsToUI: () => {

        notificationManager._ensureNotificationsLoaded();

        if (notificationManager._isNoNotifications()) {
            notificationManager._handleNoNotifications();
            return;
        }
        try {
            
            const fragment = notificationManager._createNotificationFragment();
            notificationManager._displayNotifications(fragment);
            notificationManager.renderUnReadMessagesCount();
        } catch (error) {
            logError("renderNotificationsToUI", error)
            return;   
            
        }

    },

    /**
     * Creates a DocumentFragment containing all notifications.
     * @returns {DocumentFragment} - A fragment containing the notification elements.
     */
    _createNotificationFragment: () => {
        const fragment = document.createDocumentFragment();
        try {
            notificationManager._notifications.forEach((notification) => {
                const notificationDiv = notificationManager._createSingleNotificationDiv(notification);
                fragment.insertBefore(notificationDiv, fragment.firstChild);
            });
        } catch (error) {
            logError("_createNotificationFragment", error)
        }
        return fragment;
    },

    /**
     * Checks if there are no notifications available.
     * @returns {boolean} - Returns true if there are no notifications, false otherwise.
     */
    _isNoNotifications: () => {
        return notificationManager._notifications.length === 0;
    },

    /**
     * Handles the scenario where there are no notifications to display by 
     * showing the appropriate UI elements and hiding others.
     */
    _handleNoNotifications: () => {
        notificationManager._toggleNotificationDropdown(false);
    },

    /**
     * Displays the notifications by appending them to the notification dropdown wrapper.
     * @param {DocumentFragment} fragment - The fragment containing the notifications to display.
     */
    _displayNotifications: (fragment) => {

        try {
            notificationManager._toggleNotificationDropdown(true);
            notificationDropdownWrapper.textContent = "";
    
            if (!(fragment instanceof DocumentFragment)) {
                const error = "Error: 'fragment' is not a valid DocumentFragment.";
                logError("_displayNotifications", error);
                return;
            }
    
            notificationDropdownWrapper.appendChild(fragment);
        } catch (error) {
            const errorMsg = `An error occurred trying to display the notifications: ${error}`;
            logError("_displayNotificatons", errorMsg);
        }
      
    },

    /**
     * Toggles between showing a notification dropdown or not. If value of `show` is
     * true, it displays the dropdown and if false hides the dropdown.
     * @param {*} show A bool value that determines whether the notification dropdown
     * is shown.
     */
    _toggleNotificationDropdown(show) {
        noNotificationDiv.style.display           = show ? "none" : "block";
        notificationDropdownWrapper.style.display = show ? "block" : "none";
        notificationBtns.style.display            = show ? "block" : "none";
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
        const isReadTextContent              = notification.unread ? "mark as read": "mark as unread";
        const isReadClass                    = notification.unread ? "red" : "green";
        const markAsClass                    = notification.unread ? "mark-as-read" : "mark-as-unread";
        const notificationMarkAsRedSmallTag  = notificationManager._createSmallTag([isReadClass, markAsClass], isReadTextContent, notification.id);        

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
            const error = `Expected a list of class names but got type ${typeof smallTagClassList}, ${smallTagClassList}`;
            logError("_createSmallTag", error)
            throw new Error(error);
            
        }
       
        const smallTag       = document.createElement("small");
        smallTag.dataset.id  = dataset ?? dataset;
        smallTag.textContent = textContent;
        smallTag.classList.add(...smallTagClassList);
        
        return smallTag;
    },

    /**
     * Retrieves a notification index based on ID by searching for it in the given notifications list.
     * If the notification is not found, a warning is logged and NOT_FOUND is returned.
     *
     * @param {string|number} id - The ID of the notification index to find.
     * @returns {number} The index of the notification if found, otherwise NOT_FOUND.
     */
      _getNotificationIndexOrWarn: (id) => {
        const notificationIndex = findByIndex(parseInt(id), notificationManager._notifications);
        
        if (notificationIndex === notificationManager._NOT_FOUND) {
            console.warn(`Notification with ID ${id} not found in "_getNotificationIndexOrWarn".`);
            return notificationManager._NOT_FOUND;
        }

        return notificationIndex
    },
    
    /**
     * Ensures that notifications are loaded.
     * If the notifications are not yet initialized (null),
     * it triggers the retrieval of notifications.
     */
    _ensureNotificationsLoaded: () => {
        if (notificationManager._notifications === null) {
            notificationManager.getNotifications();
        }
    },

    /**
     * Returns the number of unread messages as an integer.
     * 
     * @returns The number of unread messages
     */
    getNumOfUnreadMessage: () => {

       if (notificationManager._UNREAD === 0) {
        notificationManager._updateReadCount();
       }
       return notificationManager._UNREAD;
    },

    /**
     * Returns the number of read messages as integer.
     * 
     * @returns The number of read messages
     */
    getNumOfReadMessage: () => {
        if (notificationManager._READ === 0) {
            notificationManager._updateReadCount();
        }
      
        return notificationManager._READ;
     },


     /**
      * Renders the number of unread messages as number in the UI page
      */
     renderUnReadMessagesCount: () => {
        if (notificationManager._UNREAD === 0) {
            notificationManager._updateReadCount();
        }
      
        notificationManager.updateNotificationBadgeIcon(notificationManager.getNumOfUnreadMessage());
     },

     /**
      * Updates the unread and read message count.
      */
    _updateReadCount: () => {
        notificationManager._ensureNotificationsLoaded();

        let unRead = 0;
        let read   = 0;

        notificationManager._notifications.forEach((notifcation) => {
            if (notifcation.unread) {
                unRead += 1;
            } else {
                read += 1;
            }
        })
        notificationManager._UNREAD = unRead;
        notificationManager._READ   = read;

    },

     /**
     * Saves the current notifications to local storage and updates the notification badge.
     * @returns {boolean} True if saved successfully, otherwise false.
     */
     _save:() => {
        try {

            setLocalStorage(notificationManager._NOTIFICATION_KEY, notificationManager._notifications);
            notificationManager._updateReadCount();

            const unReadNotificationCount = notificationManager.getNumOfUnreadMessage()
            notificationManager.updateNotificationBadgeIcon(unReadNotificationCount);
            return true;

        } catch (error) {
            logError("_save", "An error occured trying to save the notifications: " + error.message);
            return false;
        }
    },

    
}


/**
 * Validates required page elements.
 */
function validatePageElements() {
    checkIfHTMLElement(notificationElement, "The notification badge");
    checkIfHTMLElement(notificationDropdownWrapper, "The dropdown container");
    checkIfHTMLElement(noNotificationDiv, "The empty notifcation div");
    checkIfHTMLElement(notificationBtns, "The notification btns")
}