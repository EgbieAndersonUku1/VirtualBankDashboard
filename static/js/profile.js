import { formatUKMobileNumber, sanitizeText, toTitle, checkIfHTMLElement } from "./utils.js"
import { isValidEmail } from "./emailValidator.js";

const accountNameElement     = document.getElementById("account-name");
const accountSurnameElement  = document.getElementById("account-surname"); 
const accountEmailElement    = document.getElementById("account-email"); 
const accountMobileElement   = document.getElementById("account-mobile"); 
const accountLocationElement = document.getElementById("account-location");
const dashboardTitleElement  = document.getElementById("dashboard-title");

validatePageElements();


export function handleMobileUserInputField(e) {
    
    const MOBILE_NUMBER_INPUT_ID = "mobile";  

    if (e.target.id !== MOBILE_NUMBER_INPUT_ID) {
        return; 
    }

    const santizeMobileNumber = sanitizeText(e.target.value, true);

    try {
        if (santizeMobileNumber) {
            e.target.setCustomValidity("");  
            const formattedNumber = formatUKMobileNumber(santizeMobileNumber);
            e.target.value        = formattedNumber;
            accountMobileElement.textContent = formattedNumber;
            return;
        }
    } catch (error) {
        e.target.setCustomValidity(error.message); 
        e.target.reportValidity();  
        console.warn(error);  
    }

    e.target.value = santizeMobileNumber;
  
}


export function handleUserFirstNameInputField(e) {
    const NAME_INPUT_ID    = "first-name"; 
  
    if (e.target.id != NAME_INPUT_ID ) {
        return;
    }
    
    const sanitizedText            = sanitizeText(e.target.value, false, true, ["-"]); // allow for doubled barren names with hypens e.g John-Smith
    accountNameElement.textContent = toTitle(sanitizedText);
    e.target.value                 = sanitizedText;
    
    handleDashboardTitle(accountNameElement.textContent, accountSurnameElement.textContent);
}


export function handleUserSurnameInputField(e) {

    const SURNAME_INPUT_ID = "surname";
 
    if (e.target.id != SURNAME_INPUT_ID ) {
        return;
    }
    
    const sanitizedText               = sanitizeText(e.target.value, false, true); 
    accountSurnameElement.textContent = toTitle(sanitizedText);
    e.target.value                    = sanitizedText;
    handleDashboardTitle(accountNameElement.textContent, accountSurnameElement.textContent);
}


export function handleUserEmailInputField(e) {

    const EMAIL_INPUT_ID = "email";

    if (e.target.id != EMAIL_INPUT_ID) {
        return;
    }
    const includeChars   = ["@", '-', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '.'];
    const sanitizedEmail = sanitizeText(e.target.value, false, true, includeChars);

    e.target.value = sanitizedEmail;

    try {
        e.target.setCustomValidity("");
        isValidEmail(sanitizedEmail)
    } catch (error) {
        e.target.setCustomValidity(error.message);
        e.target.reportValidity();  
        console.warn(error);  
    }

    
}


export function handleUserLocationInputField(e) {
    handleInputField({e : e, id: "country", element : accountLocationElement, capitalize : true});
}


export function handleDashboardTitle(firstName='', surname='') {
 
    dashboardTitleElement.textContent = '';

    if (!firstName === '' || !surname === '') {
       
        console.warn("No first name or surname specified for dashboard")
        return;
    }

    const name                        = getFullName(firstName, surname);
    dashboardTitleElement.textContent = `Welcome ${toTitle(name)}`;
         
    
}


function handleInputField({e, id, element, capitalize=false, onlyChars=true, inclueChars=[" "] }) {
    
    if (e.target.id != id ) {
        return;
    }

    // if (e.target.value.startsWith("-")) {
    //     e.target.value = e.target.value.replace("-", "")
    // }

    let text;

    try {
        text  = onlyChars ? sanitizeText(e.target.value, false, true, inclueChars) : e.target.value;

    } catch (error) {
        text  = onlyChars ? sanitizeText(e.target.value, false, true, []) : e.target.value; // if errror is throw use  []
    }


    e.target.value       = onlyChars  ? text : e.target.value; 
    element.textContent  = capitalize ? toTitle(text) : text.toLowerCase();
}



function getFullName(firstName='', surname='') {
    if (typeof firstName != "string" || typeof surname != "string") {
        throw new Error(`The names must be string. Expected string but got ${firstName} ${surname}`);
    }
    return `${toTitle(firstName)} ${toTitle(surname)}`;
}



function validatePageElements() {
    checkIfHTMLElement(accountNameElement, "The account name element");
    checkIfHTMLElement(accountSurnameElement, "The account name element");
    checkIfHTMLElement(accountEmailElement, "The account email element");
    checkIfHTMLElement(accountMobileElement, "The account mobile element");
    checkIfHTMLElement(accountLocationElement, "The account location element");
    checkIfHTMLElement(dashboardTitleElement, "The dashboard title element");
    
}