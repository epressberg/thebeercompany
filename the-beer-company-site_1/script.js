// =============================================================
// THE BEER COMPANY — site behavior
// 1. Age gate (persists via sessionStorage so it only asks once
//    per browser tab session)
// 2. Missing-image placeholders (so the layout looks intentional
//    before real photography/renders are dropped into /images)
// 3. Email signup form submit handling
// =============================================================

(function ageGate() {
  var gate = document.getElementById('age-gate');
  var blocked = document.getElementById('age-blocked');
  var content = document.getElementById('site-content');
  var yesBtn = document.getElementById('age-yes');
  var noBtn = document.getElementById('age-no');

  if (!gate) return; // age gate removed from HTML — skip entirely

  var STORAGE_KEY = 'tbc_age_verified';

  function verified() {
    try { return sessionStorage.getItem(STORAGE_KEY) === 'yes'; }
    catch (e) { return false; }
  }

  function showSite() {
    gate.hidden = true;
    content.removeAttribute('data-locked');
  }

  if (verified()) {
    showSite();
  } else {
    content.setAttribute('data-locked', 'true');
  }

  yesBtn && yesBtn.addEventListener('click', function () {
    try { sessionStorage.setItem(STORAGE_KEY, 'yes'); } catch (e) {}
    showSite();
  });

  noBtn && noBtn.addEventListener('click', function () {
    gate.hidden = true;
    blocked.hidden = false;
  });
})();

// Note: missing-image placeholders are handled by window.tbcImgFallback,
// an inline <script> in index.html's <head> — see that file. It has to
// live there (not here) so it's defined before any <img> in the body
// starts loading, since an image's error event can otherwise fire
// before this end-of-body script has even finished loading.

// -------------------------------------------------------------
// Email signup
// Posts to /api/subscribe (included Vercel serverless function).
// See README for wiring that endpoint to a real email service,
// or swap this for a Formspree/Mailchimp form action instead.
// -------------------------------------------------------------
(function signupForm() {
  var form = document.getElementById('signup-form');
  if (!form) return;

  var message = document.getElementById('form-message');
  var button = form.querySelector('button[type="submit"]');

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    var email = form.email.value.trim();
    if (!email || !form.email.checkValidity()) {
      setMessage('Please enter a valid email address.', 'error');
      return;
    }

    button.disabled = true;
    setMessage('Sending…', '');

    fetch('/api/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email })
    })
      .then(function (res) {
        if (!res.ok) throw new Error('Request failed');
        return res.json().catch(function () { return {}; });
      })
      .then(function () {
        setMessage("You're on the list. We'll email you when it's in stores.", 'success');
        form.reset();
      })
      .catch(function () {
        setMessage('Something went wrong — please try again in a moment.', 'error');
      })
      .finally(function () {
        button.disabled = false;
      });
  });

  function setMessage(text, state) {
    message.textContent = text;
    if (state) message.setAttribute('data-state', state);
    else message.removeAttribute('data-state');
  }
})();

// Footer year
(function () {
  var el = document.getElementById('year');
  if (el) el.textContent = new Date().getFullYear();
})();
