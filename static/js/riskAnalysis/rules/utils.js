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



export default freezeRules;