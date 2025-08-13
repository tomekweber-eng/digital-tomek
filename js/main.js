/**
 * Main JavaScript for Tomasz Weber Portfolio
 * Optimized for performance and accessibility
 */

(function() {
    'use strict';

    // Performance optimization: Cache DOM elements
    const DOM = {
        fadeElements: null,
        sliders: null,
        burger: null,
        navMenu: null,
        navLinks: null,
        init() {
            this.fadeElements = document.querySelectorAll('.project-item, .statement-slide, .image-side, .content-side, .multi-image');
            this.sliders = document.querySelectorAll('.statement-slider');
            this.burger = document.getElementById('burgerMenu');
            this.navMenu = document.getElementById('navMenu');
            this.navLinks = document.querySelectorAll('.nav-menu a');
        }
    };

    // Intersection Observer for fade-in animations
    function initFadeAnimations() {
        if (!DOM.fadeElements.length) return;

        const fadeInOptions = {
            threshold: 0.15,
            rootMargin: "0px 0px -100px 0px"
        };

        const fadeInObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('fade-in');
                    observer.unobserve(entry.target);
                }
            });
        }, fadeInOptions);

        DOM.fadeElements.forEach(element => {
            element.classList.add('fade-element');
            fadeInObserver.observe(element);
        });
    }

    // Smooth scrolling for anchor links
    function initSmoothScrolling() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function(e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
    }

    // Optimized slider functionality
    function initSliders() {
        if (!DOM.sliders.length) return;

        DOM.sliders.forEach(slider => {
            const sliderManager = new SliderManager(slider);
            sliderManager.init();
        });
    }

    // Slider Manager Class
    class SliderManager {
        constructor(slider) {
            this.slider = slider;
            this.track = slider.querySelector('.statement-track');
            this.originalSlides = slider.querySelectorAll('.statement-slide');
            this.prevButton = slider.parentElement.querySelector('.prev-button');
            this.nextButton = slider.parentElement.querySelector('.next-button');
            this.currentIndex = 0;
            this.slideWidth = 100;
            this.touchStartX = 0;
            this.touchEndX = 0;
            
            // Check slider type
            this.isInfiniteSlider = this.checkInfiniteSliderType();
            this.slides = this.originalSlides;
        }

        checkInfiniteSliderType() {
            const isFirstSlider = this.slider.closest('.expertise-section');
            const isReferencesSlider = this.slider.closest('.education-skills-section') && 
                                     this.slider.closest('.education-skills-section').querySelector('h2').textContent.includes('References');
            return isFirstSlider || isReferencesSlider;
        }

        init() {
            this.setupInfiniteLoop();
            this.bindEvents();
            this.updateSlider();
        }

        setupInfiniteLoop() {
            if (!this.isInfiniteSlider) return;

            // Clone slides for infinite loop
            const firstSlideClone = this.originalSlides[0].cloneNode(true);
            const lastSlideClone = this.originalSlides[this.originalSlides.length - 1].cloneNode(true);
            
            this.track.appendChild(firstSlideClone);
            this.track.insertBefore(lastSlideClone, this.originalSlides[0]);
            
            this.slides = this.track.querySelectorAll('.statement-slide');
            this.currentIndex = 1; // Start at real first slide
            
            // Add smooth transition
            this.track.style.transition = 'transform 0.3s ease';
        }

        bindEvents() {
            // Button events
            this.nextButton.addEventListener('click', () => this.nextSlide());
            this.prevButton.addEventListener('click', () => this.prevSlide());
            
            // Touch events for mobile
            this.slider.addEventListener('touchstart', (e) => {
                this.touchStartX = e.changedTouches[0].screenX;
            }, { passive: true });
            
            this.slider.addEventListener('touchend', (e) => {
                this.touchEndX = e.changedTouches[0].screenX;
                this.handleSwipe();
            }, { passive: true });
        }

        nextSlide() {
            if (this.isInfiniteSlider) {
                this.currentIndex++;
                this.updateSlider();
                this.checkInfiniteReset('next');
            } else {
                this.currentIndex = (this.currentIndex + 1) % this.slides.length;
                this.updateSlider();
            }
        }

        prevSlide() {
            if (this.isInfiniteSlider) {
                this.currentIndex--;
                this.updateSlider();
                this.checkInfiniteReset('prev');
            } else {
                this.currentIndex = (this.currentIndex - 1 + this.slides.length) % this.slides.length;
                this.updateSlider();
            }
        }

        checkInfiniteReset(direction) {
            if (direction === 'next' && this.currentIndex === this.slides.length - 1) {
                setTimeout(() => this.resetToStart(), 300);
            } else if (direction === 'prev' && this.currentIndex === 0) {
                setTimeout(() => this.resetToEnd(), 300);
            }
        }

        resetToStart() {
            this.track.style.transition = 'none';
            this.currentIndex = 1;
            this.track.style.transform = `translateX(-${this.currentIndex * this.slideWidth}%)`;
            setTimeout(() => {
                this.track.style.transition = 'transform 0.3s ease';
            }, 10);
        }

        resetToEnd() {
            this.track.style.transition = 'none';
            this.currentIndex = this.slides.length - 2;
            this.track.style.transform = `translateX(-${this.currentIndex * this.slideWidth}%)`;
            setTimeout(() => {
                this.track.style.transition = 'transform 0.3s ease';
            }, 10);
        }

        updateSlider() {
            this.track.style.transform = `translateX(-${this.currentIndex * this.slideWidth}%)`;
            
            // Update button states
            this.prevButton.disabled = false;
            this.nextButton.disabled = false;
            this.prevButton.style.opacity = 1;
            this.nextButton.style.opacity = 1;
        }

        handleSwipe() {
            const swipeThreshold = 50;
            const swipeDistance = this.touchEndX - this.touchStartX;
            
            if (Math.abs(swipeDistance) > swipeThreshold) {
                if (swipeDistance < 0) {
                    this.nextSlide();
                } else {
                    this.prevSlide();
                }
            }
        }
    }

    // Navigation menu functionality
    function initNavigation() {
        if (!DOM.burger || !DOM.navMenu) return;

        // Toggle menu
        DOM.burger.addEventListener('click', () => {
            DOM.burger.classList.toggle('active');
            DOM.navMenu.classList.toggle('active');
        });

        // Close menu on link click
        DOM.navLinks.forEach(link => {
            link.addEventListener('click', () => {
                DOM.burger.classList.remove('active');
                DOM.navMenu.classList.remove('active');
            });
        });

        // Close menu on outside click
        document.addEventListener('click', (e) => {
            if (!DOM.burger.contains(e.target) && !DOM.navMenu.contains(e.target)) {
                DOM.burger.classList.remove('active');
                DOM.navMenu.classList.remove('active');
            }
        });
    }

    // Performance optimization: Debounce function
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // Initialize all functionality
    function init() {
        DOM.init();
        initFadeAnimations();
        initSmoothScrolling();
        initSliders();
        initNavigation();
    }

    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Handle window resize
    window.addEventListener('resize', debounce(() => {
        // Reinitialize sliders on significant resize
        initSliders();
    }, 250));

})(); 