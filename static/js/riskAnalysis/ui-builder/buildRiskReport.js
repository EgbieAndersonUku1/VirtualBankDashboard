import RuleConfiguration from "../rules/rulesConfiguration.js";
import { RiskLevel, RuleStatus, rulesCheck } from "../rules/risk.js";
import { delay } from "../rules/utils.js";
import { APPLICATION_DECISION } from "../application-decision.js";
import DecisionReportBuilder from "./buildDecisionReport.js";
import { clearDivElement, scrollToView } from "../rules/utils.js";



const rulesContainer      = document.getElementById("rules");
const precheckContainer   = document.getElementById('risk-analysis-checklist');
const decisionContainer   = document.getElementById("decision");
const decisionScore       = document.getElementById("decision-score")
const decisionMax         = document.getElementById("decision-max")
const fullReportContainer = document.getElementById("full-report");



/**
 * Builds and renders a list of verification rules sequentially with
 * animated UI progression.
 *
 * Each rule is:
 * - Rendered as a DOM row inside the rules container
 * Rules are processed one at a time to create a step-by-step
 * verification animation experience.
 *
 * @async
 * @param {Array<{name: string, status: RuleStatus}>} rules
 * An array of rule objects to be processed and rendered.
 *
 * @returns {Promise<void>}
 * Resolves when all rules have been rendered and completed.
 */
export async function buildRules(rules) {
    
    addSectionHeader({
        container: rulesContainer,
        title: "Running verification checks",
        subtitle: "Please wait while we analyse the account and complete all required checks."
    })

   
    for (let key of rules) {

        const ruleGroupDiv  = document.createElement("div");

        ruleGroupDiv.classList.add("rules-group", "flex", "flex-space-between")

        const divObject = createRule(key.name, key.status);

        ruleGroupDiv.appendChild(divObject.ruleDiv);
        ruleGroupDiv.appendChild(divObject.ruleOutcomeDiv)
        await delay(100); 

        rulesContainer.append(ruleGroupDiv)

        ruleGroupDiv.scrollIntoView({
        behavior: "smooth",
        block: "end"
        });

        await delay(500);
        divObject.spinner.replaceWith(createTick())
        
    }

   
    

}



/**
 * Creates the full DOM structure for a single rule entry.
 *
 * The rule entry consists of:
 * - A spinner (shown while the rule is being processed)
 * - A Font Awesome icon representing the rule type
 * - The rule name text
 * - A rule outcome element displaying the status
 *
 * @param {string} ruleName
 * The name of the rule used for display and icon lookup.
 *
 * @param {RuleStatus} ruleOutcome
 * The evaluation status of the rule.
 *
 * @returns {RuleElements}
 * An object containing references to the created DOM elements:
 * - ruleDiv: the complete rule row element
 * - ruleOutcomeDiv: the status element
 * - spinner: the loading spinner element
 */
function createRule(ruleName, ruleOutcome) {

    const divElement      = document.createElement("div");
    const fontAwesomeSpan = createFontAwesomeSpan(ruleName);
    const spanRuleName    = document.createElement("span");

    spanRuleName.textContent = ruleName;

    const spinner = createSmallSpinner()
    divElement.appendChild(spinner)

    divElement.appendChild(fontAwesomeSpan);
    divElement.appendChild(spanRuleName);
    divElement.className = "rule";

   

    const ruleOutcomeDiv = createRuleOutcome(ruleOutcome);

    divElement.appendChild(ruleOutcomeDiv)

    return {
        ruleDiv: divElement,
        ruleOutcomeDiv: ruleOutcomeDiv,
        spinner: spinner
    }

   
   

}



/**
 * Creates a Font Awesome icon wrapper for a given rule.
 *
 * The icon is determined by the rule configuration mapping, where each
 * rule name resolves to a corresponding Font Awesome class.
 *
 * @param {string} ruleName
 * The name of the rule used to look up its icon configuration.
 *
 * @returns {HTMLSpanElement}
 * A span element containing the configured Font Awesome icon element.
 */
function createFontAwesomeSpan(ruleName) {
    const span = document.createElement("span");
    const iElement = document.createElement("i");

    const config        = RuleConfiguration[ruleName];
    iElement.className  = config.icon; 

    span.appendChild(iElement);
    return span
}




/**
 * Creates a DOM element representing the outcome of a rule check.
 *
 * The status determines the visual styling applied:
 * - PASSED → success styling
 * - WARNING → warning styling
 * - FLAGGED → warning styling
 *
 * @param {RuleStatus} status
 * The outcome status of the rule.
 *
 * @returns {HTMLDivElement}
 * A DOM element containing the styled rule outcome text.
 */
function createRuleOutcome(status) {

    const divElement = document.createElement("div");
    const pElement   = document.createElement("p")

    divElement.className = "rule-outcome";

    switch(status) {

        case RuleStatus.PASSED:
            pElement.className = "text-success";
            break;
        case RuleStatus.WARNING:
            pElement.className = "text-warning";
            break;
         case RuleStatus.FLAGGED:
            pElement.className = "text-warning";
            break;
    }

    pElement.textContent = status
    divElement.appendChild(pElement);
    return divElement
}






/**
 * Creates and renders a verification check row within the pre-check
 * container.
 *
 * Each row consists of:
 * - A loading spinner indicating that the check is in progress
 * - A message describing the verification step being performed
 *
 * The newly created row is appended to the pre-check container and
 * scrolled into view.
 *
 * @param {{message: string}} rule
 * The verification rule to display.
 *
 * @returns {CheckUI}
 * References to the created UI elements so they can be updated during
 * the verification process.
 */
export function addCheck(rule) {
    const row = document.createElement('div');
    row.className = 'flex-grid two-column-5_95_grid center risk-check-row';

    
    const spinner = createSmallSpinner();

    const message = document.createElement('div');
    message.className = 'risk-check-message';

    message.innerHTML = `<small>${rule.message}</small>`;

    row.appendChild(spinner);
    row.appendChild(message);

    precheckContainer.appendChild(row);

    scrollToView(precheckContainer)
  

    return { row, spinner, message };
}




/**
 * Creates a success tick icon used to indicate a completed check.
 *
 * The icon uses Font Awesome classes and success styling to visually
 * represent a successful verification step.
 *
 * @returns {HTMLElement} A Font Awesome check-circle icon element.
 */
function createTick() {
    const tick = document.createElement('i');
    tick.className = 'fa-solid fa-circle-check text-success';
    return tick;
}





/**
 * Creates a small loading spinner used to indicate that a check is
 * currently being processed.
 *
 * @returns {HTMLDivElement} A spinner element styled with the
 * `spinner` and `small-spinner` CSS classes.
 */
function createSmallSpinner() {
    const spinner = document.createElement('div');
    spinner.className = 'spinner small-spinner';
    return spinner;
}




/**
 * Runs the pre-check verification sequence and updates the UI as each
 * check completes.
 *
 * Checks are processed sequentially to provide visual feedback and
 * simulate a real-time verification workflow.
 *
 * @async
 * @returns {Promise<boolean>}
 * Resolves to `true` when all checks have been completed and rendered.
 */
export async function runChecks() {
    
    addSectionHeader({
        container: precheckContainer,
        title: "Pre-check verification overview",
        subtitle: `The system will run a series of automated checks
                    covering identity, security, financial activity, and account integrity.`

    })


    for (const rule of rulesCheck) {
        const ui = addCheck(rule);

        // simulate async processing
        await delay(300);


        ui.spinner.classList.add('hidden');
        const tick = createTick();
    

        ui.spinner.replaceWith(tick);

        await delay(100); 

        ui.message.classList.add('completed');

    }

    return true;
    }



/**
 * Adds a section header to the top of a container element.
 *
 * Creates a title and subtitle element, applies the appropriate
 * styling classes, and prepends them to the specified container.
 *
 * @param {Object} params - Function parameters.
 * @param {HTMLElement} params.container - The container element to add the header to.
 * @param {string} params.title - The main heading text.
 * @param {string} params.subtitle - The supporting subtitle text.
 */
function addSectionHeader({ container, title, subtitle }) {
    const titleElement = document.createElement("h1");
    titleElement.textContent = title;
    titleElement.className = "mt-16 mb-8 header-9";

    const subtitleElement = document.createElement("small");
    subtitleElement.textContent = subtitle;
    subtitleElement.className = "text-muted mb-24";

    container.prepend(titleElement, subtitleElement);
}





/**
 * Displays the application decision summary and updates the decision UI.
 *
 * The function:
 * - Reveals the decision container
 * - Scrolls the decision section into view
 * - Displays the number of passed rules and total rules evaluated
 * - Displays the recommended application outcome
 * - Applies decision-specific styling to the recommendation
 *
 * @param {number} numberPassed
 * The number of rules that passed evaluation.
 *
 * @param {number} total
 * The total number of rules evaluated.
 *
 * @param {string} recommendation
 * The recommended application decision (e.g. APPROVE, REJECT, MANUAL_REVIEW).
 *
 * @returns {void}
 */
export function showDecisionOutcome(numberPassed, total, recommendation) {

    decisionContainer.classList.add("show");

    const ourRecommendation = document.getElementById("our-recommendation")

    scrollToView(decisionContainer)
   

    decisionScore.textContent = numberPassed;
    decisionMax.textContent = `/ ${total}`;
    ourRecommendation.textContent = recommendation;
    
    highlightDecision(ourRecommendation)
}







/**
 * Applies visual styling to an application decision element based on its
 * displayed decision text.
 *
 * The element is assigned status-specific CSS classes to highlight the
 * decision outcome:
 * - APPROVE → success styling
 * - REJECT → danger styling
 * - MANUAL_REVIEW → warning styling
 *
 * @param {HTMLElement} decisionElement
 * The DOM element containing the application decision text.
 *
 * @returns {void}
 */
function highlightDecision(decisionElement) {

    switch(decisionElement.textContent) {

        case APPLICATION_DECISION.MANUAL_REVIEW:
            decisionElement.classList.add("text-warning", "light-bold");
            break;
        
        case APPLICATION_DECISION.APPROVE:
            decisionElement.classList.add("text-success", "light-bold");
            break;
        
        case APPLICATION_DECISION.REJECT:
            decisionElement.classList.add("text-danger", "light-bold");
            break;
    }
}






export function showFullReport(report) {
    
    const divContainer = DecisionReportBuilder.createReport(report)
   
    clearDivElement(fullReportContainer)

    addSectionHeader({
        container: fullReportContainer,
        title: "Full report",
        subtitle: `This is the full report generated by the system.
              It shows the factors used to reach the final decision.`
    })
    fullReportContainer.appendChild(divContainer);

    // scrollToView(fullReportContainer) 
    
}

