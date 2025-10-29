/**
 * ANALYTICS.JS - Google Analytics 4 and social pixels
 * Loads asynchronously with consent management
 */

// Configuration
const ANALYTICS_CONFIG = {
  GA4_ID: 'G-XXXXXXXXXX', // Replace with actual GA4 ID
  META_PIXEL_ID: '123456789', // Replace with actual Meta Pixel ID
  TIKTOK_PIXEL_ID: 'TIKTOK123', // Replace with actual TikTok Pixel ID
};

// Consent management (basic implementation)
let analyticsConsent = localStorage.getItem('analytics_consent') !== 'false';

// Initialize Google Analytics 4
function initGA4() {
  if (!analyticsConsent || !ANALYTICS_CONFIG.GA4_ID) return;

  // Load gtag script
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${ANALYTICS_CONFIG.GA4_ID}`;
  document.head.appendChild(script);

  // Initialize dataLayer and gtag
  window.dataLayer = window.dataLayer || [];
  function gtag() {
    dataLayer.push(arguments);
  }

  window.gtag = gtag;

  gtag('js', new Date());
  gtag('config', ANALYTICS_CONFIG.GA4_ID, {
    send_page_view: true,
    allow_google_signals: true,
    allow_ad_personalization_signals: true
  });

  // Track initial page view
  gtag('event', 'page_view', {
    page_title: document.title,
    page_location: window.location.href,
    page_path: window.location.pathname
  });

  console.log('GA4 initialized');
}

// Initialize Meta Pixel
function initMetaPixel() {
  if (!analyticsConsent || !ANALYTICS_CONFIG.META_PIXEL_ID) return;

  // Meta Pixel base code
  !function(f,b,e,v,n,t,s)
  {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
  n.callMethod.apply(n,arguments):n.queue.push(arguments)};
  if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
  n.queue=[];t=b.createElement(e);t.async=!0;
  t.src=v;s=b.getElementsByTagName(e)[0];
  s.parentNode.insertBefore(t,s)}(window, document,'script',
  'https://connect.facebook.net/en_US/fbevents.js');

  fbq('init', ANALYTICS_CONFIG.META_PIXEL_ID);
  fbq('track', 'PageView');

  console.log('Meta Pixel initialized');
}

// Initialize TikTok Pixel
function initTikTokPixel() {
  if (!analyticsConsent || !ANALYTICS_CONFIG.TIKTOK_PIXEL_ID) return;

  // TikTok Pixel base code
  !function (w, d, t) {
    w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie"],ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e},ttq.load=function(e,n){var i="https://analytics.tiktok.com/i18n/pixel/events.js";ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=i,ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{},ttq._o[e]=n||{};var o=document.createElement("script");o.type="text/javascript",o.async=!0,o.src=i+"?sdkid="+e+"&lib="+t;var a=document.getElementsByTagName("script")[0];a.parentNode.insertBefore(o,a)};
  }(window, document, 'ttq');

  ttq.load(ANALYTICS_CONFIG.TIKTOK_PIXEL_ID);
  ttq.page();

  console.log('TikTok Pixel initialized');
}

// Enhanced event tracking for GA4
function trackCustomEvents() {
  if (typeof gtag === 'undefined') return;

  // Track form starts
  const form = document.getElementById('formJoin');
  if (form) {
    let formStarted = false;

    form.addEventListener('input', () => {
      if (!formStarted) {
        formStarted = true;
        gtag('event', 'form_start', {
          event_category: 'form',
          event_label: 'application_form',
          value: 1
        });
      }
    }, { once: true });
  }

  // Track video interactions (if any)
  const videos = document.querySelectorAll('video');
  videos.forEach(video => {
    video.addEventListener('play', () => {
      gtag('event', 'video_play', {
        event_category: 'engagement',
        event_label: video.src || 'embedded_video',
        value: 1
      });
    });

    video.addEventListener('ended', () => {
      gtag('event', 'video_complete', {
        event_category: 'engagement',
        event_label: video.src || 'embedded_video',
        value: 1
      });
    });
  });

  // Track file downloads
  document.addEventListener('click', (e) => {
    const link = e.target.closest('a');
    if (!link) return;

    const href = link.getAttribute('href');
    if (href && (href.includes('.pdf') || href.includes('.doc') || href.includes('.zip'))) {
      gtag('event', 'file_download', {
        event_category: 'engagement',
        event_label: href,
        value: 1
      });
    }
  });

  // Track external link clicks
  document.addEventListener('click', (e) => {
    const link = e.target.closest('a');
    if (!link) return;

    const href = link.getAttribute('href');
    if (href && (href.startsWith('http') && !href.includes(window.location.hostname))) {
      gtag('event', 'external_link_click', {
        event_category: 'engagement',
        event_label: href,
        value: 1
      });
    }
  });
}

// Track ecommerce events (if applicable)
function trackConversionEvents() {
  // Track form submission as conversion
  const form = document.getElementById('formJoin');
  if (form && typeof gtag !== 'undefined') {
    form.addEventListener('submit', () => {
      // This will be called before the form is actually submitted
      setTimeout(() => {
        gtag('event', 'conversion', {
          send_to: `${ANALYTICS_CONFIG.GA4_ID}/lead_generation`,
          event_category: 'lead',
          event_label: 'application_submitted',
          value: 1
        });

        // Meta Pixel conversion
        if (typeof fbq !== 'undefined') {
          fbq('track', 'Lead', {
            content_name: 'Job Application',
            content_category: 'Recruitment',
            value: 1,
            currency: 'MXN'
          });
        }

        // TikTok Pixel conversion
        if (typeof ttq !== 'undefined') {
          ttq.track('SubmitForm', {
            content_type: 'application',
            content_name: 'Job Application'
          });
        }
      }, 100);
    });
  }
}

// Enhanced user engagement tracking
function trackEngagement() {
  let engagementStartTime = Date.now();
  let maxScrollDepth = 0;
  let interactions = 0;

  // Track interactions
  ['click', 'scroll', 'keydown'].forEach(eventType => {
    document.addEventListener(eventType, () => {
      interactions++;
    }, { passive: true });
  });

  // Track scroll depth more granularly
  function updateScrollDepth() {
    const scrollTop = window.pageYOffset;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrollPercent = Math.min(100, Math.round((scrollTop / docHeight) * 100));

    if (scrollPercent > maxScrollDepth) {
      maxScrollDepth = scrollPercent;
    }
  }

  window.addEventListener('scroll', updateScrollDepth, { passive: true });

  // Send engagement data before page unload
  function sendEngagementData() {
    if (typeof gtag === 'undefined') return;

    const timeOnPage = Math.round((Date.now() - engagementStartTime) / 1000);

    gtag('event', 'engagement_summary', {
      event_category: 'engagement',
      custom_parameters: {
        time_on_page: timeOnPage,
        max_scroll_depth: maxScrollDepth,
        interactions_count: interactions
      }
    });
  }

  // Send data on page visibility change or unload
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
      sendEngagementData();
    }
  });

  window.addEventListener('beforeunload', sendEngagementData);
}

// Consent banner (basic implementation)
function showConsentBanner() {
  if (localStorage.getItem('analytics_consent') !== null) return;

  const banner = document.createElement('div');
  banner.className = 'consent-banner';
  banner.innerHTML = `
    <div class="consent-banner__content">
      <p>Utilizamos cookies y herramientas de análisis para mejorar tu experiencia.
      <a href="/aviso-de-privacidad" target="_blank">Más información</a></p>
      <div class="consent-banner__actions">
        <button class="btn btn--ghost btn--sm consent-reject">Rechazar</button>
        <button class="btn btn--primary btn--sm consent-accept">Aceptar</button>
      </div>
    </div>
  `;

  // Add basic styles
  banner.style.cssText = `
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    background: rgba(45, 45, 45, 0.95);
    color: white;
    padding: 1rem;
    z-index: 9999;
    backdrop-filter: blur(8px);
  `;

  document.body.appendChild(banner);

  // Set up event listeners
  const acceptBtn = banner.querySelector('.consent-accept');
  const rejectBtn = banner.querySelector('.consent-reject');

  acceptBtn.addEventListener('click', () => setConsent(true));
  rejectBtn.addEventListener('click', () => setConsent(false));

  // Consent function
  function setConsent(accepted) {
    localStorage.setItem('analytics_consent', accepted.toString());
    analyticsConsent = accepted;
    banner.remove();

    if (accepted) {
      initializeAnalytics();
    }
  }
}

// Main initialization function
function initializeAnalytics() {
  if (!analyticsConsent) return;

  // Only initialize with valid IDs (not placeholder values)
  if (ANALYTICS_CONFIG.GA4_ID && !ANALYTICS_CONFIG.GA4_ID.includes('XXXXXXXXXX')) {
    initGA4();
  }

  if (ANALYTICS_CONFIG.META_PIXEL_ID && !ANALYTICS_CONFIG.META_PIXEL_ID.includes('123456789')) {
    initMetaPixel();
  }

  if (ANALYTICS_CONFIG.TIKTOK_PIXEL_ID && !ANALYTICS_CONFIG.TIKTOK_PIXEL_ID.includes('TIKTOK123')) {
    initTikTokPixel();
  }

  // Wait for DOM to be ready for event tracking
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      trackCustomEvents();
      trackConversionEvents();
      trackEngagement();
    });
  } else {
    trackCustomEvents();
    trackConversionEvents();
    trackEngagement();
  }
}

// Enhanced error tracking
window.addEventListener('error', (e) => {
  if (typeof gtag !== 'undefined') {
    gtag('event', 'exception', {
      description: e.error?.message || 'Unknown error',
      fatal: false
    });
  }
});

// Initialize everything
function init() {
  // Show consent banner if needed
  showConsentBanner();

  // Initialize analytics if consent already given
  if (analyticsConsent) {
    initializeAnalytics();
  }
}

// Start initialization
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}