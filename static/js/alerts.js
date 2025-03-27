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

    async showConfirmationAlert({showDenyButton = true,  
        showCancelButton = true, 
        confirmButtonText = "Remove", 
        denyButtonText = "Don't remove", 
        title = "Do you want to remove these cards from your wallet?",
        icon = "info",
        cancelMessage = "Cards were not removed",
        messageToDisplayOnSuccess="removed!",
      } = {}) {
          return Swal.fire({
              title: title,
              showDenyButton: showDenyButton,
              showCancelButton: showCancelButton,
              confirmButtonText: confirmButtonText,
              denyButtonText: denyButtonText,
              icon: icon,
          }).then((result) => {
              if (result.isConfirmed) {
                  Swal.fire(messageToDisplayOnSuccess, "", "success");
                  return true;
              } else if (result.isDenied) {
                  Swal.fire(cancelMessage, "", "info");
                  return false;
              }
              return null;
          });
      }
 
};



