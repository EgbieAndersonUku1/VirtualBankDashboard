import { warnError } from "./logger.js";


export function setLocalStorage(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
        console.error('LocalStorage set error:', error);
    }
}



export function getLocalStorage(key) {
    try {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : [];
    } catch (error) {
        console.error('LocalStorage get error:', error);
        return [];
    }
}



export function removeSingleItemFromLocalStorage(key) {
    try {
        localStorage.removeItem(key);
        return true;

    } catch (error) {
        warnError("removeSingleItemFromLocalStorage", {
            error: "Failed to remove an item form the local storage"
        })
        return false;
    }
}


export function removeFromLocalStorage(key, id) {
    const items = getLocalStorage(key);

    if (items && Array.isArray(items)) {
        const newItems = filterItemsById(items, id);

        if (newItems.length !== items.length) { 
            setLocalStorage(key, newItems);
        } else {
            console.log(`Item with id ${id} was not found in ${key}.`);
        }

    } else {
        console.log(`Attempted to remove item with id ${id} but the key "${key}" does not exist or is not an array.`);
    }
}


