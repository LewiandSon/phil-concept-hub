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

});