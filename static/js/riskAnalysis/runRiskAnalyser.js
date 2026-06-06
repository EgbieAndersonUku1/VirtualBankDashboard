import accountDetails from "./account/accountDetails.js";
import profileInfoDetails from "./account/profileInfoDetails.js";
import cardRequestDetails from "./account/cardRequestDetails.js";
import employmentDetails from "./account/employmentDetails.js";

import { AlertUtils } from "../alerts.js";
import { warnError } from "../logger.js";
import { toggleSpinner, getFormattedDateTime } from "../utils.js";

import { APPLICATION_DECISION, ApplicationDecision } from "./application-decision.js";
import { RiskAnalyser } from "./riskAnalyser.js";

import {buildRules, runChecks, showDecisionOutcome, showFullReport} from "./ui-builder/buildRiskReport.js";
import {RiskLevel,RuleStatus} from "./rules/risk.js";
import {applyRiskLevelStyle, cache, clearDivElement } from "./rules/utils.js";
import {buildConfirmationDialogConfig, hasRequestAlreadyBeenProcessed, runConfirmationPrompt} from "./confirmation-service.js";

import { updateTable } from "./table.js";



// ===== Risk Analysis / Report
const fullReportLink         = document.getElementById("full-report-link");
const fullReportContainer    = document.getElementById("full-report");
const fullReportSpinner      = document.getElementById("full-report-spinner");
const seeFullReportContainer = document.getElementById("see-full-report-container");

const riskScoreContainer     = document.getElementById("risk-score");
const riskButton             = document.getElementById("risk-button-analyser");
const riskChecklist          = document.getElementById("risk-analysis-checklist");

// ===== Rules =====
const rulesContainer         = document.getElementById("rules");


// event listeners
fullReportLink.addEventListener("click", handleFullReportLinkClick);
riskButton.addEventListener("click", handleRiskButton);



/**
 * =========================================================
 * REQUEST DECISION SYSTEM
 * =========================================================
 *
 * This module controls the full request workflow including:
 *
 * - Risk analysis execution and interpretation
 * - Decision handling (approve, reject, manual review, hold)
 * - Confirmation dialog messaging
 * - Tracking processed request state
 * - Mapping risk outcomes to UI status updates
 *
 * Key components:
 *
 * - RiskAnalyser: runs risk evaluation logic
 * - statusMap: maps risk outcomes to UI states
 * - processedRequestsState: tracks already handled actions
 * - dialogConfigs: defines confirmation UI messages per action
 *
 * Note:
 * This file primarily defines configuration + UI wiring.
 *
 * =========================================================
 */
const riskAnalyser = new RiskAnalyser()



/**
 * Runs the full risk analysis workflow, including rule evaluation,
 * decision display, caching, and UI updates.
 */
async function analysisRisk() {

    const riskData = riskAnalyser.calculate(accountDetails, profileInfoDetails, cardRequestDetails, employmentDetails);

    if (typeof riskData !== "object") {
        warnError("analysisRisk", {
            error: "RiskData is not an object",
            rulesType: typeof riskData
        })

    }

    const resp = await runChecks()

    if (resp) {

        await buildRules(riskData.rules)

        const passed = getNumberPassed(riskData);
        const total  = riskData.rules.length

        showDecisionOutcome(passed, total, riskData.decision);

        cache.addToCache(riskData);

        updateRiskScore(riskData.score);

        showFullReportLinkContainer();
    
    }

}



/**
 * Returns the number of rules that have passed in the risk data.
 */
function getNumberPassed(riskData) {
    const rules = riskData.rules;

    if (!Array.isArray(rules)) {
        warnError("getNumberPassed", {
            error: "rules is not an array",
            rulesType: typeof rules
        })
        return;
    }
    return rules.filter((rules) => rules.status === RuleStatus.PASSED).length;
}



/**
 * Loads account-related information into the UI.
 * (Currently a placeholder for KYC status handling.)
 */
function loadAccountInformation() {
    const kycStatusValue = document.getElementById("KYC-status-value");
}



/**
 * Resets the full report link back to its default state.
 */
function resetReportLink() {
    fullReportLink.textContent = "See full report";
}



/**
 * Displays the full report link container in the UI.
 */
function showFullReportLinkContainer() {
    seeFullReportContainer.classList.add("show");
}





/**
 * Toggles the full report link between "See full report" and "Close report"
 * and updates its styling accordingly.
 */
function updateFullReportLink(link) {
    switch (link) {

        case "See full report":
            fullReportLink.textContent = "Close report";
            fullReportLink.classList.add("visited")
            break;

        case "Close report":
            fullReportLink.textContent = "See full report";
            fullReportLink.classList.remove("visited")
            break;

    }
}




/**
 * Updates the UI risk score display and applies styling based on risk level.
 */
function updateRiskScore(score) {

    const riskLevel = riskAnalyser.getRiskLevel(score);
    riskScoreContainer.innerHTML = `<span class="dot">${riskLevel}</span>(${score})`

    applyRiskLevelStyle.applyRiskLevelStyling(riskScoreContainer, riskLevel)

}



/**
 * Handles click events for the full report link, including loading state,
 * toggling UI content, and rendering or clearing the report.
 */
function handleFullReportLinkClick(e) {

    const DELAY_MS = 1000;
    toggleSpinner(fullReportSpinner, true);

    setTimeout(() => {

        toggleSpinner(fullReportSpinner, false);

        if (e.target.textContent === "See full report") {

            const riskData = cache.getCacheData()
            showFullReport(riskData.rules);

        } else {
            clearDivElement(fullReportContainer)

        }

       updateFullReportLink(e.target.textContent)

    }, DELAY_MS);


}





/**
 * Handles the risk button click event by resetting UI state
 * and triggering a new risk analysis.
 */
function handleRiskButton(e) {

    clearDivElement(rulesContainer);
    clearDivElement(riskChecklist);

    resetReportLink();
    clearDivElement(fullReportContainer);

    analysisRisk();
}

















