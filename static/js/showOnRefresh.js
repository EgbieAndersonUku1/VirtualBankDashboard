import { checkIfHTMLElement } from "./utils.js";

document.addEventListener("load", handlePageRefresh);

const refreshPageOverlay = document.getElementById("refresh-overlay");

export function handlePageRefresh() {

        const TIME_IN_MS = 2000
        refreshPageOverlay.classList.add("show");

        setTimeout(() => {
            refreshPageOverlay.classList.remove("show")
        }, TIME_IN_MS)
}



checkIfHTMLElement(refreshPageOverlay, "The refresh page overlay")