const numOfCardTableRows = document.getElementById("card-requests-header");
const tableRowCounter    = document.getElementById("table-row-counter");


import { formatMaskedAccountNumber } from "../utils.js";


const tableBody = document.getElementById("card-requests-tbody");



/**
 * Creates the DOM elements required to build a request table row.
 *
 * @returns {Object} An object containing the table row and cell elements.
 */
function createTableElements() {

    const tr              = document.createElement("tr");
    const tdName          = document.createElement("td");
    const tdAccountNumber = document.createElement("td");
    const tdCardDetails   = document.createElement("td");
    const tdStatus        = document.createElement("td");
    const tdDate          = document.createElement("td");

    return { tr, tdName, tdAccountNumber, tdCardDetails, tdStatus, tdDate };
}




/**
 * Renders and inserts a request table row into the request table.
 *
 * This function takes a pre-built table data object and populates the
 * corresponding DOM elements with request information such as:
 * - card details (type and variant)
 * - account information
 * - request status
 * - timestamp (date and time)
 *
 * It then assembles the row and inserts it at the top of the request table.
 *
 * @param {Object} tableData - The table data object used to build the row.
 * @param {HTMLElement} tableData.tr - The table row element.
 * @param {HTMLElement} tableData.tdName - Cell containing the user's name.
 * @param {HTMLElement} tableData.tdAccountNumber - Cell containing the account number.
 * @param {HTMLElement} tableData.tdCardDetails - Cell containing card details.
 * @param {HTMLElement} tableData.tdStatus - Cell containing the request status.
 * @param {HTMLElement} tableData.tdDate - Cell containing the request date/time.
 * @param {Object} tableData.cardRequestDetails - Card request metadata.
 * @param {string} tableData.status - Current request status.
 * @param {string} tableData.date - Formatted request date.
 * @param {string} tableData.time - Formatted request time.
 *
 * @returns {void}
 */
function renderTableRow(tableData) {
    
    const {tr, tdName, tdAccountNumber, tdCardDetails, tdStatus, tdDate} = tableData;
    
    const cardRequestDetails = tableData.cardRequestDetails;
    const status             = tableData.status;
  
    tdStatus.classList.add("capitalise")

    tdCardDetails.innerHTML = `
        <p>${cardRequestDetails?.cardType}</p>
        <p class="text-muted">
            <small>${cardRequestDetails?.cardVariant}</small>
        </p>
    `;

    tdStatus.innerHTML = `
        <span class="status status--${status}">
            ${status}
        </span>
    `;

    tdDate.innerHTML = `
        <p>${tableData.date}</p>
        <p>
            <small>${tableData.time}</small>
        </p>
    `;

    tr.appendChild(tdName);
    tr.appendChild(tdAccountNumber);
    tr.appendChild(tdCardDetails);
    tr.appendChild(tdStatus);
    tr.appendChild(tdDate);

    tableBody.insertBefore(tr, tableBody.firstElementChild)
}






/**
 * Creates and inserts a new request table row based on request data.
 *
 * This function is responsible for preparing a table row model, populating
 * its base fields (name, account number, and formatting rules), and enriching
 * it with request metadata such as status and timestamps.
 * 
 * @param {Object} params - The request data used to build the table row.
 * @param {string} params.status - Current request status (e.g. approved, rejected).
 * @param {Object} params.cardRequestDetails - Card request metadata.
 * @param {Object} params.accountDetails - Account information for the request.
 * @param {string} params.date - Formatted request date.
 * @param {string} params.time - Formatted request time.
 * @param {boolean} [params.maskAccountNumber=true] - Whether to mask the account number in the UI.
 *
 * @returns {void}
 */
export function updateTable({status, cardRequestDetails, accountDetails, date, time, maskAccountNumber = true}) {

    const tableData = createTableElements();
    const { tr, tdName, tdAccountNumber, tdCardDetails, tdStatus, tdDate} = tableData;

    tdName.textContent = cardRequestDetails?.fullName || "N/A";

    tdAccountNumber.className = "flex-grid pt-16";

    if (maskAccountNumber) {
        tdAccountNumber.textContent = formatMaskedAccountNumber(accountDetails?.accountNumber?.toString());
    } else {
         tdAccountNumber.textContent = accountDetails?.accountNumber?.toString();
    }
 
    tableData.cardRequestDetails = cardRequestDetails;
    tableData.date = date;
    tableData.time = time;
    tableData.status = status;
  
    renderTableRow(tableData);
    updateTableRowCounter();
  
}



/**
 * Updates the table row counter displayed in the UI.
 *
 * This function retrieves the current number of rows in the table
 * and updates the `tableRowCounter` element accordingly.
 *
 * If the counter element is not available, the function exits early.
 *
 * @returns {void}
 */
function updateTableRowCounter() {
   if (!tableRowCounter) return;

   tableRowCounter.textContent = getNumOfTableRows();
}



/**
 * Retrieves the total number of rows in the table body.
 *
 * This function returns the current number of `<tr>` elements
 * inside the table body, representing all rendered table entries.
 *
 * @returns {number} The number of table rows currently in the table body.
 */
function getNumOfTableRows() {
    return tableBody.rows.length;
}