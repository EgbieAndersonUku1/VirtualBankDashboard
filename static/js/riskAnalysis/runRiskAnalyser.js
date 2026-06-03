// Test to see if the data is showing up
import { warnError } from "../logger.js";
import { RiskAnalyser } from "./riskAnalyser.js";
import accountDetails from "./account/accountDetails.js";
import profileInfoDetails from "./account/profileInfoDetails.js";
import cardRequestDetails from "./account/cardRequestDetails.js";
import employmentDetails from "./account/employmentDetails.js";
import { buildRules, runChecks } from "./ui-builder/buildRiskReport.js";
import { RiskLevel, RuleStatus } from "./rules/risk.js";
import { showDecisionOutcome, showFullReport } from "./ui-builder/buildRiskReport.js";
import { clearDivElement } from "./rules/utils.js";
import { toggleSpinner } from "../utils.js";
import { cache } from "./rules/utils.js";


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



function updateFullReportLink(link) {
    switch (e.target.textContent) {

        case "See full report":
            fullReportLink.textContent = "Close report";
            break;

        case "Close report":
            fullReportLink.textContent = "See full report";
            break;

    }
}



function updateRiskScore(score) {

    const riskLevel = riskAnalyser.getRiskLevel(score);
    riskScoreContainer.innerHTML = `<span class="dot">${riskLevel}</span>(${score})`

    switch (riskLevel) {

        case RiskLevel.LOW:
            riskScoreContainer.classList.add("text-success");
            break;

        case RiskLevel.MEDIUM:
            riskScoreContainer.classList.add("text-warning");
            break;

        case RiskLevel.HIGH:
            riskScoreContainer.classList.add("text-danger");
            break;

        case RiskLevel.CRITICAL:
            riskScoreContainer.classList.add("text-danger");
            break;

    }

    riskScoreContainer.classList.add("bold")


}



function showFullReportLinkContainer() {
    seeFullReportContainer.classList.add("show")
}



function handleRiskButton(e) {
    
    clearDivElement(rulesContainer);
    clearDivElement(riskChecklist)
    analysisRisk()
}