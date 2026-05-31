import { warnError } from "../logger.js";


const APPLICATION_DECISION_THRESHOLD = {
    APPROVE: 25,
    MANUAL_REVIEW: 80,
    REJECT: 100
};


const APPLICATION_DECISION = {
    APPROVE: "Passed",
    MANUAL_REVIEW: "Manual Review",
    REJECT: "Reject"
};



export class ApplicationDecision {

    static determine(score) {

        if (typeof score !== "number") {
            
            warnError("ApplicationDecision", {
                error: "Score should be a number",
                scoreType: typeof score,
            })
            return;
        }

        if (score <= APPLICATION_DECISION_THRESHOLD.APPROVE) {
            return APPLICATION_DECISION.APPROVE;
        }

        if (score <= APPLICATION_DECISION_THRESHOLD.MANUAL_REVIEW) {
            return APPLICATION_DECISION.MANUAL_REVIEW;
        }

        return APPLICATION_DECISION.REJECT;
    }
}