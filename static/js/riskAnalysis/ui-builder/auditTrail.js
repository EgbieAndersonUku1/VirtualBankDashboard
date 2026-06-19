import { getFormattedDateTime } from "../../utils.js";
import { warnError } from "../../logger.js";





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
                        <dd>${getFormattedDateTime(auditTrailObj.date)}</dd>

                        <dt>Time</dt>
                        <dd>${auditTrailObj.time}</dd>

                        <dt>Current status</dt>
                        <dd>${auditTrailObj.metadata.currentStatus}</dd>
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
export class AuditTrailRender {

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
     */
    constructor(numOfCardsToLoadPerClick, auditTrail, auditCardContainerId) {

        this.loadPerCard          = numOfCardsToLoadPerClick;
        this.startRange           = 0;
        this.endRange             = numOfCardsToLoadPerClick;
        this.auditTrail           = auditTrail;
        this.auditCardContainerId = auditCardContainerId;

        this.containerElement = null;

        this.#validateCardsPerLoad(numOfCardsToLoadPerClick);
        this.#validateAuditTrailList(auditTrail);
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
        if (typeof id !== "string") {
            throw new Error(
                `The audit card id must be a string. Expected string, got ${typeof id}`
            );
        }

        const containerElement = document.getElementById(id);

        if (!containerElement) {
            throw new Error(
                `Could not find an element with id "${id}"`
            );
        }

        this.containerElement = containerElement;
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

        this.#addToContainer(fragment);

        return invalidObjects;
    }
}