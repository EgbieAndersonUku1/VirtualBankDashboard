import { logError } from "./logger.js";
import { checkIfHTMLElement } from "./utils.js";



/**
 * Messages class
 *
 * A modular and testable utility for managing status messages in the DOM.
 *
 * Dependencies:
 *   - logError (function): Required. Used to log internal errors.
 *   - checkIfHTMLElement (function): Used to validate DOM elements.
 *
 * Usage:
 *   import { Messages } from "./Messages";
 *   import { logError } from "./logger";
 *   import { checkIfHTMLElement } from "./utils";
 *   import { MessageState } from "./constants";
 *
 *   const messages = new Messages();
 *   messages.setDefaultContainer(document.getElementById("global-msg"));
 *   messages.addMessage("Welcome!", {
 *     id: "welcome-msg",
 *     type: MessageState.SUCCESS,
 *     centerMsg: true
 *   });
 *
 * Public Methods:
 *   - setDefaultContainer(element): Sets the fallback container for messages.
 *   - registerContainer(name, element): Registers a named container.
 *   - getMessageContainer(name): Retrieves a registered container or the default.
 *   - addMessage(message, options): Adds a new message to a container.
 *       - options = {
 *           id: string (optional) – Unique ID for the message element.
 *           containerName: string (optional) – Name of container to use.
 *           centerMsg: boolean (default: true) – Whether to center the message.
 *           isError: boolean (default: false) – Apply red styling if true.
 *         }
 *   - hideMessage(id): Hides a message by ID (without removing it).
 *   - showMessage(id): Show a message by its ID.
 *   - updateMessage(id, newText, success): Updates the content of a message by ID.
 *   - hideAllMessagesOfType(className): Hides all elements with a class.
 *
 * Constants:
 *   Use MessageState to set the message type:
 *     - MessageState.ERROR → red
 *     - MessageState.INFO → blue
 *     - MessageState.SUCCESS → green
 */
export class MessageHandler {

    constructor() {
        this._defaultContainer = null;
        this._namedContainers  = {};
        this._cache            = {}; // Cache: { id: { element, type, container } }
    }
   
    getDefaultMsgContainer() {
        return this._defaultContainer;
    }

    getMessageContainer(containerName) {
        const hasContainer = this._namedContainers.hasOwnProperty(containerName);
        if (!hasContainer) return null;
        return this._namedContainers[containerName];
    }

    setDefaultMessageContainer(element) {

        if (!checkIfHTMLElement(element, "The container that will contain the messages")) {
            return;
        }

        this._defaultContainer = element;
        this._defaultContainer.setAttribute("role", "alert");
        this._defaultContainer.setAttribute("aria-live", "assertive");
    }

    registerContainer(containerName, element) {

        if (typeof containerName !== "string") {
            logError("registerContainer", `The containerName must be a string. Expected a string but got ${typeof containerName}`)
        }
        if (!checkIfHTMLElement(element, containerName)) {
            return;
        }

        this._namedContainers[containerName] = element || null;
    }

    addMessage({message, type, id, containerName=null, centerMsg = true}) {
   
        if (typeof message !== "string") {
            logError("messages.addMessage", `Expect a message but got the following message with type ${typeof message}`);
            return;
        }

        if (containerName !== null && typeof containerName !== "string") {
            throw new Error(`if the container name is not null then a string must assigned to it. Expected a string but got ${containerName} with type ${typeof containerName}`)
        }

        if (!id || typeof id !== "string") {
            throw new Error(`The id must not be an object, cannot be null and it must be a string. Got type ${typeof id} for id`);
        }

        if (!type || typeof type !== "string") {
            throw new Error(`The type for string must be a string. Expected a string but got an object with type ${typeof type}`);
        }

        type = type.toLowerCase().trim();

        if (!(type === "info" || type === "error" || type === "success")) {
            throw new Error(`Type must be 'info', 'error' or 'success' but got string with the value ${type}`)
        }

        const messageElement = this._createMessageElement({message:message, type: type});
        messageElement.id    = id;
      
        if (centerMsg) {
            messageElement.classList.add("center");
        }

        this._setContainer(containerName);
        this._addToCache(id, messageElement, type, containerName)

    }

    _setContainer(containerName) {
        if (containerName === null) {
            this._defaultContainer.appendChild(messageElement);
        } else {
            this._namedContainers[containerName] = messageElement;
        }
    }

    _addToCache(id, messageElement, type, containerName=null) {
        this._cache[id] = {
            messageElement: messageElement,
            type: type,
            containerName: containerName === null ? "DEFAULT_CONTAINER" :  containerName,
        }
    }

    updateMessage({messageID, message, type="success"}) {

        if (!this._defaultContainer.hasOwnProperty(messageID)) {
            logError("updateMessage", "The message id couldn't be found");
            return;
        }

        if (typeof message !== "string") {
            logError("updateMessage", "The message couldn't be updated because it is not a string");
        }

        const messageElement = this._getMessageByID(messageID);

        if (messageElement) {
            this._isTypeValid(type);
            const spanMessageElement = this._setSpanElementType(type);
            spanMessageElement.textContent = message;
            this._setMessageElementToCache(messageID, spanMessageElement);
        }
    
    }

    showMessage(messageID) {
        this._toggleMessage(messageID, true);
    }

    hideMessage(messageID) {
        this._toggleMessage(messageID, false);
            
    }

    _toggleMessage(show) {

        const messageContainer = this._getMessageByID(messageID);

        if (!messageContainer) {
            logError("showMessage", "The message container wasn't found");
            return;
        }
  
        messageContainer.messageElement.style.display =  show ? "block" : "none" ;

    }

    showMessageContainer(containerName) {
        this._toggleMessageContainer(containerName);
    }

    hideMessageContainer(containerName) {
        this._toggleMessageContainer(containerName, false);
    }
    
    _toggleMessageContainer(containerName, show=true) {

        const messageContainer = this._getMessageContainerByName(containerName);
        if (!messageContainer) {
            return;
        }

        show ? messageContainer.classList.add("show") : messageContainer.classList.remove("show");
        return true;
    }

    removeMessage(messageID) {
        const message =  this._getMessageByID(messageID);
        if (!message) {
            logError("toggleMessage", "The message container wasn't found");
            return false;
        }

        message.messageElement.remove();        
        return this._removeMessageFromCache(messageID);
      
    }

    _getMessageByID(messageID) {
      return this._cache[messageID];
    }

    _setMessageElementToCache({messageID, messageElement}) {

        if (messageID || typeof messageID !== "string") {
            throw new Error(`The message id must be a string. Expected a string but got object with type ${typeof messageID}`);
        }

        if (!checkIfHTMLElement(messageElement, logError("_setMessageElementCache", ""))) {
            return;
        }

        if (this._cache.hasOwnProperty(messageID)) {
            this._cache[messageID].messageElement = messageElement;
            return;
        }
      
    }

    _removeMessageFromCache(messageID) {
        if (this._cache.hasOwnProperty(messageID)) {
            delete this._cache[messageID];
            return true;
        }
    }

    _createMessageElement({message, type}) {

        const spanElement       = document.createElement("span");
        spanElement.textContent = message;

        spanElement.classList.add("small-text");
        spanElement.classList.add("capitalize");
        spanElement.classList.remove("add", "green");

        return this._setSpanElementType(spanElement, type);
    }

    _setSpanElementType(spanElement, type) {

        if (!checkIfHTMLElement(spanElement, logError("_setSpanElementType", "The span element"))) {
            return;
        }

        switch(type) {
            case "error":
                spanElement.classList.add("red");
                break;
            case "success":
                spanElement.classList.add("green");
                break;
            case "info":
                spanElement.classList.add("blue");
                break;
        }
        return spanElement;
    }

    
    _isTypeValid(type) {
        type = type.toLowerCase().trim();

        if (!(type === "info" || type === "error" || type === "success")) {
            throw new Error(`Type must be 'info', 'error' or 'success' but got string with the value ${type}`)
        }
        return true;
    }

    hideAllMessagesOfType(className) {
        // to do
    }
};



/**
 * MessageState
 *
 * An enumeration of message types mapped to their corresponding CSS colour classes.
 * This helps standardise styling across different types of messages (e.g. error, info, success),
 * and prevents the use of hard-coded strings in the codebase.
 *
 * Usage:
 *   element.classList.add(MessageState.SUCCESS); // adds "green"
 *
 * Properties:
 *   - ERROR:   "red"   → typically used for error messages
 *   - INFO:    "blue"  → used for general informational messages
 *   - SUCCESS: "green" → used for success or confirmation messages
 *
 * Consider freezing this object with Object.freeze() to prevent accidental mutation.
 */
export const MessageState = {
    ERROR : "red",
    INFO : "blue",
    SUCCESS: "green",
}