// Funciones globales de la aplicación

// Formatear moneda
function formatCurrency(amount) {
    return 'S/ ' + parseFloat(amount).toFixed(2);
}

// Formatear fecha
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-PE', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Confirmación antes de eliminar
function confirmDelete(message) {
    return confirm(message || '¿Está seguro de eliminar este elemento?');
}

// Mostrar alerta
function showAlert(message, type = 'info') {
    alert(message);
}

// Inicialización
document.addEventListener('DOMContentLoaded', function() {
    // Auto-focus en inputs
    const autoFocusInputs = document.querySelectorAll('[autofocus]');
    autoFocusInputs.forEach(input => input.focus());
    
    // Manejar formularios con confirmación
    const formsWithConfirmation = document.querySelectorAll('[data-confirm]');
    formsWithConfirmation.forEach(form => {
        form.addEventListener('submit', function(e) {
            const message = this.getAttribute('data-confirm');
            if (!confirm(message)) {
                e.preventDefault();
            }
        });
    });
    
    // Manejar botones de eliminación
    const deleteButtons = document.querySelectorAll('[data-delete]');
    deleteButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            const message = this.getAttribute('data-delete');
            if (!confirmDelete(message)) {
                e.preventDefault();
                e.stopImmediatePropagation();
            }
        });
    });
});