// Assume this is private information and shouldn't be exposed in code
// Assume this is using an .env to get the data

export const config  = {
    SORT_CODE:"400217",
    ACCOUNT_NUMBER:"00327502",
    INITIAL_BALANCE: 0.00,
    PIN:1025,
    BANK_ACCOUNT_STORAGE_KEY: "bankAccount",
    CARD_STORAGE_KEY: "cards",
    WALLET_STORAGE_KEY: "wallet",
    PROFILE_KEY:"profile",
    NOTIFICATION_KEY: "notifications",
    isFundsUpdated: false,  
    loadFromCache: true,
 
}


export const openWindowsState = {

    isTransferCardWindowOpen: false,
    isRemoveCardWindowOpen: false,
    isCardManagerWindowOpen: false,
    isAddFundsWindowOpen: false,
    isAddNewCardWindowOpen: false,

    isAnyOpen: () => {
            return openWindowsState.isTransferCardWindowOpen || 
                        openWindowsState.isRemoveCardWindowOpen || 
                        openWindowsState.isAddFundsWindowOpen || 
                        openWindowsState.isAddFundsWindowOpen || 
                        openWindowsState.isAddNewCardWindowOpen;
        }
        
    
}


