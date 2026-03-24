import { selectElement, toggleSpinner, toTitle } from "../utils.js";
import { warnError } from "../logger.js";
import { parseFormData } from "../formUtils.js";
import { AlertUtils } from "../alerts.js";


const transferSection  = document.getElementById("dashboard-transfer");
const recipientSelects = document.getElementById("recipient")
const addRecipient     = document.getElementById("add-recipient-section")
const findRecipientForm    =  document.getElementById("find-recipient-form");
const addRecipientSpinner = document.getElementById("add-recipient__spinner");
const verifiedUserPanel   = document.getElementById("transfer-to-user");
const verifiedUserName    = document.getElementById("verified-user-name")


// todo add one time check if static elements exists before calling them in functions


transferSection.addEventListener("click", handleDelegation);
recipientSelects.addEventListener("change", handleRecipientSelection);
findRecipientForm.addEventListener("submit", handleFindRecipientFormSubmission)


function handleDelegation(e) {
 
    handleRecipientSelectionClose(e);
    console.log(e.target)
  
   
}



function handleRecipientSelection(e) {
    if (e.target.dataset.recipient !== "true") return;

    toggleFindRecipient()
}


function toggleFindRecipient(show = true) {
    const booleanType = typeof show;

    if (booleanType !== "boolean") {
        warnError("toggleFindRecipient", {
            type: booleanType,
            msg: "Expected a boolean",
            received: `Received a value of ${show}`

        })
        return;
    }
  

    if (show) {
        selectElement(addRecipient, "show");
        return;
    }
   
    addRecipient.classList.remove("show");
    recipientSelects.value = "";
}


function handleRecipientSelectionClose(e) {
    if (e.target.id !== "find-recipient-close-btn") return;
  
    toggleFindRecipient(false)

}




function getParseFormData() {
      const formData = new FormData(findRecipientForm);
        const requiredFields = [
           "first_name",
           "surname",
           "sortcode_1",
           "sortcode_2",
           "sortcode_3",
           "sortcode_4",
           "sortcode_5",
           "sortcode_6",
           "account_digit_1",
           "account_digit_2",
           "account_digit_3",
           "account_digit_4",
           "account_digit_5",
           "account_digit_6",
           "account_digit_7",
           "account_digit_8",
        
        ];
    
        const parsedFormData = parseFormData(formData, requiredFields);
        return parsedFormData;
}




function getAccountDetailsFromData(data){
    
    if (typeof data !== "object") {
        warnError("getAccountNumberFromData", {
            type: typeof data,
            expected: "Expected an object",
            received: `Value received ${data}`
        });
        return;
    }

    const sortCode      = [];
    const accountNumber = []
    const account       = {}

    for (const [key, value] of Object.entries(data)) {
    
        if (key.startsWith("sort")) {
            sortCode.push(value)
        }
        
        if (key.startsWith("account")) {
            accountNumber.push(value)
        }
    }

    account.sortCode = sortCode.join("");
    account.accountNumber  = accountNumber.join("");
    return account

}

function handleFindRecipientFormSubmission(e) {
    e.preventDefault();
    const MILL_SECONDS = 1000;
    const parsedFormData = getParseFormData();
    const accountDetails = getAccountDetailsFromData(parsedFormData)
    
    toggleSpinner(addRecipientSpinner, true, true)
    setTimeout(() => {
         toggleSpinner(addRecipientSpinner, false, true)
          const isAccountNumberCorrect = isAccountDetailsCorrect(accountDetails);

           console.log(isAccountNumberCorrect)
            // Simulated message for testing.
            // When the backend is built it will verify the account via fetch.
            if (isAccountNumberCorrect) {
                AlertUtils.showAlert({
                    title: "Account recipient found",
                    text: "The recipient account was found. You can proceed with the transfer.",
                    icon: "success",
                    confirmButtonText: "OK"
                })
                toggleFindRecipient(false);
                showVerifiedUser(parsedFormData.firstName, parsedFormData.surname)
                return
            } else {
                AlertUtils.showAlert({
                    title: "Account recipient not found",
                    text: "No matching account was found. For this simulation the sort code must start with the digits 400.",
                    icon: "error",
                    confirmButtonText: "OK"
                })
            }
    }, MILL_SECONDS)
    

}


function isAccountDetailsCorrect(accountDetails) {
    if (typeof accountDetails !== "object") {
        warnError("verifyAccountDetails", {
            type: typeof accountDetails,
            expected: "Expected an object",
            received: `Value received ${accountDetails}`
        });
        return;
    }

    console.log(accountDetails);

    // for now we simulate the authentication respoonse. Later the actually authentication response data will come from the backend
    const isSortCodeValid = accountDetails.sortCode.startsWith("400");
   
    return isSortCodeValid ? true : false;


};



function showVerifiedUser(firstName, surname) {
    // console.log(firstName);
    // console.log(surname)
    if (!(firstName && surname)) return;

    if (typeof firstName !== "string" && typeof surname !== "string") {
        warnError("showVerifiedUser", {
            firstName: firstName,
            surname: surname,
            firstNameType: typeof firstName,
            surnameType: typeof surname,
            expected: "Expected both values to be string"
        })
        return;
    }
    // console.log("I am here")
    selectElement(verifiedUserPanel, "show");
    verifiedUserName.textContent = `${toTitle(firstName)} ${toTitle(surname)}`
    
}