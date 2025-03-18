// alerts.js
function showAlert(icon = 'info', title = '', text = '', timer = 3000) {
    Swal.fire({
        icon: icon,
        title: title,
        text: text,
        showConfirmButton: false,
        timer: timer,
        timerProgressBar: true,
        toast: icon === 'success' || icon === 'info' || icon === 'warning' ? true : false,
        position: icon === 'success' || icon === 'info' || icon === 'warning' ? 'top-end' : 'center'
    });
}
