import { warnError } from "../../logger.js";


const DecisionReportBuilder = (() => {

    /**
     * Creates a full report DOM structure from a report object.
     * This is the only public method exposed.
     *
     * @param {Object} report - Structured report data
     * @returns {HTMLElement} DOM container with rendered report
     */
    function createReport(report) {

        if (typeof report !== "object") {
            warnError("DecisonReportBuilder.createReport", {
                error: "Expected an objected. Receive a non-object",
                objectRecived: typeof report,
            
            })
            return;
        }

        const divContainer = document.createElement("div");
        divContainer.className = "flex-grid mt-16";

        for (let data of Object.values(report)) {
            const divGroup = createDivRow(data);
            divContainer.appendChild(divGroup);
        }

        return divContainer;
    }

    /**
     * Adds a horizontal divider to a container element.
     *
     * @param {HTMLElement} div
     * @returns {HTMLElement}
     */
    function appendDivider(div) {
        const divider = document.createElement("hr");
        divider.className = "dividor mb-16";
        div.appendChild(divider);
        return div;
    }

    /**
     * Creates a key-value display row.
     *
     * @param {string} key
     * @param {any} value
     * @returns {HTMLElement}
     */
    function createSpanDetails(key, value) {
        const spanRow = document.createElement("div");
        const spanNameElement = document.createElement("span");
        const spanValueElement = document.createElement("span");

        spanNameElement.className = "light-bold capitalise";
        spanValueElement.className = "text-muted";

        spanNameElement.textContent = `${key} `;
        spanValueElement.textContent = value;

        spanRow.appendChild(spanNameElement);
        spanRow.appendChild(spanValueElement);

        return spanRow;
    }

    /**
     * Builds a single report section row.
     *
     * @param {Object} report
     * @returns {HTMLElement}
     */
    function createDivRow(report) {
        const divRow = document.createElement("div");
        divRow.className = "flex-grid";

        for (let [key, value] of Object.entries(report)) {
            const spanElement = createSpanDetails(key, value);
            divRow.appendChild(spanElement);
        }

        return appendDivider(divRow);
    }

    // exposed public API
    return {
        createReport
    };

})();

export default DecisionReportBuilder;