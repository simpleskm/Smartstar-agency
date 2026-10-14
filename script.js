
"use strict";

/* =========================================================
   SMARTSTAR DIGITAL
   Main Website JavaScript
   Version: 2.0
========================================================= */

document.addEventListener("DOMContentLoaded", () => {
    const prefersReducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
    ).matches;

    const header = document.querySelector(".header");
    const menuToggle = document.getElementById("menu-toggle");
    const navLinks = document.getElementById("nav-links");
    const backToTop = document.getElementById("backToTop");

    /* =====================================================
       1. ACCESSIBLE MOBILE NAVIGATION
    ===================================================== */

    function setMenuState(isOpen) {
        if (!menuToggle || !navLinks) return;

        navLinks.classList.toggle("active", isOpen);

        menuToggle.setAttribute("aria-expanded", String(isOpen));
        menuToggle.setAttribute(
            "aria-label",
            isOpen ? "Close navigation menu" : "Open navigation menu"
        );

        const menuIcon = menuToggle.querySelector("i");

        if (menuIcon) {
            menuIcon.classList.toggle("fa-bars", !isOpen);
            menuIcon.classList.toggle("fa-xmark", isOpen);
        }
    }

    if (menuToggle && navLinks) {
        // The existing HTML uses a div for the menu toggle.
        // Give it keyboard accessibility without changing the HTML.
        menuToggle.setAttribute("role", "button");
        menuToggle.setAttribute("tabindex", "0");
        menuToggle.setAttribute("aria-controls", "nav-links");
        menuToggle.setAttribute("aria-expanded", "false");
        menuToggle.setAttribute("aria-label", "Open navigation menu");

        menuToggle.addEventListener("click", () => {
            const isOpen = navLinks.classList.contains("active");
            setMenuState(!isOpen);
        });

        menuToggle.addEventListener("keydown", (event) => {
            if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();

                const isOpen = navLinks.classList.contains("active");
                setMenuState(!isOpen);
            }
        });

        navLinks.querySelectorAll("a").forEach((link) => {
            link.addEventListener("click", () => {
                setMenuState(false);
            });
        });

        document.addEventListener("keydown", (event) => {
            if (event.key === "Escape") {
                setMenuState(false);
            }
        });

        // Close the mobile menu when clicking outside it.
        document.addEventListener("click", (event) => {
            if (
                navLinks.classList.contains("active") &&
                !navLinks.contains(event.target) &&
                !menuToggle.contains(event.target)
            ) {
                setMenuState(false);
            }
        });

        // Close the menu when switching to desktop width.
        window.addEventListener("resize", () => {
            if (window.innerWidth > 768) {
                setMenuState(false);
            }
        });
    }

    /* =====================================================
       2. STICKY HEADER SCROLL EFFECT
    ===================================================== */

    function updateHeader() {
        if (!header) return;

        header.classList.toggle("scrolled", window.scrollY > 30);
    }

    /* =====================================================
       3. BACK-TO-TOP BUTTON
    ===================================================== */

    if (backToTop) {
        backToTop.setAttribute("role", "button");
        backToTop.setAttribute("tabindex", "0");
        backToTop.setAttribute("aria-label", "Back to top");

        function updateBackToTop() {
            backToTop.classList.toggle("show", window.scrollY > 400);
        }

        function goToTop() {
            window.scrollTo({
                top: 0,
                behavior: prefersReducedMotion ? "auto" : "smooth"
            });
        }

        backToTop.addEventListener("click", goToTop);

        backToTop.addEventListener("keydown", (event) => {
            if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                goToTop();
            }
        });

        updateBackToTop();
        window.addEventListener("scroll", updateBackToTop, {
            passive: true
        });
    }

    /* =====================================================
       4. ACTIVE NAVIGATION LINK
    ===================================================== */

    const sectionLinks = [
        ...document.querySelectorAll(
            '.nav-links a[href^="#"], .nav-links a[href*="#"]'
        )
    ];

    const pageSections = [
        ...document.querySelectorAll("main section[id], body > section[id]")
    ];

    function updateActiveNavigation() {
        if (!pageSections.length) return;

        const headerOffset = header
            ? header.getBoundingClientRect().height + 40
            : 100;

        let currentSection = "";

        pageSections.forEach((section) => {
            if (section.getBoundingClientRect().top <= headerOffset) {
                currentSection = section.id;
            }
        });

        sectionLinks.forEach((link) => {
            const hash = new URL(link.href, window.location.href).hash;
            const isActive = hash === `#${currentSection}`;

            link.classList.toggle("active", isActive);

            if (isActive) {
                link.setAttribute("aria-current", "location");
            } else {
                link.removeAttribute("aria-current");
            }
        });
    }

    /* =====================================================
       5. SMOOTH SCROLLING
    ===================================================== */

    document.querySelectorAll('a[href*="#"]').forEach((link) => {
        link.addEventListener("click", (event) => {
            const url = new URL(link.href, window.location.href);

            // Only intercept links pointing to this same page.
            if (
                url.origin !== window.location.origin ||
                url.pathname !== window.location.pathname ||
                !url.hash ||
                url.hash === "#"
            ) {
                return;
            }

            let target;

            try {
                target = document.querySelector(
                    decodeURIComponent(url.hash)
                );
            } catch {
                return;
            }

            if (!target) return;

            event.preventDefault();

            const headerHeight = header
                ? header.getBoundingClientRect().height
                : 0;

            const targetTop =
                target.getBoundingClientRect().top +
                window.scrollY -
                headerHeight -
                12;

            window.scrollTo({
                top: Math.max(0, targetTop),
                behavior: prefersReducedMotion ? "auto" : "smooth"
            });

            // Update the URL without forcing a page reload.
            history.pushState(null, "", url.hash);
        });
    });

    /* =====================================================
       6. SCROLL REVEAL ANIMATIONS
    ===================================================== */

    const revealSelectors = [
        ".section-title",
        ".about-image",
        ".about-content",
        ".service-card",
        ".why-card",
        ".project-card",
        ".stat-card",
        ".testimonial-card",
        ".contact-info",
        ".contact-form"
    ];

    const revealElements = document.querySelectorAll(
        revealSelectors.join(", ")
    );

    if (prefersReducedMotion || !("IntersectionObserver" in window)) {
        revealElements.forEach((element) => {
            element.classList.add("show");
        });
    } else {
        const revealObserver = new IntersectionObserver(
            (entries, observer) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add("show");
                        observer.unobserve(entry.target);
                    }
                });
            },
            {
                threshold: 0.12,
                rootMargin: "0px 0px -35px 0px"
            }
        );

        revealElements.forEach((element) => {
            // Add the animation class only when JavaScript is available.
            element.classList.add("fade-up");
            revealObserver.observe(element);
        });
    }

    /* =====================================================
       7. ANIMATED STATISTICS
    ===================================================== */

    const statNumbers = document.querySelectorAll(".stat-card h2");

    function animateCounter(element) {
        if (element.dataset.animated === "true") return;

        const originalText = element.textContent.trim();
        const match = originalText.match(
            /^([^0-9]*)([0-9][0-9,]*)(.*)$/
        );

        if (!match) return;

        const prefix = match[1];
        const target = Number(match[2].replace(/,/g, ""));
        const suffix = match[3];

        if (!Number.isFinite(target)) return;

        element.dataset.animated = "true";

        if (prefersReducedMotion || target === 0) {
            element.textContent = originalText;
            return;
        }

        const duration = 1400;
        let startTime = null;

        function step(timestamp) {
            if (startTime === null) startTime = timestamp;

            const progress = Math.min(
                (timestamp - startTime) / duration,
                1
            );

            // Ease out smoothly.
            const easedProgress = 1 - Math.pow(1 - progress, 3);
            const currentValue = Math.floor(target * easedProgress);

            element.textContent =
                prefix +
                currentValue.toLocaleString() +
                suffix;

            if (progress < 1) {
                requestAnimationFrame(step);
            } else {
                element.textContent = originalText;
            }
        }

        requestAnimationFrame(step);
    }

    if ("IntersectionObserver" in window && !prefersReducedMotion) {
        const statsObserver = new IntersectionObserver(
            (entries, observer) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        animateCounter(entry.target);
                        observer.unobserve(entry.target);
                    }
                });
            },
            { threshold: 0.5 }
        );

        statNumbers.forEach((number) => {
            statsObserver.observe(number);
        });
    }

    /* =====================================================
       8. FORM STATUS MESSAGES
    ===================================================== */

    function getFormStatus(form, id) {
        let status = form.querySelector(`#${id}`);

        if (!status) {
            status = document.createElement("p");
            status.id = id;
            status.className = "form-status";
            status.setAttribute("role", "status");
            status.setAttribute("aria-live", "polite");
            form.appendChild(status);
        }

        return status;
    }

    function showFormStatus(status, message, isError = false) {
        status.textContent = message;
        status.classList.toggle("error", isError);
        status.classList.toggle("success", !isError);
    }

    /* =====================================================
       9. CONTACT FORM VALIDATION
    ===================================================== */

    const contactForm = document.getElementById("contact-form");

    if (contactForm) {
        const contactStatus = getFormStatus(
            contactForm,
            "contact-form-status"
        );

        contactForm.addEventListener("submit", (event) => {
            event.preventDefault();

            if (!contactForm.checkValidity()) {
                contactForm.reportValidity();

                showFormStatus(
                    contactStatus,
                    "Please complete all required fields correctly.",
                    true
                );

                return;
            }

            const formData = new FormData(contactForm);
            const name = String(formData.get("name") || "").trim();
            const email = String(formData.get("email") || "").trim();
            const interest = String(
                formData.get("interest") || ""
            ).trim();
            const message = String(
                formData.get("message") || ""
            ).trim();

            const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

            if (!name || !interest || !message) {
                showFormStatus(
                    contactStatus,
                    "Please complete all required fields.",
                    true
                );
                return;
            }

            if (!emailPattern.test(email)) {
                showFormStatus(
                    contactStatus,
                    "Please enter a valid email address.",
                    true
                );
                return;
            }

            // No backend is connected yet, so do not claim the
            // enquiry has been sent or erase the user's message.
            showFormStatus(
                contactStatus,
                "Your details look good, but this website's contact form is not connected to an email service yet. Your message has not been sent. Please connect a form backend before publishing."
            );
        });
    }

    /* =====================================================
       10. NEWSLETTER FORM
    ===================================================== */

    document.querySelectorAll(".newsletter").forEach((form) => {
        const emailInput = form.querySelector('input[type="email"]');
        const submitButton = form.querySelector('button[type="submit"]');

        if (emailInput) {
            emailInput.required = true;
            emailInput.setAttribute("aria-label", "Email address");
        }

        if (submitButton) {
            submitButton.type = "submit";
        }

        const newsletterStatus = getFormStatus(
            form,
            "newsletter-status"
        );

        form.addEventListener("submit", (event) => {
            event.preventDefault();

            if (!form.checkValidity()) {
                form.reportValidity();

                showFormStatus(
                    newsletterStatus,
                    "Please enter a valid email address.",
                    true
                );

                return;
            }

            showFormStatus(
                newsletterStatus,
                "Your email is valid, but newsletter subscriptions are not connected to an email marketing service yet. You have not been subscribed."
            );
        });
    });

    /* =====================================================
       11. HERO BUTTON MICRO-INTERACTIONS
    ===================================================== */

    if (!prefersReducedMotion) {
        document.querySelectorAll(".hero-buttons .btn-primary, .hero-buttons .btn-secondary")
            .forEach((button) => {
                button.addEventListener("pointerenter", () => {
                    button.classList.add("is-hovered");
                });

                button.addEventListener("pointerleave", () => {
                    button.classList.remove("is-hovered");
                });
            });
    }

    /* =====================================================
       12. INITIALIZE SCROLL-BASED FEATURES
    ===================================================== */

    function updateScrollFeatures() {
        updateHeader();
        updateActiveNavigation();
    }

    updateScrollFeatures();

    window.addEventListener("scroll", updateScrollFeatures, {
        passive: true
    });

    window.addEventListener("resize", updateActiveNavigation);

    window.addEventListener("load", () => {
        updateScrollFeatures();
    });
});
