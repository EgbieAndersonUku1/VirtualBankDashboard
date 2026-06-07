import { renderTable } from "./table.js";
import { db, searchDb } from "./db.js";
import { debounce } from "../utils.js";

const searchInputField = document.getElementById("search-request-search-field");

const handleSearchDebounced = debounce(handleSearch, 300);

searchInputField.addEventListener("input", handleSearchDebounced);



/**
 * Handles live table search input.
 *
 * Filters card requests based on the user's search query and
 * re-renders the table with matching results. If the search
 * field is empty, all records are displayed.
 *
 * @param {Event} e - The input event from the search field.
 */
function handleSearch(e) {
    const query = e.target.value.trim();
    const rows = query ? searchDb(query) : db;
    renderTable(rows);
}



