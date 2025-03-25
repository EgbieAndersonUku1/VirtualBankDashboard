export const AlertUtils = {
    /**
     * Show a SweetAlert2 alert.
     *
     * @param {Object} options - The options for the alert.
     * @param {string} options.title - The title of the alert.
     * @param {string} options.text - The text content of the alert.
     * @param {string} options.icon - The icon to display in the alert. 
     *                                Available options: 'success', 'error', 'warning', 'info', 'question'.
     * @param {string} options.confirmButtonText - The text for the confirm button.
     */
    showAlert({ title, text, icon, confirmButtonText }) {
        Swal.fire({
            title: title,
            text: text,
            icon: icon,
            confirmButtonText: confirmButtonText
        });
    },
 
};



