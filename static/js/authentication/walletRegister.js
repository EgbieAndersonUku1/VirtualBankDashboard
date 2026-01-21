import CheckFrontEndPasswordStrength from "../utils/password/checkPasswordStrength.js";



const checker = new CheckFrontEndPasswordStrength()
.setPasswordFieldElementId("password")
.setConfirmPasswordFieldElementId("confirm-password")
.setHasCapitalElementId("rule-uppercase")
.setHasLowercaseElementId("rule-lowercase")
.setHasNumberElementId("rule-number")
.setHasMinLengthElementId("rule-length")
.setHasSpecialElementId("rule-symbol")
.setDoPasswordsMatchElementId("rule-match")
.setValidCSSRuleId("valid")
.setInvalidCSSRuleId("invalid")
.setActivePasswordFieldId("active-password-field")
.setPasswordStrengthBoardId("password-strength")
.setPasswordStrengthDisplayBoardCssSelector("show")

checker.startEventListener()

