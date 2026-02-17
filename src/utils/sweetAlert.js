import Swal from 'sweetalert2';

// Success alert
export const showSuccess = (message) => {
  return Swal.fire({
    title: 'Success!',
    text: message,
    icon: 'success',
    confirmButtonColor: '#3085d6',
  });
};

// Error alert
export const showError = (message) => {
  return Swal.fire({
    title: 'Error!',
    text: message,
    icon: 'error',
    confirmButtonColor: '#3085d6',
  });
};

// Warning alert
export const showWarning = (message) => {
  return Swal.fire({
    title: 'Warning!',
    text: message,
    icon: 'warning',
    confirmButtonColor: '#3085d6',
  });
};

// Info alert
export const showInfo = (message) => {
  return Swal.fire({
    title: 'Info',
    text: message,
    icon: 'info',
    confirmButtonColor: '#3085d6',
  });
};

// Confirmation dialog
export const showConfirmation = (message, confirmButtonText = 'Yes') => {
  return Swal.fire({
    title: 'Confirmation',
    text: message,
    icon: 'question',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: confirmButtonText
  });
};

// Advanced confirm dialog with custom title, message, and button text
export const showConfirm = async (title, message, confirmText = 'Yes', cancelText = 'No') => {
  const result = await Swal.fire({
    title: title,
    html: message.replace(/\n/g, '<br>'),
    icon: 'question',
    showCancelButton: true,
    confirmButtonColor: '#10B981', // Green color for confirm
    cancelButtonColor: '#6B7280', // Gray for cancel
    confirmButtonText: confirmText,
    cancelButtonText: cancelText,
    allowOutsideClick: false,
    allowEscapeKey: true,
    allowEnterKey: true,
    focusConfirm: false,
    focusCancel: true, // Focus on cancel by default for safety
    showClass: {
      popup: 'animate__animated animate__fadeIn faster'
    },
    hideClass: {
      popup: 'animate__animated animate__fadeOut faster'
    }
  });
  
  return result.isConfirmed;
}; 