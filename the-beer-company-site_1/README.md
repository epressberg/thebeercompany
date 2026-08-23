# The Beer Company — site

A single-page, static marketing site: hero shot of the can, a three-photo
"around town" gallery, a product spec strip, and an email signup. Plain
HTML/CSS/JS — no build step, no framework, deploys to Vercel as-is.

## Deploying to Vercel

**Option A — CLI**
```
npm i -g vercel
cd the-beer-company-site
vercel
```
Follow the prompts (link/create a project). Vercel auto-detects this as a
static site with one serverless function in `/api` — no build settings to
configure.

**Option B — GitHub**
1. Push this folder to a new GitHub repo.
2. In Vercel: **Add New → Project**, import that repo.
3. Leave the framework preset as "Other" and the build command empty —
   there's nothing to build. Deploy.

Either way you'll get a live `*.vercel.app` URL immediately; attach a custom
domain later under Project Settings → Domains.

## Adding your images

Drop files into the `/images` folder using these exact names, and the site
picks them up automatically (no code changes needed). Until a file exists,
that slot shows a labeled placeholder instead of a broken image, so the
site still looks intentional mid-build.

| File | Used for | Status |
|---|---|---|
| `images/can-front.jpg` | Hero shot of the can | ✅ in place |
| `images/can-back.jpg` | Label detail, next to the facts | ✅ in place |
| `images/scene-street.jpg` | "Around Town" gallery | ✅ in place |
| `images/scene-deli.jpg` | "Around Town" gallery | ✅ in place |
| `images/scene-park.jpg` | "Around Town" gallery | ✅ in place |
| `images/favicon.png` | Browser tab icon | ⬜ optional, 512×512px square |
| `images/og-image.jpg` | Social share preview | ⬜ optional, 1200×630px, shown when the link is pasted into iMessage/Slack/etc. |

### Label copy reference (for whoever designs the can)

Front (opposite the spout): **LAGER**

Back (drinking side), white sticker label:
```
THE BEER COMPANY, BROOKLYN, NY
12 FL. OZ., 6%
GOVERNMENT WARNING: (1) According to the Surgeon General, women should not
drink alcoholic beverages during pregnancy because of the risk of birth
defects. (2) Consumption of alcoholic beverages impairs your ability to
drive a car or operate machinery, and may cause health problems.
```
This same government-warning text is already set in the site's footer in
`index.html`, so it stays consistent between the can and the page.

## Wiring up the email signup

The form in `index.html` posts to `/api/subscribe.js`, a small serverless
function that's included and works the moment you deploy — but by default
it only logs signups to Vercel's function logs, which isn't a real mailing
list. Pick one:

**A. Forward to a webhook (fastest, no code changes)**
Point it at a Zapier/Make automation, a Google Sheets webhook, or
Formspree's JSON endpoint — anything that accepts a POST of `{ email, ts }`.
In Vercel: Project Settings → Environment Variables →
add `NOTIFY_WEBHOOK_URL` = that URL → redeploy.

**Already set up: a Google Sheet webhook**
A Google Apps Script web app is deployed on the "Beer Co" Google Sheet
(https://docs.google.com/spreadsheets/d/1ws8eAjcNTj9ABp9Rs8SBM8dx4N60zCcG1dLtgVLMMCU/edit)
that appends every signup as a new row (Email, Signed up at, Source). Its
current web app URL is:

```
https://script.google.com/macros/s/AKfycbwwJE02AjO7by7nLEmyEyIahTvzPYsFXAKAQNAmQiFY-AMHvphgey06BDgWlYRjvdwDeA/exec
```

To finish wiring it up: in Vercel, Project Settings → Environment Variables
→ add `NOTIFY_WEBHOOK_URL` = that URL → redeploy. Note: right after a fresh
Apps Script deployment, Google sometimes takes a while (usually minutes,
occasionally longer) before the `/exec` URL resolves publicly — if hitting
that URL directly in a browser shows "Sorry, unable to open the file at
this time," it's this propagation delay, not a config problem (the
deployment's "Execute as: Me" / "Who has access: Anyone" settings are
already correct). Retry the URL after a bit; once it loads (even blank), the
webhook is live. If it's still failing after a good while, open the Apps
Script project, Deploy → Manage deployments → edit the deployment (pencil
icon) → Deploy again to force a fresh version, or fall back to Option C
(Formspree) below.

**B. Call a real ESP's API**
Open `api/subscribe.js` and replace the `forwardToWebhook(...)` call with
a call to Mailchimp / ConvertKit / Klaviyo / Resend's API, using an
environment variable for the API key (same Settings → Environment
Variables screen). Each provider's docs have a copy-pasteable "add
subscriber" snippet.

**C. Skip the serverless function, use Formspree directly**
Delete `api/subscribe.js`, then in `index.html` change:
```html
<form id="signup-form" novalidate>
```
to:
```html
<form action="https://formspree.io/f/YOUR_FORM_ID" method="POST">
```
and remove the `id="signup-form"` JS handling in `script.js` if you want
Formspree's own redirect/thank-you behavior instead of the inline message.

## Removing the age gate

The site opens behind a "Are you 21 or older?" splash, which is standard
practice for alcohol-brand sites. To remove it:
1. Delete the `#age-gate` and `#age-blocked` `<div>` blocks from `index.html`.
2. Delete the `ageGate()` IIFE at the top of `script.js`.
3. Delete the `#age-gate`, `#age-blocked`, and `#site-content[data-locked]`
   rules from `styles.css`.

## File structure

```
/
├── index.html          all page content
├── styles.css           all styling
├── script.js            age gate, image fallbacks, form handling
├── package.json          metadata only — no build step
├── api/
│   └── subscribe.js     email signup endpoint (Vercel serverless function)
└── images/              drop your photos/renders here (see table above)
```
