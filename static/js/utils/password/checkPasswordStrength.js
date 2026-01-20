import PasswordStrengthChecker from "./passwordStrengthChecker.js";


export default class CheckFrontEndPasswordStrength {
    #hasCapitalElement;
    #hasLowercaseElement;
    #hasNumberElement;
    #hasMinLengthElement;
    #hasSpecialElement;
    #doPasswordsMatchElement;
    #passwordFieldElement;
    #confirmPasswordFieldElement;
    #validCSSRule;
    #invalidCSSRule;
    #passwordStrengthChecker;
    #passwordFieldMsg;
    #confirmPasswordFieldMsg;

    constructor(
        passwordFieldMsg        = "Currently using password field",
        confirmPasswordFieldMsg = "Currently using confirm password field"
    ) {
        this.#passwordStrengthChecker = new PasswordStrengthChecker();
        this.#passwordFieldMsg        = passwordFieldMsg;
        this.#confirmPasswordFieldMsg = confirmPasswordFieldMsg;
    }


    startEventListener() {
        if (!this.#passwordFieldElement || !this.#confirmPasswordFieldElement) {
            throw new Error("Password fields must be set before starting listeners.");
        }

        ["input", "click"].forEach(event => {
            this.#passwordFieldElement.addEventListener(event, () =>
                this.#handlePasswordFieldValidation({
                    fieldMessage: this.#passwordFieldMsg,
                    passwordField: this.#confirmPasswordFieldElement,
                    fieldToCheck: this.#passwordFieldElement
                })
            );

            this.#confirmPasswordFieldElement.addEventListener(event, () =>
                this.#handlePasswordFieldValidation({
                    fieldMessage: this.#confirmPasswordFieldMsg,
                    passwordField: this.#passwordFieldElement,
                    fieldToCheck: this.#confirmPasswordFieldElement
                })
            );
        });
    }

    #handlePasswordFieldValidation({ fieldMessage, passwordField, fieldToCheck }) {
        this.#passwordStrengthHelper(fieldToCheck, fieldMessage);
        this.#doPasswordMatch(passwordField.value, fieldToCheck.value);
    }

  
    #doPasswordMatch(password, confirmPassword) {
      
        const match = password && password === confirmPassword;

        this.#doPasswordsMatchElement.classList.toggle(this.#validCSSRule, match);
        this.#doPasswordsMatchElement.classList.toggle(this.#invalidCSSRule, !match);

        return match;
    }


    #passwordStrengthHelper(passwordInputField, msg) {
        const password = passwordInputField.value;

        this.#passwordStrengthChecker.setPassword(password);
        const report = this.#passwordStrengthChecker.checkPasswordStrength();

        const textNode = passwordInputField.childNodes[2];
        if (textNode) {
            textNode.nodeValue = msg;
        }

        passwordInputField.classList.add(this.#validCSSRule);

        this.#updateRequirement(this.#hasCapitalElement, report.HAS_AT_LEAST_ONE_UPPERCASE);
        this.#updateRequirement(this.#hasLowercaseElement, report.HAS_AT_LEAST_ONE_LOWERCASE);
        this.#updateRequirement(this.#hasSpecialElement, report.HAS_AT_LEAST_ONE_SPECIAL_CHARS);
        this.#updateRequirement(this.#hasNumberElement, report.HAS_AT_LEAST_ONE_NUMBER);
        this.#updateRequirement(this.#hasMinLengthElement, report.HAS_AT_LEAST_LENGTH_CHARS);
    }

    #updateRequirement(element, isMet) {
        if (!element) return;

        element.classList.toggle(this.#validCSSRule, isMet);
        element.classList.toggle(this.#invalidCSSRule, !isMet);
    }

   

    setPasswordFieldElement(id) {
        this.#passwordFieldElement = this.#getElementById(id);
        return this;
    }

    setConfirmPasswordFieldElement(id) {
        this.#confirmPasswordFieldElement = this.#getElementById(id);
        return this;
    }

    setHasCapitalElement(id) {
        this.#hasCapitalElement = this.#getElementById(id);
        return this;
    }

    setHasLowercaseElement(id) {
        this.#hasLowercaseElement = this.#getElementById(id);
        return this;
    }

    setHasNumberElement(id) {
        this.#hasNumberElement = this.#getElementById(id);
        return this;
    }

    setHasMinLengthElement(id) {
        this.#hasMinLengthElement = this.#getElementById(id);
        return this;
    }

    setHasSpecialElement(id) {
        this.#hasSpecialElement = this.#getElementById(id);
        return this;
    }

    setDoPasswordsMatchElement(id) {
        this.#doPasswordsMatchElement = this.#getElementById(id);
        return this;
    }

    setValidCSSRule(rule) {
        this.#validateString(rule);
        this.#validCSSRule = rule;
        return this;
    }

    setInvalidCSSRule(rule) {
        this.#validateString(rule);
        this.#invalidCSSRule = rule;
        return this;
    }


    #getElementById(id) {
        this.#validateString(id);
        const el = document.getElementById(id);

        if (!(el instanceof HTMLElement)) {
            throw new Error(`Expected HTMLElement with id "${id}"`);
        }

        return el;
    }

    #validateString(value) {
        if (typeof value !== "string") {
            throw new Error(`Expected string but got ${typeof value}`);
        }
    }
}
