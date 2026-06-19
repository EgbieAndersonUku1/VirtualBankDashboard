import { getFormattedDateTime, validateTimeString } from "../../utils.js";
import { warnError } from "../../logger.js";
import { scrollToView } from "../rules/utils.js";




const auditTrailStatusConfig = {
    pending: {
        className: "orange-text light-bold",
      
    },

    "under review": {
        className: "blue-text light-bold",
    },
    approved: {
        className: "active-text light-bold",
        icon: "check"
    },
    rejected: {
        className: "deactivate-text",
      
    }
};

function getStatus(audit) {
    const status = audit.metadata.currentStatus.toLowerCase();
    console.log(status)
    return auditTrailStatusConfig[status]
}



export function buildAuditTrailCard(auditTrailObj) {

    if (typeof auditTrailObj !== "object" || auditTrailObj === null) {
        warnError("buildAuditTrailCard", {
            error: "The parameter must be an object",
            objectReceived: typeof auditTrailObj,
        });

        return null;
    }

    const template = document.createElement("template");

    template.innerHTML = `
        <div class="audit-trail__card">

            <div class="audit-trail__timeline audit-trail__head">
                <span class="audit-trail__start"></span>
                <span class="audit-trail__middle"></span>
                <span class="audit-trail__end"></span>
            </div>

            <div class="flex-grid audit-trail__body">

                <div class="audit-trail-card__info">
                    <h2>${auditTrailObj.event}</h2>
                    <span>${auditTrailObj.description}</span>

                    <dl class="audit-trail-card__meta mt-4">
                        <dt>Performed by</dt>
                        <dd>${auditTrailObj.performedBy}</dd>

                        <dt>Channel</dt>
                        <dd>${auditTrailObj.channel}</dd>

                        <dt>Date</dt>
                        <dd>${(auditTrailObj.date)}</dd>

                        <dt>Time</dt>
                        <dd>${auditTrailObj.time} hrs</dd>

                        <dt>Current status</dt>
                            <dd class="${getStatus(auditTrailObj).className}">
                             
                                    ${auditTrailObj.metadata.currentStatus}
                               
                            </dd>
                        
                    </dl>
                </div>

            </div>

        </div>
    `;

    return template.content.firstElementChild;
}




/**
 * Builds an audit trail card element from an audit trail object.
 *
 * @param {Object} auditTrailObj - The audit trail data used to populate the card.
 * @returns {HTMLElement|null} The generated audit trail card element.
 */
export class AuditTrailRenderer {

    /**
     * Creates an audit trail renderer instance.
     *
     * The constructor is responsible for storing configuration and validating
     * the initial data. DOM-related operations are intentionally excluded and
     * are performed during initialise() to keep object creation independent
     * from the DOM lifecycle.
     *
     * @param {number} numOfCardsToLoadPerClick - Number of cards rendered per load.
     * @param {Array<Object>} auditTrail - Collection of audit trail objects.
     * @param {string} auditCardContainerId - ID of the container element.
     * @param {string} loadButtonId - The id of the load button. This will be used to change it to show less
     * @param {string} loadButtonLessText - The text button to appear on the load less button
     * @param {string} loadButtonMoreText - The text button to appear on the load more button
     */
    constructor({numOfCardsToLoadPerClick, 
                auditTrail, 
                auditCardContainerId, 
                loadButtonId,
                loadButtonLessText  = "Show less",
                loadButtonMoreText  = "Load more"}) {

        this.loadPerCard          = numOfCardsToLoadPerClick;
        this.startRange           = 0;
        this.endRange             = numOfCardsToLoadPerClick;
        this.auditTrail           = auditTrail;
        this.auditCardContainerId = auditCardContainerId;
        this.loadButtonId         = loadButtonId;

        this.containerElement     = null;
        this.loadButton           = null;
     

        this.#validateCardsPerLoad(numOfCardsToLoadPerClick);
        this.#validateAuditTrailList(auditTrail);
        this.#validateString(loadButtonLessText, "The load less button text must be a string");
        this.#validateString(loadButtonMoreText, "The load more button text must be a string");

        this.loadButtonLessText   = loadButtonLessText;
        this.loadButtonMoreText   = loadButtonMoreText;
    }

   /**
     * Initialises the renderer.
     *
     * This method must be called before render().
     *
     * The class follows a two-step lifecycle:
     * 1. Create the instance.
     * 2. Initialise it when the DOM is ready.
     *
     * DOM lookups/query are intentionally deferred rather than performed in the
     * constructor when the class is initialised. This allows multiple instances of
     * the class to be created without immediately interacting with the DOM. 
     * Initialisation can then be performed when the caller calls the initialise().
     * 
     */
    initialise() {
        this.#getContainerElement(this.auditCardContainerId);
        this.#getLoadButtonElement(this.loadButtonId);

    }


    /**
     * Retrieves the load button element using the provided element ID.
     *
     * Validates that the ID is a string, searches the DOM for the matching
     * button element, and stores the reference for later use by the renderer.
     *
     * @param {string} id - The ID of the load button element.
     * @throws {Error} If the provided ID is not a string or does not match a DOM element.
     * @returns {void}
     */
    #getLoadButtonElement(id) {
        const errorMsg = "The load button id is not a string";
        this.#validateString(id, errorMsg);

        const loadButtonElement = document.getElementById(id);

        if (!loadButtonElement) {
            throw new Error("The load button id is not a valid id.")
        }

        this.loadButton = loadButtonElement;
    }

    /**
     * Retrieves and stores the DOM container used for rendering audit cards.
     *
     * This method is separated from the constructor because DOM elements may
     * not exist when the class instance is created. It is called during the
     * initialise lifecycle stage when the DOM is expected to be available.
     *
     * @param {string} id - The ID of the audit card container element.
     */
    #getContainerElement(id) {
       
        const errorMsg = "The audit card id must be a string";

        this.#validateString(id, errorMsg)
        const containerElement = document.getElementById(id);

        if (!containerElement) {
            throw new Error(
                `Could not find an element with id "${id}"`
            );
        }

        this.containerElement = containerElement;
        scrollToView(this.containerElement)
    }


    /**
     * Validates the number of cards that should be rendered per load.
     *
     * Ensures the pagination configuration is a positive number before it is
     * used to calculate rendering ranges.
     *
     * @param {number} numOfCardsToLoadPerClick - Number of cards per render.
     */
    #validateCardsPerLoad(numOfCardsToLoadPerClick) {
        if (typeof numOfCardsToLoadPerClick !== "number") {
            throw new Error(
                `Expected a number for cards per load, got ${typeof numOfCardsToLoadPerClick}`
            );
        }

        if (numOfCardsToLoadPerClick < 1) {
            throw new Error(
                "The number of cards to load must be greater than 0"
            );
        }
    }


    /**
     * Validates that the audit trail data is a non-empty array.
     *
     * The renderer expects an array of audit trail objects so pagination and
     * rendering can be performed safely.
     *
     * @param {Array<Object>} auditTrail - Audit trail collection.
     */
    #validateAuditTrailList(auditTrail) {
        if (!Array.isArray(auditTrail)) {
            throw new Error(
                `Expected an array of audit trail objects, got ${typeof auditTrail}`
            );
        }

        if (auditTrail.length === 0) {
            throw new Error(
                "The audit trail list must not be empty"
            );
        }
    }


    /**
     * Validates the structure of an individual audit trail object.
     *
     * Ensures required properties exist and contain the expected data types
     * before attempting to generate an audit trail card.
     *
     * @param {Object} auditTrail - Individual audit trail record.
     */
    #validateObject(auditTrail) {
        const isValid =
            typeof auditTrail.event === "string" &&
            typeof auditTrail.description === "string" &&
            typeof auditTrail.performedBy === "string" &&
            typeof auditTrail.date === "string" &&
            typeof auditTrail.time === "string" &&
            typeof auditTrail.metadata?.currentStatus === "string";

        if (!isValid) {
            throw new Error("Invalid audit trail object");
        }

        this.#validateDateString(auditTrail.date);
        this.#validateTimeString(auditTrail.time);
    }

    /**
     * Validates that a date follows the expected YYYY-MM-DD format.
     *
     * This performs structural validation only and does not verify whether
     * the date represents a real calendar date.
     *
     * @param {string} date - Date string to validate.
     * @returns {boolean} Returns true when the format is valid.
     */
    #validateDateString(date) {

        const EXPECTED_YEAR_LENGTH = 4;
        const EXPECTED_MONTH_LENGTH = 2;
        const EXPECTED_DAY_LENGTH = 2;

        try {
            const [year, month, day] = date.split("-");

            this.#validateExpectedDateLength(year, EXPECTED_YEAR_LENGTH, "Year must be YYYY");
            this.#validateExpectedDateLength(month, EXPECTED_MONTH_LENGTH, "Month must be MM");
            this.#validateExpectedDateLength(day, EXPECTED_DAY_LENGTH, "Day must be DD");

            return true;

        } catch (error) {
            throw new Error("The date parameter is incorrect. Date must be YYYY-MM-DD");
        }
    }


    /**
     * Validates that a time string follows the expected HH:MM format.
     *
     * @param {string} time - The time string to validate in HH:MM format.
     * @throws {Error} If the time format is invalid.
     * @returns {boolean} Returns true when the time string is valid.
     */
    #validateTimeString(time) {
        const EXPECTED_HOUR = 2;
        const EXPECTED_MIN = 2;

        try {
            const [hour, min] = time.split(":");

            this.#validateExpectedDateLength(hour, EXPECTED_HOUR, "Hour must be HH");
            this.#validateExpectedDateLength(min, EXPECTED_MIN, "Min must be MM");

            validateTimeString(hour, min);

            return true;

        } catch (error) {
            throw new Error(`Invalid time: ${error.message}`);
        }
    }


    /**
     * Validates that the provided value is a string.
     *
     * Throws an error when the value is not a string, using either the
     * provided custom error message or the default validation message.
     *
     * @param {*} value - The value to validate.
     * @param {string} [customMessage="The value passed is not a string"] - Custom error message to use when validation fails.
     * @throws {Error} If the provided value is not a string.
     * @returns {void}
     */
    #validateString(value, customMessage="The value passed is not a string") {
        const valueType = typeof value;

        if (valueType !== "string") {
            throw new Error(
                `${customMessage}. Expected string, got ${valueType}`
            );
        }
    }

    /**
     * Ensures a date segment matches the expected length.
     *
     * Used internally by #validateDateString() to validate the year, month,
     * and day portions of a date string.
     *
     * @param {string} value - Date segment being validated.
     * @param {number} expectedLength - Required character length.
     * @param {string} customErrorMsg - Error message displayed on failure.
    */
    #validateExpectedDateLength(value, expectedLength, customErrorMsg) {

        if (value.length !== expectedLength) {
            throw new Error(
                `${customErrorMsg}. Got value length of ${value.length}`
            );
        }
    }



    /**
     * Retrieves the next batch of audit trail records to render.
     *
     * Uses the current pagination range to select records and then updates
     * the range values ready for the next render operation.
     *
     * This allows render() to progressively load additional audit cards
     * without exposing pagination logic to the caller.
     *
     * @returns {Array<Object>} The next set of audit trail records.
     */
    #getNextCardsToRender() {
        const auditCards = this.auditTrail.slice(this.startRange, this.endRange );

        this.startRange = this.endRange;
        this.endRange = this.startRange + this.loadPerCard;

        return auditCards;
    }

    /**
     * Appends generated audit trail elements to the configured container.
     *
     * A document fragment is used so multiple elements can be inserted into
     * the DOM in a single operation, reducing unnecessary DOM updates.
     *
     * @param {DocumentFragment|HTMLElement} elements - Elements to append.
     */
    #addToContainer(elements) {
        this.containerElement.appendChild(elements);
    }


    /**
     * Updates the text displayed on the load button.
     *
     * @param {string} buttonText - The text to display on the load button.
     * @returns {void}
     */
    #updateLoadButton(buttonText) {
        this.loadButton.textContent = buttonText;

    }


    /**
     * Renders the next batch of audit trail cards into the container.
     *
     * Each audit trail object is validated before rendering. Invalid records
     * are skipped and returned to the caller for logging or further handling.
     *
     * initialise() must be called before this method.
     *
     * @returns {Array<Object>} Audit trail objects that failed validation.
     */
    render() {
        if (!this.containerElement) {
            throw new Error(
                "The initialise() method must be called before render()"
            );
        }

        const auditCards     = this.#getNextCardsToRender();
        const invalidObjects = [];
        const fragment       = document.createDocumentFragment();

        auditCards.forEach((auditDetails) => {
            try {
                this.#validateObject(auditDetails);

                const cardElement = buildAuditTrailCard(auditDetails);

                if (cardElement) {
                    fragment.appendChild(cardElement);
                }

            } catch (error) {
                invalidObjects.push(auditDetails);
            }
        });

        if (fragment.childElementCount > 0) {
            this.#addToContainer(fragment);
        } else {
            this.#updateLoadButton(this.loadButtonLessText);
        }

        return invalidObjects;
    }


    /**
     * Removes audit trail elements until only the initial two elements remain visible.
     *
     * Updates the load button text to indicate that more items can be loaded
     * and scrolls the container back into view after collapsing the list.
     *
     * @returns {void}
     */
    showLess() {

        const NUM_OF_VISIBLE_CARDS = 2;
        const numOfElements        = this.containerElement.childElementCount;


        if (numOfElements <= NUM_OF_VISIBLE_CARDS){
            return;
        }

        while (this.containerElement.childElementCount > NUM_OF_VISIBLE_CARDS) {
            this.containerElement.lastElementChild.remove()
        }

       this.#resetLoadRange();

       this.#updateLoadButton(this.loadButtonMoreText)
       scrollToView(this.containerElement);

    }


    /**
     * Resets the loading range to the initial state.
     *
     * Sets the starting index back to the beginning and calculates the
     * ending index based on the configured number of items loaded per request.
     *
     * @returns {void}
     */
    #resetLoadRange() {
        this.startRange = 0;
        this.endRange    = this.loadPerCard;
    }
}