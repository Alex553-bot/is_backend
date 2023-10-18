function showNotification(message) {
    const modalBackground = document.getElementById('modalBackground');
    const notificationModal = document.getElementById('notificationModal');
    const notificationMessage = document.getElementById('notificationMessage');

    notificationMessage.textContent = message;
    modalBackground.style.display = 'block';
    notificationModal.style.display = 'block';

    setTimeout(() => {
        closeNotification();
    }, 5000);
}

function closeNotification() {
    const modalBackground = document.getElementById('modalBackground');
    const notificationModal = document.getElementById('notificationModal');

    modalBackground.style.display = 'none';
    notificationModal.style.display = 'none';
}

const closeModalButton = document.getElementById('closeModal');
if (closeModalButton) {
    closeModalButton.addEventListener('click', closeNotification);
}

const form = document.querySelector('form');
if (form) {
    form.addEventListener('submit', async (event) => {
        event.preventDefault();
        const formData = new FormData(form);
        //showNotification('Procesando...');
        try {
            const response = await fetch('/registrarPlatillo', {
                method: 'POST',
                body: formData
            });

            if (response.ok) {
                const data = await response.json();
                showNotification(data.message);
                form.reset(); 
            } else {
                showNotification('Error en la solicitud al servidor');
            }
        } catch (error) {
            console.error(error);
            showNotification('Error interno del cliente');
        }
    });
}