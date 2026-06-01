// Test to see if the data is showing up
import { warnError } from "../logger.js";
import { RiskAnalyser } from "./riskAnalyser.js";
import accountDetails from "./account/accountDetails.js";
import profileInfoDetails from "./account/profileInfoDetails.js";
import cardRequestDetails from "./account/cardRequestDetails.js";
import employmentDetails from "./account/employmentDetails.js";
import { buildRules, runChecks } from "./ui-builder/buildRiskReport.js";
import { RuleStatus } from "./rules/risk.js";
import { showDecisionOutcome } from "./ui-builder/buildRiskReport.js";

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
    }

}



analysisRisk()