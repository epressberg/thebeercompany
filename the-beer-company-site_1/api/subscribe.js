// =============================================================
// POST /api/subscribe
// Vercel serverless function (Node.js). Deploys automatically —
// no extra config needed beyond dropping this repo onto Vercel.
//
// By itself this validates the email and returns success, logging
// the signup to the function's logs (visible in the Vercel
// dashboard under your project's "Logs" tab). That's enough to
// confirm the form works end to end, but logs aren't a mailing
// list — do ONE of the following to actually collect addresses:
//
// OPTION A — Forward to a webhook (Zapier, Make, a Google Sheets
//   webhook, Formspree's JSON endpoint, etc.)
//   1. Create the webhook / Zap / automation, copy its URL.
//   2. In Vercel: Project Settings → Environment Variables, add
//        NOTIFY_WEBHOOK_URL = https://your-webhook-url
//   3. Redeploy. Every signup will POST { email, ts } to that URL.
//
// OPTION B — Use a real ESP's API (Mailchimp, ConvertKit, Resend,
//   Klaviyo, etc.) — replace the forwardToWebhook() call below
//   with that provider's API call, using an env var for the API key.
//
// OPTION C — Skip this file entirely and point the <form> in
//   index.html straight at a Formspree/Mailchimp form action —
//   see README.md for that route.
// =============================================================

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  var email;
  try {
    var body = req.body;
    if (typeof body === 'string') body = JSON.parse(body || '{}');
    email = body && body.email;
  } catch (e) {
    return res.status(400).json({ error: 'Invalid request body' });
  }

  if (!email || typeof email !== 'string' || !isValidEmail(email)) {
    return res.status(400).json({ error: 'A valid email is required' });
  }

  email = email.trim().toLowerCase();

  console.log('[subscribe] new signup:', email);

  var webhookUrl = process.env.NOTIFY_WEBHOOK_URL;
  if (webhookUrl) {
    try {
      await forwardToWebhook(webhookUrl, email);
    } catch (err) {
      console.error('[subscribe] webhook forward failed:', err);
      // Don't fail the user's signup just because the webhook had a hiccup —
      // it's already logged above. Remove this try/catch if you'd rather
      // surface the error to the visitor.
    }
  }

  return res.status(200).json({ ok: true });
};

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

async function forwardToWebhook(url, email) {
  await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: email, ts: new Date().toISOString(), source: 'the-beer-company-site' })
  });
}
