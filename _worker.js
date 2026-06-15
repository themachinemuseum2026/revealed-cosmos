const FIX_STYLE = `
<style id="trc-live-fixes-style">
  html {
    scroll-padding-top: var(--trc-scroll-offset, 112px);
  }

  #top,
  #portfolio,
  #services,
  #about,
  #contact {
    scroll-margin-top: var(--trc-scroll-offset, 112px);
  }

  .brand {
    cursor: pointer;
  }

  .brand:hover .logo,
  .brand:focus-visible .logo {
    color: var(--text);
  }

  #trcBackToTop {
    position: fixed;
    right: clamp(16px, 4vw, 30px);
    bottom: calc(18px + env(safe-area-inset-bottom));
    z-index: 80;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-height: 44px;
    padding: 10px 15px;
    border: 1px solid var(--gold);
    border-radius: 999px;
    background: rgba(16, 19, 26, .94);
    color: var(--text);
    box-shadow: 0 14px 34px rgba(0,0,0,.34);
    font: inherit;
    font-size: 13px;
    font-weight: 900;
    letter-spacing: .7px;
    text-transform: uppercase;
    cursor: pointer;
    opacity: 0;
    transform: translateY(12px);
    pointer-events: none;
    transition: opacity .18s ease, transform .18s ease;
  }

  #trcBackToTop.visible {
    opacity: 1;
    transform: translateY(0);
    pointer-events: auto;
  }

  #trcBackToTop:hover {
    color: var(--text);
    transform: translateY(-1px);
  }

  .form-status {
    margin: 14px 0 0;
    color: var(--muted);
    font-size: 14px;
    line-height: 1.45;
  }

  .form-status.error {
    color: #f3b4a8;
  }

  .direct-email-note {
    margin-top: 12px;
    color: var(--muted);
    font-size: 14px;
  }

  .direct-email-note a,
  .form-status a {
    color: var(--blue);
    font-weight: 800;
  }

  @media (max-width: 680px) {
    html {
      scroll-padding-top: var(--trc-scroll-offset, 146px);
    }

    #top,
    #portfolio,
    #services,
    #about,
    #contact {
      scroll-margin-top: var(--trc-scroll-offset, 146px);
    }

    #trcBackToTop {
      right: 14px;
      bottom: calc(14px + env(safe-area-inset-bottom));
      min-height: 42px;
      padding: 9px 13px;
      font-size: 12px;
    }
  }
</style>`;

const FIX_SCRIPT = `
<script id="trc-live-fixes-script">
(function () {
  const CONTACT_EMAIL = 'revealedcosmosstudio@gmail.com';

  function getHeaderOffset() {
    const header = document.querySelector('header');
    return (header ? Math.ceil(header.getBoundingClientRect().height) : 0) + 18;
  }

  function updateScrollOffsetVariable() {
    document.documentElement.style.setProperty('--trc-scroll-offset', getHeaderOffset() + 'px');
  }

  function getTarget(hash) {
    if (!hash || hash === '#') return document.getElementById('top');
    try {
      return document.querySelector(hash);
    } catch (error) {
      return null;
    }
  }

  function scrollToSection(hash, updateHash) {
    const target = getTarget(hash || '#top');
    if (!target) return;

    updateScrollOffsetVariable();

    const top = Math.max(target.getBoundingClientRect().top + window.scrollY - getHeaderOffset(), 0);
    window.scrollTo({ top, behavior: 'smooth' });

    if (updateHash && history.pushState) {
      history.pushState(null, '', hash || '#top');
    }
  }

  function wireAnchorNavigation() {
    document.querySelectorAll('a[href^="#"]').forEach(function (link) {
      link.addEventListener('click', function (event) {
        const hash = link.getAttribute('href');
        const target = getTarget(hash);
        if (!target) return;
        event.preventDefault();
        scrollToSection(hash, true);
      });
    });
  }

  function wireBrandHomeLink() {
    const brand = document.querySelector('.brand');
    if (!brand) return;

    brand.setAttribute('role', 'link');
    brand.setAttribute('tabindex', '0');
    brand.setAttribute('aria-label', 'Return to the top of The Revealed Cosmos homepage');

    brand.addEventListener('click', function () {
      scrollToSection('#top', true);
    });

    brand.addEventListener('keydown', function (event) {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        scrollToSection('#top', true);
      }
    });
  }

  function addBackToTopButton() {
    if (document.getElementById('trcBackToTop')) return;

    const button = document.createElement('button');
    button.id = 'trcBackToTop';
    button.type = 'button';
    button.setAttribute('aria-label', 'Back to top');
    button.textContent = '↑ Top';
    button.addEventListener('click', function () {
      scrollToSection('#top', true);
    });

    document.body.appendChild(button);

    function updateVisibility() {
      button.classList.toggle('visible', window.scrollY > Math.min(520, window.innerHeight * 0.55));
    }

    updateVisibility();
    window.addEventListener('scroll', updateVisibility, { passive: true });
  }

  function ensureDirectEmailNote() {
    const socialBlock = document.querySelector('.social-block');
    if (!socialBlock || document.querySelector('.direct-email-note')) return;

    const note = document.createElement('p');
    note.className = 'direct-email-note';
    note.innerHTML = 'Direct email: <a href="mailto:' + CONTACT_EMAIL + '">' + CONTACT_EMAIL + '</a>';
    socialBlock.appendChild(note);
  }

  function getStatusNode() {
    let status = document.getElementById('formStatus');
    const form = document.getElementById('inquiryForm');

    if (!status && form) {
      status = document.createElement('p');
      status.id = 'formStatus';
      status.className = 'form-status';
      status.setAttribute('aria-live', 'polite');
      form.appendChild(status);
    }

    return status;
  }

  function setStatus(message, isError) {
    const status = getStatusNode();
    if (!status) return;
    status.className = 'form-status' + (isError ? ' error' : '');
    status.innerHTML = message;
  }

  function readFormValue(id) {
    const field = document.getElementById(id);
    return field ? field.value.trim() : '';
  }

  window.sendInquiry = function sendInquiry() {
    const name = readFormValue('name');
    const email = readFormValue('email');
    const serviceField = document.getElementById('service');
    const service = serviceField ? serviceField.value : 'General project question';
    const message = readFormValue('message');

    if (!name || !email || !message) {
      setStatus('Please add your name, email, and project details before sending.', true);
      return;
    }

    const subject = 'Project review request — ' + service;
    const body =
      'Name: ' + name + '\n' +
      'Email: ' + email + '\n' +
      'Service / topic: ' + service + '\n\n' +
      'Project details:\n' + message + '\n\n' +
      'Best next step or question:\n';

    const gmailUrl =
      'https://mail.google.com/mail/?view=cm&fs=1' +
      '&to=' + encodeURIComponent(CONTACT_EMAIL) +
      '&su=' + encodeURIComponent(subject) +
      '&body=' + encodeURIComponent(body);

    const mailtoUrl =
      'mailto:' + CONTACT_EMAIL +
      '?subject=' + encodeURIComponent(subject) +
      '&body=' + encodeURIComponent(body);

    const popup = window.open(gmailUrl, '_blank', 'noopener');

    if (!popup) {
      window.location.href = mailtoUrl;
    }

    setStatus(
      'A prefilled email draft opened. Review it and click Send. If nothing opened, email <a href="' + mailtoUrl + '">' + CONTACT_EMAIL + '</a>.',
      false
    );
  };

  function wireForm() {
    const form = document.getElementById('inquiryForm');
    if (!form) return;

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      window.sendInquiry();
    });

    const button = form.querySelector('button[onclick="sendInquiry()"]');
    if (button) {
      button.removeAttribute('onclick');
      button.type = 'submit';
    }
  }

  function correctInitialHashPosition() {
    if (!window.location.hash || window.location.hash === '#portfolio') return;

    window.setTimeout(function () {
      scrollToSection(window.location.hash, false);
    }, 140);
  }

  document.addEventListener('DOMContentLoaded', function () {
    updateScrollOffsetVariable();
    wireAnchorNavigation();
    wireBrandHomeLink();
    addBackToTopButton();
    wireForm();
    ensureDirectEmailNote();
    correctInitialHashPosition();
  });

  window.addEventListener('resize', updateScrollOffsetVariable);
  window.addEventListener('orientationchange', function () {
    window.setTimeout(updateScrollOffsetVariable, 250);
  });
})();
</script>`;

export default {
  async fetch(request, env) {
    const response = await env.ASSETS.fetch(request);
    const contentType = response.headers.get('content-type') || '';

    if (!contentType.includes('text/html')) {
      return response;
    }

    let html = await response.text();

    if (!html.includes('trc-live-fixes-script')) {
      html = html
        .replace('</head>', `${FIX_STYLE}\n</head>`)
        .replace('</body>', `${FIX_SCRIPT}\n</body>`);
    }

    const headers = new Headers(response.headers);
    headers.delete('content-length');

    return new Response(html, {
      status: response.status,
      statusText: response.statusText,
      headers
    });
  }
};
