// Main JavaScript File - main.js
import Config from './config.js';
import Utils from './utils.js';
import Preloader from './modules/preloader.js';
import Navigation from './modules/navigation.js';
import Theme from './modules/theme.js';
import Animation from './modules/animation.js';
import Upload from './modules/upload.js';
import Contact from './modules/contact.js';
import Notification from './modules/notification.js';
import Modal from './modules/modal.js';

class PrintHub3D {
    constructor() {
        this.config = Config;
        this.utils = Utils;
        this.modules = {};
        this.init();
    }

    init() {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.initializeApp());
        } else {
            this.initializeApp();
        }
    }

    initializeApp() {
        try {
            // Initialize modules
            this.initializeModules();

            // Setup event listeners
            this.setupEventListeners();

            // Initialize features
            this.initializeFeatures();

            console.log('PrintHub3D Application initialized successfully');
        } catch (error) {
            console.error('Failed to initialize application:', error);
            this.modules.notification?.show('Application initialization failed', 'error');
        }
    }

    initializeModules() {
        // Core modules
        this.modules.preloader = new Preloader();
        this.modules.navigation = new Navigation();
        this.modules.theme = new Theme();
        this.modules.animation = new Animation();

        // Feature modules
        this.modules.upload = new Upload();
        this.modules.contact = new Contact();

        // UI modules
        this.modules.notification = new Notification();
        this.modules.modal = new Modal();
    }

    setupEventListeners() {
        // Window events
        window.addEventListener('resize', this.utils.debounce(() => {
            this.handleResize();
        }, 250));

        window.addEventListener('scroll', this.utils.throttle(() => {
            this.handleScroll();
        }, 100));

        // Document events
        document.addEventListener('visibilitychange', () => {
            this.handleVisibilityChange();
        });

        // Custom events
        window.addEventListener('app:notify', (e) => {
            this.modules.notification.show(e.detail.message, e.detail.type);
        });
    }

    initializeFeatures() {
        // Hero counter animation
        this.initializeCounters();

        // Portfolio filters
        this.initializePortfolio();

        // Smooth scroll
        this.initializeSmoothScroll();

        // Back to top button
        this.initializeBackToTop();

        // Newsletter form
        this.initializeNewsletter();
    }

    initializeCounters() {
        const counters = document.querySelectorAll('.stat-number');
        const observerOptions = {
            threshold: 0.5,
            rootMargin: '0px'
        };

        const counterObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const counter = entry.target;
                    const target = parseInt(counter.parentElement.dataset.count);
                    this.animateCounter(counter, target);
                    counterObserver.unobserve(counter);
                }
            });
        }, observerOptions);

        counters.forEach(counter => {
            counterObserver.observe(counter);
        });
    }

    animateCounter(element, target) {
        const duration = 2000;
        const start = 0;
        const increment = target / (duration / 16);
        let current = start;

        const updateCounter = () => {
            current += increment;
            if (current < target) {
                element.textContent = Math.floor(current);
                requestAnimationFrame(updateCounter);
            } else {
                element.textContent = target + (element.parentElement.querySelector('.stat-label').textContent.includes('%') ? '%' : '+');
            }
        };

        updateCounter();
    }

    initializePortfolio() {
        const filterButtons = document.querySelectorAll('.filter-btn');
        const portfolioItems = document.querySelectorAll('.portfolio-item');

        filterButtons.forEach(button => {
            button.addEventListener('click', () => {
                const filter = button.dataset.filter;

                // Update active button
                filterButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');

                // Filter items
                portfolioItems.forEach(item => {
                    if (filter === 'all' || item.dataset.category === filter) {
                        item.style.display = 'block';
                        item.classList.add('fade-in');
                    } else {
                        item.style.display = 'none';
                        item.classList.remove('fade-in');
                    }
                });
            });
        });
    }

    initializeSmoothScroll() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                const href = anchor.getAttribute('href');
                if (href === '#') return;

                e.preventDefault();
                const target = document.querySelector(href);

                if (target) {
                    const offsetTop = target.offsetTop - 80;
                    window.scrollTo({
                        top: offsetTop,
                        behavior: 'smooth'
                    });
                }
            });
        });
    }

    initializeBackToTop() {
        const backToTopBtn = document.getElementById('backToTop');

        window.addEventListener('scroll', () => {
            if (window.scrollY > 500) {
                backToTopBtn.classList.add('show');
            } else {
                backToTopBtn.classList.remove('show');
            }
        });

        backToTopBtn.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

    initializeNewsletter() {
        const newsletterForm = document.getElementById('newsletterForm');

        if (newsletterForm) {
            newsletterForm.addEventListener('submit', (e) => {
                e.preventDefault();

                const email = newsletterForm.querySelector('input[type="email"]').value;

                // Simulate form submission
                this.modules.notification.show('Đăng ký newsletter thành công!', 'success');
                newsletterForm.reset();
            });
        }
    }

    handleResize() {
        // Handle responsive adjustments
        const isMobile = window.innerWidth < 768;

        if (isMobile) {
            // Mobile specific adjustments
            document.body.classList.add('is-mobile');
        } else {
            document.body.classList.remove('is-mobile');
            // Close mobile menu if open
            this.modules.navigation?.closeMobileMenu();
        }
    }

    handleScroll() {
        const scrollY = window.scrollY;

        // Update header state
        const header = document.getElementById('header');
        if (scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }

        // Parallax effects
        this.updateParallax(scrollY);
    }

    updateParallax(scrollY) {
        const parallaxElements = document.querySelectorAll('[data-parallax]');

        parallaxElements.forEach(element => {
            const speed = parseFloat(element.dataset.parallax) || 0.5;
            const yPos = -(scrollY * speed);
            element.style.transform = `translateY(${yPos}px)`;
        });
    }

    handleVisibilityChange() {
        if (document.hidden) {
            // Pause animations when tab is not visible
            this.pauseAnimations();
        } else {
            // Resume animations
            this.resumeAnimations();
        }
    }

    pauseAnimations() {
        // Pause any running animations
        document.body.classList.add('animations-paused');
    }

    resumeAnimations() {
        // Resume animations
        document.body.classList.remove('animations-paused');
    }

    // Public API
    notify(message, type = 'info') {
        this.modules.notification.show(message, type);
    }

    openModal(content, options = {}) {
        this.modules.modal.open(content, options);
    }

    closeModal() {
        this.modules.modal.close();
    }
}

// Initialize application
const app = new PrintHub3D();

// Export for global access
window.PrintHub3D = app;