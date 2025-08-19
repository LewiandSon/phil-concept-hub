document.addEventListener('DOMContentLoaded', () => {

    // --- Smooth Scrolling für Navigations-Links ---
    const navLinks = document.querySelectorAll('.main-nav a[href^="#"]');

    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            let targetId = this.getAttribute('href');
            let targetElement = document.querySelector(targetId);

            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // --- Sektionen beim Scrollen einblenden (Fade-in-Effekt) ---
    const sections = document.querySelectorAll('section');

    // Wir müssen den .hero-content manuell hinzufügen, da es keine <section> ist
    const animatedElements = [...sections, document.querySelector('.hero-content')];


    const elementObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target);
            }
        });
    }, {
        rootMargin: '0px',
        threshold: 0.1 // Element wird sichtbar, wenn 10% davon im Viewport sind
    });

    animatedElements.forEach(el => {
        if (el) { // Sicherstellen, dass das Element existiert
            el.classList.add('fade-in-section'); // Füge die Basis-Animationsklasse hinzu
            elementObserver.observe(el);
        }
    });

    // --- Modal / Popup Logik ---
    const modal = document.getElementById('booking-modal');
    const openModalBtns = document.querySelectorAll('.open-modal-btn');
    const closeModalBtn = document.querySelector('.close-modal-btn');

    const openModal = () => { if(modal) modal.style.display = 'block'; };
    const closeModal = () => { if(modal) modal.style.display = 'none'; };

    openModalBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            openModal();
            // Google Analytics Event senden
            if (typeof gtag === 'function') {
                gtag('event', 'generate_lead', {
                    'event_category': 'engagement',
                    'event_label': 'Jetzt Buchen Button Klick'
                });
            }
        });
    });
    if(closeModalBtn) closeModalBtn.addEventListener('click', closeModal);

    // Schließen bei Klick außerhalb des Modals
    window.addEventListener('click', (event) => {
        if (event.target == modal) {
            closeModal();
        }
    });


    // --- Formular-Einreichung behandeln ---
    const contactForm = document.getElementById('contact-form');
    const formWrapper = document.getElementById('form-wrapper'); // existiert nicht mehr, muss angepasst werden
    const successMessage = document.getElementById('success-message');

    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault(); // Verhindert das Neuladen der Seite

            const formContent = this; // das Formular selbst
            const modalContent = this.parentElement; // der übergeordnete .modal-content div

            // Hier würde man normalerweise die Formulardaten an einen Server senden.
            if (formContent && successMessage) {
                // Blende alle Elemente im modal-content außer der Erfolgsnachricht aus
                Array.from(modalContent.children).forEach(child => {
                    if(child.id !== 'success-message') child.style.display = 'none';
                });
                successMessage.style.display = 'block';
            }
        });
    }

    // --- Logik für "Anderes" Dropdown ---
    const eventTypeSelect = document.getElementById('event-type-select');
    const otherEventWrapper = document.getElementById('other-event-wrapper');
    const otherEventInput = document.getElementById('other-event-type-input');

    if (eventTypeSelect && otherEventWrapper && otherEventInput) {
        eventTypeSelect.addEventListener('change', function() {
            if (this.value === 'Anderes') {
                otherEventWrapper.style.display = 'block';
                otherEventInput.required = true;
            } else {
                otherEventWrapper.style.display = 'none';
                otherEventInput.required = false;
                otherEventInput.value = ''; // Feld leeren
            }
        });
    }

});