# Deeper Life Bible Church, Harrisburg

Static church website with email-only ride and prayer requests. Pages and the automatically updated Harrisburg YouTube playlist require no build step or API keys. Both forms submit directly to FormSubmit for delivery to deeperlifeha@gmail.com.

## Current working version

Seven pages: Home, Our Church, Watch & Learn, Visit Us, Prayer Wall, Events, and Request a Ride. Ride requests post directly to FormSubmit for delivery to deeperlifeha@gmail.com. No SMS backend is included or enabled.

The ride form collects name, phone, optional email, pickup address, service date, passengers, return-trip preference, notes, and consent. The service is matched to the Events calendar, including communion and vigil exceptions. Requests are not confirmed bookings.

**Email delivery needs inbox verification.** After publishing, send a non-sensitive setup request, complete the provider CAPTCHA, and confirm FormSubmit’s activation email in the church inbox if prompted. Send a second setup request and verify receipt. No real request or test email has been sent by the assistant.

## Preview

Install Node.js 18 or later, then run `npm start` (or `node server.mjs`) from this folder. Open http://127.0.0.1:4174. No npm install is needed.

Alternatively: `python -m http.server 4174 --directory site`.

## Update the existing GitHub repository

The source repository is https://github.com/deeperlifeha/churchwebsite. Copy the updated files into a checkout of that repository, review the changes, commit, and push to main when ready to publish. Do not create a new repository or overwrite existing Git history. This download contains source files but no Git history or credentials.

## Publish with GitHub Pages

In the repository go to Settings > Pages > Source and select GitHub Actions. Run the Publish church website workflow from Actions, or push another commit. The included workflow uploads only `site/`. Relative paths work for repository subpaths and custom domains.

Official documentation: https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages

The existing deeperlifeha.org domain has not been changed. Connect a custom domain in GitHub Pages only when ready to replace the old site.

## Edit

- `site/index.html`: homepage.
- `site/our-church.html`: church information.
- `site/watch.html`: Watch & Learn and YouTube player.
- `site/visit.html`: service details, contact links, and church entrance snapshot.
- `site/style.css`: responsive shared design.
- `site/prayer.html`: prayer form and approved public prayer wall.
- `site/prayer-requests.js`: approved public requests; never put private requests or email addresses here.
- `site/ride.html`: transportation request page.
- `site/ride.js` and `site/ride-validation.js`: service-date validation.
- `site/events.html`: recurring yearly service calendar.
- Header and footer HTML is intentionally repeated so pages work without JavaScript; update all seven pages when changing shared information.
- Our Church, Watch & Learn, Visit Us, and Prayer Wall links open new tabs. Home stays in the same tab.

## YouTube

The channel is https://www.youtube.com/@dlbcharrisburg, channel ID UCZUcxIouz0Kef_1DSi1NLqw. The player uses its uploads playlist UUZUcxIouz0Kef_1DSi1NLqw, allowing new public uploads to appear without code edits. YouTube controls playlist availability, ordering, and processing time; unlisted, private, embedding-disabled, and some live videos may not appear. A Watch on YouTube fallback is provided. The player requires internet access; no secret API key is used.

## Images and external services

The logo and stock images were reused from the church's existing website. See ASSETS.md for source credits. They are not represented as photos of the Harrisburg congregation. The Google Maps entrance snapshot includes Google attribution and the church contributor credit. Keep those credits visible. The original image copyright remains with its owner; this package does not grant a new image license.

Fonts load from Google Fonts with local font fallbacks. Videos load from YouTube. Contact links open an email or phone app. Prayer requests are submitted directly to FormSubmit for delivery to deeperlifeha@gmail.com; no credentials are stored in the website.

## Activate prayer-request email delivery

1. Publish the website on GitHub Pages.
2. Open Prayer Wall and submit a non-sensitive setup request using an email address you control. Complete the provider's CAPTCHA. Do not assume a submission was delivered until it reaches the church inbox.
3. Check deeperlifeha@gmail.com (including spam) for FormSubmit's activation email and follow its confirmation link.
4. Submit a second non-sensitive request and verify it arrives. Confirm that replying uses the sender's email address. Repeat the activation process if FormSubmit requests it for a changed deployment domain.

Delivery has not been tested end to end: no test email or activation request was sent by the assistant. The form uses an ordinary HTTPS POST and leaves CAPTCHA enabled. Visitors complete the provider's submission flow; the website never displays a false “email sent” message. The direct church email link remains available if delivery fails. Review FormSubmit's service and privacy terms before collecting sensitive requests. FormSubmit processes submissions and its documentation states that it retains submissions for 30 days: https://formsubmit.co/documentation

## Approve a public prayer request

Requests default to private. The church receives the title, message, contact information, and sharing choice by email. Nothing is automatically published. There is no admin login or online moderation dashboard in this static GitHub Pages version.

For a visitor who explicitly selected public sharing:

1. Review the request in the church inbox. Remove private details about the requester or other people. Seek clarification if the allowed public wording is unclear.
2. Edit `site/prayer-requests.js` in GitHub (or locally), adding only the approved public content to the array. Use a unique stable ID for each request, for example:

```js
export const prayerRequests = [
  {
    id: 'request-2026-001',
    title: 'Approved title',
    message: 'Only the approved public wording goes here.',
    displayName: 'Anonymous', // Or first name if that option was selected
    date: '2026-09-26'
  }
];
```

3. Commit the change to main. GitHub Pages republishes the updated wall. Only publish a first name when that sharing option was chosen. Never commit an email address, original private request, or consent records: Git history is public too.
4. Remove an entry and commit to stop displaying it. Previously published text can remain in Git history, caches, or copies.

The “I prayed for this” button is a personal reminder saved on the visitor's browser. It has no shared count and does not notify the requester. A shared database and authenticated moderation service would be needed for live counts or an online moderation dashboard.

## Social profiles

Every page footer links to YouTube, Instagram (https://www.instagram.com/dlbcharrisburg/), and TikTok (https://www.tiktok.com/@dlbcharrisburg). Social links open in new tabs.

## Events calendar

`site/events.html` shows the recurring annual schedule in Harrisburg Eastern Time. Browse months, switch years, or select Show the whole year. On phones the calendar becomes a dated service list. The first Sunday combines worship and communion (10:30 AM–12:30 PM). Second-Friday vigil (9:30 PM to Saturday midnight) replaces the usual Friday revival. Rules live in `site/calendar-data.js`; no annual manual updates are required. Run `node --test scripts/calendar.test.mjs` to verify recurrence rules.
