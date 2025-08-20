document.addEventListener('DOMContentLoaded', () => {

    // --- Smooth Scrolling für alle Anker-Links ---
    const anchorLinks = document.querySelectorAll('a[href^="#"]');

    anchorLinks.forEach(link => {
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
    const animatedElements = [...sections];

    const elementObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target);
            }
        });
    }, {
        rootMargin: '0px',
        threshold: 0.1
    });

    animatedElements.forEach(el => {
        if (el) {
            el.classList.add('fade-in-section');
            elementObserver.observe(el);
        }
    });

    // Event Tracking for Package Selection
    const packageButtons = document.querySelectorAll('.pricing-box .cta-button');
    if (packageButtons) {
        packageButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const packageName = btn.dataset.package;
                if (typeof gtag === 'function' && packageName) {
                    gtag('event', 'select_content', {
                        'content_type': 'package',
                        'item_id': packageName
                    });
                }
            });
        });
    }

    // --- Formular-Einreichung behandeln ---
    const contactForm = document.getElementById('contact-form');
    const successMessage = document.getElementById('success-message');
    const formSection = document.getElementById('anfrage'); // Die ganze Sektion

    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();

            const form = e.target;
            const data = new FormData(form);
            const submitButton = form.querySelector('button[type="submit"]');
            submitButton.disabled = true;
            submitButton.textContent = 'Sende...';
            
            const scriptURL = 'https://script.google.com/macros/s/AKfycbwtiz83g3cGQwPdRKIrFFEBAiOZuUGbg_Y-Ms2_txzEouAxKF4eIYTIs4DYPhdjWXGm9w/exec';

            fetch(scriptURL, { method: 'POST', body: data})
                .then(response => response.json())
                .then(data => {
                    if (data.result === 'success') {
                        // Hide form elements
                        contactForm.style.display = 'none';
                        formSection.querySelector('.section-intro').style.display = 'none';
                        
                        // Show success message
                        successMessage.style.display = 'block';

                        // Scroll to the success message to prevent page jump
                        successMessage.scrollIntoView({ behavior: 'smooth', block: 'center' });

                        // GOOGLE ANALYTICS EVENT FOR SUCCESS
                        if (typeof gtag === 'function') {
                            gtag('event', 'form_submission_success', {
                                'content_type': 'contact_form',
                                'item_id': 'contact_form'
                            });
                        }
                    } else {
                        console.error('Error:', data.error);
                        alert('Es ist ein Fehler aufgetreten. Bitte versuchen Sie es später erneut.');
                        submitButton.disabled = false;
                        submitButton.textContent = 'Unverbindlich anfragen';
                    }
                })
                .catch(error => {
                    console.error('Fetch Error:', error);
                    alert('Es ist ein Fehler aufgetreten. Bitte versuchen Sie es später erneut.');
                    submitButton.disabled = false;
                    submitButton.textContent = 'Unverbindlich anfragen';
                });
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
                otherEventInput.value = '';
            }
        });
    }

});