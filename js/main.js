/**
 * MAIN.JS - Core interactions and form handling
 * Mobile-first, progressive enhancement approach
 */

// Utility functions
const $ = (selector, context = document) => context.querySelector(selector);
const $$ = (selector, context = document) => [...context.querySelectorAll(selector)];

// Remove no-js class
document.documentElement.classList.remove('no-js');

// ==============================================
// MOBILE NAVIGATION
// ==============================================

function initMobileNav() {
  const toggle = $('.nav__toggle');
  const menu = $('#navMenu');

  if (!toggle || !menu) return;

  toggle.addEventListener('click', () => {
    const isExpanded = toggle.getAttribute('aria-expanded') === 'true';

    toggle.setAttribute('aria-expanded', String(!isExpanded));
    menu.hidden = isExpanded;

    // Trap focus when menu is open
    if (!isExpanded) {
      menu.querySelector('a')?.focus();
    }
  });

  // Close menu when clicking outside
  document.addEventListener('click', (e) => {
    if (!toggle.contains(e.target) && !menu.contains(e.target)) {
      toggle.setAttribute('aria-expanded', 'false');
      menu.hidden = true;
    }
  });

  // Close menu on escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
      toggle.setAttribute('aria-expanded', 'false');
      menu.hidden = true;
      toggle.focus();
    }
  });
}

// ==============================================
// ANIMATED HEADLINE
// ==============================================

function initAnimatedHeadline() {
  const rotatingElement = $('#rotating');
  if (!rotatingElement) return;

  const words = ["Talento", "Pasión", "Servicio", "Actitud"];
  let currentIndex = 0;
  let currentText = '';
  let isDeleting = false;
  let typeSpeed = 120; // Speed of typing
  let deleteSpeed = 60; // Speed of deleting
  let pauseTime = 1500; // Pause between words

  // Respect reduced motion preference
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) {
    rotatingElement.textContent = words[0];
    return;
  }

  function typeAnimation() {
    const currentWord = words[currentIndex];

    if (isDeleting) {
      // Remove characters
      currentText = currentWord.substring(0, currentText.length - 1);
      rotatingElement.classList.add('typing');
    } else {
      // Add characters
      currentText = currentWord.substring(0, currentText.length + 1);
      rotatingElement.classList.add('typing');
    }

    rotatingElement.textContent = currentText;

    // Determine next action
    if (!isDeleting && currentText === currentWord) {
      // Word is complete, pause then start deleting
      rotatingElement.classList.remove('typing');
      setTimeout(() => {
        isDeleting = true;
        typeAnimation();
      }, pauseTime);
      return;
    }

    if (isDeleting && currentText === '') {
      // Finished deleting, move to next word
      isDeleting = false;
      currentIndex = (currentIndex + 1) % words.length;
      rotatingElement.classList.remove('typing');
      setTimeout(typeAnimation, 300); // Brief pause before starting new word
      return;
    }

    // Continue typing/deleting
    const speed = isDeleting ? deleteSpeed : typeSpeed;

    // Add some randomness to typing speed for more natural feel
    const randomSpeed = speed + (Math.random() * 40 - 20);

    setTimeout(typeAnimation, randomSpeed);
  }

  // Start animation after initial delay
  setTimeout(typeAnimation, 800);
}

// ==============================================
// SMOOTH SCROLLING
// ==============================================

function initSmoothScrolling() {
  // Handle anchor links
  $$('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      if (href === '#') return;

      const target = $(href);
      if (!target) return;

      e.preventDefault();

      const headerHeight = $('.site-header')?.offsetHeight || 80;
      const targetPosition = target.offsetTop - headerHeight;

      window.scrollTo({
        top: targetPosition,
        behavior: 'smooth'
      });

      // Close mobile menu if open
      const toggle = $('.nav__toggle');
      const menu = $('#navMenu');
      if (toggle && menu && toggle.getAttribute('aria-expanded') === 'true') {
        toggle.setAttribute('aria-expanded', 'false');
        menu.hidden = true;
      }
    });
  });
}

// ==============================================
// IMAGE CAROUSEL
// ==============================================

function initImageCarousel() {
  const carousel = $('#imageCarousel');
  if (!carousel) return;

  const track = carousel.querySelector('.carousel-track');
  const slides = carousel.querySelectorAll('.carousel-slide');
  const prevBtn = $('#carouselPrev');
  const nextBtn = $('#carouselNext');
  const indicators = carousel.querySelectorAll('.carousel-indicator');

  let currentSlide = 0;
  let autoPlayInterval;
  const autoPlayDelay = 4000; // 4 seconds

  // Respect reduced motion preference
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function updateCarousel(slideIndex, manual = false) {
    // Remove active class from all slides and indicators
    slides.forEach(slide => slide.classList.remove('active'));
    indicators.forEach(indicator => indicator.classList.remove('active'));

    // Add active class to current slide and indicator
    slides[slideIndex].classList.add('active');
    indicators[slideIndex].classList.add('active');

    currentSlide = slideIndex;

    // Restart autoplay if this was a manual change
    if (manual && !prefersReducedMotion) {
      clearInterval(autoPlayInterval);
      startAutoPlay();
    }

    // Track carousel interaction
    if (typeof gtag !== 'undefined') {
      gtag('event', 'carousel_slide', {
        event_category: 'engagement',
        event_label: `slide_${slideIndex}`,
        value: slideIndex
      });
    }
  }

  function nextSlide() {
    const nextIndex = (currentSlide + 1) % slides.length;
    updateCarousel(nextIndex);
  }

  function prevSlide() {
    const prevIndex = (currentSlide - 1 + slides.length) % slides.length;
    updateCarousel(prevIndex);
  }

  function goToSlide(slideIndex) {
    updateCarousel(slideIndex, true);
  }

  function startAutoPlay() {
    if (prefersReducedMotion) return;

    autoPlayInterval = setInterval(() => {
      nextSlide();
    }, autoPlayDelay);
  }

  function stopAutoPlay() {
    clearInterval(autoPlayInterval);
  }

  // Event listeners
  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      prevSlide();
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      nextSlide();
    });
  }

  // Indicator clicks
  indicators.forEach((indicator, index) => {
    indicator.addEventListener('click', () => {
      goToSlide(index);
    });
  });

  // Keyboard navigation
  carousel.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      prevSlide();
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      nextSlide();
    }
  });

  // Touch/swipe support
  let touchStartX = 0;
  let touchEndX = 0;

  track.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
  }, { passive: true });

  track.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
  }, { passive: true });

  function handleSwipe() {
    const swipeThreshold = 50;
    const swipeLength = touchEndX - touchStartX;

    if (Math.abs(swipeLength) > swipeThreshold) {
      if (swipeLength > 0) {
        prevSlide();
      } else {
        nextSlide();
      }
    }
  }

  // Pause autoplay on hover
  carousel.addEventListener('mouseenter', stopAutoPlay);
  carousel.addEventListener('mouseleave', () => {
    if (!prefersReducedMotion) startAutoPlay();
  });

  // Pause autoplay when page is not visible
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      stopAutoPlay();
    } else if (!prefersReducedMotion) {
      startAutoPlay();
    }
  });

  // Start autoplay
  if (!prefersReducedMotion) {
    startAutoPlay();
  }

  // Intersection Observer for performance
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        if (!prefersReducedMotion) startAutoPlay();
      } else {
        stopAutoPlay();
      }
    });
  }, { threshold: 0.5 });

  observer.observe(carousel);
}

// ==============================================
// HERO CAROUSEL - Auto-rotating image slideshow
// ==============================================

function initHeroCarousel() {
  const carousel = $('#heroCarousel');
  if (!carousel) return;

  const slides = carousel.querySelectorAll('.hero__slide');
  let currentSlide = 0;
  let autoPlayInterval;
  const autoPlayDelay = 3000; // 3 seconds

  // Check for reduced motion preference
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function showSlide(index) {
    // Remove active class from all slides
    slides.forEach(slide => slide.classList.remove('active'));

    // Add active class to current slide
    slides[index].classList.add('active');

    // Track slide view
    if (typeof gtag !== 'undefined') {
      gtag('event', 'hero_slide_view', {
        event_category: 'engagement',
        event_label: `hero_slide_${index + 1}`,
        value: index + 1
      });
    }
  }

  function nextSlide() {
    currentSlide = (currentSlide + 1) % slides.length;
    showSlide(currentSlide);
  }

  function startAutoPlay() {
    if (prefersReducedMotion) return;

    autoPlayInterval = setInterval(nextSlide, autoPlayDelay);
  }

  function stopAutoPlay() {
    if (autoPlayInterval) {
      clearInterval(autoPlayInterval);
      autoPlayInterval = null;
    }
  }

  // Initialize first slide
  showSlide(currentSlide);

  // Start autoplay
  startAutoPlay();

  // Pause autoplay on hover
  carousel.addEventListener('mouseenter', stopAutoPlay);
  carousel.addEventListener('mouseleave', startAutoPlay);

  // Pause autoplay when page is not visible
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      stopAutoPlay();
    } else {
      startAutoPlay();
    }
  });

  // Pause autoplay on focus within carousel
  carousel.addEventListener('focusin', stopAutoPlay);
  carousel.addEventListener('focusout', startAutoPlay);

  // Cleanup on page unload
  window.addEventListener('beforeunload', stopAutoPlay);
}

// ==============================================
// TESTIMONIALS CAROUSEL - Auto-rotating testimonials
// ==============================================

function initTestimonialsCarousel() {
  const carousel = $('#testimonialsCarousel');
  if (!carousel) return;

  const slides = carousel.querySelectorAll('.testimonial-slide');
  const indicators = carousel.querySelectorAll('.testimonial-indicator');
  let currentSlide = 0;
  let autoPlayInterval;
  const autoPlayDelay = 15000; // 15 seconds for testimonials

  // Check for reduced motion preference
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function showSlide(index) {
    // Remove active class from all slides and indicators
    slides.forEach(slide => slide.classList.remove('active'));
    indicators.forEach(indicator => indicator.classList.remove('active'));

    // Add active class to current slide and indicator
    slides[index].classList.add('active');
    indicators[index].classList.add('active');

    // Track testimonial view
    if (typeof gtag !== 'undefined') {
      gtag('event', 'testimonial_view', {
        event_category: 'engagement',
        event_label: `testimonial_${index + 1}`,
        value: index + 1
      });
    }
  }

  function nextSlide() {
    currentSlide = (currentSlide + 1) % slides.length;
    showSlide(currentSlide);
  }

  function prevSlide() {
    currentSlide = (currentSlide - 1 + slides.length) % slides.length;
    showSlide(currentSlide);
  }

  function goToSlide(index) {
    currentSlide = index;
    showSlide(currentSlide);
    restartAutoPlay();
  }

  function startAutoPlay() {
    if (prefersReducedMotion) return;
    autoPlayInterval = setInterval(nextSlide, autoPlayDelay);
  }

  function stopAutoPlay() {
    if (autoPlayInterval) {
      clearInterval(autoPlayInterval);
      autoPlayInterval = null;
    }
  }

  function restartAutoPlay() {
    stopAutoPlay();
    startAutoPlay();
  }

  // Initialize first slide
  showSlide(currentSlide);

  // Add click handlers to indicators
  indicators.forEach((indicator, index) => {
    indicator.addEventListener('click', () => goToSlide(index));
  });

  // Add click handlers to navigation buttons
  const prevBtn = $('#testimonioPrev');
  const nextBtn = $('#testimonioNext');

  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      prevSlide();
      restartAutoPlay();
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      nextSlide();
      restartAutoPlay();
    });
  }

  // Start autoplay
  startAutoPlay();

  // Pause autoplay on hover
  carousel.addEventListener('mouseenter', stopAutoPlay);
  carousel.addEventListener('mouseleave', startAutoPlay);

  // Pause autoplay when page is not visible
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      stopAutoPlay();
    } else {
      startAutoPlay();
    }
  });

  // Pause autoplay on focus within carousel
  carousel.addEventListener('focusin', stopAutoPlay);
  carousel.addEventListener('focusout', startAutoPlay);

  // Cleanup on page unload
  window.addEventListener('beforeunload', stopAutoPlay);
}

// ==============================================
// APPLICATION FORM HANDLING
// ==============================================

function initApplicationForm() {
  const ctaButtons = $$('#openApplicationForm, .btn[href="#aplicar"]');

  ctaButtons.forEach(button => {
    button.addEventListener('click', (e) => {
      e.preventDefault();

      // Track CTA click
      if (typeof gtag !== 'undefined') {
        gtag('event', 'application_form_open', {
          event_category: 'engagement',
          event_label: 'cta_button',
          value: 1
        });
      }

      // Redirect to application form
      const formUrl = 'https://feedback.soul23.cloud/s/cmfsu7y5h003smo0170y0l0x5';
      window.open(formUrl, '_blank', 'noopener,noreferrer');
    });
  });
}

// ==============================================
// FAQ ACCORDIONS - Elegant Accordion Behavior
// ==============================================

function initFAQAccordions() {
  const faqItems = $$('.faq__item');

  faqItems.forEach(item => {
    const question = item.querySelector('.faq__question');

    question?.addEventListener('click', (e) => {
      e.preventDefault(); // Prevent default details behavior

      const isCurrentlyOpen = item.open;

      // Close all other FAQ items first
      faqItems.forEach(otherItem => {
        if (otherItem !== item && otherItem.open) {
          otherItem.open = false;
        }
      });

      // If the clicked item was closed, open it
      if (!isCurrentlyOpen) {
        item.open = true;

        // Track FAQ interactions
        if (typeof gtag !== 'undefined') {
          gtag('event', 'faq_open', {
            event_category: 'engagement',
            event_label: question.textContent.trim(),
            value: 1
          });
        }
      }
    });
  });

  // Enhanced keyboard navigation
  faqItems.forEach((item, index) => {
    const question = item.querySelector('.faq__question');

    question?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        question.click();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        const nextIndex = (index + 1) % faqItems.length;
        faqItems[nextIndex].querySelector('.faq__question')?.focus();
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        const prevIndex = (index - 1 + faqItems.length) % faqItems.length;
        faqItems[prevIndex].querySelector('.faq__question')?.focus();
      }
    });
  });
}

// ==============================================
// ANALYTICS TRACKING
// ==============================================

function initAnalyticsTracking() {
  // Track CTA clicks
  $$('a[href="#aplicar"], .btn[href="#aplicar"]').forEach(button => {
    button.addEventListener('click', () => {
      if (typeof gtag !== 'undefined') {
        gtag('event', 'apply_click', {
          event_category: 'engagement',
          event_label: button.textContent.trim(),
          value: 1
        });
      }
    });
  });

  // Track WhatsApp clicks
  $$('a[href*="wa.me"], a[href*="whatsapp"]').forEach(link => {
    link.addEventListener('click', () => {
      if (typeof gtag !== 'undefined') {
        gtag('event', 'whatsapp_click', {
          event_category: 'engagement',
          event_label: 'whatsapp_contact',
          value: 1
        });
      }
    });
  });

  // Track scroll depth
  let maxScroll = 0;
  const milestones = [25, 50, 75, 100];
  const trackedMilestones = new Set();

  function trackScrollDepth() {
    const scrollTop = window.pageYOffset;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrollPercent = Math.round((scrollTop / docHeight) * 100);

    if (scrollPercent > maxScroll) {
      maxScroll = scrollPercent;

      milestones.forEach(milestone => {
        if (scrollPercent >= milestone && !trackedMilestones.has(milestone)) {
          trackedMilestones.add(milestone);

          if (typeof gtag !== 'undefined') {
            gtag('event', 'scroll_depth', {
              event_category: 'engagement',
              event_label: `${milestone}%`,
              value: milestone
            });
          }
        }
      });
    }
  }

  // Throttled scroll tracking
  let scrollTimer;
  window.addEventListener('scroll', () => {
    if (scrollTimer) clearTimeout(scrollTimer);
    scrollTimer = setTimeout(trackScrollDepth, 100);
  });
}

// ==============================================
// SCROLL ANIMATIONS
// ==============================================

function initScrollAnimations() {
  // Check for reduced motion preference
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) return;

  // Create intersection observer for scroll animations
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const element = entry.target;

        // Add the animate-in class to trigger animations
        element.classList.add('animate-in');

        // For sections with multiple children, stagger their animations
        const children = element.querySelectorAll('.benefit-card, .process__step, .faq__item, .stat-item');
        children.forEach((child, index) => {
          setTimeout(() => {
            child.classList.add('animate-in');
          }, index * 100); // 100ms delay between each child
        });

        // Special handling for CTA section
        if (element.classList.contains('cta-carousel')) {
          setTimeout(() => {
            const text = element.querySelector('.cta-carousel__text');
            const images = element.querySelector('.cta-carousel__images');

            if (text) text.classList.add('animate-in');
            setTimeout(() => {
              if (images) images.classList.add('animate-in');
            }, 200);
          }, 100);
        }

        // Special handling for profile section
        if (element.classList.contains('profile')) {
          setTimeout(() => {
            const requirements = element.querySelector('.profile__requirements');
            const desired = element.querySelector('.profile__desired');

            if (requirements) requirements.classList.add('animate-in');
            setTimeout(() => {
              if (desired) desired.classList.add('animate-in');
            }, 200);
          }, 100);
        }

        // Unobserve element after animation is triggered
        observer.unobserve(element);
      }
    });
  }, observerOptions);

  // Observe all sections
  const sections = $$('section:not(.hero)');
  sections.forEach(section => {
    observer.observe(section);
  });

  // Observe section headers
  const headers = $$('.section-header');
  headers.forEach(header => {
    observer.observe(header);
  });

  // Observe individual elements that need animation
  const animatedElements = $$('.benefit-card, .process__step, .faq__item');
  animatedElements.forEach(element => {
    observer.observe(element);
  });
}

// ==============================================
// INITIALIZATION
// ==============================================

function init() {
  initMobileNav();
  initAnimatedHeadline();
  initSmoothScrolling();
  initHeroCarousel();
  initTestimonialsCarousel();
  initImageCarousel();
  initApplicationForm();
  initFAQAccordions();
  initScrollAnimations();
  initAnalyticsTracking();
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

// Handle page visibility changes (for analytics)
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'hidden' && typeof gtag !== 'undefined') {
    gtag('event', 'page_exit', {
      event_category: 'engagement',
      value: Math.round(performance.now() / 1000)
    });
  }
});