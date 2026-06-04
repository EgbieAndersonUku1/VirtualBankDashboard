
import { warnError } from "../logger.js";
import { RiskAnalyser } from "./riskAnalyser.js";
import accountDetails from "./account/accountDetails.js";
import profileInfoDetails from "./account/profileInfoDetails.js";
import cardRequestDetails from "./account/cardRequestDetails.js";
import employmentDetails from "./account/employmentDetails.js";
import { buildRules, runChecks } from "./ui-builder/buildRiskReport.js";
import { RiskLevel, RuleStatus } from "./rules/risk.js";
import { showDecisionOutcome, showFullReport } from "./ui-builder/buildRiskReport.js";
import { clearDivElement, applyRiskLevelStyle, cache } from "./rules/utils.js";
import { toggleSpinner } from "../utils.js";



const fullReportLink = document.getElementById("full-report-link");
const fullReportContainer = document.getElementById("full-report");
const riskScoreContainer = document.getElementById("risk-score");
const riskButton = document.getElementById("risk-button-analyser");
const rulesContainer = document.getElementById("rules");
const riskChecklist = document.getElementById("risk-analysis-checklist");
const seeFullReportContainer = document.getElementById("see-full-report-container");
const fullReportSpinner = document.getElementById("full-report-spinner");




fullReportLink.addEventListener("click", handleFullReportLinkClick);
riskButton.addEventListener("click", handleRiskButton);


const riskAnalyser = new RiskAnalyser()


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
 * Runs the full risk analysis workflow, including rule evaluation,
 * decision display, caching, and UI updates.
 */
async function analysisRisk() {

    const riskData = riskAnalyser.calculate(accountDetails,
        profileInfoDetails,
        cardRequestDetails,
        employmentDetails
    );

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
        const total = riskData.rules.length

        showDecisionOutcome(passed, total, riskData.decision);

        cache.addToCache(riskData);

        updateRiskScore(riskData.score);

        showFullReportLinkContainer();
        // console.log(riskData)


    }

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
 * Resets the full report link back to its default state.
 */
function resetReportLink() {
    fullReportLink.textContent = "See full report";
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
 * Displays the full report link container in the UI.
 */
function showFullReportLinkContainer() {
    seeFullReportContainer.classList.add("show");
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



/**
 * Loads account-related information into the UI.
 * (Currently a placeholder for KYC status handling.)
 */
function loadAccountInformation() {
    const kycStatusValue = document.getElementById("KYC-status-value");
}