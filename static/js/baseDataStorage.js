import { getLocalStorage, setLocalStorage } from "./db.js";
import { warnError, logError } from "./logger.js";


// Base class to handle common logic
export class DataStorage {

    static fromStorage(data, selectedKeys, fallback = {}) {
        let obj;

        if (typeof data === 'string') {
            try {
                obj = JSON.parse(data);
            } catch (error) {
                logError(`Failed to parse JSON data: ${error.message}`)
                return fallback;
            }
        } else if (typeof data === 'object' && data !== null) {
            obj = data;
        } else {
            console.error(`Invalid data type: Expected an object or a JSON string but received ${typeof data}`);
            return fallback;
        }

        if (!Array.isArray(selectedKeys)) {
            throw new TypeError(`The required keys must be an array. Expected an array but got ${typeof selectedKeys}`);
        }

        if (selectedKeys.length === 0) {
            throw new Error("The required keys cannot be an empty array.");
        }

        const selectedProps = {};
        for (const key of selectedKeys) {
            if (obj.hasOwnProperty(key)) {
                selectedProps[key] = obj[key];
            } else {

                warnError("fromStorage", `"${key}" not found in the provided data.`)
            }
        }

        return selectedProps;
    }

    /**
     * Saves data to a specified key within the localStorage under a given name.
     * If the storage key does not exist, it creates a new storage object.
     * 
     * @param {string} storageKey - The primary key to store data under in localStorage.
     * @param {string} saveAs - The name of the sub-key under the storage key where data will be saved.
     * @param {*} data - The data to be saved in localStorage (can be of any type).
     * @returns {boolean} - Returns true if the data is successfully saved, otherwise false.
     */
    static saveData(storageKey, saveAs, data) {

        if (typeof storageKey !== 'string' || storageKey.trim() === '') {
            throw new TypeError("The 'storageKey' must be a non-empty string.");
        }

        if (typeof saveAs !== 'string' || saveAs.trim() === '') {
            throw new TypeError("The 'saveAs' must be a non-empty string.");
        }

        if (data === null || data === undefined) {
            throw new TypeError("The 'data' to save cannot be null or undefined.");
        }


        let storage = getLocalStorage(storageKey);
        if (Array.isArray(storage)) {
            warnError("saveData", `No data found for storage card key: ${storageKey}`);
            warnError("saveData", `Creating a new storage object for key: ${storageKey}`);
            storage = { [storageKey]: {} };
        }

        try {

            storage[storageKey][saveAs] = data;
            setLocalStorage(storageKey, storage);
            return true;

        } catch (error) {
            const errorMsg = `Error occured with key ${storageKey} while trying to save as ${saveAs} for data: ${error}`;
            logError("save", errorMsg);
            return false;
        }
    }
}
