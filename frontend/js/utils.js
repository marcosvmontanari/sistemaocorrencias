function showToast(message, type = "primary") {
    const toast = document.getElementById("toastMessage");
    const toastBody = document.getElementById("toastBody");

    toast.className = `toast align-items-center text-bg-${type} border-0`;
    toastBody.textContent = message;

    const toastBootstrap = new bootstrap.Toast(toast);
    toastBootstrap.show();
}
