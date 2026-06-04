import { RiskLevel } from "./risk.js";


const freezeRules = (rules) =>
    Object.freeze(
        Object.fromEntries(
            Object.entries(rules).map(([key, value]) => [
                key,
                Object.freeze(value),
            ])
        )
    );


export function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}


export const cache = {
    cacheData: [],

    addToCache(data) {
        this.cacheData.push(data)
    },

    getCacheData() {
        return this.cacheData[0]
    }

}



export function clearDivElement(div) {
    div.innerHTML = ""
}




/**
 * Smoothly scrolls a DOM element into the viewport.
 *
 * This is a helper wrapper around `Element.scrollIntoView` that standardises
 * scrolling behaviour across the application.
 *
 * @param {HTMLElement} divElement
 * The DOM element to scroll into view.
 *
 * @returns {void}
 */
export function scrollToView(divElement) {
    divElement.scrollIntoView({
        behavior: "smooth",
        block: "end"
    });
}







/**
 * Applies styling based on a risk level.
 *
 * @param {HTMLElement} element - The element to style.
 * @param {"LOW" | "MEDIUM" | "HIGH" | "CRITICAL"} riskLevel - The risk level.
 */
function applyRiskLevelStyling(element, riskLevel, getRiskLevelClass) {
    element.classList.add(getRiskLevelClass(riskLevel), "bold");
}





/**
* Applies risk-based styling to an element.
*
* Low-risk values are displayed using success styling, medium-risk
* values use warning styling, and high or critical-risk values use
  danger styling. A bold font weight is also applied.

*/
export const applyRiskLevelStyle = (() => {

    /**
     * Applies risk-based styling to an element.
     *
     * Low-risk values are displayed using success styling, medium-risk
     * values use warning styling, and high or critical-risk values use
     * danger styling. A bold font weight is also applied.
     *
     * @param {HTMLElement} element - The element to update.
     * @param {string} riskLevel - The risk level to visualise.
     */
    function getRiskLevelClass(riskLevel) {

        switch (riskLevel) {
            case RiskLevel.LOW:
                return "text-success";

            case RiskLevel.MEDIUM:
                return "text-warning";

            case RiskLevel.HIGH:
            case RiskLevel.CRITICAL:
                return "text-danger";
        }
    }

    /**
     * Applies styling based on a risk level.
     *
     * @param {HTMLElement} element - The element to style.
     * @param {"LOW" | "MEDIUM" | "HIGH" | "CRITICAL"} riskLevel - The risk level.
     */
    function applyRiskLevelStyling(element, riskLevel) {
        element.classList.add(getRiskLevelClass(riskLevel), "bold");
    }

    // exposed public API
    return {
        applyRiskLevelStyling
    }

})()


export default freezeRules;