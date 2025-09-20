import Swal from 'sweetalert2';

export const showSuccess = async (title: string, text?: string, timer = 2000) => {
  return await Swal.fire({
    title,
    text,
    icon: 'success',
    confirmButtonColor: '#059669',
    timer,
    timerProgressBar: true,
  });
};

export const showError = async (title: string, text?: string) => {
  return await Swal.fire({
    title,
    text,
    icon: 'error',
    confirmButtonColor: '#dc2626',
  });
};

export const showWarning = async (title: string, text?: string) => {
  return await Swal.fire({
    title,
    text,
    icon: 'warning',
    confirmButtonColor: '#dc2626',
  });
};

export const showConfirm = async (title: string, html?: string, confirmText = 'Yes, delete it!') => {
  return await Swal.fire({
    title,
    html,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#dc2626',
    cancelButtonColor: '#6b7280',
    confirmButtonText: confirmText,
    cancelButtonText: 'Cancel',
    focusCancel: true,
  });
};

export const showInfo = async (title: string, text?: string) => {
  return await Swal.fire({
    title,
    text,
    icon: 'info',
    confirmButtonColor: '#3b82f6',
  });
};

export const showLoading = (title = 'Loading...') => {
  Swal.fire({
    title,
    allowEscapeKey: false,
    allowOutsideClick: false,
    didOpen: () => {
      Swal.showLoading();
    }
  });
};

export const hideLoading = () => {
  Swal.close();
};

// Common alert patterns
export const confirmDelete = async (entityName: string, entityType = 'item') => {
  return await showConfirm(
    `Delete ${entityType}?`,
    `Are you sure you want to delete <strong>${entityName}</strong>?<br><br>This action cannot be undone.`
  );
};

export const showDeleteSuccess = async (entityType = 'item') => {
  return await showSuccess('Deleted!', `${entityType} has been deleted successfully.`);
};

export const showSaveSuccess = async (entityType = 'item', isEdit = false) => {
  return await showSuccess('Success!', `${entityType} ${isEdit ? 'updated' : 'created'} successfully!`);
};

export const showSaveError = async (entityType = 'item', isEdit = false) => {
  return await showError('Error!', `Failed to ${isEdit ? 'update' : 'create'} ${entityType}`);
};

export const showDeleteError = async (entityType = 'item') => {
  return await showError('Error!', `Failed to delete ${entityType}. Please try again.`);
};