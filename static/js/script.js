import { checkIfHTMLElement } from "./utils.js";



// elements
const dashboardElement       = document.getElementById("virtualbank-dashboard");
const profileDropdownElement = document.getElementById("profile-dropdown");

const run = {
    init: () => {
        validatePageElements();
    }
}

run.init();


// event listeners
dashboardElement.addEventListener("click", handleEventDelegation);
window.addEventListener('scroll', handleHideDropdownOnScroll);


function handleEventDelegation(e) {
    handleProfileIconClick(e);
}



function handleProfileIconClick(e) {

    const PROFILE_ICON_ID = "profile-icon-img";

    if (e.target.id === PROFILE_ICON_ID ) {
        profileDropdownElement.classList.toggle("show");
    }

    // Ensure that if the user clicks outside of the dropdown, it disappears
    if (e.target.id !== PROFILE_ICON_ID && profileDropdownElement.classList.contains("show") ) {
        profileDropdownElement.classList.remove("show");
    }

    
}



/**
 * Hides the dropdown menu when the user scrolls the page.
 */
function handleHideDropdownOnScroll() {
    const dropdown = document.querySelector('.dropdown.show');
    
    if (dropdown) {
        dropdown.classList.remove('show');
    }
}












function validatePageElements() {
    checkIfHTMLElement(dashboardElement, "Dashboard element section");
    checkIfHTMLElement(profileDropdownElement, "Dashboard element section");

}