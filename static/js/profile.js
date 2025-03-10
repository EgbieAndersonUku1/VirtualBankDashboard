import { formatUKMobileNumber, sanitizeText } from "./utils.js"


export function handleMobileUserInputField(e) {
    
    const MOBILE_NUMBER_INPUT_ID = "mobile";  

    if (e.target.id !== MOBILE_NUMBER_INPUT_ID) {
        return; 
    }

    const mobileNumber = sanitizeText(e.target.value, true);

    try {
        if (mobileNumber) {
            e.target.setCustomValidity("");  
            const formattedNumber = formatUKMobileNumber(mobileNumber);
            e.target.value        = formattedNumber;
            return;
        }
    } catch (error) {
        e.target.setCustomValidity(error.message); 
        e.target.reportValidity();  
        console.warn(error);  
    }

    e.target.value = mobileNumber;
}