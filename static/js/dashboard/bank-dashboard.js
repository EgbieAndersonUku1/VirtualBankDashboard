const dashboardProfileElement = document.getElementById("dashboard-profile");
const dropdownMenu            = document.getElementById("dashboard__container__dropdown-menu");


// TODO add one time checker here

dashboardProfileElement.addEventListener("click", handleDropDownMenu)


function handleDropDownMenu(e) {
    const profileImg = e.target.closest("img");
    if (profileImg) {
        dropdownMenu.classList.toggle("show")
    } 
}


