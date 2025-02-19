// public/js/main.js
document.addEventListener('DOMContentLoaded', function() {
    // Add mobile menu toggle functionality if needed
    const userMenu = document.querySelector('.user-menu');
    if (userMenu) {
        userMenu.addEventListener('click', function() {
            // Add user menu dropdown functionality
        });
    }

    // Add active state to current page
    const currentPath = window.location.pathname;
    document.querySelectorAll('.nav-item').forEach(item => {
        if (item.getAttribute('href') === currentPath) {
            item.classList.add('active');
        }
    });
});