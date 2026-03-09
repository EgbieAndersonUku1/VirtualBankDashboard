import { checkIfHTMLElement } from "../utils.js";

const dashboard   = document.getElementById("dashboard");


if (!checkIfHTMLElement("dashboard", {
    dashboardElement: dashboard,
    extraInfo: "Expected a dashboard element",
    error: "Invalid element type"
}, true)) {

}

export const config = {
    EXCLUDE_FIELDS: ["username", "email", "wallet-disconnect-inputfield",
                             "transfer-type", "from", "to", "transaction-type", "transfer-amount", 
                             "fund-amount", "select-source"],

    EXCLUDE_TYPES: ["checkbox", "radio", "password", "email", "textarea"],

    DASHBOARD_ELEMENT: dashboard,
}